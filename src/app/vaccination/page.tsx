'use client';

import { useState, useCallback, useMemo, Suspense } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BreadcrumbSchema, WebPageSchema } from '@/components/seo/JsonLd';
import {
  Syringe, AlertTriangle, CheckCircle2,
  User, Share2, Copy, Check, Loader2, Shield, Calendar,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';

type HepatitisBDoses = { dose1: string; dose2: string; dose3: string; dose4: string };
type VaricellaDoses = { dose1: string; dose2: string };
type AntiHbs = { date: string; value: string };

type VaccinationRecord = {
  hepatitisB: HepatitisBDoses;
  influenza: string;
  pneumococcal: string;
  pneumococcalType: string;
  varicella: VaricellaDoses;
  antiHbs: AntiHbs;
};

type FormData = {
  patientName: string;
  phone: string;
  email: string;
  age: string;
  gender: string;
  diagnosis: string;
  vaccinations: VaccinationRecord;
  notes: string;
};

const defaultVaccinations: VaccinationRecord = {
  hepatitisB: { dose1: '', dose2: '', dose3: '', dose4: '' },
  influenza: '',
  pneumococcal: '',
  pneumococcalType: '',
  varicella: { dose1: '', dose2: '' },
  antiHbs: { date: '', value: '' },
};

const defaultFormData: FormData = {
  patientName: '',
  phone: '',
  email: '',
  age: '',
  gender: '',
  diagnosis: '',
  vaccinations: defaultVaccinations,
  notes: '',
};

const inputClass = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent outline-none transition-all';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

function VaccinationPageInner() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patient');

  const [form, setForm] = useState<FormData>(defaultFormData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('info');

  const updateField = useCallback((path: string, value: string) => {
    setForm((prev) => {
      const keys = path.split('.');
      const next = JSON.parse(JSON.stringify(prev));
      let obj: any = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/vaccination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, patientAccountId: patientId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }
      setSaved(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const shareUrl = useMemo(() => {
    if (typeof window !== 'undefined') return `${window.location.origin}/vaccination`;
    return '/vaccination';
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Please fill your vaccination record here:\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (saved) {
    return (
      <>
        <Navbar />
        <section className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 py-16">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Vaccination Record Saved!</h1>
              <p className="text-gray-600 mb-8">
                Your vaccination record has been saved successfully. Dr. Rajesh Goel will review your record at your next consultation.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => { setSaved(false); setForm(defaultFormData); }} className="px-6 py-3 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] transition-all">
                  Fill Another Record
                </button>
                <a href="/" className="px-6 py-3 border-2 border-[#0A75BB] text-[#0A75BB] font-semibold rounded-xl hover:bg-blue-50 transition-all">
                  Back to Home
                </a>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Vaccination Record', url: '/vaccination' }]} />
      <WebPageSchema title="Vaccination Record for Kidney Patients" description="Complete vaccination record and schedule for chronic kidney disease patients." url="/vaccination" />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0A75BB] to-[#063d5c] text-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4 text-sm">
            <Syringe className="h-4 w-4" /> Vaccination Record
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Vaccination Record for Kidney Patients</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Complete your vaccination record to help Dr. Rajesh Goel track your immunization schedule. Recommended for all chronic kidney disease patients.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={() => setShowShareModal(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-xl text-sm font-medium hover:bg-white/20 transition-all">
              <Share2 className="h-4 w-4" /> Share with Patient
            </button>
          </div>
        </div>
      </section>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Share Vaccination Form</h3>
            <p className="text-sm text-gray-600 mb-4">Send this link to your patient so they can fill in their vaccination record.</p>
            <div className="bg-gray-50 rounded-xl p-3 mb-4 flex items-center gap-2">
              <input type="text" readOnly value={shareUrl} className="flex-1 bg-transparent text-sm text-gray-700 outline-none" />
              <button onClick={handleCopyLink} className="shrink-0 px-3 py-1.5 bg-[#0A75BB] text-white text-sm font-medium rounded-lg hover:bg-[#085a94] transition-all flex items-center gap-1">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={handleShareWhatsApp} className="flex-1 px-4 py-2.5 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition-all text-sm">
                WhatsApp
              </button>
              <button onClick={() => setShowShareModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="py-8 md:py-12 bg-gray-50 min-h-[60vh]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Important Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">For Chronic Kidney Disease Patients</p>
              <p>All vaccinations below are recommended. Anti HBs antibody titres should be checked every 6 months. Protective titres for kidney disease patients are {'>'}100 miu/ml.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Patient Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-[#0A75BB]" /> Patient Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Name *</label>
                  <input type="text" required value={form.patientName} onChange={(e) => updateField('patientName', e.target.value)} placeholder="Enter patient name" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Phone Number *</label>
                  <input type="tel" required value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="patient@email.com" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Age</label>
                  <input type="number" min="0" max="120" value={form.age} onChange={(e) => updateField('age', e.target.value)} placeholder="Age" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Gender</label>
                  <select value={form.gender} onChange={(e) => updateField('gender', e.target.value)} className={inputClass}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Diagnosis / Condition</label>
                  <input type="text" value={form.diagnosis} onChange={(e) => updateField('diagnosis', e.target.value)} placeholder="e.g., CKD Stage 4, Dialysis" className={inputClass} />
                </div>
              </div>
            </div>

            {/* 1. Hepatitis B */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
              <button type="button" onClick={() => setExpandedSection(expandedSection === 'hepatitis' ? null : 'hepatitis')} className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center"><Syringe className="h-4 w-4 text-red-600" /></div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900">1. Hepatitis B</h3>
                    <p className="text-xs text-gray-500">Engerix-B / Shanvac-B / Enivac B (or any brand)</p>
                  </div>
                </div>
                <div className={`w-6 h-6 flex items-center justify-center transition-transform ${expandedSection === 'hepatitis' ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </button>
              {expandedSection === 'hepatitis' && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <div className="bg-blue-50 rounded-xl p-3 mb-4 text-xs text-blue-800">
                    <strong>Route:</strong> Injection into a muscle (upper arm for adults, thigh for infants)<br />
                    <strong>Dose:</strong> 2 ml (40 mcg) IM (Intramuscularly) each time
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>1st Dose (Day 0) - Date</label>
                      <input type="date" value={form.vaccinations.hepatitisB.dose1} onChange={(e) => updateField('vaccinations.hepatitisB.dose1', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>2nd Dose (1st month) - Date</label>
                      <input type="date" value={form.vaccinations.hepatitisB.dose2} onChange={(e) => updateField('vaccinations.hepatitisB.dose2', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>3rd Dose (2nd month) - Date</label>
                      <input type="date" value={form.vaccinations.hepatitisB.dose3} onChange={(e) => updateField('vaccinations.hepatitisB.dose3', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>4th Dose (6th month) - Date</label>
                      <input type="date" value={form.vaccinations.hepatitisB.dose4} onChange={(e) => updateField('vaccinations.hepatitisB.dose4', e.target.value)} className={inputClass} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Influenza */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
              <button type="button" onClick={() => setExpandedSection(expandedSection === 'influenza' ? null : 'influenza')} className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center"><Syringe className="h-4 w-4 text-orange-600" /></div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900">2. Influenza Vaccine Inj.</h3>
                    <p className="text-xs text-gray-500">Influvac (or any brand) - 0.5 ml I/M stat (once a year) - (May/June)</p>
                  </div>
                </div>
                <div className={`w-6 h-6 flex items-center justify-center transition-transform ${expandedSection === 'influenza' ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </button>
              {expandedSection === 'influenza' && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <div className="bg-blue-50 rounded-xl p-3 mb-4 text-xs text-blue-800">
                    <strong>Dose:</strong> 0.5 ml I/M stat (once a year) - ideally May/June
                  </div>
                  <div>
                    <label className={labelClass}>Date of Vaccination</label>
                    <input type="date" value={form.vaccinations.influenza} onChange={(e) => updateField('vaccinations.influenza', e.target.value)} className={inputClass} />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Pneumococcal */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
              <button type="button" onClick={() => setExpandedSection(expandedSection === 'pneumococcal' ? null : 'pneumococcal')} className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"><Shield className="h-4 w-4 text-purple-600" /></div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900">3. Pneumococcal Vaccine</h3>
                    <p className="text-xs text-gray-500">Prevenar 20 / Prevenar 13 / Pneumovax 23</p>
                  </div>
                </div>
                <div className={`w-6 h-6 flex items-center justify-center transition-transform ${expandedSection === 'pneumococcal' ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </button>
              {expandedSection === 'pneumococcal' && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <div className="bg-blue-50 rounded-xl p-3 mb-4 text-xs text-blue-800 space-y-1">
                    <p><strong>A)</strong> Injection Prevenar 20 vaccine (PCV 20) IM - No need to repeat</p>
                    <p><strong>B)</strong> If received 1st Inj Prevenar 13 - 0.5 ml/IM on day 0 then give injection Prevenar 20 after 1 year</p>
                    <p><strong>C)</strong> If received both Prevenar 13 and injection Pneumovax 23 then no need of any pneumonia vaccine</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Type Received</label>
                      <select value={form.vaccinations.pneumococcalType} onChange={(e) => updateField('vaccinations.pneumococcalType', e.target.value)} className={inputClass}>
                        <option value="">Select type</option>
                        <option value="prevenar20">Prevenar 20 (PCV 20) - Single dose</option>
                        <option value="prevenar13">Prevenar 13 (1st dose) - Need Prevenar 20 after 1 year</option>
                        <option value="both13and23">Both Prevenar 13 + Pneumovax 23 - No further vaccine needed</option>
                        <option value="notreceived">Not yet received</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Date of Vaccination</label>
                      <input type="date" value={form.vaccinations.pneumococcal} onChange={(e) => updateField('vaccinations.pneumococcal', e.target.value)} className={inputClass} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Varicella Zoster */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
              <button type="button" onClick={() => setExpandedSection(expandedSection === 'varicella' ? null : 'varicella')} className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><Syringe className="h-4 w-4 text-green-600" /></div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900">4. Varicella Zoster</h3>
                    <p className="text-xs text-gray-500">Shingrix vaccine - 2 doses for high-risk patients with weak immunity</p>
                  </div>
                </div>
                <div className={`w-6 h-6 flex items-center justify-center transition-transform ${expandedSection === 'varicella' ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </button>
              {expandedSection === 'varicella' && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <div className="bg-blue-50 rounded-xl p-3 mb-4 text-xs text-blue-800">
                    <strong>For:</strong> Healthy individuals above 50 years or adults above 18 years in high-risk patients with weak immunity<br />
                    <strong>Dose:</strong> Shingrix vaccine total 2 doses each of 0.5 ml<br />
                    <strong>Schedule:</strong> First dose - Month 0; Second dose 2 to 6 months after first dose
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>1st Dose (Month 0) - Date</label>
                      <input type="date" value={form.vaccinations.varicella.dose1} onChange={(e) => updateField('vaccinations.varicella.dose1', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>2nd Dose (2-6 months after) - Date</label>
                      <input type="date" value={form.vaccinations.varicella.dose2} onChange={(e) => updateField('vaccinations.varicella.dose2', e.target.value)} className={inputClass} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Anti HBs Antibody Titres */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
              <button type="button" onClick={() => setExpandedSection(expandedSection === 'antihbs' ? null : 'antihbs')} className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center"><Calendar className="h-4 w-4 text-cyan-600" /></div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900">5. Anti HBs Antibody Titres</h3>
                    <p className="text-xs text-gray-500">Check every 6 months - Protective titre {'>'}100 miu/ml</p>
                  </div>
                </div>
                <div className={`w-6 h-6 flex items-center justify-center transition-transform ${expandedSection === 'antihbs' ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </button>
              {expandedSection === 'antihbs' && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <div className="bg-blue-50 rounded-xl p-3 mb-4 text-xs text-blue-800">
                    <strong>Purpose:</strong> To check for adequate immune (protective against Hepatitis B) response of vaccine<br />
                    <strong>Frequency:</strong> Every 6 months<br />
                    <strong>Target:</strong> Protective titres {'>'}100 miu/ml for kidney disease patients
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Date of Test</label>
                      <input type="date" value={form.vaccinations.antiHbs.date} onChange={(e) => updateField('vaccinations.antiHbs.date', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Value (miu/ml)</label>
                      <input type="number" step="0.01" min="0" value={form.vaccinations.antiHbs.value} onChange={(e) => updateField('vaccinations.antiHbs.value', e.target.value)} placeholder="e.g., 150" className={inputClass} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Notes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Additional Notes</h2>
              <textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} placeholder="Any additional information about vaccination history, allergies, or side effects..." rows={4} className={inputClass + ' resize-none'} />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            {/* Submit */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button type="button" onClick={() => { setForm(defaultFormData); setError(''); }} className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all">
                Reset Form
              </button>
              <button type="submit" disabled={saving} className="px-8 py-3 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Save Vaccination Record'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default function VaccinationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#0A75BB]" /></div>}>
      <VaccinationPageInner />
    </Suspense>
  );
}
