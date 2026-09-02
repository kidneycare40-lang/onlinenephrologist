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

const NON_ACTIVE_APPOINTMENTS = ['CANCELLED', 'NO_SHOW', 'COMPLETED'];
const NON_ACTIVE_BOOKINGS = ['cancelled', 'completed', 'no_show'];

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
  const emrClinicId = clinicId ? EMR_CLINIC_MAP[clinicId] || null : null;
  const booked = new Set<string>();

  // 1. Query EMR appointments table
  try {
    let aptQuery = db
      .from('appointments')
      .select('appointment_time, status')
      .eq('appointment_date', date)
      .eq('is_deleted', false);

    if (emrClinicId && emrClinicId !== 'online') {
      aptQuery = aptQuery.eq('clinic_id', emrClinicId);
    }

    const { data: aptData, error: aptError } = await aptQuery;
    if (!aptError) {
      for (const apt of aptData || []) {
        if (NON_ACTIVE_APPOINTMENTS.includes(apt.status)) continue;
        booked.add(to12Hour(apt.appointment_time));
      }
    }
  } catch {}

  // 2. Query Supabase bookings table
  try {
    let bkQuery = db
      .from('bookings')
      .select('booking_time, status')
      .eq('booking_date', date);

    if (clinicId) {
      bkQuery = bkQuery.eq('clinic_id', clinicId);
    }

    const { data: bkData, error: bkError } = await bkQuery;
    if (!bkError) {
      for (const b of bkData || []) {
        if (NON_ACTIVE_BOOKINGS.includes(b.status)) continue;
        booked.add(to12Hour(b.booking_time));
      }
    }
  } catch {}

  return NextResponse.json({ booked: Array.from(booked) });
}
