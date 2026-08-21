'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar, FileText, ClipboardList, Receipt, User, Clock,
  Video, MapPin, Globe, ChevronRight, Pill, MessageSquare,
  Shield, Lock, Mail, CheckCircle, HelpCircle, Bell,
  CreditCard,
} from 'lucide-react';

interface PortalData {
  account: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    email_verified: boolean;
    phone: string | null;
    gender: string | null;
    country: string | null;
    is_international: boolean;
  } | null;
  emrPatientId: string | null;
  uhid: string | null;
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

const typeConfig: Record<string, { label: string; icon: typeof Video; color: string; bg: string }> = {
  online: { label: 'Online Video Consultation', icon: Video, color: 'text-purple-600', bg: 'bg-purple-100' },
  offline: { label: 'In-Clinic Visit', icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  hospital: { label: 'Hospital Visit', icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-100' },
  online_intl: { label: 'International Video', icon: Globe, color: 'text-amber-600', bg: 'bg-amber-100' },
};

function fmtDate(d: string) {
  if (!d) return '';
  return new Date(d + (d.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtDay(d: string) {
  if (!d) return '';
  return new Date(d + (d.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('en-IN', { weekday: 'long' });
}

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
  const isVerified = data.account?.email_verified || false;
  const followUpDaysLeft = data.activeFollowUp
    ? Math.ceil((new Date(data.activeFollowUp.valid_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;
  const totalPaid = data.recentInvoices
    .filter((i: any) => i.status === 'paid' || i.status === 'PAID')
    .reduce((sum: number, i: any) => sum + (Number(i.total || i.amount) || 0), 0);

  const recentActivity: { type: string; title: string; subtitle: string; date: string; icon: typeof Calendar; color: string; bg: string }[] = [];
  for (const b of (data.upcomingBookings || []).slice(0, 5)) {
    if (b.payment_status === 'paid') {
      recentActivity.push({ type: 'payment', title: 'Payment Successful', subtitle: `₹${b.consultation_fee || 0} for appointment on ${fmtDate(b.booking_date)}`, date: b.updated_at || b.created_at, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-100' });
    }
    recentActivity.push({ type: 'booking', title: 'Appointment Booked', subtitle: `${b.booking_date}, ${b.booking_time}${b.doctor_name ? ` with ${b.doctor_name}` : ''}`, date: b.created_at, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100' });
  }
  for (const p of (data.recentPrescriptions || []).slice(0, 3)) {
    recentActivity.push({ type: 'prescription', title: 'Prescription Added', subtitle: `${p.doctor_name || 'Dr. Rajesh Goel'} — ${p.prescription_date || ''}`, date: p.created_at || p.prescription_date, icon: Pill, color: 'text-purple-600', bg: 'bg-purple-100' });
  }
  recentActivity.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

  const nextBooking = data.upcomingBookings[0];
  const nextTc = nextBooking ? (typeConfig[nextBooking.consultation_type] || typeConfig.online) : null;
  const NextIcon = nextTc?.icon || Video;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">Welcome back,</p>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
            {isVerified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                <CheckCircle className="h-3.5 w-3.5" /> Verified
              </span>
            )}
          </div>
          {data.uhid && <p className="text-sm text-gray-500 mt-0.5">UHID: <span className="font-mono font-semibold text-gray-700">{data.uhid}</span></p>}
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" title="Help">
            <HelpCircle className="h-5 w-5" />
          </button>
          <button className="relative p-2.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" title="Notifications">
            <Bell className="h-5 w-5" />
          </button>
          <div className="w-10 h-10 bg-[#0A75BB] text-white rounded-full flex items-center justify-center text-sm font-bold">
            {displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
          </div>
        </div>
      </div>

      {/* Verification Banner */}
      {isVerified ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-900">Your account is verified</p>
              <p className="text-xs text-emerald-700">You have full access to all your medical information.</p>
            </div>
          </div>
          <Link href="/patient/profile" className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors">View Profile</Link>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Shield className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">Email Verification Required</p>
              <p className="text-xs text-amber-700">Verify your email to access prescriptions, reports, and medical documents.</p>
            </div>
          </div>
          <Link href="/patient/login" className="px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap">Verify Email</Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/patient/appointments" className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group">
          <div className="w-10 h-10 rounded-lg bg-[#0A75BB]/10 flex items-center justify-center mb-3">
            <Calendar className="h-5 w-5 text-[#0A75BB]" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Upcoming Appointments</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{data.upcomingBookings.length}</p>
          <p className="text-xs text-[#0A75BB] font-medium mt-2 group-hover:underline">View all &rarr;</p>
        </Link>
        <Link href={isVerified ? "/patient/prescriptions" : "#"} className={`bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group ${!isVerified ? 'opacity-60' : ''}`}>
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
            <FileText className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Prescriptions</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{isVerified ? data.recentPrescriptions.length : '\u2014'}</p>
          <p className="text-xs text-[#0A75BB] font-medium mt-2 group-hover:underline">View all &rarr;</p>
        </Link>
        <Link href={isVerified ? "/patient/reports" : "#"} className={`bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group ${!isVerified ? 'opacity-60' : ''}`}>
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mb-3">
            <ClipboardList className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Reports</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{isVerified ? data.recentReports.length : '\u2014'}</p>
          <p className="text-xs text-[#0A75BB] font-medium mt-2 group-hover:underline">View all &rarr;</p>
        </Link>
        <Link href={isVerified ? "/patient/billing" : "#"} className={`bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group ${!isVerified ? 'opacity-60' : ''}`}>
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-3">
            <Receipt className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Total Payments</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{isVerified && totalPaid > 0 ? `\u20B9${totalPaid.toLocaleString('en-IN')}` : '\u2014'}</p>
          <p className="text-xs text-[#0A75BB] font-medium mt-2 group-hover:underline">View all &rarr;</p>
        </Link>
      </div>

      {/* Two-Column: Upcoming Appointment + Follow-up / Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Appointment */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">Upcoming Appointment</h2>
              <Link href="/patient/appointments" className="text-xs text-[#0A75BB] font-medium hover:underline">View all</Link>
            </div>
            {nextBooking ? (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                    <img src="/images/dr-rajesh-goel.jpg" alt="Dr Rajesh Goel" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">Dr. Rajesh Goel</h3>
                    <p className="text-xs text-gray-500">Senior Nephrologist &amp; Kidney Transplant Physician</p>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-gray-400" /> {fmtDate(nextBooking.booking_date)}</span>
                      <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-gray-400" /> {nextBooking.booking_time}</span>
                      {nextTc && <span className="flex items-center gap-1.5"><NextIcon className="h-4 w-4 text-gray-400" /> {nextTc.label}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        {nextBooking.status?.charAt(0).toUpperCase() + nextBooking.status?.slice(1) || 'Confirmed'}
                      </span>
                      <span className="text-xs text-gray-400">Booking ID: {nextBooking.booking_id}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
                <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-3">No upcoming appointments</p>
                <Link href="/book-appointment" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A75BB] text-white text-sm font-semibold rounded-xl hover:bg-[#085a94] transition-all">
                  Book Appointment <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Recent Activity</h2>
              <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                {recentActivity.slice(0, 5).map((a, i) => {
                  const AIcon = a.icon;
                  return (
                    <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${a.bg} flex items-center justify-center shrink-0`}>
                        <AIcon className={`h-4 w-4 ${a.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{a.title}</p>
                        <p className="text-xs text-gray-500 truncate">{a.subtitle}</p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">{fmtDate(a.date)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Follow-up Available */}
          {data.activeFollowUp && followUpDaysLeft > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900">Follow-up Available</h3>
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <p className="text-sm text-gray-600 mt-2">Your follow-up is available</p>
                <p className="text-xs text-gray-500 mt-1">Valid until: {fmtDate(data.activeFollowUp.valid_until)}</p>
              </div>
              <div className="px-5 pb-5">
                <Link href={`/book-appointment?type=followup&entitlement=${data.activeFollowUp.id}`} className="block w-full text-center px-4 py-3 bg-[#0A75BB] text-white text-sm font-semibold rounded-lg hover:bg-[#085a94] transition-colors">
                  Book Follow-up Appointment
                </Link>
                <p className="text-xs text-gray-400 text-center mt-2">Continue your care with Dr. Rajesh Goel</p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/book-appointment" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-[#0A75BB]/10 flex items-center justify-center"><Calendar className="h-4 w-4 text-[#0A75BB]" /></div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Book New Appointment</span>
              </Link>
              <Link href={isVerified ? "/patient/reports" : "#"} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group ${!isVerified ? 'opacity-50' : ''}`}>
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center"><FileText className="h-4 w-4 text-amber-600" /></div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Upload Medical Report</span>
              </Link>
              <Link href={isVerified ? "/patient/prescriptions" : "#"} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group ${!isVerified ? 'opacity-50' : ''}`}>
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center"><Pill className="h-4 w-4 text-purple-600" /></div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">View Prescriptions</span>
              </Link>
              <Link href="/patient/messages" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center"><MessageSquare className="h-4 w-4 text-emerald-600" /></div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Contact Doctor</span>
              </Link>
            </div>
            <Link href="/patient/appointments" className="block text-center text-xs text-[#0A75BB] font-medium mt-3 hover:underline">View All &rarr;</Link>
          </div>
        </div>
      </div>

      {/* Sensitive Information Protection */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-5 w-5 text-[#0A75BB]" />
          <h3 className="font-bold text-gray-900 text-sm">Sensitive Information Protection</h3>
        </div>
        <p className="text-xs text-gray-500 mb-4">Your medical records, prescriptions, reports and billing details are protected with verified access.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Lock, label: 'Prescriptions' },
            { icon: FileText, label: 'Medical Reports' },
            { icon: ClipboardList, label: 'Consultation Notes' },
            { icon: Receipt, label: 'Detailed Billing' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <div className="w-9 h-9 rounded-lg bg-[#0A75BB]/10 flex items-center justify-center">
                <item.icon className="h-4 w-4 text-[#0A75BB]" />
              </div>
              <span className="text-xs font-medium text-gray-600 text-center">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
