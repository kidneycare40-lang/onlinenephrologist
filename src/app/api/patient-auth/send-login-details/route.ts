import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { getPatientFromCookie } from '@/lib/patient-auth-server';
import { sendLoginDetailsEmail } from '@/lib/email';

// POST — send login details (UHID, phone, email) to the logged-in patient's email
// Called after "Forgot UHID" login so patient has their details for next time
export async function POST() {
  try {
    const patient = await getPatientFromCookie();
    if (!patient || patient.patientId === 'pending') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const db = getDb();

    // Get account details
    const { data: account } = await db
      .from('patient_accounts')
      .select('id, email, first_name, last_name, phone')
      .eq('id', patient.patientId)
      .maybeSingle();

    if (!account?.email) {
      return NextResponse.json({ error: 'No email on file' }, { status: 400 });
    }

    // Get UHID from EMR bridge → patients table
    const { data: bridge } = await db
      .from('patient_emr_bridge')
      .select('emr_patient_id')
      .eq('patient_account_id', patient.patientId)
      .limit(1);

    let uhid = '';
    if (bridge && bridge.length > 0) {
      const { data: emrPatient } = await db
        .from('patients')
        .select('uhid')
        .eq('id', bridge[0].emr_patient_id)
        .maybeSingle();
      uhid = emrPatient?.uhid || '';
    }

    if (!uhid) {
      return NextResponse.json({ error: 'No UHID found for this account' }, { status: 404 });
    }

    const firstName = account.first_name || 'Patient';
    const phone = account.phone || '';

    // Send email
    const result = await sendLoginDetailsEmail(account.email, {
      firstName,
      uhid,
      phone,
      email: account.email,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Login details sent to ${account.email}`,
    });
  } catch (error) {
    console.error('[send-login-details] error:', error);
    return NextResponse.json({ error: 'Failed to send login details' }, { status: 500 });
  }
}
