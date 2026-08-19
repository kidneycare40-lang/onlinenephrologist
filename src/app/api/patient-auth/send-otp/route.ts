import { NextResponse } from 'next/server';
import { createOtp } from '@/lib/patient-auth-server';
import { sendOtpEmail } from '@/lib/email';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/auth/rate-limit';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required.' }, { status: 400 });
    }

    // Extract client IP for rate limiting
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';

    // IP-based rate limit: max 5 OTP requests per 15 minutes per IP
    const ipCheck = checkRateLimit(`otp-ip:${ip}`, 'otp');
    if (!ipCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests from this IP. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(`otp-ip:${ip}`, 'otp') }
      );
    }

    // Email-based rate limit: max 3 OTP requests per 15 minutes per email
    const emailCheck = checkRateLimit(`otp-email:${email.toLowerCase().trim()}`, 'otp');
    if (!emailCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests for this email. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(`otp-email:${email.toLowerCase().trim()}`, 'otp') }
      );
    }

    // Combined IP+email rate limit: max 10 total per 15 minutes per IP (across all emails)
    const combinedCheck = checkRateLimit(`otp-combined:${ip}`, 'otp');
    if (!combinedCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(`otp-combined:${ip}`, 'otp') }
      );
    }

    const result = await createOtp(email);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 429 });
    }

    // Send OTP via email using Resend
    const emailResult = await sendOtpEmail(email, result.otp);
    if (!emailResult.success) {
      return NextResponse.json({ error: emailResult.error || 'Failed to send email.' }, { status: 500 });
    }

    // Dev-only: also log OTP to console for testing
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[PATIENT OTP] ${email}: ${result.otp}`);
    }

    return NextResponse.json({ success: true, message: `Verification code sent to ${email}` });
  } catch (err: any) {
    console.error('send-otp error:', err);
    return NextResponse.json({ error: 'Failed to send verification code.' }, { status: 500 });
  }
}
