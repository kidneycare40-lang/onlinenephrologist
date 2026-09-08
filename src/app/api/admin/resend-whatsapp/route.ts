import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { sendDoctorAppointmentAlert, sendPatientAppointmentConfirmation, type AppointmentNotificationData } from '@/lib/whatsapp';

/**
 * POST /api/admin/resend-whatsapp
 * Body: { bookingId, target: 'doctor' | 'patient' }
 * 
 * Tries Meta Cloud API first. If it fails, returns wa.me URL
 * with ALL booking details + link to the website.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, target } = body;

    if (!bookingId || !target) {
      return NextResponse.json({ error: 'bookingId and target required' }, { status: 400 });
    }

    const db = getDb();

    const { data: bp } = await db
      .from('booking_payments')
      .select('*')
      .eq('booking_id', bookingId)
      .limit(1)
      .single();

    const { data: bk } = await db
      .from('bookings')
      .select('*')
      .eq('booking_id', bookingId)
      .limit(1)
      .single();

    const patientName = bp?.patient_name || (bk ? `${bk.first_name || ''} ${bk.last_name || ''}`.trim() : 'Patient');
    const patientPhone = bp?.patient_phone || bk?.phone || '';
    const consultType = bp?.consultation_type || bk?.consultation_type || 'online';
    const date = bk?.booking_date || '';
    const time = bk?.booking_time || '';
    const doctorName = bk?.doctor_name || 'Dr. Rajesh Goel';
    const clinicName = bk?.clinic_name || bk?.clinic_id || '';
    const amount = bp?.amount || bk?.consultation_fee || '';
    const currency = bp?.currency || bk?.consultation_fee_currency || 'INR';
    const email = bp?.patient_email || bk?.email || '';
    const age = bk?.age || '';
    const gender = bk?.gender || '';
    const reason = bk?.reason || '';
    const country = bp?.patient_country || bk?.country || '';
    const relationship = bk?.relationship || 'self';
    const paymentStatus = bp?.payment_status || bk?.payment_status || '';
    const razorpayId = bp?.razorpay_payment_id || bk?.payment_id || '';

    const typeLabel =
      consultType === 'online_intl' ? 'International Online Video' :
      consultType === 'online' ? 'Online Video' :
      consultType === 'hospital' ? 'Hospital Visit' : 'In-Clinic';

    const amountLabel = currency === 'USD' ? `$${amount}` : `₹${amount}`;
    const emrUrl = 'https://www.onlinenephrologist.com/emr/billing';

    const notifData: AppointmentNotificationData = {
      bookingId,
      patientName,
      doctorName,
      clinicName,
      date,
      time,
      consultationType: consultType,
      patientPhone,
    };

    // ─── DOCTOR ────────────────────────────────────────────────
    if (target === 'doctor') {
      const result = await sendDoctorAppointmentAlert(notifData);

      if (result.ok) {
        return NextResponse.json({ success: true, method: 'cloud_api', messageId: result.messageId });
      }

      const doctorPhone = process.env.WHATSAPP_DOCTOR_PHONE_NUMBER || '919818235613';
      const message = [
        `*NEW BOOKING — PAYMENT CONFIRMED*`,
        ``,
        `Booking ID: ${bookingId}`,
        `Patient: ${patientName}`,
        age || gender ? `Age/Gender: ${age}${age && gender ? '/' : ''}${gender}` : '',
        `Phone: ${patientPhone}`,
        email ? `Email: ${email}` : '',
        country ? `Country: ${country}` : '',
        relationship !== 'self' ? `Booked by: ${relationship}` : '',
        ``,
        `Type: ${typeLabel}`,
        `Doctor: ${doctorName}`,
        `Clinic: ${clinicName || 'Online'}`,
        `Date: ${date}`,
        `Time: ${time} IST`,
        ``,
        `Amount: ${amountLabel}`,
        `Payment: ${(paymentStatus || '').toUpperCase()}`,
        razorpayId ? `Razorpay ID: ${razorpayId}` : '',
        reason ? `Reason: ${reason}` : '',
        ``,
        `View all details in EMR:`,
        emrUrl,
      ].filter(Boolean).join('\n');

      const waMeUrl = `https://wa.me/${doctorPhone}?text=${encodeURIComponent(message)}`;

      return NextResponse.json({
        success: false,
        method: 'wa_me_fallback',
        waMeUrl,
        error: result.error,
        message: 'Cloud API failed. Use this link to send via WhatsApp.',
      });
    }

    // ─── PATIENT ───────────────────────────────────────────────
    if (target === 'patient' && patientPhone) {
      const result = await sendPatientAppointmentConfirmation(notifData);

      if (result.ok) {
        return NextResponse.json({ success: true, method: 'cloud_api', messageId: result.messageId });
      }

      const cleanPhone = patientPhone.replace(/\D/g, '');
      const message = [
        `Dear ${patientName},`,
        ``,
        `Your appointment is confirmed!`,
        ``,
        `Booking ID: ${bookingId}`,
        `Doctor: ${doctorName}`,
        `Type: ${typeLabel}`,
        `Date: ${date}`,
        `Time: ${time} IST`,
        `Amount Paid: ${amountLabel}`,
        ``,
        `View your booking:`,
        emrUrl,
        ``,
        `For queries, reply to this message.`,
      ].filter(Boolean).join('\n');

      const waMeUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

      return NextResponse.json({
        success: false,
        method: 'wa_me_fallback',
        waMeUrl,
        error: result.error,
        message: 'Cloud API failed. Use this link to send via WhatsApp.',
      });
    }

    return NextResponse.json({ error: 'Invalid target or missing patient phone' }, { status: 400 });
  } catch (error) {
    console.error('[resend-whatsapp] Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
