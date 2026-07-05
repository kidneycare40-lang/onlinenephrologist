'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowLeft, ArrowRight, Check, User, CreditCard, MapPin, Phone as PhoneIcon,
  FileText, Users, Plus, X, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClinic } from '@/lib/emr-clinic-context';
import { patientsApi } from '@/lib/api-client';

interface FamilyMemberForm {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  bloodGroup: string;
  phone: string;
  email: string;
  uhid: string;
  abhaNumber: string;
  aadhaar: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  allergies: string[];
  medicalHistory: string;
  insuranceProvider: string;
  insuranceNumber: string;
  familyMembers: FamilyMemberForm[];
}

interface FormErrors {
  [key: string]: string;
}

const steps = [
  { label: 'Personal', icon: User },
  { label: 'Identity', icon: CreditCard },
  { label: 'Address', icon: MapPin },
  { label: 'Emergency', icon: PhoneIcon },
  { label: 'Medical', icon: FileText },
  { label: 'Family', icon: Users },
];

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
const genders = ['Male', 'Female', 'Other'];
const relations = ['Father', 'Mother', 'Son', 'Daughter', 'Husband', 'Wife', 'Brother', 'Sister', 'Other'];
const commonAllergies = ['Penicillin', 'Sulfa Drugs', 'Aspirin', 'Iodine', 'Latex', 'Codeine', 'Contrast Dye', 'NSAIDs', 'ACE Inhibitors', 'Shellfish'];
const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
];

function generateUhid(clinicId?: string | null): string {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 900) + 100);
  const prefix = clinicId === 'psri-delhi' ? 'PSRI' : 'KCC';
  return `${prefix}-${year}-${num}`;
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  age: '',
  gender: '',
  bloodGroup: '',
  phone: '',
  email: '',
  uhid: generateUhid(),
  abhaNumber: '',
  aadhaar: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelation: '',
  allergies: [],
  medicalHistory: '',
  insuranceProvider: '',
  insuranceNumber: '',
  familyMembers: [],
};

export default function AddPatientPage() {
  const router = useRouter();
  const { clinicId } = useClinic();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({ ...initialFormData, uhid: generateUhid(clinicId) });
  const [errors, setErrors] = useState<FormErrors>({});
  const [allergyInput, setAllergyInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback((field: keyof FormData, value: string | string[] | FamilyMemberForm[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const validateStep = (stepIndex: number): boolean => {
    const errs: FormErrors = {};

    switch (stepIndex) {
      case 0:
        if (!formData.firstName.trim()) errs.firstName = 'First name is required';
        if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
        if (!formData.age || parseInt(formData.age) < 0 || parseInt(formData.age) > 150) errs.age = 'Valid age is required';
        if (!formData.gender) errs.gender = 'Gender is required';
        if (!formData.phone.trim()) errs.phone = 'Phone is required';
        else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) errs.phone = 'Enter valid 10-digit Indian phone';
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Enter valid email';
        break;
      case 1:
        break;
      case 2:
        break;
      case 3:
        if (formData.emergencyContactPhone && !/^[6-9]\d{9}$/.test(formData.emergencyContactPhone)) {
          errs.emergencyContactPhone = 'Enter valid 10-digit phone';
        }
        break;
      case 4:
        break;
      case 5:
        break;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(steps.length - 1, s + 1));
    }
  };

  const prevStep = () => setStep((s) => Math.max(0, s - 1));

  const addAllergy = (allergy: string) => {
    const trimmed = allergy.trim();
    if (trimmed && !formData.allergies.includes(trimmed)) {
      updateField('allergies', [...formData.allergies, trimmed]);
    }
    setAllergyInput('');
  };

  const removeAllergy = (allergy: string) => {
    updateField('allergies', formData.allergies.filter((a) => a !== allergy));
  };

  const addFamilyMember = () => {
    const newMember: FamilyMemberForm = {
      id: `FM-${Date.now()}`,
      name: '',
      relation: '',
      phone: '',
    };
    updateField('familyMembers', [...formData.familyMembers, newMember]);
  };

  const updateFamilyMember = (id: string, field: keyof FamilyMemberForm, value: string) => {
    const updated = formData.familyMembers.map((m) => (m.id === id ? { ...m, [field]: value } : m));
    updateField('familyMembers', updated);
  };

  const removeFamilyMember = (id: string) => {
    updateField('familyMembers', formData.familyMembers.filter((m) => m.id !== id));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const now = new Date();
    const birthYear = now.getFullYear() - parseInt(formData.age);
    const dob = `${birthYear}-01-01`;

    const newPatient = {
      id: `p-${Date.now()}`,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      dateOfBirth: dob,
      gender: formData.gender as 'Male' | 'Female' | 'Other',
      bloodGroup: formData.bloodGroup || undefined,
      uhid: formData.uhid,
      clinicId: clinicId || 'kcc-faridabad',
      abhaNumber: formData.abhaNumber || undefined,
      aadhaar: formData.aadhaar || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
      state: formData.state || undefined,
      pincode: formData.pincode || undefined,
      emergencyContactName: formData.emergencyContactName || undefined,
      emergencyContactPhone: formData.emergencyContactPhone || undefined,
      emergencyContactRelation: formData.emergencyContactRelation || undefined,
      allergies: formData.allergies,
      medicalHistory: formData.medicalHistory || undefined,
      insuranceProvider: formData.insuranceProvider || undefined,
      insuranceNumber: formData.insuranceNumber || undefined,
      familyMembers: formData.familyMembers.map((fm) => ({
        id: fm.id,
        name: fm.name,
        relation: fm.relation,
        phone: fm.phone,
      })),
      isActive: true,
      isChronic: false,
      source: 'emr',
      createdAt: now.toISOString().split('T')[0],
      lastVisit: now.toISOString().split('T')[0],
      totalVisits: 1,
    };

    const existing = JSON.parse(localStorage.getItem('emr_added_patients') || '[]');
    existing.push(newPatient);
    localStorage.setItem('emr_added_patients', JSON.stringify(existing));

    // Also save to API for cross-browser persistence
    patientsApi.create({
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      date_of_birth: dob || undefined,
      gender: formData.gender as 'male' | 'female' | 'other',
      blood_group: formData.bloodGroup || undefined,
      abha_number: formData.abhaNumber || undefined,
      medical_history: formData.medicalHistory || undefined,
      insurance_provider: formData.insuranceProvider || undefined,
      insurance_number: formData.insuranceNumber || undefined,
      address: (formData.address || formData.city || formData.state || formData.pincode) ? {
        address_line_1: formData.address || '',
        city: formData.city || '',
        state: formData.state || '',
        pincode: formData.pincode || '',
        country: 'India',
      } : undefined,
      emergency_contact: (formData.emergencyContactName || formData.emergencyContactPhone) ? {
        contact_name: formData.emergencyContactName || '',
        phone: formData.emergencyContactPhone || '',
        relationship: formData.emergencyContactRelation || '',
      } : undefined,
    }).catch(() => {});

    await new Promise((r) => setTimeout(r, 800));
    setIsSubmitting(false);
    const clinicLabel = clinicId === 'psri-delhi' ? 'PSRI Hospital Delhi' : clinicId === 'kcc-saket' ? 'KCC Saket' : 'KCC Faridabad';
    toast.success('Patient added successfully!', { description: `${formData.firstName} ${formData.lastName} registered at ${clinicLabel}.` });
    router.push('/emr/patients');
  };

  const renderInput = (
    label: string,
    field: keyof FormData,
    type = 'text',
    placeholder = '',
    required = false
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={String(formData[field])}
        onChange={(e) => updateField(field, e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] transition-colors',
          errors[field] ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
        )}
      />
      {errors[field] && <p className="mt-1 text-xs text-red-500">{errors[field]}</p>}
    </div>
  );

  const renderSelect = (
    label: string,
    field: keyof FormData,
    options: string[],
    placeholder: string,
    required = false
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={String(formData[field])}
        onChange={(e) => updateField(field, e.target.value)}
        className={cn(
          'w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] transition-colors bg-white',
          errors[field] ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {errors[field] && <p className="mt-1 text-xs text-red-500">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/emr/patients" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0A75BB] transition-colors mb-3">
          <ArrowLeft className="h-4 w-4" />
          Back to Patients
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Patient</h1>
        <p className="text-sm text-gray-500 mt-1">
          Fill in the patient details below
          {clinicId && <span className="ml-2 text-[#0A75BB] font-medium">• {clinicId === 'psri-delhi' ? 'PSRI Hospital Delhi' : clinicId === 'kcc-saket' ? 'KCC Saket' : 'KCC Faridabad'}</span>}
        </p>
      </div>

      {/* Step Indicator */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.label} className="flex items-center">
              <button
                onClick={() => { if (i < step || validateStep(step)) setStep(i); }}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  i === step
                    ? 'bg-[#0A75BB] text-white shadow-sm'
                    : i < step
                    ? 'bg-primary-50 text-[#0A75BB]'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                {i < step ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <s.icon className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={cn('h-px w-6 sm:w-10 mx-1', i < step ? 'bg-[#0A75BB]' : 'bg-gray-200')} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">{steps[step].label} Details</h2>

        {/* Step 0: Personal */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderInput('First Name', 'firstName', 'text', 'Enter first name', true)}
              {renderInput('Last Name', 'lastName', 'text', 'Enter last name', true)}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {renderInput('Age', 'age', 'number', 'e.g. 45', true)}
              {renderSelect('Gender', 'gender', genders, 'Select gender', true)}
              {renderSelect('Blood Group', 'bloodGroup', bloodGroups, 'Select blood group')}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderInput('Phone Number', 'phone', 'tel', '9876543210', true)}
              {renderInput('Email', 'email', 'email', 'patient@email.com')}
            </div>
          </div>
        )}

        {/* Step 1: Identity */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-primary-50 border border-primary-100 rounded-lg p-3">
              <p className="text-sm text-[#0A75BB] font-medium">UHID: {formData.uhid}</p>
              <p className="text-xs text-gray-500 mt-0.5">Auto-generated for {clinicId === 'psri-delhi' ? 'PSRI Hospital' : 'Kidney Care Centre'}. You can edit if needed.</p>
            </div>
            {renderInput('UHID', 'uhid', 'text', 'KCC-YYYY-XXX')}
            {renderInput('ABHA Number', 'abhaNumber', 'text', '12-3456-7890-1234')}
            <p className="text-xs text-gray-400">Format: XX-XXXX-XXXX-XXXX</p>
            {renderInput('Aadhaar Number', 'aadhaar', 'text', 'XXXX XXXX XXXX')}
            <p className="text-xs text-gray-400">12-digit Aadhaar number (optional)</p>
          </div>
        )}

        {/* Step 2: Address */}
        {step === 2 && (
          <div className="space-y-4">
            {renderInput('Address', 'address', 'text', 'Street address, landmark')}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderInput('City', 'city', 'text', 'City')}
              {renderSelect('State', 'state', indianStates, 'Select state')}
            </div>
            {renderInput('Pincode', 'pincode', 'text', '6-digit pincode')}
          </div>
        )}

        {/* Step 3: Emergency */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Emergency contact information for medical situations.</p>
            {renderInput('Contact Name', 'emergencyContactName', 'text', 'Full name')}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderInput('Contact Phone', 'emergencyContactPhone', 'tel', '9876543210')}
              {renderSelect('Relation', 'emergencyContactRelation', relations, 'Select relation')}
            </div>
          </div>
        )}

        {/* Step 4: Medical */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.allergies.map((allergy) => (
                  <span key={allergy} className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200">
                    {allergy}
                    <button onClick={() => removeAllergy(allergy)} className="hover:text-red-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAllergy(allergyInput); } }}
                  placeholder="Type allergy and press Enter"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
                />
                <button
                  onClick={() => addAllergy(allergyInput)}
                  className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {commonAllergies.filter((a) => !formData.allergies.includes(a)).map((allergy) => (
                  <button
                    key={allergy}
                    onClick={() => addAllergy(allergy)}
                    className="px-2 py-0.5 border border-gray-200 rounded text-xs text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    + {allergy}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
              <textarea
                value={formData.medicalHistory}
                onChange={(e) => updateField('medicalHistory', e.target.value)}
                rows={4}
                placeholder="Previous diagnoses, surgeries, ongoing conditions..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderInput('Insurance Provider', 'insuranceProvider', 'text', 'e.g., Star Health')}
              {renderInput('Insurance Number', 'insuranceNumber', 'text', 'Policy number')}
            </div>
          </div>
        )}

        {/* Step 5: Family Members */}
        {step === 5 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Add family members for emergency and medical history context.</p>
            {formData.familyMembers.map((member) => (
              <div key={member.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">Family Member</p>
                  <button onClick={() => removeFamilyMember(member.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => updateFamilyMember(member.id, 'name', e.target.value)}
                    placeholder="Full name"
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
                  />
                  <select
                    value={member.relation}
                    onChange={(e) => updateFamilyMember(member.id, 'relation', e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
                  >
                    <option value="">Relation</option>
                    {relations.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={member.phone}
                    onChange={(e) => updateFamilyMember(member.id, 'phone', e.target.value)}
                    placeholder="Phone number"
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addFamilyMember}
              className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-[#0A75BB] hover:text-[#0A75BB] transition-colors w-full justify-center"
            >
              <Plus className="h-4 w-4" />
              Add Family Member
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
          <button
            onClick={prevStep}
            disabled={step === 0}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex gap-3">
            <Link
              href="/emr/patients"
              className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </Link>
            {step < steps.length - 1 ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0A75BB] text-white rounded-lg text-sm font-medium hover:bg-[#085D94] transition-colors shadow-sm"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Save Patient
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
