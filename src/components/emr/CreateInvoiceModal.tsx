'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Search } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { patients as mockPatients } from '@/lib/data/emr-mock';
import { useClinic } from '@/lib/emr-clinic-context';
import { patientsApi } from '@/lib/api-client';
import type { EMRInvoice, InvoiceItem, InvoiceStatus, PaymentMethod } from '@/types/emr';

const clinicLabels: Record<string, string> = {
  'kcc-faridabad': 'KCC Faridabad',
  'kcc-saket': 'KCC Saket',
  'psri-delhi': 'PSRI Delhi',
  'online': 'Online',
};

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: EMRInvoice) => void;
  existingInvoice?: EMRInvoice | null;
}

const clinicFeeMap: Record<string, { description: string; rate: number }> = {
  'kcc-faridabad': { description: 'Consultation fee', rate: 500 },
  'kcc-saket': { description: 'Consultation fee', rate: 1200 },
  'psri-delhi': { description: 'Consultation fee', rate: 500 },
  'online': { description: 'Online Consultation fee', rate: 500 },
};

const serviceTemplates = [
  { description: 'Consultation fee', rate: 500, gstRate: 0 },
  { description: 'Online Consultation fee', rate: 500, gstRate: 0 },
];

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
  } | null>(existingInvoice ? {
    id: existingInvoice.patientId,
    name: existingInvoice.patientName,
    age: existingInvoice.patientAge,
    gender: existingInvoice.patientGender,
    phone: existingInvoice.patientPhone,
    address: existingInvoice.patientAddress,
    clinicId: existingInvoice.clinicId,
  } : null);

  const [invoiceDate, setInvoiceDate] = useState(existingInvoice?.date || new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(existingInvoice?.dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [items, setItems] = useState<InvoiceItem[]>(
    existingInvoice?.items || []
  );
  const [gstRate, setGstRate] = useState(existingInvoice?.gstRate || 0);
  const [discount, setDiscount] = useState(existingInvoice?.discount || 0);
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>(existingInvoice?.discountType || 'FIXED');
  const [notes, setNotes] = useState(existingInvoice?.notes || '');
  const [status, setStatus] = useState<InvoiceStatus>(existingInvoice?.status || 'PENDING');
  const [paidAmount, setPaidAmount] = useState(existingInvoice?.paidAmount || 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(existingInvoice?.payments?.[0]?.method || 'UPI');

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      try {
        const res = await patientsApi.list();
        if (res?.data?.length) {
          const mapped = res.data.map((p: any) => ({
            id: p.id,
            firstName: p.first_name,
            lastName: p.last_name,
            phone: p.phone || '',
            uhid: p.uhid || '',
            dateOfBirth: p.date_of_birth || '',
            gender: p.gender === 'female' ? 'Female' : p.gender === 'other' ? 'Other' : 'Male',
            address: p.address || '',
            clinicId: p.clinic_id || 'kcc-faridabad',
          }));
          setAllPatients(mapped);
          return;
        }
      } catch {}
      try {
        const added = JSON.parse(localStorage.getItem('emr_added_patients') || '[]');
        const bookings = JSON.parse(localStorage.getItem('emr_bookings') || '[]');
        const consultationList = JSON.parse(localStorage.getItem('emr_consultations') || '[]');
        const appointments = JSON.parse(localStorage.getItem('emr_appointments') || '[]');
        const bookingPatients = bookings.map((b: any) => ({
          id: b.patientId || `obp-${b.bookingId}`,
          firstName: b.firstName || '',
          lastName: b.lastName || '',
          phone: b.phone || '',
          uhid: '',
          dateOfBirth: b.age ? `${new Date().getFullYear() - parseInt(b.age)}-01-01` : '',
          gender: b.gender || 'Male',
          address: '',
          clinicId: b.clinicId || 'online',
        }));
        const addedIds = new Set(added.map((p: any) => p.id));
        const bookingIds = new Set(bookingPatients.map((p: any) => p.id));
        const apptIds = new Set();
        const consultOnlyPatients = consultationList
          .filter((c: any) => c.patientId && !addedIds.has(c.patientId) && !bookingIds.has(c.patientId))
          .map((c: any) => {
            apptIds.add(c.patientId);
            const nameParts = (c.patientName || '').split(' ').filter(Boolean);
            return {
              id: c.patientId,
              firstName: nameParts[0] || c.patientName || '',
              lastName: nameParts.slice(1).join(' ') || '',
              phone: c.patientPhone || '',
              uhid: c.patientUHID || '',
              dateOfBirth: c.patientDOB || '',
              gender: c.patientGender || 'Male',
              address: '',
              clinicId: c.clinicId || 'kcc-faridabad',
            };
          });
        const apptOnlyPatients = appointments
          .filter((a: any) => a.patientId && !addedIds.has(a.patientId) && !bookingIds.has(a.patientId) && !apptIds.has(a.patientId))
          .map((a: any) => {
            const nameParts = (a.patientName || '').split(' ').filter(Boolean);
            return {
              id: a.patientId,
              firstName: nameParts[0] || a.patientName || '',
              lastName: nameParts.slice(1).join(' ') || '',
              phone: a.patientPhone || '',
              uhid: '',
              dateOfBirth: '',
              gender: 'Male' as const,
              address: '',
              clinicId: a.clinicId || 'kcc-faridabad',
            };
          });
        const combined = [...mockPatients, ...added, ...bookingPatients, ...consultOnlyPatients, ...apptOnlyPatients];
        const unique = combined.filter((p: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.id === p.id) === i);
        setAllPatients(unique);
      } catch {}
    };
    load();
  }, [isOpen]);

  const filteredPatients = allPatients.filter(
    (p) =>
      (p.firstName || '').toLowerCase().includes(patientSearch.toLowerCase()) ||
      (p.lastName || '').toLowerCase().includes(patientSearch.toLowerCase()) ||
      (p.phone || '').includes(patientSearch) ||
      (p.uhid || '').toLowerCase().includes(patientSearch.toLowerCase())
  );

  const addItem = (template?: typeof serviceTemplates[0]) => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: template?.description || '',
      qty: 1,
      rate: template?.rate || 0,
      amount: template?.rate || 0,
      gstRate: template?.gstRate || gstRate,
      gstAmount: 0,
      total: 0,
    };
    setItems([...items, newItem]);
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

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const selectPatient = (patient: typeof mockPatients[0]) => {
    setSelectedPatient({
      id: patient.id,
      name: `${patient.firstName} ${patient.lastName}`,
      age: new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear(),
      gender: patient.gender,
      phone: patient.phone,
      address: patient.address,
      clinicId: patient.clinicId,
    });
    const fee = clinicFeeMap[patient.clinicId] || clinicFeeMap['kcc-faridabad'];
    setItems([{
      id: `item-${Date.now()}`,
      description: fee.description,
      qty: 1,
      rate: fee.rate,
      amount: fee.rate,
      gstRate: 0,
      gstAmount: 0,
      total: fee.rate,
    }]);
    setPatientSearch('');
  };

  const selectCustomPatient = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSelectedPatient({
      id: `custom-${Date.now()}`,
      name: trimmed,
      phone: '',
      clinicId: currentClinicId || 'kcc-faridabad',
    });
    setPatientSearch('');
  };

  const [adminBypassUnlocked, setAdminBypassUnlocked] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [showAdminPin, setShowAdminPin] = useState(false);
  const ADMIN_PIN = '2024';

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const totalGst = items.reduce((sum, item) => sum + item.gstAmount, 0);
  const discountAmount = discountType === 'PERCENTAGE' ? (subtotal * discount) / 100 : discount;
  const grandTotal = subtotal + totalGst - discountAmount;

  const handleSave = () => {
    if (!selectedPatient || items.length === 0) return;

    const finalPaidAmount = status === 'PAID' ? grandTotal : paidAmount;
    const finalStatus = finalPaidAmount >= grandTotal ? 'PAID' : finalPaidAmount > 0 ? 'PARTIAL' : status;

    const invoice: EMRInvoice = {
      id: existingInvoice?.id || `INV-${Date.now()}`,
      invoiceNumber: existingInvoice?.invoiceNumber || `KCC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      patientAge: selectedPatient.age,
      patientGender: selectedPatient.gender,
      patientPhone: selectedPatient.phone,
      patientAddress: selectedPatient.address,
      doctorName: 'Dr. Rajesh Goel',
      clinicId: existingInvoice?.clinicId || selectedPatient?.clinicId || currentClinicId || 'kcc-faridabad',
      date: invoiceDate,
      dueDate: dueDate,
      items: items,
      subtotal: subtotal,
      discount: discount,
      discountType: discountType,
      gstRate: gstRate,
      gstAmount: totalGst,
      totalTax: totalGst,
      grandTotal: grandTotal,
      paidAmount: finalPaidAmount,
      balance: grandTotal - finalPaidAmount,
      status: finalStatus,
      payments: finalPaidAmount > 0 ? [{
        id: `pay-${Date.now()}`,
        date: invoiceDate,
        amount: finalPaidAmount,
        method: paymentMethod,
        reference: `${paymentMethod}-${Date.now()}`,
      }] : [],
      notes: notes,
      createdAt: existingInvoice?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(invoice);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white sm:items-center sm:justify-center sm:pt-8 sm:px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm sm:hidden" onClick={onClose} />
      <div className="relative w-full sm:max-w-4xl h-full sm:h-[85vh] sm:bg-white sm:rounded-xl sm:shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 shrink-0 bg-white">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            {existingInvoice ? 'Edit Invoice' : 'New Invoice'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Patient Selection */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Patient</h3>
            {selectedPatient ? (
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{selectedPatient.name}</p>
                    {selectedPatient.clinicId && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {clinicLabels[selectedPatient.clinicId] || selectedPatient.clinicId}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {selectedPatient.age && `${selectedPatient.age} yrs`}
                    {selectedPatient.gender && ` | ${selectedPatient.gender}`}
                    {selectedPatient.phone && ` | ${selectedPatient.phone}`}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-sm text-[#0A75BB] hover:underline"
                >
                  Change
                </button>
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
                  placeholder="Search patient by name, phone, or UHID..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20"
                />
                {patientSearch && filteredPatients.length > 0 && dropdownPos && typeof document !== 'undefined' && createPortal(
                  <div
                    className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    style={{ position: 'absolute', top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 9999 }}
                  >
                    {filteredPatients.map((patient) => (
                      <button
                        key={patient.id}
                        onClick={() => selectPatient(patient)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">{patient.firstName} {patient.lastName}</p>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {clinicLabels[patient.clinicId] || patient.clinicId}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{patient.phone} | {patient.uhid}</p>
                      </button>
                    ))}
                    {adminBypassUnlocked && (
                      <button
                        onClick={() => selectCustomPatient(patientSearch)}
                        className="w-full px-4 py-3 text-left hover:bg-amber-50 border-t border-amber-200 flex items-center gap-3 bg-amber-50/50"
                      >
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-amber-700">A</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-amber-800">Admin: Bill &quot;{patientSearch.trim()}&quot; anyway</p>
                          <p className="text-[11px] text-amber-500">Bypass patient lookup — no consultation required</p>
                        </div>
                      </button>
                    )}
                  </div>,
                  document.body
                )}
                {patientSearch && filteredPatients.length === 0 && !adminBypassUnlocked && dropdownPos && typeof document !== 'undefined' && createPortal(
                  <div
                    className="bg-white border border-gray-200 rounded-lg shadow-lg"
                    style={{ position: 'absolute', top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 9999 }}
                  >
                    <div className="px-4 py-6 text-center">
                      <p className="text-sm text-gray-500">No patients found for &quot;{patientSearch.trim()}&quot;</p>
                      <p className="text-[11px] text-gray-400 mt-1">Patient must be added via EMR or online booking first</p>
                    </div>
                    <button
                      onClick={() => setShowAdminPin(true)}
                      className="w-full px-4 py-2.5 text-left text-[11px] text-gray-400 hover:text-gray-600 hover:bg-gray-50 border-t border-gray-100 transition-colors"
                    >
                      Admin override
                    </button>
                  </div>,
                  document.body
                )}
                {patientSearch && filteredPatients.length === 0 && adminBypassUnlocked && dropdownPos && typeof document !== 'undefined' && createPortal(
                  <div
                    className="bg-white border border-gray-200 rounded-lg shadow-lg"
                    style={{ position: 'absolute', top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 9999 }}
                  >
                    <button
                      onClick={() => selectCustomPatient(patientSearch)}
                      className="w-full px-4 py-3 text-left hover:bg-amber-50 flex items-center gap-3 bg-amber-50/50"
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-amber-700">A</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-amber-800">Admin: Bill &quot;{patientSearch.trim()}&quot;</p>
                        <p className="text-[11px] text-amber-500">Bypass patient lookup — no consultation required</p>
                      </div>
                    </button>
                  </div>,
                  document.body
                )}
              </div>
            )}
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Invoice Date</label>
              <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20" />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</h3>
              <div className="flex items-center gap-2">
                <select onChange={(e) => {
                    if (e.target.value) {
                      const selected = serviceTemplates.find(t => t.description === e.target.value);
                      if (selected) addItem({ description: selected.description, rate: selected.rate, gstRate: 0 });
                      e.target.value = '';
                    }
                  }}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20">
                  <option value="">Quick Add</option>
                  {serviceTemplates.map((t) => (
                    <option key={t.description} value={t.description}>{t.description} - {formatCurrency(t.rate)}</option>
                  ))}
                </select>
                <button onClick={() => addItem()}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#0A75BB] bg-[#0A75BB]/10 rounded-lg">
                  <Plus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-3 space-y-2.5">
                  <div className="flex items-start gap-2">
                    <input type="text" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Item description"
                      className="flex-1 min-w-0 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20" />
                    <button onClick={() => removeItem(index)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase">Qty</label>
                      <input type="number" value={item.qty} min="1"
                        onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value) || 0)}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase">Rate ₹</label>
                      <input type="number" value={item.rate} min="0"
                        onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase">GST %</label>
                      <input type="number" value={item.gstRate} min="0" max="100"
                        onChange={(e) => updateItem(index, 'gstRate', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20" />
                    </div>
                  </div>
                  <div className="text-right text-sm font-semibold text-gray-900">{formatCurrency(item.total)}</div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-sm">Tap "Add" or use "Quick Add"</p>
                </div>
              )}
            </div>
          </div>

          {/* Discount */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Discount</label>
            <div className="flex gap-2">
              <input type="number" value={discount} min="0" placeholder="0"
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20" />
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value as 'PERCENTAGE' | 'FIXED')}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20">
                <option value="FIXED">₹ Fixed</option>
                <option value="PERCENTAGE">% Percent</option>
              </select>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-medium">{formatCurrency(subtotal)}</span></div>
            {totalGst > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">GST</span><span className="font-medium">{formatCurrency(totalGst)}</span></div>}
            {discountAmount > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Discount</span><span className="font-medium text-red-600">-{formatCurrency(discountAmount)}</span></div>}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span>Total</span><span className="text-[#0A75BB]">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Amount Paid</label>
              <input type="number" value={paidAmount} min="0" max={grandTotal} placeholder="0"
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20" />
            </div>
            {paidAmount > 0 && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['CASH', 'UPI', 'CARD'] as PaymentMethod[]).map((m) => (
                    <button key={m} onClick={() => setPaymentMethod(m)}
                      className={cn('py-2.5 rounded-lg text-xs font-semibold border transition-colors',
                        paymentMethod === m ? 'bg-[#0A75BB] text-white border-[#0A75BB]' : 'bg-white text-gray-600 border-gray-200')}>
                      {m === 'CASH' ? '💵 Cash' : m === 'UPI' ? '📱 UPI' : '💳 Card'}
                    </button>
                  ))}
                </div>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full mt-2 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20">
                  <option value="CASH">Cash</option><option value="UPI">UPI</option><option value="CARD">Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option><option value="CHEQUE">Cheque</option><option value="ONLINE">Online</option>
                </select>
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Status</label>
              <div className="grid grid-cols-3 gap-2">
                {(['PENDING', 'PARTIAL', 'PAID'] as InvoiceStatus[]).map((s) => (
                  <button key={s} onClick={() => {
                      setStatus(s);
                      if (s === 'PAID') setPaidAmount(grandTotal);
                      else if (s === 'PARTIAL' && paidAmount === 0) setPaidAmount(Math.round(grandTotal / 2));
                      else if (s === 'PENDING') setPaidAmount(0);
                    }}
                    className={cn('py-2.5 rounded-lg text-xs font-semibold border transition-colors',
                      status === s
                        ? s === 'PAID' ? 'bg-green-600 text-white border-green-600' : s === 'PARTIAL' ? 'bg-amber-600 text-white border-amber-600' : 'bg-[#0A75BB] text-white border-[#0A75BB]'
                        : 'bg-white text-gray-600 border-gray-200')}>
                    {s === 'PAID' ? '✓ Paid' : s === 'PARTIAL' ? '◐ Partial' : '⏳ Pending'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Optional notes..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-white shrink-0">
          <button onClick={onClose}
            className="flex-1 sm:flex-none px-4 py-3 sm:py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={!selectedPatient || items.length === 0}
            className={cn("flex-1 sm:flex-none px-6 py-3 sm:py-2 text-sm font-semibold text-white rounded-xl transition-colors",
              selectedPatient && items.length > 0 ? "bg-[#0A75BB] hover:bg-[#085a94]" : "bg-gray-300 cursor-not-allowed")}>
            {existingInvoice ? 'Update' : 'Create Invoice'}
          </button>
        </div>
      </div>

      {/* Admin PIN Dialog */}
      {showAdminPin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Admin Verification</h3>
            <p className="text-xs text-gray-500 mb-4">Enter admin PIN to bypass patient lookup</p>
            <input
              type="password"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && adminPin === ADMIN_PIN) {
                  setAdminBypassUnlocked(true);
                  setShowAdminPin(false);
                  setAdminPin('');
                }
              }}
              placeholder="Enter PIN"
              autoFocus
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 mb-4"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => { setShowAdminPin(false); setAdminPin(''); }}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (adminPin === ADMIN_PIN) {
                    setAdminBypassUnlocked(true);
                    setShowAdminPin(false);
                    setAdminPin('');
                  }
                }}
                className="px-3 py-1.5 text-xs font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
