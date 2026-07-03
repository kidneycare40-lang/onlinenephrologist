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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Kidney Donation Disclaimer">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleDismiss} />

      {/* Modal */}
      <div className="relative bg-gray-900 text-white rounded-2xl max-w-lg w-full mx-auto shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top accent */}
        <div className="h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500" />

        <div className="p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold mb-2">Important Public Notice</h2>
          <p className="text-cyan-400 font-semibold text-sm mb-6">Kidney Donation &amp; Transplant Disclaimer</p>

          {/* Content */}
          <div className="text-sm text-gray-300 leading-relaxed text-left space-y-4">
            <p><strong className="text-white">Online Nephrologist / Kidney Care Centre</strong>, led by <strong className="text-white">Dr Rajesh Goel</strong>, does <strong className="text-white">not buy, sell, arrange, or facilitate</strong> kidney donations or organ transplants through this website, social media platforms, WhatsApp, phone calls, or any other communication channel.</p>

            <p>We never request donors or recipients to contact us for the sale or purchase of a kidney.</p>

            <p>Please be aware that the <strong className="text-white">commercial sale or purchase of human organs is illegal and punishable</strong> under the applicable laws of India. Any requests related to buying or selling a kidney will not be entertained.</p>

            <p>Kidney transplantation is performed only at authorized transplant centres and is subject to:</p>

            <ul className="space-y-2 pl-1">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <span>Legal approval by the competent authorities.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <span>Comprehensive medical evaluation of both donor and recipient.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <span>Compliance with the Transplantation of Human Organs and Tissues Act (THOTA), 1994, and its applicable rules and amendments.</span>
              </li>
            </ul>

            <p>If you receive or make any request regarding the purchase or sale of a kidney through our name or channels, please treat it as <strong className="text-white">unauthorized</strong>.</p>

            <p><strong className="text-white">Online Nephrologist / Dr Rajesh Goel provides only medical consultation, diagnosis, treatment, and patient education.</strong></p>
          </div>

          {/* Button */}
          <button
            onClick={handleDismiss}
            className="mt-8 w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            I Understand
          </button>

          {/* Copyright */}
          <p className="mt-4 text-xs text-gray-500">&copy; {new Date().getFullYear()} Online Nephrologist / Kidney Care Centre. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
}
