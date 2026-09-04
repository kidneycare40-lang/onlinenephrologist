import { getDb } from '@/lib/db/client';
import { DOCTOR_PHONES, buildDoctorMessage, type BookingNotification } from '@/lib/whatsapp-notify';
import { sendBookingConfirmationEmail, sendTeamBookingEmail } from '@/lib/email';
import {
  sendWhatsAppTextMessage,
  sendPatientAppointmentConfirmation,
  sendDoctorAppointmentAlert,
  type AppointmentNotificationData,
} from '@/lib/whatsapp';

const CALLMEBOT_API_URL = 'https://api.callmebot.com/whatsapp.php';

/**
 * Claim a notification slot. Returns true if this caller won the race.
 * Uses INSERT with unique constraint + ON CONFLICT DO NOTHING so only
 * one concurrent request can claim each (booking, type, recipient).
 * If a previous attempt failed, allows retry by resetting status.
 */
async function claimNotification(
  bookingId: string,
  notificationType: string,
  recipient: string
): Promise<boolean> {
  const db = getDb();

  // Try to insert a new claim
  const { error } = await db
    .from('notification_log')
    .insert({
      booking_id: bookingId,
      notification_type: notificationType,
      recipient,
      status: 'sending',
    })
    .select()
    .single();

  if (!error) return true; // Won the race

  // Unique constraint violation — check if we can retry a failed attempt
  if (error.code === '23505') {
    const { data: existing } = await db
      .from('notification_log')
      .select('status')
      .eq('booking_id', bookingId)
      .eq('notification_type', notificationType)
      .eq('recipient', recipient)
      .limit(1)
      .single();

    if (existing && (existing.status === 'failed' || existing.status === 'sending')) {
      // Reset to 'sending' so this caller can retry
      await db
        .from('notification_log')
        .update({ status: 'sending', error: null, provider_message_id: null })
        .eq('booking_id', bookingId)
        .eq('notification_type', notificationType)
        .eq('recipient', recipient);
      return true;
    }
    return false; // Already sent or being sent by another request
  }

  console.error('[notifications] claim error:', error);
  return false;
}

async function updateNotificationStatus(
  bookingId: string,
  notificationType: string,
  recipient: string,
  status: 'sent' | 'failed',
  providerMessageId?: string,
  error?: string
): Promise<void> {
  const db = getDb();
  await db
    .from('notification_log')
    .update({
      status,
      provider_message_id: providerMessageId || null,
      error: error || null,
      sent_at: status === 'sent' ? new Date().toISOString() : null,
    })
    .eq('booking_id', bookingId)
    .eq('notification_type', notificationType)
    .eq('recipient', recipient)
    .eq('status', 'sending');
}

/**
 * Send a WhatsApp message. Tries Cloud API first, falls back to CallmeBot.
 * WhatsApp failures must NEVER block appointment booking.
 */
async function sendWhatsAppDirect(
  phone: string,
  message: string
): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  // 1. Try WhatsApp Cloud API first
  if (process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
    const cloudResult = await sendWhatsAppTextMessage({ to: phone, text: message });
    if (cloudResult.ok) return cloudResult;
    // Cloud API failed — log and fall back to CallmeBot
    console.error('[notifications] Cloud API failed, falling back to CallmeBot:', cloudResult.error);
  }

  // 2. Fallback to CallmeBot
  const apiKey = process.env.CALLMEBOT_API_KEY;
  if (!apiKey) return { ok: false, error: 'No WhatsApp provider configured' };
  try {
    const params = new URLSearchParams({ phone, text: message, apikey: apiKey });
    const res = await fetch(`${CALLMEBOT_API_URL}?${params.toString()}`);
    const body = await res.text();
    if (!res.ok) return { ok: false, error: `WhatsApp failed: ${res.status}` };
    return { ok: true, messageId: body };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

function buildPatientConfirmationMessage(n: BookingNotification): string {
  const typeLabel =
    n.consultationType === 'online_intl' ? 'International Online Video Consultation' :
    n.consultationType === 'online' ? 'Online Video Consultation' :
    n.consultationType === 'hospital' ? 'Hospital Visit' : 'In-Clinic Consultation';

  const doctor = n.doctorName || 'Dr. Rajesh Goel';
  const isOnline = n.consultationType === 'online' || n.consultationType === 'online_intl';

  const lines = [
    `*APPOINTMENT CONFIRMED*`,
    ``,
    `Dear ${n.patientName},`,
    ``,
    `Your appointment with ${doctor} — Nephrologist is confirmed.`,
    ``,
    `Booking ID: ${n.bookingId}`,
    `Date: ${n.date}`,
    `Time: ${n.time} IST${n.localTimeDisplay ? ` (local: ${n.localTimeDisplay})` : ''}`,
    `Consultation: ${typeLabel}`,
    `Fee: ${n.fee}`,
    `Payment: Paid`,
  ];

  if (isOnline) {
    lines.push(
      ``,
      `Video consultation link will be sent to your WhatsApp before the appointment.`,
    );
  } else if (n.clinicName) {
    lines.push(
      ``,
      `Clinic: ${n.clinicName}`,
    );
  }

  lines.push(
    ``,
    `Please keep your Booking ID for reference.`,
    ``,
    `Kidney Care Centre`,
  );

  return lines.join('\n');
}

export interface BookingNotificationContext {
  bookingId: string;
  clinicName: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  ageGender: string;
  age?: string;
  gender?: string;
  date: string;
  time: string;
  consultationType: string;
  reason: string;
  fee: string;
  paymentId?: string;
  country?: string;
  timezone?: string;
  complaints?: string;
  medicines?: string;
  notes?: string;
  localTimeDisplay?: string;
  relationship?: string;
  bookedByPatientName?: string;
  doctorName?: string;
  clinicCity?: string;
  reportsUploaded?: boolean;
  ultrasoundUploaded?: boolean;
}

export async function sendBookingNotifications(
  ctx: BookingNotificationContext
): Promise<{ teamWhatsApp: boolean; teamEmail: boolean; patientWhatsApp: boolean; patientEmail: boolean }> {
  const result = { teamWhatsApp: false, teamEmail: false, patientWhatsApp: false, patientEmail: false };

  const bookingNotif: BookingNotification = {
    bookingId: ctx.bookingId,
    clinicName: ctx.clinicName,
    patientName: ctx.patientName,
    patientPhone: ctx.patientPhone,
    patientEmail: ctx.patientEmail,
    ageGender: ctx.ageGender,
    age: ctx.age,
    gender: ctx.gender,
    date: ctx.date,
    time: ctx.time,
    consultationType: ctx.consultationType,
    reason: ctx.reason,
    fee: ctx.fee,
    paymentStatus: 'CAPTURED',
    paymentId: ctx.paymentId,
    country: ctx.country,
    timezone: ctx.timezone,
    complaints: ctx.complaints,
    medicines: ctx.medicines,
    notes: ctx.notes,
    localTimeDisplay: ctx.localTimeDisplay,
    relationship: ctx.relationship,
    bookedByPatientName: ctx.bookedByPatientName,
    doctorName: ctx.doctorName,
    reportsUploaded: ctx.reportsUploaded,
    ultrasoundUploaded: ctx.ultrasoundUploaded,
  };

  // 1. Team WhatsApp — send to ALL doctor phones via Cloud API
  if (process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
    const doctorNotifData: AppointmentNotificationData = {
      bookingId: ctx.bookingId,
      patientName: ctx.patientName,
      doctorName: ctx.doctorName || 'Dr. Rajesh Goel',
      clinicName: ctx.clinicName,
      date: ctx.date,
      time: ctx.time,
      consultationType: ctx.consultationType,
      patientPhone: ctx.patientPhone,
    };

    // Send to all configured doctor phones (both Cloud API configured + DOCTOR_PHONES)
    const allDoctorPhones = new Set<string>();
    // Primary doctor phone from env var
    const primaryPhone = process.env.WHATSAPP_DOCTOR_PHONE_NUMBER;
    if (primaryPhone) allDoctorPhones.add(primaryPhone);
    // Additional doctor phones from DOCTOR_PHONES array
    for (const p of DOCTOR_PHONES) allDoctorPhones.add(p);

      for (const doctorPhone of allDoctorPhones) {
      if (await claimNotification(ctx.bookingId, 'team_whatsapp', doctorPhone)) {
        const doctorResult = await sendDoctorAppointmentAlert({ ...doctorNotifData, toOverride: doctorPhone });
        await updateNotificationStatus(
          ctx.bookingId, 'team_whatsapp', doctorPhone,
          doctorResult.ok ? 'sent' : 'failed',
          doctorResult.messageId,
          doctorResult.error
        );
        if (doctorResult.ok) result.teamWhatsApp = true;
      }
    }
  } else if (DOCTOR_PHONES.length > 0) {
    // No Cloud API — try CallmeBot fallback
    const doctorMessage = buildDoctorMessage(bookingNotif);
    for (const phone of DOCTOR_PHONES) {
      if (await claimNotification(ctx.bookingId, 'team_whatsapp', phone)) {
        const result_wa = await sendWhatsAppDirect(phone, doctorMessage);
        await updateNotificationStatus(
          ctx.bookingId, 'team_whatsapp', phone,
          result_wa.ok ? 'sent' : 'failed',
          result_wa.messageId,
          result_wa.error
        );
        if (result_wa.ok) result.teamWhatsApp = true;
      }
    }
  }

  // 2. Team email
  if (await claimNotification(ctx.bookingId, 'team_email', 'doctors')) {
    try {
      await sendTeamBookingEmail({
        bookingId: ctx.bookingId,
        patientName: ctx.patientName,
        patientPhone: ctx.patientPhone,
        patientEmail: ctx.patientEmail,
        consultationType: ctx.consultationType,
        date: ctx.date,
        time: ctx.time,
        fee: ctx.fee,
        reason: ctx.reason,
        paymentId: ctx.paymentId,
        relationship: ctx.relationship,
        bookedByPatientName: ctx.bookedByPatientName,
        doctorName: ctx.doctorName,
        clinicName: ctx.clinicName,
        clinicCity: ctx.clinicCity,
        age: ctx.age,
        gender: ctx.gender,
        localTimeDisplay: ctx.localTimeDisplay,
        reportsUploaded: ctx.reportsUploaded,
        ultrasoundUploaded: ctx.ultrasoundUploaded,
      });
      await updateNotificationStatus(ctx.bookingId, 'team_email', 'doctors', 'sent');
      result.teamEmail = true;
    } catch (err) {
      await updateNotificationStatus(ctx.bookingId, 'team_email', 'doctors', 'failed', undefined, err instanceof Error ? err.message : 'Unknown');
    }
  }

  // 3. Patient WhatsApp confirmation — try Cloud API template first, fallback to text
  if (ctx.patientPhone && await claimNotification(ctx.bookingId, 'patient_whatsapp', ctx.patientPhone)) {
    let waResult: { ok: boolean; messageId?: string; error?: string };

    // Try WhatsApp Cloud API template message first
    if (process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
      const templateData: AppointmentNotificationData = {
        bookingId: ctx.bookingId,
        patientName: ctx.patientName,
        doctorName: ctx.doctorName || 'Dr. Rajesh Goel',
        clinicName: ctx.clinicName,
        date: ctx.date,
        time: ctx.time,
        consultationType: ctx.consultationType,
        patientPhone: ctx.patientPhone,
      };
      waResult = await sendPatientAppointmentConfirmation(templateData);
    } else {
      // Fallback: free-form text via CallmeBot
      const patientMsg = buildPatientConfirmationMessage(bookingNotif);
      waResult = await sendWhatsAppDirect(ctx.patientPhone, patientMsg);
    }

    await updateNotificationStatus(
      ctx.bookingId, 'patient_whatsapp', ctx.patientPhone,
      waResult.ok ? 'sent' : 'failed',
      waResult.messageId,
      waResult.error
    );
    result.patientWhatsApp = waResult.ok;
  }

  // 4. Patient email confirmation
  if (ctx.patientEmail && await claimNotification(ctx.bookingId, 'patient_email', ctx.patientEmail)) {
    try {
      await sendBookingConfirmationEmail({
        to: ctx.patientEmail,
        patientName: ctx.patientName,
        bookingId: ctx.bookingId,
        consultationType: ctx.consultationType,
        date: ctx.date,
        time: ctx.time,
        fee: ctx.fee,
        paymentId: ctx.paymentId,
        relationship: ctx.relationship,
        bookedByPatientName: ctx.bookedByPatientName,
        doctorName: ctx.doctorName,
        clinicName: ctx.clinicName,
        localTimeDisplay: ctx.localTimeDisplay,
      });
      await updateNotificationStatus(ctx.bookingId, 'patient_email', ctx.patientEmail, 'sent');
      result.patientEmail = true;
    } catch (err) {
      await updateNotificationStatus(ctx.bookingId, 'patient_email', ctx.patientEmail, 'failed', undefined, err instanceof Error ? err.message : 'Unknown');
    }
  }

  return result;
}
