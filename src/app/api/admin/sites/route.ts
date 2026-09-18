import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { authenticateRequest } from '@/lib/auth/middleware';

/**
 * GET /api/admin/sites
 * Returns site statistics (bookings count, revenue, etc.)
 * Requires EMR authentication.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error) {
      return auth.error;
    }

    const db = getDb();

    // Get booking counts by site
    const { data: bookings, error: bookingsError } = await db
      .from('bookings')
      .select('site_id, payment_status, status');

    if (bookingsError) {
      console.error('[sites] Error fetching bookings:', bookingsError);
    }

    // Get payment sums by site
    const { data: payments, error: paymentsError } = await db
      .from('booking_payments')
      .select('site_id, amount, currency, payment_status');

    if (paymentsError) {
      console.error('[sites] Error fetching payments:', paymentsError);
    }

    // Calculate stats per site
    const stats: Record<string, {
      siteId: string;
      totalBookings: number;
      paidBookings: number;
      pendingBookings: number;
      totalRevenue: number;
    }> = {};

    // Initialize stats for all known sites
    const siteIds = ['kcc', 'online', 'saket', 'psri', 'international'];
    for (const siteId of siteIds) {
      stats[siteId] = {
        siteId,
        totalBookings: 0,
        paidBookings: 0,
        pendingBookings: 0,
        totalRevenue: 0,
      };
    }

    // Count bookings by site
    if (bookings) {
      for (const b of bookings) {
        const siteId = b.site_id || 'online';
        if (!stats[siteId]) {
          stats[siteId] = { siteId, totalBookings: 0, paidBookings: 0, pendingBookings: 0, totalRevenue: 0 };
        }
        stats[siteId].totalBookings++;
        if (b.payment_status === 'paid') stats[siteId].paidBookings++;
        if (b.status === 'pending') stats[siteId].pendingBookings++;
      }
    }

    // Sum revenue by site from captured payments
    if (payments) {
      for (const p of payments) {
        const siteId = p.site_id || 'online';
        if (!stats[siteId]) {
          stats[siteId] = { siteId, totalBookings: 0, paidBookings: 0, pendingBookings: 0, totalRevenue: 0 };
        }
        if (p.payment_status === 'CAPTURED' && p.currency === 'INR') {
          stats[siteId].totalRevenue += Number(p.amount) || 0;
        }
      }
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('[sites] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
