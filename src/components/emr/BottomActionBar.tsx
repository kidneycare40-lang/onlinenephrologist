'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Download, Printer, Save, PhoneOff } from 'lucide-react';

interface BottomActionBarProps {
  onSave: () => void;
  onEndConsultation: () => void;
  onPrint: () => void;
  onDownloadPDF: () => void;
  onWhatsApp: () => void;
  isSaving?: boolean;
}

export default function BottomActionBar({
  onSave,
  onEndConsultation,
  onPrint,
  onDownloadPDF,
  onWhatsApp,
  isSaving,
}: BottomActionBarProps) {
  return (
    <div className="shrink-0 bg-white border-t border-slate-200 shadow-lg no-print safe-area-bottom z-[70]">
      <div className="h-14 flex items-center justify-end px-3 sm:px-4 max-w-[1800px] mx-auto">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onWhatsApp}
            className="flex items-center justify-center gap-1.5 px-3 sm:px-4 h-11 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
            aria-label="Send WhatsApp"
          >
            <img src="/icons/Whatsapp.png" alt="" className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          <button
            onClick={onDownloadPDF}
            className="flex items-center justify-center gap-1.5 px-3 sm:px-4 h-11 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
            aria-label="Download PDF"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download PDF</span>
          </button>

          <button
            onClick={onPrint}
            className="flex items-center justify-center gap-1.5 px-3 sm:px-4 h-11 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
            aria-label="Print Prescription"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center justify-center gap-1.5 px-4 sm:px-5 h-11 bg-[#0A75BB] text-white rounded-lg text-sm font-semibold hover:bg-[#085a94] transition-colors disabled:opacity-50"
            aria-label="Save Consultation"
          >
            <Save className="h-4 w-4" />
            <span>Save</span>
          </button>

          <button
            onClick={onEndConsultation}
            className="flex items-center justify-center gap-1.5 px-3 sm:px-4 h-11 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
            aria-label="End Consultation"
          >
            <PhoneOff className="h-4 w-4" />
            <span className="hidden sm:inline">End</span>
          </button>
        </div>
      </div>
    </div>
  );
}
