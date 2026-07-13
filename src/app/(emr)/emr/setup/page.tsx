'use client';

import { useState } from 'react';
import { Shield, Mail, KeyRound, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function SetupPage() {
  const [email, setEmail] = useState('2311.rajesh@gmail.com');
  const [pin, setPin] = useState('');
  const [setupKey, setSetupKey] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!email || !pin || pin.length < 4) { setMessage({ type: 'error', text: 'Enter a valid email and 4-6 digit PIN' }); return; }
    if (!setupKey) { setMessage({ type: 'error', text: 'Enter the setup key from your server environment' }); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin, setupKey }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'PIN set successfully! You can now log in.' });
        setPin('');
        setSetupKey('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Setup failed' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Is the server running?' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <a href="/emr/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </a>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Shield className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Initial Setup</h1>
              <p className="text-sm text-gray-500">Configure the first admin account PIN</p>
            </div>
          </div>

          {message && (
            <div className={`text-sm rounded-lg px-3.5 py-2.5 mb-4 flex items-start gap-2 ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
              {message.type === 'success' ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" /> : null}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New PIN (4-6 digits)</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input type="password" inputMode="numeric" maxLength={6}
                  value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="e.g. 1234"
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-300 text-sm text-center font-mono tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Setup Key</label>
              <input type="password" value={setupKey} onChange={(e) => setSetupKey(e.target.value)}
                placeholder="From SETUP_KEY environment variable"
                className="w-full h-11 px-4 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500" required />
              <p className="text-xs text-gray-400 mt-1.5">Ask your system admin for the setup key, or check the server&apos;s .env file.</p>
            </div>

            <button type="submit" disabled={isSubmitting || !email || pin.length < 4 || !setupKey}
              className="w-full h-11 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 disabled:opacity-70 disabled:cursor-not-allowed shadow-md">
              {isSubmitting ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Setting up...</span> : 'Set PIN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
