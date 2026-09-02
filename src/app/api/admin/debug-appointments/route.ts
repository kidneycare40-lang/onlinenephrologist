import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.secret !== process.env.SETUP_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();

    // Check if clinic_id exists
    const { data: clinic, error: ce } = await db
      .from('clinics')
      .select('id, name')
      .eq('id', '00000000-0000-0000-0000-000000000010')
      .maybeSingle();

    // List all clinics
    const { data: allClinics } = await db.from('clinics').select('id, name');

    // Try the exact same query the appointments page uses
    const { data: joinQuery, error: joinErr } = await db
      .from('appointments')
      .select(`
        *,
        patient:patients(id, first_name, last_name, phone, uhid),
        doctor:users(id, first_name, last_name),
        clinic:clinics(id, name)
      `)
      .eq('is_deleted', false)
      .gte('appointment_date', '2026-09-03')
      .lte('appointment_date', '2026-09-03')
      .order('appointment_time', { ascending: true });

    // Try without joins
    const { data: noJoin, error: njErr } = await db
      .from('appointments')
      .select('*')
      .eq('is_deleted', false)
      .gte('appointment_date', '2026-09-03')
      .lte('appointment_date', '2026-09-03')
      .order('appointment_time', { ascending: true });

    return NextResponse.json({
      shashiClinicExists: clinic,
      shashiClinicError: ce?.message,
      allClinics,
      joinQuery,
      joinError: joinErr?.message,
      noJoin,
      noJoinError: njErr?.message,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
