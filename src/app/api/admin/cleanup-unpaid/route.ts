import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';

/**
 * POST /api/admin/cleanup-unpaid
 * Cancels pending unpaid bookings older than the specified TTL (default: 30 minutes).
 * This frees up slots that were held by users who never completed payment.
 *
 * Body: { "secret": "<SETUP_KEY>", "ttlMinutes": 30 }
 * 
 * Safe to run via cron every 5-10 minutes.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.secret !== process.env.SETUP_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ttlMinutes = body.ttlMinutes || 30;
    const cutoff = new Date(Date.now() - ttlMinutes * 60 * 1000).toISOString();

    const db = getDb();

    // Find pending unpaid bookings older than TTL
    const { data: staleBookings, error: fetchErr } = await db
      .from('bookings')
      .select('id, booking_id, first_name, last_name, phone, booking_date, booking_time, clinic_id')
      .eq('status', 'pending')
      .eq('payment_status', 'unpaid')
      .lt('created_at', cutoff);

    if (fetchErr) {
      return NextResponse.json({ error: 'Failed to fetch bookings', detail: fetchErr.message }, { status: 500 });
    }

    if (!staleBookings || staleBookings.length === 0) {
      return NextResponse.json({ success: true, cancelled: 0, message: 'No stale unpaid bookings found' });
    }

    // Cancel them
    const { error: updateErr } = await db
      .from('bookings')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('status', 'pending')
      .eq('payment_status', 'unpaid')
      .lt('created_at', cutoff);

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to cancel bookings', detail: updateErr.message }, { status: 500 });
    }

    console.log(`[cleanup] Cancelled ${staleBookings.length} stale unpaid bookings (older than ${ttlMinutes}min)`);

    return NextResponse.json({
      success: true,
      cancelled: staleBookings.length,
      bookings: staleBookings.map((b: any) => `${b.booking_id} (${b.first_name} ${b.last_name})`),
    });
  } catch (error) {
    console.error('[cleanup] Error:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
