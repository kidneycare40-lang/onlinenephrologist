import { NextResponse } from 'next/server';
import {
  verifyOtp,
  findPatientByEmail,
  createPatientAccount,
  signPatientToken,
  setPatientCookie,
  touchPatientLogin,
} from '@/lib/patient-auth-server';
import { getEmrPatientId } from '@/lib/patient-portal-server';
import { sendLoginDetailsEmail } from '@/lib/email';
import { getDb } from '@/lib/db/client';

export async function POST(req: Request) {
  try {
    const { email, otp, source } = await req.json();
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

    // If this is a "forgot UHID" login, send login details email server-side (guaranteed delivery)
    if (source === 'forgot-uhid' && patient.email) {
      try {
        const db = getDb();
        const uhid = await getEmrPatientId(patient.id);
        let uhidStr = '';
        if (uhid) {
          const { data: emrPatient } = await db
            .from('patients')
            .select('uhid')
            .eq('id', uhid)
            .maybeSingle();
          uhidStr = emrPatient?.uhid || '';
        }
        if (uhidStr) {
          await sendLoginDetailsEmail(patient.email, {
            firstName: patient.first_name || 'Patient',
            uhid: uhidStr,
            phone: patient.phone || '',
            email: patient.email,
          });
        }
      } catch (err) {
        console.error('[verify-otp] Failed to send login details email:', err);
      }
    }

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
