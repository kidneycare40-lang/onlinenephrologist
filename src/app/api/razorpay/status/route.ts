import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { applyRateLimit, apiError } from '@/lib/auth/middleware';

// Returns payment status for a booking — used by the success page on refresh
export async function GET(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api');
    if (rlError) return rlError;

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) return apiError('bookingId is required', 400);

    const db = getDb();
    const { data, error } = await db
      .from('booking_payments')
      .select('*')
      .eq('booking_id', bookingId)
      .limit(1);

    if (error) return apiError('Failed to load payment status', 500);

    if (!data || data.length === 0) {
      return NextResponse.json({ status: 'NOT_FOUND' });
    }

    return NextResponse.json({
      status: data[0].payment_status,
      payment: {
        paymentId: data[0].razorpay_payment_id,
        orderId: data[0].razorpay_order_id,
        amount: data[0].amount,
        currency: data[0].currency,
        consultationType: data[0].consultation_type,
      },
    });
  } catch (error) {
    console.error('PAYMENT STATUS error:', error);
    return apiError('Internal server error', 500);
  }
}