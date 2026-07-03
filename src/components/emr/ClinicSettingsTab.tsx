'use client';

import { useState } from 'react';
import {
  Building2, Save, RotateCcw, ChevronDown, ChevronRight,
  MapPin, Clock, DollarSign, CreditCard, Plus, Trash2, Eye, EyeOff,
} from 'lucide-react';
import {
  loadAllClinics,
  saveAllClinics,
  resetClinics,
  type ClinicDetail,
} from '@/lib/clinic-settings';

const colorOptions = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'amber', label: 'Amber', class: 'bg-amber-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'emerald', label: 'Emerald', class: 'bg-emerald-500' },
  { value: 'rose', label: 'Rose', class: 'bg-rose-500' },
  { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
];

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function Input({ label, value, onChange, type = 'text', placeholder, disabled, className = '' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; disabled?: boolean; className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        disabled={disabled} placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 disabled:opacity-50"
      />
    </div>
  );
}

function Toggle({ enabled, onChange, label, description }: { enabled: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button type="button" onClick={() => onChange(!enabled)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${enabled ? 'bg-primary-600' : 'bg-gray-200'}`}>
        <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

function ClinicCard({ clinic, onChange, onDelete }: {
  clinic: ClinicDetail; onChange: (updated: ClinicDetail) => void; onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all ${clinic.enabled ? 'border-gray-200' : 'border-gray-200 opacity-60'}`}>
      {/* Header */}
      <button onClick={() => setExpanded(!expanded)} className="w-full px-5 py-4 flex items-center gap-3 hover:bg-gray-50/50 transition-colors text-left">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${clinic.color}-100`}>
          <Building2 className={`h-5 w-5 text-${clinic.color}-600`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{clinic.name}</p>
          <p className="text-xs text-gray-500 truncate">{clinic.address}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${clinic.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
            {clinic.enabled ? 'Active' : 'Disabled'}
          </span>
          <span className="text-xs font-semibold text-primary-600">₹{clinic.fee}</span>
          {expanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
        </div>
      </button>

      {/* Expanded form */}
      {expanded && (
        <div className="px-5 pb-5 space-y-5 border-t border-gray-100 pt-4">
          {/* Basic Info */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Basic Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Clinic Name" value={clinic.name} onChange={(v) => onChange({ ...clinic, name: v })} />
              <Input label="Short Name" value={clinic.shortName} onChange={(v) => onChange({ ...clinic, shortName: v })} placeholder="e.g. Faridabad" />
              <Input label="Parent Organization" value={clinic.parentName} onChange={(v) => onChange({ ...clinic, parentName: v })} placeholder="e.g. Kidney Care Centre" />
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Color Theme</label>
                <div className="flex gap-1.5 mt-1">
                  {colorOptions.map(c => (
                    <button key={c.value} onClick={() => onChange({ ...clinic, color: c.value })}
                      className={`w-7 h-7 rounded-lg ${c.class} ${clinic.color === c.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Address & Contact</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Full Address" value={clinic.address} onChange={(v) => onChange({ ...clinic, address: v })} className="sm:col-span-2" />
              <Input label="City" value={clinic.city} onChange={(v) => onChange({ ...clinic, city: v })} />
              <Input label="State" value={clinic.state} onChange={(v) => onChange({ ...clinic, state: v })} />
              <Input label="Pincode" value={clinic.pincode} onChange={(v) => onChange({ ...clinic, pincode: v })} />
              <Input label="Phone" type="tel" value={clinic.phone} onChange={(v) => onChange({ ...clinic, phone: v })} />
              <Input label="Email" type="email" value={clinic.email} onChange={(v) => onChange({ ...clinic, email: v })} />
              <Input label="Website" value={clinic.website} onChange={(v) => onChange({ ...clinic, website: v })} />
            </div>
          </div>

          {/* Fee & Type */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Fee & Type</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input label="Consultation Fee (₹)" type="number" value={String(clinic.fee)} onChange={(v) => onChange({ ...clinic, fee: Number(v) || 0 })} />
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Type</label>
                <select value={clinic.type} onChange={(e) => onChange({ ...clinic, type: e.target.value as 'offline' | 'online' })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30">
                  <option value="offline">In-Clinic</option>
                  <option value="online">Online</option>
                </select>
              </div>
              <Toggle enabled={clinic.byAppointment} onChange={(v) => onChange({ ...clinic, byAppointment: v })} label="By Appointment Only" />
            </div>
            <div className="mt-2">
              <Input label="Features (comma-separated)" value={clinic.features.join(', ')} onChange={(v) => onChange({ ...clinic, features: v.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="e.g. In-person consultation, Same-day appointment" />
            </div>
          </div>

          {/* Schedule */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Schedule</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <Input label="Start Time" value={clinic.startTime} onChange={(v) => onChange({ ...clinic, startTime: v })} placeholder="09:00" />
              <Input label="End Time" value={clinic.endTime} onChange={(v) => onChange({ ...clinic, endTime: v })} placeholder="10:30" />
              <Input label="Slot Interval (min)" type="number" value={String(clinic.slotInterval)} onChange={(v) => onChange({ ...clinic, slotInterval: Number(v) || 15 })} />
              <Input label="Max Patients/Day" type="number" value={String(clinic.maxPatientsPerDay)} onChange={(v) => onChange({ ...clinic, maxPatientsPerDay: Number(v) || 20 })} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Input label="Break Start" value={clinic.breakStart} onChange={(v) => onChange({ ...clinic, breakStart: v })} placeholder="Optional" />
              <Input label="Break End" value={clinic.breakEnd} onChange={(v) => onChange({ ...clinic, breakEnd: v })} placeholder="Optional" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Working Days</label>
              <div className="flex gap-1.5">
                {dayLabels.map((day, i) => (
                  <button key={i} onClick={() => {
                    const days = clinic.workingDays.includes(i)
                      ? clinic.workingDays.filter(d => d !== i)
                      : [...clinic.workingDays, i].sort();
                    onChange({ ...clinic, workingDays: days });
                  }}
                    className={`w-9 h-9 rounded-lg text-xs font-medium transition-colors ${
                      clinic.workingDays.includes(i)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}>
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tax & Bank */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Tax & Banking</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="GST Number" value={clinic.gstNumber} onChange={(v) => onChange({ ...clinic, gstNumber: v })} />
              <Input label="PAN Number" value={clinic.panNumber} onChange={(v) => onChange({ ...clinic, panNumber: v })} />
              <Input label="UPI ID" value={clinic.bankDetails.upiId} onChange={(v) => onChange({ ...clinic, bankDetails: { ...clinic.bankDetails, upiId: v } })} />
              <Input label="Bank Name" value={clinic.bankDetails.bankName} onChange={(v) => onChange({ ...clinic, bankDetails: { ...clinic.bankDetails, bankName: v } })} />
              <Input label="Account Holder" value={clinic.bankDetails.accountName} onChange={(v) => onChange({ ...clinic, bankDetails: { ...clinic.bankDetails, accountName: v } })} />
              <Input label="IFSC" value={clinic.bankDetails.ifsc} onChange={(v) => onChange({ ...clinic, bankDetails: { ...clinic.bankDetails, ifsc: v } })} />
              <Input label="Account Number" value={clinic.bankDetails.accountNo} onChange={(v) => onChange({ ...clinic, bankDetails: { ...clinic.bankDetails, accountNo: v } })} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Toggle enabled={clinic.enabled} onChange={(v) => onChange({ ...clinic, enabled: v })} label="" />
              <span className="text-xs text-gray-500">{clinic.enabled ? 'Active' : 'Disabled'}</span>
            </div>
            <button onClick={onDelete} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClinicSettingsTab() {
  const [clinics, setClinics] = useState<ClinicDetail[]>(loadAllClinics);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    saveAllClinics(clinics);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    if (confirm('Reset all clinic settings to defaults?')) {
      resetClinics();
      setClinics(loadAllClinics());
    }
  }

  function updateClinic(idx: number, updated: ClinicDetail) {
    const arr = [...clinics];
    arr[idx] = updated;
    setClinics(arr);
  }

  function deleteClinic(idx: number) {
    if (!confirm(`Remove "${clinics[idx].name}"?`)) return;
    setClinics(clinics.filter((_, i) => i !== idx));
  }

  function addClinic() {
    const id = 'clinic_' + Date.now();
    setClinics([...clinics, {
      id,
      name: 'New Clinic',
      shortName: 'New',
      parentName: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
      email: '',
      website: '',
      gstNumber: '',
      panNumber: '',
      fee: 500,
      type: 'offline',
      color: 'blue',
      features: [],
      byAppointment: false,
      workingDays: [1, 2, 3, 4, 5, 6],
      startTime: '09:00',
      endTime: '17:00',
      slotInterval: 10,
      breakStart: '',
      breakEnd: '',
      maxPatientsPerDay: 20,
      bankDetails: { upiId: '', bankName: '', accountName: '', ifsc: '', accountNo: '' },
      enabled: true,
    }]);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">All Clinics & Hospitals</h2>
            <p className="text-xs text-gray-500 mt-0.5">Manage all clinic details — changes apply across the entire system</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={addClinic} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add Clinic
          </button>
          <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
          <button onClick={handleSave} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${saved ? 'bg-emerald-500 text-white' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>
            <Save className="h-3.5 w-3.5" />
            {saved ? 'Saved!' : 'Save All Clinics'}
          </button>
        </div>
      </div>

      {/* Clinic list */}
      <div className="space-y-3">
        {clinics.map((clinic, idx) => (
          <ClinicCard key={clinic.id} clinic={clinic} onChange={(u) => updateClinic(idx, u)} onDelete={() => deleteClinic(idx)} />
        ))}
      </div>
    </div>
  );
}
