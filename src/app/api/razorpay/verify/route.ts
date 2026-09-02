import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import Razorpay from 'razorpay';
import { getDb } from '@/lib/db/client';
import { applyRateLimit, apiError } from '@/lib/auth/middleware';
import { autoCreateBookingInvoice } from '@/lib/auto-invoice';
import { autoBridgeFromBooking, createFollowUpEntitlement } from '@/lib/patient-portal-server';
import { sendBookingNotifications } from '@/lib/notifications';
import { notifyPaymentReceived } from '@/lib/emr-notifications';

function getRazorpay(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function POST(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'booking');
    if (rlError) return rlError;

    const body = await request.json();
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!bookingId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return apiError('Missing payment verification data', 400);
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return apiError('Razorpay is not configured. Contact the clinic.', 503);
    }

    // Server-side signature verification (timing-safe to prevent timing attacks)
    const expected = createHmac('sha256', secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const sigBuf = Buffer.from(razorpaySignature, 'hex');
    const expectedBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return apiError('Invalid payment signature', 400);
    }

    const db = getDb();

    // Idempotency: check if already processed
    const { data: existing } = await db
      .from('booking_payments')
      .select('*')
      .eq('booking_id', bookingId)
      .eq('razorpay_payment_id', razorpayPaymentId)
      .limit(1);

    if (existing && existing.length > 0 && existing[0].payment_status === 'CAPTURED') {
      return NextResponse.json({ success: true, alreadyProcessed: true });
    }

    // Try to update existing record
    let paymentData: any = null;

    const { data: updated } = await db
      .from('booking_payments')
      .update({
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        payment_status: 'CAPTURED',
        updated_at: new Date().toISOString(),
      })
      .eq('booking_id', bookingId)
      .select()
      .single();

    if (updated) {
      paymentData = updated;
    } else {
      // Record missing — fetch from Razorpay and create it (self-healing)
      console.error('[verify] No booking_payments record for', bookingId, '— fetching from Razorpay');
      const rzp = getRazorpay();
      if (rzp) {
        try {
          const order = await rzp.orders.fetch(razorpayOrderId);
          const notes = order.notes || {};
          const { error: insertErr } = await db.from('booking_payments').insert({
            booking_id: bookingId,
            patient_name: notes.patient_name || 'Patient',
            patient_phone: null,
            patient_email: null,
            patient_country: notes.patient_country || null,
            consultation_type: notes.consultation_type || null,
            amount: Number(order.amount || 0) / 100,
            currency: order.currency || 'INR',
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature,
            payment_status: 'CAPTURED',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          if (insertErr) {
            console.error('[verify] Failed to create missing payment record:', insertErr);
            return apiError('Failed to store payment record', 500);
          }
          // Re-read the created record
          const { data: created } = await db
            .from('booking_payments')
            .select('*')
            .eq('booking_id', bookingId)
            .eq('razorpay_payment_id', razorpayPaymentId)
            .limit(1)
            .single();
          paymentData = created;
        } catch (rzpErr) {
          console.error('[verify] Failed to fetch order from Razorpay:', rzpErr);
          return apiError('Failed to recover payment record', 500);
        }
      }
    }

    if (!paymentData) {
      return apiError('Payment record could not be created', 500);
    }

    // Also confirm the booking in the bookings table (with retry for race condition)
    let bookingUpdated = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data: updatedBooking } = await db
        .from('bookings')
        .update({
          status: 'confirmed',
          payment_status: 'paid',
          payment_id: razorpayPaymentId,
          razorpay_order_id: razorpayOrderId,
          updated_at: new Date().toISOString(),
        })
        .eq('booking_id', bookingId)
        .select('id')
        .single();
      if (updatedBooking) {
        bookingUpdated = true;
        break;
      }
      // Wait 1s for booking creation to complete
      await new Promise(r => setTimeout(r, 1000));
    }
    if (!bookingUpdated) {
      console.error('[verify] Booking', bookingId, 'not found after 3 attempts — payment may be orphaned');
    }

    // ─── AUTO-CREATE APPOINTMENT FROM BOOKING ───────────────────────
    // Bridge bookings → appointments so they show in EMR dashboard/calendar
    try {
      const { data: bk } = await db
        .from('bookings')
        .select('actual_patient_id, patient_account_id, phone, first_name, last_name, age, gender, consultation_type, clinic_id, booking_date, booking_time, reason, doctor_name')
        .eq('booking_id', bookingId)
        .maybeSingle();

      if (bk && bk.booking_date && bk.booking_time && bk.clinic_id) {
        // Find or create EMR patient
        let emrPatientId = bk.actual_patient_id;
        if (!emrPatientId && bk.patient_account_id) {
          // Try bridge lookup
          const { data: bridge } = await db
            .from('patient_account_emr_patients')
            .select('emr_patient_id')
            .eq('patient_account_id', bk.patient_account_id)
            .limit(1);
          if (bridge && bridge.length > 0) emrPatientId = bridge[0].emr_patient_id;
        }
        if (!emrPatientId && bk.phone) {
          // Try find patient by phone
          const cleanPhone = bk.phone.replace(/\D/g, '');
          const { data: byPhone } = await db
            .from('patients')
            .select('id')
            .or(`phone.eq.${cleanPhone},phone.eq.${bk.phone}`)
            .eq('is_deleted', false)
            .limit(1);
          if (byPhone && byPhone.length > 0) emrPatientId = byPhone[0].id;
        }

        // Find doctor UUID — default to first active doctor
        let doctorId: string | null = null;
        const { data: doctors } = await db
          .from('users')
          .select('id')
          .eq('role', 'doctor')
          .eq('is_active', true)
          .limit(1);
        if (doctors && doctors.length > 0) doctorId = doctors[0].id;

        // Map booking clinic_id slug → EMR clinic UUID
        const clinicSlugMap: Record<string, string> = {
          'kcc-faridabad': 'kcc-faridabad',
          'kcc-saket': 'kcc-saket',
          'online': 'online',
          'online-intl': 'online-intl',
        };
        const emrClinicId = clinicSlugMap[bk.clinic_id] || bk.clinic_id;

        // Find clinic UUID
        let clinicId: string | null = null;
        const { data: clinics } = await db
          .from('clinics')
          .select('id')
          .eq('is_active', true)
          .limit(5);
        if (clinics && clinics.length > 0) {
          // Match by slug or name
          const match = clinics.find((c: any) =>
            c.id === emrClinicId || c.slug === emrClinicId || c.name?.toLowerCase().includes(bk.clinic_id?.replace('kcc-', '') || '')
          );
          clinicId = match ? match.id : clinics[0].id;
        }

        if (emrPatientId && doctorId && clinicId) {
          // Check if appointment already exists for this slot
          const { data: existingAppt } = await db
            .from('appointments')
            .select('id')
            .eq('doctor_id', doctorId)
            .eq('appointment_date', bk.booking_date)
            .eq('appointment_time', bk.booking_time)
            .eq('is_deleted', false)
            .limit(1);

          if (!existingAppt || existingAppt.length === 0) {
            const { error: apptErr } = await db.from('appointments').insert({
              patient_id: emrPatientId,
              doctor_id: doctorId,
              clinic_id: clinicId,
              appointment_date: bk.booking_date,
              appointment_time: bk.booking_time,
              type: bk.consultation_type === 'online' ? 'ONLINE' : 'WALK_IN',
              status: 'WAITING',
              reason: bk.reason || `Online booking: ${bookingId}`,
              notes: `Booking ID: ${bookingId}`,
              payment_status: 'PAID',
              amount: paymentData?.amount || 500,
              currency: paymentData?.currency || 'INR',
            });
            if (apptErr) {
              console.error('[verify] Failed to create appointment from booking:', apptErr);
            } else {
              console.log(`[verify] Appointment created for booking ${bookingId} on ${bk.booking_date} ${bk.booking_time}`);
            }
          }
        } else {
          console.log(`[verify] Skipping appointment creation — patientId=${emrPatientId}, doctorId=${doctorId}, clinicId=${clinicId}`);
        }
      }
    } catch (apptBridgeErr) {
      console.error('[verify] Auto-create appointment error:', apptBridgeErr);
    }

    // Auto-create EMR bridge and follow-up entitlement for online consultations
    try {
      const { data: booking } = await db
        .from('bookings')
        .select('patient_account_id, phone, consultation_type')
        .eq('booking_id', bookingId)
        .maybeSingle();

      if (booking?.patient_account_id) {
        // Bridge patient_account → EMR patient
        await autoBridgeFromBooking(booking.patient_account_id, booking.phone || '');

        // Create follow-up entitlement for eligible online consultations
        const consultType = booking.consultation_type;
        if (consultType === 'online' || consultType === 'online_intl') {
          await createFollowUpEntitlement(
            booking.patient_account_id,
            bookingId,
            razorpayPaymentId,
            consultType
          );
        }
      }
    } catch (portalErr) {
      console.error('[verify] Portal bridge/entitlement error:', portalErr);
      // Non-blocking — booking is still confirmed
    }

    // Auto-generate invoice + payment record in EMR billing
    try {
      await autoCreateBookingInvoice({
        bookingId,
        patientName: paymentData.patient_name || 'Patient',
        patientPhone: paymentData.patient_phone || '',
        patientEmail: paymentData.patient_email || undefined,
        clinicId: paymentData.consultation_type || 'online',
        consultationType: paymentData.consultation_type || 'online',
        consultationFee: paymentData.amount || 0,
        currency: paymentData.currency || 'INR',
        paymentMethod: 'Razorpay',
        transactionId: razorpayPaymentId,
        orderId: razorpayOrderId,
        paymentStatus: 'COMPLETED',
      });
    } catch (invErr) {
      console.error('[verify] Auto-invoice error:', invErr);
    }

    // Send notifications (idempotent — deduplication via notification_log)
    try {
      const { data: fullBooking } = await db
        .from('bookings')
        .select('*')
        .eq('booking_id', bookingId)
        .limit(1)
        .single();

      if (fullBooking) {
        let bookedByPatientName: string | undefined;
        if (fullBooking.booked_by_patient_account_id && fullBooking.relationship && fullBooking.relationship !== 'self') {
          try {
            const { data: bookerAcct } = await db
              .from('patient_accounts')
              .select('first_name, last_name')
              .eq('id', fullBooking.booked_by_patient_account_id)
              .limit(1)
              .single();
            if (bookerAcct) {
              bookedByPatientName = `${bookerAcct.first_name || ''} ${bookerAcct.last_name || ''}`.trim() || undefined;
            }
          } catch {}
        }

        await sendBookingNotifications({
          bookingId,
          clinicName: fullBooking.clinic_name || fullBooking.clinic_id || '',
          patientName: fullBooking.patient_name || `${fullBooking.first_name || ''} ${fullBooking.last_name || ''}`.trim(),
          patientPhone: fullBooking.patient_phone || fullBooking.phone || '',
          patientEmail: fullBooking.patient_email || fullBooking.email || undefined,
          ageGender: `${fullBooking.age || ''} / ${fullBooking.gender || ''}`,
          age: fullBooking.age || undefined,
          gender: fullBooking.gender || undefined,
          date: fullBooking.booking_date || fullBooking.date || '',
          time: fullBooking.booking_time || fullBooking.time || '',
          consultationType: fullBooking.consultation_type || '',
          reason: fullBooking.reason || '',
          fee: fullBooking.fee || '',
          paymentId: razorpayPaymentId || undefined,
          country: fullBooking.country || undefined,
          timezone: fullBooking.timezone || undefined,
          complaints: fullBooking.complaints || undefined,
          medicines: fullBooking.medicines || fullBooking.current_medications || undefined,
          notes: fullBooking.notes || undefined,
          relationship: fullBooking.relationship || undefined,
          bookedByPatientName,
          doctorName: fullBooking.doctor_name || undefined,
          reportsUploaded: !!(fullBooking.report_files && (Array.isArray(fullBooking.report_files) ? fullBooking.report_files.length : true)),
          ultrasoundUploaded: !!fullBooking.ultrasound_file,
        });
      }
    } catch (notifyErr) {
      console.error('[verify] Notification error:', notifyErr);
    }

    // EMR in-app notification (non-blocking)
    try {
      const { data: bk } = await db
        .from('bookings')
        .select('first_name, last_name, phone, consultation_fee, consultation_fee_currency, clinic_id')
        .eq('booking_id', bookingId)
        .maybeSingle();
      if (bk) {
        await notifyPaymentReceived({
          bookingId,
          firstName: bk.first_name || 'Patient',
          lastName: bk.last_name,
          phone: bk.phone || '',
          amount: Number(bk.consultation_fee || paymentData?.amount || 0),
          currency: bk.consultation_fee_currency || paymentData?.currency || 'INR',
          paymentId: razorpayPaymentId,
          clinicId: bk.clinic_id,
        });
      }
    } catch (err) {
      console.error('[verify] EMR notification error:', err);
    }

    return NextResponse.json({ success: true, payment: paymentData });
  } catch (error) {
    console.error('VERIFY error:', error);
    const detail = error instanceof Error ? error.message : String(error);
    return apiError('Payment verification failed', 500, { detail });
  }
}
