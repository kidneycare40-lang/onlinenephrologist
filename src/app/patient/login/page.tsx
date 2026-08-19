'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Mail, Lock, User, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

type Step = 'email' | 'otp' | 'register';

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
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Registration fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const [timezone, setTimezone] = useState('');
  const [isInternational, setIsInternational] = useState(false);

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

  const handleSendOTP = async () => {
    setError('');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/patient-auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send code');
        setLoading(false);
        return;
      }
      setLoading(false);
      setStep('otp');
      setCountdown(60);
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
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
        body: JSON.stringify({ email: email.toLowerCase().trim(), otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid code');
        setLoading(false);
        return;
      }
      setLoading(false);
      if (data.isNew) {
        // New patient — need to complete registration
        setStep('register');
      } else {
        // Returning patient — logged in, go to redirect target
        router.push(redirectTo);
      }
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    if (!firstName.trim()) {
      setError('Please enter your first name');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/patient-auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() || undefined,
          gender: gender || undefined,
          country: country.trim() || undefined,
          timezone: timezone.trim() || undefined,
          isInternational,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create account');
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
                <User className="h-8 w-8 text-[#0A75BB]" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {step === 'register' ? 'Complete Registration' : 'Patient Login'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {step === 'email' && 'Enter your email to login or register'}
                {step === 'otp' && `Verification code sent to ${email}`}
                {step === 'register' && 'Create your patient account'}
              </p>
            </div>

            {step === 'email' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent outline-none"
                      onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                      autoFocus
                    />
                  </div>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </button>
                <p className="text-xs text-gray-400 text-center">
                  No SMS charges — code sent to your email
                </p>
              </div>
            )}

            {step === 'otp' && (
              <div className="space-y-4">
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
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyOTP()}
                    autoFocus
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  onClick={handleVerifyOTP}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
                <button
                  onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  &larr; Change email address
                </button>
                <button
                  onClick={() => { handleSendOTP(); setOtp(''); }}
                  disabled={countdown > 0}
                  className="w-full text-sm text-[#0A75BB] hover:underline disabled:text-gray-400 disabled:no-underline"
                >
                  {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
                </button>
              </div>
            )}

            {step === 'register' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Your email is verified. Please complete your profile to continue.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9818235613"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <div className="flex gap-2">
                    {['male', 'female', 'other'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border ${
                          gender === g
                            ? 'bg-[#0A75BB] text-white border-[#0A75BB]'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="international"
                    checked={isInternational}
                    onChange={(e) => setIsInternational(e.target.checked)}
                    className="rounded border-gray-300 text-[#0A75BB]"
                  />
                  <label htmlFor="international" className="text-sm text-gray-700">I am an international patient</label>
                </div>
                {isInternational && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. USA" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                      <input type="text" value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="e.g. EST" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent outline-none" />
                    </div>
                  </div>
                )}
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 text-center space-y-2">
            <Link href={redirectTo === '/book-appointment' ? '/book-appointment' : '/patient/dashboard'} className="text-sm text-[#0A75BB] hover:underline block">
              &larr; {redirectTo === '/book-appointment' ? 'Back to Book Appointment' : 'Go to Dashboard'}
            </Link>
            <Link href="/patient/dashboard" className="text-sm text-gray-400 hover:text-gray-600 block">
              Go to Dashboard &rarr;
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
