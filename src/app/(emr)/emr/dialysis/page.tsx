'use client';

import { useState, useMemo } from 'react';
import {
  Droplets, Plus, Search, Clock, AlertTriangle, CheckCircle2,
  ChevronDown, Activity, Thermometer, Heart, Scale, FileText,
  TrendingUp, TrendingDown, Calendar,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { cn } from '@/lib/utils';

type SessionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'COMPLICATED';

interface DialysisSession {
  id: string;
  date: string;
  sessionNumber: number;
  duration: number;
  ufVolume: number;
  complications: string | null;
  ktv: number;
  notes: string;
  status: SessionStatus;
  dryWeight: number;
  targetWeight: number;
  preWeight: number;
  postWeight: number;
  preBP: string;
  postBP: string;
  accessType: string;
  startTime: string;
  elapsedTime: string;
}

const statusConfig: Record<SessionStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  COMPLETED: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  IN_PROGRESS: { label: 'In Progress', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: <Clock className="h-3.5 w-3.5" /> },
  COMPLICATED: { label: 'Complicated', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
};

const sessionHistory: DialysisSession[] = [
  { id: 'DS-001', date: '2026-06-25', sessionNumber: 142, duration: 240, ufVolume: 2800, complications: null, ktv: 1.3, notes: 'Uneventful session', status: 'IN_PROGRESS', dryWeight: 65, targetWeight: 64, preWeight: 67.2, postWeight: 64.4, preBP: '158/92', postBP: '132/80', accessType: 'AV Fistula - Left Forearm', startTime: '06:00 AM', elapsedTime: '2h 15m' },
  { id: 'DS-002', date: '2026-06-23', sessionNumber: 141, duration: 240, ufVolume: 3100, complications: 'Hypotension at 3h mark', ktv: 1.25, notes: 'BP dropped to 80/50, UF reduced, recovered', status: 'COMPLICATED', dryWeight: 65, targetWeight: 64, preWeight: 67.8, postWeight: 64.7, preBP: '162/95', postBP: '118/72', accessType: 'AV Fistula - Left Forearm', startTime: '06:00 AM', elapsedTime: '-' },
  { id: 'DS-003', date: '2026-06-20', sessionNumber: 140, duration: 240, ufVolume: 2600, complications: null, ktv: 1.35, notes: 'Routine session, good flows', status: 'COMPLETED', dryWeight: 65, targetWeight: 64.5, preWeight: 66.9, postWeight: 64.3, preBP: '155/88', postBP: '128/78', accessType: 'AV Fistula - Left Forearm', startTime: '06:00 AM', elapsedTime: '-' },
  { id: 'DS-004', date: '2026-06-18', sessionNumber: 139, duration: 240, ufVolume: 2900, complications: null, ktv: 1.28, notes: 'Patient complained of cramps in last hour', status: 'COMPLETED', dryWeight: 65, targetWeight: 64.5, preWeight: 67.5, postWeight: 64.6, preBP: '160/90', postBP: '130/82', accessType: 'AV Fistula - Left Forearm', startTime: '06:00 AM', elapsedTime: '-' },
  { id: 'DS-005', date: '2026-06-16', sessionNumber: 138, duration: 240, ufVolume: 2700, complications: 'Access bleeding post session', ktv: 1.22, notes: 'Bleeding controlled with pressure, referred to vascular', status: 'COMPLICATED', dryWeight: 65, targetWeight: 64.5, preWeight: 67.1, postWeight: 64.4, preBP: '156/92', postBP: '126/76', accessType: 'AV Fistula - Left Forearm', startTime: '06:00 AM', elapsedTime: '-' },
  { id: 'DS-006', date: '2026-06-13', sessionNumber: 137, duration: 240, ufVolume: 2500, complications: null, ktv: 1.32, notes: 'Smooth session', status: 'COMPLETED', dryWeight: 65, targetWeight: 64.5, preWeight: 66.8, postWeight: 64.3, preBP: '150/86', postBP: '125/75', accessType: 'AV Fistula - Left Forearm', startTime: '06:00 AM', elapsedTime: '-' },
];

const monthlyWeight = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  pre: 66 + Math.sin(i * 0.5) * 1.2,
  post: 64.5 + Math.sin(i * 0.5) * 0.8,
}));

const monthlyBP = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  systolic: 155 + Math.sin(i * 0.4) * 10,
  diastolic: 88 + Math.sin(i * 0.6) * 6,
}));

const chartTooltipStyle = {
  backgroundColor: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '13px',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
};

export default function DialysisPage() {
  const [activeTab, setActiveTab] = useState<'history' | 'new' | 'summary'>('history');
  const [showNewSession, setShowNewSession] = useState(false);

  const currentSession = sessionHistory[0];
  const completedSessions = sessionHistory.filter(s => s.status === 'COMPLETED');
  const avgKtv = completedSessions.length
    ? (completedSessions.reduce((a, s) => a + s.ktv, 0) / completedSessions.length).toFixed(2)
    : '0';
  const avgUf = completedSessions.length
    ? Math.round(completedSessions.reduce((a, s) => a + s.ufVolume, 0) / completedSessions.length)
    : 0;

  return (
    <div className="space-y-5 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Droplets className="h-6 w-6 text-blue-600" />
            </div>
            Dialysis Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Monitor and manage hemodialysis sessions</p>
        </div>
        <button
          onClick={() => setShowNewSession(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Session
        </button>
      </div>

      {/* Current Session Card */}
      {currentSession.status === 'IN_PROGRESS' && (
        <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-blue-100 bg-blue-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
              <h2 className="font-semibold text-blue-900">Current Session — #{currentSession.sessionNumber}</h2>
            </div>
            <span className="text-xs text-blue-600 font-medium">Started {currentSession.startTime}</span>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <p className="text-xs text-gray-500">Patient</p>
                <p className="text-sm font-semibold text-gray-900">Ramesh Kumar</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Access Type</p>
                <p className="text-sm font-medium text-gray-900">{currentSession.accessType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Dry Weight</p>
                <p className="text-sm font-medium text-gray-900">{currentSession.dryWeight} kg</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Target Weight</p>
                <p className="text-sm font-medium text-gray-900">{currentSession.targetWeight} kg</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">UF Goal</p>
                <p className="text-sm font-semibold text-blue-700">{currentSession.ufVolume} mL</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Elapsed Time</p>
                <p className="text-sm font-semibold text-blue-700">{currentSession.elapsedTime}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1 -mb-px overflow-x-auto">
          {[
            { id: 'history' as const, label: 'Session History', icon: <Clock className="h-4 w-4" /> },
            { id: 'new' as const, label: 'New Session', icon: <Plus className="h-4 w-4" /> },
            { id: 'summary' as const, label: 'Monthly Summary', icon: <TrendingUp className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); if (tab.id === 'new') setShowNewSession(true); }}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Session History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Session #</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">UF Volume</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kt/V</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Complications</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sessionHistory.map((session) => {
                  const sc = statusConfig[session.status];
                  return (
                    <tr key={session.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-gray-900">{session.date}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-mono text-gray-900">#{session.sessionNumber}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-gray-600">{session.duration} min</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-sm font-medium text-gray-900">{session.ufVolume.toLocaleString()} mL</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={cn('text-sm font-semibold', session.ktv >= 1.3 ? 'text-emerald-600' : 'text-amber-600')}>
                          {session.ktv}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {session.complications ? (
                          <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">{session.complications}</span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-gray-500 max-w-[200px] truncate block">{session.notes}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', sc.bg, sc.color)}>
                          {sc.icon}
                          {sc.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Session Form */}
      {showNewSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowNewSession(false); setActiveTab('history'); }} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">New Dialysis Session</h2>
              <button onClick={() => { setShowNewSession(false); setActiveTab('history'); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                <span className="sr-only">Close</span>
                <span className="text-lg">&times;</span>
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Pre-dialysis */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  Pre-Dialysis Assessment
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Weight (kg)</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="67.2" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Blood Pressure</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="158/92" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Pulse (bpm)</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="82" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Temperature (°F)</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="98.4" />
                  </div>
                </div>
              </div>

              {/* Access Inspection */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Access Site Inspection</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Access Type</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                      <option>AV Fistula</option>
                      <option>AV Graft</option>
                      <option>Tunnelled Catheter</option>
                      <option>Non-tunnelled Catheter</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Access Site</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="Left Forearm" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Inspection Notes</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="Good thrill, no erythema, no edema" />
                  </div>
                </div>
              </div>

              {/* Machine Parameters */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Machine Parameters</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Blood Flow Rate (mL/min)</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="300" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Dialysate Flow (mL/min)</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="500" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Anticoagulation</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                      <option>Heparin</option>
                      <option>Enoxaparin</option>
                      <option>None / Saline Flush</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Target UF (mL)</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="2800" />
                  </div>
                </div>
              </div>

              {/* Post-dialysis */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Post-Dialysis</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Weight (kg)</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="64.4" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Blood Pressure</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="128/78" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Pulse (bpm)</label>
                    <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="76" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Complications</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                      <option>None</option>
                      <option>Hypotension</option>
                      <option>Cramps</option>
                      <option>Nausea/Vomiting</option>
                      <option>Chest Pain</option>
                      <option>Access Bleeding</option>
                      <option>Fever/Chills</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Session Notes</label>
                <textarea className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" rows={3} placeholder="Session notes..." />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button onClick={() => { setShowNewSession(false); setActiveTab('history'); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors">Start Session</button>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Summary */}
      {activeTab === 'summary' && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Sessions', value: '12', sub: 'This Month', color: 'bg-blue-50 text-blue-700' },
              { label: 'Avg Kt/V', value: avgKtv, sub: 'Target: ≥1.2', color: 'bg-emerald-50 text-emerald-700' },
              { label: 'Avg UF Volume', value: `${avgUf.toLocaleString()} mL`, sub: 'Per Session', color: 'bg-purple-50 text-purple-700' },
              { label: 'Complications', value: '2', sub: 'This Month', color: 'bg-amber-50 text-amber-700' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className={cn('inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold mb-3', stat.color)}>{stat.label}</div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Weight Trend */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm">Weight Trend — Pre &amp; Post</h3>
              </div>
              <div className="p-4 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyWeight} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[62, 70]} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Line type="monotone" dataKey="pre" name="Pre-Dialysis" stroke="#0A75BB" strokeWidth={2} dot={{ r: 2, fill: '#0A75BB' }} />
                    <Line type="monotone" dataKey="post" name="Post-Dialysis" stroke="#10B981" strokeWidth={2} dot={{ r: 2, fill: '#10B981' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* BP Trend */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm">Blood Pressure Trend</h3>
              </div>
              <div className="p-4 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyBP} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="bpSysGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[60, 180]} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Area type="monotone" dataKey="systolic" name="Systolic" stroke="#EF4444" strokeWidth={2} fill="url(#bpSysGrad)" dot={false} />
                    <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="#0A75BB" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
