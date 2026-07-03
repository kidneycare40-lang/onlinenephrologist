'use client';

import { useState, useMemo } from 'react';
import {
  Search, Plus, X, AlertTriangle, CheckCircle2, Activity,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart, Legend,
  ReferenceArea,
} from 'recharts';
import { cn, formatDate } from '@/lib/utils';
import { patients, labOrders } from '@/lib/data/emr-mock';
import type { EMRLabOrder } from '@/types/emr';
import { useClinic } from '@/lib/emr-clinic-context';

type Tab = 'tests' | 'trends';

const trendData = {
  p1: {
    creatinine: [
      { month: 'Jan', value: 6.2 }, { month: 'Feb', value: 6.8 }, { month: 'Mar', value: 7.2 },
      { month: 'Apr', value: 7.8 }, { month: 'May', value: 8.0 }, { month: 'Jun', value: 8.2 },
    ],
    egfr: [
      { month: 'Jan', value: 12 }, { month: 'Feb', value: 10 }, { month: 'Mar', value: 9 },
      { month: 'Apr', value: 8 }, { month: 'May', value: 7.5 }, { month: 'Jun', value: 7 },
    ],
    hemoglobin: [
      { month: 'Jan', value: 9.8 }, { month: 'Feb', value: 9.5 }, { month: 'Mar', value: 9.2 },
      { month: 'Apr', value: 8.9 }, { month: 'May', value: 8.6 }, { month: 'Jun', value: 8.4 },
    ],
    potassium: [
      { month: 'Jan', value: 4.8 }, { month: 'Feb', value: 5.0 }, { month: 'Mar', value: 5.1 },
      { month: 'Apr', value: 5.3 }, { month: 'May', value: 5.4 }, { month: 'Jun', value: 5.6 },
    ],
    albumin: [
      { month: 'Jan', value: 3.8 }, { month: 'Feb', value: 3.6 }, { month: 'Mar', value: 3.5 },
      { month: 'Apr', value: 3.4 }, { month: 'May', value: 3.3 }, { month: 'Jun', value: 3.2 },
    ],
    bp: [
      { month: 'Jan', systolic: 148, diastolic: 88 }, { month: 'Feb', systolic: 150, diastolic: 90 },
      { month: 'Mar', systolic: 152, diastolic: 92 }, { month: 'Apr', systolic: 155, diastolic: 93 },
      { month: 'May', systolic: 158, diastolic: 94 }, { month: 'Jun', systolic: 160, diastolic: 95 },
    ],
  },
  p2: {
    creatinine: [
      { month: 'Jan', value: 1.0 }, { month: 'Feb', value: 1.1 }, { month: 'Mar', value: 1.2 },
      { month: 'Apr', value: 1.3 }, { month: 'May', value: 1.35 }, { month: 'Jun', value: 1.4 },
    ],
    egfr: [
      { month: 'Jan', value: 85 }, { month: 'Feb', value: 80 }, { month: 'Mar', value: 72 },
      { month: 'Apr', value: 65 }, { month: 'May', value: 58 }, { month: 'Jun', value: 52 },
    ],
    hemoglobin: [
      { month: 'Jan', value: 13.2 }, { month: 'Feb', value: 13.0 }, { month: 'Mar', value: 12.9 },
      { month: 'Apr', value: 12.8 }, { month: 'May', value: 12.8 }, { month: 'Jun', value: 12.8 },
    ],
    potassium: [
      { month: 'Jan', value: 4.0 }, { month: 'Feb', value: 4.1 }, { month: 'Mar', value: 4.0 },
      { month: 'Apr', value: 4.2 }, { month: 'May', value: 4.1 }, { month: 'Jun', value: 4.2 },
    ],
    albumin: [
      { month: 'Jan', value: 4.2 }, { month: 'Feb', value: 4.1 }, { month: 'Mar', value: 4.0 },
      { month: 'Apr', value: 3.9 }, { month: 'May', value: 3.9 }, { month: 'Jun', value: 3.8 },
    ],
    bp: [
      { month: 'Jan', systolic: 122, diastolic: 78 }, { month: 'Feb', systolic: 124, diastolic: 78 },
      { month: 'Mar', systolic: 126, diastolic: 80 }, { month: 'Apr', systolic: 128, diastolic: 80 },
      { month: 'May', systolic: 126, diastolic: 78 }, { month: 'Jun', systolic: 128, diastolic: 78 },
    ],
  },
};

const chartTooltipStyle = { borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };

export default function LabPage() {
  const { clinicId } = useClinic();
  const [activeTab, setActiveTab] = useState<Tab>('tests');
  const [searchQuery, setSearchQuery] = useState('');

  const clinicPatients = clinicId ? patients.filter((p) => p.clinicId === clinicId) : [];
  const clinicPatientIds = new Set(clinicPatients.map((p) => p.id));
  const clinicLabOrders = clinicId ? labOrders.filter((o) => clinicPatientIds.has(o.patientId)) : [];
  const [selectedPatientId, setSelectedPatientId] = useState(clinicPatients[0]?.id || '');

  const patientOrders = useMemo(() => {
    return clinicLabOrders.filter((o) => o.patientId === selectedPatientId);
  }, [selectedPatientId, clinicLabOrders]);

  const filteredOrders = useMemo(() => {
    return patientOrders.filter((o) =>
      searchQuery === '' ||
      o.testName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [patientOrders, searchQuery]);

  const selectedPatient = clinicPatients.find((p) => p.id === selectedPatientId);
  const data = (trendData as Record<string, typeof trendData.p1>)[selectedPatientId] || trendData.p1;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'tests', label: 'Tests / Investigations' },
    { id: 'trends', label: 'Trends' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laboratory</h1>
          <p className="text-sm text-gray-500 mt-1">Manage investigations and view lab trends</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A75BB] text-white rounded-lg text-sm font-medium hover:bg-[#085a94] transition-colors">
          <Plus className="h-4 w-4" />
          New Investigation
        </button>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex gap-1 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-[#0A75BB] text-[#0A75BB]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Patient:</label>
        <select
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 min-w-[200px]"
        >
          {clinicPatients.map((p) => (
            <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
          ))}
        </select>
        {selectedPatient && (
          <span className="text-sm text-gray-500">
            UHID: <span className="font-medium text-gray-700">{selectedPatient.uhid}</span>
          </span>
        )}
      </div>

      {activeTab === 'tests' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tests..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20"
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tests / Investigations</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Units</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">2026-06-05</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-[#0A75BB]/5">Today</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ref. Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.map((order, idx) =>
                    order.results?.map((result, ri) => (
                      <tr key={`${order.id}-${ri}`} className={cn('hover:bg-gray-50/50 transition-colors', result.isAbnormal && 'bg-red-50/30')}>
                        <td className="px-4 py-3 text-sm text-gray-400">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <span className={cn('text-sm font-medium', result.isAbnormal ? 'text-red-700' : 'text-gray-900')}>
                            {result.testName}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{result.unit}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-500">—</td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn('text-sm font-semibold', result.isAbnormal ? 'text-red-600' : 'text-gray-900')}>
                            {result.value}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-500">{result.referenceRange}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {filteredOrders.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                <p className="text-sm">No tests found for this patient</p>
              </div>
            )}
          </div>
          <div className="flex justify-center">
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0A75BB] bg-[#0A75BB]/5 rounded-lg hover:bg-[#0A75BB]/10 transition-colors border border-[#0A75BB]/20">
              <Plus className="h-4 w-4" />
              Add Investigation
            </button>
          </div>
          <div className="text-center">
            <button className="text-sm font-medium text-[#0A75BB] hover:underline">View All Tests</button>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Creatinine Trend</h3>
                <p className="text-xs text-gray-500 mt-0.5">Last 6 months</p>
              </div>
              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">Rising</span>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.creatinine}>
                  <defs>
                    <linearGradient id="crGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <ReferenceArea y1={0} y2={1.2} fill="#D1FAE5" fillOpacity={0.3} />
                  <ReferenceLine y={1.2} stroke="#10B981" strokeDasharray="3 3" label={{ value: 'Normal', position: 'right', fontSize: 10, fill: '#10B981' }} />
                  <Area type="monotone" dataKey="value" stroke="#EF4444" strokeWidth={2} fill="url(#crGrad)" dot={{ r: 3, fill: '#EF4444' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">eGFR Trend</h3>
                <p className="text-xs text-gray-500 mt-0.5">Last 6 months</p>
              </div>
              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">Declining</span>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.egfr}>
                  <defs>
                    <linearGradient id="egGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <ReferenceLine y={60} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: 'Stage 3', position: 'right', fontSize: 10, fill: '#F59E0B' }} />
                  <ReferenceLine y={30} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'Stage 4', position: 'right', fontSize: 10, fill: '#EF4444' }} />
                  <ReferenceLine y={15} stroke="#7C2D12" strokeDasharray="3 3" label={{ value: 'Stage 5', position: 'right', fontSize: 10, fill: '#7C2D12' }} />
                  <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} fill="url(#egGrad)" dot={{ r: 3, fill: '#10B981' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Hemoglobin Trend</h3>
                <p className="text-xs text-gray-500 mt-0.5">Last 6 months</p>
              </div>
              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Low</span>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.hemoglobin}>
                  <defs>
                    <linearGradient id="hbGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EC4899" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#EC4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" domain={[6, 16]} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <ReferenceArea y1={12} y2={16} fill="#D1FAE5" fillOpacity={0.3} />
                  <ReferenceLine y={12} stroke="#10B981" strokeDasharray="3 3" label={{ value: 'Normal', position: 'right', fontSize: 10, fill: '#10B981' }} />
                  <Area type="monotone" dataKey="value" stroke="#EC4899" strokeWidth={2} fill="url(#hbGrad)" dot={{ r: 3, fill: '#EC4899' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Potassium Trend</h3>
                <p className="text-xs text-gray-500 mt-0.5">Last 6 months</p>
              </div>
              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">Critical</span>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.potassium}>
                  <defs>
                    <linearGradient id="kGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" domain={[2, 7]} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <ReferenceArea y1={2} y2={3.5} fill="#FEE2E2" fillOpacity={0.3} />
                  <ReferenceArea y1={5.0} y2={7} fill="#FEE2E2" fillOpacity={0.3} />
                  <ReferenceArea y1={3.5} y2={5.0} fill="#D1FAE5" fillOpacity={0.1} />
                  <ReferenceLine y={3.5} stroke="#EF4444" strokeDasharray="3 3" />
                  <ReferenceLine y={5.0} stroke="#EF4444" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2} fill="url(#kGrad)" dot={{ r: 3, fill: '#F59E0B' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Albumin Trend</h3>
                <p className="text-xs text-gray-500 mt-0.5">Last 6 months</p>
              </div>
              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Declining</span>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.albumin}>
                  <defs>
                    <linearGradient id="albGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0A75BB" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0A75BB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" domain={[2.5, 5]} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <ReferenceArea y1={3.5} y2={5} fill="#D1FAE5" fillOpacity={0.15} />
                  <ReferenceLine y={3.5} stroke="#10B981" strokeDasharray="3 3" label={{ value: 'Normal', position: 'right', fontSize: 10, fill: '#10B981' }} />
                  <Area type="monotone" dataKey="value" stroke="#0A75BB" strokeWidth={2} fill="url(#albGrad)" dot={{ r: 3, fill: '#0A75BB' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Blood Pressure Trend</h3>
                <p className="text-xs text-gray-500 mt-0.5">Last 6 months</p>
              </div>
              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">Elevated</span>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.bp}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" domain={[60, 180]} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend />
                  <ReferenceArea y1={90} y2={180} fill="#FEE2E2" fillOpacity={0.1} />
                  <ReferenceLine y={140} stroke="#EF4444" strokeDasharray="3 3" />
                  <ReferenceLine y={90} stroke="#EF4444" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="systolic" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} name="Systolic" />
                  <Line type="monotone" dataKey="diastolic" stroke="#0A75BB" strokeWidth={2} dot={{ r: 3 }} name="Diastolic" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
