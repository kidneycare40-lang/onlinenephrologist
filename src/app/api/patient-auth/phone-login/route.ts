import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { applyRateLimit, apiError } from '@/lib/auth/middleware';
import { normalizePhone, validatePhone } from '@/lib/phone';
import { signPatientToken, setPatientCookie, touchPatientLogin } from '@/lib/patient-auth-server';

// Phone + UHID login — creates a basic session.
// This session allows: appointments, booking status, payment status, follow-up.
// It does NOT unlock: prescriptions, reports, consultation notes, medical documents, detailed billing.
// Those require email OTP verification (separate step).
export async function POST(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'booking');
    if (rlError) return rlError;

    const body = await request.json();
    const { phone, uhid } = body;

    if (!phone || !uhid) {
      return apiError('Phone number and UHID are required', 400);
    }

    const normalized = normalizePhone(phone);
    if (!normalized || !validatePhone(normalized)) {
      return apiError('Please enter a valid phone number', 400);
    }

    const cleanUhid = (uhid || '').trim().toUpperCase();
    if (!cleanUhid) {
      return apiError('Please enter your UHID', 400);
    }

    const db = getDb();

    // Find patient account by phone
    const { data: accounts, error: acctErr } = await db
      .from('patient_accounts')
      .select('id, email, first_name, last_name, phone, email_verified')
      .eq('phone', normalized)
      .limit(5);

    if (acctErr) {
      console.error('[phone-login] account lookup error:', acctErr);
      return apiError('Login failed. Please try again.', 500);
    }

    if (!accounts || accounts.length === 0) {
      return apiError('No account found with this phone number. Please book an appointment first.', 404);
    }

    // Match UHID via the EMR bridge → patients table
    let matchedAccount = null;
    for (const acct of accounts) {
      const { data: bridge } = await db
        .from('patient_emr_bridge')
        .select('emr_patient_id')
        .eq('patient_account_id', acct.id)
        .limit(1);

      if (bridge && bridge.length > 0) {
        const { data: patient } = await db
          .from('patients')
          .select('id, uhid')
          .eq('id', bridge[0].emr_patient_id)
          .eq('uhid', cleanUhid)
          .eq('is_deleted', false)
          .limit(1);

        if (patient && patient.length > 0) {
          matchedAccount = acct;
          break;
        }
      }

      // Also check if the account itself has a UHID stored (future-proofing)
      // Or if the patient_id on bookings matches
      const { data: bookingMatch } = await db
        .from('bookings')
        .select('booking_id')
        .eq('patient_account_id', acct.id)
        .eq('uhid', cleanUhid)
        .limit(1);

      if (bookingMatch && bookingMatch.length > 0) {
        matchedAccount = acct;
        break;
      }
    }

    if (!matchedAccount) {
      return apiError('Phone number and UHID do not match. Please check your UHID.', 401);
    }

    // Create basic session (not verified — medical records locked)
    const name = `${matchedAccount.first_name || ''} ${matchedAccount.last_name || ''}`.trim() || 'Patient';
    const token = await signPatientToken(matchedAccount.id, matchedAccount.email || '', name);
    await setPatientCookie(token);
    await touchPatientLogin(matchedAccount.id);

    return NextResponse.json({
      success: true,
      patient: {
        id: matchedAccount.id,
        firstName: matchedAccount.first_name,
        lastName: matchedAccount.last_name,
        email: matchedAccount.email || null,
        emailVerified: matchedAccount.email_verified || false,
      },
      verified: matchedAccount.email_verified || false,
    });
  } catch (error) {
    console.error('[phone-login] error:', error);
    return apiError('Login failed. Please try again.', 500);
  }
}
