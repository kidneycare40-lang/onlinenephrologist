-- ============================================================
-- 018_location_based_pricing.sql
-- Add current_location to bookings for location-based pricing.
-- India = INR, Outside India = USD.
-- ============================================================

-- 1. Add current_location column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'current_location'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN current_location TEXT DEFAULT 'india';
  END IF;
END $$;

-- 2. Backfill from existing isInternational flag
UPDATE public.bookings
SET current_location = 'outside_india'
WHERE is_international = true OR consultation_type = 'online_intl';

-- 3. Index for location-based queries
CREATE INDEX IF NOT EXISTS idx_bookings_current_location ON public.bookings (current_location);

COMMENT ON COLUMN public.bookings.current_location IS 'Patient current location: india or outside_india. Determines consultation currency (INR vs USD).';
