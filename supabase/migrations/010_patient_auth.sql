-- ============================================================
-- 010_patient_auth.sql
-- Patient account system: email-based OTP authentication,
-- permanent patient accounts, server-side appointment storage.
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

-- 3. Patient appointments — server-side appointment records
CREATE TABLE IF NOT EXISTS public.patient_appointments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_number TEXT UNIQUE NOT NULL,
  patient_id        UUID NOT NULL REFERENCES public.patient_accounts(id) ON DELETE CASCADE,
  doctor_name       TEXT NOT NULL DEFAULT 'Dr Rajesh Goel',
  clinic_id         TEXT NOT NULL,
  clinic_name       TEXT,
  appointment_type  TEXT NOT NULL DEFAULT 'online',
  appointment_date  DATE NOT NULL,
  appointment_time  TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending',
  booking_source    TEXT NOT NULL DEFAULT 'website',
  reason            TEXT,
  complaints        TEXT,
  reports           JSONB DEFAULT '[]'::jsonb,
  consultation_fee  NUMERIC(10,2),
  currency          TEXT NOT NULL DEFAULT 'INR',
  payment_status    TEXT NOT NULL DEFAULT 'unpaid',
  payment_id        TEXT,
  doctor_whatsapp_sent BOOLEAN NOT NULL DEFAULT false,
  patient_whatsapp_sent BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_appointments_patient ON public.patient_appointments (patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_appointments_date ON public.patient_appointments (appointment_date);
CREATE INDEX IF NOT EXISTS idx_patient_appointments_status ON public.patient_appointments (status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_patient_appointments_no_duplicate_same_day
  ON public.patient_appointments (patient_id, clinic_id, appointment_date, appointment_time)
  WHERE status IN ('pending', 'confirmed', 'booked');

-- 4. Add patient_account_id to existing bookings table so we can link them
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

-- 5. RLS policies — service role bypasses, but enable for safety
ALTER TABLE public.patient_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_otp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_appointments ENABLE ROW LEVEL SECURITY;

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

-- patient_appointments: service role only
DROP POLICY IF EXISTS "patient_appointments_service_only" ON public.patient_appointments;
CREATE POLICY "patient_appointments_service_only"
  ON public.patient_appointments FOR ALL
  USING (false);
