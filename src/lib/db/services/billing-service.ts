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
        patient:patients(id, first_name, last_name, phone, uhid),
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
        items:invoice_items(item_name, quantity, unit_price, total_price),
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
        patient:patients(id, first_name, last_name, phone, uhid),
        doctor:users(id, first_name, last_name),
        items:invoice_items(item_name, quantity, unit_price, total_price),
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
    const result = await this.invoiceRepo.findMany(params);
    return result as PaginatedResult<InvoiceWithRelations>;
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
      tax_rate: data.tax_rate || 0,
      tax_amount: taxAmount,
      discount: data.discount || 0,
      total_amount: totalAmount,
      paid_amount: 0,
      status: 'PENDING',
      notes: data.notes || null,
      created_by: data.createdBy,
    } as Partial<Invoice>);

    if (!invoice) return null;

    // Insert items
    if (data.items.length > 0) {
      const itemRecords = data.items.map((item, i) => ({
        invoice_id: invoice.id,
        ...item,
        total_price: item.unit_price * (item.quantity || 1),
        sort_order: item.sort_order ?? i,
      }));
      await getDb().from('invoice_items').insert(itemRecords as any);
    }

    return this.invoiceRepo.findByIdWithRelations(invoice.id);
  }

  async deleteInvoice(id: string): Promise<boolean> {
    return this.invoiceRepo.softDelete(id);
  }

  // --- Payments ---

  async recordPayment(data: PaymentCreate & { createdBy?: string }): Promise<Payment | null> {
    const payment = await this.paymentRepo.create({
      ...data,
      status: data.status || 'COMPLETED',
      created_by: data.createdBy,
    } as Partial<Payment>);

    if (!payment) return null;

    // Update invoice paid_amount and status
    await this.syncInvoiceStatus(data.invoice_id);

    return payment;
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
    const refund = await this.paymentRepo.create({
      invoice_id: existing.invoice_id,
      patient_id: existing.patient_id,
      amount: -existing.amount,
      payment_method: existing.payment_method,
      status: 'REFUNDED',
      reference_number: `REF-${existing.reference_number || ''}`,
      notes: reason || 'Refund',
    } as Partial<Payment>);

    // Sync invoice
    await this.syncInvoiceStatus(existing.invoice_id);

    return refund;
  }

  private async syncInvoiceStatus(invoiceId: string): Promise<void> {
    const totalPaid = await this.paymentRepo.getTotalPaid(invoiceId);

    const { data: invoice } = await getDb()
      .from('invoices')
      .select('total_amount, invoice_date')
      .eq('id', invoiceId)
      .single();

    if (!invoice) return;

    let status = 'PENDING';
    if (totalPaid >= invoice.total_amount) {
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
      status,
    } as Partial<Invoice>);
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
