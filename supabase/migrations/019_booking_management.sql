-- ============================================================
-- Migration 019: Booking Management — Single Source of Truth
-- ============================================================
-- PURPOSE: Replace KV store 'booking-settings' with relational
--          tables as the single source of truth for public
--          /book-appointment configuration.
--
-- PRESERVED (NOT MODIFIED):
--   - app_kv_store (old data kept for rollback)
--   - bookings, booking_payments, notification_log
--   - follow_up_entitlements, patient_emr_bridge
--   - Migration 017 (family booking)
--   - Migration 018 (location-based pricing)
--   - All Razorpay webhook/verify architecture
--   - All notification architecture
--
-- ROLLBACK:
--   DROP TABLE IF EXISTS booking_settings_audit,
--     booking_service_schedule_periods,
--     booking_service_schedules,
--     booking_settings,
--     booking_holidays,
--     booking_services;
--   DROP TYPE IF EXISTS consultation_type_enum;
--   DROP TYPE IF EXISTS clinic_type_enum;
-- ============================================================

-- ============================================================
-- STEP 0: PRE-MIGRATION SAFETY CHECK
-- Verify none of these tables/types already exist.
-- If any exist, the migration will FAIL (not silently skip).
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'booking_services') THEN
    RAISE EXCEPTION 'PRE-CHECK FAILED: table booking_services already exists. Investigate before re-running migration.';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'booking_service_schedules') THEN
    RAISE EXCEPTION 'PRE-CHECK FAILED: table booking_service_schedules already exists.';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'booking_service_schedule_periods') THEN
    RAISE EXCEPTION 'PRE-CHECK FAILED: table booking_service_schedule_periods already exists.';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'booking_holidays') THEN
    RAISE EXCEPTION 'PRE-CHECK FAILED: table booking_holidays already exists.';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'booking_settings') THEN
    RAISE EXCEPTION 'PRE-CHECK FAILED: table booking_settings already exists.';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'booking_settings_audit') THEN
    RAISE EXCEPTION 'PRE-CHECK FAILED: table booking_settings_audit already exists.';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'clinic_type_enum') THEN
    RAISE EXCEPTION 'PRE-CHECK FAILED: type clinic_type_enum already exists.';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'consultation_type_enum') THEN
    RAISE EXCEPTION 'PRE-CHECK FAILED: type consultation_type_enum already exists.';
  END IF;
END $$;


-- ============================================================
-- STEP 1: ENUM TYPES
-- ============================================================

CREATE TYPE clinic_type_enum AS ENUM ('clinic', 'hospital', 'online');
CREATE TYPE consultation_type_enum AS ENUM ('in-clinic', 'online', 'online-intl', 'hospital');


-- ============================================================
-- STEP 2: BOOKING SERVICES
-- One row per clinic/service offering.
-- This is the SERVER-AUTHORITATIVE pricing source.
-- create-order MUST read fee/currency from here.
-- ============================================================

CREATE TABLE booking_services (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  TEXT NOT NULL UNIQUE,
  name                  TEXT NOT NULL,
  enabled               BOOLEAN NOT NULL DEFAULT true,

  -- clinic details
  clinic_name           TEXT,
  clinic_type           clinic_type_enum NOT NULL DEFAULT 'clinic',
  consultation_type     consultation_type_enum NOT NULL DEFAULT 'in-clinic',
  address               TEXT,
  city                  TEXT,
  state                 TEXT,
  country               TEXT DEFAULT 'India',
  timezone              TEXT DEFAULT 'Asia/Kolkata',
  maps_url              TEXT,

  -- pricing (server-authoritative)
  fee                   NUMERIC(10,2) NOT NULL CHECK (fee >= 0),
  currency              TEXT NOT NULL DEFAULT 'INR' CHECK (currency IN ('INR', 'USD')),
  fee_label             TEXT,

  -- description shown to patients
  description           TEXT,

  -- booking constraints per service
  max_appointments_per_day  INTEGER NOT NULL DEFAULT 20 CHECK (max_appointments_per_day > 0),
  min_advance_minutes       INTEGER NOT NULL DEFAULT 120 CHECK (min_advance_minutes >= 0),
  max_advance_days          INTEGER NOT NULL DEFAULT 30 CHECK (max_advance_days > 0),

  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_booking_services_slug ON booking_services(slug);
CREATE INDEX idx_booking_services_enabled ON booking_services(enabled) WHERE enabled = true;


-- ============================================================
-- STEP 3: BOOKING SERVICE SCHEDULES
-- One row per service per day-of-week.
-- The actual time periods are in the child table below.
-- ============================================================

CREATE TABLE booking_service_schedules (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id            UUID NOT NULL REFERENCES booking_services(id) ON DELETE CASCADE,
  day_of_week           INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  enabled               BOOLEAN NOT NULL DEFAULT true,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (service_id, day_of_week)
);

CREATE INDEX idx_booking_schedules_service ON booking_service_schedules(service_id);


-- ============================================================
-- STEP 4: BOOKING SERVICE SCHEDULE PERIODS
-- Unlimited periods per schedule row.
--
-- Architecture:
--   schedule (Mon) → period 1: 09:00–12:00
--                  → period 2: 13:00–17:00
--                  → period 3: 18:00–20:00  (if needed)
--
-- Current PSRI example:
--   schedule (Mon) → period 1: 13:00–15:00
--                  → period 2: 15:30–18:30
--
-- A schedule with no periods = no bookings that day.
-- A schedule with 1 period = continuous block (no breaks).
-- A schedule with 2+ periods = breaks between periods.
-- ============================================================

CREATE TABLE booking_service_schedule_periods (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id           UUID NOT NULL REFERENCES booking_service_schedules(id) ON DELETE CASCADE,
  start_time            TIME NOT NULL,
  end_time              TIME NOT NULL,
  slot_interval_minutes INTEGER NOT NULL DEFAULT 15 CHECK (slot_interval_minutes > 0),
  sort_order            INTEGER NOT NULL DEFAULT 0,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (end_time > start_time),
  CHECK (slot_interval_minutes > 0),
  UNIQUE (schedule_id, sort_order)
);

CREATE INDEX idx_schedule_periods_schedule ON booking_service_schedule_periods(schedule_id);


-- ============================================================
-- STEP 4b: PREVENT OVERLAPPING SCHEDULE PERIODS
-- ============================================================

CREATE OR REPLACE FUNCTION prevent_overlapping_periods()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM booking_service_schedule_periods p
    WHERE p.schedule_id = NEW.schedule_id
      AND p.id IS DISTINCT FROM NEW.id
      AND p.start_time < NEW.end_time
      AND p.end_time > NEW.start_time
  ) THEN
    RAISE EXCEPTION 'Schedule period overlaps with an existing period. %–% conflicts.',
      NEW.start_time, NEW.end_time;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_overlapping_periods
  BEFORE INSERT OR UPDATE ON booking_service_schedule_periods
  FOR EACH ROW
  EXECUTE FUNCTION prevent_overlapping_periods();


-- ============================================================
-- STEP 5: BOOKING HOLIDAYS
-- Blocked dates when no appointments are available.
-- ============================================================

CREATE TABLE booking_holidays (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date            DATE NOT NULL,
  end_date              DATE NOT NULL,
  title                 TEXT NOT NULL,
  reason                TEXT,
  scope                 TEXT NOT NULL DEFAULT 'all',
  service_id            UUID REFERENCES booking_services(id) ON DELETE CASCADE,
  enabled               BOOLEAN NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (end_date >= start_date),

  -- scope='all' requires service_id IS NULL
  -- scope='service' requires service_id IS NOT NULL
  CHECK (
    (scope = 'all' AND service_id IS NULL)
    OR
    (scope = 'service' AND service_id IS NOT NULL)
  ),

  CHECK (scope IN ('all', 'service'))
);

-- Prevent duplicate holidays: same title+date range+scope
-- Two 'all' holidays cannot overlap on the same start_date
CREATE UNIQUE INDEX idx_holidays_unique_all
  ON booking_holidays(start_date, title)
  WHERE scope = 'all' AND enabled = true;

-- Two holidays for the same service cannot share the same start_date
CREATE UNIQUE INDEX idx_holidays_unique_service
  ON booking_holidays(start_date, service_id)
  WHERE scope = 'service' AND enabled = true;

CREATE INDEX idx_booking_holidays_dates ON booking_holidays(start_date, end_date);
CREATE INDEX idx_booking_holidays_scope ON booking_holidays(scope, service_id);


-- ============================================================
-- STEP 5b: PREVENT OVERLAPPING HOLIDAYS
-- ============================================================

CREATE OR REPLACE FUNCTION prevent_overlapping_holidays()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.scope = 'all' THEN
    IF EXISTS (
      SELECT 1 FROM booking_holidays h
      WHERE h.scope = 'all'
        AND h.enabled = true
        AND h.id IS DISTINCT FROM NEW.id
        AND h.start_date <= NEW.end_date
        AND h.end_date >= NEW.start_date
    ) THEN
      RAISE EXCEPTION 'Holiday overlaps with an existing global holiday. Range: % to %',
        NEW.start_date, NEW.end_date;
    END IF;
  ELSE
    IF EXISTS (
      SELECT 1 FROM booking_holidays h
      WHERE h.scope = 'service'
        AND h.service_id = NEW.service_id
        AND h.enabled = true
        AND h.id IS DISTINCT FROM NEW.id
        AND h.start_date <= NEW.end_date
        AND h.end_date >= NEW.start_date
    ) THEN
      RAISE EXCEPTION 'Holiday overlaps with an existing holiday for this service. Range: % to %',
        NEW.start_date, NEW.end_date;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_overlapping_holidays
  BEFORE INSERT OR UPDATE ON booking_holidays
  FOR EACH ROW
  EXECUTE FUNCTION prevent_overlapping_holidays();


-- ============================================================
-- STEP 6: BOOKING SETTINGS
-- Key-value store for non-relational configuration.
-- Fees, schedules, and availability are NOT stored here.
-- ============================================================

CREATE TABLE booking_settings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key           TEXT NOT NULL UNIQUE,
  setting_value         JSONB NOT NULL,
  description           TEXT,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by            UUID,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_booking_settings_key ON booking_settings(setting_key);


-- ============================================================
-- STEP 7: BOOKING SETTINGS AUDIT
-- Change log for all booking configuration modifications.
-- ============================================================

CREATE TABLE booking_settings_audit (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action                TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
  entity_type           TEXT NOT NULL,
  entity_id             TEXT,
  field_changed        TEXT,
  old_value            JSONB,
  new_value            JSONB,
  changed_by           UUID,
  changed_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_booking_audit_entity ON booking_settings_audit(entity_type, entity_id);
CREATE INDEX idx_booking_audit_time ON booking_settings_audit(changed_at);
CREATE INDEX idx_booking_audit_action ON booking_settings_audit(action);


-- ============================================================
-- STEP 8: RLS POLICIES
-- ============================================================
-- All tables: service_role full access (bypasses RLS).
-- Public browser access goes through /api/public/booking-config,
-- NOT direct Supabase queries. RLS is defense-in-depth only.
-- ============================================================

ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_service_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_service_schedule_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_settings_audit ENABLE ROW LEVEL SECURITY;

-- No public SELECT policies.
-- Public access is via API routes using service_role key.
-- This prevents browser-side direct queries to config tables.


-- ============================================================
-- STEP 9: SEED DATA — BOOKING SERVICES (5 services)
-- Values migrated exactly from app_kv_store 'booking-settings'
-- ============================================================

INSERT INTO booking_services (slug, name, enabled, clinic_name, clinic_type, consultation_type, fee, currency, fee_label, description, address, city, state, country, timezone, max_appointments_per_day, min_advance_minutes, max_advance_days) VALUES

('kcc-faridabad',
 'Kidney Care Centre - Faridabad',
 true,
 'Kidney Care Centre',
 'clinic',
 'in-clinic',
 500,
 'INR',
 '₹500',
 'In-person consultation at Kidney Care Centre, Faridabad',
 NULL,
 'Faridabad',
 'Haryana',
 'India',
 'Asia/Kolkata',
 20,
 120,
 30),

('kcc-saket',
 'Kidney Care Centre - Saket',
 true,
 'Kidney Care Centre',
 'clinic',
 'in-clinic',
 1200,
 'INR',
 '₹1,200',
 'In-person consultation at Kidney Care Centre, Saket',
 NULL,
 'New Delhi',
 'Delhi',
 'India',
 'Asia/Kolkata',
 12,
 120,
 30),

('psri-delhi',
 'PSRI Hospital Delhi',
 true,
 'PSRI Hospital',
 'hospital',
 'hospital',
 1000,
 'INR',
 '₹1,000',
 'Hospital consultation at PSRI Hospital, Delhi',
 NULL,
 'New Delhi',
 'Delhi',
 'India',
 'Asia/Kolkata',
 30,
 120,
 30),

('online',
 'Online Consultation (India)',
 true,
 NULL,
 'online',
 'online',
 500,
 'INR',
 '₹500',
 'Online video consultation for patients currently located in India',
 NULL,
 NULL,
 NULL,
 'India',
 'Asia/Kolkata',
 50,
 120,
 30),

('online-intl',
 'International Video Consultation',
 true,
 NULL,
 'online',
 'online-intl',
 25,
 'USD',
 '$25 USD',
 'Video consultation for patients currently located outside India. Your current physical location determines the consultation type and fee, not your nationality.',
 NULL,
 NULL,
 NULL,
 NULL,
 'Asia/Kolkata',
 20,
 120,
 30)

ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- STEP 10: SEED DATA — SCHEDULES + PERIODS
-- ============================================================
-- Architecture: schedule row = service + day_of_week
--               period rows = time blocks within that day
--
-- Example for PSRI (has a break):
--   schedule: psri-delhi + Monday
--   period 1: 13:00–15:00, 10min slots
--   period 2: 15:30–18:30, 10min slots
--
-- Example for KCC Faridabad (no break):
--   schedule: kcc-faridabad + Monday
--   period 1: 09:00–10:30, 5min slots
-- ============================================================

-- KCC Faridabad: Mon-Sat (1-6), 09:00-10:30, 5min slots, 1 period
INSERT INTO booking_service_schedules (service_id, day_of_week)
SELECT id, generate_series(1, 6) FROM booking_services WHERE slug = 'kcc-faridabad'
ON CONFLICT (service_id, day_of_week) DO NOTHING;

INSERT INTO booking_service_schedule_periods (schedule_id, start_time, end_time, slot_interval_minutes, sort_order)
SELECT ss.id, '09:00'::time, '10:30'::time, 5, 1
FROM booking_service_schedules ss
JOIN booking_services s ON ss.service_id = s.id
WHERE s.slug = 'kcc-faridabad'
ON CONFLICT DO NOTHING;

-- KCC Saket: Sun-Sat (0-6), 21:00-23:00, 10min slots, 1 period
INSERT INTO booking_service_schedules (service_id, day_of_week)
SELECT id, generate_series(0, 6) FROM booking_services WHERE slug = 'kcc-saket'
ON CONFLICT (service_id, day_of_week) DO NOTHING;

INSERT INTO booking_service_schedule_periods (schedule_id, start_time, end_time, slot_interval_minutes, sort_order)
SELECT ss.id, '21:00'::time, '23:00'::time, 10, 1
FROM booking_service_schedules ss
JOIN booking_services s ON ss.service_id = s.id
WHERE s.slug = 'kcc-saket'
ON CONFLICT DO NOTHING;

-- PSRI Delhi: Mon-Sat (1-6), 13:00-18:30, 10min slots, 2 periods (break 15:00-15:30)
INSERT INTO booking_service_schedules (service_id, day_of_week)
SELECT id, generate_series(1, 6) FROM booking_services WHERE slug = 'psri-delhi'
ON CONFLICT (service_id, day_of_week) DO NOTHING;

INSERT INTO booking_service_schedule_periods (schedule_id, start_time, end_time, slot_interval_minutes, sort_order)
SELECT ss.id, '13:00'::time, '15:00'::time, 10, 1
FROM booking_service_schedules ss
JOIN booking_services s ON ss.service_id = s.id
WHERE s.slug = 'psri-delhi'
ON CONFLICT DO NOTHING;

INSERT INTO booking_service_schedule_periods (schedule_id, start_time, end_time, slot_interval_minutes, sort_order)
SELECT ss.id, '15:30'::time, '18:30'::time, 10, 2
FROM booking_service_schedules ss
JOIN booking_services s ON ss.service_id = s.id
WHERE s.slug = 'psri-delhi'
ON CONFLICT DO NOTHING;

-- Online India: Sun-Sat (0-6), 07:00-23:00, 15min slots, 1 period
INSERT INTO booking_service_schedules (service_id, day_of_week)
SELECT id, generate_series(0, 6) FROM booking_services WHERE slug = 'online'
ON CONFLICT (service_id, day_of_week) DO NOTHING;

INSERT INTO booking_service_schedule_periods (schedule_id, start_time, end_time, slot_interval_minutes, sort_order)
SELECT ss.id, '07:00'::time, '23:00'::time, 15, 1
FROM booking_service_schedules ss
JOIN booking_services s ON ss.service_id = s.id
WHERE s.slug = 'online'
ON CONFLICT DO NOTHING;

-- Online Intl: Sun-Sat (0-6), 07:00-23:00, 15min slots, 1 period
-- Timezone: Asia/Kolkata (doctor's availability, not patient's)
INSERT INTO booking_service_schedules (service_id, day_of_week)
SELECT id, generate_series(0, 6) FROM booking_services WHERE slug = 'online-intl'
ON CONFLICT (service_id, day_of_week) DO NOTHING;

INSERT INTO booking_service_schedule_periods (schedule_id, start_time, end_time, slot_interval_minutes, sort_order)
SELECT ss.id, '07:00'::time, '23:00'::time, 15, 1
FROM booking_service_schedules ss
JOIN booking_services s ON ss.service_id = s.id
WHERE s.slug = 'online-intl'
ON CONFLICT DO NOTHING;


-- ============================================================
-- STEP 11: SEED DATA — BOOKING SETTINGS (5 keys)
-- Migrated from app_kv_store 'booking-settings' sub-objects
-- ============================================================

INSERT INTO booking_settings (setting_key, setting_value, description) VALUES

('rules', '{
  "maxAdvanceBookingDays": 30,
  "minAdvanceBookingHours": 2,
  "allowSameDayBooking": true,
  "cancellationAllowed": true,
  "cancellationHoursBefore": 4,
  "autoConfirmBookings": false,
  "requirePaymentUpfront": false
}'::jsonb, 'General booking rules and constraints'),

('online_booking', '{
  "enabled": true,
  "showOnWebsite": true,
  "requirePhone": true,
  "requireEmail": false,
  "allowFileUpload": true,
  "maxFileSize": 10
}'::jsonb, 'Online booking page settings'),

('payment_gateway', '{
  "enabled": true,
  "provider": "razorpay",
  "requirePaymentForOnline": true,
  "requirePaymentForClinic": true
}'::jsonb, 'Payment gateway config. Secrets (key_id, key_secret) remain in env vars only.'),

('notice_board', '{
  "enabled": false,
  "message": "",
  "type": "info"
}'::jsonb, 'Notice displayed on public booking page'),

('international', '{
  "enabled": true,
  "countries": [
    "United States", "United Kingdom", "Australia", "Canada",
    "UAE", "Saudi Arabia", "Singapore", "Malaysia",
    "Bangladesh", "Nepal", "Sri Lanka", "Nigeria",
    "Kenya", "Germany", "France", "Japan", "Other"
  ],
  "timezones": [
    "IST (India, UTC+5:30)", "EST (US East, UTC-5)",
    "CST (US Central, UTC-6)", "PST (US Pacific, UTC-8)",
    "GMT (UK, UTC+0)", "CET (Europe, UTC+1)",
    "AEST (Australia East, UTC+10)", "JST (Japan, UTC+9)",
    "GST (Dubai, UTC+4)", "Other"
  ],
  "conditions": [
    "Chronic Kidney Disease (CKD)", "Kidney Failure",
    "Dialysis Management", "Kidney Transplant",
    "Kidney Stones", "High Creatinine",
    "Diabetic Kidney Disease", "Hypertension",
    "Second Opinion", "Other"
  ],
  "allowedLanguages": ["English", "Hindi", "Arabic", "French", "Spanish", "German", "Japanese"],
  "requireCountry": true,
  "requireTimezone": true,
  "requireMessage": true,
  "autoConfirm": false,
  "maxAdvanceBookingDays": 30
}'::jsonb, 'International booking configuration')

ON CONFLICT (setting_key) DO NOTHING;


-- ============================================================
-- STEP 12: VERIFICATION QUERIES
-- Run these after migration to confirm correctness.
-- ============================================================

-- 1. Service count
-- SELECT COUNT(*) AS service_count FROM booking_services;
-- Expected: 5

-- 2. All services with fees
-- SELECT slug, name, fee, currency, consultation_type, enabled, timezone
-- FROM booking_services ORDER BY fee, slug;

-- 3. Schedule + period count per service
-- SELECT s.slug, COUNT(DISTINCT ss.id) AS schedule_count, COUNT(DISTINCT p.id) AS period_count
-- FROM booking_services s
-- LEFT JOIN booking_service_schedules ss ON s.id = ss.service_id
-- LEFT JOIN booking_service_schedule_periods p ON ss.id = p.schedule_id
-- GROUP BY s.slug ORDER BY s.slug;

-- 4. PSRI periods (should show 2 per day: 13:00-15:00 and 15:30-18:30)
-- SELECT ss.day_of_week, p.start_time, p.end_time, p.slot_interval_minutes
-- FROM booking_service_schedule_periods p
-- JOIN booking_service_schedules ss ON p.schedule_id = ss.id
-- JOIN booking_services s ON ss.service_id = s.id
-- WHERE s.slug = 'psri-delhi' AND ss.day_of_week = 1
-- ORDER BY p.sort_order;

-- 5. Settings keys
-- SELECT setting_key, description FROM booking_settings ORDER BY setting_key;
-- Expected: international, notice_board, online_booking, payment_gateway, rules

-- 6. International countries (should be 17, not 16 — "Africa" replaced with "Nigeria" + "Kenya")
-- SELECT setting_value->'countries' AS countries FROM booking_settings WHERE setting_key = 'international';

-- 7. Timezone verification (online-intl should be Asia/Kolkata, NOT UTC)
-- SELECT slug, timezone FROM booking_services WHERE slug = 'online-intl';
-- Expected: Asia/Kolkata
