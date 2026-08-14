-- ============================================================
-- 010_patient_auth.sql
-- Patient account system: email-based OTP authentication,
-- permanent patient accounts linked to existing bookings table.
--
-- Run this in the Supabase SQL editor (or via supabase db push)
-- ============================================================

-- 1. Patient accounts — permanent records keyed by email
CREATE TABLE IF NOT EXISTS public.patient_accounts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  first_name    TEXT NOT NULL DEFAULT '',
  last_name     TEXT NOT NULL DEFAULT '',
  phone         TEXT,
  date_of_birth DATE,
  gender        TEXT,
  address       TEXT,
  city          TEXT,
  country       TEXT,
  timezone      TEXT,
  is_international BOOLEAN NOT NULL DEFAULT false,
  country_code  TEXT,
  passport_number TEXT,
  preferred_language TEXT DEFAULT 'English',
  interpreter_required BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_patient_accounts_email ON public.patient_accounts (lower(email));

-- 2. OTP records for patient email verification
CREATE TABLE IF NOT EXISTS public.patient_otp (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL,
  otp_hash      TEXT NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  attempts      INTEGER NOT NULL DEFAULT 0,
  max_attempts  INTEGER NOT NULL DEFAULT 5,
  verified      BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_otp_email ON public.patient_otp (lower(email));
CREATE INDEX IF NOT EXISTS idx_patient_otp_expires ON public.patient_otp (expires_at);

-- 3. Link bookings to patient accounts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'patient_account_id'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN patient_account_id UUID REFERENCES public.patient_accounts(id);
    CREATE INDEX IF NOT EXISTS idx_bookings_patient_account ON public.bookings (patient_account_id);
  END IF;
END $$;

-- 4. Duplicate booking prevention index on bookings table
-- Prevents same patient + clinic + date + time with active status
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_no_duplicate_same_day
  ON public.bookings (patient_account_id, clinic_id, booking_date, booking_time)
  WHERE patient_account_id IS NOT NULL AND status IN ('pending', 'confirmed', 'booked');

-- 5. RLS policies — service role bypasses, but enable for safety
ALTER TABLE public.patient_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_otp ENABLE ROW LEVEL SECURITY;

-- patient_accounts: service role only (API layer enforces auth)
DROP POLICY IF EXISTS "patient_accounts_service_only" ON public.patient_accounts;
CREATE POLICY "patient_accounts_service_only"
  ON public.patient_accounts FOR ALL
  USING (false);

-- patient_otp: service role only
DROP POLICY IF EXISTS "patient_otp_service_only" ON public.patient_otp;
CREATE POLICY "patient_otp_service_only"
  ON public.patient_otp FOR ALL
  USING (false);
