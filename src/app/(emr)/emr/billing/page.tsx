'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Receipt, Search, X, Download, Printer, MessageCircle,
  CheckCircle2, Clock, AlertTriangle, Eye, Plus, CreditCard,
  FileText, Trash2, Edit2, TrendingUp, Calendar, Building2, BarChart3,
  RefreshCw, Users,
} from 'lucide-react';
import { cn, formatDate, formatCurrency } from '@/lib/utils';
import BillingInvoice from '@/components/emr/BillingInvoice';
import CreateInvoiceModal from '@/components/emr/CreateInvoiceModal';
import { billingApi } from '@/lib/api-client';
import { mockInvoices } from '@/lib/data/billing-mock';
import type { EMRInvoice, InvoiceStatus } from '@/types/emr';

const clinicLabels: Record<string, string> = {
  'kcc-faridabad': 'KCC Faridabad',
  'kcc-saket': 'KCC Saket',
  'psri-delhi': 'PSRI Delhi',
  'online': 'Online',
  'online-intl': 'Online Intl',
};

const statusConfig: Record<InvoiceStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PAID: { label: 'Paid', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  PENDING: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: <Clock className="h-3.5 w-3.5" /> },
  PARTIAL: { label: 'Partial', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  CANCELLED: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: <X className="h-3.5 w-3.5" /> },
};

function apiInvoiceToEMR(apiInv: any): EMRInvoice {
  const patient = apiInv.patient || {};
  const items = apiInv.items || apiInv.invoice_items || [];
  const payments = apiInv.payments || [];

  const totalAmount = apiInv.total_amount || apiInv.grandTotal || 0;
  const paidAmount = apiInv.paid_amount || apiInv.paidAmount || 0;

  return {
    id: apiInv.id,
    invoiceNumber: apiInv.invoice_number || apiInv.invoiceNumber || `INV-${apiInv.id?.slice(-8)?.toUpperCase() || 'UNKNOWN'}`,
    patientId: apiInv.patient_id || '',
    patientName: patient.first_name ? `${patient.first_name} ${patient.last_name}` : '—',
    patientPhone: patient.phone || '',
    clinicId: apiInv.clinic_id || '',
    doctorName: '',
    date: apiInv.invoice_date || apiInv.created_at || '',
    dueDate: apiInv.due_date || apiInv.invoice_date || '',
    grandTotal: totalAmount,
    paidAmount: paidAmount,
    paymentMethod: apiInv.payment_method || apiInv.paymentMethod || payments[0]?.method || undefined,
    balance: totalAmount - paidAmount,
    status: apiInv.status || 'PENDING',
    subtotal: apiInv.subtotal || totalAmount,
    discount: apiInv.discount || 0,
    discountType: 'FIXED' as const,
    gstRate: apiInv.tax_rate || 0,
    gstAmount: apiInv.tax_amount || 0,
    totalTax: apiInv.tax_amount || 0,
    items: items.map((item: any) => {
      const rate = item.unit_price || item.rate || 0;
      const qty = item.quantity || item.qty || 1;
      const gstRate = item.gst_rate || item.gstRate || 0;
      const gstAmount = rate * qty * gstRate / 100;
      const amount = rate * qty + gstAmount;
      return {
        id: item.id,
        description: item.description || item.name || '',
        qty,
        rate,
        gstRate,
        gstAmount,
        amount: item.amount || amount,
        total: item.total || amount,
      };
    }),
    payments: payments.map((p: any) => ({
      id: p.id,
      amount: p.amount || 0,
      method: p.payment_method || p.method || 'CASH',
      date: p.payment_date || p.created_at || '',
      reference: p.reference || '',
      notes: p.notes || '',
    })),
    notes: apiInv.notes || '',
    createdAt: apiInv.created_at || '',
    updatedAt: apiInv.updated_at || apiInv.created_at || '',
  };
}

const BILLING_STORAGE_KEY = 'emr_billing_invoices';

function loadInvoicesFromStorage(): EMRInvoice[] {
  try {
    return JSON.parse(localStorage.getItem(BILLING_STORAGE_KEY) || '[]');
  } catch { return []; }
}

function saveInvoicesToStorage(invoices: EMRInvoice[]) {
  try {
    localStorage.setItem(BILLING_STORAGE_KEY, JSON.stringify(invoices));
  } catch {}
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<EMRInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'ALL'>('ALL');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedInvoice, setSelectedInvoice] = useState<EMRInvoice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<EMRInvoice | null>(null);
  const [showInvoiceHistory, setShowInvoiceHistory] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const refreshData = useCallback(async () => {
    setLoading(true);
    const storageInvoices = loadInvoicesFromStorage();

    try {
      const params: Record<string, string> = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const result = await billingApi.list(params).catch(() => null);

      if (result && Array.isArray(result.data) && result.data.length > 0) {
        const apiInvoices = result.data.map(apiInvoiceToEMR);
        setInvoices(apiInvoices);
        saveInvoicesToStorage(apiInvoices);
      } else if (result && Array.isArray(result) && result.length > 0) {
        const apiInvoices = result.map(apiInvoiceToEMR);
        setInvoices(apiInvoices);
        saveInvoicesToStorage(apiInvoices);
      } else if (storageInvoices.length > 0) {
        setInvoices(storageInvoices);
      } else {
        setInvoices(mockInvoices);
        saveInvoicesToStorage(mockInvoices);
      }
    } catch {
      if (storageInvoices.length > 0) {
        setInvoices(storageInvoices);
      } else {
        setInvoices(mockInvoices);
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { refreshData(); }, [refreshData]);

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        invoiceSearch === '' ||
        inv.patientName.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter;
      const matchDate =
        (!dateRange.from || inv.date >= dateRange.from) &&
        (!dateRange.to || inv.date <= dateRange.to);
      return matchSearch && matchStatus && matchDate;
    });
  }, [invoiceSearch, statusFilter, dateRange, invoices]);

  const stats = useMemo(() => {
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const pendingAmount = invoices.reduce((sum, inv) => sum + inv.balance, 0);
    const totalInvoices = invoices.length;
    const paidCount = invoices.filter((inv) => inv.status === 'PAID').length;
    return { totalRevenue, pendingAmount, totalInvoices, paidCount };
  }, [invoices]);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const clinicStats = useMemo(() => {
    const byClinic: Record<string, { count: number; revenue: number; pending: number }> = {};
    invoices.forEach((inv) => {
      if (!byClinic[inv.clinicId]) byClinic[inv.clinicId] = { count: 0, revenue: 0, pending: 0 };
      byClinic[inv.clinicId].count++;
      byClinic[inv.clinicId].revenue += inv.paidAmount;
      byClinic[inv.clinicId].pending += inv.balance;
    });
    return byClinic;
  }, [invoices]);

  const monthlyStats = useMemo(() => {
    const thisMonth = invoices.filter((inv) => {
      const d = new Date(inv.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    return {
      count: thisMonth.length,
      revenue: thisMonth.reduce((s, i) => s + i.paidAmount, 0),
      pending: thisMonth.reduce((s, i) => s + i.balance, 0),
    };
  }, [invoices, currentMonth, currentYear]);

  const yearlyStats = useMemo(() => {
    const thisYear = invoices.filter((inv) => new Date(inv.date).getFullYear() === currentYear);
    return {
      count: thisYear.length,
      revenue: thisYear.reduce((s, i) => s + i.paidAmount, 0),
      pending: thisYear.reduce((s, i) => s + i.balance, 0),
    };
  }, [invoices, currentYear]);

  const monthlyTrend = useMemo(() => {
    const months: { label: string; revenue: number; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      const filtered = invoices.filter((inv) => {
        const id = new Date(inv.date);
        return id.getMonth() === m && id.getFullYear() === y;
      });
      months.push({ label, revenue: filtered.reduce((s, i) => s + i.paidAmount, 0), count: filtered.length });
    }
    return months;
  }, [invoices, currentMonth, currentYear]);

  const suggestions = useMemo(() => {
    const tips: string[] = [];
    if (stats.pendingAmount > 0) {
      tips.push(`₹${stats.pendingAmount.toLocaleString()} pending — consider sending payment reminders via WhatsApp.`);
    }
    const unpaid = invoices.filter((i) => i.status === 'PENDING');
    if (unpaid.length > 0) {
      tips.push(`${unpaid.length} invoice(s) unpaid. Follow up with ${unpaid.map((i) => i.patientName).join(', ')}.`);
    }
    if (monthlyStats.revenue > 0 && monthlyStats.count < 3) {
      tips.push('Low billing this month. Consider promoting follow-up consultations.');
    }
    const topClinic = Object.entries(clinicStats).sort((a, b) => b[1].revenue - a[1].revenue)[0];
    if (topClinic) {
      tips.push(`Top earner: ${clinicLabels[topClinic[0]] || topClinic[0]} with ${formatCurrency(topClinic[1].revenue)} revenue.`);
    }
    return tips;
  }, [stats, invoices, monthlyStats, clinicStats]);

  const downloadCSV = () => {
    const headers = ['Invoice #', 'Patient', 'Clinic', 'Date', 'Amount', 'Paid', 'Balance', 'Status'];
    const rows = filtered.map((inv) => [
      inv.invoiceNumber, inv.patientName, clinicLabels[inv.clinicId] || inv.clinicId,
      inv.date, inv.grandTotal, inv.paidAmount, inv.balance, inv.status,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveInvoice = async (invoice: EMRInvoice) => {
    if (editingInvoice) {
      // Update existing
      try {
        await billingApi.update(invoice.id, invoice).catch(() => null);
      } catch {}
      const updated = invoices.map((inv) => (inv.id === invoice.id ? invoice : inv));
      setInvoices(updated);
      saveInvoicesToStorage(updated);
    } else {
      // Create new
      try {
        const result = await billingApi.create(invoice).catch(() => null);
        if (result?.id) {
          invoice.id = result.id;
          invoice.invoiceNumber = result.invoice_number || invoice.invoiceNumber;
        }
      } catch {}
      const updated = [invoice, ...invoices];
      setInvoices(updated);
      saveInvoicesToStorage(updated);
    }
    setEditingInvoice(null);
  };

  const handleDeleteInvoice = async (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      try {
        await billingApi.delete(id).catch(() => null);
      } catch {}
      const updated = invoices.filter((inv) => inv.id !== id);
      setInvoices(updated);
      saveInvoicesToStorage(updated);
      setSelectedInvoice(null);
    }
  };

  const openPrintWindow = (invoice: EMRInvoice, autoPrint: boolean) => {
    setSelectedInvoice(invoice);
    setTimeout(() => {
      const printContent = invoiceRef.current;
      if (!printContent) return;

      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const baseUrl = window.location.origin;
      const htmlContent = printContent.innerHTML.replace(/src="\/images\//g, `src="${baseUrl}/images/`);

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            @page { size: A4 portrait; margin: 8mm; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            html, body { width: 100%; height: 100%; font-family: Arial, Helvetica, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            table { border-collapse: collapse; }
          </style>
        </head>
        <body>
          ${htmlContent}
          ${autoPrint ? '<script>window.onload = function() { setTimeout(function() { window.print(); }, 500); }</script>' : ''}
        </body>
        </html>
      `);
      printWindow.document.close();
      if (autoPrint) {
        printWindow.focus();
      }
    }, 150);
  };

  const handlePrint = (invoice: EMRInvoice) => {
    openPrintWindow(invoice, true);
  };

  const handleDownloadPDF = (invoice: EMRInvoice) => {
    openPrintWindow(invoice, true);
  };

  const handleWhatsApp = (invoice: EMRInvoice) => {
    const message = `Invoice ${invoice.invoiceNumber}\n\nPatient: ${invoice.patientName}\nDate: ${formatDate(invoice.date)}\nTotal: ${formatCurrency(invoice.grandTotal)}\nPaid: ${formatCurrency(invoice.paidAmount)}\nBalance: ${formatCurrency(invoice.balance)}\n\nThank you for your business!\nKIDNEY CARE CENTRE`;
    const whatsappUrl = `https://wa.me/${invoice.patientPhone || ''}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  type SourceType = 'walkin' | 'online' | 'web-online' | 'web-intl';

  const sourceStats = useMemo(() => {
    const sources: Record<SourceType, { count: number; collected: number; pending: number; label: string; bg: string; text: string; border: string; dot: string }> = {
      walkin:      { count: 0, collected: 0, pending: 0, label: 'Walk-In (EMR)',     bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500' },
      online:      { count: 0, collected: 0, pending: 0, label: 'Online (EMR)',      bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
      'web-online':{ count: 0, collected: 0, pending: 0, label: 'Web-Online',        bg: 'bg-emerald-50',text: 'text-emerald-700',border: 'border-emerald-200',dot: 'bg-emerald-500' },
      'web-intl':  { count: 0, collected: 0, pending: 0, label: 'Web-Online Intl',   bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200',   dot: 'bg-teal-500' },
    };
    invoices.forEach((inv) => {
      let source: SourceType = 'walkin';
      if (inv.clinicId === 'online-intl') source = 'web-intl';
      else if (inv.clinicId === 'online') source = 'online';
      sources[source].count++;
      sources[source].collected += inv.paidAmount;
      sources[source].pending += inv.balance;
    });
    return sources;
  }, [invoices]);

  const totalBilled = useMemo(() => invoices.reduce((s, i) => s + i.grandTotal, 0), [invoices]);

  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayInvoices = invoices.filter((inv) => inv.date === today);
    const todayPaid = todayInvoices.filter((inv) => inv.status === 'PAID' || inv.paidAmount > 0);
    const newCount = todayInvoices.filter((inv) => inv.visitType !== 'FOLLOW_UP').length;
    const followUpCount = todayInvoices.filter((inv) => inv.visitType === 'FOLLOW_UP').length;
    const avgFee = invoices.length > 0 ? Math.round(invoices.reduce((s, i) => s + i.grandTotal, 0) / invoices.length) : 0;
    return {
      collection: todayPaid.reduce((s, i) => s + i.paidAmount, 0),
      billCount: todayInvoices.length,
      newCount,
      followUpCount,
      pendingAmount: invoices.filter((inv) => inv.status !== 'PAID').reduce((s, i) => s + i.balance, 0),
      pendingCount: invoices.filter((inv) => inv.status !== 'PAID').length,
      avgFee,
    };
  }, [invoices]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <div className="flex items-center gap-2">
          <button onClick={refreshData}
            className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Refresh">
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
          <button
            onClick={() => {
              setEditingInvoice(null);
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#0A75BB] hover:bg-[#085a94] transition-colors min-h-[44px]"
          >
            <Plus className="h-4 w-4" />
            New Invoice
          </button>
        </div>
      </div>

      {/* Top Stats — 4 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">₹</span>
            </div>
            <p className="text-xs font-medium text-gray-500">Today&apos;s Collection</p>
          </div>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(todayStats.collection)}</p>
          <p className="text-xs text-gray-400 mt-0.5">From {todayStats.billCount} bills</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-xs font-medium text-gray-500">Today&apos;s Patients</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{todayStats.billCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">New: {todayStats.newCount} · Follow-up: {todayStats.followUpCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-xs font-medium text-gray-500">Pending Payments</p>
          </div>
          <p className="text-2xl font-bold text-amber-700">{formatCurrency(todayStats.pendingAmount)}</p>
          <p className="text-xs text-gray-400 mt-0.5">{todayStats.pendingCount} bills</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-xs font-medium text-gray-500">Avg Consultation Fee</p>
          </div>
          <p className="text-2xl font-bold text-purple-700">{formatCurrency(todayStats.avgFee)}</p>
          <p className="text-xs text-gray-400 mt-0.5">This Month</p>
        </div>
      </div>

      {/* Source-wise Earnings */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Earnings by Source</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(sourceStats).map(([key, s]) => {
            if (s.count === 0) return null;
            return (
              <div key={key} className={cn('rounded-xl border p-4', s.bg, s.border)}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn('w-2.5 h-2.5 rounded-full', s.dot)} />
                  <span className={cn('text-sm font-semibold', s.text)}>{s.label}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Invoices</span>
                    <span className="font-medium text-gray-700">{s.count}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Collected</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(s.collected)}</span>
                  </div>
                  {s.pending > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Pending</span>
                      <span className="font-medium text-amber-600">{formatCurrency(s.pending)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {Object.values(sourceStats).every(s => s.count === 0) && !loading && (
            <p className="text-sm text-gray-400 text-center py-4 col-span-full">No invoices yet</p>
          )}
        </div>
      </div>

      {/* Period Summary + Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4 text-[#0A75BB]" />
            <h3 className="text-sm font-semibold text-gray-900">This Period</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs font-medium text-blue-600 mb-1">This Month</p>
              <p className="text-lg font-bold text-blue-900">{formatCurrency(monthlyStats.revenue)}</p>
              <p className="text-xs text-blue-500">{monthlyStats.count} invoices</p>
              {monthlyStats.pending > 0 && <p className="text-xs text-amber-500">{formatCurrency(monthlyStats.pending)} pending</p>}
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs font-medium text-purple-600 mb-1">This Year ({currentYear})</p>
              <p className="text-lg font-bold text-purple-900">{formatCurrency(yearlyStats.revenue)}</p>
              <p className="text-xs text-purple-500">{yearlyStats.count} invoices</p>
              {yearlyStats.pending > 0 && <p className="text-xs text-amber-500">{formatCurrency(yearlyStats.pending)} pending</p>}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-[#0A75BB]" />
            <h3 className="text-sm font-semibold text-gray-900">6-Month Collection</h3>
          </div>
          <div className="flex items-end gap-1.5 h-28">
            {monthlyTrend.map((m, i) => {
              const maxRevenue = Math.max(...monthlyTrend.map((x) => x.revenue), 1);
              const height = (m.revenue / maxRevenue) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  {m.revenue > 0 && <span className="text-[10px] text-gray-500">{formatCurrency(m.revenue).replace('₹', '')}</span>}
                  <div className="w-full flex justify-center">
                    <div
                      className={cn('w-full max-w-[24px] rounded-t transition-colors cursor-pointer', m.revenue > 0 ? 'bg-[#0A75BB] hover:bg-[#085a94]' : 'bg-gray-100')}
                      style={{ height: `${Math.max(height, m.revenue > 0 ? 8 : 3)}%` }}
                      title={`${m.label}: ${formatCurrency(m.revenue)} (${m.count} invoices)`}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Smart Insights */}
      {suggestions.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-blue-900">Smart Insights</h3>
          </div>
          <ul className="space-y-1.5">
            {suggestions.map((tip, i) => (
              <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                <span className="text-blue-400 mt-1">&#9679;</span> {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Invoice History — collapsible */}
      <button onClick={() => setShowInvoiceHistory(!showInvoiceHistory)}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
        <Receipt className="h-4 w-4" />
        Invoices ({filtered.length})
        <span className={cn('text-xs px-2 py-0.5 rounded-full', showInvoiceHistory ? 'bg-[#0A75BB]/10 text-[#0A75BB]' : 'bg-gray-100 text-gray-500')}>
          {showInvoiceHistory ? 'Hide' : 'Show'}
        </span>
      </button>
      {showInvoiceHistory && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  placeholder="Search by patient or invoice number..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 min-h-[44px]"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange((r) => ({ ...r, from: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 min-h-[44px]"
                />
                <span className="text-gray-400 text-sm">to</span>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange((r) => ({ ...r, to: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 min-h-[44px]"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'ALL')}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 min-h-[44px]"
              >
                <option value="ALL">All Status</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="PARTIAL">Partial</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Invoice List — Desktop Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice #</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Clinic</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Visit</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Paid</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell">Payment</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((inv) => {
                    const sc = statusConfig[inv.status];
                    return (
                      <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <span className="text-sm font-mono font-medium text-[#0A75BB]">{inv.invoiceNumber}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-sm font-medium text-gray-900">{inv.patientName}</span>
                          {inv.patientPhone && (
                            <p className="text-xs text-gray-500">{inv.patientPhone}</p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            {clinicLabels[inv.clinicId] || inv.clinicId}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          <span className="text-sm text-gray-600">{formatDate(inv.date)}</span>
                        </td>
                        <td className="px-4 py-3.5 hidden lg:table-cell">
                          {inv.visitType === 'FOLLOW_UP' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">Follow-up</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">New</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="text-sm font-semibold text-gray-900">{formatCurrency(inv.grandTotal)}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right hidden lg:table-cell">
                          <span className={cn('text-sm', inv.paidAmount >= inv.grandTotal ? 'text-green-600 font-medium' : 'text-gray-600')}>
                            {formatCurrency(inv.paidAmount)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 hidden xl:table-cell">
                          <span className="text-xs text-gray-600">
                            {inv.paidAmount > 0 ? (inv.paymentMethod === 'CASH' ? 'Cash' : inv.paymentMethod === 'UPI' ? 'UPI' : inv.paymentMethod === 'CARD' ? 'Card' : inv.paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : inv.paymentMethod === 'CHEQUE' ? 'Cheque' : inv.paymentMethod === 'ONLINE' ? 'Online' : inv.payments?.[0]?.method || '—') : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border', sc.bg, sc.color)}>
                            {sc.icon}
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => setSelectedInvoice(inv)} className="p-2.5 rounded-lg hover:bg-[#0A75BB]/10 text-[#0A75BB] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" title="View">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingInvoice(inv);
                                setShowCreateModal(true);
                              }}
                              className="p-2.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => handlePrint(inv)} className="p-2.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" title="Print">
                              <Printer className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleWhatsApp(inv)} className="p-2.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" title="WhatsApp">
                              <MessageCircle className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDeleteInvoice(inv.id)} className="p-2.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice List — Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((inv) => {
              const sc = statusConfig[inv.status];
              const paymentLabel = inv.paidAmount > 0
                ? (inv.paymentMethod === 'CASH' ? 'Cash' : inv.paymentMethod === 'UPI' ? 'UPI' : inv.paymentMethod === 'CARD' ? 'Card' : inv.paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : inv.paymentMethod === 'CHEQUE' ? 'Cheque' : inv.paymentMethod === 'ONLINE' ? 'Online' : inv.payments?.[0]?.method || '—')
                : '—';
              return (
                <div key={inv.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-sm font-mono font-medium text-[#0A75BB]">{inv.invoiceNumber}</span>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{inv.patientName}</p>
                      {inv.patientPhone && <p className="text-xs text-gray-500">{inv.patientPhone}</p>}
                    </div>
                    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border shrink-0', sc.bg, sc.color)}>
                      {sc.icon} {sc.label}
                    </span>
                  </div>
                <div className="grid grid-cols-2 gap-2 text-xs mt-3 pt-3 border-t border-gray-100">
                <div>
                  <span className="text-gray-500">Date</span>
                  <p className="text-gray-900 font-medium">{formatDate(inv.date)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Clinic</span>
                  <p className="text-gray-900 font-medium">{clinicLabels[inv.clinicId] || inv.clinicId}</p>
                </div>
                <div>
                  <span className="text-gray-500">Visit</span>
                  <p className="font-medium">{inv.visitType === 'FOLLOW_UP' ? (
                    <span className="text-blue-700">Follow-up</span>
                  ) : (
                    <span className="text-green-700">New</span>
                  )}</p>
                </div>
                <div>
                  <span className="text-gray-500">Amount</span>
                      <p className="text-gray-900 font-semibold">{formatCurrency(inv.grandTotal)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Paid</span>
                      <p className={cn('font-medium', inv.paidAmount >= inv.grandTotal ? 'text-green-600' : 'text-gray-900')}>{formatCurrency(inv.paidAmount)}</p>
                    </div>
                    {paymentLabel !== '—' && (
                      <div>
                        <span className="text-gray-500">Payment</span>
                        <p className="text-gray-900 font-medium">{paymentLabel}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button onClick={() => setSelectedInvoice(inv)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#0A75BB]/10 text-[#0A75BB] text-sm font-medium min-h-[44px]">
                      <Eye className="h-4 w-4" /> View
                    </button>
                    <button onClick={() => { setEditingInvoice(inv); setShowCreateModal(true); }} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium min-h-[44px]">
                      <Edit2 className="h-4 w-4" /> Edit
                    </button>
                    <button onClick={() => handleWhatsApp(inv)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium min-h-[44px]">
                      <MessageCircle className="h-4 w-4" /> WhatsApp
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 py-12 text-center text-gray-500">
              <Receipt className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-medium">{loading ? 'Loading invoices...' : 'No invoices found'}</p>
            </div>
          )}
        </>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedInvoice(null)} />
          <div className="relative w-full max-w-4xl max-h-[85vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Invoice {selectedInvoice.invoiceNumber}</h2>
                <p className="text-sm text-gray-500">{selectedInvoice.patientName}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingInvoice(selectedInvoice);
                    setShowCreateModal(true);
                    setSelectedInvoice(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
                <button onClick={() => handlePrint(selectedInvoice)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors" title="Print">
                  <Printer className="h-4 w-4" />
                </button>
                <button onClick={() => handleDownloadPDF(selectedInvoice)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors" title="Download PDF">
                  <Download className="h-4 w-4" />
                </button>
                <button onClick={() => handleWhatsApp(selectedInvoice)} className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors" title="WhatsApp">
                  <MessageCircle className="h-4 w-4" />
                </button>
                <button onClick={() => handleDeleteInvoice(selectedInvoice.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
                <button onClick={() => setSelectedInvoice(null)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Invoice Preview */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="border border-gray-200 rounded-lg shadow-sm">
                <BillingInvoice ref={invoiceRef} invoice={selectedInvoice} clinicId={selectedInvoice.clinicId} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Invoice Modal */}
      <CreateInvoiceModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingInvoice(null);
        }}
        onSave={handleSaveInvoice}
        existingInvoice={editingInvoice}
      />

      {/* Hidden invoice for print */}
      <div className="hidden">
        {selectedInvoice && (
          <BillingInvoice ref={invoiceRef} invoice={selectedInvoice} clinicId={selectedInvoice.clinicId} />
        )}
      </div>
    </div>
  );
}
