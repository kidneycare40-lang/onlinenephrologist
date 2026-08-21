-- ============================================================
-- Migration 021: Add international fields to bookings
-- ============================================================
-- Safe migration: adds columns only if they don't exist,
-- then backfills from existing data.
-- ============================================================

-- Add current_location (from Migration 018, may not have been applied)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'current_location'
  ) THEN
    ALTER TABLE bookings ADD COLUMN current_location TEXT DEFAULT 'india';
  END IF;
END $$;

-- Add is_international boolean
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'is_international'
  ) THEN
    ALTER TABLE bookings ADD COLUMN is_international BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- Add country_code (phone dialing code, e.g. "+91", "+1", "+971")
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'country_code'
  ) THEN
    ALTER TABLE bookings ADD COLUMN country_code TEXT DEFAULT '+91';
  END IF;
END $$;

-- Backfill is_international from existing data
UPDATE bookings
SET is_international = true
WHERE consultation_type = 'online_intl';

-- Backfill current_location from consultation_type
UPDATE bookings
SET current_location = 'outside_india'
WHERE consultation_type = 'online_intl'
  AND (current_location IS NULL OR current_location = 'india');

-- Backfill country_code from patient_accounts where available
UPDATE bookings b
SET country_code = pa.country_code
FROM patient_accounts pa
WHERE b.patient_account_id = pa.id
  AND b.country_code IS NULL
  AND pa.country_code IS NOT NULL;
