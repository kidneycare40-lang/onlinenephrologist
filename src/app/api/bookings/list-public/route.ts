import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);

    let query = db
      .from('bookings')
      .select('booking_id, first_name, last_name, phone, clinic_id, booking_date, booking_time, status, doctor_name')
      .order('created_at', { ascending: false });

    const clinicId = searchParams.get('clinicId');
    if (clinicId) query = query.eq('clinic_id', clinicId);

    const date = searchParams.get('date');
    if (date) query = query.eq('booking_date', date);

    query = query.limit(500);

    const { data, error } = await query;
    if (error) {
      console.error('GET /api/bookings/list-public error:', error);
      return NextResponse.json([]);
    }

    const bookings = (data || []).map((row: any) => ({
      bookingId: row.booking_id,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone || '',
      clinicId: row.clinic_id || '',
      date: row.booking_date || '',
      time: row.booking_time || '',
      status: row.status || 'pending',
      doctorName: row.doctor_name || 'Dr. Rajesh Goel',
    }));

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('GET /api/bookings/list-public error:', error);
    return NextResponse.json([]);
  }
}
