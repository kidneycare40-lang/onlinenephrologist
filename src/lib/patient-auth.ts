import { getItem, setItem, removeItem } from '@/lib/client-storage';

const PATIENTS_KEY = 'patient-accounts';
const CURRENT_PATIENT_KEY = 'current-patient';
const OTP_KEY = 'patient-otp-records';

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

export async function sendOTP(email: string): Promise<string> {
  const otp = generateOTP();
  const record: OTPRecord = {
    email,
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
    verified: false,
  };
  await setItem(OTP_KEY, record);
  console.log(`OTP for ${email}: ${otp}`);
  return otp;
}

export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  const record: OTPRecord | null = await getItem(OTP_KEY);
  if (!record) return false;
  if (record.email.toLowerCase() !== email.toLowerCase()) return false;
  if (Date.now() > record.expiresAt) return false;
  if (record.otp !== otp) return false;
  record.verified = true;
  await setItem(OTP_KEY, record);
  return true;
}

async function getPatients(): Promise<Patient[]> {
  try {
    const stored = await getItem(PATIENTS_KEY);
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

async function savePatients(patients: Patient[]): Promise<void> {
  await setItem(PATIENTS_KEY, patients);
}

export async function findPatientByEmail(email: string): Promise<Patient | undefined> {
  const patients = await getPatients();
  return patients.find((p) => p.email.toLowerCase() === email.toLowerCase());
}

export async function registerPatient(data: Omit<Patient, 'id' | 'createdAt' | 'lastLogin'>): Promise<Patient> {
  const patients = await getPatients();
  const existing = patients.find((p) => p.email.toLowerCase() === data.email.toLowerCase());
  if (existing) throw new Error('Patient already registered with this email');

  const patient: Patient = {
    ...data,
    id: `pt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };
  patients.push(patient);
  await savePatients(patients);
  await setCurrentPatient(patient);
  return patient;
}

export async function updatePatient(id: string, data: Partial<Patient>): Promise<Patient | null> {
  const patients = await getPatients();
  const idx = patients.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  patients[idx] = { ...patients[idx], ...data };
  await savePatients(patients);
  const current = await getCurrentPatient();
  if (current?.id === id) {
    await setCurrentPatient(patients[idx]);
  }
  return patients[idx];
}

export async function loginPatient(email: string): Promise<Patient | null> {
  const patient = await findPatientByEmail(email);
  if (!patient) return null;
  patient.lastLogin = new Date().toISOString();
  const patients = await getPatients();
  const idx = patients.findIndex((p) => p.email.toLowerCase() === email.toLowerCase());
  if (idx !== -1) patients[idx] = patient;
  await savePatients(patients);
  await setCurrentPatient(patient);
  return patient;
}

export async function setCurrentPatient(patient: Patient | null): Promise<void> {
  if (patient) {
    await setItem(CURRENT_PATIENT_KEY, patient);
  } else {
    await removeItem(CURRENT_PATIENT_KEY);
  }
}

export async function getCurrentPatient(): Promise<Patient | null> {
  try {
    const stored = await getItem(CURRENT_PATIENT_KEY);
    return stored ?? null;
  } catch {
    return null;
  }
}

export async function logoutPatient(): Promise<void> {
  await removeItem(CURRENT_PATIENT_KEY);
}
