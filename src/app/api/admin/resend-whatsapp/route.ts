import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { sendDoctorAppointmentAlert, sendPatientAppointmentConfirmation, type AppointmentNotificationData } from '@/lib/whatsapp';

/**
 * POST /api/admin/resend-whatsapp
 * Body: { bookingId, target: 'doctor' | 'patient' }
 * 
 * Tries Cloud API first. If it fails, returns wa.me fallback URL.
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
      .select('booking_id, patient_name, patient_phone, consultation_type, amount, currency')
      .eq('booking_id', bookingId)
      .limit(1)
      .single();

    const { data: bk } = await db
      .from('bookings')
      .select('booking_id, first_name, last_name, phone, booking_date, booking_time, consultation_type, doctor_name, clinic_id, clinic_name')
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

    const typeLabel =
      consultType === 'online_intl' ? 'International Online Video' :
      consultType === 'online' ? 'Online Video' :
      consultType === 'hospital' ? 'Hospital Visit' : 'In-Clinic';

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

    if (target === 'doctor') {
      const result = await sendDoctorAppointmentAlert(notifData);

      if (result.ok) {
        return NextResponse.json({ success: true, method: 'cloud_api', messageId: result.messageId });
      }

      const doctorPhone = process.env.WHATSAPP_DOCTOR_PHONE_NUMBER || '919818235613';
      const message = encodeURIComponent(
        `*NEW APPOINTMENT — PAYMENT CONFIRMED*\n\nBooking: ${bookingId}\nPatient: ${patientName}\nType: ${typeLabel}\nDate: ${date}\nTime: ${time} IST\nPhone: ${patientPhone}\n\nCheck EMR for details.`
      );
      const waMeUrl = `https://wa.me/${doctorPhone}?text=${message}`;

      return NextResponse.json({
        success: false,
        method: 'wa_me_fallback',
        waMeUrl,
        error: result.error,
        message: 'Cloud API failed. Use this link to send via WhatsApp.',
      });
    }

    if (target === 'patient' && patientPhone) {
      const result = await sendPatientAppointmentConfirmation(notifData);

      if (result.ok) {
        return NextResponse.json({ success: true, method: 'cloud_api', messageId: result.messageId });
      }

      const cleanPhone = patientPhone.replace(/\D/g, '');
      const message = encodeURIComponent(
        `Dear ${patientName},\n\nYour appointment with ${doctorName} is confirmed!\n\nBooking: ${bookingId}\nDate: ${date}\nTime: ${time} IST\nType: ${typeLabel}\n\nPlease check your email for details.`
      );
      const waMeUrl = `https://wa.me/${cleanPhone}?text=${message}`;

      return NextResponse.json({
        success: false,
        method: 'wa_me_fallback',
        waMeUrl,
        error: result.error,
        message: 'Cloud API failed. Use this link to send via WhatsApp.',
      });
    }

    return NextResponse.json({ error: 'Invalid target' }, { status: 400 });
  } catch (error) {
    console.error('[resend-whatsapp] Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
