'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClinic } from '@/lib/emr-clinic-context';
import { dashboardApi, patientsApi, ApiError } from '@/lib/api-client';
import { deleteOnlineBooking } from '@/lib/emr-delete';
import type { AppointmentStatus, AppointmentType } from '@/types/emr';

const BOOKING_CLINIC_MAP: Record<string, string> = {
  'online': 'online',
  'online-intl': 'online',
  'faridabad': 'kcc-faridabad',
  'kcc-faridabad': 'kcc-faridabad',
  'psri': 'psri-delhi',
  'psri-delhi': 'psri-delhi',
  'saket': 'kcc-saket',
  'kcc-saket': 'kcc-saket',
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
    case 'WAITING': return 'bg-amber-100 text-amber-700';
    case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
    case 'COMPLETED': return 'bg-emerald-100 text-emerald-700';
    case 'CANCELLED': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
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
  const [deleteBookingId, setDeleteBookingId] = useState<string | null>(null);
  const [greeting, setGreeting] = useState('Good Morning');

  // API data
  const [stats, setStats] = useState<any>(null);
  const [apiAppointments, setApiAppointments] = useState<any[]>([]);
  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening');
    setOnlineBookings(getOnlineBookings());
  }, []);

  // Fetch dashboard data from API
  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = clinicId ? { clinicId } : undefined;

      // Fetch stats, today's appointments, and recent patients in parallel
      const [statsData, appointmentsData] = await Promise.all([
        dashboardApi.getStats(params).catch(() => null),
        dashboardApi.getTodayAppointments(params).catch(() => []),
      ]);

      setStats(statsData);
      setApiAppointments(appointmentsData || []);

      // Use stats.recentPatients if available, otherwise fetch recent patients
      if (statsData?.recentPatients) {
        setRecentPatients(statsData.recentPatients);
      } else {
        try {
          const patientsResult = await patientsApi.list(clinicId ? { clinicId } : undefined);
          const sorted = (patientsResult.data || [])
            .sort((a: any, b: any) => new Date(b.last_visit_date || '0').getTime() - new Date(a.last_visit_date || '0').getTime())
            .slice(0, 5);
          setRecentPatients(sorted);
        } catch {
          setRecentPatients([]);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshData(); }, [clinicId]);

  const handleMarkPaid = (bookingId: string) => {
    try {
      const bookings = JSON.parse(localStorage.getItem('emr_bookings') || '[]');
      const updated = bookings.map((b: OnlineBooking) =>
        b.bookingId === bookingId ? { ...b, paymentStatus: 'paid' } : b
      );
      localStorage.setItem('emr_bookings', JSON.stringify(updated));
      setOnlineBookings(updated);
    } catch {}
  };

  const handleDeleteBooking = () => {
    if (!deleteBookingId) return;
    deleteOnlineBooking(deleteBookingId);
    setOnlineBookings((prev) => prev.filter((b) => b.bookingId !== deleteBookingId));
    setDeleteBookingId(null);
  };

  // Merge API appointments with online bookings
  const allAppointments = useMemo(() => {
    const clinicOnlineBookings = clinicId
      ? onlineBookings.filter((b) => BOOKING_CLINIC_MAP[b.clinicId] === clinicId)
      : [];

    const apiMapped = apiAppointments.map((apt: any) => ({
      id: apt.id,
      tokenId: apt.token_id || apt.id?.slice(-6)?.toUpperCase() || '—',
      patientName: apt.patient
        ? `${apt.patient.first_name} ${apt.patient.last_name}`
        : '—',
      patientPhone: apt.patient?.phone || '',
      patientId: apt.patient_id,
      time: apt.appointment_time,
      type: apt.type || 'WALK_IN',
      status: apt.status || 'SCHEDULED',
      payment: apt.payment_status === 'paid' ? 'PAID' : 'UNPAID',
      amount: apt.amount || 0,
      reason: apt.reason || '',
      isOnline: false as const,
      date: apt.appointment_date,
      ageGender: apt.patient?.date_of_birth
        ? `${Math.floor((Date.now() - new Date(apt.patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} / ${apt.patient?.gender?.[0] || '?'}`
        : '—',
    }));

    const onlineMapped = clinicOnlineBookings.map(b => ({
      id: b.bookingId,
      tokenId: b.bookingId.slice(-6).toUpperCase(),
      patientName: `${b.firstName} ${b.lastName}`,
      patientPhone: b.phone,
      patientId: '',
      time: b.time,
      type: 'ONLINE' as AppointmentType,
      status: (b.status === 'pending' ? 'WAITING' : b.status === 'confirmed' ? 'COMPLETED' : b.status === 'cancelled' ? 'CANCELLED' : 'WAITING') as AppointmentStatus,
      payment: b.paymentStatus === 'paid' ? 'PAID' as const : 'UNPAID' as const,
      amount: b.consultationFee,
      reason: b.reason,
      isOnline: true as const,
      date: b.date,
      ageGender: b.age ? `${b.age} / ${b.gender?.[0] || '?'}` : '—',
    }));

    return [...apiMapped, ...onlineMapped];
  }, [apiAppointments, onlineBookings, clinicId]);

  const todayCount = allAppointments.length;
  const revenue = allAppointments
    .filter((a) => a.payment === 'PAID' && a.amount)
    .reduce((sum, a) => sum + (a.amount || 0), 0);
  const waitingCount = allAppointments.filter((a) => a.status === 'WAITING' || a.status === 'SCHEDULED').length;
  const followUpCount = allAppointments.filter((a) => a.type === 'FOLLOW_UP').length;

  const statCards = [
    {
      label: "Today's Patients",
      value: todayCount,
      icon: Users,
      iconBg: 'bg-blue-500',
    },
    {
      label: 'Revenue',
      value: `₹${revenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      iconBg: 'bg-emerald-500',
    },
    {
      label: 'Waiting',
      value: waitingCount,
      icon: Clock,
      iconBg: 'bg-amber-500',
      pulse: true,
    },
    {
      label: 'Follow-ups',
      value: followUpCount,
      icon: CalendarCheck,
      iconBg: 'bg-purple-500',
    },
  ];

  return (
    <div className="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto space-y-5 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-start justify-between">
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
        <button
          onClick={refreshData}
          disabled={loading}
          className="p-2.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title="Refresh"
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat) => (
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
            <h2 className="font-semibold text-gray-900 text-sm">Today&apos;s Appointments <span className="text-gray-400 font-normal">({allAppointments.length})</span></h2>
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
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Token</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Patient</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Age/Gender</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Payment</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {allAppointments.map((apt) => (
                  <tr
                    key={apt.id}
                    className="hover:bg-gray-50/60 cursor-pointer transition-colors"
                    onClick={() => apt.patientId ? router.push(`/emr/consultation/${apt.patientId}`) : undefined}
                  >
                    <td className="px-4 py-2.5 text-xs font-mono text-gray-500">{apt.tokenId}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{apt.patientName}</span>
                        {apt.isOnline && <span className="px-1.5 py-0.5 bg-cyan-100 text-cyan-700 text-xs font-semibold rounded">WEB</span>}
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
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                        apt.payment === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      )}>
                        {apt.payment === 'PAID' ? <CreditCard className="h-3 w-3" /> : null}
                        {apt.payment === 'PAID' ? `₹${apt.amount || '—'}` : apt.payment === 'UNPAID' ? `₹${apt.amount || '—'} (Unpaid)` : 'Free'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
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
                {allAppointments.length === 0 && !loading && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">
                      No appointments today
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-gray-50">
              {allAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="px-4 py-3 hover:bg-gray-50/60 active:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => apt.patientId ? router.push(`/emr/consultation/${apt.patientId}`) : undefined}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 truncate">{apt.patientName}</span>
                        {apt.isOnline && <span className="px-1.5 py-0.5 bg-cyan-100 text-cyan-700 text-xs font-semibold rounded shrink-0">WEB</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{apt.ageGender} &middot; {apt.time}</p>
                    </div>
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0',
                      getStatusColor(apt.status)
                    )}>
                      {getStatusLabel(apt.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                    <span className={cn(
                      'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium',
                      apt.payment === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    )}>
                      {apt.payment === 'PAID' ? 'Paid' : 'Unpaid'} {apt.amount ? `₹${apt.amount}` : ''}
                    </span>
                    <span className="text-xs text-gray-400">{apt.tokenId}</span>
                    <div className="ml-auto flex items-center gap-2">
                      {apt.payment === 'UNPAID' && apt.isOnline && (
                        <button onClick={() => handleMarkPaid(apt.id)} className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg">Pay</button>
                      )}
                      <Link
                        href={apt.patientId ? `/emr/consultation/${apt.patientId}` : '#'}
                        className="text-xs font-medium text-[#0A75BB] bg-[#0A75BB]/5 px-2.5 py-1.5 rounded-lg"
                      >
                        Rx
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              {allAppointments.length === 0 && !loading && (
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  No appointments today
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</p>
            <div className="space-y-2">
              <button onClick={() => router.push('/emr/patients/add')} className="w-full flex items-center gap-2.5 px-3 h-11 bg-[#0A75BB] text-white text-sm font-medium rounded-lg hover:bg-[#085D94] transition-colors">
                <UserPlus className="h-4 w-4" />
                New Patient
              </button>
              <button onClick={() => router.push('/emr/appointments')} className="w-full flex items-center gap-2.5 px-3 h-11 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                <CalendarPlus className="h-4 w-4" />
                New Appointment
              </button>
              <button onClick={() => router.push('/emr/reports')} className="w-full flex items-center gap-2.5 px-3 h-11 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors">
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
              {recentPatients.length === 0 && !loading && (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  No recent patients
                </div>
              )}
              {recentPatients.map((patient: any) => (
                <div
                  key={patient.id}
                  onClick={() => router.push(`/emr/patients/${patient.id}`)}
                  className="px-4 py-3 hover:bg-gray-50/60 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {patient.first_name} {patient.last_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {patient.uhid} &middot; {patient.phone}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">
                      {patient.last_visit_date ? new Date(patient.last_visit_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
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
