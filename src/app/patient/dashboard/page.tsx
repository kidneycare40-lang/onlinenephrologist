'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  User, Calendar, LogOut, Clock, MapPin, Video, Globe,
  ChevronRight, Plus,
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

interface Booking {
  id: string;
  booking_id: string;
  first_name: string;
  last_name: string;
  consultation_type: string;
  clinic_id: string | null;
  booking_date: string | null;
  booking_time: string | null;
  status: string;
  payment_status: string;
  payment_id: string | null;
  consultation_fee: number | null;
  consultation_fee_currency: string;
  doctor_name: string | null;
  reason: string | null;
  created_at: string;
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
  const [bookings, setBookings] = useState<Booking[]>([]);
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
        setBookings(data.bookings || []);
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

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    const res = await fetch('/api/patient-auth/appointments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    });
    if (res.ok) {
      setBookings(prev => prev.map(b => b.booking_id === bookingId ? { ...b, status: 'cancelled' } : b));
    }
  };

  const now = new Date().toISOString().split('T')[0];
  const upcoming = bookings.filter(b => (b.booking_date || '') >= now && !['cancelled', 'completed'].includes(b.status));
  const past = bookings.filter(b => (b.booking_date || '') < now || ['cancelled', 'completed'].includes(b.status));

  const filtered = activeFilter === 'all' ? bookings
    : activeFilter === 'upcoming' ? upcoming
    : activeFilter === 'completed' ? bookings.filter(b => b.status === 'completed')
    : activeFilter === 'cancelled' ? bookings.filter(b => b.status === 'cancelled')
    : activeFilter === 'online' ? bookings.filter(b => b.consultation_type === 'online' || b.consultation_type === 'online_intl')
    : activeFilter === 'offline' ? bookings.filter(b => b.consultation_type === 'offline' || b.consultation_type === 'hospital')
    : bookings;

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

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-2xl font-bold text-[#0A75BB]">{upcoming.length}</div>
              <div className="text-xs text-gray-500">Upcoming</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-2xl font-bold text-green-600">{bookings.filter(b => b.status === 'completed').length}</div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
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
              { key: 'all', label: `All (${bookings.length})` },
              { key: 'upcoming', label: `Upcoming (${upcoming.length})` },
              { key: 'completed', label: `Completed (${bookings.filter(b => b.status === 'completed').length})` },
              { key: 'cancelled', label: `Cancelled (${bookings.filter(b => b.status === 'cancelled').length})` },
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

          {/* Bookings */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">
                  {activeFilter === 'all' ? 'No bookings yet' : 'No bookings match this filter'}
                </p>
                <Link href="/book-appointment" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] transition-all">
                  Book Your First Appointment <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              filtered.map(b => (
                <BookingCard
                  key={b.booking_id}
                  booking={b}
                  onCancel={b.status !== 'cancelled' && b.status !== 'completed' ? () => handleCancel(b.booking_id) : undefined}
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

function BookingCard({ booking, onCancel }: { booking: Booking; onCancel?: () => void }) {
  const typeInfo = typeConfig[booking.consultation_type] || typeConfig.offline;
  const Icon = typeInfo.icon;
  const clinicLabel = clinicNames[booking.clinic_id || ''] || booking.clinic_id || 'Online';

  const formatDate = (d: string | null) => {
    if (!d) return '';
    try {
      return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return d;
    }
  };

  const paymentLabel = booking.payment_status === 'paid' ? 'PAID'
    : booking.payment_status === 'unpaid' ? 'UNPAID'
    : booking.payment_status;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-all">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${typeInfo.color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-gray-900 text-sm">{clinicLabel}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[booking.status] || 'bg-gray-100 text-gray-600'}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {typeInfo.label}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />{formatDate(booking.booking_date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />{booking.booking_time}
            </span>
            {booking.consultation_fee != null && (
              <span className="font-medium text-[#0A75BB]">
                {booking.consultation_fee_currency === 'USD' ? `$${booking.consultation_fee}` : `₹${booking.consultation_fee}`}
                <span className={`ml-1 text-[10px] ${booking.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {paymentLabel}
                </span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
            <span>{booking.booking_id}</span>
            <span>Dr. {booking.doctor_name || 'Dr Rajesh Goel'}</span>
          </div>
          {booking.reason && <p className="text-xs text-gray-400 mt-1">{booking.reason}</p>}
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
