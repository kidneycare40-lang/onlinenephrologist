import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.secret !== process.env.SETUP_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();

    // Direct query: find all appointments for Sep 3
    const { data: appts, error: apptErr } = await db
      .from('appointments')
      .select('id, patient_id, doctor_id, clinic_id, appointment_date, appointment_time, type, status, notes, payment_status, is_deleted')
      .gte('appointment_date', '2026-09-03')
      .lte('appointment_date', '2026-09-03')
      .order('appointment_time');

    // Also try without date filter
    const { data: allAppts } = await db
      .from('appointments')
      .select('id, patient_id, doctor_id, clinic_id, appointment_date, appointment_time, notes, is_deleted')
      .ilike('notes', '%KN-%')
      .order('created_at', { ascending: false })
      .limit(10);

    // Check the users table for doctors
    const { data: doctors } = await db
      .from('users')
      .select('id, first_name, last_name, role, is_active')
      .eq('role', 'doctor');

    // Check clinics
    const { data: clinics } = await db
      .from('clinics')
      .select('id, name, slug, is_active');

    return NextResponse.json({
      appointmentsForSep3: appts,
      appointmentsForSep3Error: apptErr?.message,
      appointmentsWithBookingId: allAppts,
      doctors: doctors,
      clinics: clinics,
    }, { space: 2 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
