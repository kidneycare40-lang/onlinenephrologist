import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import Razorpay from 'razorpay';
import { getDb } from '@/lib/db/client';
import { applyRateLimit, apiError } from '@/lib/auth/middleware';
import { autoCreateBookingInvoice } from '@/lib/auto-invoice';

function getRazorpay(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

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

    // Idempotency: check if already processed
    const { data: existing } = await db
      .from('booking_payments')
      .select('*')
      .eq('booking_id', bookingId)
      .eq('razorpay_payment_id', razorpayPaymentId)
      .limit(1);

    if (existing && existing.length > 0 && existing[0].payment_status === 'CAPTURED') {
      return NextResponse.json({ success: true, alreadyProcessed: true });
    }

    // Try to update existing record
    let paymentData: any = null;

    const { data: updated } = await db
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

    if (updated) {
      paymentData = updated;
    } else {
      // Record missing — fetch from Razorpay and create it (self-healing)
      console.error('[verify] No booking_payments record for', bookingId, '— fetching from Razorpay');
      const rzp = getRazorpay();
      if (rzp) {
        try {
          const order = await rzp.orders.fetch(razorpayOrderId);
          const notes = order.notes || {};
          const { error: insertErr } = await db.from('booking_payments').insert({
            booking_id: bookingId,
            patient_name: notes.patient_name || 'Patient',
            patient_phone: null,
            patient_email: null,
            patient_country: notes.patient_country || null,
            consultation_type: notes.consultation_type || null,
            amount: Number(order.amount || 0) / 100,
            currency: order.currency || 'INR',
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature,
            payment_status: 'CAPTURED',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          if (insertErr) {
            console.error('[verify] Failed to create missing payment record:', insertErr);
            return apiError('Failed to store payment record', 500);
          }
          // Re-read the created record
          const { data: created } = await db
            .from('booking_payments')
            .select('*')
            .eq('booking_id', bookingId)
            .eq('razorpay_payment_id', razorpayPaymentId)
            .limit(1)
            .single();
          paymentData = created;
        } catch (rzpErr) {
          console.error('[verify] Failed to fetch order from Razorpay:', rzpErr);
          return apiError('Failed to recover payment record', 500);
        }
      }
    }

    if (!paymentData) {
      return apiError('Payment record could not be created', 500);
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
        patientName: paymentData.patient_name || 'Patient',
        patientPhone: paymentData.patient_phone || '',
        patientEmail: paymentData.patient_email || undefined,
        clinicId: paymentData.consultation_type || 'online',
        consultationType: paymentData.consultation_type || 'online',
        consultationFee: paymentData.amount || 0,
        currency: paymentData.currency || 'INR',
        paymentMethod: 'Razorpay',
        transactionId: razorpayPaymentId,
        orderId: razorpayOrderId,
        paymentStatus: 'COMPLETED',
      });
    } catch (invErr) {
      console.error('[verify] Auto-invoice error:', invErr);
    }

    return NextResponse.json({ success: true, payment: paymentData });
  } catch (error) {
    console.error('VERIFY error:', error);
    const detail = error instanceof Error ? error.message : String(error);
    return apiError('Payment verification failed', 500, { detail });
  }
}
