-- 027_data_api_grants.sql
-- Future-proofing for the Supabase Data API grant change (effective Oct 30, 2026):
-- new tables in the public schema no longer receive automatic grants.
-- Existing tables keep their grants, but any FUTURE migration that creates a
-- table must include explicit GRANTs (template at the bottom of this file).
--
-- This migration is idempotent and only adds grants — it changes no data and
-- does not touch RLS policies. The app's server client authenticates as
-- service_role (src/lib/db/client.ts) and bypasses RLS; the API middleware
-- layer enforces authorization.

-- 1) service_role: full data access on every existing public table.
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO service_role', t);
  END LOOP;
END $$;

-- 2) service_role: sequence access (needed for identity/serial columns on insert).
DO $$
DECLARE s TEXT;
BEGIN
  FOR s IN SELECT sequencename FROM pg_sequences WHERE schemaname = 'public' LOOP
    EXECUTE format('GRANT USAGE, SELECT ON public.%I TO service_role', s);
  END LOOP;
END $$;

-- ============================================================
-- TEMPLATE for future migrations that CREATE tables in public:
--
--   GRANT SELECT, INSERT, UPDATE, DELETE
--   ON public.your_new_table
--   TO service_role;
--
-- (RLS must also be enabled on the new table — the app relies on the
-- service_role key plus API-layer authorization.)
-- ============================================================
