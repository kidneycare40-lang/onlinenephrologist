import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { applyRateLimit, apiError } from '@/lib/auth/middleware';
import { normalizePhone, validatePhone } from '@/lib/phone';

// Public endpoint — no auth required.
// Returns ONLY whether a patient exists with this phone number.
// Never returns patient name, email, UHID, DOB, or any profile data.
// Rate-limited to prevent phone enumeration attacks.
export async function POST(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'phone_lookup');
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

    const { data, error } = await db
      .from('patient_accounts')
      .select('id, first_name, last_name, email, email_verified, date_of_birth, gender')
      .eq('phone', normalized)
      .limit(1);

    if (error) {
      console.error('[phone-lookup] error:', error);
      return apiError('Failed to check phone number', 500);
    }

    const exists = data && data.length > 0;
    const acct = exists ? data[0] : null;

    // Calculate age from DOB
    let age: number | null = null;
    if (acct?.date_of_birth) {
      const dob = new Date(acct.date_of_birth);
      const now = new Date();
      age = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
      if (age <= 0 || age > 120) age = null;
    }

    return NextResponse.json({
      exists,
      firstName: acct?.first_name || null,
      lastName: acct?.last_name || null,
      email: acct?.email || null,
      emailVerified: acct?.email_verified || false,
      age,
      gender: acct?.gender || null,
      message: exists
        ? 'Welcome back! We found your profile.'
        : 'You can continue as a new patient.',
    });
  } catch (error) {
    console.error('[phone-lookup] error:', error);
    return apiError('Failed to check phone number', 500);
  }
}
