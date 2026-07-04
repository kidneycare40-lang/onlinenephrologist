-- ============================================================
-- EMR Database Schema Migration
-- Hospital EMR System for Nephrology Practice
-- PostgreSQL (Supabase)
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fast text search

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'receptionist', 'nurse', 'patient');
CREATE TYPE gender AS ENUM ('Male', 'Female', 'Other');
CREATE TYPE blood_group AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE appointment_status AS ENUM ('WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE appointment_type AS ENUM ('WALK_IN', 'ONLINE', 'FOLLOW_UP', 'HOSPITAL');
CREATE TYPE consultation_status AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE prescription_status AS ENUM ('Active', 'Completed', 'Cancelled');
CREATE TYPE invoice_status AS ENUM ('PAID', 'PENDING', 'PARTIAL', 'CANCELLED');
CREATE TYPE payment_method AS ENUM ('CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE');
CREATE TYPE discount_type AS ENUM ('PERCENTAGE', 'FIXED');
CREATE TYPE investigation_status AS ENUM ('Pending', 'In Progress', 'Completed');
CREATE TYPE timeline_event_type AS ENUM ('consultation', 'prescription', 'lab_result', 'report', 'appointment', 'vitals', 'dialysis', 'transplant', 'note', 'phone_call');
CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIAL_REFUND');
CREATE TYPE message_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'LOGIN', 'LOGOUT');

-- ============================================================
-- CORE TABLES
-- ============================================================

-- 1. Users / Doctors / Staff
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'receptionist',
    password_hash VARCHAR(255),
    qualification VARCHAR(500),
    registration_number VARCHAR(50),
    specialization VARCHAR(100),
    experience_years INTEGER,
    bio TEXT,
    profile_photo_url TEXT,
    consultation_fee DECIMAL(10,2),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- 2. Clinics / Hospital Locations
CREATE TABLE clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    short_name VARCHAR(50),
    parent_name VARCHAR(200),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    gst_number VARCHAR(20),
    pan_number VARCHAR(20),
    fee DECIMAL(10,2),
    color VARCHAR(7),
    features TEXT[],
    working_days INTEGER[] DEFAULT '{1,2,3,4,5,6}',
    start_time TIME DEFAULT '09:00',
    end_time TIME DEFAULT '18:00',
    slot_interval INTEGER DEFAULT 15,
    break_start TIME DEFAULT '13:00',
    break_end TIME DEFAULT '14:00',
    max_patients_per_day INTEGER DEFAULT 40,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- 3. Doctor-Clinic Mapping
CREATE TABLE doctor_clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    consultation_fee DECIMAL(10,2),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(doctor_id, clinic_id)
);

-- 4. Doctor Schedule
CREATE TABLE doctor_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_start TIME,
    break_end TIME,
    slot_interval INTEGER DEFAULT 15,
    max_patients INTEGER DEFAULT 20,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(doctor_id, clinic_id, day_of_week)
);

-- 5. Patients
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uhid VARCHAR(30) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    date_of_birth DATE,
    gender gender,
    blood_group blood_group,
    abha_number VARCHAR(14),
    aadhaar VARCHAR(12),
    primary_clinic_id UUID REFERENCES clinics(id),
    is_chronic BOOLEAN NOT NULL DEFAULT false,
    chronic_conditions TEXT[],
    is_international BOOLEAN NOT NULL DEFAULT false,
    country_code VARCHAR(5) DEFAULT '+91',
    preferred_language VARCHAR(20) DEFAULT 'English',
    passport_number VARCHAR(20),
    whatsapp_number VARCHAR(20),
    insurance_provider VARCHAR(200),
    insurance_number VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    total_visits INTEGER NOT NULL DEFAULT 0,
    last_visit_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- 6. Patient Addresses
CREATE TABLE patient_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL DEFAULT 'current' CHECK (type IN ('current', 'permanent', 'correspondence')),
    address_line1 VARCHAR(300),
    address_line2 VARCHAR(300),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    country VARCHAR(100) DEFAULT 'India',
    is_primary BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Patient Emergency Contacts
CREATE TABLE patient_emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    relation VARCHAR(50),
    phone VARCHAR(20) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Family Members
CREATE TABLE patient_family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    relation VARCHAR(50),
    phone VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Allergies
CREATE TABLE patient_allergies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    allergen VARCHAR(200) NOT NULL,
    severity VARCHAR(20) DEFAULT 'unknown',
    reaction TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Medical History
CREATE TABLE patient_medical_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    condition_name VARCHAR(300) NOT NULL,
    icd_code VARCHAR(20),
    onset_date DATE,
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'chronic', 'in_remission')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Surgical History
CREATE TABLE patient_surgical_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    procedure_name VARCHAR(300) NOT NULL,
    procedure_date DATE,
    surgeon VARCHAR(200),
    hospital VARCHAR(200),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Social History
CREATE TABLE patient_social_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    smoking_status VARCHAR(30) DEFAULT 'never' CHECK (smoking_status IN ('never', 'former', 'current')),
    smoking_years INTEGER,
    alcohol_status VARCHAR(30) DEFAULT 'never' CHECK (alcohol_status IN ('never', 'former', 'current', 'social')),
    alcohol_units_per_week INTEGER,
    occupation VARCHAR(200),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Medical History (plain text field on patient for quick access)
ALTER TABLE patients ADD COLUMN IF NOT EXISTS medical_history TEXT;

-- ============================================================
-- APPOINTMENTS
-- ============================================================

CREATE TABLE appointment_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES users(id),
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    slot_date DATE NOT NULL,
    slot_time TIME NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT true,
    max_bookings INTEGER DEFAULT 1,
    current_bookings INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(doctor_id, clinic_id, slot_date, slot_time)
);

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id VARCHAR(20),
    patient_id UUID NOT NULL REFERENCES patients(id),
    doctor_id UUID NOT NULL REFERENCES users(id),
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    slot_id UUID REFERENCES appointment_slots(id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    type appointment_type NOT NULL DEFAULT 'WALK_IN',
    status appointment_status NOT NULL DEFAULT 'WAITING',
    reason TEXT,
    notes TEXT,
    payment_status VARCHAR(20) DEFAULT 'FREE' CHECK (payment_status IN ('FREE', 'PAID', 'PENDING')),
    amount DECIMAL(10,2),
    currency VARCHAR(5) DEFAULT 'INR',
    is_follow_up BOOLEAN NOT NULL DEFAULT false,
    follow_up_of UUID REFERENCES appointments(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- ============================================================
-- VITALS & CLINICAL DATA
-- ============================================================

CREATE TABLE vitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    consultation_id UUID,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_by UUID REFERENCES users(id),
    blood_pressure_systolic NUMERIC(5,1),
    blood_pressure_diastolic NUMERIC(5,1),
    heart_rate INTEGER,
    pulse INTEGER,
    temperature NUMERIC(4,1),
    weight NUMERIC(5,2),
    height NUMERIC(5,1),
    bmi NUMERIC(4,1),
    spo2 NUMERIC(4,1),
    blood_sugar NUMERIC(6,1),
    respiratory_rate INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE kidney_parameters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    consultation_id UUID,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recorded_by UUID REFERENCES users(id),
    creatinine NUMERIC(6,2),
    blood_urea NUMERIC(6,1),
    egfr NUMERIC(8,2),
    potassium NUMERIC(4,2),
    sodium NUMERIC(4,1),
    calcium NUMERIC(4,2),
    phosphorus NUMERIC(4,2),
    hemoglobin NUMERIC(4,1),
    albumin NUMERIC(4,2),
    proteinuria VARCHAR(50),
    uric_acid NUMERIC(4,1),
    pth NUMERIC(8,2),
    vitamin_d NUMERIC(4,1),
    cholesterol_total NUMERIC(5,1),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- ============================================================
-- CONSULTATIONS
-- ============================================================

CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    doctor_id UUID NOT NULL REFERENCES users(id),
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    appointment_id UUID REFERENCES appointments(id),
    consultation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status consultation_status NOT NULL DEFAULT 'IN_PROGRESS',
    chief_complaint TEXT,
    hpi TEXT,
    examination TEXT,
    notes TEXT,
    follow_up_date DATE,
    follow_up_instructions TEXT,
    token_id VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- ============================================================
-- DIAGNOSES
-- ============================================================

CREATE TABLE diagnoses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    icd_code VARCHAR(20),
    snomed_code VARCHAR(30),
    name VARCHAR(300) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PRESCRIPTIONS
-- ============================================================

CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_number VARCHAR(30) UNIQUE NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id),
    doctor_id UUID NOT NULL REFERENCES users(id),
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    consultation_id UUID REFERENCES consultations(id),
    prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status prescription_status NOT NULL DEFAULT 'Active',
    diagnosis TEXT,
    advice TEXT,
    notes TEXT,
    follow_up_date DATE,
    is_template BOOLEAN NOT NULL DEFAULT false,
    template_name VARCHAR(100),
    template_category VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE prescription_medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_name VARCHAR(300) NOT NULL,
    generic_name VARCHAR(300),
    strength VARCHAR(50),
    dosage VARCHAR(50),
    dosage_pattern VARCHAR(50),
    frequency VARCHAR(100),
    when_to_take VARCHAR(50),
    duration VARCHAR(100),
    route VARCHAR(30) DEFAULT 'oral',
    instructions TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE prescription_investigations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    test_name VARCHAR(300) NOT NULL,
    category VARCHAR(100),
    notes TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INVESTIGATIONS & LAB RESULTS
-- ============================================================

CREATE TABLE investigation_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    doctor_id UUID NOT NULL REFERENCES users(id),
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    consultation_id UUID REFERENCES consultations(id),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status investigation_status NOT NULL DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE investigation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES investigation_orders(id) ON DELETE CASCADE,
    test_name VARCHAR(300) NOT NULL,
    category VARCHAR(100),
    result_value VARCHAR(200),
    unit VARCHAR(50),
    normal_range VARCHAR(100),
    is_abnormal BOOLEAN NOT NULL DEFAULT false,
    status investigation_status NOT NULL DEFAULT 'Pending',
    result_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DIALYSIS & TRANSPLANT
-- ============================================================

CREATE TABLE dialysis_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    doctor_id UUID REFERENCES users(id),
    clinic_id UUID REFERENCES clinics(id),
    session_date DATE NOT NULL,
    session_type VARCHAR(50) NOT NULL DEFAULT 'HD' CHECK (session_type IN ('HD', 'HDF', 'PD', 'SLEDD', 'CRRT')),
    start_time TIME,
    end_time TIME,
    duration_minutes INTEGER,
    pre_weight NUMERIC(5,2),
    post_weight NUMERIC(5,2),
    ultrafiltration_volume NUMERIC(6,1),
    blood_flow_rate INTEGER,
    dialysate_flow_rate INTEGER,
    heparin_dose VARCHAR(100),
    dialyzer VARCHAR(100),
    vascular_access VARCHAR(100),
    complications TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE kidney_transplant_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    transplant_date DATE NOT NULL,
    transplant_type VARCHAR(50) CHECK (transplant_type IN ('living_related', 'living_unrelated', 'deceased', 'ABO_incompatible')),
    donor_name VARCHAR(200),
    donor_relation VARCHAR(50),
    donor_blood_group blood_group,
    hospital VARCHAR(200),
    surgeon VARCHAR(200),
    immunosuppression TEXT,
    current_creatinine NUMERIC(6,2),
    graft_function VARCHAR(50),
    rejection_episodes INTEGER DEFAULT 0,
    complications TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- ============================================================
-- REPORTS & DOCUMENTS
-- ============================================================

CREATE TABLE uploaded_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES patients(id),
    uploaded_by UUID REFERENCES users(id),
    consultation_id UUID REFERENCES consultations(id),
    title VARCHAR(300) NOT NULL,
    category VARCHAR(100),
    file_url TEXT NOT NULL,
    file_name VARCHAR(300),
    file_size INTEGER,
    mime_type VARCHAR(100),
    report_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- ============================================================
-- LETTERHEADS
-- ============================================================

CREATE TABLE letterheads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('header', 'footer')),
    image_data TEXT NOT NULL,
    content_type VARCHAR(30) DEFAULT 'image/jpeg',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    UNIQUE(clinic_id, type)
);

-- ============================================================
-- BILLING & PAYMENTS
-- ============================================================

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(30) UNIQUE NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id),
    doctor_id UUID REFERENCES users(id),
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    consultation_id UUID REFERENCES consultations(id),
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_type discount_type DEFAULT 'PERCENTAGE',
    gst_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
    gst_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_tax DECIMAL(12,2) NOT NULL DEFAULT 0,
    grand_total DECIMAL(12,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    status invoice_status NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    terms TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description VARCHAR(300) NOT NULL,
    hsn_code VARCHAR(20),
    quantity NUMERIC(6,2) NOT NULL DEFAULT 1,
    rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    gst_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
    gst_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    amount DECIMAL(12,2) NOT NULL,
    method payment_method NOT NULL,
    reference VARCHAR(200),
    transaction_id VARCHAR(200),
    gateway VARCHAR(50),
    gateway_response JSONB,
    status payment_status NOT NULL DEFAULT 'PENDING',
    refund_amount DECIMAL(12,2) DEFAULT 0,
    refund_reason TEXT,
    refunded_at TIMESTAMPTZ,
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- ============================================================
-- SETTINGS
-- ============================================================

CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(200) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'general',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

-- ============================================================
-- NOTIFICATIONS & MESSAGING
-- ============================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    patient_id UUID REFERENCES patients(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE whatsapp_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id),
    appointment_id UUID REFERENCES appointments(id),
    phone_number VARCHAR(20) NOT NULL,
    direction message_direction NOT NULL DEFAULT 'outbound',
    message_type VARCHAR(50) NOT NULL DEFAULT 'text',
    message_content TEXT,
    media_url TEXT,
    status VARCHAR(30) DEFAULT 'sent',
    external_id VARCHAR(200),
    error_message TEXT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sms_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id),
    phone_number VARCHAR(20) NOT NULL,
    direction message_direction NOT NULL DEFAULT 'outbound',
    message_content TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'sent',
    external_id VARCHAR(200),
    error_message TEXT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id),
    email_address VARCHAR(255) NOT NULL,
    direction message_direction NOT NULL DEFAULT 'outbound',
    subject VARCHAR(500),
    body TEXT,
    attachments JSONB,
    status VARCHAR(30) DEFAULT 'sent',
    external_id VARCHAR(200),
    error_message TEXT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUDIT & ACTIVITY LOGS
-- ============================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action audit_action NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    patient_id UUID REFERENCES patients(id),
    action VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- OTP RECORDS
-- ============================================================

CREATE TABLE otp_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    otp VARCHAR(10) NOT NULL,
    purpose VARCHAR(50) NOT NULL DEFAULT 'login',
    verified BOOLEAN NOT NULL DEFAULT false,
    attempts INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PATIENT-FACING BOOKINGS (online booking system)
-- ============================================================

CREATE TABLE patient_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number VARCHAR(30) UNIQUE NOT NULL,
    patient_id UUID REFERENCES patients(id),
    patient_name VARCHAR(200) NOT NULL,
    patient_phone VARCHAR(20) NOT NULL,
    patient_email VARCHAR(255),
    clinic_id UUID NOT NULL REFERENCES clinics(id),
    doctor_id UUID REFERENCES users(id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    type appointment_type NOT NULL DEFAULT 'WALK_IN',
    status appointment_status NOT NULL DEFAULT 'WAITING',
    reason TEXT,
    notes TEXT,
    fee DECIMAL(10,2) DEFAULT 0,
    paid BOOLEAN NOT NULL DEFAULT false,
    country_code VARCHAR(5) DEFAULT '+91',
    timezone VARCHAR(50),
    whatsapp_number VARCHAR(20),
    preferred_language VARCHAR(20) DEFAULT 'English',
    is_international BOOLEAN NOT NULL DEFAULT false,
    reports TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Patients (most queried)
CREATE INDEX idx_patients_uhid ON patients(uhid);
CREATE INDEX idx_patients_phone ON patients(phone) WHERE is_deleted = false;
CREATE INDEX idx_patients_email ON patients(email) WHERE email IS NOT NULL;
CREATE INDEX idx_patients_name ON patients USING gin (first_name gin_trgm_ops, last_name gin_trgm_ops);
CREATE INDEX idx_patients_name_trgm ON patients USING gin ((first_name || ' ' || last_name) gin_trgm_ops);
CREATE INDEX idx_patients_dob ON patients(date_of_birth);
CREATE INDEX idx_patients_clinic ON patients(primary_clinic_id);
CREATE INDEX idx_patients_is_active ON patients(is_active) WHERE is_deleted = false;

-- Appointments
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_clinic ON appointments(clinic_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date_doctor ON appointments(appointment_date, doctor_id);
CREATE INDEX idx_appointments_date_clinic ON appointments(appointment_date, clinic_id);

-- Consultations
CREATE INDEX idx_consultations_patient ON consultations(patient_id);
CREATE INDEX idx_consultations_doctor ON consultations(doctor_id);
CREATE INDEX idx_consultations_date ON consultations(consultation_date);
CREATE INDEX idx_consultations_clinic ON consultations(clinic_id);

-- Prescriptions
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_date ON prescriptions(prescription_date);
CREATE INDEX idx_prescriptions_template ON prescriptions(is_template) WHERE is_template = true;

-- Vitals
CREATE INDEX idx_vitals_patient ON vitals(patient_id);
CREATE INDEX idx_vitals_patient_date ON vitals(patient_id, recorded_at DESC);

-- Kidney Parameters
CREATE INDEX idx_kidney_params_patient ON kidney_parameters(patient_id);
CREATE INDEX idx_kidney_params_patient_date ON kidney_parameters(patient_id, recorded_at DESC);

-- Invoices
CREATE INDEX idx_invoices_patient ON invoices(patient_id);
CREATE INDEX idx_invoices_clinic ON invoices(clinic_id);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);

-- Payments
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_patient ON payments(patient_id);
CREATE INDEX idx_payments_date ON payments(payment_date);

-- Investigation Orders
CREATE INDEX idx_investigation_orders_patient ON investigation_orders(patient_id);
CREATE INDEX idx_investigation_orders_date ON investigation_orders(order_date);

-- Dialysis
CREATE INDEX idx_dialysis_patient ON dialysis_sessions(patient_id);
CREATE INDEX idx_dialysis_date ON dialysis_sessions(session_date);

-- Reports
CREATE INDEX idx_reports_patient ON uploaded_reports(patient_id);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id) WHERE is_read = false;

-- WhatsApp Logs
CREATE INDEX idx_whatsapp_patient ON whatsapp_logs(patient_id);
CREATE INDEX idx_whatsapp_phone ON whatsapp_logs(phone_number);

-- Audit Logs
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- Activity Logs
CREATE INDEX idx_activity_patient ON activity_logs(patient_id);
CREATE INDEX idx_activity_user ON activity_logs(user_id);

-- Settings
CREATE INDEX idx_settings_category ON settings(category);

-- Letterheads
CREATE INDEX idx_letterheads_clinic ON letterheads(clinic_id);

-- Appointment Slots
CREATE INDEX idx_slots_doctor_date ON appointment_slots(doctor_id, slot_date);
CREATE INDEX idx_slots_clinic_date ON appointment_slots(clinic_id, slot_date);

-- Patient Bookings
CREATE INDEX idx_bookings_patient ON patient_bookings(patient_id);
CREATE INDEX idx_bookings_clinic ON patient_bookings(clinic_id);
CREATE INDEX idx_bookings_date ON patient_bookings(appointment_date);

-- Diagnoses
CREATE INDEX idx_diagnoses_consultation ON diagnoses(consultation_id);

-- Prescription Medicines
CREATE INDEX idx_rx_meds_prescription ON prescription_medicines(prescription_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vitals_updated_at BEFORE UPDATE ON vitals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kidney_parameters_updated_at BEFORE UPDATE ON kidney_parameters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investigation_orders_updated_at BEFORE UPDATE ON investigation_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate UHID
CREATE OR REPLACE FUNCTION generate_uhid(clinic_prefix TEXT DEFAULT 'KCC')
RETURNS TEXT AS $$
DECLARE
    new_uhid TEXT;
    counter INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO counter FROM patients WHERE uhid LIKE clinic_prefix || '-%';
    new_uhid := clinic_prefix || '-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(counter::TEXT, 5, '0');
    RETURN new_uhid;
END;
$$ LANGUAGE plpgsql;

-- Generate Invoice Number
CREATE OR REPLACE FUNCTION generate_invoice_number(clinic_short TEXT DEFAULT 'KCC')
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO counter FROM invoices WHERE invoice_number LIKE 'INV-' || clinic_short || '-%';
    new_number := 'INV-' || clinic_short || '-' || LPAD(counter::TEXT, 5, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Generate Prescription Number
CREATE OR REPLACE FUNCTION generate_prescription_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO counter FROM prescriptions;
    new_number := 'RX-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Generate Booking Number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO counter FROM patient_bookings;
    new_number := 'BK-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - Run after app is ready
-- ============================================================

-- ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SEED DATA - Default Admin User
-- ============================================================

INSERT INTO users (id, first_name, last_name, email, phone, role, qualification, registration_number, specialization, experience_years, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Rajesh',
    'Goel',
    '2311.rajesh@gmail.com',
    '9818235688',
    'doctor',
    'MBBS, DNB Internal Medicine, DNB Nephrology, Fellow Kidney Transplant Medicine',
    'DMC/R/00734',
    'Nephrology',
    18,
    true
) ON CONFLICT (id) DO NOTHING;

-- Default Clinics
INSERT INTO clinics (id, name, short_name, parent_name, city, state, pincode, phone, fee, is_active)
VALUES
    ('00000000-0000-0000-0000-000000000010', 'Kidney Care Centre - Faridabad', 'KCC-FBD', 'Kidney Care Centre', 'Faridabad', 'Haryana', '121001', '9818235688', 1500, true),
    ('00000000-0000-0000-0000-000000000011', 'Kidney Care Centre - Saket', 'KCC-SKT', 'Kidney Care Centre', 'New Delhi', 'Delhi', '110017', '9818235688', 1500, true),
    ('00000000-0000-0000-0000-000000000012', 'PSRI Hospital Delhi', 'PSRI', 'PSRI Hospital', 'New Delhi', 'Delhi', '110017', '01171471471', 2000, true)
ON CONFLICT (id) DO NOTHING;

-- Doctor-Clinic links
INSERT INTO doctor_clinics (doctor_id, clinic_id, consultation_fee)
VALUES
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 1500),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', 1500),
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000012', 2000)
ON CONFLICT DO NOTHING;
