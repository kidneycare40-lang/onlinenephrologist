'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Users,
  IndianRupee,
  Clock,
  CalendarCheck,
  UserPlus,
  CalendarPlus,
  FileText,
  ArrowRight,
  Video,
  Footprints,
  Stethoscope,
  CreditCard,
  Pill,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClinic } from '@/lib/emr-clinic-context';
import type { AppointmentStatus, AppointmentType } from '@/types/emr';
import { deleteOnlineBooking } from '@/lib/emr-delete';

const emrDataPromise = typeof window !== 'undefined'
  ? import('@/lib/data/emr-mock')
  : null;

const BOOKING_CLINIC_MAP: Record<string, string> = {
  'online': '',
  'faridabad': 'kcc-faridabad',
  'psri': 'psri-delhi',
  'saket': 'kcc-saket',
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
  previousKidneyIssue: string;
  currentMedications: string;
  notes: string;
  createdAt: string;
  status: string;
  doctorName: string;
  consultationFee: number;
  paymentStatus?: string;
}

function getOnlineBookings(): OnlineBooking[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('emr_bookings') || '[]');
  } catch {
    return [];
  }
}

function getStatusColor(status: AppointmentStatus) {
  switch (status) {
    case 'WAITING':
      return 'bg-amber-100 text-amber-700';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-700';
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-700';
    case 'CANCELLED':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function getStatusLabel(status: AppointmentStatus) {
  switch (status) {
    case 'WAITING': return 'Waiting';
    case 'IN_PROGRESS': return 'In Progress';
    case 'COMPLETED': return 'Completed';
    case 'CANCELLED': return 'Cancelled';
    default: return status;
  }
}

export default function EMRDashboardPage() {
  const router = useRouter();
  const { clinicId, clinic } = useClinic();
  const [onlineBookings, setOnlineBookings] = useState<OnlineBooking[]>([]);
  const [, setRefreshKey] = useState(0);
  const [deleteBookingId, setDeleteBookingId] = useState<string | null>(null);
  const [greeting, setGreeting] = useState('Good Morning');
  const [mockData, setMockData] = useState<{ todayAppointments: any[]; waitingRoom: any[]; patients: any[] } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening');
    setOnlineBookings(getOnlineBookings());
    emrDataPromise?.then((mod) => {
      setMockData({ todayAppointments: mod.todayAppointments, waitingRoom: mod.waitingRoom, patients: mod.patients });
    });
  }, []);

  const handleMarkPaid = useCallback((bookingId: string) => {
    try {
      const bookings = JSON.parse(localStorage.getItem('emr_bookings') || '[]');
      const updated = bookings.map((b: OnlineBooking) =>
        b.bookingId === bookingId ? { ...b, paymentStatus: 'paid' } : b
      );
      localStorage.setItem('emr_bookings', JSON.stringify(updated));
      setOnlineBookings(updated);
      setRefreshKey(k => k + 1);
    } catch {}
  }, []);

  const handleDeleteBooking = useCallback(() => {
    if (!deleteBookingId) return;
    deleteOnlineBooking(deleteBookingId);
    setOnlineBookings((prev) => prev.filter((b) => b.bookingId !== deleteBookingId));
    setDeleteBookingId(null);
  }, [deleteBookingId]);

  const patients = mockData?.patients || [];
  const todayAppointments = mockData?.todayAppointments || [];
  const waitingRoom = mockData?.waitingRoom || [];

  const allAppointments = useMemo(() => {
    const clinicPatients = clinicId ? patients.filter((p: any) => p.clinicId === clinicId) : [];
    const clinicPatientIds = new Set(clinicPatients.map((p: any) => p.id));
    const clinicAppointments = clinicId ? todayAppointments.filter((a: any) => clinicPatientIds.has(a.patientId) || clinicPatients.some((p: any) => p.id === a.patientId)) : [];
    const clinicWaiting = clinicId ? waitingRoom.filter((w: any) => w.clinicId === clinicId) : [];
    const clinicOnlineBookings = clinicId
      ? onlineBookings.filter((b) => {
          const mappedClinicId = BOOKING_CLINIC_MAP[b.clinicId];
          return mappedClinicId === clinicId;
        })
      : [];

    const appointments = [
      ...clinicAppointments.map((a: any) => ({
        id: a.id,
        tokenId: a.tokenId,
        patientName: a.patientName,
        patientPhone: a.patientPhone,
        patientId: a.patientId,
        time: a.time,
        type: a.type,
        status: a.status,
        payment: a.payment,
        amount: a.amount,
        reason: a.reason,
        isOnline: false as const,
        date: a.date,
        ageGender: (() => {
          const found = clinicPatients.find((p: any) => p.id === a.patientId) || patients.find((p: any) => p.id === a.patientId);
          if (!found) return '—';
          const age = Math.floor((Date.now() - new Date(found.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
          return `${age} / ${found.gender[0]}`;
        })(),
      })),
      ...clinicOnlineBookings.map((b) => ({
        id: b.bookingId,
        tokenId: b.bookingId.slice(-6).toUpperCase(),
        patientName: `${b.firstName} ${b.lastName}`,
        patientPhone: b.phone,
        patientId: '',
        time: b.time,
        type: 'ONLINE' as AppointmentType,
        status: (b.status === 'pending' ? 'WAITING' : b.status === 'confirmed' ? 'COMPLETED' : 'WAITING') as AppointmentStatus,
        payment: b.paymentStatus === 'paid' ? 'PAID' as const : 'UNPAID' as const,
        amount: b.consultationFee,
        reason: b.reason,
        isOnline: true as const,
        date: b.date,
        ageGender: b.age ? `${b.age} / ${b.gender?.[0] || '?'}` : '—',
      })),
    ];

    return { appointments, clinicPatients, clinicWaiting };
  }, [clinicId, patients, todayAppointments, waitingRoom, onlineBookings]);

  const stats = useMemo(() => {
    const todayCount = allAppointments.appointments.length;
    const revenue = allAppointments.appointments
      .filter((a) => a.payment === 'PAID' && a.amount)
      .reduce((sum, a) => sum + (a.amount || 0), 0);
    const waitingCount = allAppointments.clinicWaiting.length;
    const followUpCount = allAppointments.appointments.filter((a) => a.type === 'FOLLOW_UP').length;

    return [
      { label: "Today's Patients", value: todayCount, icon: Users, iconBg: 'bg-blue-500' },
      { label: 'Revenue', value: `₹${revenue.toLocaleString('en-IN')}`, icon: IndianRupee, iconBg: 'bg-emerald-500' },
      { label: 'Waiting', value: waitingCount, icon: Clock, iconBg: 'bg-amber-500', pulse: true },
      { label: 'Follow-ups', value: followUpCount, icon: CalendarCheck, iconBg: 'bg-purple-500' },
    ];
  }, [allAppointments]);

  const recentPatients = useMemo(() => {
    return [...allAppointments.clinicPatients]
      .sort((a: any, b: any) => new Date(b.lastVisit || '0').getTime() - new Date(a.lastVisit || '0').getTime())
      .slice(0, 5);
  }, [allAppointments.clinicPatients]);

  const { appointments } = allAppointments;

  if (!mounted || !mockData) {
    return (
      <div className="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto space-y-5 pb-24 lg:pb-6">
        <div className="animate-pulse space-y-5">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
          </div>
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto space-y-5 pb-24 lg:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{greeting}, Dr Rajesh Goel</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
          <span className="mx-2 text-gray-300">|</span>
          <span className="text-gray-600">{clinic?.name || 'No clinic selected'}</span>
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                stat.iconBg,
                stat.pulse && 'animate-pulse'
              )}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Appointments + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
        {/* Today's Appointments */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">Today&apos;s Appointments <span className="text-gray-400 font-normal">({appointments.length})</span></h2>
            <Link
              href="/emr/appointments"
              className="text-xs text-[#0A75BB] hover:text-[#085D94] font-medium flex items-center gap-1"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            {/* Desktop table */}
            <table className="w-full hidden lg:table">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase">Token</th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase">Patient</th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase">Age/Gender</th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase">Payment</th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {appointments.map((apt) => (
                  <tr
                    key={apt.id}
                    className="hover:bg-gray-50/60 cursor-pointer transition-colors"
                    onClick={() => apt.patientId ? router.push(`/emr/consultation/${apt.patientId}`) : undefined}
                  >
                    <td className="px-4 py-2.5 text-xs font-mono text-gray-500">{apt.tokenId}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{apt.patientName}</span>
                        {apt.isOnline && <span className="px-1.5 py-0.5 bg-cyan-100 text-cyan-700 text-[10px] font-semibold rounded">WEB</span>}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{apt.ageGender}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{apt.time}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        {apt.type === 'ONLINE' ? <Video className="h-3 w-3" /> : <Footprints className="h-3 w-3" />}
                        <span>{apt.type === 'ONLINE' ? 'Online' : apt.type === 'FOLLOW_UP' ? 'Follow-up' : 'Walk-in'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium',
                        apt.payment === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      )}>
                        {apt.payment === 'PAID' ? <CreditCard className="h-3 w-3" /> : null}
                        {apt.payment === 'PAID' ? `₹${apt.amount || '—'}` : apt.payment === 'UNPAID' ? `₹${apt.amount || '—'} (Unpaid)` : 'Free'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium',
                        getStatusColor(apt.status)
                      )}>
                        {getStatusLabel(apt.status)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5">
                        {apt.payment === 'UNPAID' && apt.isOnline && (
                          <button
                            onClick={() => handleMarkPaid(apt.id)}
                            className="text-xs font-medium text-emerald-600 hover:underline flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded"
                          >
                            <CreditCard className="h-3 w-3" />
                            Mark Paid
                          </button>
                        )}
                        {apt.status === 'WAITING' && (
                          <button className="text-xs font-medium text-[#0A75BB] hover:underline flex items-center gap-1">
                            <Stethoscope className="h-3 w-3" />
                            Start
                          </button>
                        )}
                        {apt.status === 'IN_PROGRESS' && (
                          <Link
                            href={apt.patientId ? `/emr/consultation/${apt.patientId}` : '#'}
                            className="text-xs font-medium text-[#0A75BB] hover:underline flex items-center gap-1"
                          >
                            <Pill className="h-3 w-3" />
                            Rx
                          </Link>
                        )}
                        <Link
                          href={apt.patientId ? `/emr/consultation/${apt.patientId}` : '#'}
                          className="text-xs font-medium text-emerald-600 hover:underline flex items-center gap-1 ml-1"
                        >
                          <Pill className="h-3 w-3" />
                          Create Rx
                        </Link>
                        {apt.isOnline && (
                          <button
                            onClick={() => setDeleteBookingId(apt.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
                            title="Delete booking"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-gray-50">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="px-4 py-3 active:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => apt.patientId ? router.push(`/emr/consultation/${apt.patientId}`) : undefined}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 truncate">{apt.patientName}</span>
                        {apt.isOnline && <span className="px-1.5 py-0.5 bg-cyan-100 text-cyan-700 text-[9px] font-semibold rounded shrink-0">WEB</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{apt.ageGender} &middot; {apt.time}</p>
                    </div>
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0',
                      getStatusColor(apt.status)
                    )}>
                      {getStatusLabel(apt.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                    <span className={cn(
                      'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium',
                      apt.payment === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    )}>
                      {apt.payment === 'PAID' ? 'Paid' : 'Unpaid'} {apt.amount ? `₹${apt.amount}` : ''}
                    </span>
                    <span className="text-[10px] text-gray-400">{apt.tokenId}</span>
                    <div className="ml-auto flex items-center gap-1">
                      {apt.payment === 'UNPAID' && apt.isOnline && (
                        <button onClick={() => handleMarkPaid(apt.id)} className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Pay</button>
                      )}
                      <Link
                        href={apt.patientId ? `/emr/consultation/${apt.patientId}` : '#'}
                        className="text-[10px] font-medium text-[#0A75BB] bg-[#0A75BB]/5 px-2 py-1 rounded"
                      >
                        Rx
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</p>
            <div className="space-y-2">
              <button onClick={() => router.push('/emr/patients/add')} className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-[#0A75BB] text-white text-sm font-medium rounded-lg hover:bg-[#085D94] transition-colors">
                <UserPlus className="h-4 w-4" />
                New Patient
              </button>
              <button onClick={() => router.push('/emr/appointments')} className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                <CalendarPlus className="h-4 w-4" />
                New Appointment
              </button>
              <button onClick={() => router.push('/emr/reports')} className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
                <FileText className="h-4 w-4" />
                View Reports
              </button>
            </div>
          </div>

          {/* Recent Patients */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-sm">Recent Patients</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {recentPatients.map((patient: any) => (
                <div
                  key={patient.id}
                  onClick={() => router.push(`/emr/patients/${patient.id}`)}
                  className="px-4 py-3 active:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {patient.uhid} &middot; {patient.phone}
                      </p>
                    </div>
                    <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                      {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBooking}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
