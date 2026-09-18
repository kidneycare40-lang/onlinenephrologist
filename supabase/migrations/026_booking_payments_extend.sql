-- 026_booking_payments_extend.sql
-- Add booking_date, booking_time, age, gender, reason, clinic_id to booking_payments
-- These fields ensure webhook fallback can reconstruct full booking data

ALTER TABLE booking_payments ADD COLUMN IF NOT EXISTS booking_date text;
ALTER TABLE booking_payments ADD COLUMN IF NOT EXISTS booking_time text;
ALTER TABLE booking_payments ADD COLUMN IF NOT EXISTS age text;
ALTER TABLE booking_payments ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE booking_payments ADD COLUMN IF NOT EXISTS reason text;
ALTER TABLE booking_payments ADD COLUMN IF NOT EXISTS clinic_id text;
