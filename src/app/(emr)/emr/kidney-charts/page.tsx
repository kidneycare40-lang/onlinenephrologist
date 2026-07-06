'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { RequirePermission } from '@/components/emr/RequirePermission';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, AreaChart, Area,
} from 'recharts';
import {
  Activity, TrendingUp, TrendingDown, Minus, Search,
  ChevronDown, ChevronUp, ArrowLeft,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { patientsApi } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

interface KidneyParam {
  date: string;
  creatinine?: number | null;
  blood_urea?: number | null;
  gfr?: number | null;
  potassium?: number | null;
  sodium?: number | null;
  calcium?: number | null;
  phosphorus?: number | null;
  hemoglobin?: number | null;
  albumin?: number | null;
  uric_acid?: number | null;
  pth?: number | null;
  vitamin_d?: number | null;
  bicarbonate?: number | null;
  cholesterol_total?: number | null;
}

interface KidneyChartData {
  data: KidneyParam[];
  summary: {
    creatinine: number | null;
    gfr: number | null;
    blood_urea: number | null;
    potassium: number | null;
    hemoglobin: number | null;
    albumin: number | null;
  } | null;
  total_records: number;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  uhid: string;
}

const PARAM_GROUPS = [
  {
    label: 'Kidney Function',
    color: '#0A75BB',
    params: [
      { key: 'creatinine', label: 'Creatinine', unit: 'mg/dL', refRange: '0.6-1.2', color: '#0A75BB' },
      { key: 'gfr', label: 'eGFR', unit: 'mL/min', refRange: '>60', color: '#059669' },
      { key: 'blood_urea', label: 'Blood Urea', unit: 'mg/dL', refRange: '15-40', color: '#7c3aed' },
    ],
  },
  {
    label: 'Electrolytes',
    color: '#f59e0b',
    params: [
      { key: 'potassium', label: 'Potassium', unit: 'mEq/L', refRange: '3.5-5.0', color: '#f59e0b' },
      { key: 'sodium', label: 'Sodium', unit: 'mEq/L', refRange: '136-145', color: '#ef4444' },
      { key: 'calcium', label: 'Calcium', unit: 'mg/dL', refRange: '8.5-10.5', color: '#8b5cf6' },
      { key: 'phosphorus', label: 'Phosphorus', unit: 'mg/dL', refRange: '2.5-4.5', color: '#ec4899' },
      { key: 'bicarbonate', label: 'Bicarbonate', unit: 'mEq/L', refRange: '22-28', color: '#14b8a6' },
    ],
  },
  {
    label: 'Metabolic & Blood',
    color: '#dc2626',
    params: [
      { key: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL', refRange: '12-16', color: '#dc2626' },
      { key: 'albumin', label: 'Albumin', unit: 'g/dL', refRange: '3.5-5.0', color: '#2563eb' },
      { key: 'uric_acid', label: 'Uric Acid', unit: 'mg/dL', refRange: '3.5-7.0', color: '#ea580c' },
      { key: 'pth', label: 'PTH', unit: 'pg/mL', refRange: '15-65', color: '#7c3aed' },
      { key: 'vitamin_d', label: 'Vitamin D', unit: 'ng/mL', refRange: '30-100', color: '#f97316' },
      { key: 'cholesterol_total', label: 'Cholesterol', unit: 'mg/dL', refRange: '<200', color: '#64748b' },
    ],
  },
];

function getTrend(values: { v: number }[]): 'up' | 'down' | 'stable' {
  if (values.length < 2) return 'stable';
  const recent = values.slice(-3);
  const avgRecent = recent.reduce((a, b) => a + b.v, 0) / recent.length;
  const older = values.slice(0, Math.max(1, values.length - 3));
  const avgOlder = older.reduce((a, b) => a + b.v, 0) / older.length;
  const pctChange = ((avgRecent - avgOlder) / avgOlder) * 100;
  if (pctChange > 10) return 'up';
  if (pctChange < -10) return 'down';
  return 'stable';
}

function isAbnormal(key: string, value: number): boolean {
  const ranges: Record<string, [number, number]> = {
    creatinine: [0.6, 1.2],
    gfr: [60, 200],
    blood_urea: [15, 40],
    potassium: [3.5, 5.0],
    sodium: [136, 145],
    calcium: [8.5, 10.5],
    phosphorus: [2.5, 4.5],
    hemoglobin: [12, 16],
    albumin: [3.5, 5.0],
    uric_acid: [3.5, 7.0],
    pth: [15, 65],
    vitamin_d: [30, 100],
    bicarbonate: [22, 28],
    cholesterol_total: [0, 200],
  };
  const [lo, hi] = ranges[key] || [0, 1000];
  return value < lo || value > hi;
}

export default function KidneyChartsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [chartData, setChartData] = useState<KidneyChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set([0, 1, 2]));

  useEffect(() => {
    patientsApi.list({ limit: '200' }).then((res) => {
      setPatients((res.data || []).map((p: any) => ({
        id: p.id,
        firstName: p.first_name,
        lastName: p.last_name,
        phone: p.phone,
        uhid: p.uhid,
      })));
    }).catch(() => {});
  }, []);

  const loadChartData = useCallback(async (patientId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/patients/${patientId}?view=kidney-chart`);
      if (res.ok) {
        const data = await res.json();
        setChartData(data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      loadChartData(selectedPatientId);
    }
  }, [selectedPatientId, loadChartData]);

  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients.slice(0, 50);
    const q = searchQuery.toLowerCase();
    return patients.filter((p) =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.uhid.toLowerCase().includes(q)
    ).slice(0, 50);
  }, [patients, searchQuery]);

  const chartRecords = useMemo(() => {
    if (!chartData?.data) return [];
    return chartData.data.map((row) => ({
      ...row,
      date: new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }),
      rawDate: row.date,
    }));
  }, [chartData]);

  const toggleGroup = (idx: number) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  return (
    <RequirePermission permission="reports">
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Kidney Parameter Trends</h1>
            <p className="text-sm text-gray-500">Track lab values over time for CKD monitoring</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">Select Patient</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName} (${selectedPatient.uhid})` : searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedPatientId('');
              setChartData(null);
              setShowPatientDropdown(true);
            }}
            onFocus={() => setShowPatientDropdown(true)}
            placeholder="Search by name, phone, or UHID..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30"
          />
          {showPatientDropdown && filteredPatients.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {filteredPatients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPatientId(p.id);
                    setSearchQuery('');
                    setShowPatientDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                >
                  <div className="text-sm font-medium text-gray-800">{p.firstName} {p.lastName}</div>
                  <div className="text-xs text-gray-500">{p.uhid} • {p.phone}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {!selectedPatientId && (
        <div className="text-center py-20 text-gray-400">
          <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Select a patient to view kidney parameter trends</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-20">
          <div className="h-8 w-8 border-3 border-[#0A75BB] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 mt-3">Loading chart data...</p>
        </div>
      )}

      {selectedPatientId && !loading && chartData && chartRecords.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No kidney parameter records found for this patient</p>
          <p className="text-xs text-gray-400 mt-1">Add records via Vitals section in consultation</p>
        </div>
      )}

      {chartData && chartRecords.length > 0 && (
        <>
          {chartData.summary && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {([
                { key: 'creatinine', label: 'Creatinine', unit: 'mg/dL', color: 'text-[#0A75BB]', bg: 'bg-blue-50', badHigh: 1.2 },
                { key: 'gfr', label: 'eGFR', unit: 'mL/min', color: 'text-emerald-600', bg: 'bg-emerald-50', badLow: 60 },
                { key: 'blood_urea', label: 'Urea', unit: 'mg/dL', color: 'text-purple-600', bg: 'bg-purple-50', badHigh: 40 },
                { key: 'potassium', label: 'K+', unit: 'mEq/L', color: 'text-amber-600', bg: 'bg-amber-50', badHigh: 5.0, badLow: 3.5 },
                { key: 'hemoglobin', label: 'Hb', unit: 'g/dL', color: 'text-red-600', bg: 'bg-red-50', badLow: 12 },
                { key: 'albumin', label: 'Albumin', unit: 'g/dL', color: 'text-blue-600', bg: 'bg-blue-50', badLow: 3.5 },
              ]).map(({ key, label, unit, color, bg, badHigh, badLow }) => {
                const val = (chartData.summary as any)?.[key];
                const isBad = val != null && ((badHigh && val > badHigh) || (badLow && val < badLow));
                return (
                  <div key={key} className={cn('rounded-lg p-3 border', bg, isBad ? 'border-red-300' : 'border-gray-100')}>
                    <div className="text-xs text-gray-500 mb-1">{label}</div>
                    <div className={cn('text-lg font-bold', isBad ? 'text-red-600' : color)}>
                      {val != null ? val : '-'}
                    </div>
                    <div className="text-[10px] text-gray-400">{unit}</div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-4">
            {PARAM_GROUPS.map((group, groupIdx) => (
              <div key={groupIdx} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleGroup(groupIdx)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }} />
                    <span className="text-sm font-semibold text-gray-800">{group.label}</span>
                    <span className="text-xs text-gray-400">({chartRecords.length} records)</span>
                  </div>
                  {expandedGroups.has(groupIdx) ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </button>

                {expandedGroups.has(groupIdx) && (
                  <div className="px-4 pb-4 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {group.params.map((param) => {
                        const paramData = chartRecords
                          .filter((r) => (r as any)[param.key] != null)
                          .map((r) => ({
                            date: r.date,
                            value: (r as any)[param.key] as number,
                          }));

                        if (paramData.length === 0) return null;

                        const chartPayload = paramData.map((d) => ({
                          date: d.date,
                          [param.key]: d.value,
                        }));

                        const values = paramData.map((d) => ({ v: d.value }));
                        const trend = getTrend(values);
                        const latest = paramData[paramData.length - 1]?.value;
                        const min = Math.min(...paramData.map((d) => d.value));
                        const max = Math.max(...paramData.map((d) => d.value));

                        return (
                          <div key={param.key} className="border border-gray-100 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="text-sm font-semibold text-gray-800">{param.label}</div>
                                <div className="text-[10px] text-gray-400">Ref: {param.refRange} {param.unit}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <div className="text-sm font-bold" style={{ color: param.color }}>{latest}</div>
                                  <div className="text-[10px] text-gray-400">
                                    {min !== max ? `${min} - ${max}` : '-'}
                                  </div>
                                </div>
                                <div className={cn(
                                  'p-1 rounded-full',
                                  trend === 'up' && 'bg-red-50',
                                  trend === 'down' && 'bg-green-50',
                                  trend === 'stable' && 'bg-gray-50',
                                )}>
                                  {trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-red-500" />}
                                  {trend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-green-500" />}
                                  {trend === 'stable' && <Minus className="h-3.5 w-3.5 text-gray-400" />}
                                </div>
                              </div>
                            </div>
                            <ResponsiveContainer width="100%" height={180}>
                              <LineChart data={chartPayload} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis
                                  dataKey="date"
                                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                                  interval="preserveStartEnd"
                                />
                                <YAxis
                                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                                  domain={['auto', 'auto']}
                                />
                                <Tooltip
                                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                                  formatter={(value: number) => [`${value} ${param.unit}`, param.label]}
                                />
                                <Line
                                  type="monotone"
                                  dataKey={param.key}
                                  stroke={param.color}
                                  strokeWidth={2}
                                  dot={{ r: 4, fill: param.color }}
                                  activeDot={{ r: 6 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center text-xs text-gray-400 py-4">
            {chartRecords.length} total records • Last updated: {chartRecords[chartRecords.length - 1]?.date}
          </div>
        </>
      )}
    </div>
    </RequirePermission>
  );
}
