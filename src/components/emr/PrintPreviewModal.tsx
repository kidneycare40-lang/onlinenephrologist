'use client';

import React, { useRef, useState, useEffect } from 'react';
import { X, Printer, Mail } from 'lucide-react';
import PrescriptionPrint from './PrescriptionPrint';
import type { EMRConsultation, EMRPatient } from '@/types/emr';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: EMRPatient;
  consultation: EMRConsultation;
  consultationDate: string;
  testRequests?: string[];
  testRequestByWhen?: string;
  labResults?: { testName: string; value: string; unit: string; date: string; isAbnormal: boolean }[];
  onWhatsApp: () => void;
  onEmail: () => void;
  clinicId?: string;
}

export default function PrintPreviewModal({
  isOpen,
  onClose,
  patient,
  consultation,
  consultationDate,
  testRequests = [],
  testRequestByWhen,
  labResults = [],
  onWhatsApp,
  onEmail,
  clinicId,
}: PrintPreviewModalProps) {
  const prescriptionRef = useRef<HTMLDivElement>(null);
  const [letterheadMode, setLetterheadMode] = useState<'digital' | 'letterhead' | 'custom'>('digital');
  const [customHeaderImg, setCustomHeaderImg] = useState('');
  const [customFooterImg, setCustomFooterImg] = useState('');

  useEffect(() => {
    try {
      const hdr = clinicId ? (localStorage.getItem(`emr_custom_rx_header_${clinicId}`) || '') : '';
      const ftr = clinicId ? (localStorage.getItem(`emr_custom_rx_footer_${clinicId}`) || '') : '';
      setCustomHeaderImg(hdr);
      setCustomFooterImg(ftr);
      if (hdr || ftr) {
        setLetterheadMode('custom');
      }
    } catch { /* ignore */ }
  }, [clinicId]);

  const isCustom = letterheadMode === 'custom';

  const handlePrint = () => {
    const printContent = prescriptionRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const isLetterhead = letterheadMode === 'letterhead';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${patient.firstName} ${patient.lastName}</title>
        <style>
          @page {
            size: A4;
            margin: ${isLetterhead ? '60mm 10mm 50mm 10mm' : '5mm 8mm'};
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body {
            width: 100%;
            margin: 0;
            padding: 0;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10pt;
            line-height: 1.35;
            color: #000;
            background: #fff;
          }
          .rx-footer {
            position: relative;
          }
          @media print {
            html, body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .rx-prescription-table {
              width: 100% !important;
              border-collapse: collapse;
            }
            .rx-prescription-table thead {
              display: table-header-group !important;
            }
            .rx-prescription-table tbody td {
              vertical-align: top !important;
            }
            .rx-footer {
              position: fixed !important;
              bottom: 0 !important;
              left: 0 !important;
              right: 0 !important;
              width: 100% !important;
              z-index: 1000 !important;
              background: #fff !important;
            }
            .rx-medicine-row {
              page-break-inside: avoid !important;
            }
            .rx-advice-block,
            .rx-tests-block,
            .rx-signature {
              page-break-inside: avoid !important;
            }
          }
          @media screen {
            body { padding: 10px; }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/60 overflow-y-auto py-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[800px] mx-4 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 sticky top-0 bg-white rounded-t-xl z-10">
          <h3 className="font-semibold text-slate-800">Prescription Preview</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={onWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <img src="/icons/Whatsapp.png" alt="" className="h-4 w-4" />
              WhatsApp
            </button>
            <button
              onClick={onEmail}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              Email
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors ml-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Print Mode Selector */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-600">Header and Footer:</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setLetterheadMode('digital')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    letterheadMode === 'digital'
                      ? 'bg-[#0A75BB] text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Digital Header/Footer
                </button>
                <button
                  onClick={() => setLetterheadMode('letterhead')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    letterheadMode === 'letterhead'
                      ? 'bg-[#0A75BB] text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Use Own Letterhead
                </button>
                <button
                  onClick={() => setLetterheadMode('custom')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    letterheadMode === 'custom'
                      ? 'bg-[#0A75BB] text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Custom Design
                </button>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-[#0A75BB] rounded-lg hover:bg-[#085a94] transition-colors shadow-sm"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>
          </div>
          {letterheadMode === 'letterhead' && (
            <p className="mt-2 text-[11px] text-slate-500">
              Header and footer will be hidden. Content will be printed on your pre-printed letterhead paper.
            </p>
          )}
          {letterheadMode === 'custom' && (
            <p className="mt-2 text-[11px] text-slate-500">
              Custom header and footer images uploaded in Settings &gt; Prescription will be used. No digital header/footer.
            </p>
          )}
        </div>

        {/* Prescription content */}
        <div className="p-3 overflow-y-auto max-h-[calc(100vh-120px)]">
          <div className="border border-slate-200 rounded-lg shadow-sm">
            <PrescriptionPrint
              ref={prescriptionRef}
              patient={patient}
              consultation={consultation}
              consultationDate={consultationDate}
              testRequests={testRequests}
              testRequestByWhen={testRequestByWhen}
              labResults={labResults}
              useLetterhead={letterheadMode === 'letterhead'}
              useCustom={letterheadMode === 'custom'}
              customHeaderImage={customHeaderImg}
              customFooterImage={customFooterImg}
              clinicId={clinicId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
