'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Search } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { patients as mockPatients } from '@/lib/data/emr-mock';
import { useClinic } from '@/lib/emr-clinic-context';
import { patientsApi } from '@/lib/api-client';
import type { EMRInvoice, InvoiceItem, InvoiceStatus, PaymentMethod, VisitType } from '@/types/emr';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: EMRInvoice) => void;
  existingInvoice?: EMRInvoice | null;
}

const clinicFeeMap: Record<string, { description: string; newFee: number; followUpFee: number }> = {
  'kcc-faridabad': { description: 'Consultation fee', newFee: 500, followUpFee: 300 },
  'kcc-saket': { description: 'Consultation fee', newFee: 1200, followUpFee: 700 },
  'psri-delhi': { description: 'Consultation fee', newFee: 500, followUpFee: 300 },
  'online': { description: 'Online Consultation fee', newFee: 500, followUpFee: 300 },
  'online-intl': { description: 'International Consultation fee', newFee: 1500, followUpFee: 1000 },
};

const clinicLabels: Record<string, string> = {
  'kcc-faridabad': 'KCC Faridabad',
  'kcc-saket': 'KCC Saket',
  'psri-delhi': 'PSRI Delhi',
  'online': 'Online',
  'online-intl': 'Online Intl',
};

export default function CreateInvoiceModal({ isOpen, onClose, onSave, existingInvoice }: CreateInvoiceModalProps) {
  const { clinicId: currentClinicId } = useClinic();
  const [patientSearch, setPatientSearch] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const [allPatients, setAllPatients] = useState<any[]>(mockPatients);
  const [selectedPatient, setSelectedPatient] = useState<{
    id: string; name: string; age?: number; gender?: 'Male' | 'Female' | 'Other';
    phone?: string; address?: string; clinicId?: string;
  } | null>(null);

  const [clinic, setClinic] = useState(currentClinicId || 'kcc-faridabad');
  const [visitType, setVisitType] = useState<VisitType>('NEW');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [gstRate, setGstRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('FIXED');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<InvoiceStatus>('PENDING');
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'UNPAID'>('UNPAID');
  const [adminBypassUnlocked, setAdminBypassUnlocked] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [showAdminPin, setShowAdminPin] = useState(false);
  const ADMIN_PIN = '2024';

  useEffect(() => {
    if (!isOpen) return;
    setClinic(currentClinicId || 'kcc-faridabad');
    loadPatients();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (existingInvoice) {
      setSelectedPatient({
        id: existingInvoice.patientId, name: existingInvoice.patientName,
        age: existingInvoice.patientAge, gender: existingInvoice.patientGender,
        phone: existingInvoice.patientPhone, address: existingInvoice.patientAddress,
        clinicId: existingInvoice.clinicId,
      });
      setClinic(existingInvoice.clinicId);
      setVisitType(existingInvoice.visitType || 'NEW');
      setInvoiceDate(existingInvoice.date);
      setDueDate(existingInvoice.dueDate);
      setItems(existingInvoice.items);
      setGstRate(existingInvoice.gstRate);
      setDiscount(existingInvoice.discount);
      setDiscountType(existingInvoice.discountType);
      setNotes(existingInvoice.notes || '');
      setStatus(existingInvoice.status);
      setPaidAmount(existingInvoice.paidAmount);
      setPaymentMethod(existingInvoice.payments?.[0]?.method || 'CASH');
      setPaymentReference(existingInvoice.payments?.[0]?.reference || '');
      setPaymentStatus(existingInvoice.status === 'PAID' ? 'PAID' : 'UNPAID');
    } else {
      setSelectedPatient(null);
      setVisitType('NEW');
      setInvoiceDate(new Date().toISOString().split('T')[0]);
      setDueDate(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setItems([]);
      setGstRate(0);
      setDiscount(0);
      setDiscountType('FIXED');
      setNotes('');
      setStatus('PENDING');
      setPaidAmount(0);
      setPaymentMethod('CASH');
      setPaymentReference('');
      setPaymentStatus('UNPAID');
    }
    setPatientSearch('');
  }, [isOpen, existingInvoice]);

  const loadPatients = async () => {
    try {
      const res = await patientsApi.list();
      if (res?.data?.length) {
        setAllPatients(res.data.map((p: any) => ({
          id: p.id, firstName: p.first_name, lastName: p.last_name,
          phone: p.phone || '', uhid: p.uhid || '',
          gender: p.gender === 'female' ? 'Female' : p.gender === 'other' ? 'Other' : 'Male',
          clinicId: p.clinic_id || 'kcc-faridabad',
        })));
        return;
      }
    } catch {}
    try {
      const added = JSON.parse(localStorage.getItem('emr_added_patients') || '[]');
      const bookings = JSON.parse(localStorage.getItem('emr_bookings') || '[]');
      const consultationList = JSON.parse(localStorage.getItem('emr_consultations') || '[]');
      const appointments = JSON.parse(localStorage.getItem('emr_appointments') || '[]');
      const BOOKING_CLINIC_MAP: Record<string, string> = {
        'online': 'online', 'online-intl': 'online-intl', 'faridabad': 'kcc-faridabad',
        'kcc-faridabad': 'kcc-faridabad', 'psri': 'psri-delhi', 'psri-delhi': 'psri-delhi',
        'saket': 'kcc-saket', 'kcc-saket': 'kcc-saket',
      };
      const bookingPatients = bookings.map((b: any) => {
        const mappedClinic = BOOKING_CLINIC_MAP[b.clinicId] || b.clinicId || 'online';
        return {
          id: b.bookingId, firstName: b.firstName || '', lastName: b.lastName || '',
          phone: b.phone || '', email: b.email || '',
          uhid: `${mappedClinic === 'psri-delhi' ? 'PSRI' : 'KCC'}-${new Date().getFullYear()}-${b.bookingId.slice(-3).toUpperCase()}` || '',
          gender: b.gender || 'Male', clinicId: mappedClinic, source: 'website',
        };
      });
      const addedIds = new Set(added.map((p: any) => p.id));
      const bookingIds = new Set(bookingPatients.map((p: any) => p.id));
      const apptIds = new Set();
      const consultOnlyPatients = consultationList
        .filter((c: any) => c.patientId && !addedIds.has(c.patientId) && !bookingIds.has(c.patientId))
        .map((c: any) => {
          apptIds.add(c.patientId);
          const nameParts = (c.patientName || '').split(' ').filter(Boolean);
          return { id: c.patientId, firstName: nameParts[0] || c.patientName || '', lastName: nameParts.slice(1).join(' ') || '',
            phone: c.patientPhone || '', email: '', uhid: c.patientUHID || '', gender: c.patientGender || 'Male', clinicId: c.clinicId || 'kcc-faridabad' };
        });
      const apptOnlyPatients = appointments
        .filter((a: any) => a.patientId && !addedIds.has(a.patientId) && !bookingIds.has(a.patientId) && !apptIds.has(a.patientId))
        .map((a: any) => {
          const nameParts = (a.patientName || '').split(' ').filter(Boolean);
          return { id: a.patientId, firstName: nameParts[0] || a.patientName || '', lastName: nameParts.slice(1).join(' ') || '',
            phone: a.patientPhone || '', email: '', uhid: '', gender: 'Male' as const, clinicId: a.clinicId || 'kcc-faridabad' };
        });
      const combined: any[] = [...mockPatients];
      // Build a lookup from bookings for correct clinicId
      const bookingClinicLookup: Record<string, string> = {};
      for (const b of bookings) {
        const mappedClinic = BOOKING_CLINIC_MAP[b.clinicId] || b.clinicId || 'online';
        const phone = (b.phone || '').replace(/\s/g, '');
        const email = (b.email || '').toLowerCase();
        if (phone) bookingClinicLookup[`phone:${phone}`] = mappedClinic;
        if (email) bookingClinicLookup[`email:${email}`] = mappedClinic;
        bookingClinicLookup[`id:${b.bookingId}`] = mappedClinic;
      }
      for (const p of added) {
        if (!combined.some((x: any) => x.id === p.id)) {
          // Cross-reference with bookings to get correct clinicId
          const phone = (p.phone || '').replace(/\s/g, '');
          const email = (p.email || '').toLowerCase();
          const bookingClinic = bookingClinicLookup[`id:${p.id}`] || bookingClinicLookup[`phone:${phone}`] || bookingClinicLookup[`email:${email}`] || null;
          combined.push({ id: p.id, firstName: p.firstName || '', lastName: p.lastName || '',
            phone: p.phone || '', email: p.email || '', uhid: p.uhid || '', gender: p.gender || 'Male',
            clinicId: bookingClinic || p.clinicId || 'kcc-faridabad', source: p.source || '' });
        }
      }
      for (const p of bookingPatients) {
        if (!combined.some((x: any) => x.id === p.id)) combined.push(p);
      }
      for (const p of consultOnlyPatients) { if (!combined.some((x: any) => x.id === p.id)) combined.push(p); }
      for (const p of apptOnlyPatients) { if (!combined.some((x: any) => x.id === p.id)) combined.push(p); }
      setAllPatients(combined);
    } catch {}
  };

  const filteredPatients = allPatients.filter(
    (p) => (p.firstName || '').toLowerCase().includes(patientSearch.toLowerCase()) ||
      (p.lastName || '').toLowerCase().includes(patientSearch.toLowerCase()) ||
      (p.phone || '').includes(patientSearch) || (p.email || '').toLowerCase().includes(patientSearch.toLowerCase()) ||
      (p.uhid || '').toLowerCase().includes(patientSearch.toLowerCase())
  );

  const selectPatient = (patient: any) => {
    const pClinic = patient.clinicId || 'kcc-faridabad';
    setSelectedPatient({
      id: patient.id, name: `${patient.firstName} ${patient.lastName}`,
      age: patient.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : undefined,
      gender: patient.gender, phone: patient.phone, address: patient.address, clinicId: pClinic,
    });
    setClinic(pClinic);
    setPatientSearch('');
  };

  const selectCustomPatient = (name: string) => {
    setSelectedPatient({ id: `custom-${Date.now()}`, name: name.trim(), phone: '', clinicId: clinic });
    setPatientSearch('');
  };

  useEffect(() => {
    if (!isOpen || !selectedPatient) return;
    const pClinic = selectedPatient.clinicId || clinic;
    const fee = clinicFeeMap[pClinic];
    if (fee) {
      setItems([{ id: `item-${Date.now()}`, description: fee.description, qty: 1, rate: fee.newFee, amount: fee.newFee, gstRate: 0, gstAmount: 0, total: fee.newFee }]);
    }
  }, [isOpen, selectedPatient?.id]);

  const addItem = () => {
    setItems([...items, { id: `item-${Date.now()}`, description: '', qty: 1, rate: 0, amount: 0, gstRate, gstAmount: 0, total: 0 }]);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'qty' || field === 'rate' || field === 'gstRate') {
      const qty = field === 'qty' ? (value as number) : updated[index].qty;
      const rate = field === 'rate' ? (value as number) : updated[index].rate;
      const gst = field === 'gstRate' ? (value as number) : updated[index].gstRate;
      updated[index].amount = qty * rate;
      updated[index].gstAmount = (qty * rate * gst) / 100;
      updated[index].total = updated[index].amount + updated[index].gstAmount;
    }
    setItems(updated);
  };

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const totalGst = items.reduce((sum, item) => sum + item.gstAmount, 0);
  const discountAmount = discountType === 'PERCENTAGE' ? (subtotal * discount) / 100 : discount;
  const grandTotal = subtotal + totalGst - discountAmount;

  const handleSave = () => {
    if (!selectedPatient || items.length === 0) return;
    const finalPaidAmount = paymentStatus === 'PAID' ? (paidAmount >= grandTotal ? grandTotal : paidAmount) : 0;
    const finalStatus: InvoiceStatus = paymentStatus === 'PAID' ? (finalPaidAmount >= grandTotal ? 'PAID' : 'PARTIAL') : 'PENDING';
    const invoice: EMRInvoice = {
      id: existingInvoice?.id || `INV-${Date.now()}`,
      invoiceNumber: existingInvoice?.invoiceNumber || `KCC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      patientId: selectedPatient.id, patientName: selectedPatient.name,
      patientAge: selectedPatient.age, patientGender: selectedPatient.gender,
      patientPhone: selectedPatient.phone, patientAddress: selectedPatient.address,
      doctorName: 'Dr. Rajesh Goel', clinicId: clinic, visitType, date: invoiceDate, dueDate,
      items, subtotal, discount, discountType, gstRate, gstAmount: totalGst, totalTax: totalGst, grandTotal,
      paidAmount: finalPaidAmount, paymentMethod, balance: grandTotal - finalPaidAmount, status: finalStatus,
      payments: finalPaidAmount > 0 ? [{ id: `pay-${Date.now()}`, date: invoiceDate, amount: finalPaidAmount, method: paymentMethod, reference: paymentReference || `${paymentMethod}-${Date.now()}` }] : [],
      notes, createdAt: existingInvoice?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    onSave(invoice);
    onClose();
  };

  if (!isOpen) return null;
  const patientClinicLabel = selectedPatient?.clinicId ? clinicLabels[selectedPatient.clinicId] || selectedPatient.clinicId : '';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-[960px] bg-white sm:rounded-2xl shadow-2xl flex flex-col h-[100dvh] sm:h-auto sm:max-h-[95vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">{existingInvoice ? 'Edit Invoice' : 'New Invoice'}</h2>
            {selectedPatient && patientClinicLabel && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">{patientClinicLabel}</span>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 min-w-[40px] min-h-[40px] flex items-center justify-center">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0">

          {/* LEFT - Form */}
          <div className="lg:w-[420px] shrink-0 lg:border-r border-gray-100 p-3 sm:p-4 flex flex-col gap-3 overflow-y-auto">

            {/* Patient */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">Patient *</label>
              {selectedPatient ? (
                <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{selectedPatient.name}</p>
                    <p className="text-[11px] text-gray-500">
                      {selectedPatient.age && `${selectedPatient.age} yrs`}
                      {selectedPatient.gender && ` · ${selectedPatient.gender}`}
                      {selectedPatient.phone && ` · ${selectedPatient.phone}`}
                    </p>
                  </div>
                  <button onClick={() => { setSelectedPatient(null); setItems([]); }} className="text-xs text-[#0A75BB] hover:underline font-medium min-h-[40px] px-2">Change</button>
                </div>
              ) : (
                <div className="relative" ref={searchRef}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" value={patientSearch}
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
                    placeholder="Search by name, phone, UHID..."
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 h-10" />
                  {patientSearch && filteredPatients.length > 0 && dropdownPos && typeof document !== 'undefined' && createPortal(
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-44 overflow-y-auto"
                      style={{ position: 'absolute', top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 9999 }}>
                      {filteredPatients.slice(0, 5).map((patient) => (
                        <button key={patient.id} onClick={() => selectPatient(patient)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-50 last:border-0">
                          <p className="font-medium text-gray-900 text-sm">{patient.firstName} {patient.lastName}</p>
                          <p className="text-[11px] text-gray-400">{patient.phone}</p>
                        </button>
                      ))}
                      {adminBypassUnlocked && (
                        <button onClick={() => selectCustomPatient(patientSearch)}
                          className="w-full px-3 py-2 text-left hover:bg-amber-50 bg-amber-50/50 border-t border-amber-200">
                          <p className="text-xs font-medium text-amber-700">Bill &quot;{patientSearch.trim()}&quot;</p>
                        </button>
                      )}
                    </div>, document.body
                  )}
                  {patientSearch && filteredPatients.length === 0 && !adminBypassUnlocked && dropdownPos && typeof document !== 'undefined' && createPortal(
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg"
                      style={{ position: 'absolute', top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 9999 }}>
                      <div className="px-3 py-3 text-center"><p className="text-xs text-gray-400">No patients found</p></div>
                      <button onClick={() => setShowAdminPin(true)}
                        className="w-full px-3 py-2 text-left text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 border-t border-gray-100">
                        Admin override
                      </button>
                    </div>, document.body
                  )}
                  {patientSearch && filteredPatients.length === 0 && adminBypassUnlocked && dropdownPos && typeof document !== 'undefined' && createPortal(
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg"
                      style={{ position: 'absolute', top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 9999 }}>
                      <button onClick={() => selectCustomPatient(patientSearch)}
                        className="w-full px-3 py-2.5 text-left hover:bg-amber-50 bg-amber-50/50">
                        <p className="text-xs font-medium text-amber-700">Bill &quot;{patientSearch.trim()}&quot;</p>
                      </button>
                    </div>, document.body
                  )}
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">Invoice Date</label>
                <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 h-9" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">Due Date</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 h-9" />
              </div>
            </div>

            {/* Payment Status */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">Payment</label>
              <div className="grid grid-cols-2 gap-1 bg-gray-100 rounded-lg p-0.5">
                <button onClick={() => { setPaymentStatus('PAID'); setPaidAmount(grandTotal); setStatus('PAID'); }}
                  className={cn('py-2 rounded-md text-sm font-semibold transition-all h-9', paymentStatus === 'PAID' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700')}>Paid</button>
                <button onClick={() => { setPaymentStatus('UNPAID'); setPaidAmount(0); setStatus('PENDING'); }}
                  className={cn('py-2 rounded-md text-sm font-semibold transition-all h-9', paymentStatus === 'UNPAID' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700')}>Unpaid</button>
              </div>
            </div>

            {/* Payment Details */}
            {paymentStatus === 'PAID' && (
              <>
                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">Amount ₹</label>
                    <input type="number" value={paidAmount || ''} min="0" max={grandTotal} placeholder="0"
                      onChange={(e) => setPaidAmount(Math.min(parseFloat(e.target.value) || 0, grandTotal))}
                      className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 h-9" />
                  </div>
                  <div className="col-span-3">
                    <label className="text-xs font-semibold text-gray-500 mb-1 block uppercase tracking-wide">Method</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {([
                        { key: 'CASH', emoji: '💵', label: 'Cash' },
                        { key: 'UPI', emoji: '📱', label: 'UPI' },
                        { key: 'BANK_TRANSFER', emoji: '🏦', label: 'Bank' },
                        { key: 'PAYPAL', emoji: '🅿️', label: 'PayPal' },
                      ] as const).map(({ key, emoji, label }) => (
                        <button key={key} onClick={() => setPaymentMethod(key as PaymentMethod)}
                          className={cn('flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg border text-[11px] font-medium transition-all min-h-[48px]',
                            paymentMethod === key ? 'bg-green-50 text-green-700 border-green-300' : 'bg-white text-gray-500 border-gray-200')}>
                          <span className="text-sm leading-none">{emoji}</span>
                          <span className="leading-none mt-0.5">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {paymentMethod !== 'CASH' && (
                  <input type="text" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder={paymentMethod === 'UPI' ? 'UPI Transaction ID' : paymentMethod === 'PAYPAL' ? 'PayPal Transaction ID' : 'Reference Number'}
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 h-9" />
                )}
              </>
            )}

            {/* Discount + Summary */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide shrink-0">Discount</label>
                <input type="number" value={discount} min="0" placeholder="0"
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="flex-1 border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 h-9" />
                <select value={discountType} onChange={(e) => setDiscountType(e.target.value as 'PERCENTAGE' | 'FIXED')}
                  className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 h-9">
                  <option value="FIXED">₹ Fixed</option>
                  <option value="PERCENTAGE">% Percent</option>
                </select>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex justify-between text-sm mb-1"><span className="text-gray-500">Subtotal</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
                {totalGst > 0 && <div className="flex justify-between text-sm mb-1"><span className="text-gray-500">GST</span><span className="font-medium">{formatCurrency(totalGst)}</span></div>}
                {discountAmount > 0 && <div className="flex justify-between text-sm mb-1"><span className="text-gray-500">Discount</span><span className="font-medium text-red-500">-{formatCurrency(discountAmount)}</span></div>}
                <div className="flex justify-between text-base font-bold pt-1.5 mt-1.5 border-t border-gray-200">
                  <span>Total</span><span className="text-[#0A75BB]">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)"
                className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 h-9" />
            </div>
          </div>

          {/* RIGHT - Items */}
          <div className="lg:w-[440px] shrink-0 p-3 sm:p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Items</h3>
              <button onClick={addItem}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#0A75BB] bg-[#0A75BB]/10 rounded-lg h-8 hover:bg-[#0A75BB]/20 transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add Item
              </button>
            </div>
            <div className="overflow-y-auto space-y-2 min-h-0">
              {items.map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <input type="text" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Description"
                      className="flex-1 min-w-0 border border-gray-200 rounded-md px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 bg-white h-9" />
                    <button onClick={() => removeItem(index)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 items-end">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-medium">Qty</label>
                      <input type="number" value={item.qty} min="1"
                        onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value) || 0)}
                        className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 h-8 bg-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-medium">Rate ₹</label>
                      <input type="number" value={item.rate} min="0"
                        onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 h-8 bg-white" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-medium">GST %</label>
                      <input type="number" value={item.gstRate} min="0" max="100"
                        onChange={(e) => updateItem(index, 'gstRate', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 h-8 bg-white" />
                    </div>
                    <div className="text-right text-sm font-bold text-gray-900 pb-1">{formatCurrency(item.total)}</div>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="text-center py-6 text-gray-300 border border-dashed border-gray-200 rounded-lg">
                  <p className="text-xs">Select a patient to auto-fill fee</p>
                  <p className="text-[10px] mt-0.5 text-gray-400">or tap &quot;Add Item&quot; for custom</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-3 sm:px-5 py-3 border-t border-gray-100 shrink-0 bg-gray-50 sm:rounded-b-2xl">
          <button onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 min-h-[44px]">Cancel</button>
          <button onClick={handleSave} disabled={!selectedPatient || items.length === 0}
            className={cn("flex-1 py-2.5 text-sm font-semibold text-white rounded-lg transition-colors min-h-[48px]",
              selectedPatient && items.length > 0 ? "bg-[#0A75BB] hover:bg-[#085a94]" : "bg-gray-300 cursor-not-allowed")}>
            {existingInvoice ? 'Update Invoice' : 'Create Invoice'}
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
