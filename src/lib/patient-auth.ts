const PATIENTS_KEY = 'kcc_patients';
const CURRENT_PATIENT_KEY = 'kcc_current_patient';
const OTP_KEY = 'kcc_otp';

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  isInternational: boolean;
  countryCode?: string;
  timezone?: string;
  passportNumber?: string;
  whatsappNumber?: string;
  preferredLanguage?: string;
  interpreterRequired?: boolean;
  createdAt: string;
  lastLogin: string;
}

export interface OTPRecord {
  phone: string;
  otp: string;
  expiresAt: number;
  verified: boolean;
}

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP (simulated — in production, use SMS API)
export function sendOTP(phone: string): string {
  const otp = generateOTP();
  const record: OTPRecord = {
    phone,
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    verified: false,
  };
  localStorage.setItem(OTP_KEY, JSON.stringify(record));
  // In production, send via SMS API here
  console.log(`OTP for ${phone}: ${otp}`);
  return otp;
}

// Verify OTP
export function verifyOTP(phone: string, otp: string): boolean {
  const stored = localStorage.getItem(OTP_KEY);
  if (!stored) return false;
  const record: OTPRecord = JSON.parse(stored);
  if (record.phone !== phone) return false;
  if (Date.now() > record.expiresAt) return false;
  if (record.otp !== otp) return false;
  record.verified = true;
  localStorage.setItem(OTP_KEY, JSON.stringify(record));
  return true;
}

// Get all patients
function getPatients(): Patient[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(PATIENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save patients
function savePatients(patients: Patient[]) {
  localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
}

// Find patient by phone
export function findPatientByPhone(phone: string): Patient | undefined {
  return getPatients().find((p) => p.phone === phone);
}

// Register new patient
export function registerPatient(data: Omit<Patient, 'id' | 'createdAt' | 'lastLogin'>): Patient {
  const patients = getPatients();
  const existing = patients.find((p) => p.phone === data.phone);
  if (existing) throw new Error('Patient already registered with this phone number');

  const patient: Patient = {
    ...data,
    id: `pt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };
  patients.push(patient);
  savePatients(patients);
  setCurrentPatient(patient);
  return patient;
}

// Update patient
export function updatePatient(id: string, data: Partial<Patient>): Patient | null {
  const patients = getPatients();
  const idx = patients.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  patients[idx] = { ...patients[idx], ...data };
  savePatients(patients);
  if (getCurrentPatient()?.id === id) {
    setCurrentPatient(patients[idx]);
  }
  return patients[idx];
}

// Login patient (after OTP verification)
export function loginPatient(phone: string): Patient | null {
  const patient = findPatientByPhone(phone);
  if (!patient) return null;
  patient.lastLogin = new Date().toISOString();
  const patients = getPatients();
  const idx = patients.findIndex((p) => p.phone === phone);
  if (idx !== -1) patients[idx] = patient;
  savePatients(patients);
  setCurrentPatient(patient);
  return patient;
}

// Current patient session
export function setCurrentPatient(patient: Patient | null) {
  if (patient) {
    localStorage.setItem(CURRENT_PATIENT_KEY, JSON.stringify(patient));
  } else {
    localStorage.removeItem(CURRENT_PATIENT_KEY);
  }
}

export function getCurrentPatient(): Patient | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(CURRENT_PATIENT_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function logoutPatient() {
  localStorage.removeItem(CURRENT_PATIENT_KEY);
}
