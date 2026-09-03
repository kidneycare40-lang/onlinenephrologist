-- Migration 023: WhatsApp Cloud API message tracking
-- Tracks inbound/outbound WhatsApp Cloud API messages, webhook status updates,
-- and delivery lifecycle. Separate from the legacy whatsapp_logs table (EMR schema)
-- and the notification_log table (booking notification deduplication).

CREATE TABLE IF NOT EXISTS whatsapp_cloud_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Link to booking (nullable — incoming patient messages may not relate to a booking)
  booking_id TEXT,

  -- Direction: inbound (patient → clinic) or outbound (clinic → patient/doctor)
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),

  -- Phone numbers in E.164 format (e.g. 919818235699)
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,

  -- Meta WhatsApp message ID (for idempotent webhook processing)
  wa_message_id TEXT,

  -- Message type: text, template, image, document, etc.
  message_type TEXT NOT NULL DEFAULT 'text',

  -- Template name (for outbound template messages)
  template_name TEXT,

  -- Message body (inbound text or outbound content summary — never full payload)
  content TEXT,

  -- Delivery lifecycle
  status TEXT NOT NULL DEFAULT 'received',
  -- Possible statuses: received, sent, delivered, read, failed

  -- Error tracking (for failed messages)
  error_code TEXT,
  error_message TEXT,

  -- Timestamps
  received_at TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Idempotent webhook processing: one row per Meta message ID
CREATE UNIQUE INDEX IF NOT EXISTS idx_wa_cloud_msg_id
  ON whatsapp_cloud_messages(wa_message_id)
  WHERE wa_message_id IS NOT NULL;

-- Fast lookups by booking
CREATE INDEX IF NOT EXISTS idx_wa_cloud_booking
  ON whatsapp_cloud_messages(booking_id)
  WHERE booking_id IS NOT NULL;

-- Fast lookups by phone for incoming messages
CREATE INDEX IF NOT EXISTS idx_wa_cloud_from
  ON whatsapp_cloud_messages(from_number);

CREATE INDEX IF NOT EXISTS idx_wa_cloud_to
  ON whatsapp_cloud_messages(to_number);

-- Status queries for EMR dashboard
CREATE INDEX IF NOT EXISTS idx_wa_cloud_status
  ON whatsapp_cloud_messages(status);

CREATE INDEX IF NOT EXISTS idx_wa_cloud_created
  ON whatsapp_cloud_messages(created_at DESC);

-- RLS: service role only (bypasses RLS via API middleware)
ALTER TABLE whatsapp_cloud_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role access" ON whatsapp_cloud_messages
  FOR ALL USING (true)
  WITH CHECK (true);
