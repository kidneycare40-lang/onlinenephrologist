/**
 * Auto-generate invoice + payment record when a booking is paid.
 * Called from Razorpay verify, webhook, and offline booking flows.
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
  // Payment details
  paymentMethod: string;        // 'Razorpay', 'CASH', 'UPI', 'CARD', etc.
  transactionId?: string;       // Razorpay payment ID
  orderId?: string;             // Razorpay order ID
  paymentStatus: string;        // 'COMPLETED', 'PENDING'
  // Optional
  doctorId?: string;
}

async function generateInvoiceNumber(db: ReturnType<typeof getDb>): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `INV-${dateStr}-`;

  // Get the latest invoice number for today
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

/**
 * Find or create a patient in the patients table for an online booking.
 * Returns the patient UUID.
 */
async function findOrCreatePatient(
  db: ReturnType<typeof getDb>,
  data: BookingInvoiceData
): Promise<string | null> {
  // Try to find existing patient by phone
  if (data.patientPhone) {
    const cleanPhone = data.patientPhone.replace(/\D/g, '').replace(/^91/, '');
    const { data: existing } = await db
      .from('patients')
      .select('id')
      .eq('phone', cleanPhone)
      .limit(1);

    if (existing && existing.length > 0) return existing[0].id;

    // Also try with full phone
    const { data: existing2 } = await db
      .from('patients')
      .select('id')
      .eq('phone', data.patientPhone)
      .limit(1);

    if (existing2 && existing2.length > 0) return existing2[0].id;
  }

  // Create new patient
  const [firstName, ...lastParts] = data.patientName.split(' ');
  const lastName = lastParts.join(' ') || '';

  const { data: newPatient, error } = await db
    .from('patients')
    .insert({
      first_name: firstName,
      last_name: lastName,
      phone: data.patientPhone.replace(/\D/g, '').replace(/^91/, ''),
      email: data.patientEmail || null,
      gender: data.gender || null,
      uhid: `OB-${data.bookingId.slice(-6).toUpperCase()}`,
      source: 'website',
      is_active: true,
      clinic_id: mapClinicId(data.clinicId),
    })
    .select('id')
    .single();

  if (error) {
    console.error('[auto-invoice] Failed to create patient:', error);
    return null;
  }
  return newPatient?.id || null;
}

function mapClinicId(clinicId: string): string {
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

function getPaymentMethodForRazorpay(): string {
  return 'ONLINE';
}

/**
 * Auto-create an invoice + payment record for a booking.
 * Idempotent: skips if an invoice with this bookingId already exists.
 */
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

  const clinicId = mapClinicId(data.clinicId);
  const doctorId = data.doctorId || 'doctor-default';
  const invoiceNumber = await generateInvoiceNumber(db);
  const amount = data.consultationFee;
  const currency = data.currency || 'INR';
  const isPaid = data.paymentStatus === 'COMPLETED';
  const consultLabel = getConsultationLabel(data.consultationType, data.clinicId);

  // Determine payment method for the invoices table
  let paymentMethod: string | null = null;
  if (data.paymentMethod === 'Razorpay') {
    paymentMethod = 'ONLINE';
  } else if (data.paymentMethod) {
    paymentMethod = data.paymentMethod;
  }

  // Create invoice
  const { data: invoice, error: invoiceError } = await db
    .from('invoices')
    .insert({
      invoice_number: invoiceNumber,
      patient_id: patientId,
      doctor_id: doctorId,
      clinic_id: clinicId,
      invoice_date: data.date || new Date().toISOString().slice(0, 10),
      due_date: data.date || new Date().toISOString().slice(0, 10),
      subtotal: amount,
      tax_rate: 0,
      tax_amount: 0,
      discount: 0,
      total_amount: amount,
      paid_amount: isPaid ? amount : 0,
      payment_method: paymentMethod,
      status: isPaid ? 'PAID' : 'PENDING',
      notes: `Auto-generated from booking ${data.bookingId}`,
      created_by: 'system',
    })
    .select('id')
    .single();

  if (invoiceError) {
    console.error('[auto-invoice] Failed to create invoice:', invoiceError);
    return null;
  }

  // Create invoice item
  await db.from('invoice_items').insert({
    invoice_id: invoice.id,
    item_name: consultLabel,
    description: `${consultLabel} — ${data.reason || 'General'}`,
    quantity: 1,
    unit_price: amount,
    total_price: amount,
    sort_order: 0,
  });

  // Create payment record if paid
  if (isPaid) {
    let payMethod: string = 'ONLINE';
    if (data.paymentMethod === 'CASH') payMethod = 'CASH';
    else if (data.paymentMethod === 'UPI') payMethod = 'UPI';
    else if (data.paymentMethod === 'CARD') payMethod = 'CARD';

    await db.from('payments').insert({
      invoice_id: invoice.id,
      patient_id: patientId,
      amount: amount,
      payment_method: payMethod,
      reference_number: data.transactionId || data.orderId || null,
      transaction_id: data.transactionId || null,
      gateway: data.paymentMethod === 'Razorpay' ? 'razorpay' : null,
      status: 'COMPLETED',
      payment_date: new Date().toISOString(),
      notes: `Booking: ${data.bookingId}${data.transactionId ? ` | Txn: ${data.transactionId}` : ''}${data.orderId ? ` | Order: ${data.orderId}` : ''}`,
    });
  }

  console.log(`[auto-invoice] Created ${isPaid ? 'PAID' : 'PENDING'} invoice ${invoiceNumber} for booking ${data.bookingId}`);
  return invoice.id;
}
