import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';

/**
 * POST /api/admin/reconcile-bookings
 * Detects PAID bookings that have no corresponding appointment record.
 * Creates missing appointments. Idempotent — safe to run multiple times.
 * 
 * Body: { "secret": "<SETUP_KEY>" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.secret !== process.env.SETUP_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();

    // Find bookings that need fixing:
    // 1. PAID bookings without appointments
    // 2. Bookings where booking_payments says CAPTURED but bookings table still says unpaid
    const fields = 'booking_id, actual_patient_id, patient_account_id, phone, first_name, last_name, age, gender, consultation_type, clinic_id, booking_date, booking_time, reason, doctor_name, consultation_fee, consultation_fee_currency, status, payment_status, payment_id';

    const [paidResult, allBookingsResult] = await Promise.all([
      db.from('bookings').select(fields).eq('payment_status', 'paid').order('created_at', { ascending: false }),
      db.from('bookings').select(fields + ', id').order('created_at', { ascending: false }).limit(200),
    ]);

    if (paidResult.error) {
      return NextResponse.json({ error: 'Failed to fetch bookings', detail: paidResult.error.message }, { status: 500 });
    }
    if (allBookingsResult.error) {
      return NextResponse.json({ error: 'Failed to fetch all bookings', detail: allBookingsResult.error.message }, { status: 500 });
    }

    // Find bookings with CAPTURED payments in booking_payments but unpaid in bookings table
    const unpaidBookingIds = (allBookingsResult.data || [])
      .filter((b: any) => b.payment_status === 'unpaid')
      .map((b: any) => b.booking_id);

    let capturedPayments: any[] = [];
    if (unpaidBookingIds.length > 0) {
      // Query booking_payments for CAPTURED records matching unpaid bookings
      const { data: bpData } = await db
        .from('booking_payments')
        .select('booking_id, payment_status')
        .in('booking_id', unpaidBookingIds)
        .eq('payment_status', 'CAPTURED');
      capturedPayments = (bpData as any) || [];
    }

    const capturedBookingIds = new Set<string>((capturedPayments as any[]).map((bp: any) => bp.booking_id));

    // Merge: paid bookings + bookings with captured payments but unpaid status
    const allBookings = [...(paidResult.data || [])];
    for (const bk of (allBookingsResult.data as any[]) || []) {
      if (capturedBookingIds.has(bk.booking_id) && !allBookings.find((b: any) => b.booking_id === bk.booking_id)) {
        allBookings.push(bk);
      }
    }
    const paidBookings = allBookings;

    const results: {
      totalPaidBookings: number;
      alreadyHaveAppointments: number;
      missingAppointments: number;
      createdAppointments: number;
      skippedDueToMissingData: number;
      fixedPaymentStatus: number;
      errors: string[];
    } = {
      totalPaidBookings: paidBookings?.length || 0,
      alreadyHaveAppointments: 0,
      missingAppointments: 0,
      createdAppointments: 0,
      skippedDueToMissingData: 0,
      fixedPaymentStatus: 0,
      errors: [],
    };

    for (const bk of paidBookings || []) {
      if (!bk.booking_date || !bk.booking_time || !bk.clinic_id) {
        results.skippedDueToMissingData++;
        continue;
      }

      // Check if appointment already exists
      const { data: existingAppt } = await db
        .from('appointments')
        .select('id')
        .eq('notes', `Booking ID: ${bk.booking_id}`)
        .eq('is_deleted', false)
        .limit(1);

      if (existingAppt && existingAppt.length > 0) {
        // Fix payment_status if unpaid — either via payment_id or via booking_payments CAPTURED
        if (bk.payment_status === 'unpaid' && (bk.payment_id || capturedBookingIds.has(bk.booking_id))) {
          await db.from('bookings').update({ payment_status: 'paid', status: 'confirmed', updated_at: new Date().toISOString() }).eq('booking_id', bk.booking_id);
          results.fixedPaymentStatus = (results.fixedPaymentStatus || 0) + 1;
        }
        results.alreadyHaveAppointments++;
        continue;
      }

      // Fix payment_status if unpaid — either via payment_id or via booking_payments CAPTURED
      if (bk.payment_status === 'unpaid' && (bk.payment_id || capturedBookingIds.has(bk.booking_id))) {
        await db.from('bookings').update({ payment_status: 'paid', status: 'confirmed', updated_at: new Date().toISOString() }).eq('booking_id', bk.booking_id);
        results.fixedPaymentStatus = (results.fixedPaymentStatus || 0) + 1;
      }

      results.missingAppointments++;

      // Find or create EMR patient
      let emrPatientId = bk.actual_patient_id;
      if (!emrPatientId && bk.patient_account_id) {
        const { data: bridge } = await db
          .from('patient_account_emr_patients')
          .select('emr_patient_id')
          .eq('patient_account_id', bk.patient_account_id)
          .limit(1);
        if (bridge && bridge.length > 0) emrPatientId = bridge[0].emr_patient_id;
      }
      if (!emrPatientId && bk.phone) {
        const cleanPhone = bk.phone.replace(/\D/g, '');
        const { data: byPhone } = await db
          .from('patients')
          .select('id')
          .or(`phone.eq.${cleanPhone},phone.eq.${bk.phone}`)
          .eq('is_deleted', false)
          .limit(1);
        if (byPhone && byPhone.length > 0) emrPatientId = byPhone[0].id;
      }

      if (!emrPatientId) {
        // Create a new EMR patient
        const { data: newPatient, error: patErr } = await db
          .from('patients')
          .insert({
            first_name: bk.first_name || 'Patient',
            last_name: bk.last_name || '',
            phone: bk.phone || '',
            age: bk.age ? Number(bk.age) : null,
            gender: bk.gender || null,
            is_active: true,
          })
          .select('id')
          .single();
        if (patErr || !newPatient) {
          results.errors.push(`Failed to create patient for ${bk.booking_id}: ${patErr?.message}`);
          continue;
        }
        emrPatientId = newPatient.id;
      }

      // Find doctor UUID
      let doctorId: string | null = null;
      const { data: doctors } = await db
        .from('users')
        .select('id')
        .eq('role', 'doctor')
        .eq('is_active', true)
        .limit(1);
      if (doctors && doctors.length > 0) doctorId = doctors[0].id;

      // Map clinic slug → EMR clinic UUID
      const clinicSlugMap: Record<string, string> = {
        'kcc-faridabad': 'kcc-faridabad',
        'kcc-saket': 'kcc-saket',
        'online': 'online',
        'online-intl': 'online-intl',
      };
      const emrClinicId = clinicSlugMap[bk.clinic_id] || bk.clinic_id;

      let clinicId: string | null = null;
      const { data: clinics } = await db
        .from('clinics')
        .select('id')
        .eq('is_active', true)
        .limit(5);
      if (clinics && clinics.length > 0) {
        const match = clinics.find((c: any) =>
          c.id === emrClinicId || c.slug === emrClinicId || c.name?.toLowerCase().includes(bk.clinic_id?.replace('kcc-', '') || '')
        );
        clinicId = match ? match.id : clinics[0].id;
      }

      if (!emrPatientId || !doctorId || !clinicId) {
        results.skippedDueToMissingData++;
        continue;
      }

      // Create the appointment
      const { error: apptErr } = await db.from('appointments').insert({
        patient_id: emrPatientId,
        doctor_id: doctorId,
        clinic_id: clinicId,
        appointment_date: bk.booking_date,
        appointment_time: bk.booking_time,
        type: bk.consultation_type === 'online' ? 'ONLINE' : 'WALK_IN',
        status: 'WAITING',
        reason: bk.reason || `Reconciled from booking: ${bk.booking_id}`,
        notes: `Booking ID: ${bk.booking_id}`,
        payment_status: 'PAID',
        amount: Number(bk.consultation_fee || 500),
        currency: bk.consultation_fee_currency || 'INR',
      });

      if (apptErr) {
        results.errors.push(`Failed to create appointment for ${bk.booking_id}: ${apptErr.message}`);
      } else {
        results.createdAppointments++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Reconciliation complete: ${results.createdAppointments} appointments created, ${results.alreadyHaveAppointments} already existed, ${results.skippedDueToMissingData} skipped`,
      ...results,
    });
  } catch (error) {
    console.error('[reconcile] Error:', error);
    return NextResponse.json({ error: 'Reconciliation failed' }, { status: 500 });
  }
}
