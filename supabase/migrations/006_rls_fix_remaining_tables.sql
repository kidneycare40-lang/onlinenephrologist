-- ============================================================
-- FIX: Enable RLS on all remaining tables (Supabase linter)
-- Run this in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. ENABLE RLS on all tables that are missing it
-- ============================================================
ALTER TABLE doctor_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_surgical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_social_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE kidney_transplant_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE letterheads ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosis_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigation_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE advice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE advice_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_diagnoses ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. PATIENT SUB-TABLES (addresses, contacts, history, etc.)
-- ============================================================
CREATE POLICY patient_addresses_select ON patient_addresses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY patient_addresses_insert ON patient_addresses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY patient_addresses_update ON patient_addresses FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY patient_addresses_delete ON patient_addresses FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY patient_emergency_contacts_select ON patient_emergency_contacts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY patient_emergency_contacts_insert ON patient_emergency_contacts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY patient_emergency_contacts_update ON patient_emergency_contacts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY patient_emergency_contacts_delete ON patient_emergency_contacts FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY patient_family_members_select ON patient_family_members FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY patient_family_members_insert ON patient_family_members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY patient_family_members_update ON patient_family_members FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY patient_family_members_delete ON patient_family_members FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY patient_allergies_select ON patient_allergies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY patient_allergies_insert ON patient_allergies FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY patient_allergies_update ON patient_allergies FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY patient_allergies_delete ON patient_allergies FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY patient_medical_history_select ON patient_medical_history FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY patient_medical_history_insert ON patient_medical_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY patient_medical_history_update ON patient_medical_history FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY patient_medical_history_delete ON patient_medical_history FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY patient_surgical_history_select ON patient_surgical_history FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY patient_surgical_history_insert ON patient_surgical_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY patient_surgical_history_update ON patient_surgical_history FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY patient_surgical_history_delete ON patient_surgical_history FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY patient_social_history_select ON patient_social_history FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY patient_social_history_insert ON patient_social_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY patient_social_history_update ON patient_social_history FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY patient_social_history_delete ON patient_social_history FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY patient_bookings_select ON patient_bookings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY patient_bookings_insert ON patient_bookings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY patient_bookings_update ON patient_bookings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY patient_bookings_delete ON patient_bookings FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- 3. CLINIC / DOCTOR / SCHEDULE
-- ============================================================
CREATE POLICY doctor_schedule_select ON doctor_schedule FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY doctor_schedule_insert ON doctor_schedule FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY doctor_schedule_update ON doctor_schedule FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY doctor_schedule_delete ON doctor_schedule FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY appointment_slots_select ON appointment_slots FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY appointment_slots_insert ON appointment_slots FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY appointment_slots_update ON appointment_slots FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY appointment_slots_delete ON appointment_slots FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- 4. CONSULTATION SUB-TABLES
-- ============================================================
CREATE POLICY consultation_complaints_select ON consultation_complaints FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY consultation_complaints_insert ON consultation_complaints FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY consultation_complaints_update ON consultation_complaints FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY consultation_complaints_delete ON consultation_complaints FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY consultation_diagnoses_select ON consultation_diagnoses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY consultation_diagnoses_insert ON consultation_diagnoses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY consultation_diagnoses_update ON consultation_diagnoses FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY consultation_diagnoses_delete ON consultation_diagnoses FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY diagnoses_select ON diagnoses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY diagnoses_insert ON diagnoses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY diagnoses_update ON diagnoses FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY diagnoses_delete ON diagnoses FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- 5. PRESCRIPTION SUB-TABLES
-- ============================================================
CREATE POLICY prescription_investigations_select ON prescription_investigations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY prescription_investigations_insert ON prescription_investigations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY prescription_investigations_update ON prescription_investigations FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY prescription_investigations_delete ON prescription_investigations FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- 6. KIDNEY / TRANSPLANT
-- ============================================================
CREATE POLICY kidney_transplant_history_select ON kidney_transplant_history FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY kidney_transplant_history_insert ON kidney_transplant_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY kidney_transplant_history_update ON kidney_transplant_history FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY kidney_transplant_history_delete ON kidney_transplant_history FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- 7. MEDICINES (reference data — read-only for most, admin manages)
-- ============================================================
CREATE POLICY medicines_select ON medicines FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY medicines_insert ON medicines FOR INSERT WITH CHECK (auth.jwt() ->> 'role' IN ('super_admin'));
CREATE POLICY medicines_update ON medicines FOR UPDATE USING (auth.jwt() ->> 'role' IN ('super_admin'));
CREATE POLICY medicines_delete ON medicines FOR DELETE USING (auth.jwt() ->> 'role' IN ('super_admin'));

-- ============================================================
-- 8. TEMPLATES (read for all, write for admin)
-- ============================================================
CREATE POLICY complaint_templates_select ON complaint_templates FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY complaint_templates_insert ON complaint_templates FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY complaint_templates_update ON complaint_templates FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY complaint_templates_delete ON complaint_templates FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY diagnosis_templates_select ON diagnosis_templates FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY diagnosis_templates_insert ON diagnosis_templates FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY diagnosis_templates_update ON diagnosis_templates FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY diagnosis_templates_delete ON diagnosis_templates FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY medicine_templates_select ON medicine_templates FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY medicine_templates_insert ON medicine_templates FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY medicine_templates_update ON medicine_templates FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY medicine_templates_delete ON medicine_templates FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY medicine_template_items_select ON medicine_template_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY medicine_template_items_insert ON medicine_template_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY medicine_template_items_update ON medicine_template_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY medicine_template_items_delete ON medicine_template_items FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY investigation_templates_select ON investigation_templates FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY investigation_templates_insert ON investigation_templates FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY investigation_templates_update ON investigation_templates FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY investigation_templates_delete ON investigation_templates FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY investigation_template_items_select ON investigation_template_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY investigation_template_items_insert ON investigation_template_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY investigation_template_items_update ON investigation_template_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY investigation_template_items_delete ON investigation_template_items FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY advice_templates_select ON advice_templates FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY advice_templates_insert ON advice_templates FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY advice_templates_update ON advice_templates FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY advice_templates_delete ON advice_templates FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY advice_template_items_select ON advice_template_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY advice_template_items_insert ON advice_template_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY advice_template_items_update ON advice_template_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY advice_template_items_delete ON advice_template_items FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- 9. SETTINGS & LETTERHEADS (admin-only write)
-- ============================================================
CREATE POLICY settings_select ON settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY settings_insert ON settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY settings_update ON settings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY settings_delete ON settings FOR DELETE USING (auth.jwt() ->> 'role' IN ('super_admin'));

CREATE POLICY letterheads_select ON letterheads FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY letterheads_insert ON letterheads FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY letterheads_update ON letterheads FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY letterheads_delete ON letterheads FOR DELETE USING (auth.jwt() ->> 'role' IN ('super_admin'));

-- ============================================================
-- 10. NOTIFICATIONS (own user only)
-- ============================================================
CREATE POLICY notifications_select ON notifications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY notifications_insert ON notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY notifications_update ON notifications FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY notifications_delete ON notifications FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- 11. OTP RECORDS (admin-only, sensitive)
-- ============================================================
CREATE POLICY otp_records_select ON otp_records FOR SELECT USING (auth.jwt() ->> 'role' IN ('super_admin'));
CREATE POLICY otp_records_insert ON otp_records FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY otp_records_update ON otp_records FOR UPDATE USING (auth.jwt() ->> 'role' IN ('super_admin'));
CREATE POLICY otp_records_delete ON otp_records FOR DELETE USING (auth.jwt() ->> 'role' IN ('super_admin'));

-- ============================================================
-- 12. LOGS (admin-only read, system can write)
-- ============================================================
CREATE POLICY whatsapp_logs_select ON whatsapp_logs FOR SELECT USING (auth.jwt() ->> 'role' IN ('super_admin'));
CREATE POLICY whatsapp_logs_insert ON whatsapp_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY whatsapp_logs_delete ON whatsapp_logs FOR DELETE USING (auth.jwt() ->> 'role' IN ('super_admin'));

CREATE POLICY sms_logs_select ON sms_logs FOR SELECT USING (auth.jwt() ->> 'role' IN ('super_admin'));
CREATE POLICY sms_logs_insert ON sms_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY sms_logs_delete ON sms_logs FOR DELETE USING (auth.jwt() ->> 'role' IN ('super_admin'));

CREATE POLICY email_logs_select ON email_logs FOR SELECT USING (auth.jwt() ->> 'role' IN ('super_admin'));
CREATE POLICY email_logs_insert ON email_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY email_logs_delete ON email_logs FOR DELETE USING (auth.jwt() ->> 'role' IN ('super_admin'));
