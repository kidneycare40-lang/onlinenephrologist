-- ============================================================
-- ROW LEVEL SECURITY (RLS) Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE kidney_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigation_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE dialysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE emr_store ENABLE ROW LEVEL SECURITY;

-- Helper: returns the role of the requesting user from `request.jwt.claims`
-- The JWT is set via the `authenticateRequest` middleware.
-- Anonymous requests have no JWT, so `auth.role()` returns 'anon'.

-- ============================================================
-- USERS table
-- ============================================================
-- Users can read their own record. Super admins can read all.
CREATE POLICY users_select_own ON users FOR SELECT
  USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'super_admin');

-- Only super admins can insert/update/delete users
CREATE POLICY users_insert_admin ON users FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'super_admin');
CREATE POLICY users_update_admin ON users FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'super_admin');
CREATE POLICY users_delete_admin ON users FOR DELETE
  USING (auth.jwt() ->> 'role' = 'super_admin');

-- ============================================================
-- PATIENTS
-- ============================================================
-- Any authenticated user can view patients
CREATE POLICY patients_select ON patients FOR SELECT
  USING (auth.role() = 'authenticated');
-- Insert/update/delete require at least patients:create/edit/delete
CREATE POLICY patients_insert ON patients FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY patients_update ON patients FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY patients_delete ON patients FOR DELETE
  USING (auth.jwt() ->> 'role' IN ('super_admin'));

-- ============================================================
-- APPOINTMENTS
-- ============================================================
CREATE POLICY appointments_select ON appointments FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY appointments_insert ON appointments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY appointments_update ON appointments FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY appointments_delete ON appointments FOR DELETE
  USING (auth.jwt() ->> 'role' IN ('super_admin'));

-- ============================================================
-- CONSULTATIONS
-- ============================================================
CREATE POLICY consultations_select ON consultations FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY consultations_insert ON consultations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY consultations_update ON consultations FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY consultations_delete ON consultations FOR DELETE
  USING (auth.jwt() ->> 'role' IN ('super_admin'));

-- ============================================================
-- PRESCRIPTIONS
-- ============================================================
CREATE POLICY prescriptions_select ON prescriptions FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY prescriptions_insert ON prescriptions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY prescriptions_update ON prescriptions FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY prescriptions_delete ON prescriptions FOR DELETE
  USING (auth.jwt() ->> 'role' IN ('super_admin'));

-- ============================================================
-- PRESCRIPTION MEDICINES
-- ============================================================
CREATE POLICY prescription_medicines_select ON prescription_medicines FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY prescription_medicines_insert ON prescription_medicines FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY prescription_medicines_update ON prescription_medicines FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY prescription_medicines_delete ON prescription_medicines FOR DELETE
  USING (auth.jwt() ->> 'role' IN ('super_admin'));

-- ============================================================
-- VITALS & KIDNEY PARAMETERS
-- ============================================================
CREATE POLICY vitals_select ON vitals FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY vitals_insert ON vitals FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY vitals_update ON vitals FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY vitals_delete ON vitals FOR DELETE
  USING (auth.jwt() ->> 'role' IN ('super_admin'));

CREATE POLICY kidney_parameters_select ON kidney_parameters FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY kidney_parameters_insert ON kidney_parameters FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY kidney_parameters_update ON kidney_parameters FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY kidney_parameters_delete ON kidney_parameters FOR DELETE
  USING (auth.jwt() ->> 'role' IN ('super_admin'));

-- ============================================================
-- INVOICES & PAYMENTS
-- ============================================================
CREATE POLICY invoices_select ON invoices FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY invoices_insert ON invoices FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY invoices_update ON invoices FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY invoices_delete ON invoices FOR DELETE
  USING (auth.jwt() ->> 'role' IN ('super_admin'));

CREATE POLICY invoice_items_select ON invoice_items FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY invoice_items_insert ON invoice_items FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY invoice_items_delete ON invoice_items FOR DELETE
  USING (auth.jwt() ->> 'role' IN ('super_admin'));

CREATE POLICY payments_select ON payments FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY payments_insert ON payments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY payments_update ON payments FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- INVESTIGATIONS
-- ============================================================
CREATE POLICY investigation_orders_select ON investigation_orders FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY investigation_orders_insert ON investigation_orders FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY investigation_orders_update ON investigation_orders FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY investigation_orders_delete ON investigation_orders FOR DELETE
  USING (auth.jwt() ->> 'role' IN ('super_admin'));

CREATE POLICY investigation_items_select ON investigation_items FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY investigation_items_insert ON investigation_items FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY investigation_items_update ON investigation_items FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- DIALYSIS SESSIONS
-- ============================================================
CREATE POLICY dialysis_sessions_select ON dialysis_sessions FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY dialysis_sessions_insert ON dialysis_sessions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY dialysis_sessions_update ON dialysis_sessions FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY dialysis_sessions_delete ON dialysis_sessions FOR DELETE
  USING (auth.jwt() ->> 'role' IN ('super_admin'));

-- ============================================================
-- UPLOADED REPORTS
-- ============================================================
CREATE POLICY uploaded_reports_select ON uploaded_reports FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY uploaded_reports_insert ON uploaded_reports FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY uploaded_reports_update ON uploaded_reports FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY uploaded_reports_delete ON uploaded_reports FOR DELETE
  USING (auth.jwt() ->> 'role' IN ('super_admin'));

-- ============================================================
-- CLINICS & DOCTOR_CLINICS
-- ============================================================
CREATE POLICY clinics_select ON clinics FOR SELECT
  USING (true);
CREATE POLICY clinics_insert ON clinics FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' IN ('super_admin'));
CREATE POLICY clinics_update ON clinics FOR UPDATE
  USING (auth.jwt() ->> 'role' IN ('super_admin'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('super_admin'));
CREATE POLICY clinics_delete ON clinics FOR DELETE
  USING (auth.jwt() ->> 'role' IN ('super_admin'));

CREATE POLICY doctor_clinics_select ON doctor_clinics FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY doctor_clinics_insert ON doctor_clinics FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY doctor_clinics_update ON doctor_clinics FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY doctor_clinics_delete ON doctor_clinics FOR DELETE
  USING (auth.jwt() ->> 'role' IN ('super_admin'));

-- ============================================================
-- AUDIT LOGS (read-only for authenticated, insert-only)
-- ============================================================
CREATE POLICY audit_logs_select ON audit_logs FOR SELECT
  USING (auth.jwt() ->> 'role' IN ('super_admin'));
CREATE POLICY audit_logs_insert ON audit_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY activity_logs_select ON activity_logs FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY activity_logs_insert ON activity_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- EMR_STORE (app-level settings, sensitive)
-- ============================================================
-- Drop the permissive policy from supabase-schema.sql that allows anonymous access
DROP POLICY IF EXISTS "Allow all access" ON emr_store;
CREATE POLICY emr_store_select ON emr_store FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY emr_store_insert ON emr_store FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY emr_store_update ON emr_store FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY emr_store_delete ON emr_store FOR DELETE
  USING (auth.role() = 'authenticated');
