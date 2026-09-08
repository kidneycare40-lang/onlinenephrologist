import { getDb } from '@/lib/db/client';
import { DOCTOR_PHONES } from '@/lib/whatsapp-notify';
import { sendBookingConfirmationEmail, sendTeamBookingEmail } from '@/lib/email';
import {
  sendPatientAppointmentConfirmation,
  sendDoctorAppointmentAlert,
  type AppointmentNotificationData,
} from '@/lib/whatsapp';

function buildDoctorWaMeUrl(data: BookingNotificationContext, phone: string): string {
  const typeLabel =
    data.consultationType === 'online_intl' ? 'International Online Video' :
    data.consultationType === 'online' ? 'Online Video' :
    data.consultationType === 'hospital' ? 'Hospital Visit' : 'In-Clinic';
  const amountLabel = (data.feeCurrency || 'INR') === 'USD' ? `$${data.fee}` : `₹${data.fee}`;
  const message = [
    `*NEW BOOKING — PAYMENT CONFIRMED*`,
    ``,
    `Booking ID: ${data.bookingId}`,
    `Patient: ${data.patientName}`,
    data.age || data.gender ? `Age/Gender: ${data.age || ''}${data.age && data.gender ? '/' : ''}${data.gender || ''}` : '',
    `Phone: ${data.patientPhone}`,
    data.patientEmail ? `Email: ${data.patientEmail}` : '',
    data.country ? `Country: ${data.country}` : '',
    data.relationship && data.relationship !== 'self' ? `Booked by: ${data.bookedByPatientName || data.relationship}` : '',
    ``,
    `Type: ${typeLabel}`,
    `Doctor: ${data.doctorName || 'Dr. Rajesh Goel'}`,
    `Clinic: ${data.clinicName || 'Online'}`,
    `Date: ${data.date}`,
    `Time: ${data.time} IST`,
    ``,
    `Amount: ${amountLabel}`,
    `Payment: CONFIRMED`,
    data.paymentId ? `Payment ID: ${data.paymentId}` : '',
    data.reason ? `Reason: ${data.reason}` : '',
    data.reportsUploaded ? `Reports: Uploaded` : '',
    data.ultrasoundUploaded ? `Ultrasound: Uploaded` : '',
    ``,
    `View all details in EMR:`,
    `https://www.onlinenephrologist.com/emr/billing`,
  ].filter(Boolean).join('\n');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function buildPatientWaMeUrl(data: BookingNotificationContext, phone: string): string {
  const typeLabel =
    data.consultationType === 'online_intl' ? 'International Online' :
    data.consultationType === 'online' ? 'Online Video' :
    data.consultationType === 'hospital' ? 'Hospital Visit' : 'In-Clinic';
  const amountLabel = (data.feeCurrency || 'INR') === 'USD' ? `$${data.fee}` : `₹${data.fee}`;
  const message = [
    `Dear ${data.patientName},`,
    ``,
    `Your appointment is confirmed!`,
    ``,
    `Booking ID: ${data.bookingId}`,
    `Doctor: ${data.doctorName || 'Dr. Rajesh Goel'}`,
    `Type: ${typeLabel}`,
    `Date: ${data.date}`,
    `Time: ${data.time} IST`,
    `Amount Paid: ${amountLabel}`,
    ``,
    `View your booking:`,
    `https://www.onlinenephrologist.com/emr/billing`,
    ``,
    `For queries, reply to this message.`,
  ].filter(Boolean).join('\n');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

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

  if (!error) return true;

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
      await db
        .from('notification_log')
        .update({ status: 'sending', error: null, provider_message_id: null })
        .eq('booking_id', bookingId)
        .eq('notification_type', notificationType)
        .eq('recipient', recipient);
      return true;
    }
    return false;
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
  feeCurrency?: string;
  paymentId?: string;
  country?: string;
  timezone?: string;
  localTimeDisplay?: string;
  relationship?: string;
  bookedByPatientName?: string;
  doctorName?: string;
  clinicCity?: string;
  reportsUploaded?: boolean;
  ultrasoundUploaded?: boolean;
}

/**
 * Send booking notifications via WhatsApp (Cloud API only) and email.
 * WhatsApp failures must NEVER block appointment booking.
 */
export async function sendBookingNotifications(
  ctx: BookingNotificationContext
): Promise<{ teamWhatsApp: boolean; teamEmail: boolean; patientWhatsApp: boolean; patientEmail: boolean }> {
  const result = { teamWhatsApp: false, teamEmail: false, patientWhatsApp: false, patientEmail: false };

  const cloudConfigured = !!(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);

  // 1. Team WhatsApp — send to ALL doctor phones via Cloud API + wa.me fallback
  {
    const allDoctorPhones = new Set<string>();
    const primaryPhone = process.env.WHATSAPP_DOCTOR_PHONE_NUMBER;
    if (primaryPhone) allDoctorPhones.add(primaryPhone);
    for (const p of DOCTOR_PHONES) allDoctorPhones.add(p);

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

    for (const doctorPhone of allDoctorPhones) {
      if (await claimNotification(ctx.bookingId, 'team_whatsapp', doctorPhone)) {
        let doctorResult: { ok: boolean; messageId?: string; error?: string } = { ok: false, error: '' };

        if (cloudConfigured) {
          doctorResult = await sendDoctorAppointmentAlert({ ...doctorNotifData, toOverride: doctorPhone });
        }

        if (doctorResult.ok) {
          await updateNotificationStatus(ctx.bookingId, 'team_whatsapp', doctorPhone, 'sent', doctorResult.messageId);
          result.teamWhatsApp = true;
        } else {
          const waMeUrl = buildDoctorWaMeUrl(ctx, doctorPhone);
          await updateNotificationStatus(
            ctx.bookingId, 'team_whatsapp', doctorPhone, 'failed',
            undefined, `${doctorResult.error || 'Cloud API unavailable'} | wa.me: ${waMeUrl}`
          );
          console.log(`[notifications] Doctor WhatsApp Cloud API failed → wa.me fallback: ${waMeUrl}`);
        }
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

  // 3. Patient WhatsApp confirmation — Cloud API + wa.me fallback
  if (ctx.patientPhone && await claimNotification(ctx.bookingId, 'patient_whatsapp', ctx.patientPhone)) {
    let waResult: { ok: boolean; messageId?: string; error?: string } = { ok: false, error: 'not attempted' };

    if (cloudConfigured) {
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
    }

    if (waResult.ok) {
      await updateNotificationStatus(
        ctx.bookingId, 'patient_whatsapp', ctx.patientPhone, 'sent', waResult.messageId
      );
      result.patientWhatsApp = true;
    } else {
      const cleanPhone = ctx.patientPhone.replace(/\D/g, '');
      const waMeUrl = buildPatientWaMeUrl(ctx, cleanPhone);
      await updateNotificationStatus(
        ctx.bookingId, 'patient_whatsapp', ctx.patientPhone, 'failed',
        undefined, `${waResult.error || 'Cloud API unavailable'} | wa.me: ${waMeUrl}`
      );
      console.log(`[notifications] Patient WhatsApp Cloud API failed → wa.me fallback: ${waMeUrl}`);
    }
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
