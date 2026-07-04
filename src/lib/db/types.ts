// ============================================================
// EMR Database Types
// Generated from PostgreSQL schema
// ============================================================

// ============================================================
// ENUMS
// ============================================================

export type UserRole = 'admin' | 'doctor' | 'receptionist' | 'nurse' | 'patient';
export type Gender = 'Male' | 'Female' | 'Other';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'CHECKED_IN' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED';
export type AppointmentType = 'WALK_IN' | 'ONLINE' | 'FOLLOW_UP' | 'HOSPITAL';
export type ConsultationStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED';
export type PrescriptionStatus = 'Active' | 'Completed' | 'Cancelled';
export type InvoiceStatus = 'PAID' | 'PENDING' | 'PARTIAL' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'CHEQUE' | 'ONLINE';
export type DiscountType = 'PERCENTAGE' | 'FIXED';
export type InvestigationStatus = 'Pending' | 'In Progress' | 'Completed';
export type TimelineEventType = 'consultation' | 'prescription' | 'lab_result' | 'report' | 'appointment' | 'vitals' | 'dialysis' | 'transplant' | 'note' | 'phone_call';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'PARTIAL_REFUND';
export type MessageDirection = 'inbound' | 'outbound';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT' | 'LOGIN' | 'LOGOUT';
export type SessionType = 'HD' | 'HDF' | 'PD' | 'SLEDD' | 'CRRT';
export type TransplantType = 'living_related' | 'living_unrelated' | 'deceased' | 'ABO_incompatible';
export type HistoryStatus = 'active' | 'resolved' | 'chronic' | 'in_remission';
export type SmokingStatus = 'never' | 'former' | 'current';
export type AlcoholStatus = 'never' | 'former' | 'current' | 'social';

// ============================================================
// BASE TYPES
// ============================================================

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface SoftDeletable {
  is_deleted: boolean;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  status?: string;
  clinicId?: string;
  doctorId?: string;
  dateFrom?: string;
  dateTo?: string;
  isActive?: boolean;
}

// ============================================================
// ENTITY TYPES
// ============================================================

// Users
export interface User extends BaseEntity, SoftDeletable {
  email: string | null;
  phone: string | null;
  first_name: string;
  last_name: string;
  role: UserRole;
  password_hash?: string | null;
  qualification: string | null;
  registration_number: string | null;
  specialization: string | null;
  experience_years: number | null;
  bio: string | null;
  profile_photo_url: string | null;
  consultation_fee: number | null;
  clinic_ids: string[] | null;
  is_active: boolean;
  last_login_at: string | null;
}

export interface UserCreate {
  email?: string;
  phone?: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  qualification?: string;
  registration_number?: string;
  specialization?: string;
  experience_years?: number;
  bio?: string;
  consultation_fee?: number;
}

// Clinics
export interface Clinic extends BaseEntity, SoftDeletable {
  name: string;
  short_name: string | null;
  parent_name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  gst_number: string | null;
  pan_number: string | null;
  fee: number | null;
  color: string | null;
  features: string[] | null;
  working_days: number[] | null;
  start_time: string | null;
  end_time: string | null;
  slot_interval: number | null;
  break_start: string | null;
  break_end: string | null;
  max_patients_per_day: number | null;
  is_active: boolean;
}

export interface ClinicCreate {
  name: string;
  short_name?: string;
  parent_name?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  website?: string;
  gst_number?: string;
  pan_number?: string;
  fee?: number;
  color?: string;
  features?: string[];
  working_days?: number[];
  start_time?: string;
  end_time?: string;
  slot_interval?: number;
  break_start?: string;
  break_end?: string;
  max_patients_per_day?: number;
}

// Doctor-Clinic
export interface DoctorClinic {
  id: string;
  doctor_id: string;
  clinic_id: string;
  consultation_fee: number | null;
  is_active: boolean;
  created_at: string;
}

// Doctor Schedule
export interface DoctorSchedule extends BaseEntity {
  doctor_id: string;
  clinic_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  break_start: string | null;
  break_end: string | null;
  slot_interval: number;
  max_patients: number;
  is_active: boolean;
}

// Patients
export interface Patient extends BaseEntity, SoftDeletable {
  uhid: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  date_of_birth: string | null;
  gender: Gender | null;
  blood_group: BloodGroup | null;
  abha_number: string | null;
  aadhaar: string | null;
  primary_clinic_id: string | null;
  medical_history: string | null;
  is_chronic: boolean;
  chronic_conditions: string[] | null;
  is_international: boolean;
  country_code: string;
  preferred_language: string;
  passport_number: string | null;
  whatsapp_number: string | null;
  insurance_provider: string | null;
  insurance_number: string | null;
  registration_date: string | null;
  is_active: boolean;
  total_visits: number;
  last_visit_date: string | null;
}

export interface PatientCreate {
  first_name: string;
  last_name: string;
  phone?: string;
  email?: string;
  date_of_birth?: string;
  gender?: Gender;
  blood_group?: BloodGroup;
  abha_number?: string;
  primary_clinic_id?: string;
  medical_history?: string;
  is_chronic?: boolean;
  chronic_conditions?: string[];
  is_international?: boolean;
  country_code?: string;
  preferred_language?: string;
  passport_number?: string;
  whatsapp_number?: string;
  insurance_provider?: string;
  insurance_number?: string;
  address?: PatientAddressCreate;
  emergency_contact?: PatientEmergencyContactCreate;
}

export interface PatientWithRelations extends Patient {
  addresses?: PatientAddress[];
  emergency_contacts?: PatientEmergencyContact[];
  family_members?: PatientFamilyMember[];
  allergies?: PatientAllergy[];
  medical_history_records?: PatientMedicalHistory[];
  surgical_history?: PatientSurgicalHistory[];
  social_history?: PatientSocialHistory | null;
  primary_clinic?: Clinic | null;
}

// Patient Addresses
export interface PatientAddress {
  id: string;
  patient_id: string;
  type: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientAddressCreate {
  type?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

// Patient Emergency Contacts
export interface PatientEmergencyContact {
  id: string;
  patient_id: string;
  name: string;
  relation: string | null;
  phone: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientEmergencyContactCreate {
  name: string;
  relation?: string;
  phone: string;
}

// Family Members
export interface PatientFamilyMember {
  id: string;
  patient_id: string;
  name: string;
  relation: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

// Allergies
export interface PatientAllergy {
  id: string;
  patient_id: string;
  allergen: string;
  severity: string;
  reaction: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Medical History
export interface PatientMedicalHistory {
  id: string;
  patient_id: string;
  condition_name: string;
  icd_code: string | null;
  onset_date: string | null;
  status: HistoryStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Surgical History
export interface PatientSurgicalHistory {
  id: string;
  patient_id: string;
  procedure_name: string;
  procedure_date: string | null;
  surgeon: string | null;
  hospital: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Social History
export interface PatientSocialHistory {
  id: string;
  patient_id: string;
  smoking_status: SmokingStatus;
  smoking_years: number | null;
  alcohol_status: AlcoholStatus;
  alcohol_units_per_week: number | null;
  occupation: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Appointments
export interface Appointment extends BaseEntity, SoftDeletable {
  token_id: string | null;
  patient_id: string;
  doctor_id: string;
  clinic_id: string;
  slot_id: string | null;
  appointment_date: string;
  appointment_time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string | null;
  notes: string | null;
  payment_status: string;
  amount: number | null;
  currency: string;
  is_follow_up: boolean;
  follow_up_of: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface AppointmentWithRelations extends Appointment {
  patient?: Patient | null;
  doctor?: User | null;
  clinic?: Clinic | null;
}

export interface AppointmentCreate {
  patient_id: string;
  doctor_id: string;
  clinic_id: string;
  slot_id?: string;
  appointment_date: string;
  appointment_time: string;
  type?: AppointmentType;
  status?: AppointmentStatus;
  reason?: string;
  notes?: string;
  payment_status?: string;
  amount?: number;
}

// Appointment Slots
export interface AppointmentSlot {
  id: string;
  doctor_id: string;
  clinic_id: string;
  slot_date: string;
  slot_time: string;
  is_available: boolean;
  max_bookings: number;
  current_bookings: number;
  created_at: string;
  updated_at: string;
}

// Vitals
export interface Vitals extends BaseEntity {
  patient_id: string;
  consultation_id: string | null;
  recorded_at: string;
  recorded_by: string | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  heart_rate: number | null;
  pulse: number | null;
  temperature: number | null;
  weight: number | null;
  height: number | null;
  bmi: number | null;
  oxygen_saturation: number | null;
  blood_sugar: number | null;
  respiratory_rate: number | null;
  notes: string | null;
}

export interface VitalsCreate {
  patient_id?: string;
  consultation_id?: string;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  pulse?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  oxygen_saturation?: number;
  blood_sugar?: number;
  respiratory_rate?: number;
  notes?: string;
  recorded_by?: string;
  recorded_at?: string;
}

// Kidney Parameters
export interface KidneyParameter extends BaseEntity {
  patient_id: string;
  consultation_id: string | null;
  recorded_at: string;
  recorded_by: string | null;
  creatinine: number | null;
  blood_urea: number | null;
  gfr: number | null;
  potassium: number | null;
  sodium: number | null;
  calcium: number | null;
  phosphorus: number | null;
  hemoglobin: number | null;
  albumin: number | null;
  proteinuria: string | null;
  uric_acid: number | null;
  pth: number | null;
  vitamin_d: number | null;
  bicarbonate: number | null;
  cholesterol_total: number | null;
  notes: string | null;
}

export interface KidneyParameterCreate {
  patient_id?: string;
  consultation_id?: string;
  creatinine?: number;
  blood_urea?: number;
  gfr?: number;
  potassium?: number;
  sodium?: number;
  calcium?: number;
  phosphorus?: number;
  hemoglobin?: number;
  albumin?: number;
  proteinuria?: string;
  uric_acid?: number;
  pth?: number;
  vitamin_d?: number;
  bicarbonate?: number;
  cholesterol_total?: number;
  notes?: string;
  recorded_by?: string;
  recorded_at?: string;
}

// Consultations
export interface Consultation extends BaseEntity, SoftDeletable {
  patient_id: string;
  doctor_id: string;
  clinic_id: string;
  appointment_id: string | null;
  consultation_date: string;
  status: ConsultationStatus;
  chief_complaint: string | null;
  hpi: string | null;
  examination: string | null;
  notes: string | null;
  follow_up_date: string | null;
  follow_up_instructions: string | null;
  token_id: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface ConsultationWithRelations extends Consultation {
  patient?: Patient | null;
  doctor?: User | null;
  clinic?: Clinic | null;
  diagnoses?: Diagnosis[];
  vitals?: Vitals | null;
  kidney_parameters?: KidneyParameter | null;
  prescriptions?: Prescription[];
  investigation_orders?: InvestigationOrder[];
}

// Diagnoses
export interface Diagnosis {
  id: string;
  consultation_id: string;
  icd_code: string | null;
  snomed_code: string | null;
  name: string;
  is_primary: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DiagnosisCreate {
  icd_code?: string;
  snomed_code?: string;
  name: string;
  is_primary?: boolean;
  notes?: string;
}

// Prescriptions
export interface Prescription extends BaseEntity, SoftDeletable {
  prescription_number: string;
  patient_id: string;
  doctor_id: string;
  clinic_id: string;
  consultation_id: string | null;
  prescription_date: string;
  status: PrescriptionStatus;
  diagnosis: string | null;
  advice: string | null;
  notes: string | null;
  follow_up_date: string | null;
  is_template: boolean;
  template_name: string | null;
  template_category: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface PrescriptionWithRelations extends Prescription {
  patient?: Patient | null;
  doctor?: User | null;
  clinic?: Clinic | null;
  medicines?: PrescriptionMedicine[];
  investigations?: PrescriptionInvestigation[];
}

// Prescription Medicines
export interface PrescriptionMedicine {
  id: string;
  prescription_id: string;
  medicine_name: string;
  generic_name: string | null;
  strength: string | null;
  dosage: string | null;
  dosage_pattern: string | null;
  frequency: string | null;
  when_to_take: string | null;
  duration: string | null;
  route: string;
  instructions: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PrescriptionMedicineCreate {
  medicine_name: string;
  generic_name?: string;
  strength?: string;
  dosage?: string;
  dosage_pattern?: string;
  frequency?: string;
  when_to_take?: string;
  duration?: string;
  route?: string;
  instructions?: string;
  sort_order?: number;
}

// Prescription Investigations
export interface PrescriptionInvestigation {
  id: string;
  prescription_id: string;
  test_name: string;
  category: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
}

// Investigation Orders
export interface InvestigationOrder extends BaseEntity, SoftDeletable {
  patient_id: string;
  doctor_id: string;
  clinic_id: string;
  consultation_id: string | null;
  order_date: string;
  status: InvestigationStatus;
  notes: string | null;
  created_by: string | null;
}

export interface InvestigationOrderWithRelations extends InvestigationOrder {
  items?: InvestigationItem[];
}

// Investigation Items
export interface InvestigationItem {
  id: string;
  order_id: string;
  test_name: string;
  category: string | null;
  result_value: string | null;
  unit: string | null;
  normal_range: string | null;
  is_abnormal: boolean;
  status: InvestigationStatus;
  result_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Dialysis Sessions
export interface DialysisSession extends BaseEntity, SoftDeletable {
  patient_id: string;
  doctor_id: string | null;
  clinic_id: string | null;
  session_date: string;
  session_type: SessionType;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  pre_weight: number | null;
  post_weight: number | null;
  ultrafiltration_volume: number | null;
  blood_flow_rate: number | null;
  dialysate_flow_rate: number | null;
  heparin_dose: string | null;
  dialyzer: string | null;
  vascular_access: string | null;
  complications: string | null;
  notes: string | null;
  created_by: string | null;
}

// Kidney Transplant History
export interface KidneyTransplant extends BaseEntity, SoftDeletable {
  patient_id: string;
  transplant_date: string;
  transplant_type: TransplantType | null;
  donor_name: string | null;
  donor_relation: string | null;
  donor_blood_group: BloodGroup | null;
  hospital: string | null;
  surgeon: string | null;
  immunosuppression: string | null;
  current_creatinine: number | null;
  graft_function: string | null;
  rejection_episodes: number;
  complications: string | null;
  notes: string | null;
  created_by: string | null;
}

// Uploaded Reports
export interface UploadedReport extends BaseEntity, SoftDeletable {
  patient_id: string;
  uploaded_by: string | null;
  consultation_id: string | null;
  title: string;
  category: string | null;
  file_url: string;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  report_date: string | null;
  notes: string | null;
}

// Letterheads
export interface Letterhead {
  id: string;
  clinic_id: string;
  type: 'header' | 'footer';
  image_data: string;
  content_type: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface LetterheadCreate {
  clinic_id: string;
  type: 'header' | 'footer';
  image_data: string;
  content_type?: string;
  is_active?: boolean;
}

// Invoices
export interface Invoice extends BaseEntity, SoftDeletable {
  invoice_number: string;
  patient_id: string;
  doctor_id: string | null;
  clinic_id: string;
  consultation_id: string | null;
  invoice_date: string;
  due_date: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  total_amount: number;
  paid_amount: number;
  status: InvoiceStatus;
  notes: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface InvoiceWithRelations extends Invoice {
  patient?: Patient | null;
  doctor?: User | null;
  clinic?: Clinic | null;
  items?: InvoiceItem[];
  payments?: Payment[];
}

// Invoice Items
export interface InvoiceItem {
  id: string;
  invoice_id: string;
  item_name: string;
  description: string | null;
  hsn_code: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItemCreate {
  item_name: string;
  description?: string;
  hsn_code?: string;
  quantity?: number;
  unit_price: number;
  sort_order?: number;
}

// Payments
export interface Payment extends BaseEntity, SoftDeletable {
  invoice_id: string;
  patient_id: string;
  amount: number;
  payment_method: PaymentMethod;
  reference_number: string | null;
  transaction_id: string | null;
  status: PaymentStatus;
  refund_amount: number;
  refund_reason: string | null;
  refunded_at: string | null;
  payment_date: string;
  notes: string | null;
  created_by: string | null;
}

export interface PaymentCreate {
  invoice_id: string;
  patient_id: string;
  amount: number;
  payment_method: PaymentMethod;
  reference_number?: string;
  notes?: string;
  status?: PaymentStatus;
  createdBy?: string;
}

// Settings
export interface Setting {
  id: string;
  key: string;
  value: Record<string, unknown>;
  clinic_id: string | null;
  category: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export interface SettingCreate {
  key: string;
  value: Record<string, unknown>;
  clinic_id?: string;
  category?: string;
  description?: string;
}

// Notifications
export interface Notification {
  id: string;
  user_id: string | null;
  patient_id: string | null;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  data: Record<string, unknown> | null;
  created_at: string;
}

// WhatsApp Logs
export interface WhatsAppLog {
  id: string;
  patient_id: string | null;
  appointment_id: string | null;
  phone_number: string;
  direction: MessageDirection;
  message_type: string;
  message_content: string | null;
  media_url: string | null;
  status: string;
  external_id: string | null;
  error_message: string | null;
  sent_at: string;
  created_at: string;
}

// SMS Logs
export interface SMSLog {
  id: string;
  patient_id: string | null;
  phone_number: string;
  direction: MessageDirection;
  message_content: string | null;
  status: string;
  external_id: string | null;
  error_message: string | null;
  sent_at: string;
  created_at: string;
}

// Email Logs
export interface EmailLog {
  id: string;
  patient_id: string | null;
  email_address: string;
  direction: MessageDirection;
  subject: string | null;
  body: string | null;
  attachments: Record<string, unknown>[] | null;
  status: string;
  external_id: string | null;
  error_message: string | null;
  sent_at: string;
  created_at: string;
}

// Audit Logs
export interface AuditLog {
  id: string;
  user_id: string | null;
  action: AuditAction;
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// Activity Logs
export interface ActivityLog {
  id: string;
  user_id: string | null;
  patient_id: string | null;
  action: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// OTP Records
export interface OTPRecord {
  id: string;
  phone: string;
  email: string | null;
  otp: string;
  purpose: string;
  verified: boolean;
  attempts: number;
  expires_at: string;
  created_at: string;
}

// Patient Bookings
export interface PatientBooking extends BaseEntity, SoftDeletable {
  booking_number: string;
  patient_id: string | null;
  patient_name: string;
  patient_phone: string;
  patient_email: string | null;
  clinic_id: string;
  doctor_id: string | null;
  appointment_date: string;
  appointment_time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string | null;
  notes: string | null;
  fee: number;
  paid: boolean;
  country_code: string;
  timezone: string | null;
  whatsapp_number: string | null;
  preferred_language: string;
  is_international: boolean;
  reports: string[] | null;
}

// ============================================================
// DASHBOARD AGGREGATION TYPES
// ============================================================

export interface DashboardStats {
  totalPatients: number;
  newPatientsToday: number;
  todayAppointments: number;
  completedToday: number;
  pendingAppointments: number;
  totalConsultationsMonth: number;
  totalRevenue: number;
  pendingDues: number;
  recentPatients: PatientSearchResult[];
  appointmentsByStatus: Record<string, number>;
}

export interface DashboardAppointment {
  id: string;
  appointment_time: string;
  appointment_type: string;
  status: string;
  reason: string | null;
  patient?: Patient | null;
  doctor?: User | null;
  clinic?: Clinic | null;
}

export interface DashboardConsultation {
  id: string;
  consultation_date: string;
  status: string;
  chief_complaint: string | null;
  patient?: Patient | null;
  doctor?: User | null;
  diagnoses?: { diagnosis_name: string; is_primary: boolean }[];
}

export interface DashboardRevenue {
  date: string;
  total: number;
  byMethod: Record<string, number>;
}

export interface RecentActivity {
  id: string;
  user_id: string | null;
  patient_id: string | null;
  action: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface PatientSearchResult {
  id: string;
  uhid: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  date_of_birth: string | null;
  gender: Gender | null;
  total_visits: number;
  last_visit_date: string | null;
}
