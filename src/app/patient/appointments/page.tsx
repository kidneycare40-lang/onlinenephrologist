'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import {
  Calendar, Clock, Video, MapPin, Globe, ChevronLeft, FileText, IndianRupee,
} from 'lucide-react';

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
  complaints: string | null;
  notes: string | null;
  report_files: any[];
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

function AppointmentsContent() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('id');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/patient-auth/appointments')
      .then(r => r.json())
      .then(d => { setBookings(d.bookings || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const selected = bookings.find(b => b.booking_id === selectedId);
  const now = new Date().toISOString().split('T')[0];

  const filtered = filter === 'all' ? bookings
    : filter === 'upcoming' ? bookings.filter(b => (b.booking_date || '') >= now && !['cancelled', 'completed'].includes(b.status))
    : filter === 'completed' ? bookings.filter(b => b.status === 'completed')
    : filter === 'cancelled' ? bookings.filter(b => b.status === 'cancelled')
    : bookings;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 border-[#0A75BB] border-t-transparent rounded-full" />
      </div>
    );
  }

  // Detail view
  if (selected) {
    const tc = typeConfig[selected.consultation_type] || typeConfig.offline;
    const Icon = tc.icon;
    return (
      <div className="space-y-6">
        <Link href="/patient/appointments" className="inline-flex items-center gap-1.5 text-sm text-[#0A75BB] font-medium hover:underline">
          <ChevronLeft className="h-4 w-4" /> Back to Appointments
        </Link>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${tc.color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{tc.label}</h1>
              <p className="text-sm text-gray-500">Booking: {selected.booking_id}</p>
            </div>
            <span className={`ml-auto text-xs font-bold px-3 py-1 rounded-full ${statusColors[selected.status] || 'bg-gray-100 text-gray-600'}`}>
              {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Appointment Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Doctor</span>
                  <span className="font-medium text-gray-900">Dr. {selected.doctor_name || 'Dr Rajesh Goel'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium text-gray-900">
                    {selected.booking_date ? new Date(selected.booking_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Time</span>
                  <span className="font-medium text-gray-900">{selected.booking_time}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Clinic</span>
                  <span className="font-medium text-gray-900">{clinicNames[selected.clinic_id || ''] || selected.clinic_id || 'Online'}</span>
                </div>
                {selected.reason && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Reason</span>
                    <span className="font-medium text-gray-900 text-right max-w-[60%]">{selected.reason}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Payment</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-medium text-gray-900">
                    {selected.consultation_fee != null
                      ? (selected.consultation_fee_currency === 'USD' ? `$${selected.consultation_fee}` : `₹${selected.consultation_fee}`)
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    selected.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selected.payment_status === 'paid' ? 'PAID' : 'UNPAID'}
                  </span>
                </div>
                {selected.payment_id && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Payment ID</span>
                    <span className="font-mono text-xs text-gray-600">{selected.payment_id}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {selected.complaints && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Medical Details</h3>
              <p className="text-sm text-gray-600">{selected.complaints}</p>
            </div>
          )}

          {selected.report_files && selected.report_files.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Uploaded Reports</h3>
              <div className="space-y-1">
                {selected.report_files.map((f: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="h-3.5 w-3.5 text-gray-400" />
                    {f.name || `Report ${i + 1}`}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>

      <div className="flex gap-1 bg-white p-1 rounded-xl border border-gray-100 overflow-x-auto">
        {[
          { key: 'all', label: `All (${bookings.length})` },
          { key: 'upcoming', label: `Upcoming` },
          { key: 'completed', label: `Completed` },
          { key: 'cancelled', label: `Cancelled` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              filter === tab.key ? 'bg-[#0A75BB] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No appointments found</p>
            <Link href="/book-appointment" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] transition-all">
              Book Appointment
            </Link>
          </div>
        ) : (
          filtered.map(b => {
            const tc = typeConfig[b.consultation_type] || typeConfig.offline;
            const Icon = tc.icon;
            return (
              <Link key={b.booking_id} href={`/patient/appointments?id=${b.booking_id}`}
                className="block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-all">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${tc.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{clinicNames[b.clinic_id || ''] || b.clinic_id || 'Online'}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[b.status] || 'bg-gray-100 text-gray-600'}`}>
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {b.booking_date ? new Date(b.booking_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />{b.booking_time}
                      </span>
                      {b.consultation_fee != null && (
                        <span className="font-medium text-[#0A75BB]">
                          {b.consultation_fee_currency === 'USD' ? `$${b.consultation_fee}` : `₹${b.consultation_fee}`}
                          <span className={`ml-1 text-[10px] ${b.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {b.payment_status === 'paid' ? 'PAID' : 'UNPAID'}
                          </span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{b.booking_id}</p>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-gray-300 rotate-180 shrink-0 mt-2" />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin h-8 w-8 border-4 border-[#0A75BB] border-t-transparent rounded-full" /></div>}>
      <AppointmentsContent />
    </Suspense>
  );
}
