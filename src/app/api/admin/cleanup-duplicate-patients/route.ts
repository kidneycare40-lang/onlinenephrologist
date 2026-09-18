import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';

/**
 * GET /api/admin/cleanup-duplicate-patients?secret=<SETUP_KEY>
 * POST /api/admin/cleanup-duplicate-patients  Body: { "secret": "<SETUP_KEY>" }
 *
 * Cleans up OB- prefix patient records:
 * 1. Soft-deletes OB patients with first_name='Patient' (junk records with no useful data)
 * 2. For OB patients with a real name, tries to find a matching non-OB patient via:
 *    a. Phone number match (fuzzy, last 10 digits)
 *    b. Email match
 *    c. Name match (first + last)
 *    d. booking_payments → booking chain
 * 3. If match found: migrates appointments/prescriptions, soft-deletes the OB record
 * 4. If no match: keeps the OB record (it's the only record for that patient)
 *
 * Idempotent — safe to run multiple times.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  if (secret !== process.env.SETUP_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return runCleanup();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.secret !== process.env.SETUP_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return runCleanup();
  } catch (error) {
    console.error('[cleanup-duplicate-patients] Error:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}

async function runCleanup(): Promise<NextResponse> {
  try {
    const db = getDb();

    // Fetch all OB- prefix patients
    const { data: obPatients, error: obErr } = await db
      .from('patients')
      .select('id, uhid, first_name, last_name, phone, email, gender, date_of_birth, is_active, is_deleted, created_at')
      .like('uhid', 'OB-%')
      .eq('is_deleted', false);

    if (obErr) {
      return NextResponse.json({ error: 'Failed to fetch OB patients', detail: obErr.message }, { status: 500 });
    }

    // Fetch ALL non-OB patients for matching
    const { data: allNonObPatients } = await db
      .from('patients')
      .select('id, uhid, first_name, last_name, phone, email')
      .not('uhid', 'like', 'OB-%')
      .eq('is_deleted', false);

    // Fetch all booking_payments for chain matching
    const { data: allPayments } = await db
      .from('booking_payments')
      .select('booking_id, patient_name, patient_phone, patient_email');

    const paymentByBookingId = new Map<string, any>();
    for (const p of (allPayments || []) as any[]) {
      paymentByBookingId.set(p.booking_id, p);
    }

    const results = {
      totalObPatients: obPatients?.length || 0,
      junkDeleted: 0,
      duplicatesFound: 0,
      merged: 0,
      keptAsStandalone: 0,
      errors: [] as string[],
    };

    for (const obPatient of obPatients || []) {
      const isJunk = obPatient.first_name === 'Patient' && !obPatient.phone && !obPatient.email;

      // Step 1: Soft-delete junk OB patients (name="Patient", no phone, no email)
      if (isJunk) {
        // But first check if they have any linked appointments
        const { data: linkedAppts } = await db
          .from('appointments')
          .select('id')
          .eq('patient_id', obPatient.id)
          .eq('is_deleted', false);

        if (linkedAppts && linkedAppts.length > 0) {
          // Has appointments — try to find a match to migrate them to
          const obSuffix = obPatient.uhid.replace('OB-', '');
          let matchedPatient: any = null;

          // Try to find via booking_payments chain
          for (const [bookingId, bp] of paymentByBookingId) {
            if (bookingId.slice(-6).toUpperCase() === obSuffix || bookingId.includes(obSuffix)) {
              // Found the booking — now find the non-OB patient with matching phone
              const bpPhone = (bp.patient_phone || '').replace(/\D/g, '');
              if (bpPhone && allNonObPatients) {
                matchedPatient = allNonObPatients.find((np: any) => {
                  if (!np.phone) return false;
                  const npClean = np.phone.replace(/\D/g, '');
                  const np10 = npClean.length > 10 ? npClean.slice(-10) : npClean;
                  const bp10 = bpPhone.length > 10 ? bpPhone.slice(-10) : bpPhone;
                  return np10 === bp10 && np10.length === 10;
                });
              }
              break;
            }
          }

          if (matchedPatient) {
            // Migrate appointments
            for (const appt of linkedAppts) {
              await db.from('appointments').update({ patient_id: matchedPatient.id }).eq('id', appt.id);
            }
            // Soft-delete junk
            await db.from('patients').update({ is_deleted: true, updated_at: new Date().toISOString() }).eq('id', obPatient.id);
            results.junkDeleted++;
            results.merged++;
          } else {
            results.errors.push(`Junk ${obPatient.uhid} has ${linkedAppts.length} appointments but no match found — keeping`);
            results.keptAsStandalone++;
          }
        } else {
          // No linked data — safe to soft-delete
          const { error: delErr } = await db
            .from('patients')
            .update({ is_deleted: true, updated_at: new Date().toISOString() })
            .eq('id', obPatient.id);
          if (delErr) {
            results.errors.push(`Failed to delete junk ${obPatient.uhid}: ${delErr.message}`);
          } else {
            results.junkDeleted++;
          }
        }
        continue;
      }

      // Step 2: OB patient has a real name — try to find a match
      let matchedPatient: any = null;

      // 2a: Phone match (fuzzy, last 10 digits)
      if (obPatient.phone && allNonObPatients) {
        const obClean = obPatient.phone.replace(/\D/g, '');
        const ob10 = obClean.length > 10 ? obClean.slice(-10) : obClean;
        if (ob10.length === 10) {
          matchedPatient = allNonObPatients.find((np: any) => {
            if (np.id === obPatient.id) return false;
            if (!np.phone) return false;
            const npClean = np.phone.replace(/\D/g, '');
            const np10 = npClean.length > 10 ? npClean.slice(-10) : npClean;
            return np10 === ob10;
          });
        }
      }

      // 2b: Email match
      if (!matchedPatient && obPatient.email && allNonObPatients) {
        matchedPatient = allNonObPatients.find((np: any) => {
          if (np.id === obPatient.id) return false;
          return np.email && np.email.toLowerCase() === obPatient.email.toLowerCase();
        });
      }

      // 2c: Name match
      if (!matchedPatient && allNonObPatients) {
        const obName = `${obPatient.first_name} ${obPatient.last_name || ''}`.trim().toLowerCase();
        if (obName.length > 3) {
          matchedPatient = allNonObPatients.find((np: any) => {
            if (np.id === obPatient.id) return false;
            const npName = `${np.first_name} ${np.last_name || ''}`.trim().toLowerCase();
            return npName === obName;
          });
        }
      }

      // 2d: Match via booking_payments chain (OB suffix → booking_id → patient phone)
      if (!matchedPatient) {
        const obSuffix = obPatient.uhid.replace('OB-', '');
        for (const [bookingId, bp] of paymentByBookingId) {
          if (bookingId.slice(-6).toUpperCase() === obSuffix || bookingId.includes(obSuffix)) {
            const bpPhone = (bp.patient_phone || '').replace(/\D/g, '');
            if (bpPhone && allNonObPatients) {
              const bp10 = bpPhone.length > 10 ? bpPhone.slice(-10) : bpPhone;
              matchedPatient = allNonObPatients.find((np: any) => {
                if (np.id === obPatient.id) return false;
                if (!np.phone) return false;
                const npClean = np.phone.replace(/\D/g, '');
                const np10 = npClean.length > 10 ? npClean.slice(-10) : npClean;
                return np10 === bp10 && np10.length === 10;
              });
            }
            break;
          }
        }
      }

      if (!matchedPatient) {
        results.keptAsStandalone++;
        continue;
      }

      // Prefer keeping the one with proper name and KCC/ONLINE UHID
      const keepPatient = (matchedPatient.uhid?.startsWith('KCC-') || matchedPatient.uhid?.startsWith('ONLINE-'))
        ? matchedPatient
        : (obPatient.uhid?.startsWith('KCC-') || obPatient.uhid?.startsWith('ONLINE-'))
          ? obPatient
          : matchedPatient.first_name !== 'Patient' ? matchedPatient : obPatient;
      const deletePatient = keepPatient.id === matchedPatient.id ? obPatient : matchedPatient;

      results.duplicatesFound++;

      // Migrate appointments from deletePatient to keepPatient
      const { data: delAppts } = await db
        .from('appointments')
        .select('id')
        .eq('patient_id', deletePatient.id)
        .eq('is_deleted', false);

      for (const appt of delAppts || []) {
        await db.from('appointments').update({ patient_id: keepPatient.id }).eq('id', appt.id);
      }

      // Migrate prescriptions
      const { data: delRx } = await db
        .from('prescriptions')
        .select('id')
        .eq('patient_id', deletePatient.id)
        .eq('is_deleted', false);

      for (const rx of delRx || []) {
        await db.from('prescriptions').update({ patient_id: keepPatient.id }).eq('id', rx.id);
      }

      // Soft-delete the duplicate
      const { error: delErr } = await db
        .from('patients')
        .update({ is_deleted: true, updated_at: new Date().toISOString() })
        .eq('id', deletePatient.id);

      if (delErr) {
        results.errors.push(`Failed to delete ${deletePatient.uhid}: ${delErr.message}`);
      } else {
        results.merged++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleanup: ${results.junkDeleted} junk deleted, ${results.duplicatesFound} duplicates merged, ${results.keptAsStandalone} kept as standalone`,
      ...results,
    });
  } catch (error) {
    console.error('[cleanup-duplicate-patients] Error:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
