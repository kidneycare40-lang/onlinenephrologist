export type AppointmentStatus = 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type AppointmentType = 'WALK_IN' | 'ONLINE' | 'FOLLOW_UP';

export interface EMRAppointment {
  id: string;
  tokenId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  payment: 'FREE' | 'PAID';
  amount?: number;
  notes?: string;
  clinicId: string;
}

export interface EMRPatient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  uhid: string;
  clinicId: string;
  source?: 'website' | 'emr' | 'whatsapp' | 'referral' | 'other';
  referralDoctor?: string;
  abhaNumber?: string;
  aadhaar?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  allergies: string[];
  medicalHistory?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  familyMembers: FamilyMember[];
  isActive: boolean;
  isChronic: boolean;
  createdAt: string;
  lastVisit?: string;
  totalVisits: number;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export interface Vitals {
  bloodPressure?: string;
  heartRate?: string;
  pulse?: string;
  temperature?: string;
  weight?: string;
  height?: string;
  bmi?: string;
  spo2?: string;
  bloodSugar?: string;
  creatinine?: string;
  egfr?: string;
}

export interface Diagnosis {
  id: string;
  icdCode: string;
  name: string;
  isPrimary: boolean;
  notes?: string;
  snomedCode?: string;
  date?: string;
  duration?: string;
}

export interface PrescriptionItem {
  id: string;
  name: string;
  genericName?: string;
  strength?: string;
  dosage: string;
  when?: string;
  frequency: string;
  duration: string;
  route: string;
  instructions?: string;
}

export interface Investigation {
  id: string;
  testName: string;
  category?: string;
  result?: string;
  unit?: string;
  normalRange?: string;
  isAbnormal?: boolean;
  status?: string;
  date?: string;
  notes?: string;
}

export interface EMRConsultation {
  id: string;
  patientId: string;
  clinicId: string;
  date: string;
  doctorName: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'DRAFT';
  chiefComplaint: string;
  hpi: string;
  examination: string;
  vitals: Vitals;
  diagnoses: Diagnosis[];
  prescriptions: PrescriptionItem[];
  investigations: Investigation[];
  advice: string;
  notes: string;
  followUpDate?: string;
  tokenId?: string;
  updatedAt?: string;
}

export interface EMRPrescription {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  consultationId: string;
  date: string;
  doctorName: string;
  doctorQualification: string;
  diagnosis: string;
  medications: Medication[];
  investigations?: string[];
  instructions?: string;
  followUpDate?: string;
  status: 'Active' | 'Completed' | 'Cancelled';
  isTemplate?: boolean;
  templateName?: string;
  clinicId: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface PrescriptionTemplate {
  id: string;
  name: string;
  description: string;
  diagnosis: string;
  medications: Medication[];
  investigations?: string[];
  advice?: string;
  testsPrescribed?: string[];
  isCustom?: boolean;
}

export interface AdviceTemplate {
  id: string;
  name: string;
  advice: string;
  isCustom?: boolean;
}

export interface TestPanelTemplate {
  id: string;
  name: string;
  tests: string[];
  isCustom?: boolean;
}

export interface EMRLabOrder {
  id: string;
  patientId: string;
  date: string;
  doctorName: string;
  testName: string;
  status: 'Pending' | 'Completed' | 'In Progress';
  results?: LabResult[];
  clinicId: string;
}

export interface LabResult {
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  isAbnormal: boolean;
}

export interface EMRTimelineEvent {
  id: string;
  patientId: string;
  date: string;
  type: 'consultation' | 'prescription' | 'lab_order' | 'report' | 'appointment' | 'note';
  title: string;
  description: string;
  clinicId: string;
}

export type TimelineEventType =
  | 'opd_visit'
  | 'prescription'
  | 'lab_result'
  | 'admission'
  | 'dialysis'
  | 'discharge'
  | 'follow_up'
  | 'radiology'
  | 'procedure';

export interface TimelineEvent {
  id: string;
  patientId: string;
  date: string;
  time?: string;
  type: TimelineEventType;
  title: string;
  description: string;
  doctorName: string;
  details?: string;
  relatedLinks?: { label: string; href: string }[];
  medications?: Medication[];
  clinicId: string;
}

export interface PatientSummary {
  id: string;
  name: string;
  uhid: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  totalVisits: number;
  firstVisit: string;
  lastVisit: string;
  currentMedications: string[];
  activeConditions: string[];
}

export type InvoiceStatus = 'PAID' | 'PENDING' | 'PARTIAL' | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'CHEQUE' | 'ONLINE';

export interface InvoiceItem {
  id: string;
  description: string;
  hsnCode?: string;
  qty: number;
  rate: number;
  amount: number;
  gstRate: number;
  gstAmount: number;
  total: number;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  notes?: string;
}

export interface EMRInvoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: 'Male' | 'Female' | 'Other';
  patientPhone?: string;
  patientAddress?: string;
  doctorName: string;
  clinicId: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  gstRate: number;
  gstAmount: number;
  totalTax: number;
  grandTotal: number;
  paidAmount: number;
  balance: number;
  status: InvoiceStatus;
  payments: Payment[];
  notes?: string;
  terms?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  items: { description: string; rate: number; gstRate: number }[];
  isDefault?: boolean;
}
