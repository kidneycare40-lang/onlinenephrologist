import { getDb } from '@/lib/db/client';
import { DOCTOR_PHONES } from '@/lib/whatsapp-notify';
import { sendBookingConfirmationEmail, sendTeamBookingEmail } from '@/lib/email';
import {
  sendPatientAppointmentConfirmation,
  sendDoctorAppointmentAlert,
  type AppointmentNotificationData,
} from '@/lib/whatsapp';

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

  // 1. Team WhatsApp — send to ALL doctor phones via Cloud API
  if (cloudConfigured) {
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

    const allDoctorPhones = new Set<string>();
    const primaryPhone = process.env.WHATSAPP_DOCTOR_PHONE_NUMBER;
    if (primaryPhone) allDoctorPhones.add(primaryPhone);
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
  } else {
    console.error('[notifications] WhatsApp Cloud API not configured — team WhatsApp skipped');
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

  // 3. Patient WhatsApp confirmation — Cloud API template only
  if (ctx.patientPhone && await claimNotification(ctx.bookingId, 'patient_whatsapp', ctx.patientPhone)) {
    let waResult: { ok: boolean; messageId?: string; error?: string };

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
    } else {
      console.error('[notifications] WhatsApp Cloud API not configured — patient WhatsApp skipped');
      waResult = { ok: false, error: 'WhatsApp Cloud API not configured' };
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
