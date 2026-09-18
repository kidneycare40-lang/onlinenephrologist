import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { authenticateRequest } from '@/lib/auth/middleware';

/**
 * GET /api/admin/bookings
 * Returns a list of bookings with optional filtering by site_id, status, payment_status.
 * Requires EMR authentication.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error) {
      return auth.error;
    }

    const { searchParams } = new URL(request.url);
    const site = searchParams.get('site');
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('payment_status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const db = getDb();
    let query = db
      .from('bookings')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (site) {
      query = query.eq('site_id', site);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (paymentStatus) {
      query = query.eq('payment_status', paymentStatus);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('[admin-bookings] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      bookings: data || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('[admin-bookings] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
