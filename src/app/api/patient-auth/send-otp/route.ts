import { NextResponse } from 'next/server';
import { createOtp } from '@/lib/patient-auth-server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required.' }, { status: 400 });
    }

    const result = await createOtp(email);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 429 });
    }

    // In production, send the OTP via email here.
    // For now, log it server-side only (never exposed to the client).
    console.log(`[PATIENT OTP] ${email}: ${result.otp}`);

    return NextResponse.json({ success: true, message: `Verification code sent to ${email}` });
  } catch (err: any) {
    console.error('send-otp error:', err);
    return NextResponse.json({ error: 'Failed to send verification code.' }, { status: 500 });
  }
}
