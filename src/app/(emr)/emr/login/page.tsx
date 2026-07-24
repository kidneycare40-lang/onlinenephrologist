'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  ChevronRight,
  Stethoscope,
  Phone,
  Shield,
  UserCog,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, type EMRRole } from '@/lib/emr-auth-context';

const roleProfiles = [
  { role: 'doctor' as EMRRole, label: 'Doctor', description: 'Patients, consultations, prescriptions, reports', icon: Stethoscope, color: 'text-[#0A75BB]', bg: 'bg-blue-50', border: 'border-blue-200', email: '2311.rajesh@gmail.com' },
  { role: 'super_admin' as EMRRole, label: 'Admin', description: 'Full access — settings, users, billing, everything', icon: Shield, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', email: '2311.rajesh@gmail.com' },
  { role: 'receptionist' as EMRRole, label: 'Reception', description: 'Appointments, patients, billing', icon: UserCog, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', email: '2311.rajesh@gmail.com' },
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
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [needsSetup, setNeedsSetup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  function selectRole(profile: typeof roleProfiles[0]) {
    setSelectedProfile(profile.label);
    setEmail(profile.email);
    setError('');
    setNeedsSetup(false);
    setPin('');
  }

  function clearSelection() {
    setSelectedProfile(null);
    setEmail('');
    setError('');
    setNeedsSetup(false);
    setPin('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email'); return; }
    if (!pin || pin.length < 4) { setError('Please enter your PIN'); return; }
    setIsSubmitting(true);
    const result = await login(email, pin);
    setIsSubmitting(false);
    if (result.success) { router.push('/emr/clinic-selection'); }
    else if (result.needsSetup) { setNeedsSetup(true); setError(result.error || ''); }
    else { setError(result.error || 'Invalid credentials'); }
  }

  return (
    <div className="flex min-h-screen">
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
          <h2 className="text-3xl xl:text-4xl font-bold leading-tight mb-3">AI-Powered Clinic Management System</h2>
          <p className="text-base text-white/70 mb-10">Streamline your nephrology practice with intelligent tools designed for modern healthcare.</p>
          <div className="flex items-center gap-5 mb-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0">
              <Stethoscope className="h-9 w-9 text-white/80" />
            </div>
            <div className="text-sm text-white/60 leading-relaxed">Trusted by <span className="text-white font-semibold">50+ nephrologists</span> across India for daily clinical practice.</div>
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
          <p className="text-sm text-white/60 flex items-center gap-2"><Phone className="h-4 w-4" /> Need help? Call us @98182 35613</p>
          <p className="text-xs text-white/40">&copy; 2026 Kidney Care Centre. All rights reserved.</p>
        </div>
      </div>

      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center bg-white px-6 sm:px-10 lg:px-14 xl:px-20">
        <div className="w-full max-w-[420px]">
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
              <img src="/favicon.png" alt="KCC" className="h-7 w-7 object-contain" />
            </div>
            <span className="text-sm font-bold text-gray-900">Kidney Care Centre</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">Sign in to EMR</h2>
          <p className="text-sm text-gray-500 mt-1.5 mb-6">Select your role to continue.</p>

          {!selectedProfile ? (
            <div className="space-y-2.5 mb-6">
              {roleProfiles.map((profile) => {
                const Icon = profile.icon;
                const isSelected = selectedProfile === profile.label;
                return (
                  <button key={profile.role} type="button" onClick={() => selectRole(profile)}
                    className={cn(
                      'w-full text-left flex items-center gap-3.5 p-3.5 rounded-xl border-2 transition-all',
                      isSelected
                        ? 'border-[#0A75BB] bg-blue-50/50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    )}>
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', profile.bg)}>
                      <Icon className={cn('h-5 w-5', profile.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900">{profile.label}</div>
                      <div className="text-xs text-gray-500 truncate">{profile.description}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                  </button>
                );
              })}

              <button type="button" onClick={() => setSelectedProfile('other')}
                className="w-full text-center p-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-all">
                Other user
              </button>
            </div>
          ) : null}

          {error && !needsSetup && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3.5 py-2.5 mb-4">{error}</div>
          )}
          {needsSetup && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-3.5 py-3 mb-4 space-y-1.5">
              <p className="font-medium">Account not configured</p>
              <p>This account has no credentials set up. Ask an admin to assign a PIN/password in Settings &rarr; Users & Roles, or go to the <a href="/emr/setup" className="underline font-medium hover:text-amber-900">initial setup page</a>.</p>
            </div>
          )}

          {selectedProfile ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3.5 py-2.5 border border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{email}</span>
                </div>
                <button type="button" onClick={clearSelection}
                  className="text-xs text-[#0A75BB] hover:text-[#085D94] font-medium transition-colors">
                  Change
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">PIN</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400 pointer-events-none" />
                  <input type="password" inputMode="numeric" maxLength={6}
                    value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter your PIN" autoFocus
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30 focus:border-[#0A75BB] transition-all tracking-[0.3em] text-center font-mono" />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting || pin.length < 4}
                className="w-full h-11 rounded-lg text-sm font-semibold text-white transition-all mt-2 bg-gradient-to-r from-[#0A75BB] to-[#085D94] hover:from-[#085D94] hover:to-[#074D7A] focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/40 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-[#0A75BB]/25 hover:shadow-lg hover:shadow-[#0A75BB]/30">
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</span>
                ) : 'Sign in'}
              </button>
            </form>
          ) : null}

          <div className="text-center mt-2">
            <a href="/emr/setup" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              First time? <span className="underline">Set up your account</span>
            </a>
          </div>

          <p className="text-xs text-gray-400 text-center mt-5 leading-relaxed">By signing in, you agree to the EMR terms of use and data policy.</p>
        </div>
      </div>
    </div>
  );
}
