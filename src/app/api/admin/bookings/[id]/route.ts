import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { authenticateRequest, requirePermission, applyRateLimit, apiError } from '@/lib/auth/middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rlError = applyRateLimit(request, 'api');
    if (rlError) return rlError;

    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const permError = requirePermission(user, 'billing', 'view');
    if (permError) return permError;

    const { id: bookingId } = await params;
    if (!bookingId) return apiError('Booking ID is required', 400);

    const db = getDb();

    // 1. Fetch the booking
    const { data: booking, error: bookingError } = await db
      .from('bookings')
      .select('*')
      .eq('booking_id', bookingId)
      .limit(1)
      .single();

    if (bookingError || !booking) {
      return apiError('Booking not found', 404);
    }

    // 2. Fetch the actual EMR patient (if linked)
    let emrPatient = null;
    if (booking.actual_patient_id) {
      const { data } = await db
        .from('patients')
        .select('id, uhid, first_name, last_name, phone, email, date_of_birth, gender, is_active, is_chronic, is_international, country_code, created_at')
        .eq('id', booking.actual_patient_id)
        .limit(1)
        .single();
      emrPatient = data;
    }

    // 3. Fetch the booker (patient account who made the booking)
    let booker = null;
    if (booking.booked_by_patient_account_id) {
      const { data } = await db
        .from('patient_accounts')
        .select('id, email, first_name, last_name, phone, date_of_birth, gender, country, timezone, created_at')
        .eq('id', booking.booked_by_patient_account_id)
        .limit(1)
        .single();
      booker = data;
    }

    // 4. Fetch notification logs for this booking
    const { data: notifications } = await db
      .from('notification_log')
      .select('id, notification_type, recipient, status, provider_message_id, error, sent_at, created_at')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true });

    // 5. Fetch the Razorpay payment record for this booking
    let paymentRecord = null;
    {
      const { data } = await db
        .from('booking_payments')
        .select('id, booking_id, patient_name, patient_phone, patient_country, amount, currency, razorpay_order_id, razorpay_payment_id, payment_status, consultation_type, created_at')
        .eq('booking_id', bookingId)
        .limit(1)
        .maybeSingle?.() ?? { data: null };
      paymentRecord = data;
    }

    return NextResponse.json({
      booking: {
        bookingId: booking.booking_id,
        firstName: booking.first_name,
        lastName: booking.last_name,
        phone: booking.phone,
        email: booking.email,
        age: booking.age,
        gender: booking.gender,
        currentLocation: booking.current_location,
        country: booking.country,
        timezone: booking.timezone,
        preferredLanguage: booking.preferred_language,
        interpreterRequired: booking.interpreter_required,
        consultationType: booking.consultation_type,
        clinicId: booking.clinic_id,
        bookingDate: booking.booking_date,
        bookingTime: booking.booking_time,
        reason: booking.reason,
        complaints: booking.complaints,
        currentMedications: booking.current_medications,
        notes: booking.notes,
        previousKidneyIssue: booking.previous_kidney_issue,
        reportFiles: booking.report_files,
        ultrasoundFile: booking.ultrasound_file,
        consultationFee: booking.consultation_fee,
        consultationFeeCurrency: booking.consultation_fee_currency,
        paymentStatus: booking.payment_status,
        paymentId: booking.payment_id,
        razorpayOrderId: booking.razorpay_order_id,
        doctorName: booking.doctor_name,
        status: booking.status,
        relationship: booking.relationship,
        createdAt: booking.created_at,
        updatedAt: booking.updated_at,
      },
      emrPatient: emrPatient ? {
        id: emrPatient.id,
        uhid: emrPatient.uhid,
        firstName: emrPatient.first_name,
        lastName: emrPatient.last_name,
        phone: emrPatient.phone,
        email: emrPatient.email,
        dateOfBirth: emrPatient.date_of_birth,
        gender: emrPatient.gender,
        isActive: emrPatient.is_active,
        isChronic: emrPatient.is_chronic,
        isInternational: emrPatient.is_international,
        countryCode: emrPatient.country_code,
        createdAt: emrPatient.created_at,
      } : null,
      booker: booker ? {
        id: booker.id,
        email: booker.email,
        firstName: booker.first_name,
        lastName: booker.last_name,
        phone: booker.phone,
        dateOfBirth: booker.date_of_birth,
        gender: booker.gender,
        country: booker.country,
        timezone: booker.timezone,
        createdAt: booker.created_at,
      } : null,
      notifications: (notifications || []).map((n: any) => ({
        id: n.id,
        type: n.notification_type,
        recipient: n.recipient,
        status: n.status,
        providerMessageId: n.provider_message_id,
        error: n.error,
        sentAt: n.sent_at,
        createdAt: n.created_at,
      })),
      paymentRecord: paymentRecord ? {
        id: paymentRecord.id,
        bookingId: paymentRecord.booking_id,
        patientName: paymentRecord.patient_name,
        patientPhone: paymentRecord.patient_phone,
        patientCountry: paymentRecord.patient_country,
        amount: paymentRecord.amount,
        currency: paymentRecord.currency,
        razorpayOrderId: paymentRecord.razorpay_order_id,
        razorpayPaymentId: paymentRecord.razorpay_payment_id,
        paymentStatus: paymentRecord.payment_status,
        consultationType: paymentRecord.consultation_type,
        createdAt: paymentRecord.created_at,
      } : null,
    });
  } catch (error) {
    console.error('GET /api/admin/bookings/[id] error:', error);
    return apiError('Internal server error', 500);
  }
}
