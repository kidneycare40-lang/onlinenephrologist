'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Settings, User, Building2, Bell, FileText, Sparkles, CreditCard, Calendar,
  Camera, Lock, Save, X, Upload, Image as ImageIcon, Plus, Trash2, ChevronDown, ChevronRight, Stethoscope, Calculator, RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClinic } from '@/lib/emr-clinic-context';
import { settingsApi } from '@/lib/api-client';
import type { PrescriptionTemplate, Medication, AdviceTemplate, TestPanelTemplate } from '@/types/emr';
import { prescriptionTemplates as builtInTemplates, builtInAdviceTemplates, builtInTestPanelTemplates } from '@/lib/data/emr-mock';
import { adviceTemplateStorage, testTemplateStorage } from '@/lib/template-storage';
import BookingSettingsComponent from '@/components/emr/BookingSettings';
import ConsultationSettingsComponent from '@/components/emr/ConsultationSettings';
import ClinicSettingsTab from '@/components/emr/ClinicSettingsTab';
import CalculatorsSettings from '@/components/emr/CalculatorsSettings';
import TemplateManager from '@/components/emr/TemplateManager';
import { loadBillingSettings, saveBillingSettings, type BillingSettings } from '@/lib/billing-settings';

type SettingsTab = 'profile' | 'clinic' | 'notifications' | 'prescription' | 'templates' | 'ai' | 'billing' | 'booking' | 'consultation' | 'calculators';

const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
  { id: 'clinic', label: 'Clinic', icon: <Building2 className="h-4 w-4" /> },
  { id: 'consultation', label: 'Consultation', icon: <Stethoscope className="h-4 w-4" /> },
  { id: 'booking', label: 'Booking Settings', icon: <Calendar className="h-4 w-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="h-4 w-4" /> },
  { id: 'prescription', label: 'Prescription', icon: <FileText className="h-4 w-4" /> },
  { id: 'templates', label: 'Templates', icon: <FileText className="h-4 w-4" /> },
  { id: 'ai', label: 'AI', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'billing', label: 'Billing', icon: <CreditCard className="h-4 w-4" /> },
  { id: 'calculators', label: 'Calculators', icon: <Calculator className="h-4 w-4" /> },
];

function Toggle({ enabled, onChange, label, description }: { enabled: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
          enabled ? 'bg-primary-600' : 'bg-gray-200'
        )}
      >
        <span className={cn('pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition duration-200', enabled ? 'translate-x-5' : 'translate-x-0')} />
      </button>
    </div>
  );
}

function ImageUpload({ label, sublabel, image, onUpload, onRemove }: { label: string; sublabel?: string; image: string | null; onUpload: (dataUrl: string) => void; onRemove: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxW = 800;
          let w = img.width;
          let h = img.height;
          if (w > maxW) { h = (h * maxW) / w; w = maxW; }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) { resolve(ev.target?.result as string); return; }
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressed);
        };
        img.onerror = () => resolve(ev.target?.result as string);
        img.src = ev.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file);
      if (dataUrl.length > 3 * 1024 * 1024) {
        alert('Image is still too large after compression. Please use a smaller image.');
        return;
      }
      onUpload(dataUrl);
    } catch {
      alert('Failed to process image.');
    }
  }

  return (
    <div>
      <p className="text-xs font-medium text-gray-600 mb-2">{label}</p>
      {image ? (
        <div className="relative w-full h-36 border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
          <img src={image} alt={label} className="w-full h-full object-contain" />
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="w-full h-36 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors cursor-pointer"
        >
          <ImageIcon className="h-8 w-8 mb-2" />
          <span className="text-xs font-medium">Click to upload</span>
          <span className="text-[10px] text-gray-400 mt-0.5">{sublabel || 'PNG, JPG up to 5MB'}</span>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

function defaultBillingSettings(): BillingSettings {
  return loadBillingSettings();
}

export default function SettingsPage() {
  const { clinicId } = useClinic();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [saved, setSaved] = useState(false);

  const rxHeaderKey = `emr_custom_rx_header_${clinicId}`;
  const rxFooterKey = `emr_custom_rx_footer_${clinicId}`;

  // Profile state
  const [firstName, setFirstName] = useState('Rajesh');
  const [lastName, setLastName] = useState('Goel');
  const [email, setEmail] = useState('2311.rajesh@gmail.com');
  const [phone, setPhone] = useState('9818235688');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('1980-05-15');
  const [qualifications, setQualifications] = useState('MBBS, DNB Internal Medicine, DNB Nephrology, Fellow Kidney Transplant Medicine');
  const [regNumber, setRegNumber] = useState('DMC/R/00734');
  const [experience, setExperience] = useState('18');
  const [specialization, setSpecialization] = useState('Nephrology');
  const [bio, setBio] = useState('Senior Nephrologist with 18+ years of experience in kidney care, dialysis, and transplant medicine.');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Clinic state (now managed in ClinicSettingsTab component)
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [footerImage, setFooterImage] = useState<string | null>(null);
  const [letterheadLogo, setLetterheadLogo] = useState<string | null>(null);

  // Notification state
  const [whatsappReminders, setWhatsappReminders] = useState(true);
  const [smsReminders, setSmsReminders] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [labAlerts, setLabAlerts] = useState(true);
  const [missedApptAlerts, setMissedApptAlerts] = useState(false);
  const [firstReminder, setFirstReminder] = useState('24 hours before');
  const [secondReminder, setSecondReminder] = useState('2 hours before');

  // Prescription state
  const [defaultTemplate, setDefaultTemplate] = useState('Standard Prescription');
  const [defaultInstructions, setDefaultInstructions] = useState('Take medicine as directed. Follow up after 1 month. Come with latest reports.');
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [enableDigitalSig, setEnableDigitalSig] = useState(true);
  const [autoAttachSig, setAutoAttachSig] = useState(false);
  const [customRxHeader, setCustomRxHeader] = useState<string | null>(null);
  const [customRxFooter, setCustomRxFooter] = useState<string | null>(null);

  // AI state
  const [aiDiagnosis, setAiDiagnosis] = useState(true);
  const [aiPrescription, setAiPrescription] = useState(true);
  const [aiVoice, setAiVoice] = useState(false);
  const [aiDrugInteraction, setAiDrugInteraction] = useState(true);
  const [aiRiskScoring, setAiRiskScoring] = useState(false);
  const [aiLanguage, setAiLanguage] = useState('Auto-detect');
  const [aiMode, setAiMode] = useState('Push-to-talk');
  const [aiDiagSuggest, setAiDiagSuggest] = useState(true);
  const [aiLabSuggest, setAiLabSuggest] = useState(true);
  const [aiReferralSuggest, setAiReferralSuggest] = useState(false);

  // Billing state
  const [billing, setBilling] = useState<BillingSettings>(defaultBillingSettings);
  const [billingLoaded, setBillingLoaded] = useState(false);

  // Template management state
  const STORAGE_KEY = 'kcc_custom_templates';
  const [templates, setTemplates] = useState<PrescriptionTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<PrescriptionTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDiagnosis, setNewTemplateDiagnosis] = useState('');
  const [newTemplateAdvice, setNewTemplateAdvice] = useState('');
  const [newTemplateTests, setNewTemplateTests] = useState('');
  const [newTemplateMeds, setNewTemplateMeds] = useState<Medication[]>([]);
  const [confirmDeleteTemplateId, setConfirmDeleteTemplateId] = useState<string | null>(null);

  // Advice templates state
  const [adviceTemplates, setAdviceTemplates] = useState<AdviceTemplate[]>([]);
  const [isCreatingAdvice, setIsCreatingAdvice] = useState(false);
  const [editingAdvice, setEditingAdvice] = useState<AdviceTemplate | null>(null);
  const [adviceName, setAdviceName] = useState('');
  const [adviceText, setAdviceText] = useState('');
  const [confirmDeleteAdviceId, setConfirmDeleteAdviceId] = useState<string | null>(null);

  // Test panel templates state
  const [testPanelTemplates, setTestPanelTemplates] = useState<TestPanelTemplate[]>([]);
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const [editingTest, setEditingTest] = useState<TestPanelTemplate | null>(null);
  const [testPanelName, setTestPanelName] = useState('');
  const [testPanelTests, setTestPanelTests] = useState('');
  const [confirmDeleteTestId, setConfirmDeleteTestId] = useState<string | null>(null);

  // Load all data from API on mount
  const loadAllSettings = useCallback(async () => {
    // Load templates
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setTemplates(stored);
    } catch { setTemplates([]); }
    setAdviceTemplates(adviceTemplateStorage.getAll());
    setTestPanelTemplates(testTemplateStorage.getAll());
    try {
      setCustomRxHeader(localStorage.getItem(rxHeaderKey) || null);
      setCustomRxFooter(localStorage.getItem(rxFooterKey) || null);
    } catch { /* ignore */ }

    // Load profile and settings from API
    try {
      const [doctors, settings, letterheads] = await Promise.all([
        settingsApi.getDoctors().catch(() => []),
        settingsApi.getSettings().catch(() => []),
        settingsApi.getLetterheads().catch(() => []),
      ]);

      // Load profile from first doctor
      const doctor = doctors?.[0];
      if (doctor) {
        if (doctor.first_name) setFirstName(doctor.first_name);
        if (doctor.last_name) setLastName(doctor.last_name);
        if (doctor.email) setEmail(doctor.email);
        if (doctor.phone) setPhone(doctor.phone);
        if (doctor.gender) setGender(doctor.gender);
        if (doctor.date_of_birth) setDob(doctor.date_of_birth);
        if (doctor.qualification) setQualifications(doctor.qualification);
        if (doctor.registration_number) setRegNumber(doctor.registration_number);
        if (doctor.experience_years) setExperience(String(doctor.experience_years));
        if (doctor.specialization) setSpecialization(doctor.specialization);
        if (doctor.bio) setBio(doctor.bio);
        if (doctor.profile_photo) setProfilePhoto(doctor.profile_photo);
      }

      // Load settings as key-value pairs
      if (Array.isArray(settings)) {
        for (const s of settings) {
          switch (s.key) {
            case 'notification_whatsapp': setWhatsappReminders(s.value === 'true' || s.value === true); break;
            case 'notification_sms': setSmsReminders(s.value === 'true' || s.value === true); break;
            case 'notification_email': setEmailNotifications(s.value === 'true' || s.value === true); break;
            case 'notification_lab_alerts': setLabAlerts(s.value === 'true' || s.value === true); break;
            case 'notification_missed_alerts': setMissedApptAlerts(s.value === 'true' || s.value === true); break;
            case 'reminder_first': setFirstReminder(s.value); break;
            case 'reminder_second': setSecondReminder(s.value); break;
            case 'rx_default_template': setDefaultTemplate(s.value); break;
            case 'rx_default_instructions': setDefaultInstructions(s.value); break;
            case 'rx_enable_digital_sig': setEnableDigitalSig(s.value === 'true' || s.value === true); break;
            case 'rx_auto_attach_sig': setAutoAttachSig(s.value === 'true' || s.value === true); break;
            case 'ai_diagnosis': setAiDiagnosis(s.value === 'true' || s.value === true); break;
            case 'ai_prescription': setAiPrescription(s.value === 'true' || s.value === true); break;
            case 'ai_voice': setAiVoice(s.value === 'true' || s.value === true); break;
            case 'ai_drug_interaction': setAiDrugInteraction(s.value === 'true' || s.value === true); break;
            case 'ai_risk_scoring': setAiRiskScoring(s.value === 'true' || s.value === true); break;
            case 'ai_language': setAiLanguage(s.value); break;
            case 'ai_mode': setAiMode(s.value); break;
            case 'ai_diag_suggest': setAiDiagSuggest(s.value === 'true' || s.value === true); break;
            case 'ai_lab_suggest': setAiLabSuggest(s.value === 'true' || s.value === true); break;
            case 'ai_referral_suggest': setAiReferralSuggest(s.value === 'true' || s.value === true); break;
          }
        }
      }

      // Load letterhead from API
      if (Array.isArray(letterheads)) {
        const lh = letterheads.find((l: any) => l.clinic_id === clinicId);
        if (lh) {
          if (lh.header_image) setCustomRxHeader(lh.header_image);
          if (lh.footer_image) setCustomRxFooter(lh.footer_image);
        }
      }
    } catch { /* fallback to localStorage values already loaded */ }

    // Load billing settings
    setBilling(loadBillingSettings());
    setBillingLoaded(true);
  }, [clinicId, rxHeaderKey, rxFooterKey]);

  useEffect(() => {
    loadAllSettings();
  }, [loadAllSettings]);

  function saveTemplates(updated: PrescriptionTemplate[]) {
    setTemplates(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function startCreateTemplate() {
    setIsCreating(true);
    setEditingTemplate(null);
    setNewTemplateName('');
    setNewTemplateDiagnosis('');
    setNewTemplateAdvice('');
    setNewTemplateTests('');
    setNewTemplateMeds([]);
  }

  function startEditTemplate(tpl: PrescriptionTemplate) {
    setEditingTemplate(tpl);
    setIsCreating(false);
    setNewTemplateName(tpl.name);
    setNewTemplateDiagnosis(tpl.diagnosis);
    setNewTemplateAdvice(tpl.advice || '');
    setNewTemplateTests((tpl.testsPrescribed || []).join(', '));
    setNewTemplateMeds([...tpl.medications]);
  }

  function addMedToTemplate() {
    setNewTemplateMeds([...newTemplateMeds, { name: '', dosage: '1-0-1', frequency: 'daily', duration: '1 month', instructions: '' }]);
  }

  function updateMedInTemplate(idx: number, field: keyof Medication, value: string) {
    const updated = [...newTemplateMeds];
    updated[idx] = { ...updated[idx], [field]: value };
    setNewTemplateMeds(updated);
  }

  function removeMedFromTemplate(idx: number) {
    setNewTemplateMeds(newTemplateMeds.filter((_, i) => i !== idx));
  }

  function saveTemplate() {
    if (!newTemplateName.trim() || newTemplateMeds.length === 0) return;
    const template: PrescriptionTemplate = {
      id: editingTemplate?.id || 'custom_' + Date.now(),
      name: newTemplateName,
      description: `${newTemplateMeds.length} medicines`,
      diagnosis: newTemplateDiagnosis,
      medications: newTemplateMeds,
      advice: newTemplateAdvice,
      testsPrescribed: newTemplateTests.split(',').map((t) => t.trim()).filter(Boolean),
      isCustom: true,
    };
    if (editingTemplate) {
      saveTemplates(templates.map((t) => (t.id === editingTemplate.id ? template : t)));
    } else {
      saveTemplates([...templates, template]);
    }
    setIsCreating(false);
    setEditingTemplate(null);
    setNewTemplateName('');
    setNewTemplateDiagnosis('');
    setNewTemplateAdvice('');
    setNewTemplateTests('');
    setNewTemplateMeds([]);
  }

  function deleteTemplate(id: string) {
    saveTemplates(templates.filter((t) => t.id !== id));
    setConfirmDeleteTemplateId(null);
  }

  // Advice template CRUD
  function saveAdviceTemplateCrud() {
    if (!adviceName.trim() || !adviceText.trim()) return;
    if (editingAdvice) {
      const updated = { ...editingAdvice, name: adviceName, advice: adviceText };
      adviceTemplateStorage.update(updated);
      setAdviceTemplates(adviceTemplateStorage.getAll());
    } else {
      const tpl: AdviceTemplate = { id: 'adv_custom_' + Date.now(), name: adviceName, advice: adviceText, isCustom: true };
      adviceTemplateStorage.add(tpl);
      setAdviceTemplates(adviceTemplateStorage.getAll());
    }
    setIsCreatingAdvice(false);
    setEditingAdvice(null);
    setAdviceName('');
    setAdviceText('');
  }

  function startEditAdvice(tpl: AdviceTemplate) {
    setEditingAdvice(tpl);
    setIsCreatingAdvice(true);
    setAdviceName(tpl.name);
    setAdviceText(tpl.advice);
  }

  function deleteAdviceTemplate(id: string) {
    adviceTemplateStorage.remove(id);
    setAdviceTemplates(adviceTemplateStorage.getAll());
    setConfirmDeleteAdviceId(null);
  }

  // Test panel template CRUD
  function saveTestTemplateCrud() {
    if (!testPanelName.trim() || !testPanelTests.trim()) return;
    const tests = testPanelTests.split(',').map((t) => t.trim()).filter(Boolean);
    if (editingTest) {
      const updated = { ...editingTest, name: testPanelName, tests };
      testTemplateStorage.update(updated);
      setTestPanelTemplates(testTemplateStorage.getAll());
    } else {
      const tpl: TestPanelTemplate = { id: 'tp_custom_' + Date.now(), name: testPanelName, tests, isCustom: true };
      testTemplateStorage.add(tpl);
      setTestPanelTemplates(testTemplateStorage.getAll());
    }
    setIsCreatingTest(false);
    setEditingTest(null);
    setTestPanelName('');
    setTestPanelTests('');
  }

  function startEditTest(tpl: TestPanelTemplate) {
    setEditingTest(tpl);
    setIsCreatingTest(true);
    setTestPanelName(tpl.name);
    setTestPanelTests(tpl.tests.join(', '));
  }

  function deleteTestTemplate(id: string) {
    testTemplateStorage.remove(id);
    setTestPanelTemplates(testTemplateStorage.getAll());
    setConfirmDeleteTestId(null);
  }

  async function handleSave() {
    // Save profile to API
    try {
      const doctors = await settingsApi.getDoctors().catch(() => []);
      const doctor = doctors?.[0];
      if (doctor) {
        await settingsApi.updateDoctor(doctor.id, {
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          gender,
          date_of_birth: dob,
          qualification: qualifications,
          registration_number: regNumber,
          experience_years: parseInt(experience) || 0,
          specialization,
          bio,
          profile_photo: profilePhoto || undefined,
        }).catch(() => {});
      }
    } catch { /* will save locally as fallback */ }

    // Save settings to API
    const settingsToSave: Array<{ key: string; value: string }> = [
      { key: 'notification_whatsapp', value: String(whatsappReminders) },
      { key: 'notification_sms', value: String(smsReminders) },
      { key: 'notification_email', value: String(emailNotifications) },
      { key: 'notification_lab_alerts', value: String(labAlerts) },
      { key: 'notification_missed_alerts', value: String(missedApptAlerts) },
      { key: 'reminder_first', value: firstReminder },
      { key: 'reminder_second', value: secondReminder },
      { key: 'rx_default_template', value: defaultTemplate },
      { key: 'rx_default_instructions', value: defaultInstructions },
      { key: 'rx_enable_digital_sig', value: String(enableDigitalSig) },
      { key: 'rx_auto_attach_sig', value: String(autoAttachSig) },
      { key: 'ai_diagnosis', value: String(aiDiagnosis) },
      { key: 'ai_prescription', value: String(aiPrescription) },
      { key: 'ai_voice', value: String(aiVoice) },
      { key: 'ai_drug_interaction', value: String(aiDrugInteraction) },
      { key: 'ai_risk_scoring', value: String(aiRiskScoring) },
      { key: 'ai_language', value: aiLanguage },
      { key: 'ai_mode', value: aiMode },
      { key: 'ai_diag_suggest', value: String(aiDiagSuggest) },
      { key: 'ai_lab_suggest', value: String(aiLabSuggest) },
      { key: 'ai_referral_suggest', value: String(aiReferralSuggest) },
    ];
    for (const s of settingsToSave) {
      settingsApi.upsertSetting(s.key, s.value).catch(() => {});
    }

    // Save letterhead to API
    if (clinicId) {
      const headerData = customRxHeader || '';
      const footerData = customRxFooter || '';
      if (headerData) {
        settingsApi.upsertLetterhead(clinicId, { header_image: headerData }).catch(() => {});
      }
      if (footerData) {
        settingsApi.upsertLetterhead(clinicId, { footer_image: footerData }).catch(() => {});
      }
    }

    // Also persist to localStorage as fallback
    try {
      if (customRxHeader) localStorage.setItem(rxHeaderKey, customRxHeader);
      else localStorage.removeItem(rxHeaderKey);
      if (customRxFooter) localStorage.setItem(rxFooterKey, customRxFooter);
      else localStorage.removeItem(rxFooterKey);
    } catch { /* localStorage full, server has it */ }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function Input({ label, value, onChange, type = 'text', placeholder, className }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; className?: string }) {
    return (
      <div className={className}>
        <label className="text-xs font-medium text-gray-600 mb-1.5 block">{label}</label>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
        />
      </div>
    );
  }

  function Select({ label, value, onChange, options, className }: { label: string; value: string; onChange: (v: string) => void; options: string[]; className?: string }) {
    return (
      <div className={className}>
        <label className="text-xs font-medium text-gray-600 mb-1.5 block">{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-8 space-y-5 pb-24 lg:pb-6">
      {/* Saved toast */}
      {saved && (
        <div className="fixed top-16 right-4 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-5">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          Settings saved successfully
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <div className="p-2 bg-gray-100 rounded-xl">
            <Settings className="h-6 w-6 text-gray-600" />
          </div>
          Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account, clinic details, and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Tab Navigation */}
        <div className="lg:w-56 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap',
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          {/* PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Doctor Profile</h2>
                </div>
                <div className="p-6">
                  <div className="flex items-start gap-6 mb-8">
                    <div className="relative">
                      {profilePhoto ? (
                        <img src={profilePhoto} alt="Profile" className="w-24 h-24 rounded-2xl object-cover" />
                      ) : (
                        <div className="w-24 h-24 rounded-2xl bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary-700">
                          {firstName[0]}{lastName[0]}
                        </div>
                      )}
                      <label className="absolute -bottom-1 -right-1 p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm cursor-pointer">
                        <Camera className="h-3.5 w-3.5" />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) { const r = new FileReader(); r.onload = (ev) => setProfilePhoto(ev.target?.result as string); r.readAsDataURL(f); }
                        }} />
                      </label>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">Dr. {firstName} {lastName}</h3>
                      <p className="text-sm text-gray-500">{specialization}</p>
                      <p className="text-xs text-gray-400 mt-1">Reg: {regNumber}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="First Name" value={firstName} onChange={setFirstName} />
                    <Input label="Last Name" value={lastName} onChange={setLastName} />
                    <Input label="Email" type="email" value={email} onChange={setEmail} />
                    <Input label="Phone" type="tel" value={phone} onChange={setPhone} />
                    <Select label="Gender" value={gender} onChange={setGender} options={['Male', 'Female', 'Other']} />
                    <Input label="Date of Birth" type="date" value={dob} onChange={setDob} />
                    <Select label="Specialization" value={specialization} onChange={setSpecialization} options={['Nephrology', 'Cardiology', 'Diabetology', 'General Medicine', 'Urology']} />
                    <Input label="Experience (years)" type="number" value={experience} onChange={setExperience} />
                    <Input label="Qualifications" value={qualifications} onChange={setQualifications} className="sm:col-span-2" />
                    <Input label="Registration Number" value={regNumber} onChange={setRegNumber} />
                  </div>
                  <div className="mt-4">
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Bio</label>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-gray-400" />
                    Change Password
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input label="Current Password" type="password" value={currentPassword} onChange={setCurrentPassword} placeholder="Enter current password" />
                    <Input label="New Password" type="password" value={newPassword} onChange={setNewPassword} placeholder="Enter new password" />
                    <Input label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirm new password" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
                  <Save className="h-4 w-4" /> Save Changes
                </button>
              </div>
            </div>
          )}

          {/* CLINIC */}
          {activeTab === 'clinic' && <ClinicSettingsTab />}

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Notification Preferences</h2>
              </div>
              <div className="px-6 divide-y divide-gray-100">
                <Toggle enabled={whatsappReminders} onChange={setWhatsappReminders} label="WhatsApp Reminders" description="Send appointment reminders via WhatsApp" />
                <Toggle enabled={smsReminders} onChange={setSmsReminders} label="SMS Reminders" description="Send appointment reminders via SMS" />
                <Toggle enabled={emailNotifications} onChange={setEmailNotifications} label="Email Notifications" description="Receive email notifications for updates" />
                <Toggle enabled={labAlerts} onChange={setLabAlerts} label="Lab Result Alerts" description="Get notified when lab results are ready" />
                <Toggle enabled={missedApptAlerts} onChange={setMissedApptAlerts} label="Missed Appointment Alerts" description="Alert when patient misses an appointment" />
              </div>
              <div className="px-6 py-4 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Reminder Timing</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select label="First Reminder" value={firstReminder} onChange={setFirstReminder} options={['24 hours before', '48 hours before', '72 hours before']} />
                  <Select label="Second Reminder" value={secondReminder} onChange={setSecondReminder} options={['2 hours before', '4 hours before', '6 hours before', '12 hours before', 'None']} />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
                  <Save className="h-4 w-4" /> Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* PRESCRIPTION */}
          {activeTab === 'prescription' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Default Prescription Template</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <Select label="Default Template" value={defaultTemplate} onChange={setDefaultTemplate} options={['Standard Prescription', 'CKD Management Template', 'Post-Transplant Template', 'Dialysis Prescription']} />
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">Default Instructions</label>
                      <textarea value={defaultInstructions} onChange={(e) => setDefaultInstructions(e.target.value)} rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Signature & Letterhead</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <ImageUpload label="Digital Signature" sublabel="PNG with transparent bg" image={signatureImage} onUpload={setSignatureImage} onRemove={() => setSignatureImage(null)} />
                    <ImageUpload label="Letterhead Logo" sublabel="PNG or JPG" image={letterheadLogo} onUpload={setLetterheadLogo} onRemove={() => setLetterheadLogo(null)} />
                    <ImageUpload label="Footer Image" sublabel="PNG or JPG" image={footerImage} onUpload={setFooterImage} onRemove={() => setFooterImage(null)} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Digital Signature Settings</h2>
                </div>
                <div className="px-6">
                  <Toggle enabled={enableDigitalSig} onChange={setEnableDigitalSig} label="Enable Digital Signature" description="Add digital signature to prescriptions" />
                  <Toggle enabled={autoAttachSig} onChange={setAutoAttachSig} label="Auto-attach Signature" description="Automatically add signature to all prescriptions" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Custom Letterhead Design</h2>
                  <p className="text-xs text-gray-500 mt-1">Upload pre-designed header and footer images for the &quot;Custom&quot; print option</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <ImageUpload
                      label="Custom Header Image"
                      sublabel="Full-width header image (recommended: 800x200px)"
                      image={customRxHeader}
                      onUpload={setCustomRxHeader}
                      onRemove={() => setCustomRxHeader(null)}
                    />
                    <ImageUpload
                      label="Custom Footer Image"
                      sublabel="Full-width footer image (recommended: 800x150px)"
                      image={customRxFooter}
                      onUpload={setCustomRxFooter}
                      onRemove={() => setCustomRxFooter(null)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
                  <Save className="h-4 w-4" /> Save Changes
                </button>
              </div>
            </div>
          )}

          {/* AI */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-500" /> AI Features
                  </h2>
                </div>
                <div className="px-6 divide-y divide-gray-100">
                  <Toggle enabled={aiDiagnosis} onChange={setAiDiagnosis} label="AI-Powered Diagnosis Suggestions" description="Get AI-based differential diagnosis from symptoms" />
                  <Toggle enabled={aiPrescription} onChange={setAiPrescription} label="Smart Prescription Auto-complete" description="AI auto-suggests medicines based on diagnosis" />
                  <Toggle enabled={aiVoice} onChange={setAiVoice} label="Voice Transcription" description="Convert voice notes to text in consultations" />
                  <Toggle enabled={aiDrugInteraction} onChange={setAiDrugInteraction} label="Drug Interaction Alerts" description="AI checks for drug interactions in prescriptions" />
                  <Toggle enabled={aiRiskScoring} onChange={setAiRiskScoring} label="Patient Risk Scoring" description="AI-based risk assessment for chronic patients" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Voice Transcription Settings</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select label="Language" value={aiLanguage} onChange={setAiLanguage} options={['English', 'Hindi', 'Auto-detect']} />
                    <Select label="Transcription Mode" value={aiMode} onChange={setAiMode} options={['Real-time', 'Push-to-talk', 'Continuous']} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Auto-Suggestions</h2>
                </div>
                <div className="px-6">
                  <Toggle enabled={aiDiagSuggest} onChange={setAiDiagSuggest} label="Diagnosis Suggestions" description="Suggest diagnoses from chief complaint" />
                  <Toggle enabled={aiLabSuggest} onChange={setAiLabSuggest} label="Lab Test Suggestions" description="Suggest relevant tests based on diagnosis" />
                  <Toggle enabled={aiReferralSuggest} onChange={setAiReferralSuggest} label="Referral Suggestions" description="Suggest specialist referrals when needed" />
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
                  <Save className="h-4 w-4" /> Save Settings
                </button>
              </div>
            </div>
          )}

          {/* TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              {/* Database-backed Template Manager */}
              <TemplateManager clinicId={clinicId ?? undefined} />

              {/* Legacy Medicine Templates (localStorage) */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900">Medicine Templates (Legacy)</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Create reusable medicine combinations for quick prescription</p>
                  </div>
                  <button onClick={startCreateTemplate}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#0A75BB] text-white text-xs font-medium rounded-lg hover:bg-[#085D94] transition-colors">
                    <Plus className="h-3.5 w-3.5" /> Add Medicine Template
                  </button>
                </div>

                {/* Create / Edit Form */}
                {(isCreating || editingTemplate) && (
                  <div className="px-6 py-5 border-b border-gray-100 bg-blue-50/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">{editingTemplate ? 'Edit Medicine Template' : 'Add Medicine Template'}</h3>
                      <button onClick={() => { setIsCreating(false); setEditingTemplate(null); }}
                        className="p-1 hover:bg-gray-200 rounded"><X className="h-4 w-4 text-gray-500" /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Template Name *</label>
                        <input type="text" value={newTemplateName} onChange={(e) => setNewTemplateName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30"
                          placeholder="e.g., CKD Stage 4, Post-Transplant" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Diagnosis</label>
                        <input type="text" value={newTemplateDiagnosis} onChange={(e) => setNewTemplateDiagnosis(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30"
                          placeholder="e.g., CKD Stage 4" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Default Advice</label>
                      <textarea value={newTemplateAdvice} onChange={(e) => setNewTemplateAdvice(e.target.value)} rows={2}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30 resize-none"
                        placeholder="e.g., Low potassium diet, fluid restriction..." />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Tests Prescribed (comma-separated)</label>
                      <input type="text" value={newTemplateTests} onChange={(e) => setNewTemplateTests(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30"
                        placeholder="e.g., CBC, Serum Creatinine, eGFR" />
                    </div>

                    {/* Medicines */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-gray-600">Medicines *</label>
                        <button onClick={addMedToTemplate}
                          className="flex items-center gap-1 text-[11px] font-medium text-[#0A75BB] hover:text-[#085D94]">
                          <Plus className="h-3 w-3" /> Add Medicine
                        </button>
                      </div>
                      {newTemplateMeds.length === 0 && (
                        <p className="text-xs text-gray-400 py-3 text-center border border-dashed border-gray-200 rounded-lg">No medicines added. Click &quot;Add Medicine&quot; to start.</p>
                      )}
                      {newTemplateMeds.map((med, idx) => (
                        <div key={idx} className="grid grid-cols-[1fr_100px_100px_100px_1fr_32px] gap-2 mb-2 items-center">
                          <input type="text" value={med.name} onChange={(e) => updateMedInTemplate(idx, 'name', e.target.value)}
                            className="px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#0A75BB]"
                            placeholder="Medicine name" />
                          <input type="text" value={med.dosage} onChange={(e) => updateMedInTemplate(idx, 'dosage', e.target.value)}
                            className="px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#0A75BB]"
                            placeholder="Dosage" />
                          <input type="text" value={med.frequency} onChange={(e) => updateMedInTemplate(idx, 'frequency', e.target.value)}
                            className="px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#0A75BB]"
                            placeholder="Frequency" />
                          <input type="text" value={med.duration} onChange={(e) => updateMedInTemplate(idx, 'duration', e.target.value)}
                            className="px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#0A75BB]"
                            placeholder="Duration" />
                          <input type="text" value={med.instructions || ''} onChange={(e) => updateMedInTemplate(idx, 'instructions', e.target.value)}
                            className="px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#0A75BB]"
                            placeholder="Notes" />
                          <button onClick={() => removeMedFromTemplate(idx)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button onClick={() => { setIsCreating(false); setEditingTemplate(null); }}
                        className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                      <button onClick={saveTemplate} disabled={!newTemplateName.trim() || newTemplateMeds.length === 0}
                        className="px-4 py-2 text-xs font-medium text-white bg-[#0A75BB] rounded-lg hover:bg-[#085D94] transition-colors disabled:opacity-50">
                        {editingTemplate ? 'Update Template' : 'Save Template'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Built-in Templates */}
                <div className="px-6 py-3 border-b border-gray-50 bg-gray-50/50">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Built-in Templates</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {builtInTemplates.map((tpl) => (
                    <div key={tpl.id} className="px-6 py-3 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4 text-gray-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{tpl.name}</p>
                            <p className="text-[11px] text-gray-400">{tpl.medications.length} medicines &middot; {tpl.description}</p>
                          </div>
                        </div>
                        <button onClick={() => {
                          const cloned = { ...tpl, id: 'custom_' + Date.now(), isCustom: true };
                          saveTemplates([...templates, cloned]);
                          setTemplates([...templates, cloned]);
                          startEditTemplate(cloned);
                        }}
                          className="px-2.5 py-1 text-[11px] font-medium text-[#0A75BB] bg-[#0A75BB]/10 rounded-lg hover:bg-[#0A75BB]/20 transition-colors">Edit</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Custom Templates */}
                {templates.length > 0 && (
                  <>
                    <div className="px-6 py-3 border-b border-gray-50 bg-blue-50/30">
                      <p className="text-[11px] font-semibold text-blue-500 uppercase tracking-wider">My Custom Templates ({templates.length})</p>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {templates.map((tpl) => (
                        <div key={tpl.id} className="px-6 py-3 hover:bg-gray-50/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                <FileText className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{tpl.name}</p>
                                <p className="text-[11px] text-gray-400">
                                  {tpl.medications.length} medicines
                                  {tpl.advice && ' \u00B7 Has advice'}
                                  {tpl.testsPrescribed && tpl.testsPrescribed.length > 0 && ` \u00B7 ${tpl.testsPrescribed.length} tests`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              <button onClick={() => startEditTemplate(tpl)}
                                className="px-2.5 py-1 text-[11px] font-medium text-[#0A75BB] bg-[#0A75BB]/10 rounded-lg hover:bg-[#0A75BB]/20 transition-colors">Edit</button>
                              {confirmDeleteTemplateId === tpl.id ? (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => deleteTemplate(tpl.id)}
                                    className="px-2 py-1 text-[10px] font-medium text-white bg-red-500 rounded-lg hover:bg-red-600">Confirm</button>
                                  <button onClick={() => setConfirmDeleteTemplateId(null)}
                                    className="px-2 py-1 text-[10px] font-medium text-gray-500 bg-gray-100 rounded-lg">Cancel</button>
                                </div>
                              ) : (
                                <button onClick={() => setConfirmDeleteTemplateId(tpl.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {templates.length === 0 && !isCreating && (
                  <div className="px-6 py-12 text-center">
                    <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No custom medicine templates yet</p>
                    <p className="text-xs text-gray-400 mt-1">Click &quot;Add Medicine Template&quot; above to create one, or save from the consultation page</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ADVICE TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900">Advice Templates</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Quick advice snippets for common conditions</p>
                  </div>
                  <button onClick={() => { setIsCreatingAdvice(true); setEditingAdvice(null); setAdviceName(''); setAdviceText(''); }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#0A75BB] text-white text-xs font-medium rounded-lg hover:bg-[#085D94] transition-colors">
                    <Plus className="h-3.5 w-3.5" /> New Template
                  </button>
                </div>

                {(isCreatingAdvice || editingAdvice) && (
                  <div className="px-6 py-5 border-b border-gray-100 bg-blue-50/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">{editingAdvice ? 'Edit Advice Template' : 'Create Advice Template'}</h3>
                      <button onClick={() => { setIsCreatingAdvice(false); setEditingAdvice(null); }} className="p-1 hover:bg-gray-200 rounded"><X className="h-4 w-4 text-gray-500" /></button>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Template Name *</label>
                      <input type="text" value={adviceName} onChange={(e) => setAdviceName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30"
                        placeholder="e.g., CKD Dialysis Advice" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Advice Text *</label>
                      <textarea value={adviceText} onChange={(e) => setAdviceText(e.target.value)} rows={4}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30 resize-none"
                        placeholder="Enter advice text..." />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button onClick={() => { setIsCreatingAdvice(false); setEditingAdvice(null); }}
                        className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                      <button onClick={saveAdviceTemplateCrud} disabled={!adviceName.trim() || !adviceText.trim()}
                        className="px-4 py-2 text-xs font-medium text-white bg-[#0A75BB] rounded-lg hover:bg-[#085D94] disabled:opacity-50">
                        {editingAdvice ? 'Update' : 'Save'} Template
                      </button>
                    </div>
                  </div>
                )}

                <div className="px-6 py-3 border-b border-gray-50 bg-gray-50/50">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Built-in Advice Templates</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {builtInAdviceTemplates.map((tpl) => (
                    <div key={tpl.id} className="px-6 py-3 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900">{tpl.name}</p>
                          <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5">{tpl.advice}</p>
                        </div>
                        <button onClick={() => {
                          const cloned = { ...tpl, id: 'adv_custom_' + Date.now(), isCustom: true };
                          adviceTemplateStorage.add(cloned);
                          setAdviceTemplates(adviceTemplateStorage.getAll());
                          startEditAdvice(cloned);
                        }} className="px-2.5 py-1 text-[11px] font-medium text-[#0A75BB] bg-[#0A75BB]/10 rounded-lg hover:bg-[#0A75BB]/20 transition-colors ml-3 shrink-0">Edit</button>
                      </div>
                    </div>
                  ))}
                </div>

                {adviceTemplates.length > 0 && (
                  <>
                    <div className="px-6 py-3 border-b border-gray-50 bg-blue-50/30">
                      <p className="text-[11px] font-semibold text-blue-500 uppercase tracking-wider">My Advice Templates ({adviceTemplates.length})</p>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {adviceTemplates.map((tpl) => (
                        <div key={tpl.id} className="px-6 py-3 hover:bg-gray-50/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900">{tpl.name}</p>
                              <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5">{tpl.advice}</p>
                            </div>
                            <div className="flex items-center gap-1.5 ml-3 shrink-0">
                              <button onClick={() => startEditAdvice(tpl)}
                                className="px-2.5 py-1 text-[11px] font-medium text-[#0A75BB] bg-[#0A75BB]/10 rounded-lg hover:bg-[#0A75BB]/20">Edit</button>
                              {confirmDeleteAdviceId === tpl.id ? (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => deleteAdviceTemplate(tpl.id)} className="px-2 py-1 text-[10px] font-medium text-white bg-red-500 rounded-lg">Del</button>
                                  <button onClick={() => setConfirmDeleteAdviceId(null)} className="px-2 py-1 text-[10px] font-medium text-gray-500 bg-gray-100 rounded-lg">No</button>
                                </div>
                              ) : (
                                <button onClick={() => setConfirmDeleteAdviceId(tpl.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-3.5 w-3.5" /></button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TEST PANEL TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900">Test Panel Templates</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Quick test panels for common investigations</p>
                  </div>
                  <button onClick={() => { setIsCreatingTest(true); setEditingTest(null); setTestPanelName(''); setTestPanelTests(''); }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#0A75BB] text-white text-xs font-medium rounded-lg hover:bg-[#085D94] transition-colors">
                    <Plus className="h-3.5 w-3.5" /> New Template
                  </button>
                </div>

                {(isCreatingTest || editingTest) && (
                  <div className="px-6 py-5 border-b border-gray-100 bg-blue-50/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">{editingTest ? 'Edit Test Template' : 'Create Test Template'}</h3>
                      <button onClick={() => { setIsCreatingTest(false); setEditingTest(null); }} className="p-1 hover:bg-gray-200 rounded"><X className="h-4 w-4 text-gray-500" /></button>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Template Name *</label>
                      <input type="text" value={testPanelName} onChange={(e) => setTestPanelName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30"
                        placeholder="e.g., CKD Routine Panel" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Tests (comma-separated) *</label>
                      <textarea value={testPanelTests} onChange={(e) => setTestPanelTests(e.target.value)} rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30 resize-none"
                        placeholder="e.g., CBC, Serum Creatinine, eGFR, Urine Routine" />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button onClick={() => { setIsCreatingTest(false); setEditingTest(null); }}
                        className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                      <button onClick={saveTestTemplateCrud} disabled={!testPanelName.trim() || !testPanelTests.trim()}
                        className="px-4 py-2 text-xs font-medium text-white bg-[#0A75BB] rounded-lg hover:bg-[#085D94] disabled:opacity-50">
                        {editingTest ? 'Update' : 'Save'} Template
                      </button>
                    </div>
                  </div>
                )}

                <div className="px-6 py-3 border-b border-gray-50 bg-gray-50/50">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Built-in Test Panels</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {builtInTestPanelTemplates.map((tpl) => (
                    <div key={tpl.id} className="px-6 py-3 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900">{tpl.name}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{tpl.tests.length} tests: {tpl.tests.slice(0, 4).join(', ')}{tpl.tests.length > 4 ? '...' : ''}</p>
                        </div>
                        <button onClick={() => {
                          const cloned = { ...tpl, id: 'tp_custom_' + Date.now(), isCustom: true };
                          testTemplateStorage.add(cloned);
                          setTestPanelTemplates(testTemplateStorage.getAll());
                          startEditTest(cloned);
                        }} className="px-2.5 py-1 text-[11px] font-medium text-[#0A75BB] bg-[#0A75BB]/10 rounded-lg hover:bg-[#0A75BB]/20 transition-colors ml-3 shrink-0">Edit</button>
                      </div>
                    </div>
                  ))}
                </div>

                {testPanelTemplates.length > 0 && (
                  <>
                    <div className="px-6 py-3 border-b border-gray-50 bg-blue-50/30">
                      <p className="text-[11px] font-semibold text-blue-500 uppercase tracking-wider">My Test Panel Templates ({testPanelTemplates.length})</p>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {testPanelTemplates.map((tpl) => (
                        <div key={tpl.id} className="px-6 py-3 hover:bg-gray-50/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900">{tpl.name}</p>
                              <p className="text-[11px] text-gray-400 mt-0.5">{tpl.tests.length} tests: {tpl.tests.slice(0, 4).join(', ')}{tpl.tests.length > 4 ? '...' : ''}</p>
                            </div>
                            <div className="flex items-center gap-1.5 ml-3 shrink-0">
                              <button onClick={() => startEditTest(tpl)}
                                className="px-2.5 py-1 text-[11px] font-medium text-[#0A75BB] bg-[#0A75BB]/10 rounded-lg hover:bg-[#0A75BB]/20">Edit</button>
                              {confirmDeleteTestId === tpl.id ? (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => deleteTestTemplate(tpl.id)} className="px-2 py-1 text-[10px] font-medium text-white bg-red-500 rounded-lg">Del</button>
                                  <button onClick={() => setConfirmDeleteTestId(null)} className="px-2 py-1 text-[10px] font-medium text-gray-500 bg-gray-100 rounded-lg">No</button>
                                </div>
                              ) : (
                                <button onClick={() => setConfirmDeleteTestId(tpl.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-3.5 w-3.5" /></button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* BILLING */}
          {activeTab === 'billing' && (
            <div className="space-y-4">
              {/* Doctor Info */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Doctor Information (Invoice Header)</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Shown on every invoice and printout</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Doctor Name" value={billing.doctor.name} onChange={(v) => setBilling({ ...billing, doctor: { ...billing.doctor, name: v } })} />
                    <Input label="Designation" value={billing.doctor.designation} onChange={(v) => setBilling({ ...billing, doctor: { ...billing.doctor, designation: v } })} />
                    <Input label="Locations" value={billing.doctor.locations} onChange={(v) => setBilling({ ...billing, doctor: { ...billing.doctor, locations: v } })} placeholder="e.g. Delhi and Faridabad" />
                    <Input label="Website 1" value={billing.doctor.website1} onChange={(v) => setBilling({ ...billing, doctor: { ...billing.doctor, website1: v } })} />
                    <Input label="Website 2" value={billing.doctor.website2} onChange={(v) => setBilling({ ...billing, doctor: { ...billing.doctor, website2: v } })} />
                    <Input label="Emergency Phone" value={billing.doctor.emergencyPhone} onChange={(v) => setBilling({ ...billing, doctor: { ...billing.doctor, emergencyPhone: v } })} />
                    <Input label="WhatsApp Phone" value={billing.doctor.whatsappPhone} onChange={(v) => setBilling({ ...billing, doctor: { ...billing.doctor, whatsappPhone: v } })} />
                  </div>
                </div>
              </div>

              {/* Clinic-wise Fees */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Consultation Fees by Clinic</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Auto-fills when creating invoice for that clinic's patient</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Faridabad Clinic Fee (₹)" type="number" value={String(billing.clinicFees['kcc-faridabad'] || 0)} onChange={(v) => setBilling({ ...billing, clinicFees: { ...billing.clinicFees, 'kcc-faridabad': Number(v) } })} />
                    <Input label="Saket Clinic Fee (₹)" type="number" value={String(billing.clinicFees['kcc-saket'] || 0)} onChange={(v) => setBilling({ ...billing, clinicFees: { ...billing.clinicFees, 'kcc-saket': Number(v) } })} />
                    <Input label="PSRI Delhi Fee (₹)" type="number" value={String(billing.clinicFees['psri-delhi'] || 0)} onChange={(v) => setBilling({ ...billing, clinicFees: { ...billing.clinicFees, 'psri-delhi': Number(v) } })} />
                    <Input label="Online Consultation Fee (₹)" type="number" value={String(billing.clinicFees['online'] || 0)} onChange={(v) => setBilling({ ...billing, clinicFees: { ...billing.clinicFees, 'online': Number(v) } })} />
                    <Input label="International Video Fee ($)" type="number" value={String(billing.clinicFees['online-intl'] || 0)} onChange={(v) => setBilling({ ...billing, clinicFees: { ...billing.clinicFees, 'online-intl': Number(v) } })} />
                    <Input label="Hospital Visit Fee (₹)" type="number" value={String(billing.clinicFees['psri-hospital'] || 0)} onChange={(v) => setBilling({ ...billing, clinicFees: { ...billing.clinicFees, 'psri-hospital': Number(v) } })} />
                  </div>
                </div>
              </div>

              {/* Invoice Services */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900">Invoice Services</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Quick Add options in Create Invoice modal</p>
                  </div>
                  <button
                    onClick={() => setBilling({ ...billing, services: [...billing.services, { description: '', rate: 0, gstRate: 0 }] })}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#0A75BB] bg-[#0A75BB]/10 rounded-lg hover:bg-[#0A75BB]/20 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                </div>
                <div className="p-6 space-y-3">
                  {billing.services.map((svc, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={svc.description}
                        onChange={(e) => {
                          const updated = [...billing.services];
                          updated[idx] = { ...updated[idx], description: e.target.value };
                          setBilling({ ...billing, services: updated });
                        }}
                        placeholder="Service name"
                        className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
                      />
                      <input
                        type="number"
                        value={svc.rate}
                        onChange={(e) => {
                          const updated = [...billing.services];
                          updated[idx] = { ...updated[idx], rate: Number(e.target.value) };
                          setBilling({ ...billing, services: updated });
                        }}
                        placeholder="Rate"
                        className="w-28 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
                      />
                      <button
                        onClick={() => {
                          const updated = billing.services.filter((_, i) => i !== idx);
                          setBilling({ ...billing, services: updated });
                        }}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment / Bank Details */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Payment & Bank Details</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Shown on invoice for patients to make payment</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="UPI ID" value={billing.payment.upiId} onChange={(v) => setBilling({ ...billing, payment: { ...billing.payment, upiId: v } })} placeholder="e.g. 9818235688@pthdfc" />
                    <Input label="Bank Name" value={billing.payment.bankName} onChange={(v) => setBilling({ ...billing, payment: { ...billing.payment, bankName: v } })} />
                    <Input label="Account Holder Name" value={billing.payment.accountName} onChange={(v) => setBilling({ ...billing, payment: { ...billing.payment, accountName: v } })} />
                    <Input label="IFSC Code" value={billing.payment.ifsc} onChange={(v) => setBilling({ ...billing, payment: { ...billing.payment, ifsc: v } })} />
                    <Input label="Account Number" value={billing.payment.accountNo} onChange={(v) => setBilling({ ...billing, payment: { ...billing.payment, accountNo: v } })} />
                  </div>
                </div>
              </div>

              {/* GST Settings */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">GST Settings</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="GST Rate (%)" type="number" value={String(billing.gst.rate)} onChange={(v) => setBilling({ ...billing, gst: { ...billing.gst, rate: Number(v) } })} />
                    <Input label="GSTIN" value={billing.gst.gstin} onChange={(v) => setBilling({ ...billing, gst: { ...billing.gst, gstin: v } })} />
                  </div>
                  <div className="mt-4">
                    <Toggle enabled={billing.gst.included} onChange={(v) => setBilling({ ...billing, gst: { ...billing.gst, included: v } })} label="Include GST in invoices" description="Automatically add GST to all invoices" />
                    <Toggle enabled={billing.gst.showBreakup} onChange={(v) => setBilling({ ...billing, gst: { ...billing.gst, showBreakup: v } })} label="Show GST breakup to patients" description="Display GST amount separately on receipts" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={() => { saveBillingSettings(billing); setSaved(true); setTimeout(() => setSaved(false), 3000); }} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm">
                  <Save className="h-4 w-4" /> Save Billing Settings
                </button>
              </div>
            </div>
          )}

          {/* BOOKING */}
          {activeTab === 'booking' && <BookingSettingsComponent />}

          {/* CONSULTATION */}
          {activeTab === 'consultation' && <ConsultationSettingsComponent />}

          {/* CALCULATORS */}
          {activeTab === 'calculators' && <CalculatorsSettings />}
        </div>
      </div>
    </div>
  );
}
