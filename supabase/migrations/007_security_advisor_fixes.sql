-- ============================================================
-- FIX: Security Advisor warnings (0 errors → 0 warnings)
-- Safe to re-run
-- ============================================================

-- ============================================================
-- 1. FIX: Function Search Path Mutable (7 functions)
--    Use ALTER FUNCTION to add search_path without replacing body
-- ============================================================

-- update_updated_at (no args, trigger function)
DO $$ BEGIN
  ALTER FUNCTION public.update_updated_at() SET search_path = public;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- update_updated_at_column (no args, trigger function)
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- generate_uhid(clinic_prefix TEXT)
ALTER FUNCTION public.generate_uhid(TEXT) SET search_path = public;

-- generate_invoice_number(clinic_short TEXT)
ALTER FUNCTION public.generate_invoice_number(TEXT) SET search_path = public;

-- generate_prescription_number() (no args)
ALTER FUNCTION public.generate_prescription_number() SET search_path = public;

-- generate_booking_number() (no args)
ALTER FUNCTION public.generate_booking_number() SET search_path = public;

-- refresh_medicine_search() (no args)
ALTER FUNCTION public.refresh_medicine_search() SET search_path = public;

-- ============================================================
-- 2. FIX: Materialized View in API
--    Revoke direct API access to mv_medicine_search
-- ============================================================
REVOKE ALL ON public.mv_medicine_search FROM anon, authenticated;
GRANT SELECT ON public.mv_medicine_search TO service_role;

-- ============================================================
-- 3. FIX: RLS Policy Always True (emr_store)
--    Replace overly permissive policy with authenticated-only
-- ============================================================
DO $$ BEGIN
  DROP POLICY IF EXISTS "Allow all" ON public.emr_store;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'emr_store_select' AND tablename = 'emr_store') THEN
    CREATE POLICY emr_store_select ON emr_store FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'emr_store_insert' AND tablename = 'emr_store') THEN
    CREATE POLICY emr_store_insert ON emr_store FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'emr_store_update' AND tablename = 'emr_store') THEN
    CREATE POLICY emr_store_update ON emr_store FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'emr_store_delete' AND tablename = 'emr_store') THEN
    CREATE POLICY emr_store_delete ON emr_store FOR DELETE USING (auth.role() = 'authenticated');
  END IF;
END $$;
