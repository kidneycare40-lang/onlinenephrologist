-- ============================================================
-- Template System Migration
-- Complaints, Diagnoses, Medicines, Investigations, Advice
-- ============================================================

-- ============================================================
-- 1. COMPLAINT TEMPLATES
-- Common patient complaints for quick selection
-- ============================================================
CREATE TABLE complaint_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- 'general', 'renal', 'cardiovascular', etc.
    name VARCHAR(200) NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT false, -- system = can't delete
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_complaint_templates_clinic ON complaint_templates(clinic_id);
CREATE INDEX idx_complaint_templates_category ON complaint_templates(category);

-- ============================================================
-- 2. DIAGNOSIS TEMPLATES
-- CKD stages, common nephrology diagnoses
-- ============================================================
CREATE TABLE diagnosis_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- 'ckd', 'aki', 'glomerular', 'tubular', 'vascular', 'systemic'
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20), -- ICD-10 code
    description TEXT,
    ckd_stage INTEGER, -- 1-5 for CKD stages
    is_system BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_diagnosis_templates_clinic ON diagnosis_templates(clinic_id);
CREATE INDEX idx_diagnosis_templates_category ON diagnosis_templates(category);
CREATE INDEX idx_diagnosis_templates_ckd_stage ON diagnosis_templates(ckd_stage);

-- ============================================================
-- 3. MEDICINE DATABASE
-- Master list of all medicines with search
-- ============================================================
CREATE TABLE medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    brand_name VARCHAR(200),
    manufacturer VARCHAR(200),
    category VARCHAR(100) NOT NULL, -- 'antihypertensive', 'diuretic', 'phosphate_binder', etc.
    subcategory VARCHAR(100),
    form VARCHAR(50) NOT NULL, -- 'tablet', 'capsule', 'injection', 'syrup', 'solution'
    strength VARCHAR(50) NOT NULL, -- '40mg', '20mg', '500mg'
    strength_numeric DECIMAL(10,2),
    strength_unit VARCHAR(20), -- 'mg', 'mcg', 'ml', 'iu'
    pack_size INTEGER DEFAULT 1,
    unit VARCHAR(50) DEFAULT 'strip', -- 'strip', 'bottle', 'vial'
    mrp DECIMAL(10,2),
    hsn_code VARCHAR(20),
    drug_interactions TEXT[],
    contraindications TEXT[],
    renal_dose_adjustment TEXT,
    pregnancy_category VARCHAR(10),
    is_nephrotoxic BOOLEAN DEFAULT false,
    requires_monitoring BOOLEAN DEFAULT false,
    monitoring_parameters TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_medicines_name ON medicines USING gin(name gin_trgm_ops);
CREATE INDEX idx_medicines_generic ON medicines USING gin(generic_name gin_trgm_ops);
CREATE INDEX idx_medicines_category ON medicines(category);
CREATE INDEX idx_medicines_form ON medicines(form);
CREATE INDEX idx_medicines_strength ON medicines(strength);

-- ============================================================
-- 4. MEDICINE TEMPLATES
-- Pre-defined medicine combinations
-- ============================================================
CREATE TABLE medicine_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL, -- 'CKD Stage 3', 'Post-Transplant', etc.
    description TEXT,
    category VARCHAR(100), -- 'ckd', 'transplant', 'dialysis', 'hypertension', 'diabetes'
    is_system BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_medicine_templates_clinic ON medicine_templates(clinic_id);
CREATE INDEX idx_medicine_templates_category ON medicine_templates(category);

-- ============================================================
-- 5. MEDICINE TEMPLATE ITEMS
-- Medicines in each template
-- ============================================================
CREATE TABLE medicine_template_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES medicine_templates(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    dosage VARCHAR(100) NOT NULL, -- '1 tablet', '5ml'
    frequency VARCHAR(100) NOT NULL, -- 'Once daily', 'Twice daily'
    timing VARCHAR(100), -- 'Before food', 'After food', 'Night time'
    duration VARCHAR(100), -- '7 days', '1 month', 'Ongoing'
    instructions TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_medicine_template_items_template ON medicine_template_items(template_id);

-- ============================================================
-- 6. INVESTIGATION TEMPLATES
-- Pre-defined investigation panels
-- ============================================================
CREATE TABLE investigation_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL, -- 'CKD Workup', 'Pre-Transplant', etc.
    description TEXT,
    category VARCHAR(100), -- 'ckd', 'transplant', 'dialysis', 'general'
    is_system BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_investigation_templates_clinic ON investigation_templates(clinic_id);

-- ============================================================
-- 7. INVESTIGATION TEMPLATE ITEMS
-- Tests in each template
-- ============================================================
CREATE TABLE investigation_template_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES investigation_templates(id) ON DELETE CASCADE,
    test_name VARCHAR(200) NOT NULL,
    category VARCHAR(100), -- 'blood', 'urine', 'imaging', 'other'
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_investigation_template_items_template ON investigation_template_items(template_id);

-- ============================================================
-- 8. ADVICE TEMPLATES
-- Pre-defined patient advice
-- ============================================================
CREATE TABLE advice_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL, -- 'CKD Advice', 'Dialysis Advice', etc.
    description TEXT,
    category VARCHAR(100), -- 'diet', 'lifestyle', 'medication', 'follow_up', 'general'
    is_system BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_advice_templates_clinic ON advice_templates(clinic_id);

-- ============================================================
-- 9. ADVICE TEMPLATE ITEMS
-- Advice points in each template
-- ============================================================
CREATE TABLE advice_template_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES advice_templates(id) ON DELETE CASCADE,
    advice_text TEXT NOT NULL,
    category VARCHAR(100), -- 'diet', 'lifestyle', 'medication', 'follow_up'
    is_critical BOOLEAN DEFAULT false, -- important advice
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_advice_template_items_template ON advice_template_items(template_id);

-- ============================================================
-- 10. CONSULTATION COMPLAINTS (Junction)
-- Links consultations to complaints
-- ============================================================
CREATE TABLE consultation_complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    complaint_template_id UUID REFERENCES complaint_templates(id),
    complaint_name VARCHAR(200) NOT NULL,
    duration VARCHAR(100),
    severity VARCHAR(50), -- 'mild', 'moderate', 'severe'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consultation_complaints_consultation ON consultation_complaints(consultation_id);

-- ============================================================
-- 11. CONSULTATION DIAGNOSES (Junction)
-- Links consultations to diagnoses
-- ============================================================
CREATE TABLE consultation_diagnoses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    diagnosis_template_id UUID REFERENCES diagnosis_templates(id),
    diagnosis_name VARCHAR(200) NOT NULL,
    diagnosis_code VARCHAR(20),
    is_primary BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consultation_diagnoses_consultation ON consultation_diagnoses(consultation_id);

-- ============================================================
-- 12. SEED DATA - System Complaint Templates
-- ============================================================
INSERT INTO complaint_templates (name, category, is_system, sort_order) VALUES
-- General
('Weakness', 'general', true, 1),
('Fatigue', 'general', true, 2),
('Loss of Appetite', 'general', true, 3),
('Weight Loss', 'general', true, 4),
('Weight Gain', 'general', true, 5),
('Fever', 'general', true, 6),
('Nausea', 'general', true, 7),
('Vomiting', 'general', true, 8),
('Dizziness', 'general', true, 9),
('Headache', 'general', true, 10),
-- Renal
('Swelling - Face', 'renal', true, 20),
('Swelling - Legs', 'renal', true, 21),
('Swelling - Feet', 'renal', true, 22),
('Swelling - Generalized', 'renal', true, 23),
('Decreased Urine Output', 'renal', true, 24),
('Increased Urine Frequency', 'renal', true, 25),
('Nocturia', 'renal', true, 26),
('Foamy Urine', 'renal', true, 27),
('Blood in Urine', 'renal', true, 28),
('Back Pain - Flank', 'renal', true, 29),
('Kidney Stone Pain', 'renal', true, 30),
('Burning Urination', 'renal', true, 31),
('Urgency', 'renal', true, 32),
('Incontinence', 'renal', true, 33),
-- Cardiovascular
('Shortness of Breath', 'cardiovascular', true, 40),
('Chest Pain', 'cardiovascular', true, 41),
('Palpitations', 'cardiovascular', true, 42),
('High Blood Pressure', 'cardiovascular', true, 43),
('Leg Pain on Walking', 'cardiovascular', true, 44),
-- Neurological
('Confusion', 'neurological', true, 50),
('Seizures', 'neurological', true, 51),
('Numbness/Tingling', 'neurological', true, 52),
('Sleep Disturbance', 'neurological', true, 53),
-- Gastrointestinal
('Abdominal Pain', 'gastrointestinal', true, 60),
('Diarrhea', 'gastrointestinal', true, 61),
('Constipation', 'gastrointestinal', true, 62),
('Indigestion', 'gastrointestinal', true, 63),
('Bloating', 'gastrointestinal', true, 64),
-- Musculoskeletal
('Bone Pain', 'musculoskeletal', true, 70),
('Joint Pain', 'musculoskeletal', true, 71),
('Muscle Cramps', 'musculoskeletal', true, 72),
('Muscle Weakness', 'musculoskeletal', true, 73),
-- Skin
('Itching', 'skin', true, 80),
('Skin Rash', 'skin', true, 81),
('Dry Skin', 'skin', true, 82),
('Easy Bruising', 'skin', true, 83);

-- ============================================================
-- 13. SEED DATA - System Diagnosis Templates
-- ============================================================
INSERT INTO diagnosis_templates (name, category, ckd_stage, is_system, sort_order) VALUES
-- CKD Stages
('CKD Stage 1', 'ckd', 1, true, 1),
('CKD Stage 2', 'ckd', 2, true, 2),
('CKD Stage 3a', 'ckd', 3, true, 3),
('CKD Stage 3b', 'ckd', 3, true, 4),
('CKD Stage 4', 'ckd', 4, true, 5),
('CKD Stage 5', 'ckd', 5, true, 6),
('CKD Stage 5D (Dialysis)', 'ckd', 5, true, 7),
-- AKI
('AKI Stage 1', 'aki', NULL, true, 10),
('AKI Stage 2', 'aki', NULL, true, 11),
('AKI Stage 3', 'aki', NULL, true, 12),
('Pre-renal AKI', 'aki', NULL, true, 13),
('Intrinsic Renal AKI', 'aki', NULL, true, 14),
('Post-renal AKI', 'aki', NULL, true, 15),
-- Glomerular
('Nephrotic Syndrome', 'glomerular', NULL, true, 20),
('Nephritic Syndrome', 'glomerular', NULL, true, 21),
('IgA Nephropathy', 'glomerular', NULL, true, 22),
('Membranous Nephropathy', 'glomerular', NULL, true, 23),
('FSGS', 'glomerular', NULL, true, 24),
('Lupus Nephritis', 'glomerular', NULL, true, 25),
('Diabetic Nephropathy', 'glomerular', NULL, true, 26),
('Hypertensive Nephrosclerosis', 'glomerular', NULL, true, 27),
-- Tubular
('Acute Tubular Necrosis', 'tubular', NULL, true, 30),
('Acute Interstitial Nephritis', 'tubular', NULL, true, 31),
('RTA Type 1', 'tubular', NULL, true, 32),
('RTA Type 2', 'tubular', NULL, true, 33),
('RTA Type 4', 'tubular', NULL, true, 34),
('Fanconi Syndrome', 'tubular', NULL, true, 35),
-- Vascular
('Renal Artery Stenosis', 'vascular', NULL, true, 40),
('Thrombotic Microangiopathy', 'vascular', NULL, true, 41),
('HUS', 'vascular', NULL, true, 42),
('TTP', 'vascular', NULL, true, 43),
-- Stones
('Nephrolithiasis', 'stones', NULL, true, 50),
('Nephrocalcinosis', 'stones', NULL, true, 51),
('Uric Acid Stones', 'stones', NULL, true, 52),
('Calcium Oxalate Stones', 'stones', NULL, true, 53),
('Struvite Stones', 'stones', NULL, true, 54),
-- Other
('UTI', 'infection', NULL, true, 60),
('Pyelonephritis', 'infection', NULL, true, 61),
('Polycystic Kidney Disease', 'genetic', NULL, true, 70),
('Alport Syndrome', 'genetic', NULL, true, 71),
('Kidney Transplant - Stable', 'transplant', NULL, true, 80),
('Kidney Transplant - Rejection', 'transplant', NULL, true, 81),
('Kidney Transplant - Infection', 'transplant', NULL, true, 82),
('ESRD on Hemodialysis', 'dialysis', 5, true, 90),
('ESRD on Peritoneal Dialysis', 'dialysis', 5, true, 91),
('Anemia of CKD', 'complication', NULL, true, 100),
('CKD-MBD', 'complication', NULL, true, 101),
('Metabolic Acidosis', 'complication', NULL, true, 102),
('Hyperkalemia', 'complication', NULL, true, 103),
('Volume Overload', 'complication', NULL, true, 104),
('Uremic Encephalopathy', 'complication', NULL, true, 105);

-- ============================================================
-- 14. SEED DATA - Medicine Database (Common Nephrology Medicines)
-- ============================================================
INSERT INTO medicines (name, generic_name, brand_name, category, form, strength, strength_numeric, strength_unit, is_nephrotoxic, requires_monitoring, monitoring_parameters) VALUES
-- Antihypertensives (ARBs)
('Telmisartan 40mg', 'Telmisartan', 'Telma 40', 'antihypertensive', 'tablet', '40mg', 40, 'mg', false, true, ARRAY['BP', 'K+', 'Creatinine']),
('Telmisartan 80mg', 'Telmisartan', 'Telma 80', 'antihypertensive', 'tablet', '80mg', 80, 'mg', false, true, ARRAY['BP', 'K+', 'Creatinine']),
('Losartan 50mg', 'Losartan', 'Losar 50', 'antihypertensive', 'tablet', '50mg', 50, 'mg', false, true, ARRAY['BP', 'K+', 'Creatinine']),
('Losartan 100mg', 'Losartan', 'Losar 100', 'antihypertensive', 'tablet', '100mg', 100, 'mg', false, true, ARRAY['BP', 'K+', 'Creatinine']),
('Valsartan 80mg', 'Valsartan', 'Valzaar 80', 'antihypertensive', 'tablet', '80mg', 80, 'mg', false, true, ARRAY['BP', 'K+', 'Creatinine']),
('Valsartan 160mg', 'Valsartan', 'Valzaar 160', 'antihypertensive', 'tablet', '160mg', 160, 'mg', false, true, ARRAY['BP', 'K+', 'Creatinine']),
-- ARBs + HCTZ
('Telmisartan + HCTZ 40/12.5', 'Telmisartan + Hydrochlorothiazide', 'Telma H 40', 'antihypertensive', 'tablet', '40/12.5mg', 40, 'mg', false, true, ARRAY['BP', 'K+', 'Creatinine', 'Uric Acid']),
('Telmisartan + HCTZ 80/12.5', 'Telmisartan + Hydrochlorothiazide', 'Telma H 80', 'antihypertensive', 'tablet', '80/12.5mg', 80, 'mg', false, true, ARRAY['BP', 'K+', 'Creatinine', 'Uric Acid']),
-- ACE Inhibitors
('Ramipril 5mg', 'Ramipril', 'Cardace 5', 'antihypertensive', 'tablet', '5mg', 5, 'mg', false, true, ARRAY['BP', 'K+', 'Creatinine', 'Cough']),
('Ramipril 10mg', 'Ramipril', 'Cardace 10', 'antihypertensive', 'tablet', '10mg', 10, 'mg', false, true, ARRAY['BP', 'K+', 'Creatinine', 'Cough']),
('Enalapril 10mg', 'Enalapril', 'Enam 10', 'antihypertensive', 'tablet', '10mg', 10, 'mg', false, true, ARRAY['BP', 'K+', 'Creatinine', 'Cough']),
-- CCBs
('Amlodipine 5mg', 'Amlodipine', 'Amlodac 5', 'antihypertensive', 'tablet', '5mg', 5, 'mg', false, false, ARRAY['BP']),
('Amlodipine 10mg', 'Amlodipine', 'Amlodac 10', 'antihypertensive', 'tablet', '10mg', 10, 'mg', false, false, ARRAY['BP']),
-- Beta Blockers
('Metoprolol 50mg', 'Metoprolol Succinate', 'Met XL 50', 'antihypertensive', 'tablet', '50mg', 50, 'mg', false, false, ARRAY['HR', 'BP']),
('Metoprolol 100mg', 'Metoprolol Succinate', 'Met XL 100', 'antihypertensive', 'tablet', '100mg', 100, 'mg', false, false, ARRAY['HR', 'BP']),
-- Diuretics
('Furosemide 40mg', 'Furosemide', 'Lasix 40', 'diuretic', 'tablet', '40mg', 40, 'mg', false, true, ARRAY['Electrolytes', 'K+', 'Na+', 'Volume']),
('Furosemide 80mg', 'Furosemide', 'Lasix 80', 'diuretic', 'tablet', '80mg', 80, 'mg', false, true, ARRAY['Electrolytes', 'K+', 'Na+', 'Volume']),
('Torsemide 10mg', 'Torsemide', 'Torem 10', 'diuretic', 'tablet', '10mg', 10, 'mg', false, true, ARRAY['Electrolytes', 'K+', 'Na+', 'Volume']),
('Torsemide 20mg', 'Torsemide', 'Torem 20', 'diuretic', 'tablet', '20mg', 20, 'mg', false, true, ARRAY['Electrolytes', 'K+', 'Na+', 'Volume']),
('Spironolactone 25mg', 'Spironolactone', 'Aldactone 25', 'diuretic', 'tablet', '25mg', 25, 'mg', false, true, ARRAY['K+', 'Gynecomastia']),
('Hydrochlorothiazide 12.5mg', 'Hydrochlorothiazide', 'Hydride 12.5', 'diuretic', 'tablet', '12.5mg', 12.5, 'mg', false, true, ARRAY['Electrolytes', 'Uric Acid', 'Glucose']),
('Hydrochlorothiazide 25mg', 'Hydrochlorothiazide', 'Hydride 25', 'diuretic', 'tablet', '25mg', 25, 'mg', false, true, ARRAY['Electrolytes', 'Uric Acid', 'Glucose']),
-- Phosphate Binders
('Sevelamer 400mg', 'Sevelamer Carbonate', 'Velvel 400', 'phosphate_binder', 'tablet', '400mg', 400, 'mg', false, true, ARRAY['Phosphorus', 'iPTH']),
('Sevelamer 800mg', 'Sevelamer Carbonate', 'Velvel 800', 'phosphate_binder', 'tablet', '800mg', 800, 'mg', false, true, ARRAY['Phosphorus', 'iPTH']),
('Lanthanum 500mg', 'Lanthanum Carbonate', 'Fosrenol 500', 'phosphate_binder', 'tablet', '500mg', 500, 'mg', false, true, ARRAY['Phosphorus', 'iPTH']),
('Lanthanum 750mg', 'Lanthanum Carbonate', 'Fosrenol 750', 'phosphate_binder', 'tablet', '750mg', 750, 'mg', false, true, ARRAY['Phosphorus', 'iPTH']),
('Lanthanum 1000mg', 'Lanthanum Carbonate', 'Fosrenol 1000', 'phosphate_binder', 'tablet', '1000mg', 1000, 'mg', false, true, ARRAY['Phosphorus', 'iPTH']),
('Calcium Acetate 500mg', 'Calcium Acetate', 'PhosLo 500', 'phosphate_binder', 'capsule', '500mg', 500, 'mg', false, true, ARRAY['Phosphorus', 'Calcium']),
-- Vitamin D & Analogs
('Cholecalciferol 1000IU', 'Vitamin D3', 'D-Rise 1000', 'vitamin_d', 'capsule', '1000IU', 1000, 'IU', false, true, ARRAY['Vitamin D', 'Calcium']),
('Cholecalciferol 60000IU', 'Vitamin D3', 'D-Rise 60K', 'vitamin_d', 'capsule', '60000IU', 60000, 'IU', false, true, ARRAY['Vitamin D', 'Calcium']),
('Calcitriol 0.25mcg', 'Calcitriol', 'Rocaltrol 0.25', 'vitamin_d', 'capsule', '0.25mcg', 0.25, 'mcg', false, true, ARRAY['Calcium', 'Phosphorus', 'iPTH']),
('Calcitriol 0.5mcg', 'Calcitriol', 'Rocaltrol 0.5', 'vitamin_d', 'capsule', '0.5mcg', 0.5, 'mcg', false, true, ARRAY['Calcium', 'Phosphorus', 'iPTH']),
('Alfacalcidol 0.25mcg', 'Alfacalcidol', 'AlfaD3 0.25', 'vitamin_d', 'capsule', '0.25mcg', 0.25, 'mcg', false, true, ARRAY['Calcium', 'Phosphorus', 'iPTH']),
('Alfacalcidol 0.5mcg', 'Alfacalcidol', 'AlfaD3 0.5', 'vitamin_d', 'capsule', '0.5mcg', 0.5, 'mcg', false, true, ARRAY['Calcium', 'Phosphorus', 'iPTH']),
-- ESAs (Erythropoietin)
('Epoetin Alfa 2000IU', 'Epoetin Alpha', 'Epoet 2000', 'esa', 'injection', '2000IU', 2000, 'IU', false, true, ARRAY['Hemoglobin', 'Hematocrit', 'Iron Studies']),
('Epoetin Alfa 4000IU', 'Epoetin Alpha', 'Epoet 4000', 'esa', 'injection', '4000IU', 4000, 'IU', false, true, ARRAY['Hemoglobin', 'Hematocrit', 'Iron Studies']),
('Darbepoetin 40mcg', 'Darbepoetin Alpha', 'Aranesp 40', 'esa', 'injection', '40mcg', 40, 'mcg', false, true, ARRAY['Hemoglobin', 'Hematocrit', 'Iron Studies']),
-- Iron Supplements
('Ferric Carboxymaltose 500mg', 'Ferric Carboxymaltose', 'Ferinject 500', 'iron', 'injection', '500mg', 500, 'mg', false, true, ARRAY['Hemoglobin', 'Ferritin', 'TSAT']),
('Iron Sucrose 100mg', 'Iron Sucrose', 'Venofer 100', 'iron', 'injection', '100mg', 100, 'mg', false, true, ARRAY['Hemoglobin', 'Ferritin', 'TSAT']),
-- Phosphorus Binders (Sevelamer HCl)
('Sevelamer HCl 400mg', 'Sevelamer Hydrochloride', 'Renvela 400', 'phosphate_binder', 'tablet', '400mg', 400, 'mg', false, true, ARRAY['Phosphorus']),
-- Potassium Binders
('Sodium Zirconium Cyclosilicate 5g', 'Sodium Zirconium Cyclosilicate', 'Lokelma 5', 'potassium_binder', 'powder', '5g', 5, 'g', false, true, ARRAY['K+']),
('Patiromer 8.4g', 'Patiromer', 'Veltassa 8.4', 'potassium_binder', 'powder', '8.4g', 8.4, 'g', false, true, ARRAY['K+']),
-- SGLT2 Inhibitors (Renal protective)
('Dapagliflozin 10mg', 'Dapagliflozin', 'Forxiga 10', 'sglt2_inhibitor', 'tablet', '10mg', 10, 'mg', false, true, ARRAY['eGFR', 'Urine Albumin', 'K+']),
('Empagliflozin 10mg', 'Empagliflozin', 'Jardiance 10', 'sglt2_inhibitor', 'tablet', '10mg', 10, 'mg', false, true, ARRAY['eGFR', 'Urine Albumin', 'K+']),
('Canagliflozin 100mg', 'Canagliflozin', 'Invokana 100', 'sglt2_inhibitor', 'tablet', '100mg', 100, 'mg', false, true, ARRAY['eGFR', 'Urine Albumin', 'K+']),
-- Others
('Sodium Bicarbonate 500mg', 'Sodium Bicarbonate', 'Shelcal 500', 'alkalinizer', 'tablet', '500mg', 500, 'mg', false, true, ARRAY['Bicarbonate', 'pH']),
('Pantoprazole 40mg', 'Pantoprazole', 'Pantocid 40', 'ppi', 'tablet', '40mg', 40, 'mg', false, false, '{}'),
('Omeprazole 20mg', 'Omeprazole', 'Omez 20', 'ppi', 'capsule', '20mg', 20, 'mg', false, false, '{}'),
('Paracetamol 500mg', 'Paracetamol', 'Crocin 500', 'analgesic', 'tablet', '500mg', 500, 'mg', false, false, '{}'),
('Gabapentin 300mg', 'Gabapentin', 'Neurontin 300', 'analgesic', 'capsule', '300mg', 300, 'mg', false, true, ARRAY['Creatinine']),
('Pregabalin 75mg', 'Pregabalin', 'Lyrica 75', 'analgesic', 'capsule', '75mg', 75, 'mg', false, true, ARRAY['Creatinine']);

-- ============================================================
-- 15. SEED DATA - Investigation Templates
-- ============================================================
INSERT INTO investigation_templates (name, category, description, is_system, sort_order) VALUES
('CKD Workup', 'ckd', 'Complete workup for CKD evaluation', true, 1),
('Pre-Dialysis Workup', 'dialysis', 'Workup before starting dialysis', true, 2),
('Pre-Transplant Workup', 'transplant', 'Workup for kidney transplant evaluation', true, 3),
('Post-Transplant Follow-up', 'transplant', 'Routine follow-up after transplant', true, 4),
('Hemodialysis Monthly', 'dialysis', 'Monthly monitoring for HD patients', true, 5),
('Peritoneal Dialysis Monthly', 'dialysis', 'Monthly monitoring for PD patients', true, 6),
('AKI Workup', 'aki', 'Workup for acute kidney injury', true, 7),
('Nephrotic Syndrome Workup', 'glomerular', 'Workup for nephrotic syndrome', true, 8),
('Kidney Stone Workup', 'stones', 'Evaluation for kidney stones', true, 9),
('UTI Workup', 'infection', 'Workup for urinary tract infection', true, 10),
('General Health Check', 'general', 'Basic health screening', true, 11),
('Diabetes Monitoring', 'diabetes', 'Monitoring for diabetic patients', true, 12),
('Hypertension Monitoring', 'hypertension', 'Monitoring for hypertensive patients', true, 13);

-- CKD Workup items
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'Complete Blood Count (CBC)', 'blood', 1 FROM investigation_templates WHERE name = 'CKD Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'Kidney Function Test (KFT)', 'blood', 2 FROM investigation_templates WHERE name = 'CKD Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'Liver Function Test (LFT)', 'blood', 3 FROM investigation_templates WHERE name = 'CKD Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'Electrolytes', 'blood', 4 FROM investigation_templates WHERE name = 'CKD Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'Fasting Blood Sugar', 'blood', 5 FROM investigation_templates WHERE name = 'CKD Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'HbA1c', 'blood', 6 FROM investigation_templates WHERE name = 'CKD Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'Lipid Profile', 'blood', 7 FROM investigation_templates WHERE name = 'CKD Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'Serum Calcium', 'blood', 8 FROM investigation_templates WHERE name = 'CKD Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'Serum Phosphorus', 'blood', 9 FROM investigation_templates WHERE name = 'CKD Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'Serum Uric Acid', 'blood', 10 FROM investigation_templates WHERE name = 'CKD Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'Intact PTH', 'blood', 11 FROM investigation_templates WHERE name = 'CKD Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'Vitamin D (25-OH)', 'blood', 12 FROM investigation_templates WHERE name = 'CKD Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'Serum Iron', 'blood', 13 FROM investigation_templates WHERE name = 'CKD Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'Ferritin', 'blood', 14 FROM investigation_templates WHERE name = 'CKD Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'TIBC', 'blood', 15 FROM investigation_templates WHERE name = 'CKD Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'Urine Routine', 'urine', 16 FROM investigation_templates WHERE name = 'CKD Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'Urine Protein Creatinine Ratio', 'urine', 17 FROM investigation_templates WHERE name = 'CKD Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'Urine Albumin Creatinine Ratio', 'urine', 18 FROM investigation_templates WHERE name = 'CKD Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'Ultrasound KUB', 'imaging', 19 FROM investigation_templates WHERE name = 'CKD Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'ECG', 'other', 20 FROM investigation_templates WHERE name = 'CKD Workup';

-- Pre-Dialysis Workup items
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'Complete Blood Count (CBC)', 'blood', 1 FROM investigation_templates WHERE name = 'Pre-Dialysis Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'Kidney Function Test (KFT)', 'blood', 2 FROM investigation_templates WHERE name = 'Pre-Dialysis Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'Electrolytes', 'blood', 3 FROM investigation_templates WHERE name = 'Pre-Dialysis Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'Calcium, Phosphorus, iPTH', 'blood', 4 FROM investigation_templates WHERE name = 'Pre-Dialysis Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'Hemoglobin, Iron Studies', 'blood', 5 FROM investigation_templates WHERE name = 'Pre-Dialysis Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'Blood Group & Cross Match', 'blood', 6 FROM investigation_templates WHERE name = 'Pre-Dialysis Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'Hepatitis B Surface Antigen', 'blood', 7 FROM investigation_templates WHERE name = 'Pre-Dialysis Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'Anti HCV', 'blood', 8 FROM investigation_templates WHERE name = 'Pre-Dialysis Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'HIV', 'blood', 9 FROM investigation_templates WHERE name = 'Pre-Dialysis Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'Viral Load (HBV, HCV)', 'blood', 10 FROM investigation_templates WHERE name = 'Pre-Dialysis Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'USG with KUB', 'imaging', 11 FROM investigation_templates WHERE name = 'Pre-Dialysis Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'Chest X-ray', 'imaging', 12 FROM investigation_templates WHERE name = 'Pre-Dialysis Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'ECG', 'other', 13 FROM investigation_templates WHERE name = 'Pre-Dialysis Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, '2D ECHO', 'other', 14 FROM investigation_templates WHERE name = 'Pre-Dialysis Workup';
INSERT INTO investigation_template_items (template_id, test_name, category, sort_order)
SELECT id, 'AV Fistula Assessment', 'other', 15 FROM investigation_templates WHERE name = 'Pre-Dialysis Workup';

-- ============================================================
-- 16. SEED DATA - Advice Templates
-- ============================================================
INSERT INTO advice_templates (name, category, description, is_system, sort_order) VALUES
('CKD Stage 1-3 Advice', 'diet', 'Diet and lifestyle advice for early CKD', true, 1),
('CKD Stage 4-5 Advice', 'diet', 'Diet and lifestyle advice for advanced CKD', true, 2),
('Pre-Dialysis Advice', 'dialysis', 'Advice before starting dialysis', true, 3),
('Hemodialysis Advice', 'dialysis', 'Advice for HD patients', true, 4),
('Peritoneal Dialysis Advice', 'dialysis', 'Advice for PD patients', true, 5),
('Post-Transplant Advice', 'transplant', 'Advice after kidney transplant', true, 6),
('Diabetes & CKD Advice', 'diabetes', 'Special advice for diabetic CKD patients', true, 7),
('Hypertension & CKD Advice', 'hypertension', 'Special advice for hypertensive CKD patients', true, 8),
('Kidney Stone Prevention', 'stones', 'Prevention advice for kidney stones', true, 9),
('UTI Prevention', 'infection', 'Prevention advice for UTI', true, 10);

-- CKD Stage 1-3 Advice items
INSERT INTO advice_template_items (template_id, advice_text, category, is_critical, sort_order)
SELECT id, 'Low salt diet - Less than 5g salt per day', 'diet', true, 1 FROM advice_templates WHERE name = 'CKD Stage 1-3 Advice';
INSERT INTO advice_template_items (template_id, advice_text, category, is_critical, sort_order)
SELECT id, 'Moderate protein intake (0.8-1.0 g/kg/day)', 'diet', true, 2 FROM advice_templates WHERE name = 'CKD Stage 1-3 Advice';
INSERT INTO advice_template_items (template_id, advice_text, category, is_critical, sort_order)
SELECT id, 'Drink 2-3 liters of water daily', 'lifestyle', false, 3 FROM advice_templates WHERE name = 'CKD Stage 1-3 Advice';
INSERT INTO advice_template_items (template_id, advice_text, category, is_critical, sort_order)
SELECT id, 'Avoid painkillers (NSAIDs) - use Paracetamol only', 'medication', true, 4 FROM advice_templates WHERE name = 'CKD Stage 1-3 Advice';
INSERT INTO advice_template_items (template_id, advice_text, category, is_critical, sort_order)
SELECT id, 'Regular exercise - 30 minutes daily', 'lifestyle', false, 5 FROM advice_templates WHERE name = 'CKD Stage 1-3 Advice';
INSERT INTO advice_template_items (template_id, advice_text, category, is_critical, sort_order)
SELECT id, 'Control blood sugar if diabetic', 'lifestyle', true, 6 FROM advice_templates WHERE name = 'CKD Stage 1-3 Advice';
INSERT INTO advice_template_items (template_id, advice_text, category, is_critical, sort_order)
SELECT id, 'Quit smoking if applicable', 'lifestyle', true, 7 FROM advice_templates WHERE name = 'CKD Stage 1-3 Advice';
INSERT INTO advice_template_items (template_id, advice_text, category, is_critical, sort_order)
SELECT id, 'Limit potassium-rich foods (bananas, oranges, potatoes)', 'diet', false, 8 FROM advice_templates WHERE name = 'CKD Stage 1-3 Advice';
INSERT INTO advice_template_items (template_id, advice_text, category, is_critical, sort_order)
SELECT id, 'Avoid processed and canned foods', 'diet', false, 9 FROM advice_templates WHERE name = 'CKD Stage 1-3 Advice';
INSERT INTO advice_template_items (template_id, advice_text, category, is_critical, sort_order)
SELECT id, 'Follow up every 3 months', 'follow_up', true, 10 FROM advice_templates WHERE name = 'CKD Stage 1-3 Advice';

-- CKD Stage 4-5 Advice items
INSERT INTO advice_template_items (template_id, advice_text, category, is_critical, sort_order)
SELECT id, 'Strict low salt diet - Less than 2g salt per day', 'diet', true, 1 FROM advice_templates WHERE name = 'CKD Stage 4-5 Advice';
INSERT INTO advice_template_items (template_id, advice_text, category, is_critical, sort_order)
SELECT id, 'Low protein diet (0.6-0.8 g/kg/day) with keto analogs', 'diet', true, 2 FROM advice_templates WHERE name = 'CKD Stage 4-5 Advice';
INSERT INTO advice_template_items (template_id, advice_text, category, is_critical, sort_order)
SELECT id, 'Fluid restriction if swelling - as directed', 'diet', true, 3 FROM advice_templates WHERE name = 'CKD Stage 4-5 Advice';
INSERT INTO advice_template_items (template_id, advice_text, category, is_critical, sort_order)
SELECT id, 'Strictly avoid painkillers (NSAIDs)', 'medication', true, 4 FROM advice_templates WHERE name = 'CKD Stage 4-5 Advice';
INSERT INTO advice_template_items (template_id, advice_text, category, is_critical, sort_order)
SELECT id, 'Avoid potassium-rich foods (bananas, oranges, coconut water, potatoes)', 'diet', true, 5 FROM advice_templates WHERE name = 'CKD Stage 4-5 Advice';
INSERT INTO advice_template_items (template_id, advice_text, category, is_critical, sort_order)
SELECT id, 'Avoid phosphate-rich foods (cola, processed cheese, packaged foods)', 'diet', true, 6 FROM advice_templates WHERE name = 'CKD Stage 4-5 Advice';
INSERT INTO advice_template_items (template_id, advice_text, category, is_critical, sort_order)
SELECT id, 'Take all medicines regularly as prescribed', 'medication', true, 7 FROM advice_templates WHERE name = 'CKD Stage 4-5 Advice';
INSERT INTO advice_template_items (template_id, advice_text, category, is_critical, sort_order)
SELECT id, 'Monitor blood pressure daily', 'lifestyle', true, 8 FROM advice_templates WHERE name = 'CKD Stage 4-5 Advice';
INSERT INTO advice_template_items (template_id, advice_text, category, is_critical, sort_order)
SELECT id, 'Watch for swelling, breathlessness, chest pain - report immediately', 'lifestyle', true, 9 FROM advice_templates WHERE name = 'CKD Stage 4-5 Advice';
INSERT INTO advice_template_items (template_id, advice_text, category, is_critical, sort_order)
SELECT id, 'Dialysis access planning needed - discuss with doctor', 'follow_up', true, 10 FROM advice_templates WHERE name = 'CKD Stage 4-5 Advice';
INSERT INTO advice_template_items (template_id, advice_text, category, is_critical, sort_order)
SELECT id, 'Follow up every 1-2 months', 'follow_up', true, 11 FROM advice_templates WHERE name = 'CKD Stage 4-5 Advice';

-- ============================================================
-- 17. SEED DATA - Medicine Templates (Common Prescriptions)
-- ============================================================
INSERT INTO medicine_templates (name, category, description, is_system, sort_order) VALUES
('CKD Stage 1-2', 'ckd', 'Standard prescription for CKD Stage 1-2', true, 1),
('CKD Stage 3', 'ckd', 'Standard prescription for CKD Stage 3', true, 2),
('CKD Stage 4', 'ckd', 'Standard prescription for CKD Stage 4', true, 3),
('CKD Stage 5', 'ckd', 'Standard prescription for CKD Stage 5', true, 4),
('Hypertension', 'hypertension', 'Standard antihypertensive prescription', true, 5),
('Diabetes', 'diabetes', 'Standard diabetic prescription', true, 6),
('Post-Transplant', 'transplant', 'Post-transplant immunosuppression', true, 7),
('Dialysis Patients', 'dialysis', 'Common medicines for dialysis patients', true, 8);

-- CKD Stage 1-2 template items
INSERT INTO medicine_template_items (template_id, medicine_id, dosage, frequency, timing, duration, sort_order)
SELECT mt.id, m.id, '1 tablet', 'Once daily', 'Morning', '30 days', 1
FROM medicine_templates mt, medicines m WHERE mt.name = 'CKD Stage 1-2' AND m.name = 'Telmisartan 40mg';
INSERT INTO medicine_template_items (template_id, medicine_id, dosage, frequency, timing, duration, sort_order)
SELECT mt.id, m.id, '1 tablet', 'Once daily', 'Morning', '30 days', 2
FROM medicine_templates mt, medicines m WHERE mt.name = 'CKD Stage 1-2' AND m.name = 'Cholecalciferol 1000IU';
INSERT INTO medicine_template_items (template_id, medicine_id, dosage, frequency, timing, duration, sort_order)
SELECT mt.id, m.id, '1 tablet', 'Once daily', 'Night', '30 days', 3
FROM medicine_templates mt, medicines m WHERE mt.name = 'CKD Stage 1-2' AND m.name = 'Sodium Bicarbonate 500mg';

-- CKD Stage 3 template items
INSERT INTO medicine_template_items (template_id, medicine_id, dosage, frequency, timing, duration, sort_order)
SELECT mt.id, m.id, '1 tablet', 'Once daily', 'Morning', '30 days', 1
FROM medicine_templates mt, medicines m WHERE mt.name = 'CKD Stage 3' AND m.name = 'Telmisartan 40mg';
INSERT INTO medicine_template_items (template_id, medicine_id, dosage, frequency, timing, duration, sort_order)
SELECT mt.id, m.id, '1 tablet', 'Once daily', 'Morning', '30 days', 2
FROM medicine_templates mt, medicines m WHERE mt.name = 'CKD Stage 3' AND m.name = 'Cholecalciferol 60000IU';
INSERT INTO medicine_template_items (template_id, medicine_id, dosage, frequency, timing, duration, sort_order)
SELECT mt.id, m.id, '1 tablet', 'Once daily', 'Night', '30 days', 3
FROM medicine_templates mt, medicines m WHERE mt.name = 'CKD Stage 3' AND m.name = 'Sodium Bicarbonate 500mg';
INSERT INTO medicine_template_items (template_id, medicine_id, dosage, frequency, timing, duration, sort_order)
SELECT mt.id, m.id, '1 tablet', 'Twice daily', 'With meals', '30 days', 4
FROM medicine_templates mt, medicines m WHERE mt.name = 'CKD Stage 3' AND m.name = 'Sevelamer 400mg';
INSERT INTO medicine_template_items (template_id, medicine_id, dosage, frequency, timing, duration, sort_order)
SELECT mt.id, m.id, '1 tablet', 'Once daily', 'Morning', '30 days', 5
FROM medicine_templates mt, medicines m WHERE mt.name = 'CKD Stage 3' AND m.name = 'Dapagliflozin 10mg';

-- ============================================================
-- 18. MATERIALIZED VIEW for Medicine Search (Fast Autocomplete)
-- ============================================================
CREATE MATERIALIZED VIEW mv_medicine_search AS
SELECT 
    id,
    name,
    generic_name,
    brand_name,
    category,
    form,
    strength,
    strength_numeric,
    strength_unit,
    manufacturer,
    mrp,
    is_nephrotoxic,
    requires_monitoring
FROM medicines
WHERE is_active = true
ORDER BY name;

CREATE UNIQUE INDEX idx_mv_medicine_search_id ON mv_medicine_search(id);
CREATE INDEX idx_mv_medicine_search_name ON mv_medicine_search USING gin(name gin_trgm_ops);
CREATE INDEX idx_mv_medicine_search_generic ON mv_medicine_search USING gin(generic_name gin_trgm_ops);

-- ============================================================
-- 19. FUNCTION to refresh medicine search view
-- ============================================================
CREATE OR REPLACE FUNCTION refresh_medicine_search()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_medicine_search;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 20. GRANT PERMISSIONS
-- ============================================================
-- These will be adjusted when RLS policies are added
GRANT SELECT ON complaint_templates TO authenticated;
GRANT SELECT ON diagnosis_templates TO authenticated;
GRANT SELECT ON medicines TO authenticated;
GRANT SELECT ON medicine_templates TO authenticated;
GRANT SELECT ON medicine_template_items TO authenticated;
GRANT SELECT ON investigation_templates TO authenticated;
GRANT SELECT ON investigation_template_items TO authenticated;
GRANT SELECT ON advice_templates TO authenticated;
GRANT SELECT ON advice_template_items TO authenticated;
GRANT SELECT ON consultation_complaints TO authenticated;
GRANT SELECT ON consultation_diagnoses TO authenticated;
GRANT SELECT ON mv_medicine_search TO authenticated;

-- Admin/Doctor can manage templates
GRANT INSERT, UPDATE, DELETE ON complaint_templates TO authenticated;
GRANT INSERT, UPDATE, DELETE ON diagnosis_templates TO authenticated;
GRANT INSERT, UPDATE, DELETE ON medicine_templates TO authenticated;
GRANT INSERT, UPDATE, DELETE ON medicine_template_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON investigation_templates TO authenticated;
GRANT INSERT, UPDATE, DELETE ON investigation_template_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON advice_templates TO authenticated;
GRANT INSERT, UPDATE, DELETE ON advice_template_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON consultation_complaints TO authenticated;
GRANT INSERT, UPDATE, DELETE ON consultation_diagnoses TO authenticated;
