import { NextResponse } from 'next/server';
import {
  verifyOtp,
  findPatientByEmail,
  createPatientAccount,
  signPatientToken,
  setPatientCookie,
  touchPatientLogin,
} from '@/lib/patient-auth-server';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and verification code are required.' }, { status: 400 });
    }

    // Verify the OTP
    const result = await verifyOtp(email, otp);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    const normalisedEmail = result.email!;

    // Find or create patient account
    let patient = await findPatientByEmail(normalisedEmail);
    let isNew = false;

    if (!patient) {
      // Will be created after the client sends registration details
      // For now, return that verification succeeded but account needs registration
      const token = await signPatientToken('pending', normalisedEmail, '');
      await setPatientCookie(token);
      return NextResponse.json({
        success: true,
        isNew: true,
        email: normalisedEmail,
        message: 'Email verified. Please complete your profile.',
      });
    }

    // Existing patient — login
    await touchPatientLogin(patient.id);
    const token = await signPatientToken(patient.id, patient.email, `${patient.first_name} ${patient.last_name}`);
    await setPatientCookie(token);

    return NextResponse.json({
      success: true,
      isNew: false,
      patient: {
        id: patient.id,
        email: patient.email,
        firstName: patient.first_name,
        lastName: patient.last_name,
        phone: patient.phone,
        gender: patient.gender,
        country: patient.country,
        timezone: patient.timezone,
        isInternational: patient.is_international,
      },
      message: 'Welcome back!',
    });
  } catch (err: any) {
    console.error('verify-otp error:', err);
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 });
  }
}
