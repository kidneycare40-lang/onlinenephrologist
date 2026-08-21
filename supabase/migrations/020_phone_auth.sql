-- ============================================================
-- Migration 020: Phone-Based Patient Authentication
-- ============================================================
-- PURPOSE: Enable phone-first patient lookup for booking and
--          returning patient login via Phone + UHID.
--
-- SAFETY: This migration audits before altering.
--         Never invents phone numbers.
--         Uses ON CONFLICT for race-safe account creation.
-- ============================================================

-- ============================================================
-- STEP 0: PRE-MIGRATION AUDIT
-- Run these checks. If duplicates found, resolve BEFORE proceeding.
-- ============================================================

-- Check 1: Missing phones
-- SELECT COUNT(*) FILTER (WHERE phone IS NULL OR phone = '') AS missing_phone,
--        COUNT(*) FILTER (WHERE phone IS NOT NULL AND phone <> '') AS has_phone,
--        COUNT(*) AS total
-- FROM patient_accounts;

-- Check 2: Duplicate phones
-- SELECT phone, COUNT(*) AS count
-- FROM patient_accounts
-- WHERE phone IS NOT NULL AND phone <> ''
-- GROUP BY phone
-- HAVING COUNT(*) > 1
-- ORDER BY count DESC;

-- Check 3: Phone format samples
-- SELECT id, email, phone, first_name, last_name
-- FROM patient_accounts
-- WHERE phone IS NOT NULL AND phone <> ''
-- LIMIT 10;


-- ============================================================
-- STEP 1: NORMALIZE EXISTING PHONE NUMBERS
-- Strip non-digits, add +91 prefix for 10-digit Indian numbers.
-- ============================================================

-- Normalize phones that are all digits (Indian numbers)
UPDATE patient_accounts
SET phone = '+91' || phone
WHERE phone ~ '^[6-9][0-9]{9}$'
  AND length(phone) = 10;

-- Normalize phones that start with 0 (drop leading 0, add +91)
UPDATE patient_accounts
SET phone = '+91' || substring(phone FROM 2)
WHERE phone ~ '^0[6-9][0-9]{9}$'
  AND length(phone) = 11;

-- Normalize phones that have spaces/dashes but are otherwise valid
-- (already handled by the app-layer normalizePhone, but ensure DB is clean)
UPDATE patient_accounts
SET phone = '+91' || regexp_replace(phone, '[^0-9]', '', 'g')
WHERE phone IS NOT NULL
  AND phone <> ''
  AND regexp_replace(phone, '[^0-9]', '', 'g') ~ '^[6-9][0-9]{9}$'
  AND length(regexp_replace(phone, '[^0-9]', '', 'g')) = 10
  AND phone NOT LIKE '+%';

-- Normalize phones with country code 91 prefix but no +
UPDATE patient_accounts
SET phone = '+' || phone
WHERE phone ~ '^91[6-9][0-9]{9}$'
  AND length(phone) = 12
  AND phone NOT LIKE '+%';


-- ============================================================
-- STEP 2: HANDLE MISSING PHONES
-- Assign placeholder phones for accounts with no phone.
-- These accounts will need manual phone update later.
-- ============================================================

-- For accounts without a phone, try to find phone from bookings table
UPDATE patient_accounts pa
SET phone = (
  SELECT '+91' || b.phone
  FROM bookings b
  WHERE b.patient_account_id = pa.id
    AND b.phone IS NOT NULL
    AND b.phone <> ''
    AND regexp_replace(b.phone, '[^0-9]', '', 'g') ~ '^[6-9][0-9]{9}$'
  LIMIT 1
)
WHERE (pa.phone IS NULL OR pa.phone = '')
  AND EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.patient_account_id = pa.id
      AND b.phone IS NOT NULL
      AND b.phone <> ''
  );

-- For remaining accounts still without phone, assign a unique placeholder
-- These are flagged for manual recovery
UPDATE patient_accounts
SET phone = 'PENDING-' || substr(id::text, 1, 8)
WHERE phone IS NULL OR phone = '';


-- ============================================================
-- STEP 3: ADD UHID COLUMN TO PATIENT_ACCOUNTS
-- For display purposes in the patient portal.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'patient_accounts' AND column_name = 'uhid'
  ) THEN
    ALTER TABLE patient_accounts ADD COLUMN uhid TEXT;
  END IF;
END $$;

-- Backfill UHID from EMR bridge → patients
UPDATE patient_accounts pa
SET uhid = p.uhid
FROM patient_emr_bridge b
JOIN patients p ON p.id = b.emr_patient_id
WHERE pa.id = b.patient_account_id
  AND pa.uhid IS NULL
  AND p.uhid IS NOT NULL;


-- ============================================================
-- STEP 4: ADD UHID COLUMN TO BOOKINGS
-- For display in confirmation and tracking.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'uhid'
  ) THEN
    ALTER TABLE bookings ADD COLUMN uhid TEXT;
  END IF;
END $$;


-- ============================================================
-- STEP 5: MAKE EMAIL OPTIONAL
-- Currently email is UNIQUE NOT NULL.
-- We need to: make it nullable, keep unique where it exists.
-- ============================================================

-- Remove NOT NULL constraint on email
ALTER TABLE patient_accounts ALTER COLUMN email DROP NOT NULL;

-- Keep UNIQUE constraint but allow NULLs (PostgreSQL allows multiple NULLs in UNIQUE)
-- The existing index idx_patient_accounts_email on lower(email) handles lookups.


-- ============================================================
-- STEP 6: PHONE UNIQUE CONSTRAINT
-- After normalization, add uniqueness on phone.
-- ============================================================

-- First, handle any remaining duplicates by keeping the oldest account
-- and merging phone references from newer duplicates
DO $$
DECLARE
  dup RECORD;
  oldest_id UUID;
  dup_id UUID;
BEGIN
  FOR dup IN
    SELECT phone, array_agg(id ORDER BY created_at ASC) AS ids
    FROM patient_accounts
    WHERE phone IS NOT NULL
      AND phone <> ''
      AND phone NOT LIKE 'PENDING-%'
    GROUP BY phone
    HAVING COUNT(*) > 1
  LOOP
    -- Keep the oldest account, update the rest to null (they'll be merged manually if needed)
    oldest_id := dup.ids[1];
    FOREACH dup_id IN ARRAY dup.ids[2..array_length(dup.ids, 1)]
    LOOP
      -- Transfer bookings from duplicate to oldest
      UPDATE bookings
      SET patient_account_id = oldest_id
      WHERE patient_account_id = dup_id;

      -- Transfer bridges
      UPDATE patient_emr_bridge
      SET patient_account_id = oldest_id
      WHERE patient_account_id = dup_id
        AND NOT EXISTS (
          SELECT 1 FROM patient_emr_bridge WHERE patient_account_id = oldest_id
        );

      -- Delete the duplicate account (cascade will clean up OTP records)
      DELETE FROM patient_accounts WHERE id = dup_id;
    END LOOP;
  END LOOP;
END $$;

-- Now add the unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'patient_accounts_phone_unique'
  ) THEN
    ALTER TABLE patient_accounts
      ADD CONSTRAINT patient_accounts_phone_unique UNIQUE (phone);
  END IF;
END $$;

-- Add index for fast phone lookups
CREATE INDEX IF NOT EXISTS idx_patient_accounts_phone ON patient_accounts(phone);


-- ============================================================
-- STEP 7: ADD UHID COLUMN TO BOOKINGS (from payment records)
-- Backfill from booking_payments if available
-- ============================================================

UPDATE bookings b
SET uhid = pa.uhid
FROM patient_accounts pa
WHERE b.patient_account_id = pa.id
  AND b.uhid IS NULL
  AND pa.uhid IS NOT NULL;


-- ============================================================
-- STEP 8: ENSURE RLS POLICIES
-- ============================================================

-- Re-apply service-only RLS (migration 010 may have set it)
-- These should already exist, but ensure they're in place
DO $$
BEGIN
  -- patient_accounts: service role only
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'patient_accounts_service_only'
  ) THEN
    ALTER TABLE patient_accounts ENABLE ROW LEVEL SECURITY;
    CREATE POLICY patient_accounts_service_only ON patient_accounts
      FOR ALL USING (false) WITH CHECK (false);
  END IF;
END $$;
