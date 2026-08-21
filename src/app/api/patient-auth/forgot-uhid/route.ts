import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { applyRateLimit, apiError } from '@/lib/auth/middleware';
import { normalizePhone, validatePhone } from '@/lib/phone';
import { createOtp } from '@/lib/patient-auth-server';
import { sendOtpEmail } from '@/lib/email';

// Forgot UHID? → Phone lookup → Send OTP to registered email.
// After OTP verified, patient gets a full session (same as verify-otp flow).
export async function POST(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'booking');
    if (rlError) return rlError;

    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return apiError('Phone number is required', 400);
    }

    const normalized = normalizePhone(phone);
    if (!normalized || !validatePhone(normalized)) {
      return apiError('Please enter a valid phone number', 400);
    }

    const db = getDb();

    // Find patient account by phone
    const { data: accounts, error: acctErr } = await db
      .from('patient_accounts')
      .select('id, email, first_name, last_name, email_verified')
      .eq('phone', normalized)
      .limit(5);

    if (acctErr) {
      console.error('[forgot-uhid] account lookup error:', acctErr);
      return apiError('Failed to look up account. Please try again.', 500);
    }

    if (!accounts || accounts.length === 0) {
      return apiError('No account found with this phone number. Please book an appointment first.', 404);
    }

    // Find first account with a verified email
    const accountWithEmail = accounts.find(a => a.email && a.email_verified);
    const accountAnyEmail = accounts.find(a => a.email);
    const matchedAccount = accountWithEmail || accountAnyEmail;

    if (!matchedAccount || !matchedAccount.email) {
      return apiError('No email address on file. Please contact support at +91 98182 35613 to add your email.', 404);
    }

    // Send OTP to the registered email
    const result = await createOtp(matchedAccount.email);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 429 });
    }

    const emailResult = await sendOtpEmail(matchedAccount.email, result.otp);
    if (!emailResult.success) {
      return apiError('Failed to send verification email. Please try again.', 500);
    }

    // Mask email for display: "r***@gmail.com"
    const [local, domain] = matchedAccount.email.split('@');
    const maskedEmail = `${local[0]}***@${domain}`;

    return NextResponse.json({
      success: true,
      email: matchedAccount.email,
      maskedEmail,
      firstName: matchedAccount.first_name || null,
      message: `Verification code sent to ${maskedEmail}`,
    });
  } catch (error) {
    console.error('[forgot-uhid] error:', error);
    return apiError('Failed to process request. Please try again.', 500);
  }
}
