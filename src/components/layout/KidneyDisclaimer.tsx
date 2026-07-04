'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

const STORAGE_KEY = 'kcc_disclaimer_seen';

export function KidneyDisclaimer() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      setShow(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Kidney Donation Disclaimer">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleDismiss} />

      {/* Modal */}
      <div className="relative bg-gray-900 text-white rounded-2xl max-w-md w-full mx-auto shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
        {/* Top accent */}
        <div className="h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500" />

        <div className="p-6 sm:p-8 text-center">
          {/* Icon */}
          <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-7 w-7 text-red-400" />
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-bold mb-1">Important Public Notice</h2>
          <p className="text-cyan-400 font-semibold text-xs sm:text-sm mb-5">Kidney Donation &amp; Transplant Disclaimer</p>

          {/* Short Content */}
          <div className="text-sm text-gray-300 leading-relaxed text-left space-y-3">
            <p><strong className="text-white">Online Nephrologist / Kidney Care Centre</strong>, led by <strong className="text-white">Dr Rajesh Goel</strong>, does <strong className="text-white">not buy, sell, arrange, or facilitate</strong> kidney donations or organ transplants through this website, WhatsApp, phone calls, or any other channel.</p>

            <p>The <strong className="text-white">commercial sale or purchase of human organs is illegal and punishable</strong> under Indian law.</p>

            <p><strong className="text-white">We provide only medical consultation, diagnosis, treatment, and patient education.</strong></p>
          </div>

          {/* Read More Link */}
          <a
            href="/terms"
            onClick={handleDismiss}
            className="inline-block mt-4 text-cyan-400 hover:text-cyan-300 text-sm font-medium underline underline-offset-2 transition-colors"
          >
            Read full disclaimer &rarr;
          </a>

          {/* Button */}
          <button
            onClick={handleDismiss}
            className="mt-5 w-full py-4 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-base active:scale-[0.98]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            I Understand
          </button>

          {/* Copyright */}
          <p className="mt-3 text-xs text-gray-500">&copy; {new Date().getFullYear()} Online Nephrologist / Kidney Care Centre</p>
        </div>
      </div>
    </div>
  );
}
