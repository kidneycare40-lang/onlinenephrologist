'use client';

export interface ConsultationSection {
  id: string;
  label: string;
  icon: string;
  enabled: boolean;
  order: number;
  isLink?: boolean;
  href?: string;
}

export interface ConsultationSettings {
  sections: ConsultationSection[];
  showPatientInfo: boolean;
  showPrescriptionPreview: boolean;
  defaultVitals: {
    height: string;
    weight: string;
    bpSystolic: string;
    bpDiastolic: string;
    pulse: string;
    temperature: string;
    spo2: string;
  };
  defaultAdvice: string[];
  customDiagnosisSuggestions: string[];
  customComplaintSuggestions: string[];
}

const STORAGE_KEY = 'emr_consultation_settings';

const defaultSections: ConsultationSection[] = [
  { id: 'vitals', label: 'Vitals', icon: 'HeartPulse', enabled: true, order: 0 },
  { id: 'history', label: 'History', icon: 'ClipboardList', enabled: true, order: 1 },
  { id: 'past-history', label: 'Past History', icon: 'FileText', enabled: true, order: 2 },
  { id: 'complaints', label: 'Complaints', icon: 'MessageSquare', enabled: true, order: 3 },
  { id: 'investigations', label: 'Investigations', icon: 'FlaskConical', enabled: true, order: 4 },
  { id: 'diagnosis', label: 'Diagnosis', icon: 'Stethoscope', enabled: true, order: 5 },
  { id: 'medicine', label: 'Medicine', icon: 'Pill', enabled: true, order: 6 },
  { id: 'advice', label: 'Advice', icon: 'Lightbulb', enabled: true, order: 7 },
  { id: 'tests-requested', label: 'Tests', icon: 'TestTube', enabled: true, order: 8 },
  { id: 'ckd-graph', label: 'CKD Graph', icon: 'Activity', enabled: true, order: 9, isLink: true, href: '/emr/ckd-dashboard' },
  { id: 'dialysis', label: 'Dialysis', icon: 'Droplets', enabled: true, order: 10, isLink: true, href: '/emr/dialysis' },
  { id: 'transplant', label: 'Transplant', icon: 'Heart', enabled: true, order: 11, isLink: true, href: '/emr/transplant' },
  { id: 'diet', label: 'Diet', icon: 'Apple', enabled: true, order: 12, isLink: true, href: '/emr/ckd-dashboard' },
  { id: 'timeline', label: 'Timeline', icon: 'GitBranch', enabled: true, order: 13 },
];

const defaults: ConsultationSettings = {
  sections: defaultSections,
  showPatientInfo: true,
  showPrescriptionPreview: true,
  defaultVitals: {
    height: '',
    weight: '',
    bpSystolic: '',
    bpDiastolic: '',
    pulse: '',
    temperature: '',
    spo2: '',
  },
  defaultAdvice: [],
  customDiagnosisSuggestions: [],
  customComplaintSuggestions: [],
};

export function loadConsultationSettings(): ConsultationSettings {
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const saved = JSON.parse(raw) as Partial<ConsultationSettings>;
    // Merge with defaults so new fields are always present
    return {
      ...defaults,
      ...saved,
      sections: saved.sections ?? defaults.sections,
      defaultVitals: { ...defaults.defaultVitals, ...(saved.defaultVitals || {}) },
    };
  } catch {
    return defaults;
  }
}

export function saveConsultationSettings(settings: ConsultationSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function resetConsultationSettings(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
