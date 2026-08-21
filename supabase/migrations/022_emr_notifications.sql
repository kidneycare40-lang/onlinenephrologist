-- Migration 022: EMR in-app notifications
-- Triggered when: new booking created, payment received, consultation completed
-- Used by: EMR TopNav bell icon, dashboard activity feed

CREATE TABLE IF NOT EXISTS emr_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,            -- 'booking_created', 'payment_received', 'booking_cancelled', 'consultation_completed'
  title TEXT NOT NULL,           -- 'New Appointment Booked'
  message TEXT NOT NULL,         -- 'Rajesh Kumar booked an online video consultation for Aug 25'
  booking_id TEXT,               -- FK to bookings.booking_id (nullable for non-booking notifications)
  patient_name TEXT,             -- Denormalized for quick display
  patient_phone TEXT,            -- Denormalized for quick display
  clinic_id TEXT,                -- Which clinic location
  amount NUMERIC,               -- Payment amount (if payment notification)
  currency TEXT DEFAULT 'INR',   -- INR or USD
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',  -- Extra data (payment_id, consultation_type, etc.)
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_emr_notifications_created ON emr_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emr_notifications_unread ON emr_notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_emr_notifications_type ON emr_notifications(type);

-- Enable RLS — service role bypasses it
ALTER TABLE emr_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON emr_notifications
  FOR ALL USING (true)
  WITH CHECK (true);
