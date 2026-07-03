'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Users,
  CheckCircle,
  Calendar,
  Phone,
  Video,
  MapPin,
  X,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { todayAppointments, waitingRoom, doctors, patients } from '@/lib/data/emr-mock';
import type { EMRAppointment, AppointmentStatus, AppointmentType } from '@/types/emr';
import { useClinic } from '@/lib/emr-clinic-context';
import { CreditCard } from 'lucide-react';

const BOOKING_CLINIC_MAP: Record<string, string> = {
  'online': '',
  'faridabad': 'kcc-faridabad',
  'psri': 'psri-delhi',
  'saket': 'kcc-saket',
};

function formatTimeDisplay(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function to24Hour(time12h: string): string {
  const match = time12h.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return time12h;
  let hour = parseInt(match[1], 10);
  const min = match[2];
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  return `${hour.toString().padStart(2, '0')}:${min}`;
}

function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

function generateTimeSlots(clinicId: string): string[] {
  const slotConfig: Record<string, { start: number; end: number; interval: number }> = {
    'online':      { start: 7, end: 23, interval: 15 },
    'kcc-faridabad': { start: 9, end: 10.5, interval: 5 },
    'psri-delhi':  { start: 13, end: 18.5, interval: 10 },
    'kcc-saket':   { start: 21, end: 23, interval: 10 },
  };
  const config = slotConfig[clinicId] || { start: 9, end: 18, interval: 30 };
  const slots: string[] = [];
  for (let t = config.start; t <= config.end; t += config.interval / 60) {
    const hour = Math.floor(t);
    const min = Math.round((t - hour) * 60);
    slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
  }
  return slots;
}

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  WAITING: 'bg-amber-50 text-amber-700 border-l-4 border-amber-400',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-l-4 border-blue-400',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-400',
  CANCELLED: 'bg-gray-50 text-gray-500 border-l-4 border-gray-300',
};

function NewPatientModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('M');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [pin, setPin] = useState('');
  const [duplicate, setDuplicate] = useState<any>(null);
  const { clinicId } = useClinic();

  // Detect duplicates
  useEffect(() => {
    if (!open) { setDuplicate(null); return; }
    const q = (phone || name).trim().toLowerCase();
    if (q.length < 3) { setDuplicate(null); return; }
    const all: any[] = [];
    try { all.push(...JSON.parse(localStorage.getItem('emr_added_patients') || '[]')); } catch {}
    try {
      const bookings = JSON.parse(localStorage.getItem('emr_bookings') || '[]');
      if (Array.isArray(bookings)) {
        for (const b of bookings) {
          if (b.patientData?.firstName) {
            const id = b.patientId || 'obp-' + b.bookingId;
            if (!all.some((p: any) => p.id === id)) {
              all.push({ id, firstName: b.patientData.firstName, lastName: b.patientData.lastName || '', phone: b.patientData.phone || '', clinicId: b.clinicId || '', uhid: 'OB-' + id.slice(4) });
            }
          }
        }
      }
    } catch {}
    try {
      const { patients: mockPts } = require('@/lib/data/emr-mock');
      all.push(...mockPts);
    } catch {}
    const searchPhone = phone.replace(/\D/g, '');
    const match = all.find((p: any) => {
      const fullName = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
      const pPhone = (p.phone || '').replace(/\D/g, '');
      return (phone && searchPhone.length >= 5 && pPhone.includes(searchPhone)) || (name && fullName.includes(q));
    });
    setDuplicate(match || null);
  }, [phone, name, open]);

  if (!open) return null;

  const clinicName = (cid: string) => cid === 'kcc-faridabad' ? 'KCC Faridabad' : cid === 'kcc-saket' ? 'KCC Saket' : cid === 'psri-delhi' ? 'PSRI Hospital' : cid === 'online' ? 'Online' : cid || 'Unknown';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-3.5 flex items-center justify-between rounded-t-xl z-10">
          <h2 className="text-base font-semibold text-gray-900">Add New Patient</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Patient Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Phone *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
            />
          </div>

          {duplicate && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <p className="text-sm font-semibold text-amber-800">Already Registered</p>
              </div>
              <p className="text-xs text-amber-700">
                <strong>{duplicate.firstName} {duplicate.lastName}</strong> — {duplicate.uhid} — {clinicName(duplicate.clinicId)}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
              <div className="flex gap-1">
                {['M', 'F', 'Other'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={cn(
                      'flex-1 py-2 rounded-lg border text-xs font-medium transition-all',
                      gender === g
                        ? 'border-[#0A75BB] bg-[#0A75BB]/5 text-[#0A75BB]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Age or DOB *</label>
              <input
                type="text"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 45 or 01/01/1981"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Delhi"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Pin</label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="110001"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full address"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
            />
          </div>

          <button className="text-sm text-[#0A75BB] hover:underline font-medium">
            If you want to add more details, Click Here
          </button>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-3.5 flex gap-2 rounded-b-xl">
          <button className="flex-1 px-3 py-2.5 bg-[#0A75BB] text-white rounded-lg text-xs font-medium hover:bg-[#085D94] transition-colors">
            Add &amp; Create Rx
          </button>
          <button className="flex-1 px-3 py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors">
            Add &amp; Create Bill
          </button>
          <button className="flex-1 px-3 py-2.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors">
            Add &amp; Create Appt
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  const { clinicId } = useClinic();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [onlineBookings, setOnlineBookings] = useState<any[]>([]);

  useEffect(() => {
    try {
      setOnlineBookings(JSON.parse(localStorage.getItem('emr_bookings') || '[]'));
    } catch { /* ignore */ }
  }, []);

  const dateStr = formatDateISO(selectedDate);

  const clinicAppointments = clinicId ? todayAppointments.filter((a) => a.clinicId === clinicId) : [];
  const clinicOnlineBookings = clinicId
    ? onlineBookings.filter((b) => BOOKING_CLINIC_MAP[b.clinicId] === clinicId && b.date === dateStr)
    : [];
  const clinicWaiting = clinicId ? waitingRoom.filter((w) => w.clinicId === clinicId) : [];
  const clinicPatientIds = new Set(clinicAppointments.map((a) => a.patientId));
  const clinicPatients = clinicId ? patients.filter((p) => clinicPatientIds.has(p.id)) : [];

  const filteredAppointments = useMemo(() => {
    return clinicAppointments.filter((apt) => apt.date === dateStr);
  }, [dateStr, clinicAppointments]);

  const mergedAppointments = useMemo(() => {
    const onlineMapped = clinicOnlineBookings.map((b) => ({
      id: b.bookingId,
      tokenId: b.bookingId.slice(-6).toUpperCase(),
      patientId: '',
      patientName: `${b.firstName} ${b.lastName}`,
      patientPhone: b.phone,
      doctorId: 'D001',
      doctorName: b.doctorName || 'Dr. Rajesh Goel',
      date: b.date,
      time: to24Hour(b.time),
      type: 'ONLINE' as AppointmentType,
      status: (b.status === 'confirmed' ? 'COMPLETED' : 'WAITING') as AppointmentStatus,
      reason: b.reason,
      payment: (b.paymentStatus === 'paid' ? 'PAID' : 'UNPAID') as 'PAID' | 'UNPAID',
      amount: b.consultationFee,
      clinicId: BOOKING_CLINIC_MAP[b.clinicId] || '',
    })) as EMRAppointment[];
    return [...filteredAppointments, ...onlineMapped];
  }, [filteredAppointments, clinicOnlineBookings]);

  const stats = useMemo(() => {
    const total = mergedAppointments.length;
    const pending = mergedAppointments.filter((a) => a.status === 'WAITING' || a.status === 'IN_PROGRESS').length;
    const complete = mergedAppointments.filter((a) => a.status === 'COMPLETED').length;
    return { total, pending, complete };
  }, [mergedAppointments]);

  const appointmentsByTime = useMemo(() => {
    const map: Record<string, EMRAppointment[]> = {};
    mergedAppointments.forEach((apt) => {
      if (!map[apt.time]) map[apt.time] = [];
      map[apt.time].push(apt);
    });
    return map;
  }, [mergedAppointments]);

  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  }, []);

  const isToday = formatDateISO(selectedDate) === formatDateISO(new Date());

  return (
    <div className="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Appointments</h1>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigateDate('prev')}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-gray-700">
                {selectedDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              {isToday && (
                <span className="px-1.5 py-0.5 bg-[#0A75BB]/10 text-[#0A75BB] text-[10px] font-semibold rounded">TODAY</span>
              )}
            </div>
            <button
              onClick={() => navigateDate('next')}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            {!isToday && (
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-2.5 py-1.5 text-xs font-medium text-[#0A75BB] hover:bg-[#0A75BB]/5 rounded-lg transition-colors"
              >
                Go
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-500">Total: <span className="font-semibold text-gray-900">{stats.total}</span></span>
          <span className="text-gray-500">Pending: <span className="font-semibold text-amber-600">{stats.pending}</span></span>
          <span className="text-gray-500">Complete: <span className="font-semibold text-emerald-600">{stats.complete}</span></span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
        {/* Day View - Time Slots */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {generateTimeSlots(clinicId || 'online').map((slot) => {
              const slotAppointments = appointmentsByTime[slot] || [];
              return (
                <div key={slot} className="flex min-h-[72px]">
                  <div className="w-20 shrink-0 pr-3 text-right py-2 border-r border-gray-100 bg-gray-50/50">
                    <span className="text-xs font-medium text-gray-500">{formatTimeDisplay(slot)}</span>
                  </div>
                  <div className="flex-1 py-1.5 px-3 space-y-1.5">
                    {slotAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className={cn(
                          'p-2.5 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer',
                          STATUS_COLORS[apt.status]
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{apt.patientName}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              {(() => {
                                const found = clinicPatients.find(p => p.id === apt.patientId);
                                if (found) {
                                  const age = Math.floor((Date.now() - new Date(found.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                                  return <>{`${age}y / ${found.gender[0]}`}{' '}&middot;{' '}</>;
                                }
                                return null;
                              })()}
                              {apt.patientPhone}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {apt.type === 'ONLINE' && <Video className="h-3 w-3 text-cyan-500" />}
                            {apt.type === 'WALK_IN' && <MapPin className="h-3 w-3 text-purple-500" />}
                            {apt.type === 'FOLLOW_UP' && <Phone className="h-3 w-3 text-orange-500" />}
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/80 text-gray-600">
                              {apt.type === 'ONLINE' ? 'Online' : apt.type === 'FOLLOW_UP' ? 'Follow-up' : 'Walk-in'}
                            </span>
                            {apt.payment === 'PAID' && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                                ₹{apt.amount || 'Paid'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          {/* Add New Patient */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">New Patient</p>
            <button
              onClick={() => setShowNewPatientModal(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#0A75BB] text-white text-sm font-medium rounded-lg hover:bg-[#085D94] transition-colors"
            >
              <Plus className="h-4 w-4" />
              New
            </button>
            <p className="text-[11px] text-gray-400 mt-2 text-center">
              <button className="text-[#0A75BB] hover:underline">Upload Patient List</button>
            </p>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Links</p>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <FileText className="h-4 w-4 text-gray-400" />
                View Reports
              </button>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-[11px] text-gray-500">Doctor Code</p>
              <p className="text-sm font-semibold text-gray-900">KCC-DR-RG</p>
            </div>
          </div>

          {/* Waiting Queue */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <h3 className="font-semibold text-gray-900 text-sm">Waiting ({clinicWaiting.length})</h3>
            </div>
            <div className="divide-y divide-gray-50 max-h-[240px] overflow-y-auto">
              {clinicWaiting.map((p, i) => (
                <div key={p.tokenId} className="px-4 py-2.5 hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{p.patientName}</p>
                      <p className="text-[11px] text-gray-500">
                        {p.waitTimeMinutes > 0 ? `Waiting ${p.waitTimeMinutes}m` : 'Just arrived'}
                      </p>
                    </div>
                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-500">
                      {i + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <NewPatientModal open={showNewPatientModal} onClose={() => setShowNewPatientModal(false)} />
    </div>
  );
}

function FileText(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
      <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
      <path d="M10 9H8"/>
      <path d="M16 13H8"/>
      <path d="M16 17H8"/>
    </svg>
  );
}
