'use client';

import { useState } from 'react';
import {
  Heart, Shield, Pill, Activity, Calendar, AlertTriangle,
  ChevronDown, TrendingUp, TrendingDown, FileText, CheckCircle2,
  XCircle, Clock, FlaskConical,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';

interface TransplantInfo {
  transplantDate: string;
  donorType: 'Living' | 'Deceased';
  donorRelation: string;
  aboCompatibility: string;
  hlaTyping: string;
  crossmatchResult: string;
  dsaStatus: string;
  coldIschemiaTime: string;
}

interface Immunosuppressant {
  name: string;
  dose: string;
  frequency: string;
  level: string;
  targetRange: string;
  status: 'therapeutic' | 'sub-therapeutic' | 'supra-therapeutic';
  lastChecked: string;
}

interface RejectionEpisode {
  date: string;
  type: string;
  severity: string;
  treatment: string;
  outcome: string;
}

interface BiopsyResult {
  date: string;
  indication: string;
  findings: string;
  banffScore: string;
}

const transplantInfo: TransplantInfo = {
  transplantDate: '2024-03-15',
  donorType: 'Living',
  donorRelation: 'Father',
  aboCompatibility: 'Compatible (A→A)',
  hlaTyping: 'A2, A32; B44, B62; DR4, DR13',
  crossmatchResult: 'Negative',
  dsaStatus: 'No DSA detected',
  coldIschemiaTime: '45 minutes',
};

const immunosuppressants: Immunosuppressant[] = [
  { name: 'Tacrolimus (Prograf)', dose: '2mg', frequency: 'BD (8AM, 8PM)', level: '8.2', targetRange: '5-10 ng/mL', status: 'therapeutic', lastChecked: '2026-06-22' },
  { name: 'Mycophenolate (CellCept)', dose: '500mg', frequency: 'BD', level: '—', targetRange: '—', status: 'therapeutic', lastChecked: '—' },
  { name: 'Prednisolone', dose: '5mg', frequency: 'Once daily (morning)', level: '—', targetRange: '—', status: 'therapeutic', lastChecked: '—' },
  { name: 'TMP-SMX (Prophylaxis)', dose: '480mg', frequency: 'Once daily', level: '—', targetRange: '—', status: 'therapeutic', lastChecked: '—' },
  { name: 'Valganciclovir', dose: '450mg', frequency: 'Once daily', level: '—', targetRange: '—', status: 'therapeutic', lastChecked: '—' },
];

const rejectionEpisodes: RejectionEpisode[] = [
  { date: '2024-06-10', type: 'Acute TCMR', severity: 'Grade IA', treatment: 'Pulse steroids (500mg x 3)', outcome: 'Complete resolution' },
  { date: '2025-01-22', type: 'Borderline changes', severity: 'Banff borderline', treatment: 'Optimized immunosuppression', outcome: 'Stable, no treatment needed' },
];

const biopsyResults: BiopsyResult[] = [
  { date: '2026-04-15', indication: 'Protocol 1-year biopsy', findings: 'Mild IFTA (10%), no active rejection, no C4d deposition', banffScore: 'cv1, ct1, ci1' },
  { date: '2024-06-12', indication: 'Rising creatinine', findings: 'TCMR Grade IA - lymphocytic tubulitis, mild interstitial inflammation', banffScore: 'ti1, t1, i1, v0' },
];

const gfrPostTransplant = [
  { month: 'M0', value: 62 },
  { month: 'M1', value: 58 },
  { month: 'M3', value: 55 },
  { month: 'M6', value: 52 },
  { month: 'M9', value: 50 },
  { month: 'Y1', value: 48 },
  { month: 'Y1.5', value: 46 },
  { month: 'Y2', value: 45 },
];

const labHistory = [
  { date: '2026-06-20', creatinine: '1.42', egfr: '45', tacrolimus: '8.2', cyclosporine: '—', wbc: '5.8', hb: '11.2', glucose: '98' },
  { date: '2026-05-18', creatinine: '1.38', egfr: '46', tacrolimus: '7.8', cyclosporine: '—', wbc: '6.1', hb: '11.0', glucose: '95' },
  { date: '2026-04-15', creatinine: '1.35', egfr: '47', tacrolimus: '8.5', cyclosporine: '—', wbc: '5.5', hb: '10.8', glucose: '102' },
  { date: '2026-03-10', creatinine: '1.30', egfr: '48', tacrolimus: '9.1', cyclosporine: '—', wbc: '5.9', hb: '11.5', glucose: '92' },
  { date: '2026-02-05', creatinine: '1.28', egfr: '49', tacrolimus: '7.5', cyclosporine: '—', wbc: '6.3', hb: '11.8', glucose: '88' },
  { date: '2026-01-08', creatinine: '1.25', egfr: '50', tacrolimus: '8.8', cyclosporine: '—', wbc: '5.7', hb: '12.0', glucose: '90' },
];

const chartTooltipStyle = {
  backgroundColor: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '13px',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
};

const statusBadge: Record<string, { bg: string; text: string }> = {
  therapeutic: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
  'sub-therapeutic': { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
  'supra-therapeutic': { bg: 'bg-red-50 border-red-200', text: 'text-red-700' },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function TransplantPage() {
  const [selectedPatient, setSelectedPatient] = useState('Ramesh Kumar');
  const [patientDropdownOpen, setPatientDropdownOpen] = useState(false);

  const yearsPostTransplant = ((Date.now() - new Date(transplantInfo.transplantDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)).toFixed(1);

  return (
    <div className="space-y-5 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <Heart className="h-6 w-6 text-emerald-600" />
            </div>
            Transplant Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Kidney transplant post-operative monitoring</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setPatientDropdownOpen(!patientDropdownOpen)}
            className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors min-w-[220px]"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-semibold text-emerald-700 shrink-0">RK</div>
            <div className="flex-1 text-left min-w-0">
              <p className="font-medium text-gray-900 truncate">{selectedPatient}</p>
              <p className="text-[11px] text-gray-500">Transplanted {formatDate(transplantInfo.transplantDate)}</p>
            </div>
            <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', patientDropdownOpen && 'rotate-180')} />
          </button>
        </div>
      </div>

      {/* Transplant Info */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-500" />
            <h2 className="font-semibold text-gray-900">Transplant Information</h2>
          </div>
          <span className="text-xs text-gray-500 font-medium">{yearsPostTransplant} years post-transplant</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Transplant Date</p>
              <p className="text-sm font-semibold text-gray-900">{formatDate(transplantInfo.transplantDate)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Donor Type</p>
              <p className="text-sm font-semibold text-gray-900">{transplantInfo.donorType}</p>
              <p className="text-xs text-gray-500">{transplantInfo.donorRelation}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">ABO Compatibility</p>
              <p className="text-sm font-semibold text-gray-900">{transplantInfo.aboCompatibility}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Crossmatch</p>
              <p className="text-sm font-semibold text-emerald-700">{transplantInfo.crossmatchResult}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">DSA Status</p>
              <p className="text-sm font-semibold text-emerald-700">{transplantInfo.dsaStatus}</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-xs font-medium text-blue-800 mb-1">HLA Typing</p>
            <p className="text-sm text-blue-900 font-mono">{transplantInfo.hlaTyping}</p>
          </div>
        </div>
      </div>

      {/* Immunosuppressants */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Pill className="h-5 w-5 text-purple-500" />
          <h2 className="font-semibold text-gray-900">Immunosuppressant Medications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Medicine</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dose</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Frequency</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Level</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Target Range</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Checked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {immunosuppressants.map((med, i) => {
                const st = statusBadge[med.status];
                return (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-medium text-gray-900">{med.name}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-700">{med.dose}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-600">{med.frequency}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-sm font-semibold text-gray-900">{med.level}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-gray-500">{med.targetRange}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', st.bg, st.text)}>
                        {med.status === 'therapeutic' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                        {med.status.charAt(0).toUpperCase() + med.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-gray-500">{med.lastChecked === '—' ? '—' : formatDate(med.lastChecked)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monitoring Timeline + GFR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Rejection & Infection Timeline */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            <h2 className="font-semibold text-gray-900">Rejection Episodes</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {rejectionEpisodes.map((episode, i) => (
              <div key={i} className="px-5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{episode.type}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Severity: {episode.severity}</p>
                    <p className="text-xs text-gray-500">Treatment: {episode.treatment}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">{episode.outcome}</span>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(episode.date)}</p>
                  </div>
                </div>
              </div>
            ))}
            {rejectionEpisodes.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-gray-500">No rejection episodes recorded</div>
            )}
          </div>
        </div>

        {/* GFR Trend Post-Transplant */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">GFR Trend Post-Transplant</h3>
          </div>
          <div className="p-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gfrPostTransplant} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[30, 70]} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [`${v} mL/min`, 'eGFR']} />
                <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Biopsy Results */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-blue-500" />
          <h2 className="font-semibold text-gray-900">Biopsy Results</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {biopsyResults.map((biopsy, i) => (
            <div key={i} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{biopsy.indication}</p>
                  <p className="text-xs text-gray-600 mt-1">{biopsy.findings}</p>
                  <p className="text-xs text-gray-500 mt-1 font-mono">Banff: {biopsy.banffScore}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{formatDate(biopsy.date)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post-Transplant Labs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary-500" />
          <h2 className="font-semibold text-gray-900">Post-Transplant Labs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Creatinine</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">eGFR</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tacrolimus</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">WBC</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hb</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Glucose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {labHistory.map((lab, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900">{formatDate(lab.date)}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">{lab.creatinine}</td>
                  <td className={cn('px-4 py-3 text-sm text-right font-medium', Number(lab.egfr) < 45 ? 'text-amber-600' : 'text-emerald-600')}>{lab.egfr}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">{lab.tacrolimus}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">{lab.wbc}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">{lab.hb}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">{lab.glucose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
