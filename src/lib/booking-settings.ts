const STORAGE_KEY = 'emr_booking_settings';

export interface ClinicSchedule {
  clinicId: string;
  clinicName: string;
  consultationType: 'in-clinic' | 'online' | 'online-intl' | 'hospital';
  enabled: boolean;
  workingDays: number[];
  startTime: string;
  endTime: string;
  slotInterval: number;
  breakStart: string;
  breakEnd: string;
  maxPatientsPerDay: number;
  fee: number;
  currency: string;
  description: string;
}

export interface Holiday {
  id: string;
  date: string;
  title: string;
  isFullDay: boolean;
  startTime: string;
  endTime: string;
}

export interface BookingSettings {
  schedules: ClinicSchedule[];
  holidays: Holiday[];
  rules: {
    maxAdvanceBookingDays: number;
    minAdvanceBookingHours: number;
    allowSameDayBooking: boolean;
    cancellationAllowed: boolean;
    cancellationHoursBefore: number;
    autoConfirmBookings: boolean;
    requirePaymentUpfront: boolean;
  };
  onlineBooking: {
    enabled: boolean;
    showOnWebsite: boolean;
    requirePhone: boolean;
    requireEmail: boolean;
    allowFileUpload: boolean;
    maxFileSize: number;
  };
  noticeBoard: {
    enabled: boolean;
    message: string;
    type: 'info' | 'warning' | 'maintenance';
  };
  paymentGateway: {
    enabled: boolean;
    provider: 'razorpay' | 'upi-only' | 'manual';
    razorpayKeyId: string;
    razorpayKeySecret: string;
    upiId: string;
    currency: string;
    requirePaymentForOnline: boolean;
    requirePaymentForClinic: boolean;
  };
  international: {
    enabled: boolean;
    countries: string[];
    timezones: string[];
    conditions: string[];
    fee: number;
    currency: string;
    requireCountry: boolean;
    requireTimezone: boolean;
    requireMessage: boolean;
    allowedLanguages: string[];
    maxAdvanceBookingDays: number;
    autoConfirm: boolean;
  };
}

export const defaultClinicSchedules: ClinicSchedule[] = [
  { clinicId: 'kcc-faridabad', clinicName: 'Kidney Care Centre - Faridabad', consultationType: 'in-clinic', enabled: true, workingDays: [1,2,3,4,5,6], startTime: '09:00', endTime: '10:30', slotInterval: 5, breakStart: '', breakEnd: '', maxPatientsPerDay: 20, fee: 500, currency: 'INR', description: 'In-person consultation at Old Faridabad clinic' },
  { clinicId: 'kcc-saket', clinicName: 'Kidney Care Centre - Saket', consultationType: 'in-clinic', enabled: true, workingDays: [1,2,3,4,5,6,0], startTime: '21:00', endTime: '23:00', slotInterval: 10, breakStart: '', breakEnd: '', maxPatientsPerDay: 12, fee: 1200, currency: 'INR', description: 'In-person consultation at Saket, New Delhi' },
  { clinicId: 'psri-delhi', clinicName: 'PSRI Hospital Delhi', consultationType: 'hospital', enabled: true, workingDays: [1,2,3,4,5,6], startTime: '13:00', endTime: '18:30', slotInterval: 10, breakStart: '15:00', breakEnd: '15:30', maxPatientsPerDay: 30, fee: 1000, currency: 'INR', description: 'In-person consultation at PSRI Hospital' },
  { clinicId: 'online', clinicName: 'Online Consultation (India)', consultationType: 'online', enabled: true, workingDays: [1,2,3,4,5,6,0], startTime: '07:00', endTime: '23:00', slotInterval: 15, breakStart: '', breakEnd: '', maxPatientsPerDay: 50, fee: 500, currency: 'INR', description: 'Video consultation for patients in India' },
  { clinicId: 'online-intl', clinicName: 'International Video Consultation', consultationType: 'online-intl', enabled: true, workingDays: [1,2,3,4,5,6,0], startTime: '07:00', endTime: '23:00', slotInterval: 15, breakStart: '', breakEnd: '', maxPatientsPerDay: 20, fee: 20, currency: 'USD', description: 'Video consultation for international patients ($20 USD)' },
];

export const defaultSettings: BookingSettings = {
  schedules: defaultClinicSchedules,
  holidays: [],
  rules: {
    maxAdvanceBookingDays: 30,
    minAdvanceBookingHours: 2,
    allowSameDayBooking: true,
    cancellationAllowed: true,
    cancellationHoursBefore: 4,
    autoConfirmBookings: false,
    requirePaymentUpfront: false,
  },
  onlineBooking: {
    enabled: true,
    showOnWebsite: true,
    requirePhone: true,
    requireEmail: false,
    allowFileUpload: true,
    maxFileSize: 10,
  },
  noticeBoard: {
    enabled: false,
    message: '',
    type: 'info',
  },
  paymentGateway: {
    enabled: false,
    provider: 'upi-only',
    razorpayKeyId: '',
    razorpayKeySecret: '',
    upiId: '9818235688@pthdfc',
    currency: 'INR',
    requirePaymentForOnline: false,
    requirePaymentForClinic: false,
  },
  international: {
    enabled: true,
    countries: [
      'United States', 'United Kingdom', 'Australia', 'Canada', 'UAE', 'Saudi Arabia',
      'Singapore', 'Malaysia', 'Bangladesh', 'Nepal', 'Sri Lanka', 'Africa',
      'Germany', 'France', 'Japan', 'Other',
    ],
    timezones: [
      'IST (India, UTC+5:30)', 'EST (US East, UTC-5)', 'CST (US Central, UTC-6)',
      'PST (US Pacific, UTC-8)', 'GMT (UK, UTC+0)', 'CET (Europe, UTC+1)',
      'AEST (Australia East, UTC+10)', 'JST (Japan, UTC+9)', 'GST (Dubai, UTC+4)',
      'Other',
    ],
    conditions: [
      'Chronic Kidney Disease (CKD)', 'Kidney Failure', 'Dialysis Management',
      'Kidney Transplant', 'Kidney Stones', 'High Creatinine',
      'Diabetic Kidney Disease', 'Hypertension', 'Second Opinion', 'Other',
    ],
    fee: 20,
    currency: 'USD',
    requireCountry: true,
    requireTimezone: true,
    requireMessage: true,
    allowedLanguages: ['English', 'Hindi', 'Arabic', 'French', 'Spanish', 'German', 'Japanese'],
    maxAdvanceBookingDays: 30,
    autoConfirm: false,
  },
};

export function loadBookingSettings(): BookingSettings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultSettings;
    const parsed = JSON.parse(stored);
    return { ...defaultSettings, ...parsed };
  } catch {
    return defaultSettings;
  }
}

export function saveBookingSettings(settings: BookingSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
