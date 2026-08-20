import { NextResponse } from 'next/server';
import { getPatientFromCookie } from '@/lib/patient-auth-server';
import { getDb } from '@/lib/db/client';

export async function GET() {
  const patient = await getPatientFromCookie();
  if (!patient || patient.patientId === 'pending') {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Fetch full profile from patient_accounts table
  const db = getDb();
  const { data: profile } = await db
    .from('patient_accounts')
    .select('id, email, first_name, last_name, phone, date_of_birth, gender, country, timezone, is_international, country_code')
    .eq('id', patient.patientId)
    .limit(1)
    .single();

  const res = NextResponse.json({
    patient: {
      patientId: patient.patientId,
      email: profile?.email || patient.email,
      name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || patient.name : patient.name,
      firstName: profile?.first_name || patient.name?.split(' ')[0] || '',
      lastName: profile?.last_name || patient.name?.split(' ').slice(1).join(' ') || '',
      phone: profile?.phone || '',
      dateOfBirth: profile?.date_of_birth || null,
      gender: profile?.gender || null,
      country: profile?.country || null,
      timezone: profile?.timezone || null,
      isInternational: profile?.is_international || false,
      countryCode: profile?.country_code || null,
    },
  });
  res.headers.set('Cache-Control', 'no-store, private');
  return res;
}
