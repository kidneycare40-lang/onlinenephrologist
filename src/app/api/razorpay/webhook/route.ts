import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { getDb } from '@/lib/db/client';
import { sendBookingNotifications } from '@/lib/notifications';
import { autoCreateBookingInvoice } from '@/lib/auto-invoice';
import { autoBridgeFromBooking, createFollowUpEntitlement } from '@/lib/patient-portal-server';

const STATUS_MAP: Record<string, string> = {
  'order.paid': 'CAPTURED',
  'payment.captured': 'CAPTURED',
  'payment.failed': 'FAILED',
  'refund.created': 'REFUNDED',
};

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature using RAZORPAY_WEBHOOK_SECRET
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
    }

    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const expected = createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
    const sigBuf = Buffer.from(signature, 'hex');
    const expectedBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventName: string = event.event || '';

    if (!(eventName in STATUS_MAP)) {
      // Acknowledge unknown events without processing
      return NextResponse.json({ received: true });
    }

    const payload = event.payload || {};
    const paymentEntity = payload.payment?.entity;
    const orderEntity = payload.order?.entity;

    const razorpayPaymentId = paymentEntity?.id || null;
    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id || null;
    const bookingId =
      paymentEntity?.notes?.booking_id ||
      orderEntity?.notes?.booking_id ||
      orderEntity?.receipt ||
      null;

    if (!bookingId || !razorpayOrderId) {
      return NextResponse.json({ received: true });
    }

    const db = getDb();
    const newStatus = STATUS_MAP[eventName];

    // Idempotency: if the payment is already in the target state, skip
    const { data: existing } = await db
      .from('booking_payments')
      .select('payment_status, razorpay_payment_id')
      .eq('booking_id', bookingId)
      .limit(1);

    if (existing && existing.length > 0) {
      const rec = existing[0];
      if (rec.payment_status === newStatus && (rec.razorpay_payment_id === razorpayPaymentId || eventName === 'refund.created')) {
        return NextResponse.json({ received: true, idempotent: true });
      }
    }

    if (existing && existing.length > 0) {
      await db
        .from('booking_payments')
        .update({
          payment_status: newStatus,
          razorpay_order_id: razorpayOrderId || (existing[0] as any).razorpay_order_id,
          razorpay_payment_id: razorpayPaymentId || (existing[0] as any).razorpay_payment_id,
          updated_at: new Date().toISOString(),
        })
        .eq('booking_id', bookingId);
    } else {
      await db.from('booking_payments').insert({
        booking_id: bookingId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        payment_status: newStatus,
        updated_at: new Date().toISOString(),
      });
    }

    // Keep the bookings table payment status in sync
    const bookingPaymentStatus = newStatus === 'CAPTURED' ? 'paid' : newStatus === 'FAILED' ? 'unpaid' : 'pending';
    const bookingUpdate: any = {
      payment_status: bookingPaymentStatus,
      payment_id: razorpayPaymentId || null,
      razorpay_order_id: razorpayOrderId || null,
      updated_at: new Date().toISOString(),
    };
    // Auto-confirm appointment when payment is captured
    if (newStatus === 'CAPTURED') {
      bookingUpdate.status = 'confirmed';
    }
    await db
      .from('bookings')
      .update(bookingUpdate)
      .eq('booking_id', bookingId);

    // ─── AUTO-CREATE APPOINTMENT FROM BOOKING ───────────────────────
    // Bridge bookings → appointments so they show in EMR dashboard/calendar
    if (newStatus === 'CAPTURED') {
      try {
        const { data: bk } = await db
          .from('bookings')
          .select('actual_patient_id, patient_account_id, phone, first_name, last_name, age, gender, consultation_type, clinic_id, booking_date, booking_time, reason, doctor_name, consultation_fee, consultation_fee_currency')
          .eq('booking_id', bookingId)
          .maybeSingle();

        if (bk && bk.booking_date && bk.booking_time && bk.clinic_id) {
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

          if (emrPatientId && doctorId && clinicId) {
            // Idempotent: check if appointment already exists
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
                amount: Number(bk.consultation_fee || 500),
                currency: bk.consultation_fee_currency || 'INR',
              });
              if (apptErr) {
                console.error('[webhook] Failed to create appointment from booking:', apptErr);
              } else {
                console.log(`[webhook] Appointment created for booking ${bookingId} on ${bk.booking_date} ${bk.booking_time}`);
              }
            } else {
              console.log(`[webhook] Appointment already exists for booking ${bookingId} — skipping`);
            }
          } else {
            console.log(`[webhook] Skipping appointment creation — patientId=${emrPatientId}, doctorId=${doctorId}, clinicId=${clinicId}`);
          }
        }
      } catch (apptBridgeErr) {
        console.error('[webhook] Auto-create appointment error:', apptBridgeErr);
      }
    }

    // Send WhatsApp + email notifications (non-blocking, best-effort)
    if (newStatus === 'CAPTURED') {
      // Fetch booking data for invoice + WhatsApp
      let booking: any = null;
      try {
        const result = await db
          .from('bookings')
          .select('*')
          .eq('booking_id', bookingId)
          .limit(1)
          .single();
        booking = result.data;
      } catch {}

      // Auto-generate invoice + payment record in EMR billing
      try {
        await autoCreateBookingInvoice({
          bookingId,
          patientName: booking?.patient_name || booking?.first_name || 'Patient',
          patientPhone: booking?.patient_phone || booking?.phone || '',
          patientEmail: booking?.patient_email || booking?.email || undefined,
          clinicId: booking?.clinic_id || booking?.consultation_type || 'online',
          consultationType: booking?.consultation_type || 'online',
          consultationFee: booking?.consultation_fee || booking?.amount || 0,
          currency: booking?.consultation_fee_currency || 'INR',
          paymentMethod: 'Razorpay',
          transactionId: razorpayPaymentId || undefined,
          orderId: razorpayOrderId || undefined,
          paymentStatus: 'COMPLETED',
        });
      } catch (invErr) {
        console.error('[webhook] Auto-invoice error:', invErr);
      }

      // Auto-create EMR bridge and follow-up entitlement for online consultations
      try {
        if (booking?.patient_account_id) {
          await autoBridgeFromBooking(booking.patient_account_id, booking.phone || '');
          const consultType = booking.consultation_type;
          if (consultType === 'online' || consultType === 'online_intl') {
            await createFollowUpEntitlement(
              booking.patient_account_id,
              bookingId,
              razorpayPaymentId || null,
              consultType
            );
          }
        }
      } catch (portalErr) {
        console.error('[webhook] Portal bridge/entitlement error:', portalErr);
      }

      if (booking) {
        try {
          let bookedByPatientName: string | undefined;
          if (booking.booked_by_patient_account_id && booking.relationship && booking.relationship !== 'self') {
            try {
              const { data: bookerAcct } = await db
                .from('patient_accounts')
                .select('first_name, last_name')
                .eq('id', booking.booked_by_patient_account_id)
                .limit(1)
                .single();
              if (bookerAcct) {
                bookedByPatientName = `${bookerAcct.first_name || ''} ${bookerAcct.last_name || ''}`.trim() || undefined;
              }
            } catch {}
          }

          await sendBookingNotifications({
            bookingId: booking.booking_id || bookingId,
            clinicName: booking.clinic_name || booking.clinic_id || '',
            patientName: booking.patient_name || `${booking.first_name || ''} ${booking.last_name || ''}`.trim(),
            patientPhone: booking.patient_phone || booking.phone || '',
            patientEmail: booking.patient_email || booking.email || undefined,
            ageGender: `${booking.age || ''} / ${booking.gender || ''}`,
            age: booking.age || undefined,
            gender: booking.gender || undefined,
            date: booking.booking_date || booking.date || '',
            time: booking.booking_time || booking.time || '',
            consultationType: booking.consultation_type || '',
            reason: booking.reason || '',
            fee: booking.fee || '',
            paymentId: razorpayPaymentId || undefined,
            country: booking.country || undefined,
            timezone: booking.timezone || undefined,
            complaints: booking.complaints || undefined,
            medicines: booking.medicines || booking.current_medications || undefined,
            notes: booking.notes || undefined,
            relationship: booking.relationship || undefined,
            bookedByPatientName,
            doctorName: booking.doctor_name || undefined,
            reportsUploaded: !!(booking.report_files && (Array.isArray(booking.report_files) ? booking.report_files.length : true)),
            ultrasoundUploaded: !!booking.ultrasound_file,
          });
        } catch (notifyErr) {
          console.error('[webhook] Notification error:', notifyErr);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('WEBHOOK error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}