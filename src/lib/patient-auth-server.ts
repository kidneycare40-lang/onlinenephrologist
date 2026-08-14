/**
 * Server-side patient authentication library.
 * Handles OTP generation/verification, JWT sessions, patient account CRUD.
 * All functions use the service_role Supabase client (bypasses RLS).
 */
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { createHash, randomBytes } from 'crypto';
import { getDb } from '@/lib/db/client';

// ── JWT ──────────────────────────────────────────────────────

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');
  return new TextEncoder().encode(secret);
}

const ACCESS_EXPIRY = '7d';
const COOKIE_NAME = 'patient_token';

export interface PatientTokenPayload extends JWTPayload {
  patientId: string;
  email: string;
  name: string;
}

export async function signPatientToken(patientId: string, email: string, name: string): Promise<string> {
  return new SignJWT({ patientId, email, name } as unknown as JWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_EXPIRY)
    .setSubject(patientId)
    .sign(getJwtSecret());
}

export async function verifyPatientToken(token: string): Promise<PatientTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as PatientTokenPayload;
  } catch {
    return null;
  }
}

export async function setPatientCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export async function clearPatientCookie() {
  const store = await cookies();
  store.set(COOKIE_NAME, '', { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 0, path: '/' });
}

export async function getPatientFromCookie(): Promise<PatientTokenPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyPatientToken(token);
}

// ── OTP ──────────────────────────────────────────────────────

function hashOtp(otp: string): string {
  return createHash('sha256').update(otp).digest('hex');
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** Generate and store an OTP. Returns the plain OTP (to be sent via email). */
export async function createOtp(email: string): Promise<{ otp: string; error?: string }> {
  const db = getDb();
  const normalised = email.toLowerCase().trim();

  // Rate limit: max 1 new OTP per 60 seconds
  const { data: recent } = await db
    .from('patient_otp')
    .select('created_at')
    .eq('email', normalised)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (recent) {
    const elapsed = Date.now() - new Date(recent.created_at).getTime();
    if (elapsed < 60_000) {
      return { otp: '', error: 'Please wait a moment before requesting a new code.' };
    }
  }

  // Invalidate any previous unused OTPs for this email
  await db
    .from('patient_otp')
    .update({ verified: true })
    .eq('email', normalised)
    .eq('verified', false);

  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error } = await db.from('patient_otp').insert({
    email: normalised,
    otp_hash: otpHash,
    expires_at: expiresAt,
    attempts: 0,
    max_attempts: 5,
    verified: false,
  });

  if (error) {
    console.error('Failed to create OTP:', error);
    return { otp: '', error: 'Failed to send verification code. Please try again.' };
  }

  return { otp };
}

/** Verify an OTP. Returns the patient email on success. */
export async function verifyOtp(
  email: string,
  otp: string
): Promise<{ success: boolean; email?: string; error?: string }> {
  const db = getDb();
  const normalised = email.toLowerCase().trim();

  const { data: record } = await db
    .from('patient_otp')
    .select('*')
    .eq('email', normalised)
    .eq('verified', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!record) {
    return { success: false, error: 'No verification code found. Please request a new one.' };
  }

  // Check expiry
  if (new Date(record.expires_at).getTime() < Date.now()) {
    return { success: false, error: 'This code has expired. Please request a new one.' };
  }

  // Check attempts
  if (record.attempts >= record.max_attempts) {
    await db.from('patient_otp').update({ verified: true }).eq('id', record.id);
    return { success: false, error: 'Too many failed attempts. Please request a new code.' };
  }

  // Increment attempts
  await db
    .from('patient_otp')
    .update({ attempts: record.attempts + 1 })
    .eq('id', record.id);

  // Verify hash
  if (record.otp_hash !== hashOtp(otp)) {
    return { success: false, error: `Invalid code. ${record.max_attempts - record.attempts - 1} attempts remaining.` };
  }

  // Mark as verified
  await db.from('patient_otp').update({ verified: true }).eq('id', record.id);

  return { success: true, email: normalised };
}

// ── Patient Account ──────────────────────────────────────────

export interface PatientAccount {
  id: string;
  email: string;
  email_verified: boolean;
  first_name: string;
  last_name: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  timezone: string | null;
  is_international: boolean;
  country_code: string | null;
  passport_number: string | null;
  preferred_language: string;
  interpreter_required: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

/** Find a patient account by email (case-insensitive). */
export async function findPatientByEmail(email: string): Promise<PatientAccount | null> {
  const db = getDb();
  const { data } = await db
    .from('patient_accounts')
    .select('*')
    .ilike('email', email.toLowerCase().trim())
    .maybeSingle();
  return data;
}

/** Create a new patient account. */
export async function createPatientAccount(data: {
  email: string;
  first_name: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  country?: string;
  timezone?: string;
  is_international?: boolean;
  country_code?: string;
}): Promise<PatientAccount> {
  const db = getDb();
  const normalised = data.email.toLowerCase().trim();

  const { data: patient, error } = await db
    .from('patient_accounts')
    .insert({
      email: normalised,
      email_verified: true,
      first_name: data.first_name,
      last_name: data.last_name || '',
      phone: data.phone || null,
      date_of_birth: data.date_of_birth || null,
      gender: data.gender || null,
      country: data.country || null,
      timezone: data.timezone || null,
      is_international: data.is_international || false,
      country_code: data.country_code || null,
      last_login_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create patient: ${error.message}`);
  return patient;
}

/** Update last login time for an existing patient. */
export async function touchPatientLogin(patientId: string): Promise<void> {
  const db = getDb();
  await db
    .from('patient_accounts')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', patientId);
}

/** Update patient profile. */
export async function updatePatientProfile(
  patientId: string,
  data: Partial<PatientAccount>
): Promise<PatientAccount | null> {
  const db = getDb();
  const { data: patient } = await db
    .from('patient_accounts')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', patientId)
    .select()
    .single();
  return patient;
}

// ── Appointments ─────────────────────────────────────────────

export interface PatientAppointment {
  id: string;
  appointment_number: string;
  patient_id: string;
  doctor_name: string;
  clinic_id: string;
  clinic_name: string | null;
  appointment_type: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  booking_source: string;
  reason: string | null;
  complaints: string | null;
  reports: any[];
  consultation_fee: number | null;
  currency: string;
  payment_status: string;
  payment_id: string | null;
  created_at: string;
  updated_at: string;
}

function generateAppointmentNumber(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `APT-${y}${m}-${rand}`;
}

/**
 * Check if a patient already has an active appointment for the same
 * clinic + date + time (duplicate prevention).
 */
export async function checkDuplicateAppointment(
  patientId: string,
  clinicId: string,
  date: string,
  time: string
): Promise<PatientAppointment | null> {
  const db = getDb();
  const { data } = await db
    .from('patient_appointments')
    .select('*')
    .eq('patient_id', patientId)
    .eq('clinic_id', clinicId)
    .eq('appointment_date', date)
    .eq('appointment_time', time)
    .in('status', ['pending', 'confirmed', 'booked'])
    .maybeSingle();
  return data;
}

/** Create a new appointment record. Returns existing if duplicate found. */
export async function createAppointment(data: {
  patient_id: string;
  clinic_id: string;
  clinic_name?: string;
  appointment_type: string;
  appointment_date: string;
  appointment_time: string;
  reason?: string;
  complaints?: string;
  reports?: any[];
  consultation_fee?: number;
  currency?: string;
  payment_status?: string;
  payment_id?: string;
}): Promise<{ appointment: PatientAppointment; duplicate?: boolean }> {
  // First check for duplicate
  const existing = await checkDuplicateAppointment(
    data.patient_id,
    data.clinic_id,
    data.appointment_date,
    data.appointment_time
  );

  if (existing) {
    return { appointment: existing, duplicate: true };
  }

  const db = getDb();
  const appointmentNumber = generateAppointmentNumber();

  const { data: appointment, error } = await db
    .from('patient_appointments')
    .insert({
      appointment_number: appointmentNumber,
      patient_id: data.patient_id,
      clinic_id: data.clinic_id,
      clinic_name: data.clinic_name || null,
      appointment_type: data.appointment_type,
      appointment_date: data.appointment_date,
      appointment_time: data.appointment_time,
      status: 'pending',
      booking_source: 'website',
      reason: data.reason || null,
      complaints: data.complaints || null,
      reports: data.reports || [],
      consultation_fee: data.consultation_fee || null,
      currency: data.currency || 'INR',
      payment_status: data.payment_status || 'unpaid',
      payment_id: data.payment_id || null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create appointment: ${error.message}`);
  return { appointment };
}

/** Get all appointments for a patient, newest first. */
export async function getPatientAppointments(
  patientId: string,
  filters?: { status?: string; type?: string }
): Promise<PatientAppointment[]> {
  const db = getDb();
  let query = db
    .from('patient_appointments')
    .select('*')
    .eq('patient_id', patientId)
    .order('appointment_date', { ascending: false })
    .order('appointment_time', { ascending: false });

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters?.type && filters.type !== 'all') {
    query = query.eq('appointment_type', filters.type);
  }

  const { data } = await query;
  return data || [];
}

/** Cancel an appointment. */
export async function cancelAppointment(
  appointmentId: string,
  patientId: string
): Promise<boolean> {
  const db = getDb();
  const { error } = await db
    .from('patient_appointments')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', appointmentId)
    .eq('patient_id', patientId)
    .in('status', ['pending', 'confirmed']);
  return !error;
}
