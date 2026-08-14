import { NextResponse } from 'next/server';
import {
  getPatientFromCookie,
  findPatientByEmail,
  createPatientAccount,
  updatePatientProfile,
  signPatientToken,
  setPatientCookie,
  touchPatientLogin,
} from '@/lib/patient-auth-server';

/** Register a new patient after OTP verification, or update profile. */
export async function POST(req: Request) {
  const session = await getPatientFromCookie();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await req.json();

    // If session is "pending" (new patient), create the account
    if (session.patientId === 'pending') {
      // Check email not already taken (race condition guard)
      const existing = await findPatientByEmail(session.email);
      if (existing) {
        // Already created — just log in
        await touchPatientLogin(existing.id);
        const token = await signPatientToken(existing.id, existing.email, `${existing.first_name} ${existing.last_name}`);
        await setPatientCookie(token);
        return NextResponse.json({ patient: existing, success: true });
      }

      const patient = await createPatientAccount({
        email: session.email,
        first_name: body.firstName || '',
        last_name: body.lastName || '',
        phone: body.phone,
        date_of_birth: body.dateOfBirth,
        gender: body.gender,
        country: body.country,
        timezone: body.timezone,
        is_international: body.isInternational,
        country_code: body.countryCode,
      });

      const token = await signPatientToken(patient.id, patient.email, `${patient.first_name} ${patient.last_name}`);
      await setPatientCookie(token);

      return NextResponse.json({ patient, success: true, isNew: true });
    }

    // Existing patient — update profile
    const updated = await updatePatientProfile(session.patientId, {
      first_name: body.firstName,
      last_name: body.lastName,
      phone: body.phone,
      date_of_birth: body.dateOfBirth,
      gender: body.gender,
      country: body.country,
      timezone: body.timezone,
    });

    return NextResponse.json({ patient: updated, success: true });
  } catch (err: any) {
    console.error('patient profile error:', err);
    return NextResponse.json({ error: err.message || 'Failed to save profile.' }, { status: 500 });
  }
}
