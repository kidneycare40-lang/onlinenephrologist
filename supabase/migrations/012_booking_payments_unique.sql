-- ============================================================
-- 012_booking_payments_unique.sql
-- Add unique constraint on booking_id so upsert works
-- ============================================================

-- Drop the existing index and replace with a unique constraint
DROP INDEX IF EXISTS public.idx_booking_payments_booking_id;

-- Add unique constraint (required for PostgREST upsert with onConflict)
ALTER TABLE public.booking_payments
  ADD CONSTRAINT booking_payments_booking_id_key UNIQUE (booking_id);
