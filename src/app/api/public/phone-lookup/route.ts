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
      .select('id, first_name, email_verified')
      .eq('phone', normalized)
      .limit(1);

    if (error) {
      console.error('[phone-lookup] error:', error);
      return apiError('Failed to check phone number', 500);
    }

    const exists = data && data.length > 0;

    return NextResponse.json({
      exists,
      firstName: exists ? data[0].first_name || null : null,
      emailVerified: exists ? data[0].email_verified || false : false,
      message: exists
        ? 'Welcome back! We found your profile.'
        : 'You can continue as a new patient.',
    });
  } catch (error) {
    console.error('[phone-lookup] error:', error);
    return apiError('Failed to check phone number', 500);
  }
}
