'use client';

import { useState, useMemo, useRef } from 'react';
import {
  Receipt, Search, X, Download, Printer, MessageCircle,
  CheckCircle2, Clock, AlertTriangle, Eye, Plus, CreditCard,
  FileText, Trash2, Edit2, TrendingUp, Calendar, Building2, BarChart3,
} from 'lucide-react';
import { cn, formatDate, formatCurrency } from '@/lib/utils';
import BillingInvoice from '@/components/emr/BillingInvoice';
import CreateInvoiceModal from '@/components/emr/CreateInvoiceModal';
import { mockInvoices } from '@/lib/data/billing-mock';
import type { EMRInvoice, InvoiceStatus } from '@/types/emr';

const clinicLabels: Record<string, string> = {
  'kcc-faridabad': 'KCC Faridabad',
  'kcc-saket': 'KCC Saket',
  'psri-delhi': 'PSRI Delhi',
  'online': 'Online',
};

const statusConfig: Record<InvoiceStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PAID: { label: 'Paid', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  PENDING: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: <Clock className="h-3.5 w-3.5" /> },
  PARTIAL: { label: 'Partial', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  CANCELLED: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: <X className="h-3.5 w-3.5" /> },
};

export default function BillingPage() {
  const [invoices, setInvoices] = useState<EMRInvoice[]>(mockInvoices);
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'ALL'>('ALL');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedInvoice, setSelectedInvoice] = useState<EMRInvoice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<EMRInvoice | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

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

  const handleSaveInvoice = (invoice: EMRInvoice) => {
    if (editingInvoice) {
      setInvoices(invoices.map((inv) => (inv.id === invoice.id ? invoice : inv)));
    } else {
      setInvoices([invoice, ...invoices]);
    }
    setEditingInvoice(null);
  };

  const handleDeleteInvoice = (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      setInvoices(invoices.filter((inv) => inv.id !== id));
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

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0A75BB]/10 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-[#0A75BB]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Invoices</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalInvoices}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Paid Invoices</p>
              <p className="text-xl font-bold text-green-600">{stats.paidCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-green-600">₹</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Amount</p>
              <p className="text-xl font-bold text-amber-600">{formatCurrency(stats.pendingAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clinic-wise + Monthly Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Clinic Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-4 w-4 text-[#0A75BB]" />
            <h3 className="text-sm font-semibold text-gray-900">Clinic-wise Revenue</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(clinicStats).map(([clinicId, data]) => (
              <div key={clinicId}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{clinicLabels[clinicId] || clinicId}</span>
                  <span className="font-medium text-gray-900">{formatCurrency(data.revenue)}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0A75BB] rounded-full" style={{ width: `${stats.totalRevenue ? (data.revenue / stats.totalRevenue * 100) : 0}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                  <span>{data.count} invoice(s)</span>
                  <span>{formatCurrency(data.pending)} pending</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly / Yearly */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-4 w-4 text-[#0A75BB]" />
            <h3 className="text-sm font-semibold text-gray-900">Period Summary</h3>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs font-medium text-blue-700 mb-1">This Month</p>
              <p className="text-lg font-bold text-blue-900">{formatCurrency(monthlyStats.revenue)}</p>
              <p className="text-xs text-blue-600">{monthlyStats.count} invoices &middot; {formatCurrency(monthlyStats.pending)} pending</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs font-medium text-purple-700 mb-1">This Year ({currentYear})</p>
              <p className="text-lg font-bold text-purple-900">{formatCurrency(yearlyStats.revenue)}</p>
              <p className="text-xs text-purple-600">{yearlyStats.count} invoices &middot; {formatCurrency(yearlyStats.pending)} pending</p>
            </div>
          </div>
        </div>

        {/* Monthly Trend (Mini Bar Chart) */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-4 w-4 text-[#0A75BB]" />
            <h3 className="text-sm font-semibold text-gray-900">6-Month Trend</h3>
          </div>
          <div className="flex items-end gap-2 h-32">
            {monthlyTrend.map((m, i) => {
              const maxRevenue = Math.max(...monthlyTrend.map((x) => x.revenue), 1);
              const height = (m.revenue / maxRevenue) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-500">{formatCurrency(m.revenue).replace('₹', '')}</span>
                  <div className="w-full flex justify-center">
                    <div
                      className="w-6 rounded-t bg-[#0A75BB] hover:bg-[#085a94] transition-colors cursor-pointer"
                      style={{ height: `${Math.max(height, 4)}%` }}
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

      {/* Smart Suggestions */}
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filtered.length} invoice{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download Report
          </button>
          <button
            onClick={() => {
              setEditingInvoice(null);
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#0A75BB] hover:bg-[#085a94] transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Invoice
          </button>
        </div>
      </div>

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
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange((r) => ({ ...r, from: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20"
            />
            <span className="text-gray-400 text-sm">to</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange((r) => ({ ...r, to: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'ALL')}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20"
          >
            <option value="ALL">All Status</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="PARTIAL">Partial</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice #</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Clinic</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Paid</th>
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
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(inv.grandTotal)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right hidden md:table-cell">
                      <span className={cn('text-sm', inv.paidAmount >= inv.grandTotal ? 'text-green-600 font-medium' : 'text-gray-600')}>
                        {formatCurrency(inv.paidAmount)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border', sc.bg, sc.color)}>
                        {sc.icon}
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setSelectedInvoice(inv)} className="p-1.5 rounded-lg hover:bg-[#0A75BB]/10 text-[#0A75BB] transition-colors" title="View">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingInvoice(inv);
                            setShowCreateModal(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handlePrint(inv)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Print">
                          <Printer className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleWhatsApp(inv)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors" title="WhatsApp">
                          <MessageCircle className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteInvoice(inv.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
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
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <Receipt className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium">No invoices found</p>
          </div>
        )}
      </div>

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
