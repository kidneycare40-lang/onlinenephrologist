-- Migration 025: Add site tracking for multi-site booking widget
-- Tracks which website the booking originated from

-- Add site_id to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS site_id VARCHAR(50) DEFAULT 'online';

-- Add site_id to booking_payments table
ALTER TABLE booking_payments ADD COLUMN IF NOT EXISTS site_id VARCHAR(50) DEFAULT 'online';

-- Add site_id to notification_log table
ALTER TABLE notification_log ADD COLUMN IF NOT EXISTS site_id VARCHAR(50) DEFAULT 'online';

-- Indexes for filtering by site
CREATE INDEX IF NOT EXISTS idx_bookings_site_id ON bookings(site_id);
CREATE INDEX IF NOT EXISTS idx_booking_payments_site_id ON booking_payments(site_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_site_id ON notification_log(site_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_bookings_site_status ON bookings(site_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_site_payment ON bookings(site_id, payment_status);
CREATE INDEX IF NOT EXISTS idx_booking_payments_site_status ON booking_payments(site_id, payment_status);
