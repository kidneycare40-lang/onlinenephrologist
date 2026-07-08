'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef, Component, type ReactNode } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { RequirePermission } from '@/components/emr/RequirePermission';
import { cn, calculateAge, formatDate } from '@/lib/utils';
import {
  consultations,
  patients,
  prescriptions as allPrescriptions,
  labOrders,
  labTestGroups,
  icdDiagnoses,
  commonMedicines,
  builtInAdviceTemplates,
  builtInTestPanelTemplates,
} from '@/lib/data/emr-mock';
import { adviceTemplateStorage, testTemplateStorage } from '@/lib/template-storage';
import type { EMRConsultation, EMRPatient, Vitals, PrescriptionItem, Investigation, AdviceTemplate, TestPanelTemplate } from '@/types/emr';
import { useClinic } from '@/lib/emr-clinic-context';

import ConsultSidebar from '@/components/emr/ConsultSidebar';
import PatientHeaderBar from '@/components/emr/PatientHeaderBar';
import VitalsSection from '@/components/emr/VitalsSection';
import TextSection from '@/components/emr/TextSection';
import DiagnosisTable from '@/components/emr/DiagnosisTable';
import MedicineTable from '@/components/emr/MedicineTable';
import { InvestigationsTable } from '@/components/emr/InvestigationsSection';
import PastVisitsTimeline from '@/components/emr/PastVisitsTimeline';
import BottomActionBar from '@/components/emr/BottomActionBar';
import PrintPreviewModal from '@/components/emr/PrintPreviewModal';
import ReportUploadOCR from '@/components/emr/ReportUploadOCR';
import { Plus, Search, Trash2, X, Stethoscope, Calendar } from 'lucide-react';
import { type ExtractedLabValue, type ExtractedMedicine, type OCRResult } from '@/lib/ocr-utils';
import { autoCorrect } from '@/lib/spellcheck';
import { loadConsultationFromApi, loadPatientFromApi, saveConsultationToApi, apiPatientToEMR } from '@/lib/consultation-api';
import { patientsApi } from '@/lib/api-client';
import TemplateSelector from '@/components/emr/TemplateSelector';

class ErrorBoundary extends Component<{children: ReactNode}, {error: Error | null}> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '20px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', margin: '20px' }}>
          <h3 style={{ color: '#dc2626', fontWeight: 'bold' }}>Component Error:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', color: '#7f1d1d' }}>{this.state.error.message}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '10px', color: '#991b1b', marginTop: '8px' }}>{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export default function ConsultationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const rawBookingId = id.startsWith('consult-obp-') ? id.replace('consult-obp-', '') : id;
  const patientId = id.startsWith('consult-emr-') ? id.replace('consult-emr-', '') : id;
  const { clinicId } = useClinic();

  const today = new Date().toISOString().split('T')[0];
  const [consultationDate, setConsultationDate] = useState(today);
  const [activeSection, setActiveSection] = useState('documents');
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const [testRequests, setTestRequests] = useState<string[]>([
    'URINE ROUTINE',
  ]);
  const [testRequestByWhen, setTestRequestByWhen] = useState('');
  const [testRequestByWhenType, setTestRequestByWhenType] = useState<'None' | 'Today' | 'Next Visit' | 'ASAP' | 'Days' | 'Weeks' | 'Months' | 'Calendar'>('None');
  const [testRequestByWhenValue, setTestRequestByWhenValue] = useState<number>(4);
  const [testRequestByWhenUnit, setTestRequestByWhenUnit] = useState<'Days' | 'Weeks' | 'Months'>('Months');
  const [testRequestByWhenDate, setTestRequestByWhenDate] = useState('');
  const [nextVisitValue, setNextVisitValue] = useState<number>(0);
  const [nextVisitUnit, setNextVisitUnit] = useState<'Days' | 'Weeks' | 'Months' | ''>('');
  const [nextVisitDate, setNextVisitDate] = useState('');
  const [testGroupSearch, setTestGroupSearch] = useState('');
  const [testSelectedIdx, setTestSelectedIdx] = useState(-1);
  const [testDropdownPos, setTestDropdownPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const testInputRef = useRef<HTMLInputElement>(null);
  const testDropdownRef = useRef<HTMLDivElement>(null);
  const [showTestTemplates, setShowTestTemplates] = useState(false);
  const [testTemplateSearch, setTestTemplateSearch] = useState('');

  const [showAdviceTemplates, setShowAdviceTemplates] = useState(false);
  const [adviceTemplateSearch, setAdviceTemplateSearch] = useState('');
  const [customAdviceTemplates, setCustomAdviceTemplates] = useState<AdviceTemplate[]>([]);
  const [showSaveAdviceTemplate, setShowSaveAdviceTemplate] = useState(false);
  const [adviceTemplateName, setAdviceTemplateName] = useState('');

  const [showTestPanelTemplates, setShowTestPanelTemplates] = useState(false);
  const [testPanelSearch, setTestPanelSearch] = useState('');

  const computeByWhenDate = (value: number, unit: string): string => {
    const d = new Date();
    if (unit === 'Days') d.setDate(d.getDate() + value);
    else if (unit === 'Weeks') d.setDate(d.getDate() + value * 7);
    else d.setMonth(d.getMonth() + value);
    return d.toISOString().split('T')[0];
  };
  const [customTestPanelTemplates, setCustomTestPanelTemplates] = useState<TestPanelTemplate[]>([]);
  const [showSaveTestTemplate, setShowSaveTestTemplate] = useState(false);
  const [testTemplateName, setTestTemplateName] = useState('');

  useEffect(() => {
    setCustomAdviceTemplates(adviceTemplateStorage.getAll());
    setCustomTestPanelTemplates(testTemplateStorage.getAll());
  }, []);

  const testTemplates = [
    { name: 'Renal Panel', description: 'Urine, Creatinine, Urea, eGFR, Electrolytes', tests: ['Urine Routine', 'Urine Culture & Sensitivity', 'Urine Albumin/Creatinine Ratio (ACR)', 'Serum Creatinine', 'Blood Urea', 'eGFR', 'Serum Potassium', 'Serum Sodium'] },
    { name: 'CBC', description: 'Complete Blood Count with differential', tests: ['Haemoglobin', 'Total Leukocyte Count', 'Differential Leukocyte Count', 'Platelet Count', 'Mean Corpuscular Volume (MCV)', 'Mean Corpuscular Haemoglobin (MCH)', 'Mean Corpuscular Haemoglobin Concentration (MCHC)', 'Red Cell Distribution Width (RDW)', 'Packed Cell Volume (PCV)', 'Peripheral Smear', 'Erythrocyte Sedimentation Rate (ESR)'] },
    { name: 'Diabetes Panel', description: 'HbA1c, Fasting & PP glucose, Urine analysis', tests: ['HbA1c', 'Fasting Blood Sugar', 'Postprandial Blood Sugar', 'Urine Routine'] },
    { name: 'Liver Panel', description: 'LFT, Albumin, Bilirubin, SGOT, SGPT', tests: ['SGOT (AST)', 'SGPT (ALT)', 'Alkaline Phosphatase (ALP)', 'Total Bilirubin', 'Direct Bilirubin', 'GGT', 'Total Protein', 'Serum Albumin', 'Globulin'] },
    { name: 'Thyroid Panel', description: 'TSH, Free T3, Free T4', tests: ['TSH', 'Free T3', 'Free T4', 'Total T3', 'Total T4'] },
    { name: 'Iron Studies', description: 'Serum Iron, TIBC, Ferritin, Transferrin Saturation', tests: ['Serum Iron', 'TIBC', 'Serum Ferritin', 'Transferrin Saturation'] },
    { name: 'Mineral Metabolism', description: 'Calcium, Phosphorus, PTH, Vitamin D, Magnesium', tests: ['Serum Calcium', 'Serum Phosphorus', 'Intact PTH', 'Vitamin D (25-OH)', 'Serum Magnesium'] },
    { name: 'Hepatitis Screen', description: 'HbsAg, Anti-HCV, Anti-HIV', tests: ['HbsAg', 'Anti-HCV', 'Anti-HIV 1&2', 'Anti-HBs Antibody'] },
    { name: 'Autoimmune', description: 'ANA, ANCA, Complement', tests: ['ANA', 'P-ANCA', 'C-ANCA', 'Complement C3', 'Complement C4'] },
    { name: 'Lipid Profile', description: 'Cholesterol, HDL, LDL, Triglycerides', tests: ['Total Cholesterol', 'HDL Cholesterol', 'LDL Cholesterol', 'VLDL', 'Triglycerides', 'TC/HDL Ratio'] },
    { name: 'Full Body Checkup', description: 'CBC, HbA1c, Lipid, LFT, Renal, Thyroid, USG', tests: ['Haemoglobin', 'Total Leukocyte Count', 'Platelet Count', 'HbA1c', 'Fasting Blood Sugar', 'Total Cholesterol', 'HDL Cholesterol', 'LDL Cholesterol', 'Triglycerides', 'SGOT (AST)', 'SGPT (ALT)', 'Serum Creatinine', 'Blood Urea', 'eGFR', 'TSH', 'Urine Routine', 'ULTRA SOUND WHOLE ABDOMEN PREVOID/POSTVOID WITH FULL BLADDER'] },
    { name: 'Vasculitis Workup', description: 'ANCA, ANA, Complement, ESR', tests: ['P-ANCA (MPO)', 'C-ANCA (PR3)', 'ANCA Profile', 'ANA', 'Complement C3', 'Complement C4', 'Erythrocyte Sedimentation Rate (ESR)'] },
  ];

  const [historyText, setHistoryText] = useState('');
  const [showHistorySection, setShowHistorySection] = useState(false);

  const [addedPatients, setAddedPatients] = useState<EMRPatient[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [consultation, setConsultation] = useState<EMRConsultation | null>(null);
  const [patient, setPatient] = useState<any>(null);

  // Load online bookings from localStorage (kept as fallback)
  const onlineBookings = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('emr_bookings') || '[]') as { bookingId: string; firstName: string; lastName: string; phone: string; email: string; age: string; gender: string; consultationType: string; clinicId: string; date: string; time: string; reason: string; createdAt: string; status: string; consultationFee: number; paymentStatus?: string }[];
    } catch { return []; }
  }, []);

  const allPatients = useMemo(() => [...patients, ...addedPatients], [addedPatients]);

  // Load consultation and patient from API (with localStorage fallback)
  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      setIsLoadingData(true);
      setConsultation(null);
      setPatient(null);
      try {
        // Try loading from API first
        const { consultation: apiConsult, patient: apiPatient } = await loadConsultationFromApi(id, clinicId || undefined);

        if (cancelled) return;

        if (apiConsult && apiPatient) {
          if (clinicId && apiConsult.clinicId && apiConsult.clinicId !== clinicId) {
            setIsLoadingData(false);
            return;
          }
          setConsultation(apiConsult);
          setPatient(apiPatient);
          setIsLoadingData(false);
          return;
        }

        // Try loading patient by ID directly
        if (!apiConsult) {
          const directPatient = await loadPatientFromApi(id, clinicId || undefined);
          if (cancelled) return;

          if (directPatient) {
            setPatient(directPatient);
            // Create new consultation for this patient
            const newConsult: EMRConsultation = {
              id: `consult-${directPatient.id}`,
              patientId: directPatient.id,
              clinicId: directPatient.clinicId || clinicId || '',
              date: new Date().toISOString().split('T')[0],
              doctorName: 'Dr Rajesh Goel',
              chiefComplaint: '',
              hpi: '',
              examination: '',
              vitals: { bloodPressure: '', pulse: '', temperature: '', spo2: '', weight: '', height: '', bmi: '' },
              diagnoses: [],
              prescriptions: [],
              investigations: [],
              advice: '',
              notes: '',
              followUpDate: '',
              status: 'IN_PROGRESS',
            };
            setConsultation(newConsult);
            setIsLoadingData(false);
            return;
          }
        }
      } catch {
        // API failed, fall through to localStorage
      }

      if (cancelled) return;

      // Fallback: load from localStorage (existing logic)
      let storedConsultations: EMRConsultation[] = [];
      try {
        storedConsultations = JSON.parse(localStorage.getItem('emr_consultations') || '[]');
      } catch { /* ignore */ }

      let storedPatients: EMRPatient[] = [];
      try {
        storedPatients = JSON.parse(localStorage.getItem('emr_added_patients') || '[]');
      } catch { /* ignore */ }

      setAddedPatients(storedPatients);
      const allStored = [...patients, ...storedPatients];

      // Check stored consultations
      const storedConsult = storedConsultations.find((c) => {
        if (clinicId && c.clinicId && c.clinicId !== clinicId) return false;
        return c.id === id || c.patientId === id || c.patientId === patientId;
      });
      if (storedConsult) {
        const pat = allStored.find((p) => p.id === storedConsult.patientId);
        if (pat) {
          setConsultation(storedConsult);
          setPatient(pat);
          setIsLoadingData(false);
          return;
        }
      }

      // Check mock consultations
      let consult = consultations.find((c) => {
        if (clinicId && c.clinicId && c.clinicId !== clinicId) return false;
        return c.id === id || c.patientId === id || c.patientId === patientId;
      });
      if (!consult) {
        consult = consultations.find((c) => c.patientId === id || c.patientId === patientId);
      }
      if (consult) {
        const pat = allStored.find((p) => p.id === consult!.patientId);
        setConsultation(consult);
        setPatient(pat || null);
        setIsLoadingData(false);
        return;
      }

      // Check online bookings - auto-create patient + consultation
      // First check if patient already exists in emr_added_patients
      const existingPat = storedPatients.find((p) => p.id === id || p.id === `obp-${rawBookingId}`);
      const booking = onlineBookings.find((b) => b.bookingId === rawBookingId);
      if (existingPat && !storedConsultations.find((c) => c.patientId === existingPat.id)) {
        // Patient exists but no consultation yet — create one
        const patClinicId = existingPat.clinicId || 'online';
        const newConsult: EMRConsultation = {
          id: `consult-${existingPat.id}`,
          patientId: existingPat.id,
          clinicId: patClinicId,
          date: booking?.date || new Date().toISOString().split('T')[0],
          doctorName: 'Dr. Rajesh Goel',
          status: 'IN_PROGRESS',
          tokenId: `#${existingPat.id.slice(-6).toUpperCase()}`,
          chiefComplaint: booking?.reason || '',
          hpi: '',
          examination: '',
          vitals: { bloodPressure: '', pulse: '', temperature: '', spo2: '', weight: '', height: '', bmi: '' },
          diagnoses: [],
          prescriptions: [],
          investigations: [],
          advice: '',
          notes: '',
          followUpDate: '',
        };
        storedConsultations.push(newConsult);
        localStorage.setItem('emr_consultations', JSON.stringify(storedConsultations));
        setConsultation(newConsult);
        setPatient(existingPat);
        setIsLoadingData(false);
        return;
      }
      if (booking) {
        const bookingClinicId = booking.clinicId === 'online' ? 'online' : booking.clinicId;
        const patientId = `obp-${booking.bookingId}`;
        const newPat: EMRPatient = {
          id: patientId,
          firstName: booking.firstName,
          lastName: booking.lastName,
          phone: booking.phone,
          email: booking.email,
          dateOfBirth: booking.age ? `${new Date().getFullYear() - parseInt(booking.age)}-01-01` : '1990-01-01',
          gender: (booking.gender as 'Male' | 'Female') || 'Male',
          bloodGroup: '',
          uhid: `OB-${booking.bookingId.slice(-6).toUpperCase()}`,
          clinicId: bookingClinicId,
          abhaNumber: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          emergencyContactRelation: '',
          allergies: [],
          medicalHistory: '',
          isChronic: false,
          isActive: true,
          source: 'website',
          createdAt: booking.createdAt || new Date().toISOString(),
          lastVisit: booking.date,
          totalVisits: 0,
          familyMembers: [],
        };

        // Save patient to localStorage
        if (!storedPatients.find((p) => p.id === patientId)) {
          storedPatients.push(newPat);
          localStorage.setItem('emr_added_patients', JSON.stringify(storedPatients));
        }

        const newConsult: EMRConsultation = {
          id: `consult-${booking.bookingId}`,
          patientId,
          clinicId: bookingClinicId,
          date: booking.date || new Date().toISOString().split('T')[0],
          doctorName: 'Dr. Rajesh Goel',
          status: 'IN_PROGRESS',
          tokenId: `#${booking.bookingId.slice(-6).toUpperCase()}`,
          chiefComplaint: booking.reason || '',
          hpi: '',
          examination: '',
          vitals: { bloodPressure: '', pulse: '', temperature: '', spo2: '', weight: '', height: '', bmi: '' },
          diagnoses: [],
          prescriptions: [],
          investigations: [],
          advice: '',
          notes: '',
          followUpDate: '',
        };

        storedConsultations.push(newConsult);
        localStorage.setItem('emr_consultations', JSON.stringify(storedConsultations));

        setConsultation(newConsult);
        setPatient(newPat);
        setIsLoadingData(false);
        return;
      }

      // Check direct patient ID in localStorage/mock
      const pat = allStored.find((p) => p.id === patientId);
      if (pat) {
        const newConsult: EMRConsultation = {
          id: `consult-${pat.id}`,
          patientId: pat.id,
          clinicId: pat.clinicId || clinicId || '',
          date: new Date().toISOString().split('T')[0],
          doctorName: 'Dr Rajesh Goel',
          chiefComplaint: '',
          hpi: '',
          examination: '',
          vitals: { bloodPressure: '', pulse: '', temperature: '', spo2: '', weight: '', height: '', bmi: '' },
          diagnoses: [],
          prescriptions: [],
          investigations: [],
          advice: '',
          notes: '',
          followUpDate: '',
          status: 'IN_PROGRESS',
        };
        setConsultation(newConsult);
        setPatient(pat);
      }

      setIsLoadingData(false);
    };

    loadData();
    return () => { cancelled = true; };
  }, [id, clinicId, onlineBookings]);

  const calculateBMI = useCallback((weight: string, height: string) => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (w > 0 && h > 0) {
      const hm = h / 100;
      return (w / (hm * hm)).toFixed(1);
    }
    return '';
  }, []);

  const updateVitals = (field: keyof Vitals, value: string) => {
    if (!consultation) return;
    setConsultation(prev => {
      if (!prev) return prev;
      const newVitals = { ...prev.vitals, [field]: value };
      if (field === 'weight' || field === 'height') {
        const w = field === 'weight' ? value : prev.vitals.weight || '';
        const h = field === 'height' ? value : prev.vitals.height || '';
        newVitals.bmi = calculateBMI(w, h);
      }
      return { ...prev, vitals: newVitals };
    });
  };

  const updateField = (field: keyof EMRConsultation, value: string) => {
    if (!consultation) return;
    setConsultation({ ...consultation, [field]: value });
  };

  const autoCorrectField = (field: keyof EMRConsultation) => {
    if (!consultation) return;
    const value = consultation[field];
    if (typeof value !== 'string') return;
    const corrected = autoCorrect(value);
    if (corrected !== value) {
      setConsultation({ ...consultation, [field]: corrected });
    }
  };

  const handleApplyLabValues = (values: ExtractedLabValue[]) => {
    if (!consultation) return;
    const existingTests = consultation.investigations.map((inv) => inv.testName);
    const newInvestigations = [...consultation.investigations];
    for (const v of values) {
      if (!existingTests.includes(v.testName)) {
        newInvestigations.push({
          id: generateId(),
          testName: v.testName,
          result: v.value,
          unit: v.unit,
          normalRange: v.normalRange || '',
          isAbnormal: false,
          status: 'completed',
          date: new Date().toISOString(),
        });
      }
    }
    setConsultation({ ...consultation, investigations: newInvestigations });
    showToastMessage(`Applied ${values.length} lab values`);
  };

  const handleApplyVitals = (vitals: OCRResult['vitals']) => {
    if (!consultation) return;
    setConsultation(prev => {
      if (!prev) return prev;
      const newVitals = { ...prev.vitals };
      if (vitals.systolic && vitals.diastolic) {
        newVitals.bloodPressure = `${vitals.systolic}/${vitals.diastolic}`;
      }
      if (vitals.pulse) newVitals.pulse = vitals.pulse;
      if (vitals.spo2) newVitals.spo2 = vitals.spo2;
      if (vitals.weight) newVitals.weight = vitals.weight;
      if (vitals.height) newVitals.height = vitals.height;
      if (vitals.temperature) newVitals.temperature = vitals.temperature;
      if (vitals.weight && vitals.height) {
        newVitals.bmi = calculateBMI(vitals.weight, vitals.height);
      }
      return { ...prev, vitals: newVitals };
    });
    showToastMessage('Vitals applied');
  };

  const handleApplyDiagnoses = (diagnoses: string[]) => {
    if (!consultation) return;
    const existing = consultation.diagnoses.map((d) => d.name.toLowerCase());
    const newDiagnoses = [...consultation.diagnoses];
    for (const d of diagnoses) {
      const corrected = autoCorrect(d);
      if (!existing.includes(corrected.toLowerCase())) {
        newDiagnoses.push({
          id: generateId(),
          name: corrected,
          icdCode: '',
          isPrimary: true,
        });
      }
    }
    setConsultation({ ...consultation, diagnoses: newDiagnoses });
    showToastMessage(`Applied ${diagnoses.length} diagnoses`);
  };

  const handleApplyMedicines = (medicines: string[]) => {
    if (!consultation) return;
    const existing = consultation.prescriptions.map((p) => p.name.toLowerCase());
    const newPrescriptions = [...consultation.prescriptions];
    for (const med of medicines) {
      const name = med.replace(/^(tab(?:let)?|cap(?:sule)?|inj(?:ection)?|syrup|suspension)\s+/i, '').trim();
      const corrected = autoCorrect(name);
      if (!existing.includes(corrected.toLowerCase()) && corrected.length > 2) {
        newPrescriptions.push({
          id: generateId(),
          name: corrected,
          dosage: '',
          strength: '',
          frequency: '',
          duration: '',
          instructions: '',
          when: '',
          route: 'oral',
        });
      }
    }
    setConsultation({ ...consultation, prescriptions: newPrescriptions });
    showToastMessage(`Applied ${medicines.length} medicines`);
  };

  const handleApplyStructuredMedicines = (meds: ExtractedMedicine[]) => {
    if (!consultation) return;
    const existing = consultation.prescriptions.map((p) => p.name.toLowerCase());
    const newPrescriptions = [...consultation.prescriptions];
    let count = 0;
    for (const med of meds) {
      if (!existing.includes(med.name.toLowerCase()) && med.name.length > 1) {
        newPrescriptions.push({
          id: generateId(),
          name: autoCorrect(med.name),
          dosage: med.dosage || '',
          strength: med.strength || '',
          frequency: med.frequency || '',
          duration: med.duration || '',
          instructions: med.instructions || '',
          when: med.when || '',
          route: (med.route as any) || 'oral',
        });
        existing.push(med.name.toLowerCase());
        count++;
      }
    }
    setConsultation({ ...consultation, prescriptions: newPrescriptions });
    showToastMessage(`Applied ${count} medicines`);
  };

  const handleApplyComplaints = (complaints: string[]) => {
    if (!consultation) return;
    const existing = consultation.chiefComplaint;
    const newText = complaints.join('; ');
    setConsultation({ ...consultation, chiefComplaint: existing ? `${existing}\n${newText}` : newText });
    showToastMessage('Complaints applied');
  };

  const saveConsultationDirectlyToStorage = useCallback((consult: EMRConsultation) => {
    try {
      const stored = JSON.parse(localStorage.getItem('emr_consultations') || '[]') as EMRConsultation[];
      const updated = { ...consult, updatedAt: new Date().toISOString() };
      const idx = stored.findIndex((c) => c.id === consult.id || c.patientId === consult.patientId);
      if (idx >= 0) {
        stored[idx] = updated;
      } else {
        stored.push(updated);
      }
      localStorage.setItem('emr_consultations', JSON.stringify(stored));
    } catch { /* ignore */ }
  }, []);

  const saveConsultationToStorage = useCallback((consult: EMRConsultation) => {
    saveConsultationDirectlyToStorage(consult);
    if (consult && patient) {
      saveConsultationToApi(consult, patient.id, clinicId || '').catch(() => {});
    }
  }, [patient, clinicId, saveConsultationDirectlyToStorage]);

  // Auto-save: debounced API save when consultation changes
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveVersion = useRef(0);

  useEffect(() => {
    if (!consultation || !patient) return;
    if (!(consultation.prescriptions.length > 0 || consultation.diagnoses.length > 0 || consultation.advice || consultation.chiefComplaint)) return;

    // Save to localStorage immediately
    saveConsultationDirectlyToStorage(consultation);

    // Debounce API save by 3 seconds
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    const version = ++autoSaveVersion.current;
    autoSaveTimer.current = setTimeout(() => {
      if (version === autoSaveVersion.current) {
        saveConsultationToApi(consultation, patient.id, clinicId || '').catch(() => {});
      }
    }, 3000);

    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [consultation, patient, clinicId, saveConsultationDirectlyToStorage]);

  const handleSave = async () => {
    if (!consultation || !patient) return;
    setIsSaving(true);
    saveConsultationDirectlyToStorage(consultation);
    await saveConsultationToApi(consultation, patient.id, clinicId || '').catch(() => {});
    await new Promise((r) => setTimeout(r, 300));
    setIsSaving(false);
    showToastMessage('Consultation saved successfully');
  };

  const handleEndConsultation = async () => {
    if (!consultation || !patient) return;
    setIsSaving(true);
    const completedConsult = { ...consultation, status: 'COMPLETED' as const };
    setConsultation(completedConsult);
    saveConsultationDirectlyToStorage(completedConsult);
    await saveConsultationToApi(completedConsult, patient.id, clinicId || '').catch(() => {});
    await new Promise((r) => setTimeout(r, 300));
    setIsSaving(false);
    showToastMessage('Consultation ended');
    setTimeout(() => router.push('/emr/consultation'), 800);
  };

  const generatePrescriptionText = () => {
    if (!consultation || !patient) return '';
    const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
    const date = new Date(consultationDate + 'T00:00:00').toLocaleDateString('en-IN');
    let rx = `*KIDNEY CARE CENTRE*\nDr. Rajesh Goel | MBBS, DNB (Nephrology)\nReg. No. DMC/R/00734\n\n`;
    rx += `Date: ${date}\n`;
    rx += `Patient: ${patient.firstName} ${patient.lastName} | ${age}Y | ${patient.gender}\n`;
    rx += `UHID: ${patient.uhid}\n`;
    if (patient.allergies?.length) rx += `Allergies: ${patient.allergies.join(', ')}\n`;
    rx += `\n---\n\n`;
    if (consultation.diagnoses.length) {
      rx += `DIAGNOSIS:\n`;
      consultation.diagnoses.forEach((d, i) => { rx += `${i + 1}. ${d.name}\n`; });
      rx += `\n`;
    }
    if (consultation.chiefComplaint) rx += `CHIEF COMPLAINT:\n${consultation.chiefComplaint}\n\n`;
    if (consultation.prescriptions.length) {
      rx += `Rx (Medicines):\n`;
      consultation.prescriptions.forEach((m, i) => {
        rx += `${i + 1}. ${m.name} ${m.dosage} - ${m.frequency} x ${m.duration}`;
        if (m.instructions) rx += ` (${m.instructions})`;
        rx += `\n`;
      });
      rx += `\n`;
    }
    if (consultation.advice) rx += `ADVICE:\n${consultation.advice}\n\n`;
    if (testRequests.length) {
      let byWhenLabel = '';
      if (testRequestByWhenType === 'ASAP') byWhenLabel = 'ASAP';
      else if (testRequestByWhenType === 'Today') byWhenLabel = 'Today';
      else if (testRequestByWhenType === 'Next Visit') byWhenLabel = 'Next Visit';
      else if (testRequestByWhenType === 'Days' || testRequestByWhenType === 'Weeks' || testRequestByWhenType === 'Months') byWhenLabel = `by ${testRequestByWhenValue} ${testRequestByWhenType}`;
      else if (testRequestByWhenType === 'Calendar' && testRequestByWhenDate) byWhenLabel = new Date(testRequestByWhenDate + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      rx += `TESTS ADVISED${byWhenLabel ? `: [${byWhenLabel}]` : ':'}\n${testRequests.join(' , ')}\n\n`;
    }
    rx += `---\nKidney Care Centre | +91 98182 35613`;
    return rx;
  };

  const handleWhatsAppPrescription = async () => {
    if (!patient?.phone || !consultation) {
      showToastMessage('No phone number available', 'error');
      return;
    }

    try {
      const printContainer = document.createElement('div');
      printContainer.style.position = 'fixed';
      printContainer.style.left = '-9999px';
      printContainer.style.top = '0';
      printContainer.style.width = '210mm';
      printContainer.style.background = 'white';
      document.body.appendChild(printContainer);

      const { default: PrescriptionPrint } = await import('@/components/emr/PrescriptionPrint');
      const { createRoot } = await import('react-dom/client');
      const root = createRoot(printContainer);

      await new Promise<void>((resolve) => {
        root.render(
          <PrescriptionPrint
            patient={patient}
            consultation={consultation}
            consultationDate={new Date(consultationDate + 'T00:00:00').toLocaleDateString('en-IN')}
            testRequests={testRequests}
            testRequestByWhen={(() => {
              if (testRequestByWhenType === 'ASAP') return '[ASAP]';
              if (testRequestByWhenType === 'Today') return '[Today]';
              if (testRequestByWhenType === 'Next Visit') return '[Next Visit]';
              if (testRequestByWhenType === 'Days' || testRequestByWhenType === 'Weeks' || testRequestByWhenType === 'Months') return `[by ${testRequestByWhenValue} ${testRequestByWhenType}]`;
              if (testRequestByWhenType === 'Calendar' && testRequestByWhenDate) return `[${new Date(testRequestByWhenDate + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}]`;
              return '';
            })()}
            labResults={patientLabResults}
            clinicId={clinicId ?? undefined}
          />
        );
        setTimeout(resolve, 600);
      });

      const images = printContainer.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise<void>((res) => {
              if (img.complete) res();
              else { img.onload = () => res(); img.onerror = () => res(); }
            })
        )
      );
      await new Promise((r) => setTimeout(r, 300));

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        root.unmount();
        document.body.removeChild(printContainer);
        showToastMessage('Pop-up blocked. Allow pop-ups for this site.', 'error');
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Prescription - ${patient.firstName} ${patient.lastName}</title>
          <style>
            @page { size: A4; margin: 5mm 8mm; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            html, body {
              width: 100%; margin: 0; padding: 0;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 10pt; line-height: 1.35;
              color: #000; background: #fff;
            }
            @media print {
              html, body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .rx-prescription-table { width: 100% !important; border-collapse: collapse; }
              .rx-prescription-table thead { display: table-header-group !important; }
              .rx-prescription-table tbody td { vertical-align: top !important; }
              .rx-footer {
                position: fixed !important; bottom: 0 !important;
                left: 0 !important; right: 0 !important;
                width: 100% !important; z-index: 1000 !important;
                background: #fff !important;
              }
              .rx-medicine-row { page-break-inside: avoid !important; }
              .rx-advice-block, .rx-tests-block, .rx-signature { page-break-inside: avoid !important; }
            }
          </style>
        </head>
        <body>
          ${printContainer.innerHTML}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();

      await new Promise<void>((resolve) => {
        const checkReady = setInterval(() => {
          try {
            if (printWindow.document.readyState === 'complete') {
              clearInterval(checkReady);
              setTimeout(resolve, 500);
            }
          } catch { clearInterval(checkReady); resolve(); }
        }, 100);
        setTimeout(() => { clearInterval(checkReady); resolve(); }, 3000);
      });

      printWindow.print();
      root.unmount();
      document.body.removeChild(printContainer);

      window.open(`https://wa.me/91${patient.phone}`, '_blank');
      showToastMessage('Print dialog opened. Save as PDF, then share on WhatsApp.');
    } catch (err) {
      console.error('PDF generation failed:', err);
      const text = generatePrescriptionText();
      window.open(`https://wa.me/91${patient.phone}?text=${encodeURIComponent(text)}`, '_blank');
      showToastMessage('PDF failed. Sent as text instead.');
    }
  };

  const handleEmailPrescription = () => {
    if (!patient?.email) {
      showToastMessage('No email address available', 'error');
      return;
    }
    const text = generatePrescriptionText().replace(/\*/g, '').replace(/━/g, '─');
    const subject = `Prescription - ${patient.firstName} ${patient.lastName} - ${new Date(consultationDate + 'T00:00:00').toLocaleDateString('en-IN')}`;
    const url = `mailto:${patient.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    showToastMessage('Opening email client...');
  };

  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(`section-${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const [testDuplicateWarning, setTestDuplicateWarning] = useState<string | null>(null);

  const addTestRequest = (test: string) => {
    if (testRequests.some((t) => t.toLowerCase() === test.toLowerCase())) {
      setTestDuplicateWarning(test);
      setTimeout(() => setTestDuplicateWarning(null), 3000);
      return;
    }
    setTestRequests([...testRequests, test]);
  };

  const removeTestRequest = (test: string) => {
    setTestRequests(testRequests.filter((t) => t !== test));
  };

  const loadAdviceTemplate = (tpl: AdviceTemplate) => {
    if (!consultation) return;
    setConsultation({ ...consultation, advice: tpl.advice || '' });
    setShowAdviceTemplates(false);
  };

  const saveAdviceTemplate = () => {
    if (!adviceTemplateName.trim() || !consultation?.advice.trim()) return;
    const tpl: AdviceTemplate = { id: 'adv_custom_' + Date.now(), name: adviceTemplateName, advice: consultation.advice, isCustom: true };
    adviceTemplateStorage.add(tpl);
    setCustomAdviceTemplates(adviceTemplateStorage.getAll());
    setShowSaveAdviceTemplate(false);
    setAdviceTemplateName('');
  };

  const deleteAdviceTemplate = (id: string) => {
    adviceTemplateStorage.remove(id);
    setCustomAdviceTemplates(adviceTemplateStorage.getAll());
  };

  const loadTestPanelTemplate = (tpl: TestPanelTemplate) => {
    setTestRequests((prev) => [...new Set([...prev, ...tpl.tests])]);
    setShowTestPanelTemplates(false);
  };

  const saveTestTemplate = () => {
    if (!testTemplateName.trim() || testRequests.length === 0) return;
    const tpl: TestPanelTemplate = { id: 'tp_custom_' + Date.now(), name: testTemplateName, tests: [...testRequests], isCustom: true };
    testTemplateStorage.add(tpl);
    setCustomTestPanelTemplates(testTemplateStorage.getAll());
    setShowSaveTestTemplate(false);
    setTestTemplateName('');
  };

  const deleteTestTemplate = (id: string) => {
    testTemplateStorage.remove(id);
    setCustomTestPanelTemplates(testTemplateStorage.getAll());
  };

  const allTestNames = useMemo(() => labTestGroups.flatMap((g) => g.tests), []);

  const testAliases = useMemo(() => [
    { alias: 'KFT', name: 'Kidney Function Test', tests: ['Blood Urea', 'Serum Creatinine', 'BUN', 'eGFR', 'Serum Sodium', 'Serum Potassium', 'Serum Uric Acid'] },
    { alias: 'RFT', name: 'Renal Function Test', tests: ['Blood Urea', 'Serum Creatinine', 'BUN', 'eGFR', 'Serum Sodium', 'Serum Potassium', 'Serum Uric Acid'] },
    { alias: 'LFT', name: 'Liver Function Test', tests: ['SGOT (AST)', 'SGPT (ALT)', 'Alkaline Phosphatase (ALP)', 'Total Bilirubin', 'Direct Bilirubin', 'GGT', 'Total Protein', 'Serum Albumin', 'Globulin'] },
    { alias: 'DM', name: 'Diabetes Panel', tests: ['Fasting Blood Sugar', 'Postprandial Blood Sugar', 'HbA1c'] },
    { alias: 'USG', name: 'Ultrasound Abdomen', tests: ['ULTRA SOUND WHOLE ABDOMEN PREVOID/POSTVOID WITH FULL BLADDER', 'Right Kidney Size', 'Left Kidney Size', 'Pre-Void Volume', 'Post-Void Residual Volume', 'Prostate Size', 'Urinary Bladder Assessment'] },
    { alias: 'USG ABD', name: 'Ultrasound Abdomen', tests: ['ULTRA SOUND WHOLE ABDOMEN PREVOID/POSTVOID WITH FULL BLADDER', 'Right Kidney Size', 'Left Kidney Size', 'Pre-Void Volume', 'Post-Void Residual Volume'] },
    { alias: 'USG KUB', name: 'Ultrasound KUB', tests: ['ULTRA SOUND WHOLE ABDOMEN PREVOID/POSTVOID WITH FULL BLADDER', 'Right Kidney Size', 'Left Kidney Size', 'Urinary Bladder Assessment'] },
    { alias: 'USG RENAL', name: 'Ultrasound Renal', tests: ['ULTRA SOUND WHOLE ABDOMEN PREVOID/POSTVOID WITH FULL BLADDER', 'Right Kidney Size', 'Left Kidney Size', 'Post-Void Residual Volume'] },
    { alias: 'ECHO', name: 'Echocardiography', tests: ['Echocardiography'] },
    { alias: 'PFT', name: 'Pulmonary Function Test', tests: ['Pulmonary Function Test'] },
    { alias: 'ECG', name: 'Electrocardiogram', tests: ['ECG'] },
    { alias: 'CXR', name: 'Chest X-Ray', tests: ['CHEST XRAY PA VIEW'] },
    { alias: 'TMT', name: 'Treadmill Test', tests: ['Treadmill Test'] },
    { alias: 'DOPPLER', name: 'Doppler Study', tests: ['Doppler Study (Renal)'] },
    { alias: 'ABG', name: 'Arterial Blood Gas', tests: ['Blood Gas (ABG)'] },
    { alias: 'IRON STUDY', name: 'Iron Studies', tests: ['Serum Iron', 'TIBC', 'Serum Ferritin', 'Transferrin Saturation'] },
    { alias: 'TFT', name: 'Thyroid Function Test', tests: ['TSH', 'Free T3', 'Free T4'] },
    { alias: 'LIPID', name: 'Lipid Profile', tests: ['Total Cholesterol', 'HDL Cholesterol', 'LDL Cholesterol', 'VLDL', 'Triglycerides', 'TC/HDL Ratio'] },
    { alias: 'ESR', name: 'Erythrocyte Sedimentation Rate', tests: ['Erythrocyte Sedimentation Rate (ESR)'] },
    { alias: 'CRP', name: 'C-Reactive Protein', tests: ['hs-CRP'] },
    { alias: 'DLC', name: 'Differential Leukocyte Count', tests: ['Differential Leukocyte Count'] },
    { alias: 'TLC', name: 'Total Leukocyte Count', tests: ['Total Leukocyte Count'] },
    { alias: 'PT', name: 'Prothrombin Time', tests: ['PT/INR'] },
    { alias: 'INR', name: 'International Normalized Ratio', tests: ['PT/INR'] },
    { alias: 'ACR', name: 'Albumin Creatinine Ratio', tests: ['Urine Albumin/Creatinine Ratio (ACR)'] },
    { alias: 'UPCR', name: 'Urine Protein Creatinine Ratio', tests: ['Urine Protein/Creatinine Ratio (UPCR)'] },
    { alias: 'GFR', name: 'Glomerular Filtration Rate', tests: ['eGFR'] },
    { alias: 'HEP', name: 'Hepatitis Panel', tests: ['HbsAg', 'Anti-HCV', 'Anti-HIV 1&2', 'Anti-HBs Antibody'] },
    { alias: 'AUTOIMMUNE', name: 'Autoimmune Panel', tests: ['ANA', 'P-ANCA', 'C-ANCA', 'Complement C3', 'Complement C4', 'Anti-dsDNA'] },
    { alias: 'VASCU', name: 'Vasculitis Panel', tests: ['P-ANCA (MPO)', 'C-ANCA (PR3)', 'ANCA Profile', 'ANA', 'Complement C3', 'Complement C4'] },
    { alias: 'ANA', name: 'Antinuclear Antibody', tests: ['ANA'] },
    { alias: 'ANCA', name: 'ANCA Profile', tests: ['P-ANCA (MPO)', 'C-ANCA (PR3)', 'ANCA Profile'] },
    { alias: 'VIT D', name: 'Vitamin D', tests: ['Vitamin D (25-OH)'] },
    { alias: 'VIT B12', name: 'Vitamin B12', tests: ['Vitamin B12'] },
    { alias: 'PTH', name: 'Parathyroid Hormone', tests: ['Intact PTH'] },
    { alias: 'DEXA', name: 'DEXA Scan', tests: ['DEXA Scan'] },
    { alias: 'BNP', name: 'Brain Natriuretic Peptide', tests: ['BNP', 'NT-proBNP'] },
    { alias: 'TROP', name: 'Cardiac Troponin', tests: ['Troponin I', 'Troponin T'] },
    { alias: 'HBA1C', name: 'Glycated Haemoglobin', tests: ['HbA1c'] },
    { alias: 'SPE', name: 'Serum Protein Electrophoresis', tests: ['Serum Protein Electrophoresis'] },
    { alias: 'COVID', name: 'COVID-19', tests: ['COVID-19 RT-PCR', 'COVID-19 Antibody'] },
    { alias: 'DENGUE', name: 'Dengue Panel', tests: ['Dengue NS1 Antigen', 'Dengue IgM', 'Dengue IgG'] },
    { alias: 'TB', name: 'Tuberculosis Workup', tests: ['TB PCR', 'GeneXpert', 'Quantiferon-TB Gold'] },
    { alias: 'MP', name: 'Malaria Parasite', tests: ['Malaria Parasite (MP)'] },
    { alias: 'WIDAL', name: 'Widal Test', tests: ['Widal Test'] },
    { alias: 'PSA', name: 'Prostate Specific Antigen', tests: ['PSA'] },
    { alias: 'AFP', name: 'Alpha Fetoprotein', tests: ['AFP'] },
    { alias: 'CEA', name: 'Carcinoembryonic Antigen', tests: ['CEA'] },
    { alias: 'CA125', name: 'Cancer Antigen 125', tests: ['CA-125'] },
    { alias: 'HORMONE', name: 'Hormone Panel', tests: ['TSH', 'Cortisol', 'Testosterone', 'Estradiol', 'LH', 'FSH', 'Prolactin'] },
    { alias: 'FERRITIN', name: 'Serum Ferritin', tests: ['Serum Ferritin'] },
    { alias: 'HOMOCYST', name: 'Homocysteine', tests: ['Homocysteine'] },
    { alias: 'HCV', name: 'Hepatitis C', tests: ['Anti-HCV', 'HCV RNA'] },
    { alias: 'HBV', name: 'Hepatitis B', tests: ['HbsAg', 'Anti-HBs Antibody', 'HBV DNA'] },
    { alias: 'HIV', name: 'HIV', tests: ['Anti-HIV 1&2', 'HIV Viral Load'] },
    { alias: 'CMV', name: 'Cytomegalovirus', tests: ['CMV IgM', 'CMV IgG', 'CMV PCR'] },
    { alias: 'EBV', name: 'Epstein-Barr Virus', tests: ['EBV VCA IgM', 'EBV VCA IgG'] },
    { alias: 'TORCH', name: 'TORCH Panel', tests: ['Toxoplasma IgM', 'Rubella IgM', 'Rubella IgG', 'CMV IgM', 'CMV IgG', 'Herpes Simplex IgM'] },
  ], []);

  const testSuggestedTests = useMemo(() => {
    if (!testGroupSearch.trim()) return [];
    const q = testGroupSearch.toLowerCase();
    const testSet = new Set(testRequests.map(t => t.toLowerCase()));
    const results: { name: string; group: string; isDuplicate: boolean; isGroup?: boolean; groupTests?: string[] }[] = [];
    const seen = new Set<string>();
    const addResult = (name: string, group: string, isDuplicate: boolean, isGroup = false, groupTests?: string[]) => {
      const key = name.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      results.push({ name, group, isDuplicate, isGroup, groupTests });
    };
    for (const a of testAliases) {
      if (a.alias.toLowerCase().includes(q)) {
        const allAdded = a.tests.every(t => testSet.has(t.toLowerCase())) || testSet.has(a.alias.toLowerCase());
        addResult(a.alias, `${a.tests.length} tests`, allAdded, true, a.tests);
      }
    }
    for (const g of labTestGroups) {
      if (g.name.toLowerCase().includes(q)) {
        const allAdded = g.tests.every(t => testSet.has(t.toLowerCase())) || testSet.has(g.name.toLowerCase());
        addResult(g.name, `${g.tests.length} tests`, allAdded, true, g.tests);
      }
    }
    for (const g of labTestGroups) {
      for (const t of g.tests) {
        if (t.toLowerCase().includes(q)) {
          addResult(t, g.name, testSet.has(t.toLowerCase()));
        }
      }
    }
    return results.slice(0, 12);
  }, [testGroupSearch, allTestNames, testRequests, testAliases]);

  const updateTestDropdownPos = () => {
    if (testInputRef.current) {
      const rect = testInputRef.current.getBoundingClientRect();
      setTestDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  };

  useEffect(() => {
    if (!testGroupSearch) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (testDropdownRef.current && testDropdownRef.current.contains(target)) return;
      if (testInputRef.current && testInputRef.current.contains(target)) return;
      setTestGroupSearch('');
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [testGroupSearch]);

  const patientLabResults = useMemo(() => {
    if (!patient) return [];
    const results: { testName: string; value: string; unit: string; date: string; isAbnormal: boolean }[] = [];
    labOrders
      .filter((lo) => lo.patientId === patient.id && lo.results)
      .forEach((lo) => {
        lo.results!.forEach((r) => {
          results.push({
            testName: r.testName,
            value: r.value,
            unit: r.unit,
            date: formatDate(lo.date),
            isAbnormal: r.isAbnormal,
          });
        });
      });
    return results;
  }, [patient]);

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
          <Stethoscope className="h-10 w-10 text-slate-300 animate-pulse" />
          <p className="text-slate-600 font-medium">Loading consultation...</p>
        </div>
      </div>
    );
  }

  if (!consultation || !patient) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
          <Stethoscope className="h-10 w-10 text-slate-300" />
          <p className="text-slate-600 font-medium">No consultation found</p>
          <p className="text-slate-400 text-sm">There are no consultations available for this clinic. Go to the consultation list to start a new consultation.</p>
          <button onClick={() => router.push('/emr/consultation')} className="mt-2 px-4 py-2 bg-[#0A75BB] text-white text-sm rounded-lg hover:bg-[#085D94] transition-colors">
            Go to Consultations
          </button>
        </div>
      </div>
    );
  }

  const age = calculateAge(new Date(patient.dateOfBirth));

  const ageYears = Math.floor(age);
  const ageMonths = Math.floor((age - ageYears) * 12);

  return (
    <RequirePermission permission="consultation">
    <ErrorBoundary>
      <div className="flex flex-col lg:flex-row bg-slate-100" style={{ height: 'calc(100vh - 3.5rem)' }}>
        {showToast && (
          <div
            className={cn(
              'fixed top-18 right-4 z-[100] px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-5',
              showToast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            )}
          >
            {showToast.message}
          </div>
        )}

        <ConsultSidebar activeSection={activeSection} onSectionClick={scrollToSection} />

        <div className="flex-1 flex flex-col min-h-0">
          <PatientHeaderBar
            firstName={patient.firstName}
            lastName={patient.lastName}
            age={`${ageYears}Y ${ageMonths}M`}
            gender={patient.gender}
            uhid={patient.uhid}
            phone={patient.phone}
            allergies={patient.allergies}
            patientId={patient.id}
          />

          <div className="flex-1 overflow-y-auto pb-20">
            <div className="max-w-5xl mx-auto p-4 space-y-4">
              <ErrorBoundary>
                <ReportUploadOCR
                  onApplyLabValues={handleApplyLabValues}
                  onApplyVitals={handleApplyVitals}
                  onApplyDiagnoses={handleApplyDiagnoses}
                  onApplyMedicines={handleApplyMedicines}
                  onApplyStructuredMedicines={handleApplyStructuredMedicines}
                  onApplyComplaints={handleApplyComplaints}
                />
              </ErrorBoundary>

              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-600">Prescription Date:</span>
                <input
                  type="date"
                  value={consultationDate}
                  max={today}
                  onChange={(e) => setConsultationDate(e.target.value)}
                  className="text-sm font-semibold text-[#0A75BB] border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30 cursor-pointer"
                />
                {consultationDate !== today && (
                  <button
                    onClick={() => setConsultationDate(today)}
                    className="text-xs text-slate-500 hover:text-slate-700 underline"
                  >
                    Today
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">2nd Visit</span>
                  <button
                    onClick={() => scrollToSection('past-history')}
                    className="text-xs text-[#0A75BB] hover:underline font-medium"
                  >
                    View Past
                  </button>
                  <button
                    onClick={() => {
                      if (!patient || !consultation) return;
                      try {
                        const stored = JSON.parse(localStorage.getItem('emr_consultations') || '[]') as EMRConsultation[];
                        const lastRx = stored
                          .filter((c) => c.patientId === patient.id && c.id !== consultation.id && c.prescriptions.length > 0)
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                        if (lastRx) {
                          setConsultation({
                            ...consultation,
                            prescriptions: lastRx.prescriptions,
                            diagnoses: lastRx.diagnoses,
                            advice: lastRx.advice,
                            chiefComplaint: consultation.chiefComplaint || lastRx.chiefComplaint,
                            investigations: lastRx.investigations,
                          });
                          showToastMessage(`Loaded ${lastRx.prescriptions.length} medicines from ${new Date(lastRx.date).toLocaleDateString('en-IN')}`);
                        } else {
                          showToastMessage('No previous prescriptions found', 'error');
                        }
                      } catch { showToastMessage('Failed to load previous Rx', 'error'); }
                    }}
                    className="px-3 py-1.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 rounded hover:bg-emerald-100 transition-colors border border-emerald-200"
                  >
                    Load Last Rx
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const stored = adviceTemplateStorage.getAll();
                      if (stored.length > 0) {
                        if (consultation) {
                          setConsultation({ ...consultation, advice: stored[0].advice });
                        }
                        showToastMessage('Loaded advice template: ' + stored[0].name);
                      } else {
                        showToastMessage('No templates saved yet', 'error');
                      }
                    }}
                    className="px-3 py-1.5 text-[11px] font-medium text-slate-600 bg-slate-100 rounded hover:bg-slate-200 transition-colors"
                  >
                    Load Template
                  </button>
                  <button
                    onClick={() => {
                      const name = prompt('Template name:');
                      if (name && consultation) {
                        adviceTemplateStorage.add({ id: Date.now().toString(), name, advice: consultation.advice });
                        showToastMessage('Template saved: ' + name);
                      }
                    }}
                    className="px-3 py-1.5 text-[11px] font-medium text-[#0A75BB] bg-[#0A75BB]/10 rounded hover:bg-[#0A75BB]/20 transition-colors"
                  >
                    Save as Template
                  </button>
                  <button
                    onClick={() => {
                      setConsultation({
                        ...consultation,
                        chiefComplaint: '',
                        hpi: '',
                        examination: '',
                        diagnoses: [],
                        prescriptions: [],
                        investigations: [],
                        advice: '',
                        notes: '',
                      });
                    }}
                    className="px-3 py-1.5 text-[11px] font-medium text-red-500 bg-red-50 rounded hover:bg-red-100 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <ErrorBoundary>
                <div id="section-vitals">
                  <VitalsSection vitals={consultation.vitals} onChange={updateVitals} patientAge={ageYears} patientGender={patient.gender} />
                </div>
              </ErrorBoundary>

              <ErrorBoundary>
                <div id="section-history">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-slate-700">History</h3>
                    {!showHistorySection && (
                      <button
                        onClick={() => setShowHistorySection(true)}
                        className="flex items-center gap-1 text-xs font-medium text-[#0A75BB] hover:text-[#085a94] transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add
                      </button>
                    )}
                  </div>
                  {showHistorySection && (
                    <TextSection
                      label=""
                      value={historyText}
                      onChange={setHistoryText}
                      onBlur={() => setHistoryText(autoCorrect(historyText))}
                      placeholder="Enter patient history..."
                      rows={3}
                    />
                  )}
                </div>
              </ErrorBoundary>

              <ErrorBoundary>
                <div id="section-past-history">
                    <TextSection
                      label="Past History"
                      value={consultation.notes}
                      onChange={(value) => updateField('notes', value)}
                      onBlur={() => autoCorrectField('notes')}
                      placeholder="Enter past medical history, surgeries, chronic conditions..."
                      rows={4}
                    />
                </div>
              </ErrorBoundary>

              <ErrorBoundary>
                <div id="section-complaints">
                    <TextSection
                      label="Complaints"
                      value={consultation.chiefComplaint}
                      onChange={(value) => updateField('chiefComplaint', value)}
                      onBlur={() => autoCorrectField('chiefComplaint')}
                      placeholder="Enter patient complaints..."
                      rows={4}
                    />
                    <div className="mt-2">
                      <TemplateSelector
                        type="complaints"
                        onSelect={(items) => {
                          const names = items.map((i: any) => i.name);
                          handleApplyComplaints(names);
                        }}
                        clinicId={clinicId ?? undefined}
                      />
                    </div>
                </div>
              </ErrorBoundary>

              <ErrorBoundary>
                <div id="section-investigations">
                  <InvestigationsTable pastResults={patientLabResults} consultationInvestigations={consultation?.investigations || []} />
                  <div className="mt-2">
                    <TemplateSelector
                      type="investigations"
                      onSelect={(items) => {
                        if (!consultation) return;
                        const existingTests = consultation.investigations.map((inv) => inv.testName);
                        const newInvestigations = [...consultation.investigations];
                        for (const item of items) {
                          const testName = item.test_name || item.name || '';
                          if (testName && !existingTests.includes(testName)) {
                            newInvestigations.push({
                              id: generateId(),
                              testName,
                              result: '',
                              unit: '',
                              normalRange: '',
                              isAbnormal: false,
                              status: 'pending' as const,
                              date: new Date().toISOString(),
                            });
                            existingTests.push(testName);
                          }
                        }
                        if (newInvestigations.length > consultation.investigations.length) {
                          setConsultation({ ...consultation, investigations: newInvestigations });
                          showToastMessage(`Added ${newInvestigations.length - consultation.investigations.length} test(s) to Investigations`);
                        }
                      }}
                      clinicId={clinicId ?? undefined}
                    />
                  </div>
                </div>
              </ErrorBoundary>

              <ErrorBoundary>
                <div id="section-diagnosis">
                  <DiagnosisTable
                    diagnoses={consultation.diagnoses}
                    onChange={(diagnoses) => setConsultation({ ...consultation, diagnoses })}
                  />
                  <div className="mt-2">
                    <TemplateSelector
                      type="diagnoses"
                      onSelect={(items) => {
                        const names = items.map((i: any) => i.name);
                        handleApplyDiagnoses(names);
                      }}
                      clinicId={clinicId ?? undefined}
                    />
                  </div>
                </div>
              </ErrorBoundary>

              <ErrorBoundary>
                <div id="section-medicine">
                  <MedicineTable
                    prescriptions={consultation.prescriptions}
                    onChange={(prescriptions) => setConsultation({ ...consultation, prescriptions })}
                    onLoadTemplate={(data) => {
                      setConsultation({ ...consultation, prescriptions: data.medications, advice: data.advice || consultation.advice });
                      if (data.testsPrescribed && data.testsPrescribed.length > 0) {
                        setTestRequests((prev) => [...new Set([...prev, ...data.testsPrescribed])]);
                      }
                    }}
                    diagnoses={consultation.diagnoses.map(d => d.name)}
                  />
                  <div className="mt-2">
                    <TemplateSelector
                      type="medicines"
                      onSelect={(items) => {
                        const existing = consultation.prescriptions.map((p) => p.name.toLowerCase());
                        const newPrescriptions = [...consultation.prescriptions];
                        let count = 0;
                        for (const item of items) {
                          const name = (item.medicine_name || item.name || '').trim();
                          if (name && !existing.includes(name.toLowerCase())) {
                            newPrescriptions.push({
                              id: generateId(),
                              name,
                              dosage: item.dosage || '',
                              strength: item.strength || '',
                              frequency: item.frequency || '',
                              duration: item.duration || '',
                              instructions: item.instructions || '',
                              when: item.timing || '',
                              route: (item.route as any) || 'oral',
                            });
                            existing.push(name.toLowerCase());
                            count++;
                          }
                        }
                        setConsultation({ ...consultation, prescriptions: newPrescriptions });
                        if (count > 0) showToastMessage(`Added ${count} medicine(s) from template`);
                      }}
                      clinicId={clinicId ?? undefined}
                    />
                  </div>
                </div>
              </ErrorBoundary>

              <ErrorBoundary>
                <div id="section-advice">
                  <div className="bg-white border border-slate-200 rounded-lg">
                    <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-700">Advice</h3>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setShowAdviceTemplates(true)}
                          className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-[#0A75BB] hover:bg-slate-100 rounded transition-colors">
                          Load Template
                        </button>
                        {consultation.advice.trim() && (
                          <button onClick={() => setShowSaveAdviceTemplate(true)}
                            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[#0A75BB] hover:bg-blue-50 rounded transition-colors">
                            Save as Template
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="p-3">
                      <textarea
                        value={consultation.advice}
                        onChange={(e) => updateField('advice', e.target.value)}
                        onBlur={() => autoCorrectField('advice')}
                        placeholder="Patient instructions, diet, lifestyle advice..."
                        rows={4}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30 resize-none"
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <TemplateSelector
                      type="advice"
                      onSelect={(items) => {
                        const existing = consultation.advice;
                        const newAdvice = items.map((i: any) => i.advice_text || i.name || '').filter(Boolean).join('\n');
                        if (newAdvice) {
                          setConsultation({ ...consultation, advice: existing ? `${existing}\n${newAdvice}` : newAdvice });
                          showToastMessage('Advice template applied');
                        }
                      }}
                      clinicId={clinicId ?? undefined}
                    />
                  </div>
                </div>
              </ErrorBoundary>

              <ErrorBoundary>
                <div id="section-tests-requested">
                  <div className="bg-white border border-slate-200 rounded-lg">
                    <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-700">Tests Advised</h3>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setShowTestPanelTemplates(true)}
                          className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-[#0A75BB] hover:bg-slate-100 rounded transition-colors"
                        >
                          Load Template
                        </button>
                        {testRequests.length > 0 && (
                          <button
                            onClick={() => setShowSaveTestTemplate(true)}
                            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[#0A75BB] hover:bg-blue-50 rounded transition-colors"
                          >
                            Save as Template
                          </button>
                        )}
                        <button
                          onClick={() => setShowTestTemplates(true)}
                          className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-[#0A75BB] hover:bg-slate-100 rounded transition-colors"
                        >
                          Quick Panel
                        </button>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap gap-2 flex-1">
                          {testRequests.map((test) => (
                            <span
                              key={test}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full"
                            >
                              {test}
                              <button
                                onClick={() => removeTestRequest(test)}
                                className="text-slate-400 hover:text-red-500 transition-colors"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">By When:</span>
                          <select
                            value={testRequestByWhenType}
                            onChange={(e) => {
                              const t = e.target.value as typeof testRequestByWhenType;
                              setTestRequestByWhenType(t);
                              if (t === 'None') setTestRequestByWhen('');
                              else if (t === 'Today') setTestRequestByWhen(new Date().toISOString().split('T')[0]);
                              else if (t === 'Next Visit') setTestRequestByWhen(nextVisitDate || computeByWhenDate(nextVisitValue, nextVisitUnit));
                              else if (t === 'ASAP') setTestRequestByWhen('ASAP');
                              else if (t === 'Days' || t === 'Weeks' || t === 'Months') {
                                setTestRequestByWhenUnit(t);
                                setTestRequestByWhen(computeByWhenDate(testRequestByWhenValue, t));
                              }
                              else if (t === 'Calendar') setTestRequestByWhen(testRequestByWhenDate || '');
                            }}
                            className="px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#0A75BB] bg-white pr-6"
                          >
                            <option value="None">None</option>
                            <option value="Today">Today</option>
                            <option value="Next Visit">Next Visit</option>
                            <option value="ASAP">ASAP</option>
                            <option value="Days">Days</option>
                            <option value="Weeks">Weeks</option>
                            <option value="Months">Months</option>
                            <option value="Calendar">Calendar</option>
                          </select>
                        </div>
                      </div>

                      {(testRequestByWhenType === 'Days' || testRequestByWhenType === 'Weeks' || testRequestByWhenType === 'Months') && (
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="number"
                            min={1}
                            max={99}
                            value={testRequestByWhenValue}
                            onChange={(e) => {
                              const v = Math.max(1, parseInt(e.target.value) || 1);
                              setTestRequestByWhenValue(v);
                              setTestRequestByWhen(computeByWhenDate(v, testRequestByWhenType));
                            }}
                            className="w-14 px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#0A75BB] text-center"
                          />
                          <span className="text-xs text-slate-500">{testRequestByWhenType}</span>
                          <span className="text-[10px] text-slate-400">[{testRequestByWhenValue} {testRequestByWhenType}]</span>
                        </div>
                      )}
                      {testRequestByWhenType === 'Calendar' && (
                        <div className="mt-2">
                          <input
                            type="date"
                            value={testRequestByWhenDate}
                            onChange={(e) => {
                              setTestRequestByWhenDate(e.target.value);
                              setTestRequestByWhen(e.target.value);
                            }}
                            className="px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#0A75BB]"
                          />
                          {testRequestByWhenDate && (
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {new Date(testRequestByWhenDate + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} ({new Date(testRequestByWhenDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long' })})
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <div className="relative">
                          <Search className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 absolute left-2 top-1/2 -translate-y-1/2" />
                          <input
                          ref={testInputRef}
                          type="text"
                          value={testGroupSearch}
                          onChange={(e) => {
                            setTestGroupSearch(e.target.value);
                            setTestSelectedIdx(-1);
                            updateTestDropdownPos();
                          }}
                          onFocus={() => {
                            if (testGroupSearch) updateTestDropdownPos();
                          }}
                          onKeyDown={(e) => {
                            if (testSuggestedTests.length > 0) {
                              if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                setTestSelectedIdx((p) => (p < testSuggestedTests.length - 1 ? p + 1 : 0));
                                return;
                              }
                              if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                setTestSelectedIdx((p) => (p > 0 ? p - 1 : testSuggestedTests.length - 1));
                                return;
                              }
                            }
                            if (e.key === 'Enter' && testGroupSearch.trim()) {
                              e.preventDefault();
                              if (testSelectedIdx >= 0 && testSelectedIdx < testSuggestedTests.length) {
                                const sel = testSuggestedTests[testSelectedIdx];
                                if (!sel.isDuplicate) addTestRequest(sel.name);
                              } else if (testSuggestedTests.length > 0) {
                                const first = testSuggestedTests[0];
                                if (!first.isDuplicate) addTestRequest(first.name);
                              } else {
                                addTestRequest(testGroupSearch.trim().toUpperCase());
                              }
                              setTestGroupSearch('');
                              setTestSelectedIdx(-1);
                            }
                            if (e.key === 'Escape') {
                              setTestGroupSearch('');
                              setTestSelectedIdx(-1);
                            }
                          }}
                          placeholder="Type to add test..."
                          className="flex-1 px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0A75BB] pl-7"
                        />
                        </div>
                      </div>

                      {testGroupSearch && testSuggestedTests.length > 0 && (
                        <div ref={testDropdownRef} className="fixed z-[200] bg-white border border-slate-200 rounded-lg shadow-xl max-h-64 overflow-y-auto mt-1" style={{ top: testDropdownPos.top, left: testDropdownPos.left, width: Math.max(testDropdownPos.width, 300) }}>
                          {testSuggestedTests.map((s, i) => (
                            <button
                              key={s.name + (s.isGroup ? '_grp' : '')}
                              onClick={() => {
                                if (s.isDuplicate) return;
                                addTestRequest(s.name);
                                setTestGroupSearch('');
                                setTestSelectedIdx(-1);
                              }}
                              className={cn(
                                'w-full text-left px-3 py-2 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0',
                                i === testSelectedIdx ? 'bg-[#0A75BB]/10' : 'hover:bg-slate-50',
                                s.isDuplicate && 'opacity-50'
                              )}
                            >
                              <div className={cn(
                                'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
                                s.isGroup ? 'bg-emerald-100' : 'bg-[#0A75BB]/10'
                              )}>
                                <span className={cn('text-[9px] font-bold', s.isGroup ? 'text-emerald-600' : 'text-[#0A75BB]')}>{s.name.charAt(0)}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[12px] font-semibold text-slate-800 uppercase leading-tight">{s.name}</span>
                                  {s.isGroup && (
                                    <span className="px-1.5 py-0.5 text-[8px] font-bold text-emerald-700 bg-emerald-100 rounded-full">PANEL</span>
                                  )}
                                  {s.isDuplicate && (
                                    <span className="px-1.5 py-0.5 text-[8px] font-bold text-amber-700 bg-amber-100 rounded-full">ADDED</span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400">{s.group}</span>
                              </div>
                              {!s.isDuplicate && <Plus className="h-3.5 w-3.5 text-slate-300 shrink-0" />}
                            </button>
                          ))}
                          {testGroupSearch.trim() && !testSuggestedTests.some(t => t.name.toLowerCase() === testGroupSearch.trim().toLowerCase() && !t.isGroup) && (
                            <button
                              onClick={() => {
                                addTestRequest(testGroupSearch.trim().toUpperCase());
                                setTestGroupSearch('');
                                setTestSelectedIdx(-1);
                              }}
                              className="w-full text-left px-3 py-2.5 flex items-center gap-3 bg-[#0A75BB]/5 hover:bg-[#0A75BB]/10 border-t border-[#0A75BB]/20 transition-colors"
                            >
                              <div className="w-6 h-6 rounded-full bg-[#0A75BB]/15 flex items-center justify-center shrink-0">
                                <Plus className="h-3.5 w-3.5 text-[#0A75BB]" />
                              </div>
                              <div>
                                <span className="text-[12px] font-medium text-[#0A75BB]">Add &quot;{testGroupSearch.trim().toUpperCase()}&quot;</span>
                                <div className="text-[10px] text-slate-400">Custom test</div>
                              </div>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ErrorBoundary>

              <ErrorBoundary>
                <div id="section-next-visit">
                  <div className="bg-white border border-slate-200 rounded-lg">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <h3 className="text-sm font-semibold text-slate-700">Next Visit</h3>
                    </div>
                    <div className="p-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-slate-500">No of</span>
                        <input
                          type="number"
                          min={0}
                          max={99}
                          value={nextVisitValue}
                          onChange={(e) => {
                            const v = Math.max(0, parseInt(e.target.value) || 0);
                            setNextVisitValue(v);
                            if (v > 0 && nextVisitUnit && !nextVisitDate) {
                              setConsultation((prev) => prev ? { ...prev, followUpDate: computeByWhenDate(v, nextVisitUnit) } : prev);
                            } else if (v > 0 && nextVisitDate) {
                              setConsultation((prev) => prev ? { ...prev, followUpDate: nextVisitDate } : prev);
                            } else {
                              setConsultation((prev) => prev ? { ...prev, followUpDate: '' } : prev);
                            }
                          }}
                          className="w-14 px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#0A75BB] text-center"
                          placeholder="No of"
                        />
                        <div className="flex items-center border border-slate-200 rounded overflow-hidden">
                          {(['Days', 'Weeks', 'Months'] as const).map((unit) => (
                            <button
                              key={unit}
                              onClick={() => {
                                setNextVisitUnit(unit);
                                if (nextVisitValue > 0 && !nextVisitDate) {
                                  setConsultation((prev) => prev ? { ...prev, followUpDate: computeByWhenDate(nextVisitValue, unit) } : prev);
                                }
                              }}
                              className={`px-2 py-1 text-[11px] font-medium transition-colors ${
                                nextVisitUnit === unit
                                  ? 'bg-[#0A75BB] text-white'
                                  : 'bg-white text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {unit}
                            </button>
                          ))}
                        </div>
                        <span className="text-xs text-slate-400">Or</span>
                        <div>
                          <input
                            type="date"
                            value={nextVisitDate}
                            onChange={(e) => {
                              setNextVisitDate(e.target.value);
                              setConsultation((prev) => prev ? { ...prev, followUpDate: e.target.value } : prev);
                            }}
                            className="px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#0A75BB]"
                          />
                          {nextVisitDate && (
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {new Date(nextVisitDate + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} ({new Date(nextVisitDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long' })})
                            </div>
                          )}
                        </div>
                      </div>
                      {(nextVisitValue > 0 || nextVisitDate) && (
                        <div className="mt-1.5 text-[10px] text-slate-400">
                          Follow-up: {consultation?.followUpDate ? new Date(consultation.followUpDate + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ErrorBoundary>

              {showTestTemplates && (
                <div className="fixed inset-0 z-[150] flex items-start justify-center bg-black/50 pt-[10vh]" onClick={() => { setShowTestTemplates(false); setTestTemplateSearch(''); }}>
                  <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[75vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                    <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-800">Insert Template</h3>
                      <button onClick={() => { setShowTestTemplates(false); setTestTemplateSearch(''); }} className="p-1 text-slate-400 hover:text-slate-600 rounded">
                        <span className="text-lg leading-none">&times;</span>
                      </button>
                    </div>
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={testTemplateSearch}
                          onChange={(e) => setTestTemplateSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0A75BB]"
                          placeholder="Search templates..."
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {testTemplates
                        .filter((t) => !testTemplateSearch || t.name.toLowerCase().includes(testTemplateSearch.toLowerCase()) || t.description.toLowerCase().includes(testTemplateSearch.toLowerCase()))
                        .map((template) => (
                          <button
                            key={template.name}
                            onClick={() => {
                              setTestRequests((prev) => [...new Set([...prev, ...template.tests])]);
                              setShowTestTemplates(false);
                              setTestTemplateSearch('');
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 transition-colors"
                          >
                            <div className="text-[13px] font-semibold text-slate-800">{template.name}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{template.description}</div>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {showAdviceTemplates && (
                <div className="fixed inset-0 z-[150] flex items-start justify-center bg-black/50 pt-[10vh]" onClick={() => { setShowAdviceTemplates(false); setAdviceTemplateSearch(''); }}>
                  <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[75vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                    <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-800">Load Advice Template</h3>
                      <button onClick={() => { setShowAdviceTemplates(false); setAdviceTemplateSearch(''); }} className="p-1 text-slate-400 hover:text-slate-600 rounded"><span className="text-lg leading-none">&times;</span></button>
                    </div>
                    <div className="px-4 py-2 border-b border-slate-100">
                      <input type="text" value={adviceTemplateSearch} onChange={(e) => setAdviceTemplateSearch(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0A75BB]" placeholder="Search templates..." autoFocus />
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {customAdviceTemplates.length > 0 && (
                        <>
                          <div className="px-4 py-1.5 bg-blue-50/50"><p className="text-[10px] font-semibold text-blue-500 uppercase">My Templates</p></div>
                          {customAdviceTemplates.filter((t) => !adviceTemplateSearch || t.name.toLowerCase().includes(adviceTemplateSearch.toLowerCase())).map((tpl) => (
                            <div key={tpl.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 group">
                              <button onClick={() => loadAdviceTemplate(tpl)} className="flex-1 text-left">
                                <div className="text-[13px] font-semibold text-slate-800">{tpl.name}</div>
                                <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{tpl.advice}</div>
                              </button>
                              <button onClick={() => deleteAdviceTemplate(tpl.id)} className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 ml-2 shrink-0"><Trash2 className="h-3 w-3" /></button>
                            </div>
                          ))}
                        </>
                      )}
                      <div className="px-4 py-1.5 bg-gray-50/50"><p className="text-[10px] font-semibold text-gray-400 uppercase">Built-in Templates</p></div>
                      {builtInAdviceTemplates.filter((t) => !adviceTemplateSearch || t.name.toLowerCase().includes(adviceTemplateSearch.toLowerCase())).map((tpl) => (
                        <button key={tpl.id} onClick={() => loadAdviceTemplate(tpl)} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 transition-colors">
                          <div className="text-[13px] font-semibold text-slate-800">{tpl.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{tpl.advice}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {showSaveAdviceTemplate && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50" onClick={() => setShowSaveAdviceTemplate(false)}>
                  <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
                    <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                      <h3 className="font-semibold text-slate-800">Save Advice Template</h3>
                      <button onClick={() => setShowSaveAdviceTemplate(false)} className="p-1 hover:bg-slate-100 rounded"><X className="h-4 w-4 text-slate-500" /></button>
                    </div>
                    <div className="p-4">
                      <input type="text" value={adviceTemplateName} onChange={(e) => setAdviceTemplateName(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A75BB] mb-3"
                        placeholder="Template name (e.g., CKD Dialysis)" autoFocus />
                      <button onClick={saveAdviceTemplate} disabled={!adviceTemplateName.trim()}
                        className="w-full px-3 py-2 text-xs font-medium text-white bg-[#0A75BB] rounded-lg hover:bg-[#085a94] transition-colors disabled:opacity-50">Save Template</button>
                    </div>
                  </div>
                </div>
              )}

              {showTestPanelTemplates && (
                <div className="fixed inset-0 z-[150] flex items-start justify-center bg-black/50 pt-[10vh]" onClick={() => { setShowTestPanelTemplates(false); setTestPanelSearch(''); }}>
                  <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[75vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                    <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-800">Load Test Panel Template</h3>
                      <button onClick={() => { setShowTestPanelTemplates(false); setTestPanelSearch(''); }} className="p-1 text-slate-400 hover:text-slate-600 rounded"><span className="text-lg leading-none">&times;</span></button>
                    </div>
                    <div className="px-4 py-2 border-b border-slate-100">
                      <input type="text" value={testPanelSearch} onChange={(e) => setTestPanelSearch(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0A75BB]" placeholder="Search templates..." autoFocus />
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {customTestPanelTemplates.length > 0 && (
                        <>
                          <div className="px-4 py-1.5 bg-blue-50/50"><p className="text-[10px] font-semibold text-blue-500 uppercase">My Templates</p></div>
                          {customTestPanelTemplates.filter((t) => !testPanelSearch || t.name.toLowerCase().includes(testPanelSearch.toLowerCase())).map((tpl) => (
                            <div key={tpl.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 group">
                              <button onClick={() => loadTestPanelTemplate(tpl)} className="flex-1 text-left">
                                <div className="text-[13px] font-semibold text-slate-800">{tpl.name}</div>
                                <div className="text-[11px] text-slate-500 mt-0.5">{tpl.tests.length} tests: {tpl.tests.slice(0, 3).join(', ')}{tpl.tests.length > 3 ? '...' : ''}</div>
                              </button>
                              <button onClick={() => deleteTestTemplate(tpl.id)} className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 ml-2 shrink-0"><Trash2 className="h-3 w-3" /></button>
                            </div>
                          ))}
                        </>
                      )}
                      <div className="px-4 py-1.5 bg-gray-50/50"><p className="text-[10px] font-semibold text-gray-400 uppercase">Built-in Templates</p></div>
                      {builtInTestPanelTemplates.filter((t) => !testPanelSearch || t.name.toLowerCase().includes(testPanelSearch.toLowerCase())).map((tpl) => (
                        <button key={tpl.id} onClick={() => loadTestPanelTemplate(tpl)} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 transition-colors">
                          <div className="text-[13px] font-semibold text-slate-800">{tpl.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{tpl.tests.length} tests: {tpl.tests.slice(0, 3).join(', ')}{tpl.tests.length > 3 ? '...' : ''}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {showSaveTestTemplate && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50" onClick={() => setShowSaveTestTemplate(false)}>
                  <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
                    <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                      <h3 className="font-semibold text-slate-800">Save Test Template</h3>
                      <button onClick={() => setShowSaveTestTemplate(false)} className="p-1 hover:bg-slate-100 rounded"><X className="h-4 w-4 text-slate-500" /></button>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-slate-500 mb-2">Save {testRequests.length} tests as a reusable template</p>
                      <input type="text" value={testTemplateName} onChange={(e) => setTestTemplateName(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A75BB] mb-3"
                        placeholder="Template name (e.g., CKD Routine)" autoFocus />
                      <button onClick={saveTestTemplate} disabled={!testTemplateName.trim()}
                        className="w-full px-3 py-2 text-xs font-medium text-white bg-[#0A75BB] rounded-lg hover:bg-[#085a94] transition-colors disabled:opacity-50">Save Template</button>
                    </div>
                  </div>
                </div>
              )}

              <ErrorBoundary>
                <div id="section-timeline">
                  {(() => {
                    let storedConsults: EMRConsultation[] = [];
                    try { storedConsults = JSON.parse(localStorage.getItem('emr_consultations') || '[]'); } catch { /* */ }
                    const patientStored = storedConsults.filter((c) => c.patientId === patient.id);
                    const mergedConsults = [...patientStored, ...consultations.filter((c) => c.patientId === patient.id && !patientStored.some((sc) => sc.id === c.id))];
                    return (
                      <PastVisitsTimeline
                        currentConsultationId={consultation.id}
                        consultations={mergedConsults}
                      />
                    );
                  })()}
                </div>
              </ErrorBoundary>
            </div>
          </div>

          <BottomActionBar
            onSave={handleSave}
            onEndConsultation={handleEndConsultation}
            onPrint={() => setShowPrintPreview(true)}
            onWhatsApp={handleWhatsAppPrescription}
            isSaving={isSaving}
          />
        </div>

        <PrintPreviewModal
          isOpen={showPrintPreview}
          onClose={() => setShowPrintPreview(false)}
          patient={patient}
          consultation={consultation}
          consultationDate={new Date(consultationDate + 'T00:00:00').toLocaleDateString('en-IN')}
          testRequests={testRequests}
          testRequestByWhen={(() => {
              if (testRequestByWhenType === 'ASAP') return '[ASAP]';
              if (testRequestByWhenType === 'Today') return '[Today]';
              if (testRequestByWhenType === 'Next Visit') return '[Next Visit]';
              if (testRequestByWhenType === 'Days' || testRequestByWhenType === 'Weeks' || testRequestByWhenType === 'Months') return `[by ${testRequestByWhenValue} ${testRequestByWhenType}]`;
              if (testRequestByWhenType === 'Calendar' && testRequestByWhenDate) return `[${new Date(testRequestByWhenDate + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}]`;
              return '';
            })()}
          labResults={patientLabResults}
            onWhatsApp={handleWhatsAppPrescription}
          clinicId={clinicId ?? undefined}
        />

        {testDuplicateWarning && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg shadow-lg flex items-center gap-2">
            <span className="text-sm font-medium text-amber-800">&quot;{testDuplicateWarning}&quot; already added</span>
            <button onClick={() => setTestDuplicateWarning(null)} className="p-0.5 hover:bg-amber-100 rounded text-amber-500">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </ErrorBoundary>
    </RequirePermission>
  );
}