/**
 * Server-side patient portal data library.
 * Bridges patient_accounts (portal) ↔ patients (EMR) to fetch
 * prescriptions, billing, reports, consultations, and follow-up entitlements.
 *
 * All queries use the service_role key (bypasses RLS).
 * Authorization: patient must only see their own data.
 */
import { getDb } from '@/lib/db/client';
import { getPatientFromCookie, type PatientAccount } from '@/lib/patient-auth-server';

// ── Bridge ──────────────────────────────────────────────────

/** Get the EMR patient UUID for a given portal patient_account_id. */
export async function getEmrPatientId(patientAccountId: string): Promise<string | null> {
  const db = getDb();
  const { data } = await db
    .from('patient_emr_bridge')
    .select('emr_patient_id')
    .eq('patient_account_id', patientAccountId)
    .maybeSingle();
  return data?.emr_patient_id || null;
}

/** Ensure a bridge exists. Called after auto-invoice creates an EMR patient. */
export async function ensureEmrBridge(patientAccountId: string, emrPatientId: string): Promise<void> {
  const db = getDb();
  const { data: existing } = await db
    .from('patient_emr_bridge')
    .select('id')
    .eq('patient_account_id', patientAccountId)
    .maybeSingle();
  if (existing) return;
  await db.from('patient_emr_bridge').insert({
    patient_account_id: patientAccountId,
    emr_patient_id: emrPatientId,
  });
}

/** Find EMR patient by phone (used to create bridge from booking). */
export async function findEmrPatientByPhone(phone: string): Promise<string | null> {
  if (!phone) return null;
  const db = getDb();
  const clean = phone.replace(/\D/g, '').replace(/^91/, '');
  const { data } = await db.from('patients').select('id').eq('phone', clean).limit(1);
  if (data && data.length > 0) return data[0].id;
  const { data: data2 } = await db.from('patients').select('id').eq('phone', phone).limit(1);
  return data2 && data2.length > 0 ? data2[0].id : null;
}

/** Auto-create bridge from a booking's phone number after payment. */
export async function autoBridgeFromBooking(patientAccountId: string, phone: string): Promise<void> {
  const existing = await getEmrPatientId(patientAccountId);
  if (existing) return;
  const emrId = await findEmrPatientByPhone(phone);
  if (emrId) await ensureEmrBridge(patientAccountId, emrId);
}

// ── Prescriptions ───────────────────────────────────────────

export interface PortalPrescription {
  id: string;
  prescription_number: string;
  prescription_date: string;
  status: string;
  diagnosis: string | null;
  advice: string | null;
  notes: string | null;
  follow_up_date: string | null;
  doctor_name: string;
  clinic_name: string;
  medicines: {
    medicine_name: string;
    dosage: string | null;
    dosage_pattern: string | null;
    frequency: string | null;
    duration: string | null;
    instructions: string | null;
  }[];
  investigations: {
    test_name: string;
    category: string | null;
    notes: string | null;
  }[];
}

export async function getPatientPrescriptions(patientAccountId: string): Promise<PortalPrescription[]> {
  const emrId = await getEmrPatientId(patientAccountId);
  if (!emrId) return [];

  const db = getDb();
  const { data, error } = await db
    .from('prescriptions')
    .select(`
      id, prescription_number, prescription_date, status, diagnosis, advice, notes, follow_up_date,
      doctor:users(first_name, last_name),
      clinic:clinics(name),
      medicines:prescription_medicines(medicine_name, dosage, dosage_pattern, frequency, duration, instructions),
      investigations:prescription_investigations(test_name, category, notes)
    `)
    .eq('patient_id', emrId)
    .eq('is_deleted', false)
    .order('prescription_date', { ascending: false })
    .limit(50);

  if (error || !data) return [];

  return data.map((p: any) => ({
    id: p.id,
    prescription_number: p.prescription_number,
    prescription_date: p.prescription_date,
    status: p.status,
    diagnosis: p.diagnosis,
    advice: p.advice,
    notes: p.notes,
    follow_up_date: p.follow_up_date,
    doctor_name: p.doctor ? `${p.doctor.first_name} ${p.doctor.last_name}` : 'Doctor',
    clinic_name: p.clinic?.name || '',
    medicines: p.medicines || [],
    investigations: p.investigations || [],
  }));
}

// ── Reports ─────────────────────────────────────────────────

export interface PortalReport {
  id: string;
  title: string;
  category: string | null;
  file_url: string;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  report_date: string | null;
  notes: string | null;
  uploaded_by_name: string | null;
}

export async function getPatientReports(patientAccountId: string): Promise<PortalReport[]> {
  const emrId = await getEmrPatientId(patientAccountId);
  if (!emrId) return [];

  const db = getDb();
  const { data, error } = await db
    .from('uploaded_reports')
    .select(`
      id, title, category, file_url, file_name, file_size, mime_type, report_date, notes,
      uploader:users(first_name, last_name)
    `)
    .eq('patient_id', emrId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error || !data) return [];

  return data.map((r: any) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    file_url: r.file_url,
    file_name: r.file_name,
    file_size: r.file_size,
    mime_type: r.mime_type,
    report_date: r.report_date,
    notes: r.notes,
    uploaded_by_name: r.uploader ? `${r.uploader.first_name} ${r.uploader.last_name}` : null,
  }));
}

// ── Billing ─────────────────────────────────────────────────

export interface PortalInvoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string | null;
  subtotal: number;
  discount: number;
  gst_amount: number;
  total_tax: number;
  grand_total: number;
  paid_amount: number;
  balance: number;
  status: string;
  clinic_name: string;
  items: {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    total: number;
  }[];
  payments: {
    amount: number;
    method: string;
    payment_date: string;
    reference: string | null;
    status: string;
  }[];
}

export async function getPatientInvoices(patientAccountId: string): Promise<PortalInvoice[]> {
  const emrId = await getEmrPatientId(patientAccountId);
  if (!emrId) return [];

  const db = getDb();
  const { data, error } = await db
    .from('invoices')
    .select(`
      id, invoice_number, invoice_date, due_date, subtotal, discount,
      gst_amount, total_tax, grand_total, paid_amount, balance, status,
      clinic:clinics(name),
      items:invoice_items(description, quantity, rate, amount, total),
      payments:payments(amount, method, payment_date, reference, status)
    `)
    .eq('patient_id', emrId)
    .eq('is_deleted', false)
    .order('invoice_date', { ascending: false })
    .limit(50);

  if (error || !data) return [];

  return data.map((inv: any) => ({
    id: inv.id,
    invoice_number: inv.invoice_number,
    invoice_date: inv.invoice_date,
    due_date: inv.due_date,
    subtotal: inv.subtotal,
    discount: inv.discount,
    gst_amount: inv.gst_amount,
    total_tax: inv.total_tax,
    grand_total: inv.grand_total,
    paid_amount: inv.paid_amount,
    balance: inv.balance,
    status: inv.status,
    clinic_name: inv.clinic?.name || '',
    items: inv.items || [],
    payments: inv.payments || [],
  }));
}

export interface PortalBookingPayment {
  booking_id: string;
  patient_name: string;
  amount: number;
  currency: string;
  razorpay_payment_id: string | null;
  payment_status: string;
  created_at: string;
}

export async function getPatientBookingPayments(patientAccountId: string): Promise<PortalBookingPayment[]> {
  const db = getDb();
  const { data: bookings } = await db
    .from('bookings')
    .select('booking_id')
    .eq('patient_account_id', patientAccountId);

  if (!bookings || bookings.length === 0) return [];

  const bookingIds = bookings.map((b: any) => b.booking_id);
  const { data, error } = await db
    .from('booking_payments')
    .select('booking_id, patient_name, amount, currency, razorpay_payment_id, payment_status, created_at')
    .in('booking_id', bookingIds)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data;
}

// ── Follow-Up Entitlements ──────────────────────────────────

export interface FollowUpEntitlement {
  id: string;
  original_booking_id: string;
  consultation_type: string;
  valid_from: string;
  valid_until: string;
  status: string;
  used_booking_id: string | null;
  used_at: string | null;
  created_at: string;
}

export async function getActiveFollowUpEntitlement(patientAccountId: string): Promise<FollowUpEntitlement | null> {
  const db = getDb();
  const now = new Date().toISOString();
  const { data } = await db
    .from('follow_up_entitlements')
    .select('*')
    .eq('patient_account_id', patientAccountId)
    .eq('status', 'ACTIVE')
    .gt('valid_until', now)
    .order('valid_until', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function getAllFollowUpEntitlements(patientAccountId: string): Promise<FollowUpEntitlement[]> {
  const db = getDb();
  const { data, error } = await db
    .from('follow_up_entitlements')
    .select('*')
    .eq('patient_account_id', patientAccountId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error || !data) return [];
  return data;
}

/** Expire old entitlements (call periodically or on read). */
export async function expireOldEntitlements(patientAccountId: string): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();
  await db
    .from('follow_up_entitlements')
    .update({ status: 'EXPIRED', updated_at: now })
    .eq('patient_account_id', patientAccountId)
    .eq('status', 'ACTIVE')
    .lt('valid_until', now);
}

/** Create a follow-up entitlement after a paid online consultation. */
export async function createFollowUpEntitlement(
  patientAccountId: string,
  bookingId: string,
  paymentId: string | null,
  consultationType: string
): Promise<FollowUpEntitlement | null> {
  const db = getDb();
  // Check if entitlement already exists for this booking
  const { data: existing } = await db
    .from('follow_up_entitlements')
    .select('*')
    .eq('patient_account_id', patientAccountId)
    .eq('original_booking_id', bookingId)
    .maybeSingle();
  if (existing) return existing;

  const now = new Date();
  const validUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const { data, error } = await db
    .from('follow_up_entitlements')
    .insert({
      patient_account_id: patientAccountId,
      original_booking_id: bookingId,
      original_payment_id: paymentId,
      consultation_type: consultationType,
      valid_from: now.toISOString(),
      valid_until: validUntil.toISOString(),
      status: 'ACTIVE',
    })
    .select()
    .single();

  if (error) {
    console.error('[follow-up] Failed to create entitlement:', error);
    return null;
  }
  return data;
}

/** Use a follow-up entitlement (mark as USED, link to follow-up booking). */
export async function useFollowUpEntitlement(
  entitlementId: string,
  patientAccountId: string,
  followUpBookingId: string
): Promise<boolean> {
  const db = getDb();
  // Atomic: only update if still ACTIVE and belongs to this patient
  const { data, error } = await db
    .from('follow_up_entitlements')
    .update({
      status: 'USED',
      used_booking_id: followUpBookingId,
      used_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', entitlementId)
    .eq('patient_account_id', patientAccountId)
    .eq('status', 'ACTIVE')
    .select()
    .maybeSingle();

  if (error || !data) return false;
  return true;
}

// ── Consultations (from EMR) ────────────────────────────────

export interface PortalConsultation {
  id: string;
  consultation_date: string;
  status: string;
  chief_complaint: string | null;
  hpi: string | null;
  examination: string | null;
  notes: string | null;
  follow_up_date: string | null;
  follow_up_instructions: string | null;
  doctor_name: string;
  clinic_name: string;
  diagnoses: { diagnosis: string; type: string | null }[];
}

export async function getPatientConsultations(patientAccountId: string): Promise<PortalConsultation[]> {
  const emrId = await getEmrPatientId(patientAccountId);
  if (!emrId) return [];

  const db = getDb();
  const { data, error } = await db
    .from('consultations')
    .select(`
      id, consultation_date, status, chief_complaint, hpi, examination, notes,
      follow_up_date, follow_up_instructions,
      doctor:users(first_name, last_name),
      clinic:clinics(name),
      diagnoses:diagnoses(diagnosis, type)
    `)
    .eq('patient_id', emrId)
    .eq('is_deleted', false)
    .order('consultation_date', { ascending: false })
    .limit(50);

  if (error || !data) return [];

  return data.map((c: any) => ({
    id: c.id,
    consultation_date: c.consultation_date,
    status: c.status,
    chief_complaint: c.chief_complaint,
    hpi: c.hpi,
    examination: c.examination,
    notes: c.notes,
    follow_up_date: c.follow_up_date,
    follow_up_instructions: c.follow_up_instructions,
    doctor_name: c.doctor ? `${c.doctor.first_name} ${c.doctor.last_name}` : 'Doctor',
    clinic_name: c.clinic?.name || '',
    diagnoses: c.diagnoses || [],
  }));
}

// ── Full Patient Profile ────────────────────────────────────

export async function getFullPatientProfile(patientAccountId: string): Promise<{
  account: PatientAccount | null;
  emrPatientId: string | null;
  upcomingBookings: any[];
  totalBookings: number;
  activeFollowUp: FollowUpEntitlement | null;
  recentPrescriptions: PortalPrescription[];
  recentInvoices: PortalInvoice[];
  recentReports: PortalReport[];
}> {
  const db = getDb();

  // Get account (exclude sensitive fields)
  const { data: account } = await db
    .from('patient_accounts')
    .select('id, email, email_verified, first_name, last_name, phone, gender, country, timezone, is_international, preferred_language, created_at, updated_at, last_login_at')
    .eq('id', patientAccountId)
    .maybeSingle();

  let emrPatientId = await getEmrPatientId(patientAccountId);

  // Auto-create bridge if missing — find EMR patient by phone
  if (!emrPatientId && account?.phone) {
    await autoBridgeFromBooking(patientAccountId, account.phone);
    emrPatientId = await getEmrPatientId(patientAccountId);
  }

  // Get bookings (limited to most recent 50)
  const now = new Date().toISOString().split('T')[0];
  const { data: allBookings } = await db
    .from('bookings')
    .select('*')
    .eq('patient_account_id', patientAccountId)
    .order('booking_date', { ascending: false })
    .limit(50);

  const upcomingBookings = (allBookings || []).filter(
    (b: any) => b.booking_date >= now && !['cancelled', 'completed'].includes(b.status)
  );

  // Expire old entitlements
  await expireOldEntitlements(patientAccountId);
  const activeFollowUp = await getActiveFollowUpEntitlement(patientAccountId);

  // Get recent data
  const [prescriptions, invoices, reports] = await Promise.all([
    getPatientPrescriptions(patientAccountId),
    getPatientInvoices(patientAccountId),
    getPatientReports(patientAccountId),
  ]);

  return {
    account: account as PatientAccount | null,
    emrPatientId,
    upcomingBookings,
    totalBookings: allBookings?.length || 0,
    activeFollowUp,
    recentPrescriptions: prescriptions.slice(0, 5),
    recentInvoices: invoices.slice(0, 5),
    recentReports: reports.slice(0, 10),
  };
}

// ── Helper: get authenticated patient ───────────────────────

export async function requireAuth(): Promise<{ patientAccountId: string } | { error: string; status: number }> {
  const patient = await getPatientFromCookie();
  if (!patient || patient.patientId === 'pending') {
    return { error: 'Not authenticated', status: 401 };
  }
  return { patientAccountId: patient.patientId };
}
