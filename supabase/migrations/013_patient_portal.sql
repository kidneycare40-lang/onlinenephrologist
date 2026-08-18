-- ============================================================
-- 013_patient_portal.sql
-- Patient Portal: bridge patient_accounts ↔ EMR patients,
-- follow-up entitlements, booking follow-up fields.
--
-- Run in Supabase SQL editor.
-- ============================================================

-- 1. Bridge table: links patient_accounts (portal) to patients (EMR)
CREATE TABLE IF NOT EXISTS public.patient_emr_bridge (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_account_id UUID NOT NULL UNIQUE REFERENCES public.patient_accounts(id) ON DELETE CASCADE,
  emr_patient_id  UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_emr_bridge_account ON public.patient_emr_bridge (patient_account_id);
CREATE INDEX IF NOT EXISTS idx_patient_emr_bridge_emr ON public.patient_emr_bridge (emr_patient_id);

-- 2. Follow-up entitlements: 7-day free follow-up per eligible online consultation
CREATE TABLE IF NOT EXISTS public.follow_up_entitlements (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_account_id    UUID NOT NULL REFERENCES public.patient_accounts(id) ON DELETE CASCADE,
  original_booking_id   TEXT NOT NULL,
  original_payment_id   TEXT,
  consultation_type     TEXT NOT NULL,
  valid_from            TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until           TIMESTAMPTZ NOT NULL,
  status                TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'USED', 'EXPIRED', 'CANCELLED')),
  used_booking_id       TEXT,
  used_at               TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_follow_up_entitlements_account ON public.follow_up_entitlements (patient_account_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_entitlements_booking ON public.follow_up_entitlements (original_booking_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_entitlements_status ON public.follow_up_entitlements (status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_follow_up_entitlements_active_per_booking
  ON public.follow_up_entitlements (patient_account_id, original_booking_id)
  WHERE status = 'ACTIVE';

-- 3. Add follow-up columns to bookings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'is_follow_up'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN is_follow_up BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'follow_up_of'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN follow_up_of TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'follow_up_entitlement_id'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN follow_up_entitlement_id UUID REFERENCES public.follow_up_entitlements(id);
  END IF;
END $$;

-- 4. RLS policies
ALTER TABLE public.patient_emr_bridge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_entitlements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patient_emr_bridge_service_only" ON public.patient_emr_bridge;
CREATE POLICY "patient_emr_bridge_service_only"
  ON public.patient_emr_bridge FOR ALL
  USING (false);

DROP POLICY IF EXISTS "follow_up_entitlements_service_only" ON public.follow_up_entitlements;
CREATE POLICY "follow_up_entitlements_service_only"
  ON public.follow_up_entitlements FOR ALL
  USING (false);
