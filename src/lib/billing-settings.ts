'use client';

const STORAGE_KEY = 'emr_billing_settings';

export interface BillingSettings {
  doctor: {
    name: string;
    designation: string;
    locations: string;
    website1: string;
    website2: string;
    emergencyPhone: string;
    whatsappPhone: string;
  };
  clinicFees: {
    [clinicId: string]: number;
  };
  services: { description: string; rate: number; gstRate: number }[];
  payment: {
    upiId: string;
    bankName: string;
    accountName: string;
    ifsc: string;
    accountNo: string;
  };
  gst: {
    rate: number;
    included: boolean;
    showBreakup: boolean;
    gstin: string;
  };
}

const defaultSettings: BillingSettings = {
  doctor: {
    name: 'Dr. Rajesh Goel',
    designation: 'Sr. Nephrologist',
    locations: 'Delhi and Faridabad',
    website1: 'www.kidneycarecentre.in',
    website2: 'www.onlinenephrologist.com',
    emergencyPhone: '9818235688',
    whatsappPhone: '9818235613',
  },
  clinicFees: {
    'kcc-faridabad': 500,
    'kcc-saket': 1200,
    'psri-delhi': 1000,
    'online': 500,
  },
  services: [
    { description: 'Consultation fee', rate: 500, gstRate: 0 },
    { description: 'Online Consultation fee', rate: 500, gstRate: 0 },
  ],
  payment: {
    upiId: '9818235688@pthdfc',
    bankName: 'HDFC Bank',
    accountName: 'Rajesh Goel',
    ifsc: 'HDFC0001002',
    accountNo: '10021140021585',
  },
  gst: {
    rate: 0,
    included: false,
    showBreakup: false,
    gstin: '',
  },
};

export function loadBillingSettings(): BillingSettings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch { /* ignore */ }
  return defaultSettings;
}

export function saveBillingSettings(settings: BillingSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
