import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';

export async function GET() {
  const db = getDb();
  const { data, error } = await db
    .from('appointments')
    .select(`
      *,
      patient:patients(id, first_name, last_name, phone, uhid),
      doctor:users!appointments_doctor_id_fkey(id, first_name, last_name),
      clinic:clinics(id, name)
    `)
    .eq('is_deleted', false)
    .gte('appointment_date', '2026-09-03')
    .lte('appointment_date', '2026-09-03')
    .order('appointment_time', { ascending: true });

  return NextResponse.json({ data, error: error?.message });
}
