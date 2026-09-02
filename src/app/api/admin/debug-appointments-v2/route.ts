import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  if (secret !== process.env.SETUP_KEY) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const startDate = searchParams.get('startDate') || '2026-09-03T00:00:00';
  const endDate = searchParams.get('endDate') || '2026-09-03T23:59:59';

  const db = getDb();

  // Test 1: Direct query (no joins)
  const { data: raw, error: rawErr } = await db
    .from('appointments')
    .select('*')
    .eq('is_deleted', false)
    .gte('appointment_date', startDate)
    .lte('appointment_date', endDate);

  // Test 2: Query with joins (mimics findByDateRange)
  const { data: joined, error: joinErr } = await db
    .from('appointments')
    .select(`
      *,
      patient:patients(id, first_name, last_name, phone, uhid),
      doctor:users!appointments_doctor_id_fkey(id, first_name, last_name),
      clinic:clinics(id, name)
    `)
    .eq('is_deleted', false)
    .gte('appointment_date', startDate)
    .lte('appointment_date', endDate)
    .order('appointment_time', { ascending: true });

  return NextResponse.json({
    startDate,
    endDate,
    rawCount: raw?.length || 0,
    rawError: rawErr?.message || null,
    rawSample: raw?.[0] ? { id: raw[0].id, appointment_date: raw[0].appointment_date, clinic_id: raw[0].clinic_id, doctor_id: raw[0].doctor_id } : null,
    joinedCount: joined?.length || 0,
    joinError: joinErr?.message || null,
    joinedSample: joined?.[0] ? { id: joined[0].id, doctor: joined[0].doctor, patient: joined[0].patient, clinic: joined[0].clinic } : null,
  });
}
