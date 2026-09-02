import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { authenticateRequest } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  const { user, error: authError } = await authenticateRequest(request);
  if (authError) return NextResponse.json({ authError: true });

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate') || '2026-09-03T00:00:00';
  const endDate = searchParams.get('endDate') || '2026-09-03T23:59:59';

  const db = getDb();

  // Test 1: Direct Supabase query (no joins)
  const { data: raw, error: rawErr } = await db
    .from('appointments')
    .select('*')
    .eq('is_deleted', false)
    .gte('appointment_date', startDate)
    .lte('appointment_date', endDate);

  // Test 2: Same query with joins (mimics findByDateRange)
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
    user: user?.userId,
    startDate,
    endDate,
    rawCount: raw?.length || 0,
    rawError: rawErr?.message,
    rawSample: raw?.[0],
    joinedCount: joined?.length || 0,
    joinError: joinErr?.message,
    joinedSample: joined?.[0],
  });
}
