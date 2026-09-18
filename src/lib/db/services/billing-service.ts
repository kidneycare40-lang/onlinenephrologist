import { BaseRepository } from './base-repository';
import { getDb } from '../client';
import type {
  Invoice,
  InvoiceWithRelations,
  InvoiceItem,
  InvoiceItemCreate,
  Payment,
  PaymentCreate,
  PaginatedResult,
  FilterParams,
  PaginationParams,
  SortParams,
} from '../types';

// ============================================================
// Invoice Repository
// ============================================================

export class InvoiceRepository extends BaseRepository<Invoice> {
  constructor() {
    super('invoices');
  }

  async findByIdWithRelations(id: string): Promise<InvoiceWithRelations | null> {
    const { data, error } = await this.db
      .from('invoices')
      .select(`
        *,
        patient:patients(id, first_name, last_name, phone, uhid, date_of_birth, gender),
        doctor:users(id, first_name, last_name),
        clinic:clinics(id, name, short_name),
        items:invoice_items(*),
        payments:payments(amount, payment_method, payment_date, reference_number, status)
      `)
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error) return null;
    return data as InvoiceWithRelations;
  }

  async findByPatient(patientId: string, limit = 20): Promise<InvoiceWithRelations[]> {
    const { data, error } = await this.db
      .from('invoices')
      .select(`
        *,
        doctor:users(id, first_name, last_name),
        items:invoice_items(description, quantity, rate, amount, total, gst_rate, gst_amount),
        payments:payments(amount, payment_method, payment_date)
      `)
      .eq('patient_id', patientId)
      .eq('is_deleted', false)
      .order('invoice_date', { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data || []) as InvoiceWithRelations[];
  }

  async findByStatus(status: string, clinicId?: string): Promise<InvoiceWithRelations[]> {
    let query = this.db
      .from('invoices')
      .select(`
        *,
        patient:patients(id, first_name, last_name, phone, uhid, date_of_birth, gender),
        doctor:users(id, first_name, last_name),
        items:invoice_items(description, quantity, rate, amount, total, gst_rate, gst_amount),
        payments:payments(amount, payment_method, payment_date)
      `)
      .eq('status', status)
      .eq('is_deleted', false)
      .order('invoice_date', { ascending: false });

    if (clinicId) query = query.eq('clinic_id', clinicId);

    const { data, error } = await query;
    if (error) return [];
    return (data || []) as InvoiceWithRelations[];
  }

  async findPending(): Promise<InvoiceWithRelations[]> {
    return this.findByStatus('PENDING');
  }

  async findOverdue(): Promise<InvoiceWithRelations[]> {
    return this.findByStatus('OVERDUE');
  }
}

// ============================================================
// Payment Repository
// ============================================================

export class PaymentRepository extends BaseRepository<Payment> {
  constructor() {
    super('payments');
  }

  async findByInvoiceId(invoiceId: string): Promise<Payment[]> {
    const { data, error } = await this.db
      .from('payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .eq('is_deleted', false)
      .order('payment_date', { ascending: false });

    if (error) return [];
    return (data || []) as Payment[];
  }

  async findByPatient(patientId: string, limit = 50): Promise<Payment[]> {
    const { data, error } = await this.db
      .from('payments')
      .select('*')
      .eq('patient_id', patientId)
      .eq('is_deleted', false)
      .order('payment_date', { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data || []) as Payment[];
  }

  async getTotalPaid(invoiceId: string): Promise<number> {
    const { data, error } = await this.db
      .from('payments')
      .select('amount')
      .eq('invoice_id', invoiceId)
      .eq('status', 'COMPLETED')
      .eq('is_deleted', false);

    if (error) return 0;
    return (data || []).reduce((sum, p) => sum + (p.amount || 0), 0);
  }
}

// ============================================================
// Billing Service
// ============================================================

export class BillingService {
  private invoiceRepo = new InvoiceRepository();
  private paymentRepo = new PaymentRepository();

  // --- Invoices ---

  async getInvoice(id: string): Promise<InvoiceWithRelations | null> {
    return this.invoiceRepo.findByIdWithRelations(id);
  }

  async listInvoices(params: {
    filters?: FilterParams;
    pagination?: PaginationParams;
    sort?: SortParams;
  } = {}): Promise<PaginatedResult<InvoiceWithRelations>> {
    const { filters = {}, pagination = {}, sort = {} } = params;
    const { page = 1, limit = 50 } = pagination;
    const { sortBy = 'created_at', sortOrder = 'desc' } = sort;
    const offset = (page - 1) * limit;

    const db = getDb();
    let query = db
      .from('invoices')
      .select(`
        *,
        patient:patients(id, first_name, last_name, phone, uhid, date_of_birth, gender),
        doctor:users(id, first_name, last_name),
        items:invoice_items(*),
        payments:payments(amount, payment_method, payment_date, reference_number, status)
      `, { count: 'exact' })
      .eq('is_deleted', false);

    if (filters.clinicId) query = query.eq('clinic_id', filters.clinicId);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom);
    if (filters.dateTo) query = query.lte('created_at', filters.dateTo);

    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) {
      console.error('Error fetching invoices:', error);
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }

    return {
      data: (data || []) as InvoiceWithRelations[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  async getPatientInvoices(patientId: string): Promise<InvoiceWithRelations[]> {
    return this.invoiceRepo.findByPatient(patientId);
  }

  async getPendingInvoices(): Promise<InvoiceWithRelations[]> {
    return this.invoiceRepo.findPending();
  }

  async getOverdueInvoices(): Promise<InvoiceWithRelations[]> {
    return this.invoiceRepo.findOverdue();
  }

  async createInvoice(data: {
    patient_id: string;
    doctor_id: string;
    clinic_id: string;
    consultation_id?: string;
    items: InvoiceItemCreate[];
    tax_rate?: number;
    discount?: number;
    notes?: string;
    createdBy?: string;
    paid_amount?: number;
    initial_status?: string;
    payment_method?: string;
  }): Promise<InvoiceWithRelations | null> {
    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => {
      const qty = item.quantity || 1;
      return sum + (item.unit_price * qty);
    }, 0);

    const taxAmount = data.tax_rate ? subtotal * (data.tax_rate / 100) : 0;
    const totalAmount = subtotal + taxAmount - (data.discount || 0);

    // Generate invoice number
    const invNumber = await this.generateInvoiceNumber();

    const invoice = await this.invoiceRepo.create({
      invoice_number: invNumber,
      patient_id: data.patient_id,
      doctor_id: data.doctor_id,
      clinic_id: data.clinic_id,
      consultation_id: data.consultation_id || null,
      subtotal,
      gst_rate: data.tax_rate || 0,
      gst_amount: taxAmount,
      total_tax: taxAmount,
      grand_total: totalAmount,
      discount: data.discount || 0,
      paid_amount: data.paid_amount || 0,
      payment_method: data.payment_method || null,
      balance: totalAmount - (data.paid_amount || 0),
      status: (data.paid_amount || 0) >= totalAmount ? 'PAID' : (data.paid_amount || 0) > 0 ? 'PARTIAL' : (data.initial_status || 'PENDING'),
      notes: data.notes || null,
      created_by: data.createdBy,
    } as Partial<Invoice>);

    if (!invoice) return null;

    // Insert items
    if (data.items.length > 0) {
      const itemRecords = data.items.map((item, i) => ({
        invoice_id: invoice.id,
        description: item.description || '',
        quantity: item.quantity || 1,
        rate: item.unit_price,
        amount: item.unit_price * (item.quantity || 1),
        gst_rate: item.gst_rate || 0,
        gst_amount: item.gst_amount || 0,
        total: item.unit_price * (item.quantity || 1),
        sort_order: item.sort_order ?? i,
      }));
      const { error: itemError } = await getDb().from('invoice_items').insert(itemRecords as any);
      if (itemError) {
        console.error('[billing-service] createInvoice items FAILED:', itemError.message || JSON.stringify(itemError));
      }
    }

    return this.invoiceRepo.findByIdWithRelations(invoice.id);
  }

  async deleteInvoice(id: string): Promise<boolean> {
    return this.invoiceRepo.softDelete(id);
  }

  // --- Payments ---

  async recordPayment(data: PaymentCreate & { createdBy?: string }): Promise<Payment | null> {
    const db = getDb();
    const { error } = await db.from('payments').insert({
      invoice_id: data.invoice_id,
      patient_id: data.patient_id,
      amount: data.amount,
      method: data.payment_method,
      reference: data.reference_number || null,
      status: data.status || 'COMPLETED',
      created_by: data.createdBy || null,
      payment_date: new Date().toISOString(),
    });

    if (error) {
      console.error('[billing-service] recordPayment FAILED:', error.message || JSON.stringify(error));
      return null;
    }

    // Update invoice paid_amount and status
    await this.syncInvoiceStatus(data.invoice_id);

    return { ...data, id: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), is_deleted: false } as Payment;
  }

  async getInvoicePayments(invoiceId: string): Promise<Payment[]> {
    return this.paymentRepo.findByInvoiceId(invoiceId);
  }

  async getPatientPayments(patientId: string): Promise<Payment[]> {
    return this.paymentRepo.findByPatient(patientId);
  }

  async getInvoiceTotalPaid(invoiceId: string): Promise<number> {
    return this.paymentRepo.getTotalPaid(invoiceId);
  }

  async refundPayment(paymentId: string, reason?: string): Promise<Payment | null> {
    const { data: existing } = await getDb()
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (!existing) return null;

    // Create refund record
    const refundData = {
      invoice_id: existing.invoice_id,
      patient_id: existing.patient_id,
      amount: -existing.amount,
      method: existing.method,
      reference: `REF-${existing.reference || ''}`,
      status: 'REFUNDED' as const,
      notes: reason || 'Refund',
      payment_date: new Date().toISOString(),
    };

    const { data: refund, error: refundError } = await getDb().from('payments').insert(refundData).select().single();

    if (refundError) {
      console.error('[billing-service] refundPayment insert FAILED:', refundError.message || JSON.stringify(refundError));
      return null;
    }

    // Sync invoice
    await this.syncInvoiceStatus(existing.invoice_id);

    return refund as unknown as Payment;
  }

  private async syncInvoiceStatus(invoiceId: string): Promise<void> {
    const totalPaid = await this.paymentRepo.getTotalPaid(invoiceId);

    const { data: invoice } = await getDb()
      .from('invoices')
      .select('grand_total, invoice_date, paid_amount')
      .eq('id', invoiceId)
      .single();

    if (!invoice) return;

    let status = 'PENDING';
    if (totalPaid >= invoice.grand_total) {
      status = 'PAID';
    } else if (totalPaid > 0) {
      status = 'PARTIAL';
    } else {
      // Check if overdue (invoice date > 30 days ago)
      const invDate = new Date(invoice.invoice_date);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - invDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 30) status = 'OVERDUE';
    }

    await this.invoiceRepo.update(invoiceId, {
      paid_amount: totalPaid,
      balance: invoice.grand_total - totalPaid,
      status,
    } as Partial<Invoice>);
  }

  async updateInvoice(id: string, data: { status?: string; paid_amount?: number; payment_method?: string; notes?: string }): Promise<boolean> {
    const updatePayload: Record<string, any> = {};
    if (data.status) updatePayload.status = data.status;
    if (data.notes !== undefined) updatePayload.notes = data.notes;

    if (data.paid_amount !== undefined) {
      // Recalculate balance from grand_total
      const { data: invoice } = await getDb()
        .from('invoices')
        .select('grand_total')
        .eq('id', id)
        .single();
      const grandTotal = invoice?.grand_total || 0;
      updatePayload.paid_amount = data.paid_amount;
      updatePayload.balance = grandTotal - data.paid_amount;
    }

    const { error } = await getDb()
      .from('invoices')
      .update(updatePayload)
      .eq('id', id);

    return !error;
  }

  private async generateInvoiceNumber(): Promise<string> {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const { count } = await getDb()
      .from('invoices')
      .select('id', { count: 'exact', head: true });

    return `INV-${today}-${String((count || 0) + 1).padStart(4, '0')}`;
  }
}

// Singleton
let _billingService: BillingService | null = null;
export function getBillingService(): BillingService {
  if (!_billingService) _billingService = new BillingService();
  return _billingService;
}
