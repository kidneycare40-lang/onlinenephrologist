'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Mail, Lock, User, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import {
  sendOTP,
  verifyOTP,
  findPatientByEmail,
  registerPatient,
  loginPatient,
} from '@/lib/patient-auth';

type Step = 'email' | 'otp' | 'register';

export default function PatientLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [isInternational, setIsInternational] = useState(false);
  const [country, setCountry] = useState('');
  const [timezone, setTimezone] = useState('');

  const handleSendOTP = () => {
    setError('');
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const otpCode = sendOTP(email.toLowerCase().trim());
      setGeneratedOTP(otpCode);
      setLoading(false);
      setStep('otp');
    }, 1000);
  };

  const handleVerifyOTP = () => {
    setError('');
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const valid = verifyOTP(email.toLowerCase().trim(), otp);
      if (!valid) {
        setLoading(false);
        setError('Invalid or expired code. Please try again.');
        return;
      }
      const existing = findPatientByEmail(email.toLowerCase().trim());
      if (existing) {
        loginPatient(email.toLowerCase().trim());
        setLoading(false);
        router.push('/patient/dashboard');
      } else {
        setLoading(false);
        setStep('register');
      }
    }, 1000);
  };

  const handleRegister = () => {
    setError('');
    if (!name.trim()) { setError('Please enter your name'); return; }
    setLoading(true);
    setTimeout(() => {
      try {
        registerPatient({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone.trim() || undefined,
          age: age ? parseInt(age) : undefined,
          gender,
          isInternational,
          country: country.trim() || undefined,
          timezone: timezone.trim() || undefined,
        });
        setLoading(false);
        router.push('/patient/dashboard');
      } catch (e: any) {
        setLoading(false);
        setError(e.message);
      }
    }, 1000);
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
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                  <p className="text-xs text-amber-600 mb-1">Your verification code (for testing)</p>
                  <p className="text-2xl font-bold font-mono text-amber-700 tracking-[0.3em]">{generatedOTP}</p>
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
                <button onClick={() => { setStep('email'); setOtp(''); setError(''); }} className="w-full text-sm text-gray-500 hover:text-gray-700">
                  &larr; Change email address
                </button>
                <button onClick={() => { handleSendOTP(); }} className="w-full text-sm text-[#0A75BB] hover:underline">
                  Resend Code
                </button>
              </div>
            )}

            {step === 'register' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9818235613" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="45" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <div className="flex gap-2">
                    {(['male', 'female', 'other'] as const).map((g) => (
                      <button key={g} onClick={() => setGender(g)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium border ${gender === g ? 'bg-[#0A75BB] text-white border-[#0A75BB]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="international" checked={isInternational} onChange={(e) => setIsInternational(e.target.checked)} className="rounded border-gray-300 text-[#0A75BB]" />
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
            <Link href="/book-appointment" className="text-sm text-[#0A75BB] hover:underline block">
              &larr; Back to Book Appointment
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
