// One-time script: Create appointments from existing confirmed bookings
// that were never bridged to the appointments table.
// Run: npx tsx scripts/fix-existing-bookings.ts

import { getDb } from '../src/lib/db/client';

async function main() {
  const db = getDb();

  // Find confirmed bookings with no matching appointment
  const { data: bookings, error } = await db
    .from('bookings')
    .select('booking_id, actual_patient_id, patient_account_id, phone, first_name, last_name, age, gender, consultation_type, clinic_id, booking_date, booking_time, reason, payment_status')
    .eq('status', 'confirmed')
    .eq('payment_status', 'paid')
    .gte('booking_date', '2026-09-01');

  if (error || !bookings) {
    console.error('Failed to fetch bookings:', error);
    return;
  }

  console.log(`Found ${bookings.length} confirmed bookings to check`);

  // Find doctor
  const { data: doctors } = await db.from('users').select('id').eq('role', 'doctor').eq('is_active', true).limit(1);
  if (!doctors || doctors.length === 0) {
    console.error('No active doctor found');
    return;
  }
  const doctorId = doctors[0].id;

  // Find clinics
  const { data: clinics } = await db.from('clinics').select('id, name').eq('is_active', true);
  const clinicList = clinics || [];

  for (const bk of bookings) {
    // Find EMR patient
    let emrPatientId = bk.actual_patient_id;
    if (!emrPatientId && bk.phone) {
      const cleanPhone = bk.phone.replace(/\D/g, '');
      const { data: byPhone } = await db.from('patients').select('id').or(`phone.eq.${cleanPhone},phone.eq.${bk.phone}`).eq('is_deleted', false).limit(1);
      if (byPhone && byPhone.length > 0) emrPatientId = byPhone[0].id;
    }

    if (!emrPatientId) {
      console.log(`  SKIP ${bk.booking_id} — no EMR patient found for phone ${bk.phone}`);
      continue;
    }

    // Map clinic slug → UUID
    let clinicId: string | null = null;
    const slug = bk.clinic_id || 'kcc-faridabad';
    const match = clinicList.find((c: any) => c.id === slug || c.name?.toLowerCase().includes(slug.replace('kcc-', '')));
    clinicId = match ? match.id : (clinicList[0]?.id || null);

    if (!clinicId) {
      console.log(`  SKIP ${bk.booking_id} — no clinic found for ${slug}`);
      continue;
    }

    // Check if appointment already exists
    const { data: existing } = await db
      .from('appointments')
      .select('id')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', bk.booking_date)
      .eq('appointment_time', bk.booking_time)
      .eq('is_deleted', false)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`  SKIP ${bk.booking_id} — appointment already exists`);
      continue;
    }

    // Create appointment
    const { error: apptErr } = await db.from('appointments').insert({
      patient_id: emrPatientId,
      doctor_id: doctorId,
      clinic_id: clinicId,
      appointment_date: bk.booking_date,
      appointment_time: bk.booking_time,
      type: bk.consultation_type === 'online' ? 'ONLINE' : 'WALK_IN',
      status: 'SCHEDULED',
      reason: bk.reason || `Online booking: ${bk.booking_id}`,
      notes: `Booking ID: ${bk.booking_id}`,
      payment_status: 'PAID',
      amount: 500,
      currency: 'INR',
    });

    if (apptErr) {
      console.error(`  ERROR ${bk.booking_id}:`, apptErr.message);
    } else {
      console.log(`  CREATED appointment for ${bk.first_name} ${bk.last_name} on ${bk.booking_date} ${bk.booking_time} (${bk.booking_id})`);
    }
  }

  console.log('Done');
}

main().catch(console.error);
