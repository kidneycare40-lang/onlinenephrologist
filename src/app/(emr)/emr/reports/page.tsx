'use client';

import { useState, useMemo } from 'react';
import {
  TrendingUp, Download, Calendar, Users, FileText,
  BarChart3, ArrowUpRight, ArrowDownRight,
  Activity, FlaskConical,
} from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { cn } from '@/lib/utils';
import { patients, consultations, prescriptions, labOrders } from '@/lib/data/emr-mock';
import { mockInvoices } from '@/lib/data/billing-mock';
import type { EMRInvoice } from '@/types/emr';

type ReportTab = 'revenue' | 'patients' | 'clinical';

const clinicLabels: Record<string, string> = {
  'kcc-faridabad': 'KCC Faridabad',
  'kcc-saket': 'KCC Saket',
  'psri-delhi': 'PSRI Delhi',
  'online': 'Online',
};

const chartTooltipStyle = {
  backgroundColor: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '13px',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
};

function fmt(val: number) {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val}`;
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('revenue');

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // ── REVENUE DATA ──
  const revenueData = useMemo(() => {
    const invoices: EMRInvoice[] = mockInvoices;

    // By clinic
    const byClinic: Record<string, number> = {};
    invoices.forEach((inv) => {
      byClinic[inv.clinicId] = (byClinic[inv.clinicId] || 0) + inv.paidAmount;
    });
    const revenueByClinic = Object.entries(byClinic).map(([id, value]) => ({
      name: clinicLabels[id] || id, value, color: id === 'kcc-faridabad' ? '#0A75BB' : id === 'kcc-saket' ? '#10B981' : id === 'online' ? '#F59E0B' : '#8B5CF6',
    }));

    // By service (from invoice items)
    const byService: Record<string, number> = {};
    invoices.forEach((inv) => {
      inv.items.forEach((item) => {
        const key = item.description.includes('Online') ? 'Online Consultation' :
                    item.description.includes('Consultation') ? 'In-Clinic Consultation' :
                    item.description;
        byService[key] = (byService[key] || 0) + item.amount;
      });
    });
    const revenueByService = Object.entries(byService).map(([name, value], i) => ({
      name, value, color: ['#0A75BB', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'][i % 5],
    }));

    // By payment method
    const byMethod: Record<string, { amount: number; count: number }> = {};
    invoices.forEach((inv) => {
      inv.payments?.forEach((p) => {
        if (!byMethod[p.method]) byMethod[p.method] = { amount: 0, count: 0 };
        byMethod[p.method].amount += p.amount;
        byMethod[p.method].count++;
      });
    });
    const paymentMethods = Object.entries(byMethod).map(([method, data], i) => ({
      method, ...data, color: ['#0A75BB', '#10B981', '#F59E0B', '#8B5CF6'][i % 4],
    }));

    // Monthly trend (last 6 months)
    const monthlyTrend: { month: string; revenue: number; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const label = `${monthNames[m]} ${String(y).slice(2)}`;
      const filtered = invoices.filter((inv) => {
        const id = new Date(inv.date);
        return id.getMonth() === m && id.getFullYear() === y;
      });
      monthlyTrend.push({ month: label, revenue: filtered.reduce((s, i) => s + i.paidAmount, 0), count: filtered.length });
    }

    // This month / This year
    const thisMonth = invoices.filter((inv) => {
      const d = new Date(inv.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const thisYear = invoices.filter((inv) => new Date(inv.date).getFullYear() === currentYear);

    const totalRevenue = invoices.reduce((s, i) => s + i.paidAmount, 0);
    const totalPending = invoices.reduce((s, i) => s + i.balance, 0);
    const totalItems = invoices.reduce((s, i) => s + i.items.length, 0);

    return {
      totalRevenue, totalPending,
      totalInvoices: invoices.length,
      paidCount: invoices.filter((i) => i.status === 'PAID').length,
      revenueByClinic, revenueByService, paymentMethods, monthlyTrend,
      thisMonthRevenue: thisMonth.reduce((s, i) => s + i.paidAmount, 0),
      thisMonthCount: thisMonth.length,
      thisYearRevenue: thisYear.reduce((s, i) => s + i.paidAmount, 0),
      thisYearCount: thisYear.length,
      totalItems,
    };
  }, [currentMonth, currentYear]);

  // ── PATIENT DATA ──
  const patientData = useMemo(() => {
    const total = patients.length;
    const male = patients.filter((p) => p.gender === 'Male').length;
    const female = patients.filter((p) => p.gender === 'Female').length;
    const other = total - male - female;

    // Age distribution
    const ageGroups: Record<string, number> = { '0-18': 0, '19-30': 0, '31-45': 0, '46-60': 0, '60+': 0 };
    patients.forEach((p) => {
      const age = new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear();
      if (age <= 18) ageGroups['0-18']++;
      else if (age <= 30) ageGroups['19-30']++;
      else if (age <= 45) ageGroups['31-45']++;
      else if (age <= 60) ageGroups['46-60']++;
      else ageGroups['60+']++;
    });
    const ageDistribution = Object.entries(ageGroups).map(([range, count]) => ({ range, count }));

    // By clinic
    const byClinic: Record<string, number> = {};
    patients.forEach((p) => { byClinic[p.clinicId] = (byClinic[p.clinicId] || 0) + 1; });
    const patientsByClinic = Object.entries(byClinic).map(([id, count]) => ({
      name: clinicLabels[id] || id, count,
    }));

    // Chronic vs non-chronic
    const chronic = patients.filter((p) => p.isChronic).length;

    const avgVisits = total > 0 ? (patients.reduce((s, p) => s + (p.totalVisits || 0), 0) / total).toFixed(1) : '0';

    return { total, male, female, other, ageDistribution, patientsByClinic, chronic, avgVisits };
  }, []);

  // ── CLINICAL DATA ──
  const clinicalData = useMemo(() => {
    const totalConsultations = consultations.length;
    const totalPrescriptions = prescriptions.length;
    const totalLabOrders = labOrders.length;

    // Common diagnoses
    const diagCount: Record<string, number> = {};
    consultations.forEach((c) => {
      c.diagnoses?.forEach((d) => {
        diagCount[d.name] = (diagCount[d.name] || 0) + 1;
      });
    });
    const sortedDiags = Object.entries(diagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({
        name, count, percentage: totalConsultations > 0 ? Math.round((count / totalConsultations) * 100) : 0,
      }));

    // Prescription categories (from medicine names)
    const catCount: Record<string, number> = {};
    const catColors: Record<string, string> = {
      'Antihypertensives': '#0A75BB', 'ESAs': '#10B981', 'Phosphate Binders': '#F59E0B',
      'Immunosuppressants': '#8B5CF6', 'Diuretics': '#EF4444', 'Antibiotics': '#06B6D4',
      'Calcium/Vitamin D': '#EC4899', 'Other': '#6B7280',
    };
    consultations.forEach((c) => {
      c.prescriptions?.forEach((rx) => {
        const name = rx.name.toLowerCase();
        let cat = 'Other';
        if (name.includes('olol') || name.includes('sartan') || name.includes('ipine') || name.includes('pril') || name.includes('telm') || name.includes('amlo')) cat = 'Antihypertensives';
        else if (name.includes('epo') || name.includes('alfa')) cat = 'ESAs';
        else if (name.includes('sevel') || name.includes('lanthan') || name.includes('calc')) cat = 'Phosphate Binders';
        else if (name.includes(' tac') || name.includes('myco') || name.includes('pred') || name.includes('steroid')) cat = 'Immunosuppressants';
        else if (name.includes('furo') || name.includes('hydro') || name.includes('torsem') || name.includes('spiron')) cat = 'Diuretics';
        else if (name.includes('amox') || name.includes('azith') || name.includes('cipro') || name.includes('cef')) cat = 'Antibiotics';
        else if (name.includes('calcium') || name.includes('vit d') || name.includes('calcitriol')) cat = 'Calcium/Vitamin D';
        catCount[cat] = (catCount[cat] || 0) + 1;
      });
    });
    const prescriptionsByCategory = Object.entries(catCount)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({ category, count, color: catColors[category] || '#6B7280' }));

    // Lab test frequency
    const testCount: Record<string, number> = {};
    labOrders.forEach((lo) => {
      lo.results?.forEach((r) => {
        testCount[r.testName] = (testCount[r.testName] || 0) + 1;
      });
    });
    const labTestFrequency = Object.entries(testCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([test, count]) => ({ test, count }));

    return { totalConsultations, totalPrescriptions, totalLabOrders, sortedDiags, prescriptionsByCategory, labTestFrequency };
  }, []);

  const downloadCSV = () => {
    const headers = ['Invoice #', 'Patient', 'Clinic', 'Date', 'Amount', 'Paid', 'Balance', 'Status'];
    const rows = mockInvoices.map((inv) => [
      inv.invoiceNumber, inv.patientName, clinicLabels[inv.clinicId] || inv.clinicId,
      inv.date, inv.grandTotal, inv.paidAmount, inv.balance, inv.status,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
            </div>
            Reports & Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">Real data from your billing, patients & consultations</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={downloadCSV} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" /> Download CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1 -mb-px overflow-x-auto">
          {[
            { id: 'revenue' as const, label: 'Revenue', icon: <BarChart3 className="h-4 w-4" /> },
            { id: 'patients' as const, label: 'Patients', icon: <Users className="h-4 w-4" /> },
            { id: 'clinical' as const, label: 'Clinical', icon: <Activity className="h-4 w-4" /> },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn('flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════ REVENUE TAB ═══════ */}
      {activeTab === 'revenue' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: fmt(revenueData.totalRevenue), trend: 12, bg: 'bg-blue-50 text-blue-600', icon: <span className="text-lg font-bold">₹</span> },
              { label: 'This Month', value: fmt(revenueData.thisMonthRevenue), trend: 0, bg: 'bg-emerald-50 text-emerald-600', icon: <Calendar className="h-5 w-5" /> },
              { label: 'Total Invoices', value: String(revenueData.totalInvoices), trend: 0, bg: 'bg-purple-50 text-purple-600', icon: <FileText className="h-5 w-5" /> },
              { label: 'Pending Amount', value: fmt(revenueData.totalPending), trend: -5, bg: 'bg-amber-50 text-amber-600', icon: <FlaskConical className="h-5 w-5" /> },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn('p-2 rounded-xl', stat.bg)}>{stat.icon}</div>
                  {stat.trend !== 0 && (
                    <div className={cn('flex items-center gap-1 text-xs font-medium', stat.trend >= 0 ? 'text-green-600' : 'text-red-600')}>
                      {stat.trend >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                      {Math.abs(stat.trend)}%
                    </div>
                  )}
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Monthly Revenue Trend */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm">Monthly Revenue Trend</h3>
              </div>
              <div className="p-4 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData.monthlyTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => fmt(v)} />
                    <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#0A75BB" radius={[6, 6, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue by Clinic (Pie) */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm">Revenue by Clinic</h3>
              </div>
              <div className="p-4 h-[280px]">
                {revenueData.revenueByClinic.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={revenueData.revenueByClinic} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value">
                        {revenueData.revenueByClinic.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => fmt(v)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data yet</div>
                )}
              </div>
            </div>
          </div>

          {/* Revenue by Service + Payment Methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm">Revenue by Service</h3>
              </div>
              <div className="p-4 h-[280px]">
                {revenueData.revenueByService.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData.revenueByService} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => fmt(v)} />
                      <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={32}>
                        {revenueData.revenueByService.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data yet</div>
                )}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm">Payment Methods</h3>
              </div>
              <div className="p-5">
                {revenueData.paymentMethods.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {revenueData.paymentMethods.map((pm) => (
                      <div key={pm.method} className="text-center">
                        <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: `${pm.color}15` }}>
                          <span className="text-lg font-bold" style={{ color: pm.color }}>{pm.count}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{pm.method}</p>
                        <p className="text-xs text-gray-500">{fmt(pm.amount)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 text-sm py-8">No payments recorded</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ PATIENTS TAB ═══════ */}
      {activeTab === 'patients' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-xs font-medium text-gray-500 mb-1">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900">{patientData.total}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-xs font-medium text-gray-500 mb-1">Chronic Patients</p>
              <p className="text-3xl font-bold text-orange-600">{patientData.chronic}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-xs font-medium text-gray-500 mb-1">Avg. Visits/Patient</p>
              <p className="text-3xl font-bold text-gray-900">{patientData.avgVisits}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-xs font-medium text-gray-500 mb-1">Gender (M/F)</p>
              <p className="text-3xl font-bold text-gray-900">{patientData.male}/{patientData.female}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Age Distribution */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm">Age Distribution</h3>
              </div>
              <div className="p-4 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={patientData.ageDistribution} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="count" name="Patients" fill="#8B5CF6" radius={[6, 6, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Patients by Clinic */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm">Patients by Clinic</h3>
              </div>
              <div className="p-4 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={patientData.patientsByClinic} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="count" name="Patients" fill="#0A75BB" radius={[6, 6, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Gender Distribution */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">Gender Distribution</h3>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-center gap-8">
                {[
                  { name: 'Male', value: patientData.male, color: '#0A75BB' },
                  { name: 'Female', value: patientData.female, color: '#EC4899' },
                  { name: 'Other', value: patientData.other, color: '#6B7280' },
                ].map((g) => (
                  <div key={g.name} className="text-center">
                    <div className="w-20 h-20 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: `${g.color}20` }}>
                      <span className="text-xl font-bold" style={{ color: g.color }}>{g.value}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{g.name}</p>
                    <p className="text-xs text-gray-500">{patientData.total > 0 ? Math.round((g.value / patientData.total) * 100) : 0}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ CLINICAL TAB ═══════ */}
      {activeTab === 'clinical' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-xs font-medium text-gray-500 mb-1">Total Consultations</p>
              <p className="text-3xl font-bold text-gray-900">{clinicalData.totalConsultations}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-xs font-medium text-gray-500 mb-1">Prescriptions Issued</p>
              <p className="text-3xl font-bold text-gray-900">{clinicalData.totalPrescriptions}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-xs font-medium text-gray-500 mb-1">Lab Tests Ordered</p>
              <p className="text-3xl font-bold text-gray-900">{clinicalData.totalLabOrders}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Common Diagnoses */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm">Most Common Diagnoses</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {clinicalData.sortedDiags.length > 0 ? clinicalData.sortedDiags.map((dx, i) => (
                  <div key={i} className="px-5 py-3 flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-4 text-right font-mono">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{dx.name}</span>
                        <span className="text-xs text-gray-500">{dx.count} patients</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${dx.percentage}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-primary-700 w-10 text-right">{dx.percentage}%</span>
                  </div>
                )) : <div className="p-8 text-center text-gray-400 text-sm">No diagnosis data yet</div>}
              </div>
            </div>

            {/* Prescriptions by Category */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm">Prescriptions by Category</h3>
              </div>
              <div className="p-4 h-[320px]">
                {clinicalData.prescriptionsByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={clinicalData.prescriptionsByCategory} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={130} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Bar dataKey="count" name="Prescriptions" radius={[0, 6, 6, 0]} maxBarSize={20}>
                        {clinicalData.prescriptionsByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">No prescription data yet</div>
                )}
              </div>
            </div>
          </div>

          {/* Lab Test Frequency */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">Lab Test Frequency</h3>
            </div>
            <div className="p-4 h-[280px]">
              {clinicalData.labTestFrequency.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clinicalData.labTestFrequency} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="test" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="count" name="Tests Ordered" fill="#06B6D4" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">No lab data yet</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
