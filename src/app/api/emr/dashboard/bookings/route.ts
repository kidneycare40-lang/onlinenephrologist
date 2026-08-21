import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { authenticateRequest, apiError } from '@/lib/auth/middleware';

// GET — EMR dashboard bookings + stats from the bookings table
// ?clinicId= filter, ?period=week|month|all, ?dateFrom=, ?dateTo=
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');
    const period = searchParams.get('period') || 'all';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Base query
    let query = db.from('bookings').select('*', { count: 'exact' });
    if (clinicId) query = query.eq('clinic_id', clinicId);

    // Date filtering
    if (dateFrom) query = query.gte('booking_date', dateFrom);
    if (dateTo) query = query.lte('booking_date', dateTo);
    if (period === 'today') {
      const today = new Date().toISOString().split('T')[0];
      query = query.eq('booking_date', today);
    } else if (period === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
      query = query.gte('booking_date', weekAgo);
    } else if (period === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
      query = query.gte('booking_date', monthAgo);
    }

    query = query.order('created_at', { ascending: false }).limit(200);

    const { data: bookings, count, error } = await query;
    if (error) {
      console.error('[dashboard/bookings] query error:', error);
      return apiError('Failed to load bookings', 500);
    }

    const rows = bookings || [];

    // Compute stats
    const totalBookings = count || rows.length;
    const totalRevenue = rows
      .filter(b => b.payment_status === 'paid')
      .reduce((sum, b) => sum + (Number(b.consultation_fee) || 0), 0);
    const pendingPayments = rows
      .filter(b => b.payment_status !== 'paid')
      .reduce((sum, b) => sum + (Number(b.consultation_fee) || 0), 0);
    const internationalCount = rows.filter(b => b.is_international).length;
    const onlineCount = rows.filter(b => b.consultation_type === 'online' || b.consultation_type === 'online_intl').length;
    const inClinicCount = rows.filter(b => b.consultation_type === 'offline' || b.consultation_type === 'hospital').length;

    // Group by clinic
    const byClinic: Record<string, { count: number; revenue: number }> = {};
    for (const b of rows) {
      const cId = b.clinic_id || 'unknown';
      if (!byClinic[cId]) byClinic[cId] = { count: 0, revenue: 0 };
      byClinic[cId].count++;
      if (b.payment_status === 'paid') byClinic[cId].revenue += Number(b.consultation_fee) || 0;
    }

    // Group by status
    const byStatus: Record<string, number> = {};
    for (const b of rows) {
      const s = b.status || 'unknown';
      byStatus[s] = (byStatus[s] || 0) + 1;
    }

    // Today's count
    const today = new Date().toISOString().split('T')[0];
    const todayCount = rows.filter(b => b.booking_date === today).length;

    // Unique patients
    const uniquePhones = new Set(rows.map(b => b.phone).filter(Boolean));

    return NextResponse.json({
      bookings: rows.map(b => ({
        bookingId: b.booking_id,
        firstName: b.first_name,
        lastName: b.last_name,
        phone: b.phone,
        email: b.email,
        age: b.age,
        gender: b.gender,
        consultationType: b.consultation_type,
        clinicId: b.clinic_id,
        bookingDate: b.booking_date,
        bookingTime: b.booking_time,
        reason: b.reason,
        status: b.status,
        paymentStatus: b.payment_status,
        consultationFee: b.consultation_fee,
        consultationFeeCurrency: b.consultation_fee_currency,
        isInternational: b.is_international,
        country: b.country,
        createdAt: b.created_at,
      })),
      stats: {
        totalBookings,
        totalRevenue,
        pendingPayments,
        internationalCount,
        onlineCount,
        inClinicCount,
        todayCount,
        uniquePatients: uniquePhones.size,
        byClinic,
        byStatus,
      },
    });
  } catch (error) {
    console.error('[dashboard/bookings] error:', error);
    return apiError('Internal server error', 500);
  }
}
