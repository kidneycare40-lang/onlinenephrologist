import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';

/**
 * GET /api/admin/cleanup-unpaid
 * Called by Vercel Cron every 10 minutes.
 * Cancels pending unpaid bookings older than 30 minutes to free up slots.
 *
 * Auth: Vercel Cron sends Authorization: Bearer <CRON_SECRET>
 * Also supports: ?secret=<SETUP_KEY> for manual calls
 */
export async function GET(request: NextRequest) {
  try {
    // Auth: Vercel Cron header OR query param
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const querySecret = new URL(request.url).searchParams.get('secret');

    const isVercelCron = authHeader === `Bearer ${cronSecret}` && cronSecret;
    const isManualAuth = querySecret === process.env.SETUP_KEY;

    if (!isVercelCron && !isManualAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ttlMinutes = 30;
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
