-- ============================================================
-- Migration 011: Universal Key-Value Store
-- Replaces all localStorage usage with server-side storage
-- ============================================================

-- Universal key-value store for app settings, EMR data, etc.
CREATE TABLE IF NOT EXISTS app_kv_store (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_key VARCHAR(255) NOT NULL UNIQUE,
  store_value JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_app_kv_store_key ON app_kv_store(store_key);

-- RLS: allow service_role full access (bypasses RLS anyway)
ALTER TABLE app_kv_store ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON app_kv_store
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Seed default booking settings
INSERT INTO app_kv_store (store_key, store_value) VALUES
  ('booking-settings', '{
    "schedules": [
      {"clinicId":"kcc-faridabad","clinicName":"Kidney Care Centre - Faridabad","consultationType":"in-clinic","enabled":true,"workingDays":[1,2,3,4,5,6],"startTime":"09:00","endTime":"10:30","slotInterval":5,"breakStart":"","breakEnd":"","maxPatientsPerDay":20,"fee":500,"currency":"INR","description":"In-person consultation at Old Faridabad clinic"},
      {"clinicId":"kcc-saket","clinicName":"Kidney Care Centre - Saket","consultationType":"in-clinic","enabled":true,"workingDays":[1,2,3,4,5,6,0],"startTime":"21:00","endTime":"23:00","slotInterval":10,"breakStart":"","breakEnd":"","maxPatientsPerDay":12,"fee":1200,"currency":"INR","description":"In-person consultation at Saket, New Delhi"},
      {"clinicId":"psri-delhi","clinicName":"PSRI Hospital Delhi","consultationType":"hospital","enabled":true,"workingDays":[1,2,3,4,5,6],"startTime":"13:00","endTime":"18:30","slotInterval":10,"breakStart":"15:00","breakEnd":"15:30","maxPatientsPerDay":30,"fee":1000,"currency":"INR","description":"In-person consultation at PSRI Hospital"},
      {"clinicId":"online","clinicName":"Online Consultation (India)","consultationType":"online","enabled":true,"workingDays":[1,2,3,4,5,6,0],"startTime":"07:00","endTime":"23:00","slotInterval":15,"breakStart":"","breakEnd":"","maxPatientsPerDay":50,"fee":500,"currency":"INR","description":"Video consultation for patients in India"},
      {"clinicId":"online-intl","clinicName":"International Video Consultation","consultationType":"online-intl","enabled":true,"workingDays":[1,2,3,4,5,6,0],"startTime":"07:00","endTime":"23:00","slotInterval":15,"breakStart":"","breakEnd":"","maxPatientsPerDay":20,"fee":25,"currency":"USD","description":"Video consultation for international patients ($25 USD)"}
    ],
    "holidays": [],
    "rules": {
      "maxAdvanceBookingDays": 30,
      "minAdvanceBookingHours": 2,
      "allowSameDayBooking": true,
      "cancellationAllowed": true,
      "cancellationHoursBefore": 4,
      "autoConfirmBookings": false,
      "requirePaymentUpfront": false
    },
    "onlineBooking": {
      "enabled": true,
      "showOnWebsite": true,
      "requirePhone": true,
      "requireEmail": false,
      "allowFileUpload": true,
      "maxFileSize": 10
    },
    "noticeBoard": {
      "enabled": false,
      "message": "",
      "type": "info"
    },
    "paymentGateway": {
      "enabled": true,
      "provider": "razorpay",
      "razorpayKeyId": "",
      "razorpayKeySecret": "",
      "upiId": "9818235688@pthdfc",
      "currency": "INR",
      "requirePaymentForOnline": true,
      "requirePaymentForClinic": true
    },
    "international": {
      "enabled": true,
      "countries": ["United States","United Kingdom","Australia","Canada","UAE","Saudi Arabia","Singapore","Malaysia","Bangladesh","Nepal","Sri Lanka","Africa","Germany","France","Japan","Other"],
      "timezones": ["IST (India, UTC+5:30)","EST (US East, UTC-5)","CST (US Central, UTC-6)","PST (US Pacific, UTC-8)","GMT (UK, UTC+0)","CET (Europe, UTC+1)","AEST (Australia East, UTC+10)","JST (Japan, UTC+9)","GST (Dubai, UTC+4)","Other"],
      "conditions": ["Chronic Kidney Disease (CKD)","Kidney Failure","Dialysis Management","Kidney Transplant","Kidney Stones","High Creatinine","Diabetic Kidney Disease","Hypertension","Second Opinion","Other"],
      "fee": 25,
      "currency": "USD",
      "requireCountry": true,
      "requireTimezone": true,
      "requireMessage": true,
      "allowedLanguages": ["English","Hindi","Arabic","French","Spanish","German","Japanese"],
      "maxAdvanceBookingDays": 30,
      "autoConfirm": false
    }
  }'::jsonb)
ON CONFLICT (store_key) DO NOTHING;
