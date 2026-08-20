-- Migration 017: Family/dependent booking support
-- Adds:
--   booked_by_patient_account_id  — the portal account holder who made the booking
--   relationship                  — how the actual patient relates to the booker
--   actual_patient_id             — FK to patients (EMR) for the actual person receiving care
--
-- For self-bookings:
--   booked_by_patient_account_id = the logged-in patient_accounts.id
--   relationship = 'self'
--   actual_patient_id = resolved EMR patient via bridge
--
-- For family bookings:
--   booked_by_patient_account_id = the logged-in patient_accounts.id
--   relationship = 'father' | 'mother' | 'son' | 'daughter' | 'spouse' | 'other'
--   actual_patient_id = EMR patient record for the relative (created or found)

-- 1. Add new columns
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booked_by_patient_account_id UUID REFERENCES patient_accounts(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS relationship TEXT DEFAULT 'self';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS actual_patient_id UUID REFERENCES patients(id);

-- 2. Indexes for querying
CREATE INDEX IF NOT EXISTS idx_bookings_booked_by ON bookings(booked_by_patient_account_id);
CREATE INDEX IF NOT EXISTS idx_bookings_actual_patient ON bookings(actual_patient_id);

-- 3. Backfill existing logged-in bookings: set relationship = 'self'
-- booked_by_patient_account_id is already populated for logged-in patients (patient_account_id column)
-- We use patient_account_id as the booker for existing records
UPDATE bookings
SET booked_by_patient_account_id = patient_account_id,
    relationship = 'self'
WHERE patient_account_id IS NOT NULL
  AND booked_by_patient_account_id IS NULL;
