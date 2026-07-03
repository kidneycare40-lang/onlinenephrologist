'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Mail, Printer, Save, PhoneOff } from 'lucide-react';

interface BottomActionBarProps {
  onSave: () => void;
  onEndConsultation: () => void;
  onPrint: () => void;
  onEmail: () => void;
  onWhatsApp: () => void;
  isSaving?: boolean;
}

export default function BottomActionBar({
  onSave,
  onEndConsultation,
  onPrint,
  onEmail,
  onWhatsApp,
  isSaving,
}: BottomActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg no-print safe-area-bottom">
      <div className="h-14 flex items-center justify-end px-3 sm:px-4 max-w-[1800px] mx-auto">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onWhatsApp}
            className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors touch-target"
          >
            <img src="/icons/Whatsapp.png" alt="" className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          <button
            onClick={onEmail}
            className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors touch-target"
          >
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </button>

          <button
            onClick={onPrint}
            className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors touch-target"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 bg-[#0A75BB] text-white rounded-lg text-sm font-semibold hover:bg-[#085a94] transition-colors disabled:opacity-50 touch-target"
          >
            <Save className="h-4 w-4" />
            <span>Save</span>
          </button>

          <button
            onClick={onEndConsultation}
            className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors touch-target"
          >
            <PhoneOff className="h-4 w-4" />
            <span className="hidden sm:inline">End Consultation</span>
          </button>
        </div>
      </div>
    </div>
  );
}
