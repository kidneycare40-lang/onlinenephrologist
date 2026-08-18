'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar, FileText, ClipboardList, Receipt, User, Clock,
  Video, MapPin, Globe, ChevronRight, AlertTriangle, Pill, MessageSquare,
} from 'lucide-react';

interface PortalData {
  account: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    gender: string | null;
    country: string | null;
    is_international: boolean;
  } | null;
  emrPatientId: string | null;
  upcomingBookings: any[];
  totalBookings: number;
  activeFollowUp: {
    id: string;
    original_booking_id: string;
    valid_until: string;
    consultation_type: string;
  } | null;
  recentPrescriptions: any[];
  recentInvoices: any[];
  recentReports: any[];
}

const typeConfig: Record<string, { label: string; icon: typeof Video; color: string }> = {
  online: { label: 'Online', icon: Video, color: 'text-purple-600 bg-purple-50' },
  offline: { label: 'Clinic', icon: MapPin, color: 'text-emerald-600 bg-emerald-50' },
  hospital: { label: 'Hospital', icon: MapPin, color: 'text-blue-600 bg-blue-50' },
  online_intl: { label: 'International', icon: Globe, color: 'text-amber-600 bg-amber-50' },
};

export default function PatientDashboardPage() {
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/patient-auth/portal')
      .then(r => r.ok ? r.json() : null)
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 border-[#0A75BB] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) return <p className="text-center text-gray-500 py-10">Failed to load dashboard.</p>;

  const displayName = data.account
    ? [data.account.first_name, data.account.last_name].filter(Boolean).join(' ') || data.account.email
    : 'Patient';

  const now = new Date().toISOString();
  const followUpDaysLeft = data.activeFollowUp
    ? Math.ceil((new Date(data.activeFollowUp.valid_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#0A75BB] text-white rounded-full flex items-center justify-center text-xl font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Welcome, {displayName}</h1>
            <p className="text-sm text-gray-500">
              {data.account?.email}
              {data.account?.is_international && data.account?.country ? ` · ${data.account.country}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Follow-Up Banner */}
      {data.activeFollowUp && followUpDaysLeft > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-emerald-900">FREE FOLLOW-UP AVAILABLE</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Your online consultation payment includes one free follow-up.{' '}
                <strong>{followUpDaysLeft} day{followUpDaysLeft !== 1 ? 's' : ''} remaining.</strong>
              </p>
              <p className="text-[10px] text-emerald-600 mt-1">
                Valid until: {new Date(data.activeFollowUp.valid_until).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <Link
              href={`/book-appointment?type=followup&entitlement=${data.activeFollowUp.id}`}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
            >
              Book Follow-up
            </Link>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/patient/appointments" className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-sm transition-all">
          <div className="text-2xl font-bold text-[#0A75BB]">{data.totalBookings}</div>
          <div className="text-xs text-gray-500">Appointments</div>
        </Link>
        <Link href="/patient/prescriptions" className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-sm transition-all">
          <div className="text-2xl font-bold text-purple-600">{data.recentPrescriptions.length}</div>
          <div className="text-xs text-gray-500">Prescriptions</div>
        </Link>
        <Link href="/patient/billing" className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-sm transition-all">
          <div className="text-2xl font-bold text-emerald-600">{data.recentInvoices.length}</div>
          <div className="text-xs text-gray-500">Invoices</div>
        </Link>
        <Link href="/patient/reports" className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-sm transition-all">
          <div className="text-2xl font-bold text-amber-600">{data.recentReports.length}</div>
          <div className="text-xs text-gray-500">Reports</div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/book-appointment" className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-sm transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0A75BB]/10 flex items-center justify-center shrink-0">
            <Calendar className="h-5 w-5 text-[#0A75BB]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Book Appointment</p>
            <p className="text-[10px] text-gray-500">Schedule a consultation</p>
          </div>
        </Link>
        <Link href="/patient/messages" className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-sm transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <MessageSquare className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Ask a Question</p>
            <p className="text-[10px] text-gray-500">Message the doctor</p>
          </div>
        </Link>
        <Link href="/patient/reports" className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-sm transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Upload Report</p>
            <p className="text-[10px] text-gray-500">Share test results</p>
          </div>
        </Link>
        <Link href="/patient/prescriptions" className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-sm transition-all flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <Pill className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">My Prescription</p>
            <p className="text-[10px] text-gray-500">View medications</p>
          </div>
        </Link>
      </div>

      {/* Upcoming Appointments */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Upcoming Appointments</h2>
          <Link href="/patient/appointments" className="text-xs text-[#0A75BB] font-medium hover:underline">View All</Link>
        </div>
        {data.upcomingBookings.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center border border-gray-100">
            <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-3">No upcoming appointments</p>
            <Link href="/book-appointment" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A75BB] text-white text-sm font-semibold rounded-xl hover:bg-[#085a94] transition-all">
              Book Appointment <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {data.upcomingBookings.slice(0, 3).map((b: any) => {
              const tc = typeConfig[b.consultation_type] || typeConfig.offline;
              const Icon = tc.icon;
              return (
                <Link key={b.booking_id} href={`/patient/appointments?id=${b.booking_id}`} className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${tc.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{tc.label}</span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        <span>{b.booking_date ? new Date(b.booking_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}</span>
                        <span>{b.booking_time}</span>
                        <span>{b.booking_id}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Prescriptions */}
      {data.recentPrescriptions.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Recent Prescriptions</h2>
            <Link href="/patient/prescriptions" className="text-xs text-[#0A75BB] font-medium hover:underline">View All</Link>
          </div>
          <div className="space-y-2">
            {data.recentPrescriptions.slice(0, 3).map((p: any) => (
              <Link key={p.id} href="/patient/prescriptions" className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                    <Pill className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{p.prescription_number}</p>
                    <p className="text-xs text-gray-500">{p.prescription_date} · {p.doctor_name}</p>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                    {p.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent Billing */}
      {data.recentInvoices.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">Recent Bills</h2>
            <Link href="/patient/billing" className="text-xs text-[#0A75BB] font-medium hover:underline">View All</Link>
          </div>
          <div className="space-y-2">
            {data.recentInvoices.slice(0, 3).map((inv: any) => (
              <Link key={inv.id} href="/patient/billing" className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <Receipt className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{inv.invoice_number}</p>
                    <p className="text-xs text-gray-500">{inv.invoice_date} · ₹{inv.grand_total}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    inv.status === 'PAID' ? 'bg-green-100 text-green-700' :
                    inv.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {inv.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
