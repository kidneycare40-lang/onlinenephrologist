'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  User, Calendar, FileText, LogOut, Clock, MapPin, Video, Globe,
  ChevronRight, CheckCircle, XCircle, AlertTriangle, Plus, Upload,
} from 'lucide-react';
import {
  getCurrentPatient,
  logoutPatient,
  type Patient,
} from '@/lib/patient-auth';
import {
  getUpcomingAppointments,
  getPastAppointments,
  cancelAppointment,
  type Appointment,
  type AppointmentType,
} from '@/lib/appointment-store';

const typeLabels: Record<AppointmentType, { label: string; icon: typeof Video; color: string }> = {
  clinic: { label: 'Clinic Visit', icon: MapPin, color: 'text-emerald-600 bg-emerald-50' },
  hospital: { label: 'Hospital Visit', icon: MapPin, color: 'text-blue-600 bg-blue-50' },
  online: { label: 'Online Consultation', icon: Video, color: 'text-purple-600 bg-purple-50' },
  international: { label: 'International Patient', icon: Globe, color: 'text-amber-600 bg-amber-50' },
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  rescheduled: 'bg-purple-100 text-purple-700',
};

export default function PatientDashboardPage() {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [past, setPast] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const p = getCurrentPatient();
    if (!p) {
      router.push('/patient/login');
      return;
    }
    setPatient(p);
    setUpcoming(getUpcomingAppointments(p.id));
    setPast(getPastAppointments(p.id));
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    logoutPatient();
    router.push('/');
  };

  const handleCancel = (aptId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    cancelAppointment(aptId);
    if (patient) {
      setUpcoming(getUpcomingAppointments(patient.id));
      setPast(getPastAppointments(patient.id));
    }
  };

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
                  {patient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Welcome, {patient.name}</h1>
                  <p className="text-sm text-gray-500">+91 {patient.phone} {patient.isInternational && `· ${patient.country}`}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href="/book-appointment" className="flex items-center gap-1.5 px-4 py-2 bg-[#0A75BB] text-white text-sm font-medium rounded-lg hover:bg-[#085a94] transition-all">
                  <Plus className="h-4 w-4" /> Book New
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
              <div className="text-2xl font-bold text-green-600">{past.filter((a) => a.status === 'completed').length}</div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-2xl font-bold text-gray-900">{past.length + upcoming.length}</div>
              <div className="text-xs text-gray-500">Total Visits</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-sm font-bold text-gray-900">{patient.isInternational ? 'International' : 'Domestic'}</div>
              <div className="text-xs text-gray-500">Patient Type</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white p-1 rounded-xl mb-6 border border-gray-100">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'upcoming' ? 'bg-[#0A75BB] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Upcoming ({upcoming.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'past' ? 'bg-[#0A75BB] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Past ({past.length})
            </button>
          </div>

          {/* Appointments */}
          <div className="space-y-3">
            {activeTab === 'upcoming' && (
              <>
                {upcoming.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No upcoming appointments</p>
                    <Link href="/book-appointment" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] transition-all">
                      Book Appointment <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  upcoming.map((apt) => <AppointmentCard key={apt.id} apt={apt} onCancel={handleCancel} />)
                )}
              </>
            )}
            {activeTab === 'past' && (
              <>
                {past.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No past appointments</p>
                  </div>
                ) : (
                  past.map((apt) => <AppointmentCard key={apt.id} apt={apt} />)
                )}
              </>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

function AppointmentCard({ apt, onCancel }: { apt: Appointment; onCancel?: (id: string) => void }) {
  const typeInfo = typeLabels[apt.type];
  const Icon = typeInfo.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-all">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${typeInfo.color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-gray-900 text-sm">{apt.clinicName}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[apt.status]}`}>
              {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{apt.date}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{apt.time}</span>
            <span className="flex items-center gap-1"><span className="text-[#0A75BB] font-medium">₹{apt.fee}</span></span>
          </div>
          {apt.reason && <p className="text-xs text-gray-400 mt-1">{apt.reason}</p>}
          {apt.type === 'international' && apt.countryCode && (
            <p className="text-xs text-amber-600 mt-1">🌍 {apt.countryCode} · {apt.timezone}</p>
          )}
        </div>
        {onCancel && apt.status !== 'cancelled' && (
          <button onClick={() => onCancel(apt.id)} className="text-xs text-red-500 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-all">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
