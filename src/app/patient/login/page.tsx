'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Phone, Lock, User, ArrowRight, Loader2, CheckCircle, Shield, Mail } from 'lucide-react';

type Step = 'phone' | 'otp';

export default function PatientLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#0A75BB]" /></div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect') || '/patient/dashboard';
  const redirectTo = rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/patient/dashboard';
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [uhid, setUhid] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [patientInfo, setPatientInfo] = useState<{ id: string; firstName: string; lastName: string; email: string; emailVerified: boolean } | null>(null);

  // Check if already logged in
  useEffect(() => {
    fetch('/api/patient-auth/me').then(r => {
      if (r.ok) router.push(redirectTo);
    }).catch(() => {});
  }, [router, redirectTo]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handlePhoneLogin = async () => {
    setError('');
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    if (!uhid || uhid.trim().length < 4) {
      setError('Please enter your UHID (found on previous prescriptions or booking confirmations)');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/patient-auth/phone-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), uhid: uhid.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }
      setPatientInfo(data.patient);
      setLoading(false);

      if (data.verified || data.patient?.emailVerified) {
        // Email already verified — full access
        router.push(redirectTo);
      } else {
        // Basic session only — show email verification option
        setStep('otp');
      }
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const handleSendEmailOTP = async () => {
    setError('');
    if (!patientInfo?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientInfo.email)) {
      setError('No email on file. Please contact support to add your email.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/patient-auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: patientInfo.email.toLowerCase().trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send code');
        setLoading(false);
        return;
      }
      setLoading(false);
      setCountdown(60);
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const handleVerifyEmailOTP = async () => {
    setError('');
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/patient-auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: patientInfo?.email?.toLowerCase().trim(), otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid code');
        setLoading(false);
        return;
      }
      setLoading(false);
      router.push(redirectTo);
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <section className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#0A75BB]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {step === 'phone' ? <Phone className="h-8 w-8 text-[#0A75BB]" /> : <Mail className="h-8 w-8 text-[#0A75BB]" />}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {step === 'phone' ? 'Patient Portal' : 'Verify Email'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {step === 'phone' && 'Sign in with your phone number and UHID to access your bookings.'}
                {step === 'otp' && `Enter the code sent to ${patientInfo?.email || ''}`}
              </p>
            </div>

            {step === 'phone' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98182 35613"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent outline-none"
                      onKeyDown={(e) => e.key === 'Enter' && handlePhoneLogin()}
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">The phone number you used when booking</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UHID</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={uhid}
                      onChange={(e) => setUhid(e.target.value.trim().toUpperCase())}
                      placeholder="ONLINE-2026/1234"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent outline-none font-mono"
                      onKeyDown={(e) => e.key === 'Enter' && handlePhoneLogin()}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Found on your booking confirmation or prescription</p>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  onClick={handlePhoneLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <p className="text-xs text-blue-700 text-center">
                    <Shield className="h-3.5 w-3.5 inline mr-1" />
                    Phone + UHID gives you access to bookings and appointments.
                    Email verification unlocks prescriptions, reports, and medical documents.
                  </p>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  Don't have a UHID? <Link href="/book-appointment" className="text-[#0A75BB] hover:underline">Book an appointment first</Link>
                </p>
              </div>
            )}

            {step === 'otp' && patientInfo && (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  <p className="text-sm text-emerald-700">
                    Signed in as <span className="font-semibold">{patientInfo.firstName} {patientInfo.lastName}</span>
                  </p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs text-amber-700 text-center">
                    To access prescriptions, reports, and medical documents, please verify your email.
                    <br />Your bookings and appointments are already accessible.
                  </p>
                </div>
                {patientInfo.email ? (
                  <>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                      <p className="text-sm text-blue-700">
                        Check your email for the 6-digit verification code
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Enter Code</label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="6-digit code"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-center text-2xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleVerifyEmailOTP()}
                        autoFocus
                      />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <button
                      onClick={handleVerifyEmailOTP}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] transition-all disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                      {loading ? 'Verifying...' : 'Verify Email'}
                    </button>
                    <button
                      onClick={() => { handleSendEmailOTP(); setOtp(''); setError(''); }}
                      disabled={countdown > 0}
                      className="w-full text-sm text-[#0A75BB] hover:underline disabled:text-gray-400 disabled:no-underline"
                    >
                      {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
                    </button>
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-3">No email address on file.</p>
                    <p className="text-xs text-gray-400">Contact support at +91 98182 35613 to add your email.</p>
                  </div>
                )}
                <button
                  onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  &larr; Skip for now, go to dashboard
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 text-center space-y-2">
            <Link href={redirectTo === '/book-appointment' ? '/book-appointment' : '/'} className="text-sm text-[#0A75BB] hover:underline block">
              &larr; {redirectTo === '/book-appointment' ? 'Back to Book Appointment' : 'Back to Home'}
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
