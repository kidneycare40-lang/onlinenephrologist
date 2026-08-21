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

  // If DOB is null, try to get age from the patient's most recent booking
  let dateOfBirth = profile?.date_of_birth || null;
  if (!dateOfBirth && profile?.phone) {
    const { data: lastBooking } = await db
      .from('bookings')
      .select('age')
      .eq('patient_account_id', patient.patientId)
      .not('age', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (lastBooking?.age) {
      // Convert stored age to approximate DOB
      const approxYear = new Date().getFullYear() - Number(lastBooking.age);
      dateOfBirth = `${approxYear}-01-01`;
    }
  }

  const res = NextResponse.json({
    patient: {
      patientId: patient.patientId,
      email: profile?.email || patient.email,
      name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || patient.name : patient.name,
      firstName: profile?.first_name || patient.name?.split(' ')[0] || '',
      lastName: profile?.last_name || patient.name?.split(' ').slice(1).join(' ') || '',
      phone: profile?.phone || '',
      dateOfBirth,
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
