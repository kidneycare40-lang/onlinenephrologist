'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, FileText, RotateCcw } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { patients as mockPatients } from '@/lib/data/emr-mock';
import { useClinic } from '@/lib/emr-clinic-context';
import { patientsApi } from '@/lib/api-client';
import type { EMRInvoice, InvoiceItem, InvoiceStatus, PaymentMethod, VisitType } from '@/types/emr';

const clinicLabels: Record<string, string> = {
  'kcc-faridabad': 'Kidney Care Centre, Faridabad',
  'kcc-saket': 'Kidney Care Centre, Saket',
  'psri-delhi': 'PSRI Hospital, Delhi',
  'online': 'Online Consultation',
  'online-intl': 'International Consultation',
};

const clinicFeeMap: Record<string, { newFee: number; followUpFee: number }> = {
  'kcc-faridabad': { newFee: 500, followUpFee: 300 },
  'kcc-saket': { newFee: 1200, followUpFee: 700 },
  'psri-delhi': { newFee: 500, followUpFee: 300 },
  'online': { newFee: 500, followUpFee: 300 },
  'online-intl': { newFee: 1500, followUpFee: 1000 },
};

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: EMRInvoice) => void;
  existingInvoice?: EMRInvoice | null;
}

export default function CreateInvoiceModal({ isOpen, onClose, onSave, existingInvoice }: CreateInvoiceModalProps) {
  const { clinicId: currentClinicId } = useClinic();
  const [patientSearch, setPatientSearch] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const [allPatients, setAllPatients] = useState<any[]>(mockPatients);
  const [selectedPatient, setSelectedPatient] = useState<{
    id: string;
    name: string;
    age?: number;
    gender?: 'Male' | 'Female' | 'Other';
    phone?: string;
    address?: string;
    clinicId?: string;
  } | null>(null);
  const [clinic, setClinic] = useState(currentClinicId || 'kcc-faridabad');
  const [visitType, setVisitType] = useState<VisitType>('NEW');
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paymentReference, setPaymentReference] = useState('');
  const [notes, setNotes] = useState('');

  const [adminBypassUnlocked, setAdminBypassUnlocked] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [showAdminPin, setShowAdminPin] = useState(false);
  const ADMIN_PIN = '2024';

  const feeConfig = clinicFeeMap[clinic] || clinicFeeMap['kcc-faridabad'];
  const consultationFee = visitType === 'FOLLOW_UP' ? feeConfig.followUpFee : feeConfig.newFee;
  const grandTotal = consultationFee - discount;
  const balance = grandTotal - paidAmount;

  useEffect(() => {
    if (!isOpen) return;
    setClinic(currentClinicId || 'kcc-faridabad');
    loadPatients();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (existingInvoice) {
      setSelectedPatient({
        id: existingInvoice.patientId,
        name: existingInvoice.patientName,
        age: existingInvoice.patientAge,
        gender: existingInvoice.patientGender,
        phone: existingInvoice.patientPhone,
        address: existingInvoice.patientAddress,
        clinicId: existingInvoice.clinicId,
      });
      setClinic(existingInvoice.clinicId);
      setVisitType(existingInvoice.visitType || 'NEW');
      setDiscount(existingInvoice.discount);
      setPaidAmount(existingInvoice.paidAmount);
      setPaymentMethod(existingInvoice.payments?.[0]?.method || 'CASH');
      setPaymentReference(existingInvoice.payments?.[0]?.reference || '');
      setNotes(existingInvoice.notes || '');
    } else {
      resetForm();
    }
  }, [isOpen, existingInvoice]);

  const resetForm = () => {
    setSelectedPatient(null);
    setVisitType('NEW');
    setDiscount(0);
    setPaidAmount(0);
    setPaymentMethod('CASH');
    setPaymentReference('');
    setNotes('');
    setPatientSearch('');
  };

  const loadPatients = async () => {
    try {
      const res = await patientsApi.list();
      if (res?.data?.length) {
        setAllPatients(res.data.map((p: any) => ({
          id: p.id,
          firstName: p.first_name,
          lastName: p.last_name,
          phone: p.phone || '',
          uhid: p.uhid || '',
          gender: p.gender === 'female' ? 'Female' : p.gender === 'other' ? 'Other' : 'Male',
          clinicId: p.clinic_id || 'kcc-faridabad',
        })));
        return;
      }
    } catch {}
    try {
      const added = JSON.parse(localStorage.getItem('emr_added_patients') || '[]');
      const bookings = JSON.parse(localStorage.getItem('emr_bookings') || '[]');
      const combined = [...mockPatients, ...added, ...bookings.map((b: any) => ({
        id: b.patientId || `obp-${b.bookingId}`,
        firstName: b.firstName || '',
        lastName: b.lastName || '',
        phone: b.phone || '',
        uhid: '',
        gender: b.gender || 'Male',
        clinicId: b.clinicId || 'online',
      }))];
      setAllPatients(combined.filter((p: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.id === p.id) === i));
    } catch {}
  };

  const filteredPatients = allPatients.filter(
    (p) =>
      (p.firstName || '').toLowerCase().includes(patientSearch.toLowerCase()) ||
      (p.lastName || '').toLowerCase().includes(patientSearch.toLowerCase()) ||
      (p.phone || '').includes(patientSearch)
  );

  const selectPatient = (patient: any) => {
    setSelectedPatient({
      id: patient.id,
      name: `${patient.firstName} ${patient.lastName}`.trim(),
      phone: patient.phone,
      gender: patient.gender,
      clinicId: patient.clinicId,
    });
    if (patient.clinicId && clinicFeeMap[patient.clinicId]) {
      setClinic(patient.clinicId);
    }
    setPatientSearch('');
  };

  const selectCustomPatient = (name: string) => {
    setSelectedPatient({ id: `custom-${Date.now()}`, name: name.trim(), phone: '', clinicId: clinic });
    setPatientSearch('');
  };

  const handleSave = () => {
    if (!selectedPatient) return;

    const finalPaidAmount = paidAmount >= grandTotal ? grandTotal : paidAmount;
    const finalStatus: InvoiceStatus = finalPaidAmount >= grandTotal ? 'PAID' : finalPaidAmount > 0 ? 'PARTIAL' : 'PENDING';

    const items: InvoiceItem[] = [{
      id: `item-${Date.now()}`,
      description: visitType === 'FOLLOW_UP' ? 'Follow-up Consultation fee' : 'Consultation fee',
      qty: 1,
      rate: consultationFee,
      amount: consultationFee,
      gstRate: 0,
      gstAmount: 0,
      total: consultationFee,
    }];

    const invoice: EMRInvoice = {
      id: existingInvoice?.id || `INV-${Date.now()}`,
      invoiceNumber: existingInvoice?.invoiceNumber || `KCC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patientAge: selectedPatient.age,
      patientGender: selectedPatient.gender,
      patientPhone: selectedPatient.phone,
      patientAddress: selectedPatient.address,
      doctorName: 'Dr. Rajesh Goel',
      clinicId: clinic,
      visitType,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items,
      subtotal: consultationFee,
      discount,
      discountType: 'FIXED',
      gstRate: 0,
      gstAmount: 0,
      totalTax: 0,
      grandTotal,
      paidAmount: finalPaidAmount,
      paymentMethod,
      balance,
      status: finalStatus,
      payments: finalPaidAmount > 0 ? [{
        id: `pay-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        amount: finalPaidAmount,
        method: paymentMethod,
        reference: paymentReference || `${paymentMethod}-${Date.now()}`,
      }] : [],
      notes,
      createdAt: existingInvoice?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(invoice);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#0A75BB]" />
            <h2 className="text-base font-semibold text-gray-900">
              {existingInvoice ? 'Edit Bill' : 'New Consultation Bill'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Patient */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Patient *</label>
            {selectedPatient ? (
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">{selectedPatient.name}</p>
                  <p className="text-xs text-gray-500">
                    {selectedPatient.phone && selectedPatient.phone}
                    {selectedPatient.gender && ` · ${selectedPatient.gender}`}
                  </p>
                </div>
                <button onClick={() => setSelectedPatient(null)} className="text-sm text-[#0A75BB] hover:underline px-2 py-1 min-h-[44px]">Change</button>
              </div>
            ) : (
              <div className="relative" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    if (searchRef.current) {
                      const rect = searchRef.current.getBoundingClientRect();
                      setDropdownPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, width: rect.width });
                    }
                  }}
                  onFocus={() => {
                    if (searchRef.current) {
                      const rect = searchRef.current.getBoundingClientRect();
                      setDropdownPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, width: rect.width });
                    }
                  }}
                  placeholder="Search name or mobile..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 min-h-[44px]"
                />
                {patientSearch && filteredPatients.length > 0 && dropdownPos && typeof document !== 'undefined' && createPortal(
                  <div className="bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                    style={{ position: 'absolute', top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 9999 }}>
                    {filteredPatients.slice(0, 8).map((patient) => (
                      <button key={patient.id} onClick={() => selectPatient(patient)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 min-h-[48px]">
                        <p className="font-medium text-gray-900 text-sm">{patient.firstName} {patient.lastName}</p>
                        <p className="text-xs text-gray-500">{patient.phone}</p>
                      </button>
                    ))}
                    {adminBypassUnlocked && (
                      <button onClick={() => selectCustomPatient(patientSearch)}
                        className="w-full px-4 py-3 text-left hover:bg-amber-50 bg-amber-50/50 border-t border-amber-200 min-h-[48px]">
                        <p className="text-sm font-medium text-amber-800">Bill &quot;{patientSearch.trim()}&quot; anyway</p>
                      </button>
                    )}
                  </div>,
                  document.body
                )}
                {patientSearch && filteredPatients.length === 0 && !adminBypassUnlocked && dropdownPos && typeof document !== 'undefined' && createPortal(
                  <div className="bg-white border border-gray-200 rounded-xl shadow-lg"
                    style={{ position: 'absolute', top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 9999 }}>
                    <div className="px-4 py-4 text-center">
                      <p className="text-sm text-gray-500">No patient found</p>
                    </div>
                    <button onClick={() => setShowAdminPin(true)}
                      className="w-full px-4 py-2.5 text-left text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 border-t border-gray-100 min-h-[44px]">
                      Admin override
                    </button>
                  </div>,
                  document.body
                )}
                {patientSearch && filteredPatients.length === 0 && adminBypassUnlocked && dropdownPos && typeof document !== 'undefined' && createPortal(
                  <div className="bg-white border border-gray-200 rounded-xl shadow-lg"
                    style={{ position: 'absolute', top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 9999 }}>
                    <button onClick={() => selectCustomPatient(patientSearch)}
                      className="w-full px-4 py-3 text-left hover:bg-amber-50 bg-amber-50/50 min-h-[48px]">
                      <p className="text-sm font-medium text-amber-800">Bill &quot;{patientSearch.trim()}&quot;</p>
                    </button>
                  </div>,
                  document.body
                )}
              </div>
            )}
          </div>

          {/* Clinic */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Clinic *</label>
            <select value={clinic} onChange={(e) => setClinic(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 min-h-[44px] bg-white">
              {Object.entries(clinicLabels).filter(([k]) => k !== 'online-intl').map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Visit Type */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Visit Type *</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { setVisitType('NEW'); setPaidAmount(0); }}
                className={cn('py-3 rounded-xl text-sm font-semibold border-2 transition-all min-h-[48px]',
                  visitType === 'NEW' ? 'bg-[#0A75BB] text-white border-[#0A75BB]' : 'bg-white text-gray-500 border-gray-200')}>
                New Patient
              </button>
              <button onClick={() => { setVisitType('FOLLOW_UP'); setPaidAmount(0); }}
                className={cn('py-3 rounded-xl text-sm font-semibold border-2 transition-all min-h-[48px]',
                  visitType === 'FOLLOW_UP' ? 'bg-[#0A75BB] text-white border-[#0A75BB]' : 'bg-white text-gray-500 border-gray-200')}>
                Follow-up
              </button>
            </div>
          </div>

          {/* Consultation Fee */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Consultation Fee</span>
              <span className="text-xl font-bold text-gray-900">{formatCurrency(consultationFee)}</span>
            </div>
            {visitType === 'FOLLOW_UP' && (
              <p className="text-xs text-emerald-600 mt-1">Follow-up discount applied ({formatCurrency(feeConfig.newFee - feeConfig.followUpFee)} off)</p>
            )}
          </div>

          {/* Discount */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Discount (₹)</label>
            <input type="number" value={discount} min="0" max={consultationFee} placeholder="0"
              onChange={(e) => setDiscount(Math.min(parseFloat(e.target.value) || 0, consultationFee))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 min-h-[44px]" />
          </div>

          {/* Amount Received */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Amount Received (₹) *</label>
            <input type="number" value={paidAmount || ''} min="0" max={grandTotal} placeholder="0"
              onChange={(e) => setPaidAmount(Math.min(parseFloat(e.target.value) || 0, grandTotal))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 min-h-[44px]" />
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Payment Method *</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { key: 'CASH', emoji: '💵', label: 'Cash' },
                { key: 'UPI', emoji: '📱', label: 'UPI' },
                { key: 'CARD', emoji: '💳', label: 'Card' },
              ] as const).map(({ key, emoji, label }) => (
                <button key={key} onClick={() => setPaymentMethod(key as PaymentMethod)}
                  className={cn('flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 text-xs font-medium transition-all min-h-[52px]',
                    paymentMethod === key
                      ? 'bg-[#0A75BB]/10 text-[#0A75BB] border-[#0A75BB]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300')}>
                  <span className="text-base">{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
            {paymentMethod !== 'CASH' && (
              <input type="text" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)}
                placeholder={paymentMethod === 'UPI' ? 'UPI Transaction ID (optional)' : 'Card Reference (optional)'}
                className="w-full mt-2 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 min-h-[44px]" />
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Notes</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 min-h-[44px]" />
          </div>

          {/* Summary */}
          <div className="bg-blue-50 rounded-xl p-4 space-y-2.5 border border-blue-100">
            <div className="flex justify-between text-sm">
              <span className="text-blue-600">Consultation Fee</span>
              <span className="font-medium text-blue-900">{formatCurrency(consultationFee)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">Discount</span>
                <span className="font-medium text-red-600">-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-blue-200">
              <span className="text-blue-900">Total</span>
              <span className="text-blue-700">{formatCurrency(grandTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount Received</span>
              <span className="font-semibold text-green-700">{formatCurrency(paidAmount)}</span>
            </div>
            {balance > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-amber-600 font-medium">Balance Due</span>
                <span className="font-bold text-amber-700">{formatCurrency(balance)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-gray-200 bg-white shrink-0">
          <button onClick={resetForm}
            className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            title="Reset">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button onClick={handleSave} disabled={!selectedPatient}
            className={cn("flex-1 py-3 text-sm font-semibold text-white rounded-xl transition-colors min-h-[48px]",
              selectedPatient ? "bg-[#0A75BB] hover:bg-[#085a94]" : "bg-gray-300 cursor-not-allowed")}>
            {existingInvoice ? 'Update Bill' : 'Generate Bill'}
          </button>
        </div>
      </div>

      {/* Admin PIN Dialog */}
      {showAdminPin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Admin Verification</h3>
            <p className="text-xs text-gray-500 mb-4">Enter admin PIN to bypass patient lookup</p>
            <input type="password" value={adminPin} onChange={(e) => setAdminPin(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && adminPin === ADMIN_PIN) { setAdminBypassUnlocked(true); setShowAdminPin(false); setAdminPin(''); } }}
              placeholder="Enter PIN" autoFocus
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 mb-4" />
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => { setShowAdminPin(false); setAdminPin(''); }}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              <button onClick={() => { if (adminPin === ADMIN_PIN) { setAdminBypassUnlocked(true); setShowAdminPin(false); setAdminPin(''); } }}
                className="px-3 py-1.5 text-xs font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700">Verify</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
