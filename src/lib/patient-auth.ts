const PATIENTS_KEY = 'kcc_patients';
const CURRENT_PATIENT_KEY = 'kcc_current_patient';
const OTP_KEY = 'kcc_email_otp';

export interface Patient {
  id: string;
  name: string;
  phone?: string;
  email: string;
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
  email: string;
  otp: string;
  expiresAt: number;
  verified: boolean;
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function sendOTP(email: string): string {
  const otp = generateOTP();
  const record: OTPRecord = {
    email,
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
    verified: false,
  };
  localStorage.setItem(OTP_KEY, JSON.stringify(record));
  console.log(`OTP for ${email}: ${otp}`);
  return otp;
}

export function verifyOTP(email: string, otp: string): boolean {
  const stored = localStorage.getItem(OTP_KEY);
  if (!stored) return false;
  const record: OTPRecord = JSON.parse(stored);
  if (record.email.toLowerCase() !== email.toLowerCase()) return false;
  if (Date.now() > record.expiresAt) return false;
  if (record.otp !== otp) return false;
  record.verified = true;
  localStorage.setItem(OTP_KEY, JSON.stringify(record));
  return true;
}

function getPatients(): Patient[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(PATIENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function savePatients(patients: Patient[]) {
  localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
}

export function findPatientByEmail(email: string): Patient | undefined {
  return getPatients().find((p) => p.email.toLowerCase() === email.toLowerCase());
}

export function registerPatient(data: Omit<Patient, 'id' | 'createdAt' | 'lastLogin'>): Patient {
  const patients = getPatients();
  const existing = patients.find((p) => p.email.toLowerCase() === data.email.toLowerCase());
  if (existing) throw new Error('Patient already registered with this email');

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

export function loginPatient(email: string): Patient | null {
  const patient = findPatientByEmail(email);
  if (!patient) return null;
  patient.lastLogin = new Date().toISOString();
  const patients = getPatients();
  const idx = patients.findIndex((p) => p.email.toLowerCase() === email.toLowerCase());
  if (idx !== -1) patients[idx] = patient;
  savePatients(patients);
  setCurrentPatient(patient);
  return patient;
}

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
