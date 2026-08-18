import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { getDb } from '@/lib/db/client';
import { applyRateLimit, apiError } from '@/lib/auth/middleware';
import { autoCreateBookingInvoice } from '@/lib/auto-invoice';

export async function POST(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'booking');
    if (rlError) return rlError;

    const body = await request.json();
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!bookingId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return apiError('Missing payment verification data', 400);
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return apiError('Razorpay is not configured. Contact the clinic.', 503);
    }

    // Server-side signature verification (timing-safe to prevent timing attacks)
    const expected = createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const sigBuf = Buffer.from(razorpaySignature, 'hex');
    const expectedBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return apiError('Invalid payment signature', 400);
    }

    const db = getDb();
    const { data: existing } = await db
      .from('booking_payments')
      .select('*')
      .eq('booking_id', bookingId)
      .eq('razorpay_payment_id', razorpayPaymentId)
      .limit(1);

    // Idempotency: if already captured with this payment ID, return success without duplicate write
    if (existing && existing.length > 0 && existing[0].payment_status === 'CAPTURED') {
      return NextResponse.json({ success: true, alreadyProcessed: true });
    }

    const { data: payment } = await db
      .from('booking_payments')
      .update({
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        payment_status: 'CAPTURED',
        updated_at: new Date().toISOString(),
      })
      .eq('booking_id', bookingId)
      .select()
      .single();

    if (!payment) {
      console.error('[verify] No booking_payments record found for booking:', bookingId);
      return apiError('Payment record not found. The booking may not have been properly initialized. Please retry the payment or contact support.', 500);
    }

    // Also confirm the booking in the bookings table
    await db
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
        payment_id: razorpayPaymentId,
        razorpay_order_id: razorpayOrderId,
        updated_at: new Date().toISOString(),
      })
      .eq('booking_id', bookingId);

    // Auto-generate invoice + payment record in EMR billing
    try {
      await autoCreateBookingInvoice({
        bookingId,
        patientName: payment.patient_name || 'Patient',
        patientPhone: payment.patient_phone || '',
        patientEmail: payment.patient_email || undefined,
        clinicId: payment.consultation_type || 'online',
        consultationType: payment.consultation_type || 'online',
        consultationFee: payment.amount || 0,
        currency: payment.currency || 'INR',
        paymentMethod: 'Razorpay',
        transactionId: razorpayPaymentId,
        orderId: razorpayOrderId,
        paymentStatus: 'COMPLETED',
      });
    } catch (invErr) {
      console.error('[verify] Auto-invoice error:', invErr);
    }

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error('VERIFY error:', error);
    const detail = error instanceof Error ? error.message : String(error);
    return apiError('Payment verification failed', 500, { detail });
  }
}