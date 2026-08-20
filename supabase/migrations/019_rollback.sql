-- ============================================================
-- ROLLBACK: Migration 019
-- ============================================================
-- This removes all new tables and types created in Migration 019.
-- The app_kv_store 'booking-settings' key is PRESERVED for fallback.
-- After rollback, revert API/UI code to read from KV store.
-- ============================================================

DROP TABLE IF EXISTS booking_settings_audit CASCADE;
DROP TABLE IF EXISTS booking_service_schedule_periods CASCADE;
DROP TABLE IF EXISTS booking_service_schedules CASCADE;
DROP TABLE IF EXISTS booking_settings CASCADE;
DROP TABLE IF EXISTS booking_holidays CASCADE;
DROP TABLE IF EXISTS booking_services CASCADE;
DROP TYPE IF EXISTS consultation_type_enum CASCADE;
DROP TYPE IF EXISTS clinic_type_enum CASCADE;

-- Verify rollback:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name LIKE 'booking\_%';
-- Expected: 0 rows (only old booking_payments and bookings remain)
