'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Stethoscope,
  Phone,
  KeyRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  'Digital Prescriptions in 30 seconds',
  'Complete Patient EMR Management',
  'AI-Assisted Clinical Notes',
  'Drug Interaction Alerts',
  'WhatsApp Prescription Delivery',
  'Lab Trend Graphs & Analytics',
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [showPinLogin, setShowPinLogin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/emr/clinic-selection');
    }, 800);
  }

  function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPinError('');
    if (pin === '1256') {
      router.push('/emr/clinic-selection');
    } else {
      setPinError('Invalid PIN. Please try again.');
      setPin('');
    }
  }

  function handlePinInput(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setPin(digits);
    if (digits.length === 4 && digits !== '1256') {
      setPinError('Invalid PIN');
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between bg-gradient-to-br from-[#0A75BB] to-[#085D94] text-white p-10 xl:p-14">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center overflow-hidden">
              <img src="/favicon.png" alt="KCC" className="h-9 w-9 object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Kidney Care Centre</h1>
              <p className="text-sm text-white/70 font-medium">EMR System</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-lg">
          <h2 className="text-3xl xl:text-4xl font-bold leading-tight mb-3">
            AI-Powered Clinic Management System
          </h2>
          <p className="text-base text-white/70 mb-10">
            Streamline your nephrology practice with intelligent tools designed for modern healthcare.
          </p>

          <div className="flex items-center gap-5 mb-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0">
              <Stethoscope className="h-9 w-9 text-white/80" />
            </div>
            <div className="text-sm text-white/60 leading-relaxed">
              Trusted by <span className="text-white font-semibold">50+ nephrologists</span> across India for daily clinical practice.
            </div>
          </div>

          <div className="space-y-3">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <span className="text-sm text-white/85 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 space-y-2 pt-6 border-t border-white/10">
          <p className="text-sm text-white/60 flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Need help? Call us @98182 35613
          </p>
          <p className="text-xs text-white/40">&copy; 2026 Kidney Care Centre. All rights reserved.</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center bg-white px-6 sm:px-10 lg:px-14 xl:px-20">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
              <img src="/favicon.png" alt="KCC" className="h-7 w-7 object-contain" />
            </div>
            <span className="text-sm font-bold text-gray-900">Kidney Care Centre</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            {showPinLogin ? 'Quick Login' : 'Sign in'}
          </h2>
          <p className="text-sm text-gray-500 mt-1.5 mb-6">
            {showPinLogin
              ? 'Enter your 4-digit PIN to access the EMR.'
              : 'Welcome back! Please enter your details.'}
          </p>

          {!showPinLogin ? (
            <>
              {/* Demo hint */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3.5 py-2.5 mb-6">
                <p className="text-xs text-blue-700 font-medium">Demo Credentials</p>
                <p className="text-xs text-blue-600 mt-0.5">Email: <span className="font-mono">admin@kcc.in</span> &nbsp; Password: <span className="font-mono">admin123</span></p>
                <p className="text-xs text-blue-500 mt-1">Any valid email/password works for demo.</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3.5 py-2.5 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400 pointer-events-none" />
                    <input
                      id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className={cn('w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30 focus:border-[#0A75BB] transition-all duration-200')}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400 pointer-events-none" />
                    <input
                      id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className={cn('w-full h-11 pl-10 pr-11 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30 focus:border-[#0A75BB] transition-all duration-200')}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-[#0A75BB] focus:ring-[#0A75BB]/30 cursor-pointer" />
                    <span className="text-sm text-gray-600">Remember Me</span>
                  </label>
                  <button type="button" className="text-sm text-[#0A75BB] hover:text-[#085D94] font-medium transition-colors">Forgot Password?</button>
                </div>

                <button
                  type="submit" disabled={isSubmitting}
                  className={cn('w-full h-11 rounded-lg text-sm font-semibold text-white transition-all duration-200 mt-2 bg-gradient-to-r from-[#0A75BB] to-[#085D94] hover:from-[#085D94] hover:to-[#074D7A] focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/40 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-[#0A75BB]/25 hover:shadow-lg hover:shadow-[#0A75BB]/30')}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Signing in...
                    </span>
                  ) : 'Sign in'}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-sm"><span className="bg-white px-3 text-gray-400">or</span></div>
              </div>

              <button
                onClick={() => { setShowPinLogin(true); setError(''); }}
                type="button"
                className={cn('w-full h-11 rounded-lg text-sm font-semibold text-white transition-all duration-200', 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700', 'focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:ring-offset-2', 'shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/30', 'flex items-center justify-center gap-2')}
              >
                <KeyRound className="h-4 w-4" />
                Quick Login with PIN
              </button>
            </>
          ) : (
            <>
              {pinError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3.5 py-2.5 mb-4">
                  {pinError}
                </div>
              )}

              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">4-Digit PIN</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400 pointer-events-none" />
                    <input
                      type="password" inputMode="numeric" maxLength={4} autoFocus
                      value={pin} onChange={(e) => handlePinInput(e.target.value)}
                      placeholder="Enter PIN"
                      className={cn('w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30 focus:border-[#0A75BB] transition-all duration-200 tracking-[0.5em] text-center font-mono text-lg')}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit" disabled={pin.length !== 4}
                  className={cn('w-full h-11 rounded-lg text-sm font-semibold text-white transition-all duration-200 mt-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/30')}
                >
                  Login
                </button>
              </form>

              <button
                onClick={() => { setShowPinLogin(false); setPin(''); setPinError(''); }}
                type="button"
                className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium mt-4 text-center transition-colors"
              >
                Back to Sign in
              </button>
            </>
          )}

          <p className="text-xs text-gray-400 text-center mt-5 leading-relaxed">
            By clicking Sign in, you agree to{' '}
            <button type="button" className="text-[#0A75BB] hover:underline">Terms of Service</button>
            {' '}and{' '}
            <button type="button" className="text-[#0A75BB] hover:underline">Privacy Policy</button>
          </p>

          <p className="text-sm text-gray-500 text-center mt-6">
            Not an existing user?{' '}
            <a href="https://wa.me/919818235613?text=Hi%2C%20I%20need%20access%20to%20the%20KCC%20EMR%20system" target="_blank" rel="noopener noreferrer" className="text-[#0A75BB] hover:text-[#085D94] font-semibold transition-colors">
              Contact Admin
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
