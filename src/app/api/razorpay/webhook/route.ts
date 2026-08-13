import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { getDb } from '@/lib/db/client';

const STATUS_MAP: Record<string, string> = {
  'order.paid': 'CAPTURED',
  'payment.captured': 'CAPTURED',
  'payment.failed': 'FAILED',
  'refund.created': 'REFUNDED',
};

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature using RAZORPAY_WEBHOOK_SECRET
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
    }

    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const expected = createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
    if (expected !== signature) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventName: string = event.event || '';

    if (!(eventName in STATUS_MAP)) {
      // Acknowledge unknown events without processing
      return NextResponse.json({ received: true });
    }

    const payload = event.payload || {};
    const paymentEntity = payload.payment?.entity;
    const orderEntity = payload.order?.entity;

    const razorpayPaymentId = paymentEntity?.id || null;
    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id || null;
    const bookingId =
      paymentEntity?.notes?.booking_id ||
      orderEntity?.notes?.booking_id ||
      orderEntity?.receipt ||
      null;

    if (!bookingId || !razorpayOrderId) {
      return NextResponse.json({ received: true });
    }

    const db = getDb();
    const newStatus = STATUS_MAP[eventName];

    // Idempotency: if the payment is already in the target state, skip
    const { data: existing } = await db
      .from('booking_payments')
      .select('payment_status, razorpay_payment_id')
      .eq('booking_id', bookingId)
      .limit(1);

    if (existing && existing.length > 0) {
      const rec = existing[0];
      if (rec.payment_status === newStatus && (rec.razorpay_payment_id === razorpayPaymentId || eventName === 'refund.created')) {
        return NextResponse.json({ received: true, idempotent: true });
      }
    }

    if (existing && existing.length > 0) {
      await db
        .from('booking_payments')
        .update({
          payment_status: newStatus,
          razorpay_order_id: razorpayOrderId || (existing[0] as any).razorpay_order_id,
          razorpay_payment_id: razorpayPaymentId || (existing[0] as any).razorpay_payment_id,
          updated_at: new Date().toISOString(),
        })
        .eq('booking_id', bookingId);
    } else {
      await db.from('booking_payments').insert({
        booking_id: bookingId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        payment_status: newStatus,
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('WEBHOOK error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}