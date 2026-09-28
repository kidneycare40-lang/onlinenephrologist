import { NextRequest, NextResponse } from 'next/server';
import { getBillingService } from '@/lib/db/services';
import { getDb } from '@/lib/db/client';
import { authenticateRequest, requirePermission, applyRateLimit, withAudit, apiError } from '@/lib/auth/middleware';
import { isUuid, resolveClinicUuid, resolveDoctorId, mapClinicShortName, resolveInvoicePatientId } from '@/lib/auto-invoice';
import type { FilterParams, PaginationParams, SortParams, PaymentMethod } from '@/lib/db/types';

const VALID_PAY_METHODS = new Set(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE']);

/** Map client values (PAYPAL, RAZORPAY, ...) to the payment_method DB enum. */
function normalizePayMethod(value: unknown): PaymentMethod {
  if (!value) return 'ONLINE';
  const upper = String(value).toUpperCase().trim();
  return (VALID_PAY_METHODS.has(upper) ? upper : 'ONLINE') as PaymentMethod;
}

export async function GET(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'billing', 'view'); if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const billingService = getBillingService();
    const id = searchParams.get('id');
    if (id) { const invoice = await billingService.getInvoice(id); if (!invoice) return apiError('Invoice not found', 404); return NextResponse.json(invoice); }
    const patientId = searchParams.get('patientId');
    if (patientId) { const invoices = await billingService.getPatientInvoices(patientId); return NextResponse.json(invoices); }
    const status = searchParams.get('status');
    if (status === 'pending') { return NextResponse.json(await billingService.getPendingInvoices()); }
    if (status === 'overdue') { return NextResponse.json(await billingService.getOverdueInvoices()); }
    const filters: FilterParams = {}; const pagination: PaginationParams = {}; const sort: SortParams = {};
    if (searchParams.get('search')) filters.search = searchParams.get('search')!;
    if (searchParams.get('clinicId')) filters.clinicId = searchParams.get('clinicId')!;
    if (searchParams.get('page')) pagination.page = parseInt(searchParams.get('page')!);
    if (searchParams.get('limit')) pagination.limit = parseInt(searchParams.get('limit')!);
    return NextResponse.json(await billingService.listInvoices({ filters, pagination, sort }));
  } catch (error) { console.error('GET /api/billing error:', error); return apiError('Internal server error', 500); }
}

export async function POST(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;

    const body = await request.json();
    const billingService = getBillingService();

    if (body.action === 'record_payment') {
      const permError = requirePermission(user, 'billing', 'recordPayment'); if (permError) return permError;
      // Use the invoice's own patient_id (always a real UUID FK) — client-supplied
      // patient ids may be non-UUID references and would violate payments FK.
      let patientIdForPayment = body.patient_id || body.patientId;
      if (!isUuid(patientIdForPayment)) {
        const db = getDb();
        const { data: invRow } = await db.from('invoices').select('patient_id').eq('id', body.invoice_id).limit(1).maybeSingle();
        if (invRow?.patient_id) patientIdForPayment = invRow.patient_id;
      }
      const payMethod = normalizePayMethod(body.payment_method);
      const payment = await billingService.recordPayment({ invoice_id: body.invoice_id, patient_id: patientIdForPayment, amount: body.amount, payment_method: payMethod, reference_number: body.reference_number || null, notes: body.notes || null, createdBy: user!.userId });
      if (!payment) return apiError('Failed to record payment', 500);
      withAudit('CREATE', 'payment', user!.userId, payment?.id, undefined, { amount: body.amount, payment_method: payMethod });
      return NextResponse.json(payment, { status: 201 });
    }

    const permError = requirePermission(user, 'billing', 'create'); if (permError) return permError;
    const patientIdRaw = body.patient_id || body.patientId;
    const clinicRaw = body.clinic_id || body.clinicId || 'kcc-faridabad';
    const doctorRaw = body.doctor_id || body.doctorId || '';
    if (!patientIdRaw || !body.items?.length) return apiError('Patient and items are required', 400);

    // Resolve client-side references to real UUIDs — invoices.clinic_id / patient_id
    // are UUID FK columns and reject values like 'kcc-faridabad' or 'custom-1699...'.
    const db = getDb();

    let clinicUuid = '';
    if (isUuid(clinicRaw)) {
      const { data } = await db.from('clinics').select('id').eq('id', clinicRaw).limit(1).maybeSingle();
      if (data?.id) clinicUuid = data.id;
    }
    if (!clinicUuid) clinicUuid = await resolveClinicUuid(db, mapClinicShortName(clinicRaw));
    if (!clinicUuid) return apiError('Could not resolve clinic for this invoice', 500);

    let doctorUuid: string | null = null;
    if (isUuid(doctorRaw)) {
      const { data } = await db.from('users').select('id').eq('id', doctorRaw).limit(1).maybeSingle();
      if (data?.id) doctorUuid = data.id;
    }
    if (!doctorUuid) doctorUuid = (await resolveDoctorId(db)) || null;

    const patientUuid = await resolveInvoicePatientId(
      db, patientIdRaw, body.patientName, body.patientPhone, clinicUuid
    );
    if (!patientUuid) return apiError('Could not save patient for this invoice. Provide patient name and phone.', 400);

    const invoice = await billingService.createInvoice({
      ...body, patient_id: patientUuid, doctor_id: doctorUuid || null, clinic_id: clinicUuid,
      paid_amount: body.paidAmount || body.paid_amount || 0,
      payment_method: body.paymentMethod || body.payment_method
        ? normalizePayMethod(body.paymentMethod || body.payment_method)
        : null,
      initial_status: ['PAID', 'PENDING', 'PARTIAL', 'CANCELLED'].includes(body.status) ? body.status : 'PENDING',
      items: body.items.map((item: any, i: number) => ({
        description: item.description || item.name || '', unit_price: item.rate || item.unit_price || 0,
        quantity: item.qty || item.quantity || 1, gst_rate: item.gstRate || item.gst_rate || 0,
        total_price: item.amount || item.total || 0, sort_order: i,
      })),
    });
    if (!invoice) return apiError('Failed to create invoice', 500);
    withAudit('CREATE', 'invoice', user!.userId, invoice?.id, undefined, { patient_id: patientUuid, items: body.items.length });
    return NextResponse.json(invoice, { status: 201 });
  } catch (error) { console.error('POST /api/billing error:', error); return apiError('Internal server error', 500); }
}

export async function PUT(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'billing', 'edit'); if (permError) return permError;

    const body = await request.json(); const { id, ...updateData } = body;
    if (!id) return apiError('Invoice ID is required', 400);
    const billingService = getBillingService();
    const success = await billingService.updateInvoice(id, { status: updateData.status, paid_amount: updateData.paidAmount, payment_method: updateData.paymentMethod ? normalizePayMethod(updateData.paymentMethod) : undefined, notes: updateData.notes });
    if (!success) return apiError('Failed to update invoice', 500);
    withAudit('UPDATE', 'invoice', user!.userId, id, undefined, updateData);
    return NextResponse.json({ success: true });
  } catch (error) { console.error('PUT /api/billing error:', error); return apiError('Internal server error', 500); }
}

export async function DELETE(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'billing', 'delete'); if (permError) return permError;

    const { searchParams } = new URL(request.url); const id = searchParams.get('id');
    if (!id) return apiError('Invoice ID is required', 400);
    const billingService = getBillingService();
    const success = await billingService.deleteInvoice(id);
    if (!success) return apiError('Invoice not found', 404);
    withAudit('DELETE', 'invoice', user!.userId, id);
    return NextResponse.json({ success: true });
  } catch (error) { console.error('DELETE /api/billing error:', error); return apiError('Internal server error', 500); }
}
