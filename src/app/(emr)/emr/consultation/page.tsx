'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { RequirePermission } from '@/components/emr/RequirePermission';
import { Search, Play, Eye, Phone, CreditCard, Trash2 } from 'lucide-react';
import { cn, calculateAge } from '@/lib/utils';
import { todayAppointments, patients, consultations } from '@/lib/data/emr-mock';
import { useClinic } from '@/lib/emr-clinic-context';
import { EMRPatient, EMRConsultation } from '@/types/emr';
import { deleteOnlineBooking } from '@/lib/emr-delete';

type StatusFilter = 'ALL' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';

const statusConfig: Record<string, { label: string; color: string }> = {
  WAITING: { label: 'Waiting', color: 'bg-amber-100 text-amber-700' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  COMPLETED: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700' },
  CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500' },
};

interface OnlineBooking {
  bookingId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  age: string;
  gender: string;
  consultationType: string;
  clinicId: string;
  date: string;
  time: string;
  reason: string;
  createdAt: string;
  status: string;
  consultationFee: number;
  paymentStatus?: string;
}

export default function ConsultationListPage() {
  const { clinicId } = useClinic();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [addedPatients, setAddedPatients] = useState<EMRPatient[]>([]);
  const [onlineBookings, setOnlineBookings] = useState<OnlineBooking[]>([]);
  const [savedConsultations, setSavedConsultations] = useState<EMRConsultation[]>([]);
  const [deleteBookingId, setDeleteBookingId] = useState<string | null>(null);

  useEffect(() => {
    try {
      setAddedPatients(JSON.parse(localStorage.getItem('emr_added_patients') || '[]'));
    } catch { /* ignore */ }
    try {
      setOnlineBookings(JSON.parse(localStorage.getItem('emr_bookings') || '[]'));
    } catch { /* ignore */ }
    try {
      const stored = JSON.parse(localStorage.getItem('emr_consultations') || '[]') as EMRConsultation[];
      const allPats = [...patients, ...JSON.parse(localStorage.getItem('emr_added_patients') || '[]') as EMRPatient[]];
      const phoneToPatient = new Map<string, EMRPatient>();
      for (const p of allPats) {
        if (p.phone) phoneToPatient.set(p.phone, p);
      }
      // Deduplicate by phone (if available) or patientId
      const byKey = new Map<string, EMRConsultation>();
      for (const sc of stored) {
        const pat = allPats.find((p) => p.id === sc.patientId);
        const key = pat?.phone || sc.patientId;
        const existing = byKey.get(key);
        if (!existing || ((sc as any).updatedAt || sc.date) > ((existing as any).updatedAt || existing.date)) {
          byKey.set(key, sc);
        }
      }
      const deduped = Array.from(byKey.values());
      if (deduped.length < stored.length) {
        localStorage.setItem('emr_consultations', JSON.stringify(deduped));
      }
      setSavedConsultations(deduped);
    } catch { /* ignore */ }
  }, []);

  const handleDeleteBooking = () => {
    if (!deleteBookingId) return;
    deleteOnlineBooking(deleteBookingId);
    setOnlineBookings((prev) => prev.filter((b) => b.bookingId !== deleteBookingId));
    setDeleteBookingId(null);
  };

  const allPatients = [...patients, ...addedPatients];
  const clinicPatients = clinicId ? allPatients.filter((p) => !p.clinicId || p.clinicId === clinicId) : allPatients;
  const clinicPatientIds = new Set(clinicPatients.map((p) => p.id));
  const clinicAppointments = clinicId ? todayAppointments.filter((a) => clinicPatientIds.has(a.patientId)) : [];

  // Deduplicate: keep only the latest consultation per phone (or patientId)
  const savedClinicConsultations = useMemo(() => {
    const byKey = new Map<string, EMRConsultation>();
    for (const sc of savedConsultations) {
      // Clinic filter
      if (clinicId && sc.clinicId && sc.clinicId !== clinicId) continue;
      const pat = allPatients.find((p) => p.id === sc.patientId);
      const key = pat?.phone || sc.patientId;
      const existing = byKey.get(key);
      if (!existing || (sc.updatedAt || sc.date) > (existing.updatedAt || existing.date)) {
        byKey.set(key, sc);
      }
    }
    return Array.from(byKey.values());
  }, [savedConsultations, allPatients, clinicId]);

  const filtered = clinicAppointments.filter((a) => {
    const patient = clinicPatients.find((p) => p.id === a.patientId);
    const name = patient ? `${patient.firstName} ${patient.lastName}`.toLowerCase() : '';
    const matchesSearch = !search || name.includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredOnline = onlineBookings.filter((b) => {
    // Clinic filter for online bookings
    if (clinicId) {
      const BOOKING_CLINIC_MAP: Record<string, string> = { 'online': 'online', 'online-intl': 'online', 'faridabad': 'kcc-faridabad', 'kcc-faridabad': 'kcc-faridabad', 'psri': 'psri-delhi', 'psri-delhi': 'psri-delhi', 'saket': 'kcc-saket', 'kcc-saket': 'kcc-saket' };
      const mappedId = BOOKING_CLINIC_MAP[b.clinicId] || b.clinicId;
      if (mappedId !== clinicId) return false;
    }
    const name = `${b.firstName} ${b.lastName}`.toLowerCase();
    const matchesSearch = !search || name.includes(search.toLowerCase()) || b.bookingId.toLowerCase().includes(search.toLowerCase());
    const bookingStatus = b.status === 'cancelled' ? 'CANCELLED' : b.status === 'pending' ? 'WAITING' : 'COMPLETED';
    const matchesStatus = statusFilter === 'ALL' || bookingStatus === statusFilter;
    const matchesDate = !dateFilter || b.date === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const filteredSaved = savedClinicConsultations.filter((sc) => {
    const pat = allPatients.find((p) => p.id === sc.patientId);
    const name = pat ? `${pat.firstName} ${pat.lastName}`.toLowerCase() : sc.patientId.toLowerCase();
    const matchesSearch = !search || name.includes(search.toLowerCase()) || sc.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || sc.status === statusFilter;
    const matchesDate = !dateFilter || sc.date === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Generate sequential token numbers for ALL patients (appointments + saved)
  const tokenMap = useMemo(() => {
    const map = new Map<string, string>();
    const allEntries: { id: string; time: string; date: string }[] = [];

    for (const a of filtered) {
      allEntries.push({ id: `apt:${a.patientId}`, time: a.time || '99:99', date: a.date || dateFilter });
    }
    for (const sc of filteredSaved) {
      allEntries.push({ id: `sc:${sc.patientId}`, time: '00:00', date: sc.date || dateFilter });
    }

    allEntries.sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return a.time.localeCompare(b.time);
    });

    let counter = 1;
    for (const entry of allEntries) {
      map.set(entry.id, `T${String(counter).padStart(3, '0')}`);
      counter++;
    }
    return map;
  }, [filtered, filteredSaved, dateFilter]);

  const waiting = filtered.filter((a) => a.status === 'WAITING').length + filteredOnline.filter((b) => b.status === 'pending').length;
  const inProgress = filtered.filter((a) => a.status === 'IN_PROGRESS').length + filteredSaved.filter((sc) => sc.status === 'IN_PROGRESS').length;
  const completed = filtered.filter((a) => a.status === 'COMPLETED').length + filteredOnline.filter((b) => b.status === 'confirmed').length + filteredSaved.filter((sc) => sc.status === 'COMPLETED').length;

  return (
    <RequirePermission permission="consultations">
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Consultations</h1>
          <p className="text-sm text-gray-500 mt-0.5">Today&apos;s consultation queue</p>
        </div>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{waiting}</p>
          <p className="text-xs text-gray-500 mt-0.5">Waiting</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{inProgress}</p>
          <p className="text-xs text-gray-500 mt-0.5">In Progress</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{completed}</p>
          <p className="text-xs text-gray-500 mt-0.5">Completed</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient name or ID..."
            className="w-full h-11 pl-9 pr-4 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30"
          />
        </div>
        <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
          {(['ALL', 'WAITING', 'IN_PROGRESS', 'COMPLETED'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 h-11 text-xs font-medium transition-colors',
                statusFilter === s ? 'bg-[#0A75BB] text-white' : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              {s === 'ALL' ? 'All' : s === 'IN_PROGRESS' ? 'Active' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Token</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Patient</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Phone</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Time</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Payment</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((a) => {
              const patient = allPatients.find((p) => p.id === a.patientId);
              const name = patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown';
              const age = patient ? calculateAge(new Date(patient.dateOfBirth)) : 0;
              const gender = patient?.gender === 'Male' ? 'M' : patient?.gender === 'Female' ? 'F' : 'O';
              const status = statusConfig[a.status] || statusConfig.WAITING;

              return (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold text-[#0A75BB]">#{tokenMap.get(`apt:${a.patientId}`) || a.tokenId}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0A75BB] to-[#085D94] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-gray-900">{name}</p>
                          <span className="px-1.5 py-0.5 bg-green-50 text-green-700 text-[10px] font-medium rounded">Walk-In</span>
                        </div>
                        <p className="text-xs text-gray-500">{age}Y, {gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">{patient?.phone || '—'}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-gray-600">{a.time}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full',
                      a.payment === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    )}>
                      {a.payment === 'PAID' ? <CreditCard className="h-3 w-3" /> : null}
                      {a.payment === 'PAID' ? `₹${a.amount || '—'}` : 'Free'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex px-2 py-0.5 text-xs font-medium rounded-full', status.color)}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {patient?.phone && (
                        <a href={`tel:${patient.phone}`} className="p-2.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors" title="Call">
                          <Phone className="h-4 w-4" />
                        </a>
                      )}
                      <Link
                        href={`/emr/consultation/${(() => {
                          const mockConsult = consultations.find((c) => c.patientId === a.patientId);
                          if (mockConsult) return mockConsult.id;
                          const savedConsult = savedConsultations.find((c) => c.patientId === a.patientId);
                          if (savedConsult) return savedConsult.id;
                          return a.patientId;
                        })()}`}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-3 h-11 text-xs font-semibold rounded-lg transition-colors',
                          a.status === 'WAITING' ? 'bg-[#0A75BB] text-white hover:bg-[#085D94]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        )}
                      >
                        {a.status === 'WAITING' ? <><Play className="h-3 w-3" /> Start</> : <><Eye className="h-3 w-3" /> Open</>}
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredOnline.map((b) => {
              const name = `${b.firstName} ${b.lastName}`;
              const status = b.status === 'cancelled' ? statusConfig.CANCELLED : b.status === 'pending' ? statusConfig.WAITING : statusConfig.COMPLETED;

              return (
                <tr key={b.bookingId} className="hover:bg-cyan-50/30 transition-colors border-t border-cyan-100">
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold text-cyan-600">#{b.bookingId.slice(-6).toUpperCase()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-gray-900">{name}</p>
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-medium rounded">
                            {b.consultationType === 'online_intl' ? 'Web-Online Intl' :
                             b.consultationType === 'online' ? 'Web-Online' :
                             b.consultationType === 'hospital' ? 'Hospital Visit' :
                             b.consultationType === 'offline' ? 'In-Clinic' :
                             b.clinicId === 'online' || b.clinicId === 'online-intl' ? 'Web-Online' :
                             b.clinicId === 'psri' || b.clinicId === 'psri-delhi' ? 'Hospital Visit' :
                             'In-Clinic'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{b.age}Y, {b.gender?.[0] || '?'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">{b.phone}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-gray-600">{b.time}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full',
                      b.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    )}>
                      <CreditCard className="h-3 w-3" />
                      ₹{b.consultationFee} {b.paymentStatus === 'paid' ? '' : '(Unpaid)'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex px-2 py-0.5 text-xs font-medium rounded-full', status.color)}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {b.phone && (
                        <a href={`tel:${b.phone}`} className="p-2.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors" title="Call">
                          <Phone className="h-4 w-4" />
                        </a>
                      )}
                      <Link
                        href={`/emr/consultation/consult-obp-${b.bookingId}`}
                        className="inline-flex items-center gap-1.5 px-3 h-11 text-xs font-semibold rounded-lg bg-[#0A75BB] text-white hover:bg-[#085D94] transition-colors"
                      >
                        <Play className="h-3 w-3" /> Start Rx
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredSaved.map((sc) => {
              const pat = allPatients.find((p) => p.id === sc.patientId);
              const name = pat ? `${pat.firstName} ${pat.lastName}` : 'Unknown Patient';
              const age = pat ? calculateAge(new Date(pat.dateOfBirth)) : 0;
              const gender = pat?.gender?.[0] || '?';
              const status = statusConfig[sc.status] || statusConfig.COMPLETED;

              return (
                <tr key={sc.id} className="hover:bg-purple-50/30 transition-colors border-t border-purple-100">
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold text-purple-600">#{tokenMap.get(`sc:${sc.patientId}`) || sc.tokenId || sc.id.slice(-4).toUpperCase()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-gray-900">{name}</p>
                          {sc.clinicId === 'online' ? (
                            <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-medium rounded">Online</span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-green-50 text-green-700 text-[10px] font-medium rounded">Walk-In</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{age}Y, {gender} · {sc.prescriptions?.length || 0} Rx</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">{pat?.phone || '—'}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-gray-600">{sc.date}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                      Saved
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex px-2 py-0.5 text-xs font-medium rounded-full', status.color)}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {pat?.phone && (
                        <a href={`tel:${pat.phone}`} className="p-2.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors" title="Call">
                          <Phone className="h-4 w-4" />
                        </a>
                      )}
                      <Link
                        href={`/emr/consultation/${sc.id}`}
                        className="inline-flex items-center gap-1.5 px-3 h-11 text-xs font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                      >
                        <Eye className="h-3 w-3" /> View Rx
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && filteredOnline.length === 0 && filteredSaved.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No consultations found</p>
          </div>
        )}
      </div>

      {/* Mobile card layout */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 && filteredOnline.length === 0 && filteredSaved.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-white border border-gray-200 rounded-xl">
            <p className="text-sm">No consultations found</p>
          </div>
        )}

        {filtered.map((a) => {
          const patient = allPatients.find((p) => p.id === a.patientId);
          const name = patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown';
          const age = patient ? calculateAge(new Date(patient.dateOfBirth)) : 0;
          const gender = patient?.gender === 'Male' ? 'M' : patient?.gender === 'Female' ? 'F' : 'O';
          const status = statusConfig[a.status] || statusConfig.WAITING;
          const consultId = (() => {
            const mockConsult = consultations.find((c) => c.patientId === a.patientId);
            if (mockConsult) return mockConsult.id;
            const savedConsult = savedConsultations.find((c) => c.patientId === a.patientId);
            if (savedConsult) return savedConsult.id;
            return a.patientId;
          })();

          return (
            <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A75BB] to-[#085D94] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-gray-900">{name}</p>
                      <span className="px-1.5 py-0.5 bg-green-50 text-green-700 text-[10px] font-medium rounded">Walk-In</span>
                    </div>
                    <p className="text-xs text-gray-500">{age}Y, {gender} · #{tokenMap.get(`apt:${a.patientId}`) || a.tokenId}</p>
                  </div>
                </div>
                <span className={cn('px-2.5 py-1 text-xs font-semibold rounded-full', status.color)}>
                  {status.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a href={`tel:${patient?.phone}`} className="flex-1 flex items-center justify-center gap-1.5 h-11 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <Phone className="h-3.5 w-3.5" /> Call
                </a>
                <Link
                  href={`/emr/consultation/${consultId}`}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 h-11 text-xs font-semibold rounded-lg transition-colors',
                    a.status === 'WAITING' ? 'bg-[#0A75BB] text-white hover:bg-[#085D94]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {a.status === 'WAITING' ? <><Play className="h-3.5 w-3.5" /> Start</> : <><Eye className="h-3.5 w-3.5" /> Open</>}
                </Link>
              </div>
            </div>
          );
        })}

        {filteredOnline.map((b) => {
          const name = `${b.firstName} ${b.lastName}`;
          const status = b.status === 'cancelled' ? statusConfig.CANCELLED : b.status === 'pending' ? statusConfig.WAITING : statusConfig.COMPLETED;

          return (
            <div key={b.bookingId} className="bg-white border border-cyan-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-gray-900">{name}</p>
                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-medium rounded">
                        {b.consultationType === 'online_intl' ? 'Web-Online Intl' :
                         b.consultationType === 'online' ? 'Web-Online' :
                         b.clinicId === 'online' || b.clinicId === 'online-intl' ? 'Web-Online' :
                         'Web'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{b.age}Y, {b.gender?.[0] || '?'} · ₹{b.consultationFee}</p>
                  </div>
                </div>
                <span className={cn('px-2.5 py-1 text-xs font-semibold rounded-full', status.color)}>
                  {status.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a href={`tel:${b.phone}`} className="flex-1 flex items-center justify-center gap-1.5 h-11 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <Phone className="h-3.5 w-3.5" /> Call
                </a>
                <Link
                  href={`/emr/consultation/consult-obp-${b.bookingId}`}
                  className="flex-1 flex items-center justify-center gap-1.5 h-11 text-xs font-semibold bg-[#0A75BB] text-white rounded-lg hover:bg-[#085D94] transition-colors"
                >
                  <Play className="h-3.5 w-3.5" /> Start Rx
                </Link>
              </div>
            </div>
          );
        })}

        {filteredSaved.map((sc) => {
          const pat = allPatients.find((p) => p.id === sc.patientId);
          const name = pat ? `${pat.firstName} ${pat.lastName}` : 'Unknown Patient';
          const age = pat ? calculateAge(new Date(pat.dateOfBirth)) : 0;
          const gender = pat?.gender?.[0] || '?';
          const status = statusConfig[sc.status] || statusConfig.COMPLETED;
          const medCount = sc.prescriptions?.length || 0;

          return (
            <div key={sc.id} className="bg-white border border-purple-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-gray-900">{name}</p>
                      {sc.clinicId === 'online' ? (
                        <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-medium rounded">Online</span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-green-50 text-green-700 text-[10px] font-medium rounded">Walk-In</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{age}Y, {gender} · #{tokenMap.get(`sc:${sc.patientId}`) || sc.tokenId || '—'} · {medCount} Rx</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-purple-100 text-purple-700">Saved</span>
                  <span className={cn('px-2 py-0.5 text-[10px] font-semibold rounded-full', status.color)}>
                    {status.label}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={`tel:${pat?.phone}`} className="flex-1 flex items-center justify-center gap-1.5 h-11 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <Phone className="h-3.5 w-3.5" /> Call
                </a>
                <Link
                  href={`/emr/consultation/${sc.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 h-11 text-xs font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" /> View Rx
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Showing {filtered.length + filteredOnline.length + filteredSaved.length} consultations ({filtered.length} in-clinic + {filteredOnline.length} online + {filteredSaved.length} saved)
      </p>

      {/* Delete Confirmation Dialog */}
      {deleteBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Booking?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete this online booking? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteBookingId(null)}
                className="flex-1 h-11 px-4 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBooking}
                className="flex-1 h-11 px-4 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </RequirePermission>
  );
}
