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

    // Find all PAID bookings
    const { data: paidBookings, error: fetchErr } = await db
      .from('bookings')
      .select('booking_id, actual_patient_id, patient_account_id, phone, first_name, last_name, age, gender, consultation_type, clinic_id, booking_date, booking_time, reason, doctor_name, consultation_fee, consultation_fee_currency, status')
      .eq('payment_status', 'paid')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (fetchErr) {
      return NextResponse.json({ error: 'Failed to fetch bookings', detail: fetchErr.message }, { status: 500 });
    }

    const results = {
      totalPaidBookings: paidBookings?.length || 0,
      alreadyHaveAppointments: 0,
      missingAppointments: 0,
      createdAppointments: 0,
      skippedDueToMissingData: 0,
      errors: [] as string[],
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
        results.alreadyHaveAppointments++;
        continue;
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
