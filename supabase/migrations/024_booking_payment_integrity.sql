-- Migration 024: Booking-Payment Integrity Constraints
-- Ensures the core invariant:
--   CAPTURED payment ↔ confirmed booking ↔ EMR appointment
--
-- Run this migration to add database-level safety constraints.

-- ============================================================
-- 1. UNIQUE SLOT CONSTRAINT: Prevent double-booking at DB level
-- ============================================================
-- Only one active (non-deleted) appointment per doctor per date/time slot.
-- Uses a partial unique index to exclude soft-deleted rows.

CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_slot_unique
  ON appointments (doctor_id, appointment_date, appointment_time)
  WHERE is_deleted = false;

-- ============================================================
-- 2. BOOKING_ID ON APPOINTMENTS: Link appointments to bookings
-- ============================================================
-- Add booking_id column if not exists, with soft reference.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'appointments' AND column_name = 'booking_id'
  ) THEN
    ALTER TABLE appointments ADD COLUMN booking_id text;
  END IF;
END $$;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_appointments_booking_id
  ON appointments (booking_id)
  WHERE booking_id IS NOT NULL;

-- ============================================================
-- 3. CONFIRMED BOOKING REQUIRES CAPTURED PAYMENT (trigger)
-- ============================================================
-- Prevents setting bookings.status = 'confirmed' unless a
-- CAPTURED payment record exists in booking_payments.

CREATE OR REPLACE FUNCTION check_booking_payment_integrity()
RETURNS TRIGGER AS $$
BEGIN
  -- Only enforce when status changes to 'confirmed'
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    IF NOT EXISTS (
      SELECT 1 FROM booking_payments
      WHERE booking_id = NEW.booking_id
        AND payment_status = 'CAPTURED'
      LIMIT 1
    ) THEN
      RAISE EXCEPTION 'Cannot confirm booking % without a CAPTURED payment record',
        NEW.booking_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS trg_booking_payment_integrity ON bookings;
CREATE TRIGGER trg_booking_payment_integrity
  BEFORE UPDATE OF status ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_payment_integrity();

-- ============================================================
-- 4. PREVENT CONFIRMED BOOKING INSERT WITHOUT CAPTURED PAYMENT
-- ============================================================
-- For INSERT operations (e.g., reconcile endpoint).

CREATE OR REPLACE FUNCTION check_booking_payment_integrity_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' THEN
    IF NOT EXISTS (
      SELECT 1 FROM booking_payments
      WHERE booking_id = NEW.booking_id
        AND payment_status = 'CAPTURED'
      LIMIT 1
    ) THEN
      RAISE EXCEPTION 'Cannot insert confirmed booking % without a CAPTURED payment record',
        NEW.booking_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_booking_payment_integrity_insert ON bookings;
CREATE TRIGGER trg_booking_payment_integrity_insert
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_payment_integrity_insert();

-- ============================================================
-- 5. CLEANUP: Cancel stale pending unpaid bookings
-- ============================================================
-- Mark any pending unpaid bookings older than 24 hours as expired.
-- This catches any that slip through the application-level cleanup.

UPDATE bookings
SET status = 'cancelled',
    updated_at = NOW()
WHERE status = 'pending'
  AND payment_status = 'unpaid'
  AND created_at < NOW() - INTERVAL '24 hours';
