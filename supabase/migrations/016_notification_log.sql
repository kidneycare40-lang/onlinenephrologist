-- Migration 016: Notification logging for idempotent booking notifications
-- Prevents duplicate WhatsApp/email notifications on Razorpay webhook retries

CREATE TABLE IF NOT EXISTS notification_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  provider_message_id TEXT,
  error TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_log_booking ON notification_log(booking_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_type ON notification_log(notification_type);

ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON notification_log
  FOR ALL USING (true)
  WITH CHECK (true);
