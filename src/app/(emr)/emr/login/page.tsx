'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Stethoscope,
  Phone,
  KeyRound,
  Shield,
  UserCog,
  BadgeCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, type EMRRole } from '@/lib/emr-auth-context';

const roleProfiles: { role: EMRRole; label: string; description: string; icon: typeof Shield; color: string; bg: string; border: string }[] = [
  { role: 'admin', label: 'Admin', description: 'Full access — settings, users, billing, everything', icon: Shield, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  { role: 'doctor', label: 'Doctor', description: 'Patients, consultations, prescriptions, reports', icon: Stethoscope, color: 'text-[#0A75BB]', bg: 'bg-blue-50', border: 'border-blue-200' },
  { role: 'receptionist', label: 'Receptionist', description: 'Appointments, patients, billing', icon: UserCog, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
];

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
  const { login, users } = useAuth();
  const [selectedProfile, setSelectedProfile] = useState<EMRRole | null>(null);
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProfileInfo = roleProfiles.find((p) => p.role === selectedProfile);

  function handleProfileSelect(role: EMRRole) {
    setSelectedProfile(role);
    setEmail('');
    setPin('');
    setError('');
    const matchRole = users.find((u) => u.role === role);
    if (matchRole) setEmail(matchRole.email);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !pin) {
      setError('Please enter email and PIN');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      const success = login(email, pin);
      if (success) {
        router.push('/emr/clinic-selection');
      } else {
        setError('Invalid email or PIN');
      }
      setIsSubmitting(false);
    }, 500);
  }

  function handleQuickPinLogin(targetRole: EMRRole) {
    const user = users.find((u) => u.role === targetRole);
    if (user) {
      const success = login(user.email, user.pin);
      if (success) {
        router.push('/emr/clinic-selection');
      }
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
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
              <img src="/favicon.png" alt="KCC" className="h-7 w-7 object-contain" />
            </div>
            <span className="text-sm font-bold text-gray-900">Kidney Care Centre</span>
          </div>

          {!selectedProfile ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900">Select your profile</h2>
              <p className="text-sm text-gray-500 mt-1.5 mb-8">
                Choose your role to sign in to the EMR.
              </p>

              <div className="space-y-3">
                {roleProfiles.map((profile) => {
                  const Icon = profile.icon;
                  const count = users.filter((u) => u.role === profile.role).length;
                  return (
                    <button
                      key={profile.role}
                      onClick={() => handleProfileSelect(profile.role)}
                      className={cn(
                        'w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left group',
                        'hover:shadow-md',
                        profile.border,
                        profile.bg,
                      )}
                    >
                      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors', profile.color, 'bg-white/80')}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-bold', profile.color)}>{profile.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{profile.description}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{count} account{count !== 1 ? 's' : ''}</p>
                      </div>
                      <BadgeCheck className={cn('h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity', profile.color)} />
                    </button>
                  );
                })}
              </div>

              <p className="text-sm text-gray-500 text-center mt-6">
                Not an existing user?{' '}
                <a href="https://wa.me/919818235613?text=Hi%2C%20I%20need%20access%20to%20the%20KCC%20EMR%20system" target="_blank" rel="noopener noreferrer" className="text-[#0A75BB] hover:text-[#085D94] font-semibold transition-colors">
                  Contact Admin
                </a>
              </p>
            </>
          ) : (
            <>
              <button
                onClick={() => { setSelectedProfile(null); setError(''); setPin(''); }}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium mb-4 transition-colors"
              >
                &larr; Back to profiles
              </button>

              <div className={cn('flex items-center gap-3 p-3 rounded-xl mb-6', selectedProfileInfo?.bg, selectedProfileInfo?.border)}>
                {selectedProfileInfo && <selectedProfileInfo.icon className={cn('h-6 w-6', selectedProfileInfo.color)} />}
                <div>
                  <p className={cn('text-sm font-bold', selectedProfileInfo?.color)}>{selectedProfileInfo?.label} Login</p>
                  <p className="text-xs text-gray-500">Enter your email and PIN</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3.5 py-2.5 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400 pointer-events-none" />
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className={cn('w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30 focus:border-[#0A75BB] transition-all duration-200')}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">PIN</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400 pointer-events-none" />
                    <input
                      type={showPin ? 'text' : 'password'} inputMode="numeric" maxLength={6}
                      value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter your PIN"
                      className={cn('w-full h-11 pl-10 pr-11 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30 focus:border-[#0A75BB] transition-all duration-200 tracking-[0.3em] text-center font-mono')}
                      required
                    />
                    <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                      {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit" disabled={isSubmitting || !email || !pin}
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

              <p className="text-xs text-gray-400 text-center mt-5 leading-relaxed">
                By signing in, you agree to the EMR terms of use and data policy.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
