'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search, Filter, ChevronDown, ChevronUp, ChevronRight, Stethoscope,
  ClipboardList, FlaskConical, Building2, Activity, ArrowRight,
  CalendarClock, Scan, Scissors, Calendar, User, Phone, Pill,
  AlertCircle, Clock, X, RefreshCw,
} from 'lucide-react';
import { cn, formatDate, getInitials } from '@/lib/utils';
import { timeline, patientSummaries, prescriptions } from '@/lib/data/emr-mock';
import { patientsApi } from '@/lib/api-client';
import type { TimelineEvent, TimelineEventType } from '@/types/emr';

const eventConfig: Record<TimelineEventType, { color: string; bgColor: string; borderColor: string; icon: typeof Stethoscope; label: string }> = {
  opd_visit: { color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', icon: Stethoscope, label: 'OPD Visit' },
  prescription: { color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', icon: ClipboardList, label: 'Prescription' },
  lab_result: { color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200', icon: FlaskConical, label: 'Lab Result' },
  admission: { color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200', icon: Building2, label: 'Admission' },
  dialysis: { color: 'text-teal-600', bgColor: 'bg-teal-50', borderColor: 'border-teal-200', icon: Activity, label: 'Dialysis' },
  discharge: { color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', icon: ArrowRight, label: 'Discharge' },
  follow_up: { color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', icon: CalendarClock, label: 'Follow-up' },
  radiology: { color: 'text-cyan-600', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200', icon: Scan, label: 'Radiology' },
  procedure: { color: 'text-pink-600', bgColor: 'bg-pink-50', borderColor: 'border-pink-200', icon: Scissors, label: 'Procedure' },
};

const allEventTypes: TimelineEventType[] = ['opd_visit', 'prescription', 'lab_result', 'admission', 'dialysis', 'discharge', 'follow_up'];

function groupByYear(events: TimelineEvent[]): { label: string; events: TimelineEvent[] }[] {
  const groups: { label: string; events: TimelineEvent[] }[] = [];
  let currentYear = '';
  events.forEach((event) => {
    const d = new Date(event.date);
    const year = String(d.getFullYear());
    if (year !== currentYear) {
      currentYear = year;
      groups.push({ label: year, events: [] });
    }
    groups[groups.length - 1].events.push(event);
  });
  return groups;
}

function mapApiEventToTimeline(apiEvent: any): TimelineEvent {
  const typeMap: Record<string, TimelineEventType> = {
    consultation: 'opd_visit',
    prescription: 'prescription',
    investigation: 'lab_result',
    vitals: 'lab_result',
    kidney_params: 'lab_result',
    appointment: 'follow_up',
    invoice: 'opd_visit',
    dialysis: 'dialysis',
    report: 'lab_result',
  };

  const type = typeMap[apiEvent.type] || 'opd_visit';

  return {
    id: apiEvent.id,
    patientId: apiEvent.patientId || '',
    type,
    date: apiEvent.date || '',
    time: apiEvent.time || '',
    title: apiEvent.title || '',
    description: apiEvent.description || '',
    details: apiEvent.details || '',
    doctorName: apiEvent.doctor || '',
    clinicId: apiEvent.clinic || '',
    medications: apiEvent.medications || [],
  };
}

export default function TimelinePage({ params }: { params: { patientId: string } }) {
  const patientId = params.patientId;
  const patient = useMemo(() => patientSummaries.find((p) => p.id === patientId) || patientSummaries[0], [patientId]);
  const [typeFilters, setTypeFilters] = useState<TimelineEventType[]>([...allEventTypes]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [apiEvents, setApiEvents] = useState<TimelineEvent[] | null>(null);
  const [kidneyData, setKidneyData] = useState<any[]>([]);
  const [showChart, setShowChart] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [timelineRes, kidneyRes] = await Promise.all([
        fetch(`/api/patients/${patientId}?view=timeline`).then(r => r.ok ? r.json() : []),
        fetch(`/api/patients/${patientId}?view=kidney-chart`).then(r => r.ok ? r.json() : []),
      ]);

      if (Array.isArray(timelineRes) && timelineRes.length > 0) {
        setApiEvents(timelineRes.map(mapApiEventToTimeline));
      }
      if (Array.isArray(kidneyRes?.data)) {
        setKidneyData(kidneyRes.data);
      }
    } catch {
      // Fall through to mock data
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleType = (type: TimelineEventType) => {
    setTypeFilters((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
  };

  const toggleExpand = (id: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const mockEvents = useMemo(() => {
    return timeline
      .filter((e) => e.patientId === patient.id)
      .filter((e) => typeFilters.includes(e.type))
      .filter((e) => searchQuery === '' || e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.description.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        const dA = new Date(`${a.date}T${a.time || '00:00'}`);
        const dB = new Date(`${b.date}T${b.time || '00:00'}`);
        return dB.getTime() - dA.getTime();
      });
  }, [patient, typeFilters, searchQuery]);

  const filteredEvents = useMemo(() => {
    const events = apiEvents || mockEvents;
    return events
      .filter((e) => typeFilters.includes(e.type))
      .filter((e) => searchQuery === '' || e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.description.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        const dA = new Date(`${a.date}T${a.time || '00:00'}`);
        const dB = new Date(`${b.date}T${b.time || '00:00'}`);
        return dB.getTime() - dA.getTime();
      });
  }, [apiEvents, mockEvents, typeFilters, searchQuery]);

  const groupedEvents = useMemo(() => groupByYear(filteredEvents), [filteredEvents]);
  const patientRx = useMemo(() => prescriptions.filter((p) => p.patientId === patient.id && p.status === 'Active'), [patient]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#0A75BB]/10 flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-[#0A75BB]">{getInitials(patient.name)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{patient.name}</h1>
              <span className="px-2 py-0.5 bg-[#0A75BB]/5 text-[#0A75BB] text-xs font-medium rounded-md border border-[#0A75BB]/20">{patient.uhid}</span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
              <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5" />{patient.age}y, {patient.gender}</span>
              <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{patient.phone}</span>
            </div>
          </div>
          <div className="flex gap-4 sm:gap-6 text-center">
            <div><p className="text-2xl font-bold text-gray-900">{patient.totalVisits}</p><p className="text-xs text-gray-500">Total Visits</p></div>
            <div><p className="text-sm font-semibold text-gray-900">{formatDate(patient.firstVisit)}</p><p className="text-xs text-gray-500">First Visit</p></div>
            <div><p className="text-sm font-semibold text-gray-900">{formatDate(patient.lastVisit)}</p><p className="text-xs text-gray-500">Last Visit</p></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search events..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20" />
                {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>}
              </div>
              <button onClick={() => setShowFilters(!showFilters)}
                className={cn('inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors',
                  showFilters ? 'bg-[#0A75BB]/5 border-[#0A75BB]/20 text-[#0A75BB]' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50')}>
                <Filter className="h-4 w-4" />Event Types
              </button>
              {kidneyData.length > 0 && (
                <button onClick={() => setShowChart(!showChart)}
                  className={cn('inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors',
                    showChart ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50')}>
                  <Activity className="h-4 w-4" />Kidney Trends
                </button>
              )}
              <button onClick={loadData} className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Refresh">
                <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
              </button>
            </div>
            {showFilters && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                {allEventTypes.map((type) => {
                  const cfg = eventConfig[type];
                  const isActive = typeFilters.includes(type);
                  return (
                    <button key={type} onClick={() => toggleType(type)}
                      className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                        isActive ? `${cfg.bgColor} ${cfg.color} ${cfg.borderColor}` : 'bg-gray-50 text-gray-400 border-gray-200')}>
                      <cfg.icon className="h-3.5 w-3.5" />{cfg.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {showChart && kidneyData.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2"><Activity className="h-4 w-4 text-purple-500" />Kidney Parameter Trends</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'creatinine', label: 'Creatinine', unit: 'mg/dL', color: '#ef4444', normal: '< 1.3' },
                  { key: 'gfr', label: 'eGFR', unit: 'mL/min', color: '#3b82f6', normal: '> 60' },
                  { key: 'bun', label: 'BUN', unit: 'mg/dL', color: '#f59e0b', normal: '7-20' },
                  { key: 'potassium', label: 'Potassium', unit: 'mEq/L', color: '#8b5cf6', normal: '3.5-5.0' },
                ].map(({ key, label, unit, color, normal }) => {
                  const points = kidneyData
                    .filter((d: any) => d[key] != null)
                    .map((d: any) => ({ date: d.date, value: d[key] }))
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                  if (points.length === 0) return null;

                  const values = points.map((p) => p.value);
                  const minVal = Math.min(...values) * 0.8;
                  const maxVal = Math.max(...values) * 1.2;
                  const range = maxVal - minVal || 1;

                  return (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-gray-700">{label}</span>
                        <span className="text-[10px] text-gray-400">Normal: {normal}</span>
                      </div>
                      <div className="flex items-end gap-1 h-20">
                        {points.slice(-10).map((p, i) => {
                          const height = ((p.value - minVal) / range) * 100;
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group">
                              <span className="text-[9px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">{p.value}</span>
                              <div className="w-full rounded-t" style={{ height: `${Math.max(height, 4)}%`, backgroundColor: color, opacity: 0.8 }} />
                              <span className="text-[8px] text-gray-400">{new Date(p.date).toLocaleDateString('en', { month: 'short' })}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-1 text-[10px] text-gray-400 text-center">{points.length} records &middot; Latest: {points[points.length - 1].value} {unit}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="relative">
            {groupedEvents.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">{loading ? 'Loading timeline...' : 'No events found'}</p>
              </div>
            ) : (
              <div className="space-y-8">
                {groupedEvents.map((group) => (
                  <div key={group.label}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full border border-gray-200">{group.label}</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                    <div className="relative pl-6 sm:pl-8">
                      <div className="absolute left-[11px] sm:left-[15px] top-0 bottom-0 w-0.5 bg-gray-200" />
                      <div className="space-y-4">
                        {group.events.map((event) => {
                          const cfg = eventConfig[event.type];
                          const Icon = cfg.icon;
                          const isExpanded = expandedEvents.has(event.id);
                          return (
                            <div key={event.id} className="relative">
                              <div className={cn('absolute -left-6 sm:-left-8 top-5 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white flex items-center justify-center z-10', cfg.bgColor)}
                                style={{ transform: 'translateX(-50%)', left: '12px' }}>
                                <Icon className={cn('h-2.5 w-2.5 sm:h-3 sm:w-3', cfg.color)} />
                              </div>
                              <div className={cn('ml-4 sm:ml-6 bg-white rounded-xl border p-4 hover:shadow-md transition-all', cfg.borderColor)}>
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>{formatDate(event.date)}</span>
                                    {event.time && <span className="text-gray-400">{event.time}</span>}
                                  </div>
                                  <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border', cfg.bgColor, cfg.color, cfg.borderColor)}>
                                    <Icon className="h-3 w-3" />{cfg.label}
                                  </span>
                                </div>
                                <h3 className="font-semibold text-gray-900">{event.title}</h3>
                                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{event.description}</p>
                                {event.doctorName && <p className="text-xs text-gray-400 mt-2"><Stethoscope className="h-3 w-3 inline mr-1" />{event.doctorName}</p>}
                                {event.medications && event.medications.length > 0 && (
                                  <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                                    <p className="text-xs font-semibold text-emerald-700 mb-1.5"><Pill className="h-3 w-3 inline mr-1" />Medications</p>
                                    <div className="space-y-1">
                                      {event.medications.slice(0, isExpanded ? undefined : 2).map((med, i) => (
                                        <p key={i} className="text-xs text-emerald-800"><strong>{med.name}</strong> {med.dosage} - {med.frequency}</p>
                                      ))}
                                    </div>
                                    {!isExpanded && event.medications.length > 2 && <p className="text-xs text-emerald-500 mt-1">+{event.medications.length - 2} more</p>}
                                  </div>
                                )}
                                {event.details && (
                                  <>
                                    <button onClick={() => toggleExpand(event.id)} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#0A75BB] hover:underline">
                                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                      {isExpanded ? 'Less' : 'More details'}
                                    </button>
                                    {isExpanded && <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100"><p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{event.details}</p></div>}
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><Calendar className="h-4 w-4 text-[#0A75BB]" />Key Milestones</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5"><div className="w-2 h-2 rounded-full bg-[#0A75BB] mt-1.5 shrink-0" /><div><p className="text-sm font-medium text-gray-900">First Visit</p><p className="text-xs text-gray-500">{formatDate(patient.firstVisit)}</p></div></div>
              <div className="flex items-start gap-2.5"><div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" /><div><p className="text-sm font-medium text-gray-900">Last Visit</p><p className="text-xs text-gray-500">{formatDate(patient.lastVisit)}</p></div></div>
              {patient.activeConditions.length > 0 && <div className="flex items-start gap-2.5"><div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" /><div><p className="text-sm font-medium text-gray-900">Primary Diagnosis</p><p className="text-xs text-gray-500">{patient.activeConditions[0]}</p></div></div>}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><AlertCircle className="h-4 w-4 text-amber-500" />Active Conditions</h3>
            <div className="space-y-1.5">
              {patient.activeConditions.map((c, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-sm text-amber-900 font-medium">{c}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><Pill className="h-4 w-4 text-emerald-500" />Current Medications</h3>
            <div className="space-y-1.5">
              {patient.currentMedications.length > 0 ? patient.currentMedications.map((med, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
                  <Pill className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span className="text-sm text-emerald-900">{med}</span>
                </div>
              )) : <p className="text-sm text-gray-400 italic">No active medications</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
