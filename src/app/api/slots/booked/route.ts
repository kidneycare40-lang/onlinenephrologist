import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';

const EMR_CLINIC_MAP: Record<string, string> = {
  'faridabad': '00000000-0000-0000-0000-000000000010',
  'kcc-faridabad': '00000000-0000-0000-0000-000000000010',
  'saket': '00000000-0000-0000-0000-000000000011',
  'kcc-saket': '00000000-0000-0000-0000-000000000011',
  'psri': '00000000-0000-0000-0000-000000000012',
  'psri-delhi': '00000000-0000-0000-0000-000000000012',
  'online': 'online',
  'online-intl': 'online',
};

const NON_ACTIVE = ['CANCELLED', 'NO_SHOW', 'COMPLETED'];

function to12Hour(time24: string): string {
  if (!time24) return '';
  const cleaned = time24.replace(/\s+/g, '');
  const parts = cleaned.split(':');
  let h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const clinicId = searchParams.get('clinicId');

  if (!date) {
    return NextResponse.json({ error: 'date is required' }, { status: 400 });
  }

  const db = getDb();
  const emrClinicId = clinicId ? EMR_CLINIC_MAP[clinicId] : null;

  let query = db
    .from('appointments')
    .select('appointment_time, clinic_id, status')
    .eq('appointment_date', date)
    .eq('is_deleted', false);

  if (emrClinicId && emrClinicId !== 'online') {
    query = query.eq('clinic_id', emrClinicId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const booked: string[] = [];
  for (const apt of data || []) {
    if (NON_ACTIVE.includes(apt.status)) continue;
    booked.push(to12Hour(apt.appointment_time));
  }

  return NextResponse.json({ booked });
}
