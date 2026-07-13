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
  Shield,
  UserCog,
  BadgeCheck,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, type EMRRole } from '@/lib/emr-auth-context';

const roleProfiles = [
  { role: 'doctor' as EMRRole, label: 'Doctor', description: 'Patients, consultations, prescriptions, reports', icon: Stethoscope, color: 'text-[#0A75BB]', bg: 'bg-blue-50', border: 'border-blue-200' },
  { role: 'receptionist' as EMRRole, label: 'Receptionist', description: 'Appointments, patients, billing', icon: UserCog, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { role: 'super_admin' as EMRRole, label: 'Admin', description: 'Full access — settings, users, billing, everything', icon: Shield, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
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
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter email and password'); return; }
    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);
    if (result.success) { router.push('/emr/dashboard'); }
    else { setError(result.error || 'Invalid email or password'); }
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
          <p className="text-sm text-gray-500 mt-1.5 mb-8">Enter your email and password to continue.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3.5 py-2.5 mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400 pointer-events-none" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30 focus:border-[#0A75BB] transition-all" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400 pointer-events-none" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full h-11 pl-10 pr-11 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30 focus:border-[#0A75BB] transition-all" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isSubmitting || !email || !password} className="w-full h-11 rounded-lg text-sm font-semibold text-white transition-all mt-2 bg-gradient-to-r from-[#0A75BB] to-[#085D94] hover:from-[#085D94] hover:to-[#074D7A] focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/40 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-[#0A75BB]/25 hover:shadow-lg hover:shadow-[#0A75BB]/30">
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</span>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-5 leading-relaxed">By signing in, you agree to the EMR terms of use and data policy.</p>
        </div>
      </div>
    </div>
  );
}
