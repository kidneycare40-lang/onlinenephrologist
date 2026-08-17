import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { getDb } from '@/lib/db/client';
import { sendBookingWhatsApp } from '@/lib/whatsapp-notify';
import { autoCreateBookingInvoice } from '@/lib/auto-invoice';

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

    // Keep the bookings table payment status in sync
    const bookingPaymentStatus = newStatus === 'CAPTURED' ? 'paid' : newStatus === 'FAILED' ? 'unpaid' : 'pending';
    const bookingUpdate: any = {
      payment_status: bookingPaymentStatus,
      payment_id: razorpayPaymentId || null,
      razorpay_order_id: razorpayOrderId || null,
      updated_at: new Date().toISOString(),
    };
    // Auto-confirm appointment when payment is captured
    if (newStatus === 'CAPTURED') {
      bookingUpdate.status = 'confirmed';
    }
    await db
      .from('bookings')
      .update(bookingUpdate)
      .eq('booking_id', bookingId);

    // Send WhatsApp notification to doctor when payment is captured
    if (newStatus === 'CAPTURED') {
      // Fetch booking data for invoice + WhatsApp
      let booking: any = null;
      try {
        const result = await db
          .from('bookings')
          .select('*')
          .eq('booking_id', bookingId)
          .limit(1)
          .single();
        booking = result.data;
      } catch {}

      // Auto-generate invoice + payment record in EMR billing
      try {
        await autoCreateBookingInvoice({
          bookingId,
          patientName: booking?.patient_name || booking?.first_name || 'Patient',
          patientPhone: booking?.patient_phone || booking?.phone || '',
          patientEmail: booking?.patient_email || booking?.email || undefined,
          clinicId: booking?.clinic_id || booking?.consultation_type || 'online',
          consultationType: booking?.consultation_type || 'online',
          consultationFee: booking?.consultation_fee || booking?.amount || 0,
          currency: booking?.consultation_fee_currency || 'INR',
          paymentMethod: 'Razorpay',
          transactionId: razorpayPaymentId || undefined,
          orderId: razorpayOrderId || undefined,
          paymentStatus: 'COMPLETED',
        });
      } catch (invErr) {
        console.error('[webhook] Auto-invoice error:', invErr);
      }

      if (booking) {
        try {
          await sendBookingWhatsApp({
            bookingId: booking.booking_id || bookingId,
            clinicName: booking.clinic_name || booking.clinic_id || '',
            patientName: booking.patient_name || `${booking.first_name || ''} ${booking.last_name || ''}`.trim(),
            patientPhone: booking.patient_phone || booking.phone || '',
            ageGender: `${booking.age || ''} / ${booking.gender || ''}`,
            date: booking.date || '',
            time: booking.time || '',
            consultationType: booking.consultation_type || '',
            reason: booking.reason || '',
            fee: booking.fee || '',
            paymentStatus: 'PAID via Razorpay',
            paymentId: razorpayPaymentId || undefined,
            country: booking.country || undefined,
            timezone: booking.timezone || undefined,
            complaints: booking.complaints || undefined,
            medicines: booking.medicines || booking.current_medications || undefined,
            notes: booking.notes || undefined,
          });
        } catch (notifyErr) {
          console.error('[webhook] WhatsApp notify error:', notifyErr);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('WEBHOOK error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}