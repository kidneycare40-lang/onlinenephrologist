import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { getDb } from '@/lib/db/client';
import { applyRateLimit, apiError } from '@/lib/auth/middleware';

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

    // Server-side signature verification
    const expected = createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expected !== razorpaySignature) {
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
      return apiError('Failed to store payment record', 500);
    }

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error('VERIFY error:', error);
    const detail = error instanceof Error ? error.message : String(error);
    return apiError('Payment verification failed', 500, { detail });
  }
}