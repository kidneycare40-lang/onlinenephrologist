'use client';

export interface ClinicDetail {
  id: string;
  name: string;
  shortName: string;
  parentName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
  gstNumber: string;
  panNumber: string;
  fee: number;
  type: 'offline' | 'online';
  color: string;
  features: string[];
  byAppointment: boolean;
  workingDays: number[];
  startTime: string;
  endTime: string;
  slotInterval: number;
  breakStart: string;
  breakEnd: string;
  maxPatientsPerDay: number;
  bankDetails: {
    upiId: string;
    bankName: string;
    accountName: string;
    ifsc: string;
    accountNo: string;
  };
  enabled: boolean;
}

const STORAGE_KEY = 'emr_all_clinics';

const defaultClinics: ClinicDetail[] = [
  {
    id: 'kcc-faridabad',
    name: 'Kidney Care Centre - Faridabad',
    shortName: 'Faridabad',
    parentName: 'Kidney Care Centre',
    address: 'Old Faridabad, 18A Main Market, Faridabad, Haryana',
    city: 'Faridabad',
    state: 'Haryana',
    pincode: '121002',
    phone: '9818235688',
    email: 'info@kidneycarecentre.in',
    website: 'www.kidneycarecentre.in',
    gstNumber: '07AABCU9603R1ZM',
    panNumber: 'AABCU9603R',
    fee: 500,
    type: 'offline',
    color: 'blue',
    features: ['In-person consultation', 'Same-day appointment'],
    byAppointment: false,
    workingDays: [1, 2, 3, 4, 5, 6],
    startTime: '09:00',
    endTime: '10:30',
    slotInterval: 5,
    breakStart: '',
    breakEnd: '',
    maxPatientsPerDay: 20,
    bankDetails: { upiId: '9818235688@pthdfc', bankName: 'HDFC Bank', accountName: 'Rajesh Goel', ifsc: 'HDFC0001002', accountNo: '10021140021585' },
    enabled: true,
  },
  {
    id: 'kcc-saket',
    name: 'Kidney Care Centre - Saket',
    shortName: 'Saket',
    parentName: 'Kidney Care Centre',
    address: '13 B, K-Block, Gate no. - 2, Saket, New Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110017',
    phone: '9818235613',
    email: 'info@kidneycarecentre.in',
    website: 'www.kidneycarecentre.in',
    gstNumber: '07AABCU9603R1ZM',
    panNumber: 'AABCU9603R',
    fee: 1200,
    type: 'offline',
    color: 'amber',
    features: ['Evening hours available', 'Weekend appointments', 'Central Delhi location'],
    byAppointment: true,
    workingDays: [0, 1, 2, 3, 4, 5, 6],
    startTime: '21:00',
    endTime: '23:00',
    slotInterval: 10,
    breakStart: '',
    breakEnd: '',
    maxPatientsPerDay: 12,
    bankDetails: { upiId: '9818235688@pthdfc', bankName: 'HDFC Bank', accountName: 'Rajesh Goel', ifsc: 'HDFC0001002', accountNo: '10021140021585' },
    enabled: true,
  },
  {
    id: 'psri-delhi',
    name: 'PSRI Hospital, New Delhi',
    shortName: 'PSRI Hospital',
    parentName: 'PSRI Hospital',
    address: 'Press Enclave Marg, Shaikh Sarai - II, New Delhi - 110017',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110017',
    phone: '9818235613',
    email: 'info@kidneycarecentre.in',
    website: 'www.kidneycarecentre.in',
    gstNumber: '07AABCU9603R1ZM',
    panNumber: 'AABCU9603R',
    fee: 1200,
    type: 'offline',
    color: 'purple',
    features: ['Multi-specialty hospital', 'Advanced diagnostics', 'Pay at hospital'],
    byAppointment: false,
    workingDays: [1, 2, 3, 4, 5, 6],
    startTime: '13:00',
    endTime: '18:30',
    slotInterval: 10,
    breakStart: '15:00',
    breakEnd: '15:30',
    maxPatientsPerDay: 30,
    bankDetails: { upiId: '9818235688@pthdfc', bankName: 'HDFC Bank', accountName: 'Rajesh Goel', ifsc: 'HDFC0001002', accountNo: '10021140021585' },
    enabled: true,
  },
  {
    id: 'online',
    name: 'Online Consultation',
    shortName: 'Online',
    parentName: 'Online',
    address: 'Video/Phone Consultation from anywhere',
    city: '',
    state: '',
    pincode: '',
    phone: '9818235688',
    email: 'info@kidneycarecentre.in',
    website: 'www.onlinenephrologist.com',
    gstNumber: '',
    panNumber: '',
    fee: 500,
    type: 'online',
    color: 'emerald',
    features: ['Video call with doctor', 'Digital prescription', 'WhatsApp follow-up'],
    byAppointment: false,
    workingDays: [0, 1, 2, 3, 4, 5, 6],
    startTime: '07:00',
    endTime: '23:00',
    slotInterval: 15,
    breakStart: '',
    breakEnd: '',
    maxPatientsPerDay: 50,
    bankDetails: { upiId: '9818235688@pthdfc', bankName: 'HDFC Bank', accountName: 'Rajesh Goel', ifsc: 'HDFC0001002', accountNo: '10021140021585' },
    enabled: true,
  },
];

export function loadAllClinics(): ClinicDetail[] {
  if (typeof window === 'undefined') return defaultClinics;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultClinics;
    const saved = JSON.parse(raw) as Partial<ClinicDetail>[];
    // Merge with defaults so new fields are always present
    return defaultClinics.map(def => {
      const s = saved.find(c => c.id === def.id);
      return s ? { ...def, ...s, bankDetails: { ...def.bankDetails, ...(s.bankDetails || {}) } } : def;
    });
  } catch {
    return defaultClinics;
  }
}

export function saveAllClinics(clinics: ClinicDetail[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(clinics));
}

export function getClinicById(id: string): ClinicDetail | undefined {
  return loadAllClinics().find(c => c.id === id);
}

export function resetClinics(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
