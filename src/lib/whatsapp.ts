import { createHmac, timingSafeEqual } from 'crypto';
import { getDb } from '@/lib/db/client';

// ─── Configuration ───────────────────────────────────────────────────

function getConfig() {
  return {
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v21.0',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    appSecret: process.env.WHATSAPP_APP_SECRET || '',
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || '',
    doctorPhone: process.env.WHATSAPP_DOCTOR_PHONE_NUMBER || '',
    appointmentTemplate: process.env.WHATSAPP_APPOINTMENT_TEMPLATE || 'appointment_confirmed',
    doctorTemplate: process.env.WHATSAPP_DOCTOR_TEMPLATE || 'new_appointment_alert',
  };
}

// ─── Webhook Signature Verification ──────────────────────────────────

export function verifyWebhookSignature(
  body: string,
  signatureHeader: string | null
): boolean {
  const { appSecret } = getConfig();
  if (!appSecret || !signatureHeader) return false;

  // Meta sends: "sha256=<hex>"
  const parts = signatureHeader.split('=');
  if (parts.length !== 2 || parts[0] !== 'sha256') return false;

  const expected = createHmac('sha256', appSecret)
    .update(body)
    .digest('hex');

  const sigBuf = Buffer.from(parts[1], 'hex');
  const expectedBuf = Buffer.from(expected, 'hex');

  if (sigBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(sigBuf, expectedBuf);
}

// ─── Database Helpers ────────────────────────────────────────────────

export interface WhatsAppMessageRecord {
  id: string;
  booking_id: string | null;
  direction: 'inbound' | 'outbound';
  from_number: string;
  to_number: string;
  wa_message_id: string | null;
  message_type: string;
  template_name: string | null;
  content: string | null;
  status: string;
  error_code: string | null;
  error_message: string | null;
  received_at: string;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  failed_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Insert or update a WhatsApp message record.
 * If wa_message_id already exists, updates the status (idempotent).
 */
export async function upsertMessageRecord(record: {
  bookingId?: string;
  direction: 'inbound' | 'outbound';
  fromNumber: string;
  toNumber: string;
  waMessageId?: string;
  messageType?: string;
  templateName?: string;
  content?: string;
  status?: string;
  errorCode?: string;
  errorMessage?: string;
}): Promise<WhatsAppMessageRecord | null> {
  const db = getDb();
  const now = new Date().toISOString();

  // Try to find existing record by wa_message_id (idempotent)
  if (record.waMessageId) {
    const { data: existing } = await db
      .from('whatsapp_cloud_messages')
      .select('*')
      .eq('wa_message_id', record.waMessageId)
      .limit(1);

    if (existing && existing.length > 0) {
      // Update existing record
      const updateData: Record<string, unknown> = { updated_at: now };
      if (record.status) {
        updateData.status = record.status;
        if (record.status === 'sent') updateData.sent_at = now;
        if (record.status === 'delivered') updateData.delivered_at = now;
        if (record.status === 'read') updateData.read_at = now;
        if (record.status === 'failed') {
          updateData.failed_at = now;
          updateData.error_code = record.errorCode || null;
          updateData.error_message = record.errorMessage || null;
        }
      }

      const { data: updated } = await db
        .from('whatsapp_cloud_messages')
        .update(updateData)
        .eq('id', existing[0].id)
        .select()
        .single();

      return updated || existing[0];
    }
  }

  // Insert new record
  const insertData: Record<string, unknown> = {
    booking_id: record.bookingId || null,
    direction: record.direction,
    from_number: record.fromNumber,
    to_number: record.toNumber,
    wa_message_id: record.waMessageId || null,
    message_type: record.messageType || 'text',
    template_name: record.templateName || null,
    content: record.content || null,
    status: record.status || (record.direction === 'outbound' ? 'sent' : 'received'),
    error_code: record.errorCode || null,
    error_message: record.errorMessage || null,
    received_at: record.direction === 'inbound' ? now : null,
    sent_at: record.direction === 'outbound' ? now : null,
    created_at: now,
    updated_at: now,
  };

  const { data: inserted } = await db
    .from('whatsapp_cloud_messages')
    .insert(insertData)
    .select()
    .single();

  return inserted;
}

/**
 * Update the status of an existing message by wa_message_id (idempotent).
 */
export async function updateMessageStatus(
  waMessageId: string,
  status: 'sent' | 'delivered' | 'read' | 'failed',
  errorCode?: string,
  errorMessage?: string
): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();

  const updateData: Record<string, unknown> = {
    status,
    updated_at: now,
  };

  if (status === 'sent') updateData.sent_at = now;
  if (status === 'delivered') updateData.delivered_at = now;
  if (status === 'read') updateData.read_at = now;
  if (status === 'failed') {
    updateData.failed_at = now;
    updateData.error_code = errorCode || null;
    updateData.error_message = errorMessage || null;
  }

  await db
    .from('whatsapp_cloud_messages')
    .update(updateData)
    .eq('wa_message_id', waMessageId);
}

// ─── WhatsApp Cloud API Send Functions ────────────────────────────────

interface SendResult {
  ok: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a WhatsApp template message via Cloud API.
 * Template must be pre-approved in Meta WhatsApp Manager.
 */
export async function sendWhatsAppTemplateMessage(params: {
  to: string;
  templateName: string;
  languageCode?: string;
  components?: Array<{
    type: string;
    parameters: Array<{ type: string; text: string }>;
  }>;
}): Promise<SendResult> {
  const { apiVersion, phoneNumberId, accessToken } = getConfig();
  if (!phoneNumberId || !accessToken) {
    return { ok: false, error: 'WhatsApp Cloud API not configured' };
  }

  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  const body: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    to: params.to,
    type: 'template',
    template: {
      name: params.templateName,
      language: { code: params.languageCode || 'en' },
    },
  };

  if (params.components && params.components.length > 0) {
    (body.template as Record<string, unknown>).components = params.components;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      const errMsg = data?.error?.message || `HTTP ${res.status}`;
      const errCode = data?.error?.code?.toString() || String(res.status);
      console.error('[whatsapp] Template send failed:', errCode, errMsg);
      return { ok: false, error: errMsg };
    }

    const messageId = data?.messages?.[0]?.id;
    return { ok: true, messageId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[whatsapp] Template send error:', msg);
    return { ok: false, error: msg };
  }
}

/**
 * Send a free-form text message via WhatsApp Cloud API.
 * Only works within the 24-hour customer service window.
 */
export async function sendWhatsAppTextMessage(params: {
  to: string;
  text: string;
}): Promise<SendResult> {
  const { apiVersion, phoneNumberId, accessToken } = getConfig();
  if (!phoneNumberId || !accessToken) {
    return { ok: false, error: 'WhatsApp Cloud API not configured' };
  }

  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: params.to,
        type: 'text',
        text: { body: params.text },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errMsg = data?.error?.message || `HTTP ${res.status}`;
      const errCode = data?.error?.code?.toString() || String(res.status);
      console.error('[whatsapp] Text send failed:', errCode, errMsg);
      return { ok: false, error: errMsg };
    }

    const messageId = data?.messages?.[0]?.id;
    return { ok: true, messageId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[whatsapp] Text send error:', msg);
    return { ok: false, error: msg };
  }
}

// ─── High-Level Notification Functions ────────────────────────────────

export interface AppointmentNotificationData {
  bookingId: string;
  patientName: string;
  doctorName: string;
  clinicName: string;
  date: string;
  time: string;
  consultationType: string;
  patientPhone: string;
}

/**
 * Send appointment confirmation to patient via WhatsApp Cloud API template.
 * Records the message in whatsapp_cloud_messages for delivery tracking.
 */
export async function sendPatientAppointmentConfirmation(
  data: AppointmentNotificationData
): Promise<SendResult> {
  const config = getConfig();
  const { appointmentTemplate } = config;

  const typeLabel =
    data.consultationType === 'online_intl' ? 'International Online' :
    data.consultationType === 'online' ? 'Online Video' :
    data.consultationType === 'hospital' ? 'Hospital Visit' : 'In-Clinic';

  const result = await sendWhatsAppTemplateMessage({
    to: data.patientPhone,
    templateName: appointmentTemplate,
    languageCode: 'en',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: data.patientName },
          { type: 'text', text: data.doctorName || 'Dr. Rajesh Goel' },
          { type: 'text', text: data.clinicName || typeLabel },
          { type: 'text', text: data.date },
          { type: 'text', text: data.time },
          { type: 'text', text: data.bookingId },
        ],
      },
    ],
  });

  // Record in database (non-blocking — don't fail if DB write fails)
  try {
    await upsertMessageRecord({
      bookingId: data.bookingId,
      direction: 'outbound',
      fromNumber: config.phoneNumberId,
      toNumber: data.patientPhone,
      waMessageId: result.messageId,
      messageType: 'template',
      templateName: appointmentTemplate,
      content: `Appointment confirmation for ${data.patientName} on ${data.date} ${data.time}`,
      status: result.ok ? 'sent' : 'failed',
      errorCode: result.ok ? undefined : 'SEND_FAILED',
      errorMessage: result.error,
    });
  } catch (dbErr) {
    console.error('[whatsapp] Failed to record patient message:', dbErr);
  }

  return result;
}

/**
 * Send new appointment alert to doctor/clinic via WhatsApp Cloud API.
 * Uses free-form text within the 24-hour service window.
 */
export async function sendDoctorAppointmentAlert(
  data: AppointmentNotificationData
): Promise<SendResult> {
  const config = getConfig();
  const { doctorPhone } = config;

  if (!doctorPhone) {
    return { ok: false, error: 'WHATSAPP_DOCTOR_PHONE_NUMBER not configured' };
  }

  const typeLabel =
    data.consultationType === 'online_intl' ? 'International Online Video' :
    data.consultationType === 'online' ? 'Online Video' :
    data.consultationType === 'hospital' ? 'Hospital Visit' : 'In-Clinic';

  const message = [
    '*NEW APPOINTMENT — PAYMENT CONFIRMED*',
    '',
    `Booking ID: ${data.bookingId}`,
    '',
    `Patient: ${data.patientName}`,
    `Doctor: ${data.doctorName || 'Dr. Rajesh Goel'}`,
    `Type: ${typeLabel}`,
    '',
    `Date: ${data.date}`,
    `Time: ${data.time} IST`,
    `Clinic: ${data.clinicName || 'N/A'}`,
    '',
    `Phone: ${data.patientPhone}`,
    '',
    `Please check the appointment in EMR.`,
  ].join('\n');

  const result = await sendWhatsAppTextMessage({
    to: doctorPhone,
    text: message,
  });

  // Record in database
  try {
    await upsertMessageRecord({
      bookingId: data.bookingId,
      direction: 'outbound',
      fromNumber: config.phoneNumberId,
      toNumber: doctorPhone,
      waMessageId: result.messageId,
      messageType: 'text',
      content: `Doctor alert for booking ${data.bookingId}`,
      status: result.ok ? 'sent' : 'failed',
      errorCode: result.ok ? undefined : 'SEND_FAILED',
      errorMessage: result.error,
    });
  } catch (dbErr) {
    console.error('[whatsapp] Failed to record doctor message:', dbErr);
  }

  return result;
}
