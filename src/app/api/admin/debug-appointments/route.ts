import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.secret !== process.env.SETUP_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();

    // Simple query - no joins
    const { data: allAppts, error: e1 } = await db
      .from('appointments')
      .select('id, patient_id, doctor_id, clinic_id, appointment_date, appointment_time, status, notes, payment_status, is_deleted')
      .order('created_at', { ascending: false })
      .limit(10);

    // Simple query - doctors
    const { data: doctors, error: e2 } = await db
      .from('users')
      .select('id, first_name, last_name, role, is_active')
      .eq('role', 'doctor');

    // Simple query - clinics
    const { data: clinics, error: e3 } = await db
      .from('clinics')
      .select('id, name, slug, is_active');

    return NextResponse.json({
      appointments: allAppts,
      appointmentsErr: e1?.message,
      doctors,
      doctorsErr: e2?.message,
      clinics,
      clinicsErr: e3?.message,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
