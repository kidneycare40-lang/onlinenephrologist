'use client';

import { useState } from 'react';
import {
  TrendingUp, TrendingDown, Activity, Droplets, Heart,
  AlertTriangle, ChevronDown, Calendar, Pill,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, AreaChart, Area,
} from 'recharts';
import { cn } from '@/lib/utils';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const patients = [
  { id: '1', name: 'Ramesh Kumar', uhid: 'UHID-1001', stage: 4 },
  { id: '2', name: 'Anjali Mehta', uhid: 'UHID-1002', stage: 3 },
  { id: '3', name: 'Suresh Reddy', uhid: 'UHID-1003', stage: 5 },
  { id: '4', name: 'Sunita Devi', uhid: 'UHID-1004', stage: 2 },
];

const creatinineData = months.map((m, i) => ({
  month: m,
  value: 3.2 + Math.sin(i * 0.8) * 0.6 + (i > 6 ? (i - 6) * 0.15 : 0),
}));

const egfrData = months.map((m, i) => ({
  month: m,
  value: Math.round(24 - Math.sin(i * 0.8) * 4 - (i > 6 ? (i - 6) * 1.2 : 0)),
}));

const hemoglobinData = months.map((m, i) => ({
  month: m,
  value: 9.2 + Math.sin(i * 1.2) * 1.1,
}));

const potassiumData = months.map((m, i) => ({
  month: m,
  value: 4.8 + Math.sin(i * 0.9) * 0.6,
}));

const calciumPhosData = months.map((m, i) => ({
  month: m,
  calcium: 9.2 + Math.sin(i * 0.7) * 0.8,
  phosphorus: 4.5 + Math.cos(i * 0.6) * 0.9,
}));

const weightData = months.map((m, i) => ({
  month: m,
  value: 68 - i * 0.3 + Math.sin(i * 1.5) * 0.5,
}));

const activeMedications = [
  { name: 'Tab. Erythropoetin 4000 IU', frequency: '3 times/week', route: 'SC' },
  { name: 'Tab. Sevelamer 800mg', frequency: 'TID after meals', route: 'Oral' },
  { name: 'Cap. Calcitriol 0.25mcg', frequency: 'Once daily', route: 'Oral' },
  { name: 'Tab. Folic Acid 5mg', frequency: 'Once daily', route: 'Oral' },
  { name: 'Inj. Iron Sucrose 100mg', frequency: 'Weekly', route: 'IV' },
  { name: 'Tab. Amlodipine 5mg', frequency: 'Once daily', route: 'Oral' },
];

const stageColors: Record<string, { bg: string; text: string; border: string }> = {
  '1': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  '2': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  '3': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  '4': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  '5': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  Dialysis: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
};

function TrendArrow({ value, good }: { value: number; good: 'low' | 'high' }) {
  const isUp = value > 0;
  const isGood = good === 'low' ? !isUp : isUp;
  return (
    <div className={cn('flex items-center gap-0.5 text-xs font-medium', isGood ? 'text-emerald-600' : 'text-red-600')}>
      {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {Math.abs(value).toFixed(1)}%
    </div>
  );
}

function MetricCard({ label, value, unit, trend, trendGood, danger }: {
  label: string;
  value: string;
  unit: string;
  trend?: number;
  trendGood?: 'low' | 'high';
  danger?: boolean;
}) {
  return (
    <div className={cn('p-3 rounded-xl border', danger ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200')}>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <div className="flex items-baseline gap-1.5 mt-1">
        <span className={cn('text-xl font-bold', danger ? 'text-red-700' : 'text-gray-900')}>{value}</span>
        <span className="text-xs text-gray-400">{unit}</span>
      </div>
      {trend !== undefined && trendGood && (
        <div className="mt-1">
          <TrendArrow value={trend} good={trendGood} />
        </div>
      )}
    </div>
  );
}

const chartTooltipStyle = {
  backgroundColor: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '13px',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
};

export default function CKDDashboardPage() {
  const [selectedPatient, setSelectedPatient] = useState(patients[0]);
  const [patientDropdownOpen, setPatientDropdownOpen] = useState(false);

  const sc = stageColors[String(selectedPatient.stage)];

  return (
    <div className="space-y-5 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-orange-50 rounded-xl">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
            CKD Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">Chronic Kidney Disease monitoring &amp; management</p>
        </div>

        {/* Patient Selector */}
        <div className="relative">
          <button
            onClick={() => setPatientDropdownOpen(!patientDropdownOpen)}
            className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors min-w-[240px]"
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-semibold text-primary-700 shrink-0">
              {selectedPatient.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="font-medium text-gray-900 truncate">{selectedPatient.name}</p>
              <p className="text-[11px] text-gray-500">{selectedPatient.uhid}</p>
            </div>
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold border', sc.bg, sc.text, sc.border)}>
              Stage {selectedPatient.stage}
            </span>
            <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', patientDropdownOpen && 'rotate-180')} />
          </button>
          {patientDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
              {patients.map((p) => {
                const psc = stageColors[String(p.stage)];
                return (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedPatient(p); setPatientDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-semibold text-primary-700 shrink-0">
                      {p.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                      <p className="text-[11px] text-gray-500">{p.uhid}</p>
                    </div>
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold border', psc.bg, psc.text, psc.border)}>
                      Stage {p.stage}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CKD Status Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-gray-900">CKD Status</h2>
            <span className={cn('px-3 py-1 rounded-full text-sm font-bold border', sc.bg, sc.text, sc.border)}>
              Stage {selectedPatient.stage}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5" />
            Last updated: 25 Jun 2026
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <MetricCard label="Creatinine" value="3.8" unit="mg/dL" trend={8.2} trendGood="low" danger />
            <MetricCard label="eGFR" value="22" unit="mL/min" trend={-5.1} trendGood="high" danger />
            <MetricCard label="Proteinuria" value="+++" unit="grade" danger />
            <MetricCard label="Potassium" value="5.4" unit="mEq/L" trend={3.2} trendGood="low" danger />
            <MetricCard label="Hemoglobin" value="9.1" unit="g/dL" trend={-2.4} trendGood="high" />
            <MetricCard label="Calcium" value="9.4" unit="mg/dL" trend={1.1} trendGood="low" />
            <MetricCard label="Phosphorus" value="5.2" unit="mg/dL" trend={6.8} trendGood="low" danger />
            <MetricCard label="PTH" value="285" unit="pg/mL" trend={12.5} trendGood="low" danger />
            <MetricCard label="Albumin" value="3.2" unit="g/dL" trend={-1.8} trendGood="high" />
            <MetricCard label="Uric Acid" value="7.8" unit="mg/dL" trend={4.5} trendGood="low" />
          </div>
        </div>
      </div>

      {/* Trend Charts - 2 column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Creatinine Trend */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Creatinine Trend</h3>
            <p className="text-xs text-gray-500 mt-0.5">Last 12 months</p>
          </div>
          <div className="p-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={creatinineData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[1, 5]} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [`${v.toFixed(1)} mg/dL`, 'Creatinine']} />
                <ReferenceLine y={1.2} stroke="#10B981" strokeDasharray="4 4" label={{ value: 'Normal', position: 'right', fontSize: 10, fill: '#10B981' }} />
                <Line type="monotone" dataKey="value" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 4, fill: '#EF4444', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* eGFR Trend */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">eGFR Trend</h3>
            <p className="text-xs text-gray-500 mt-0.5">Last 12 months</p>
          </div>
          <div className="p-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={egfrData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="egfrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A75BB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0A75BB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 60]} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [`${v} mL/min`, 'eGFR']} />
                <ReferenceLine y={15} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'Dialysis', position: 'right', fontSize: 10, fill: '#EF4444' }} />
                <Area type="monotone" dataKey="value" stroke="#0A75BB" strokeWidth={2.5} fill="url(#egfrGrad)" dot={{ r: 4, fill: '#0A75BB', strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hemoglobin with reference range */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Hemoglobin Trend</h3>
            <p className="text-xs text-gray-500 mt-0.5">Target: 10-12 g/dL</p>
          </div>
          <div className="p-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hemoglobinData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[6, 14]} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [`${v.toFixed(1)} g/dL`, 'Hemoglobin']} />
                <ReferenceLine y={10} stroke="#10B981" strokeDasharray="4 4" />
                <ReferenceLine y={12} stroke="#10B981" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="value" stroke="#7C3AED" strokeWidth={2.5} dot={{ r: 4, fill: '#7C3AED', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Potassium with danger zones */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Potassium Trend</h3>
            <p className="text-xs text-gray-500 mt-0.5">Safe range: 3.5-5.0 mEq/L</p>
          </div>
          <div className="p-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={potassiumData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[3, 6.5]} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [`${v.toFixed(1)} mEq/L`, 'Potassium']} />
                <ReferenceLine y={3.5} stroke="#F59E0B" strokeDasharray="4 4" />
                <ReferenceLine y={5.0} stroke="#F59E0B" strokeDasharray="4 4" />
                <ReferenceLine y={5.5} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'Danger', position: 'right', fontSize: 10, fill: '#EF4444' }} />
                <Line type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4, fill: '#F59E0B', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Calcium / Phosphorus dual line */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Calcium / Phosphorus</h3>
            <p className="text-xs text-gray-500 mt-0.5">Last 12 months</p>
          </div>
          <div className="p-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={calciumPhosData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Line type="monotone" dataKey="calcium" name="Calcium" stroke="#0A75BB" strokeWidth={2} dot={{ r: 3, fill: '#0A75BB', stroke: '#fff', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="phosphorus" name="Phosphorus" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3, fill: '#F59E0B', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weight Trend */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Weight Trend</h3>
            <p className="text-xs text-gray-500 mt-0.5">Last 12 months</p>
          </div>
          <div className="p-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[62, 72]} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [`${v.toFixed(1)} kg`, 'Weight']} />
                <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2.5} fill="url(#weightGrad)" dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Risk Calculator + Current Treatment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Risk Calculator */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="font-semibold text-gray-900">Risk Calculator</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-800">Kidney Failure Risk (2-year)</span>
                <span className="text-2xl font-bold text-red-700">72%</span>
              </div>
              <div className="w-full h-2 bg-red-200 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '72%' }} />
              </div>
              <p className="text-xs text-red-600 mt-2">High risk - Consider nephrology referral for renal replacement therapy counseling</p>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-amber-800">Cardiovascular Risk</span>
                <span className="text-2xl font-bold text-amber-700">58%</span>
              </div>
              <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '58%' }} />
              </div>
              <p className="text-xs text-amber-600 mt-2">Moderate risk - Optimize BP control and lipid management</p>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-orange-800">CKD Progression Risk</span>
                <span className="text-2xl font-bold text-orange-700">High</span>
              </div>
              <div className="w-full h-2 bg-orange-200 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: '85%' }} />
              </div>
              <p className="text-xs text-orange-600 mt-2">Declining eGFR trend - Intensify renoprotective therapy</p>
            </div>
          </div>
        </div>

        {/* Current Treatment */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary-500" />
            <h2 className="font-semibold text-gray-900">Current Treatment</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {/* Dialysis Status */}
            <div className="px-5 py-3 bg-amber-50/50">
              <div className="flex items-center gap-2 mb-1">
                <Droplets className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">Dialysis Status</span>
              </div>
              <p className="text-xs text-amber-700">Not yet initiated - Planned for eGFR &lt; 15 or symptomatic uremia</p>
            </div>

            {/* Active Medications */}
            <div className="px-5 py-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Active Medications</p>
              <div className="space-y-2">
                {activeMedications.map((med, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{med.name}</p>
                      <p className="text-xs text-gray-500">{med.frequency} | {med.route}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Appointment */}
            <div className="px-5 py-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-primary-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Next Appointment</span>
              </div>
              <p className="text-sm font-medium text-gray-900">10 Jul 2026, 10:30 AM</p>
              <p className="text-xs text-gray-500">Follow-up + Lab review</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
