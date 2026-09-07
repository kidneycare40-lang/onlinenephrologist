import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId required' }, { status: 400 });
    }

    const db = getDb();

    const { data: payment } = await db
      .from('booking_payments')
      .select('id, booking_id, payment_status')
      .eq('booking_id', bookingId)
      .limit(1)
      .single();

    if (!payment) {
      return NextResponse.json({ error: 'Booking payment not found' }, { status: 404 });
    }

    const status = (payment.payment_status || '').toLowerCase();
    if (status === 'captured' || status === 'paid') {
      return NextResponse.json({ error: 'Cannot delete a paid/captured booking. Only unpaid records can be deleted.' }, { status: 400 });
    }

    await db.from('booking_payments').delete().eq('id', payment.id);

    return NextResponse.json({ success: true, message: `Deleted booking payment record for ${bookingId}` });
  } catch (error) {
    console.error('[delete-unpaid] Error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
