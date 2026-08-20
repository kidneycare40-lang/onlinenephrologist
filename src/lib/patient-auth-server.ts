/**
 * Server-side patient authentication library.
 * Handles OTP generation/verification, JWT sessions, patient account CRUD,
 * and appointment queries against the existing bookings table.
 */
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { createHash } from 'crypto';
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

  if (new Date(record.expires_at).getTime() < Date.now()) {
    return { success: false, error: 'This code has expired. Please request a new one.' };
  }

  if (record.attempts >= record.max_attempts) {
    await db.from('patient_otp').update({ verified: true }).eq('id', record.id);
    return { success: false, error: 'Too many failed attempts. Please request a new code.' };
  }

  await db
    .from('patient_otp')
    .update({ attempts: record.attempts + 1 })
    .eq('id', record.id);

  if (record.otp_hash !== hashOtp(otp)) {
    return { success: false, error: `Invalid code. ${record.max_attempts - record.attempts - 1} attempts remaining.` };
  }

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

export async function findPatientByEmail(email: string): Promise<PatientAccount | null> {
  const db = getDb();
  const { data } = await db
    .from('patient_accounts')
    .select('*')
    .ilike('email', email.toLowerCase().trim())
    .maybeSingle();
  return data;
}

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

export async function touchPatientLogin(patientId: string): Promise<void> {
  const db = getDb();
  await db
    .from('patient_accounts')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', patientId);
}

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

// ── Appointments (via bookings table) ────────────────────────

export interface BookingRecord {
  id: string;
  booking_id: string;
  patient_account_id: string | null;
  booked_by_patient_account_id: string | null;
  relationship: string;
  actual_patient_id: string | null;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  consultation_type: string;
  clinic_id: string | null;
  booking_date: string | null;
  booking_time: string | null;
  reason: string | null;
  complaints: string | null;
  status: string;
  payment_status: string;
  payment_id: string | null;
  razorpay_order_id: string | null;
  consultation_fee: number | null;
  consultation_fee_currency: string;
  doctor_name: string | null;
  report_files: any[];
  created_at: string;
  updated_at: string;
}

/** Get all bookings for a patient — both self-bookings AND family bookings made by this account. */
export async function getPatientBookings(
  patientId: string,
  filters?: { status?: string; type?: string }
): Promise<BookingRecord[]> {
  const db = getDb();

  // Fetch bookings where patient is the account holder (self) OR the booker (family)
  const { data, error } = await db
    .from('bookings')
    .select('*')
    .or(`patient_account_id.eq.${patientId},booked_by_patient_account_id.eq.${patientId}`)
    .order('booking_date', { ascending: false })
    .order('booking_time', { ascending: false });

  if (error) {
    console.error('getPatientBookings error:', error);
    return [];
  }

  let results = data || [];

  if (filters?.status && filters.status !== 'all') {
    results = results.filter((b: any) => b.status === filters.status);
  }
  if (filters?.type && filters.type !== 'all') {
    results = results.filter((b: any) => b.consultation_type === filters.type);
  }

  return results;
}

/**
 * Check if a patient already has an active booking for the same
 * clinic + date + time (duplicate prevention).
 */
export async function checkDuplicateBooking(
  patientId: string,
  clinicId: string,
  date: string,
  time: string
): Promise<BookingRecord | null> {
  const db = getDb();
  const { data } = await db
    .from('bookings')
    .select('*')
    .eq('patient_account_id', patientId)
    .eq('clinic_id', clinicId)
    .eq('booking_date', date)
    .eq('booking_time', time)
    .in('status', ['pending', 'confirmed', 'booked'])
    .maybeSingle();
  return data;
}

/** Update a booking to link it to a patient account. */
export async function linkBookingToPatient(
  bookingId: string,
  patientAccountId: string
): Promise<boolean> {
  const db = getDb();
  const { error } = await db
    .from('bookings')
    .update({ patient_account_id: patientAccountId })
    .eq('booking_id', bookingId);
  return !error;
}

/** Update booking status. */
export async function updateBookingStatus(
  bookingId: string,
  status: string,
  paymentStatus?: string
): Promise<boolean> {
  const db = getDb();
  const update: any = { status, updated_at: new Date().toISOString() };
  if (paymentStatus) update.payment_status = paymentStatus;
  const { error } = await db
    .from('bookings')
    .update(update)
    .eq('booking_id', bookingId);
  return !error;
}

/** Cancel a booking (soft delete). Allows cancellation by the patient OR the booker. */
export async function cancelBooking(
  bookingId: string,
  patientId: string
): Promise<boolean> {
  const db = getDb();
  const { error } = await db
    .from('bookings')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('booking_id', bookingId)
    .or(`patient_account_id.eq.${patientId},booked_by_patient_account_id.eq.${patientId}`)
    .in('status', ['pending', 'confirmed', 'booked']);
  return !error;
}
