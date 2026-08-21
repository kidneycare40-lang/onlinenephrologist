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
      .select('id')
      .eq('phone', normalized)
      .limit(1);

    if (error) {
      console.error('[phone-lookup] error:', error);
      return apiError('Failed to check phone number', 500);
    }

    const exists = data && data.length > 0;

    // Generic response only — no patient data exposed
    return NextResponse.json({
      exists,
      message: exists
        ? 'We found an existing profile. Continue to access your booking details.'
        : 'You can continue as a new patient.',
    });
  } catch (error) {
    console.error('[phone-lookup] error:', error);
    return apiError('Failed to check phone number', 500);
  }
}
