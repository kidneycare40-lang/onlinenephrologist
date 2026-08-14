'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  User, Calendar, LogOut, Clock, MapPin, Video, Globe,
  ChevronRight, Plus, Filter,
} from 'lucide-react';

interface Patient {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  gender: string | null;
  country: string | null;
  timezone: string | null;
  isInternational: boolean;
}

interface Appointment {
  id: string;
  appointment_number: string;
  doctor_name: string;
  clinic_id: string;
  clinic_name: string | null;
  appointment_type: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  consultation_fee: number | null;
  currency: string;
  payment_status: string;
  reason: string | null;
}

const typeConfig: Record<string, { label: string; icon: typeof Video; color: string }> = {
  online: { label: 'Online Consultation', icon: Video, color: 'text-purple-600 bg-purple-50' },
  offline: { label: 'Clinic Visit', icon: MapPin, color: 'text-emerald-600 bg-emerald-50' },
  hospital: { label: 'Hospital Visit', icon: MapPin, color: 'text-blue-600 bg-blue-50' },
  online_intl: { label: 'International Consultation', icon: Globe, color: 'text-amber-600 bg-amber-50' },
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  booked: 'bg-green-100 text-green-700',
};

const clinicNames: Record<string, string> = {
  'online': 'Online Consultation',
  'psri': 'PSRI Hospital, New Delhi',
  'kcc-faridabad': 'Kidney Care Centre, Faridabad',
  'kcc-saket': 'Kidney Care Centre, Saket',
};

export default function PatientDashboardPage() {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/patient-auth/me')
      .then(r => {
        if (!r.ok) throw new Error('not auth');
        return r.json();
      })
      .then(data => {
        setPatient(data.patient);
        return fetch('/api/patient-auth/appointments');
      })
      .then(r => r.json())
      .then(data => {
        setAppointments(data.appointments || []);
        setLoading(false);
      })
      .catch(() => {
        router.push('/patient/login');
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/patient-auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleCancel = async (aptId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    const res = await fetch('/api/patient-auth/appointments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId: aptId }),
    });
    if (res.ok) {
      setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, status: 'cancelled' } : a));
    }
  };

  const now = new Date().toISOString().split('T')[0];
  const upcoming = appointments.filter(a => a.appointment_date >= now && !['cancelled', 'completed'].includes(a.status));
  const past = appointments.filter(a => a.appointment_date < now || ['cancelled', 'completed'].includes(a.status));

  const filtered = activeFilter === 'all' ? appointments
    : activeFilter === 'upcoming' ? upcoming
    : activeFilter === 'completed' ? appointments.filter(a => a.status === 'completed')
    : activeFilter === 'cancelled' ? appointments.filter(a => a.status === 'cancelled')
    : activeFilter === 'online' ? appointments.filter(a => a.appointment_type === 'online' || a.appointment_type === 'online_intl')
    : activeFilter === 'offline' ? appointments.filter(a => a.appointment_type === 'offline' || a.appointment_type === 'hospital')
    : appointments;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-[#0A75BB] border-t-transparent rounded-full" />
        </div>
        <Footer />
      </>
    );
  }

  if (!patient) return null;

  const displayName = [patient.firstName, patient.lastName].filter(Boolean).join(' ') || patient.email;

  return (
    <>
      <Navbar />
      <section className="min-h-[80vh] bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#0A75BB] text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Welcome, {displayName}</h1>
                  <p className="text-sm text-gray-500">
                    {patient.email} {patient.isInternational && patient.country ? `· ${patient.country}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/book-appointment" className="flex items-center gap-1.5 px-4 py-2 bg-[#0A75BB] text-white text-sm font-medium rounded-lg hover:bg-[#085a94] transition-all">
                  <Plus className="h-4 w-4" /> Book Follow-up
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1.5 px-4 py-2 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-all">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-2xl font-bold text-[#0A75BB]">{upcoming.length}</div>
              <div className="text-xs text-gray-500">Upcoming</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-2xl font-bold text-green-600">{appointments.filter(a => a.status === 'completed').length}</div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-2xl font-bold text-gray-900">{appointments.length}</div>
              <div className="text-xs text-gray-500">Total Bookings</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-sm font-bold text-gray-900">{patient.isInternational ? 'International' : 'Domestic'}</div>
              <div className="text-xs text-gray-500">Patient Type</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 bg-white p-1 rounded-xl mb-6 border border-gray-100 overflow-x-auto">
            {[
              { key: 'all', label: `All (${appointments.length})` },
              { key: 'upcoming', label: `Upcoming (${upcoming.length})` },
              { key: 'completed', label: `Completed (${appointments.filter(a => a.status === 'completed').length})` },
              { key: 'cancelled', label: `Cancelled (${appointments.filter(a => a.status === 'cancelled').length})` },
              { key: 'online', label: 'Online' },
              { key: 'offline', label: 'Offline' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeFilter === tab.key
                    ? 'bg-[#0A75BB] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Appointments */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">
                  {activeFilter === 'all' ? 'No appointments yet' : 'No appointments match this filter'}
                </p>
                <Link href="/book-appointment" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] transition-all">
                  Book Your First Appointment <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              filtered.map(apt => (
                <AppointmentCard
                  key={apt.id}
                  apt={apt}
                  onCancel={apt.status !== 'cancelled' && apt.status !== 'completed' ? () => handleCancel(apt.id) : undefined}
                />
              ))
            )}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

function AppointmentCard({ apt, onCancel }: { apt: Appointment; onCancel?: () => void }) {
  const typeInfo = typeConfig[apt.appointment_type] || typeConfig.offline;
  const Icon = typeInfo.icon;
  const clinicLabel = clinicNames[apt.clinic_id] || apt.clinic_name || apt.clinic_id;

  const formatDate = (d: string) => {
    try {
      return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return d;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-all">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${typeInfo.color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-gray-900 text-sm">{clinicLabel}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[apt.status] || 'bg-gray-100 text-gray-600'}`}>
              {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {typeInfo.label}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />{formatDate(apt.appointment_date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />{apt.appointment_time}
            </span>
            {apt.consultation_fee != null && (
              <span className="font-medium text-[#0A75BB]">
                {apt.currency === 'USD' ? `$${apt.consultation_fee}` : `₹${apt.consultation_fee}`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
            <span>{apt.appointment_number}</span>
            <span>Dr. {apt.doctor_name}</span>
          </div>
          {apt.reason && <p className="text-xs text-gray-400 mt-1">{apt.reason}</p>}
        </div>
        {onCancel && (
          <button onClick={onCancel} className="text-xs text-red-500 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-all">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
