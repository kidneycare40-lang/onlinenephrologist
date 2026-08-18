/**
 * Auto-generate invoice + payment record when a booking is paid.
 * Called from Razorpay verify, webhook, and offline booking flows.
 *
 * DB schema (migrations/001):
 *   invoices: clinic_id UUID refs clinics(id), doctor_id UUID refs users(id),
 *             grand_total, gst_rate, gst_amount, total_tax, balance
 *   invoice_items: description, rate, amount, total, gst_rate, gst_amount
 *   payments: method (payment_method enum), reference, status (payment_status enum)
 */

import { getDb } from './db/client';

interface BookingInvoiceData {
  bookingId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  age?: string;
  gender?: string;
  clinicId: string;
  consultationType: string;
  consultationFee: number;
  currency?: string;
  date?: string;
  reason?: string;
  paymentMethod: string;
  transactionId?: string;
  orderId?: string;
  paymentStatus: string;
  doctorId?: string;
}

let clinicUuidCache: Record<string, string> = {};
let clinicsLoaded = false;
let defaultDoctorId: string | null = null;

async function resolveClinicUuid(db: ReturnType<typeof getDb>, shortName: string): Promise<string> {
  if (clinicUuidCache[shortName]) return clinicUuidCache[shortName];

  if (!clinicsLoaded) {
    const { data: clinics } = await db.from('clinics').select('id, short_name, name');
    if (clinics) {
      for (const c of clinics) {
        if (c.short_name) clinicUuidCache[c.short_name] = c.id;
        if (c.name) clinicUuidCache[c.name] = c.id;
      }
    }
    clinicsLoaded = true;
  }

  if (clinicUuidCache[shortName]) return clinicUuidCache[shortName];

  const { data: match } = await db.from('clinics').select('id').eq('short_name', shortName).limit(1);
  if (match && match.length > 0) {
    clinicUuidCache[shortName] = match[0].id;
    return match[0].id;
  }

  const { data: first } = await db.from('clinics').select('id').limit(1);
  return first && first.length > 0 ? first[0].id : '';
}

async function resolveDoctorId(db: ReturnType<typeof getDb>): Promise<string> {
  if (defaultDoctorId) return defaultDoctorId;
  const { data: doctors } = await db
    .from('users')
    .select('id')
    .eq('role', 'doctor')
    .eq('is_active', true)
    .limit(1);
  if (doctors && doctors.length > 0) {
    defaultDoctorId = doctors[0].id;
    return defaultDoctorId!;
  }
  return '';
}

function mapClinicShortName(clinicId: string): string {
  const map: Record<string, string> = {
    'online': 'online', 'online-intl': 'online', 'online_intl': 'online',
    'faridabad': 'kcc-faridabad', 'kcc-faridabad': 'kcc-faridabad',
    'psri': 'psri-delhi', 'psri-delhi': 'psri-delhi',
    'saket': 'kcc-saket', 'kcc-saket': 'kcc-saket',
    'hospital': 'psri-delhi',
  };
  return map[clinicId] || clinicId || 'kcc-faridabad';
}

function getConsultationLabel(consultationType: string, clinicId: string): string {
  if (consultationType === 'online_intl') return 'International Online Consultation';
  if (consultationType === 'online') return 'Online Consultation';
  if (consultationType === 'hospital') return 'Hospital Consultation';
  if (clinicId === 'psri' || clinicId === 'psri-delhi') return 'PSRI Hospital Visit';
  if (clinicId === 'kcc-saket') return 'In-Clinic Consultation (Saket)';
  if (clinicId === 'kcc-faridabad') return 'In-Clinic Consultation (Faridabad)';
  return 'In-Clinic Consultation';
}

async function generateInvoiceNumber(db: ReturnType<typeof getDb>): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `INV-${dateStr}-`;

  const { data } = await db
    .from('invoices')
    .select('invoice_number')
    .like('invoice_number', `${prefix}%`)
    .order('invoice_number', { ascending: false })
    .limit(1);

  if (data && data.length > 0) {
    const lastNum = parseInt(data[0].invoice_number.replace(prefix, ''), 10);
    return `${prefix}${String(lastNum + 1).padStart(4, '0')}`;
  }
  return `${prefix}0001`;
}

async function findOrCreatePatient(
  db: ReturnType<typeof getDb>,
  data: BookingInvoiceData
): Promise<string | null> {
  if (data.patientPhone) {
    const cleanPhone = data.patientPhone.replace(/\D/g, '').replace(/^91/, '');
    const { data: existing } = await db
      .from('patients')
      .select('id')
      .eq('phone', cleanPhone)
      .limit(1);
    if (existing && existing.length > 0) return existing[0].id;

    const { data: existing2 } = await db
      .from('patients')
      .select('id')
      .eq('phone', data.patientPhone)
      .limit(1);
    if (existing2 && existing2.length > 0) return existing2[0].id;
  }

  const [firstName, ...lastParts] = data.patientName.split(' ');
  const lastName = lastParts.join(' ') || '';
  const clinicUuid = await resolveClinicUuid(db, mapClinicShortName(data.clinicId));

  const { data: newPatient, error } = await db
    .from('patients')
    .insert({
      first_name: firstName,
      last_name: lastName,
      phone: data.patientPhone.replace(/\D/g, '').replace(/^91/, ''),
      email: data.patientEmail || null,
      gender: data.gender || null,
      uhid: `OB-${data.bookingId.slice(-6).toUpperCase()}`,
      primary_clinic_id: clinicUuid || null,
      is_active: true,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[auto-invoice] Failed to create patient:', error);
    return null;
  }
  return newPatient?.id || null;
}

export async function autoCreateBookingInvoice(data: BookingInvoiceData): Promise<string | null> {
  const db = getDb();

  // Idempotency: check if invoice already exists for this booking
  const { data: existing } = await db
    .from('invoices')
    .select('id, invoice_number')
    .eq('notes', `Auto-generated from booking ${data.bookingId}`)
    .limit(1);

  if (existing && existing.length > 0) {
    return existing[0].id;
  }

  // Find or create patient
  const patientId = await findOrCreatePatient(db, data);
  if (!patientId) {
    console.error('[auto-invoice] Could not find/create patient for booking', data.bookingId);
    return null;
  }

  // Resolve UUIDs for clinic and doctor
  const clinicShortName = mapClinicShortName(data.clinicId);
  const clinicUuid = await resolveClinicUuid(db, clinicShortName);
  const doctorUuid = await resolveDoctorId(db);
  const invoiceNumber = await generateInvoiceNumber(db);
  const amount = data.consultationFee;
  const isPaid = data.paymentStatus === 'COMPLETED';
  const consultLabel = getConsultationLabel(data.consultationType, data.clinicId);

  // Determine payment method
  let payMethod = 'ONLINE';
  if (data.paymentMethod === 'CASH') payMethod = 'CASH';
  else if (data.paymentMethod === 'UPI') payMethod = 'UPI';
  else if (data.paymentMethod === 'CARD') payMethod = 'CARD';

  // Create invoice — using correct column names from migration 001
  const { data: invoice, error: invoiceError } = await db
    .from('invoices')
    .insert({
      invoice_number: invoiceNumber,
      patient_id: patientId,
      doctor_id: doctorUuid || null,
      clinic_id: clinicUuid,
      invoice_date: data.date || new Date().toISOString().slice(0, 10),
      due_date: data.date || new Date().toISOString().slice(0, 10),
      subtotal: amount,
      discount: 0,
      gst_rate: 0,
      gst_amount: 0,
      total_tax: 0,
      grand_total: amount,
      paid_amount: isPaid ? amount : 0,
      balance: isPaid ? 0 : amount,
      status: isPaid ? 'PAID' : 'PENDING',
      notes: `Auto-generated from booking ${data.bookingId}`,
    })
    .select('id')
    .single();

  if (invoiceError) {
    console.error('[auto-invoice] Failed to create invoice:', invoiceError);
    return null;
  }

  // Create invoice item — correct columns: description, rate, amount, total
  const { error: itemError } = await db.from('invoice_items').insert({
    invoice_id: invoice.id,
    description: consultLabel,
    quantity: 1,
    rate: amount,
    amount: amount,
    gst_rate: 0,
    gst_amount: 0,
    total: amount,
    sort_order: 0,
  });
  if (itemError) {
    console.error('[auto-invoice] Failed to create invoice item:', itemError);
  }

  // Create payment record if paid — correct columns: method, reference
  if (isPaid) {
    const { error: payError } = await db.from('payments').insert({
      invoice_id: invoice.id,
      patient_id: patientId,
      amount: amount,
      method: payMethod,
      reference: data.transactionId || data.orderId || null,
      transaction_id: data.transactionId || null,
      gateway: data.paymentMethod === 'Razorpay' ? 'razorpay' : null,
      status: 'COMPLETED',
      payment_date: new Date().toISOString(),
      notes: `Booking: ${data.bookingId}${data.transactionId ? ` | Txn: ${data.transactionId}` : ''}${data.orderId ? ` | Order: ${data.orderId}` : ''}`,
    });
    if (payError) {
      console.error('[auto-invoice] Failed to create payment record:', payError);
    }
  }

  console.log(`[auto-invoice] Created ${isPaid ? 'PAID' : 'PENDING'} invoice ${invoiceNumber} for booking ${data.bookingId}`);
  return invoice.id;
}
