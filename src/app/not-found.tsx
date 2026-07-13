'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Phone } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <img src="/images/kidney_logo.png" alt="Kidney Care Centre" className="h-16 mx-auto opacity-80" />
        </div>

        <div className="text-8xl font-black text-white/10 mb-4">404</div>

        <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-slate-400 text-sm mb-8">
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-[#0A75BB] hover:bg-[#085D94] text-white font-semibold rounded-xl transition-colors"
          >
            <Home className="h-4 w-4" /> Go to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 font-semibold rounded-xl transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 mb-3">Need help? Contact us</p>
          <a
            href="https://wa.me/919818235688"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium rounded-lg hover:bg-emerald-600/30 transition-colors"
          >
            <Phone className="h-3.5 w-3.5" /> WhatsApp: 9818235688
          </a>
        </div>

        <p className="mt-8 text-[11px] text-slate-600">
          &copy; {new Date().getFullYear()} Kidney Care Centre / Online Nephrologist
        </p>
      </div>
    </div>
  );
}
