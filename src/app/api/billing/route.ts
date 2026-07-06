import { NextRequest, NextResponse } from 'next/server';
import { getBillingService } from '@/lib/db/services';
import { logAudit, logActivity } from '@/lib/db/audit';
import type { FilterParams, PaginationParams, SortParams } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const billingService = getBillingService();

    const id = searchParams.get('id');
    if (id) {
      const invoice = await billingService.getInvoice(id);
      if (!invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }
      return NextResponse.json(invoice);
    }

    const patientId = searchParams.get('patientId');
    if (patientId) {
      const invoices = await billingService.getPatientInvoices(patientId);
      return NextResponse.json(invoices);
    }

    const status = searchParams.get('status');
    if (status === 'pending') {
      const invoices = await billingService.getPendingInvoices();
      return NextResponse.json(invoices);
    }
    if (status === 'overdue') {
      const invoices = await billingService.getOverdueInvoices();
      return NextResponse.json(invoices);
    }

    // List with pagination
    const filters: FilterParams = {};
    const pagination: PaginationParams = {};
    const sort: SortParams = {};

    if (searchParams.get('search')) filters.search = searchParams.get('search')!;
    if (searchParams.get('clinicId')) filters.clinicId = searchParams.get('clinicId')!;
    if (searchParams.get('page')) pagination.page = parseInt(searchParams.get('page')!);
    if (searchParams.get('limit')) pagination.limit = parseInt(searchParams.get('limit')!);

    const result = await billingService.listInvoices({ filters, pagination, sort });
    return NextResponse.json(result);

  } catch (error) {
    console.error('GET /api/billing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const billingService = getBillingService();

    // Handle payment recording
    if (body.action === 'record_payment') {
      const payment = await billingService.recordPayment({
        invoice_id: body.invoice_id,
        patient_id: body.patient_id,
        amount: body.amount,
        payment_method: body.payment_method,
        reference_number: body.reference_number || null,
        notes: body.notes || null,
        createdBy: body.created_by,
      });

      if (!payment) {
        return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
      }

      logAudit({ userId: body.created_by, action: 'CREATE', entityType: 'payment', entityId: payment?.id, newValues: { amount: body.amount, payment_method: body.payment_method, invoice_id: body.invoice_id } });
      logActivity({ patientId: body.patient_id, action: 'payment_recorded', description: `Payment of ₹${body.amount} recorded` });

      return NextResponse.json(payment, { status: 201 });
    }

    // Create invoice — accept both camelCase (from client) and snake_case (from DB)
    const patientId = body.patient_id || body.patientId;
    const doctorId = body.doctor_id || body.doctorId || 'doctor-default';
    const clinicId = body.clinic_id || body.clinicId || 'kcc-faridabad';

    if (!patientId || !body.items?.length) {
      return NextResponse.json(
        { error: 'Patient and items are required' },
        { status: 400 }
      );
    }

    const invoice = await billingService.createInvoice({
      ...body,
      patient_id: patientId,
      doctor_id: doctorId,
      clinic_id: clinicId,
      paid_amount: body.paidAmount || body.paid_amount || 0,
      payment_method: body.paymentMethod || body.payment_method || null,
      initial_status: body.status || 'PENDING',
      items: body.items.map((item: any, i: number) => ({
        description: item.description || item.name || '',
        unit_price: item.rate || item.unit_price || 0,
        quantity: item.qty || item.quantity || 1,
        gst_rate: item.gstRate || item.gst_rate || 0,
        total_price: item.amount || item.total || 0,
        sort_order: i,
      })),
    });
    if (!invoice) {
      return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
    }

    logAudit({ action: 'CREATE', entityType: 'invoice', entityId: invoice?.id, newValues: { patient_id: body.patient_id, items: body.items.length } });
    logActivity({ patientId: body.patient_id, action: 'invoice_created', description: `Invoice created with ${body.items.length} items` });

    return NextResponse.json(invoice, { status: 201 });

  } catch (error) {
    console.error('POST /api/billing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    const billingService = getBillingService();

    const success = await billingService.updateInvoice(id, {
      status: updateData.status,
      paid_amount: updateData.paidAmount,
      payment_method: updateData.paymentMethod,
      notes: updateData.notes,
    });

    if (!success) {
      return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/billing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    const billingService = getBillingService();
    const success = await billingService.deleteInvoice(id);
    if (!success) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    logAudit({ action: 'DELETE', entityType: 'invoice', entityId: id });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('DELETE /api/billing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
