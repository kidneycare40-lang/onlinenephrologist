'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SITE_CONFIG, DOCTOR_INFO } from '@/lib/constants';
import {
  Video, Building2, CheckCircle2, MapPin, Clock, IndianRupee, AlertTriangle,
  Phone, Calendar, User, Users, FileText, ChevronRight, ChevronLeft, Star, Info,
  Shield, Award, Heart, Upload, X, Loader2, Globe, LogIn, Hospital, Plus, Trash2,
  ArrowRight, GraduationCap, Stethoscope,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { loadBookingSettings, defaultSettings, type BookingSettings } from '@/lib/booking-settings';
import { loadAllClinics } from '@/lib/clinic-settings';
import { validateBooking, type ExistingAppointment, getStoredBookings, isActiveStatus } from '@/lib/booking-validator';
import { getCurrentPatient, type Patient } from '@/lib/patient-auth';
import { getItem, setItem } from '@/lib/client-storage';
import PaymentGateway, { type PaymentData } from '@/components/emr/PaymentGateway';
import { getConsultationPricing, formatPricing, isInternationalConsultation } from '@/lib/pricing';

type ClinicSlot = { id: string; name: string; shortName: string; address: string; city: string; timing: string; fee: number; icon: typeof Video; color: string; features: string[]; slots: string[] };

const TIMEZONES: Record<string, string> = {
  IST: 'IST (India, UTC+5:30)',
  GST: 'GST (UAE, UTC+4)',
  AST: 'AST (Arabia, UTC+3)',
  GMT: 'GMT (UK, UTC+0)',
  BST: 'BST (UK Summer, UTC+1)',
  CET: 'CET (Central Europe, UTC+1)',
  EET: 'EET (Eastern Europe, UTC+2)',
  WET: 'WET (Western Europe, UTC+0)',
  EST: 'EST (US East, UTC-5)',
  CST: 'CST (US Central, UTC-6)',
  MST: 'MST (US Mountain, UTC-7)',
  PST: 'PST (US West, UTC-8)',
  AKST: 'AKST (Alaska, UTC-9)',
  HST: 'HST (Hawaii, UTC-10)',
  AEST: 'AEST (Australia East, UTC+10)',
  ACST: 'ACST (Australia Central, UTC+9:30)',
  AWST: 'AWST (Australia West, UTC+8)',
  NZST: 'NZST (New Zealand, UTC+12)',
  SGT: 'SGT (Singapore, UTC+8)',
  MYT: 'MYT (Malaysia, UTC+8)',
  PHT: 'PHT (Philippines, UTC+8)',
  WIB: 'WIB (Indonesia West, UTC+7)',
  ICT: 'ICT (Indochina, UTC+7)',
  MMT: 'MMT (Myanmar, UTC+6:30)',
  CST_CN: 'CST (China, UTC+8)',
  JST: 'JST (Japan, UTC+9)',
  KST: 'KST (Korea, UTC+9)',
  PKT: 'PKT (Pakistan, UTC+5)',
  BDT: 'BDT (Bangladesh, UTC+6)',
  SLST: 'SLST (Sri Lanka, UTC+5:30)',
  NPT: 'NPT (Nepal, UTC+5:45)',
  WAT: 'WAT (West Africa, UTC+1)',
  EAT: 'EAT (East Africa, UTC+3)',
  SAST: 'SAST (South Africa, UTC+2)',
};

const COUNTRY_TIMEZONES: Record<string, string[]> = {
  USA: ['EST', 'CST', 'MST', 'PST', 'AKST', 'HST'],
  Canada: ['EST', 'CST', 'MST', 'PST'],
  UK: ['GMT', 'BST'],
  UAE: ['GST'],
  'Saudi Arabia': ['AST'],
  Qatar: ['AST'],
  Bahrain: ['AST'],
  Kuwait: ['AST'],
  Oman: ['GST'],
  Pakistan: ['PKT'],
  Bangladesh: ['BDT'],
  'Sri Lanka': ['SLST'],
  Nepal: ['NPT'],
  Myanmar: ['MMT'],
  Malaysia: ['MYT'],
  Singapore: ['SGT'],
  Australia: ['AEST', 'ACST', 'AWST'],
  'New Zealand': ['NZST'],
  'South Africa': ['SAST'],
  Nigeria: ['WAT'],
  Kenya: ['EAT'],
  Egypt: ['EET'],
  Morocco: ['WET'],
  Ethiopia: ['EAT'],
  Uganda: ['EAT'],
  Tanzania: ['EAT'],
  Philippines: ['PHT'],
  Indonesia: ['WIB'],
  Thailand: ['ICT'],
  Vietnam: ['ICT'],
  Cambodia: ['ICT'],
  Laos: ['ICT'],
  China: ['CST_CN'],
  Japan: ['JST'],
  'South Korea': ['KST'],
  Germany: ['CET'], France: ['CET'], Italy: ['CET'], Spain: ['CET'],
  Netherlands: ['CET'], Sweden: ['CET'], Norway: ['CET'], Denmark: ['CET'],
  Switzerland: ['CET'], Austria: ['CET'], Belgium: ['CET'], Poland: ['CET'],
  'Czech Republic': ['CET'], Slovakia: ['CET'], Hungary: ['CET'],
  Croatia: ['CET'], Serbia: ['CET'], 'North Macedonia': ['CET'],
  Albania: ['CET'], Slovenia: ['CET'],
  Finland: ['EET'], Romania: ['EET'], Bulgaria: ['EET'],
  Lithuania: ['EET'], Latvia: ['EET'], Estonia: ['EET'],
};

const ALL_TIMEZONE_KEYS = Object.keys(TIMEZONES);

function timezonesForCountry(country: string): string[] {
  return COUNTRY_TIMEZONES[country] || ALL_TIMEZONE_KEYS;
}

// Fixed UTC offsets (hours) for each timezone code — used to convert doctor's IST
// working hours into the international patient's local timezone
const TZ_OFFSETS: Record<string, number> = {
  IST: 5.5, GST: 4, AST: 3, GMT: 0, BST: 1, CET: 1, EET: 2, WET: 0,
  EST: -5, CST: -6, MST: -7, PST: -8, AKST: -9, HST: -10,
  AEST: 10, ACST: 9.5, AWST: 8, NZST: 12, SGT: 8, MYT: 8, PHT: 8,
  WIB: 7, ICT: 7, MMT: 6.5, CST_CN: 8, JST: 9, KST: 9,
  PKT: 5, BDT: 6, SLST: 5.5, NPT: 5.75, WAT: 1, EAT: 3, SAST: 2,
};

function parseSlotMinutes(slot: string): number | null {
  const match = slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (match[3].toUpperCase() === 'PM' && h !== 12) h += 12;
  if (match[3].toUpperCase() === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}

function formatMinutes(mins: number): string {
  const h24 = ((Math.floor(mins) % 24) + 24) % 24;
  const m = Math.round((mins - Math.floor(mins)) * 60);
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

// Convert an IST slot (e.g. "9:00 AM") to the patient's timezone, e.g. "9:00 PM EST"
function convertSlotToTz(slot: string, tzCode: string): string {
  const mins = parseSlotMinutes(slot);
  if (mins === null) return slot;
  const to = TZ_OFFSETS[tzCode];
  if (to === undefined) return slot;
  const converted = (mins + (to - 5.5) + 1440) % 1440;
  return `${formatMinutes(converted)} ${tzCode}`;
}

// Convert a range label like "Mon to Sun 7:00 AM - 11:00 PM" into the patient's timezone
function convertRangeToTz(timing: string, tzCode: string): string {
  const to = TZ_OFFSETS[tzCode];
  if (to === undefined) return timing;
  return `${timing.replace(/(\d{1,2}:\d{2} (?:AM|PM))/gi, (t) => {
    const mins = parseSlotMinutes(t);
    if (mins === null) return t;
    return formatMinutes((mins + (to - 5.5) + 1440) % 1440);
  })} ${tzCode}`;
}

function generateSlots(schedule: BookingSettings['schedules'][0]): string[] {
  const slots: string[] = [];
  const [startH, startM] = schedule.startTime.split(':').map(Number);
  const [endH, endM] = schedule.endTime.split(':').map(Number);
  const startMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;
  let t = startMin;
  while (t < endMin) {
    if (schedule.breakStart && schedule.breakEnd) {
      const [bsh, bsm] = schedule.breakStart.split(':').map(Number);
      const [beh, bem] = schedule.breakEnd.split(':').map(Number);
      const breakS = bsh * 60 + bsm;
      const breakE = beh * 60 + bem;
      if (t >= breakS && t < breakE) { t = breakE; continue; }
    }
    const h24 = Math.floor(t / 60);
    const m = t % 60;
    const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    slots.push(`${h12}:${m.toString().padStart(2, '0')} ${ampm}`);
    t += schedule.slotInterval;
  }
  return slots;
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

async function buildClinicsFromSettings(settings: BookingSettings): Promise<ClinicSlot[]> {
  const allClinics = await loadAllClinics();
  return settings.schedules.filter(s => s.enabled).map(s => {
    const clinicDetail = allClinics.find(c => c.id === s.clinicId);
    const info = clinicDetail
      ? { name: clinicDetail.name, shortName: clinicDetail.shortName, address: clinicDetail.address, city: clinicDetail.city || '', fee: clinicDetail.fee, color: clinicDetail.color, features: clinicDetail.features }
      : { name: s.clinicName, shortName: s.clinicName, address: '', city: '', fee: 500, color: 'blue', features: [] };
    const sorted = [...s.workingDays].sort((a, b) => a - b);
    let dayStr: string;
    if (sorted.length === 7) {
      dayStr = 'Mon to Sun';
    } else if (sorted.length === 6 && sorted[0] === 1 && sorted[5] === 6) {
      dayStr = 'Mon to Sat';
    } else if (sorted.length === 5 && sorted[0] === 1 && sorted[4] === 5) {
      dayStr = 'Mon to Fri';
    } else {
      dayStr = sorted.map(d => dayNames[d]).join(', ');
    }
    const formatTime = (t: string) => t.replace(/^(\d{2}):(\d{2})$/, (_, h, m) => { const h24 = parseInt(h); const ampm = h24 >= 12 ? 'PM' : 'AM'; const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24; return `${h12}:${m} ${ampm}`; });
    return { id: s.clinicId, ...info, timing: `${dayStr} ${formatTime(s.startTime)} - ${formatTime(s.endTime)}`, icon: s.clinicId === 'online' ? Video : Building2, slots: generateSlots(s) };
  });
}

const COLOR_MAP: Record<string, { bg: string; border: string; selectedBg: string; selectedBorder: string; text: string; icon: string; badge: string }> = {
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', selectedBg: 'bg-emerald-50', selectedBorder: 'border-emerald-500', text: 'text-emerald-700', icon: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  blue:    { bg: 'bg-blue-50',    border: 'border-blue-200',    selectedBg: 'bg-blue-50',    selectedBorder: 'border-blue-500',    text: 'text-blue-700',    icon: 'text-blue-600',    badge: 'bg-blue-100 text-blue-700' },
  purple:  { bg: 'bg-purple-50',  border: 'border-purple-200',  selectedBg: 'bg-purple-50',  selectedBorder: 'border-purple-500',  text: 'text-purple-700',  icon: 'text-purple-600',  badge: 'bg-purple-100 text-purple-700' },
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   selectedBg: 'bg-amber-50',   selectedBorder: 'border-amber-500',   text: 'text-amber-700',   icon: 'text-amber-600',   badge: 'bg-amber-100 text-amber-700' },
};

function BookingForm() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') || 'online';
  const forceInternational = initialType === 'online_intl';

  const [bookingSettings, setBookingSettings] = useState<BookingSettings>({
    ...defaultSettings,
    paymentGateway: { ...defaultSettings.paymentGateway, enabled: true },
  });
  const [clinics, setClinics] = useState<ClinicSlot[]>([]);

  useEffect(() => {
    buildClinicsFromSettings(defaultSettings).then(setClinics);
  }, []);

  useEffect(() => {
    loadBookingSettings().then(async s => {
      s.paymentGateway.enabled = true;
      setBookingSettings(s);
      const c = await buildClinicsFromSettings(s);
      setClinics(c);
    });
  }, []);

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', phone: '', email: '', address: '', age: '', gender: 'Male',
    consultationType: forceInternational ? 'online' : initialType,
    clinicId: (initialType === 'online' || initialType === 'online_intl') ? 'online' : '',
    date: '', time: '', reason: '', previousKidneyIssue: 'no',
    currentMedications: '', notes: '', complaints: '', medicines: '',
    currentLocation: forceInternational ? 'outside_india' as 'india' | 'outside_india' : 'india' as 'india' | 'outside_india',
    isInternational: forceInternational, country: '', countryCode: '', timezone: '', passportNumber: '',
    whatsappNumber: '', preferredLanguage: 'English', interpreterRequired: false,
  });
  const [reportFiles, setReportFiles] = useState<File[]>([]);
  const [ultrasoundFile, setUltrasoundFile] = useState<File | null>(null);
  const [bookingMedicines, setBookingMedicines] = useState<{ id: string; name: string; strength: string; dosage: string; when: string; frequency: string; duration: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [patientAccountId, setPatientAccountId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [duplicateAppt, setDuplicateAppt] = useState<ExistingAppointment | null>(null);
  const [duplicateType, setDuplicateType] = useState<'duplicate_patient' | 'slot_conflict' | null>(null);
  const [mounted, setMounted] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [currentPatient, setCurrentPatientState] = useState<Patient | null>(null);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [bookingSettingsState, setBookingSettingsState] = useState<BookingSettings | null>(null);
  const [bookingFor, setBookingFor] = useState<'self' | 'family'>('self');
  const [dayOffset, setDayOffset] = useState(0);
  const [relationship, setRelationship] = useState('');
  const [phoneLookupLoading, setPhoneLookupLoading] = useState(false);
  const [phoneLookupResult, setPhoneLookupResult] = useState<'existing' | 'new' | null>(null);
  const [phoneLookupInput, setPhoneLookupInput] = useState('');
  const [phoneLookupFirstName, setPhoneLookupFirstName] = useState('');
  const [phoneLookupEmailVerified, setPhoneLookupEmailVerified] = useState(false);
  const [phoneCountryCode, setPhoneCountryCode] = useState('+91');
  const [phoneLookupError, setPhoneLookupError] = useState('');

  useEffect(() => {
    setMounted(true);
    const pendingId = sessionStorage.getItem('pending_booking_id');
    if (pendingId) setBookingId(pendingId);

    // Check server-side patient auth (JWT cookie) for logged-in patients
    fetch('/api/patient-auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.patient?.patientId && data.patient.patientId !== 'pending') {
          const p = data.patient;
          setPatientAccountId(p.patientId);
          setCurrentPatientState({
            id: p.patientId,
            name: p.name || '',
            phone: p.phone || '',
            email: p.email || '',
            isInternational: p.isInternational || false,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          });

          // Calculate age from DOB
          let ageStr = '';
          if (p.dateOfBirth) {
            const dob = new Date(p.dateOfBirth);
            const now = new Date();
            let age = now.getFullYear() - dob.getFullYear();
            const m = now.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
            if (age > 0 && age <= 120) ageStr = age.toString();
          }

          const first = p.firstName || p.name?.split(' ')[0] || '';
          const last = p.lastName || p.name?.split(' ').slice(1).join(' ') || '';

          setFormData(prev => ({
            ...prev,
            firstName: first || prev.firstName,
            lastName: last || prev.lastName,
            phone: p.phone || prev.phone,
            whatsappNumber: p.phone || prev.whatsappNumber,
            email: p.email || prev.email,
            age: ageStr || prev.age,
            gender: p.gender ? p.gender.charAt(0).toUpperCase() + p.gender.slice(1) : prev.gender,
            currentLocation: prev.currentLocation || 'india',
            isInternational: p.isInternational || prev.isInternational,
            country: p.country || prev.country,
            countryCode: p.countryCode || prev.countryCode,
            timezone: p.timezone || prev.timezone,
          }));
        }
      })
      .catch(() => {});

    // Also load legacy localStorage patient (fallback — only if server-side auth didn't find a patient)
    getCurrentPatient().then((patient) => {
      if (patient) {
        setCurrentPatientState(patient);
        setFormData(prev => ({
          ...prev,
          firstName: patient.name.split(' ')[0] || prev.firstName,
          lastName: patient.name.split(' ').slice(1).join(' ') || prev.lastName,
          phone: patient.phone || prev.phone,
          email: patient.email || prev.email,
          age: patient.age?.toString() || prev.age,
          gender: patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : prev.gender,
          currentLocation: prev.currentLocation || 'india',
          isInternational: patient.isInternational || prev.isInternational,
          country: patient.country || prev.country,
          countryCode: patient.countryCode || prev.countryCode,
          timezone: patient.timezone || prev.timezone,
          whatsappNumber: patient.whatsappNumber || prev.whatsappNumber,
        }));
      }
    });
  }, []);

  // If user is already logged in, pre-fill their data
  useEffect(() => {
    if (currentPatient && !forceInternational) {
      setPhoneLookupResult('existing');
      setPhoneLookupInput(currentPatient.phone || '');
    }
  }, [currentPatient, forceInternational]);

  // Auto-detect browser timezone — only sets timezone for scheduling, does NOT change location
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        setFormData(prev => ({ ...prev, timezone: tz }));
      }
    } catch {}
  }, []);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

  const compressReportFile = (file: File): Promise<{ name: string; type: string; data: string }> => {
    if (!file.type.startsWith('image/')) {
      return fileToBase64(file).then((b64) =>
        b64.length > 2 * 1024 * 1024 ? { name: file.name, type: file.type, data: '' } : { name: file.name, type: file.type, data: b64 }
      );
    }
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 1400;
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('no canvas context');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          canvas.toBlob(async (blob) => {
            if (!blob) return resolve({ name: file.name, type: file.type, data: '' });
            const b64 = await fileToBase64(new File([blob], file.name, { type: 'image/jpeg' }));
            resolve({ name: file.name, type: 'image/jpeg', data: b64 });
          }, 'image/jpeg', 0.75);
        } catch {
          URL.revokeObjectURL(url);
          resolve({ name: file.name, type: file.type, data: '' });
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ name: file.name, type: file.type, data: '' });
      };
      img.src = url;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone & email before anything else
    const isIntlBooking = isOutsideIndia;
    const effectivePhone = formData.phone || phoneLookupInput;
    if (effectivePhone && !formData.phone) {
      setFormData(prev => ({ ...prev, phone: effectivePhone, whatsappNumber: effectivePhone }));
    }
    const cleanPhone = effectivePhone.replace(/[\s-]/g, '').replace(/^\+?91/, '');
    if (isIntlBooking && !formData.countryCode) {
      alert('Please select your country code for the WhatsApp number.');
      return;
    }
    const phoneOk = isIntlBooking
      ? /^\d{7,12}$/.test(cleanPhone)
      : /^[6-9]\d{9}$/.test(cleanPhone);
    if (!phoneOk) {
      alert(isIntlBooking
        ? 'Please enter a valid WhatsApp number with country code (7-15 digits, no spaces).'
        : 'Please enter a valid 10-digit Indian mobile number (e.g. 98182 35613).');
      return;
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert('Please enter a valid email address or leave the email field empty.');
      return;
    }

    // Guard: never book a past time slot. Slots are stored in IST; compare the
    // chosen slot against the current time in IST (converted from device time).
    if (formData.date === today) {
      const slotMins = parseSlotMinutes(formData.time);
      if (slotMins !== null) {
        let compareMinutes = nowMinutes;
        if (isIntlBooking) {
          const deviceOffset = new Date().getTimezoneOffset();
          compareMinutes = ((nowMinutes + deviceOffset + 330) % 1440 + 1440) % 1440;
        }
        if (slotMins <= compareMinutes) {
          alert('This time slot has already passed. Please choose a current or upcoming slot.');
          return;
        }
      }
    }

    // Show payment gateway IMMEDIATELY — do not wait for async validation.
    // Duplicate/slot checks can run in background; they only block if a conflict
    // is found, in which case we close the gateway and show the conflict dialog.
    const id = `KN-${Date.now().toString(36).toUpperCase()}`;
    setBookingId(id);
    sessionStorage.setItem('pending_booking_id', id);
    setShowPaymentGateway(true);

    // Run duplicate check in background (non-blocking). If a conflict is found,
    // close the payment gateway and show the duplicate dialog.
    validateBooking(cleanPhone, formData.clinicId, formData.date, formData.time)
      .then((validation) => {
        if (!validation.allowed && validation.existing) {
          setShowPaymentGateway(false);
          setDuplicateAppt(validation.existing);
          setDuplicateType(validation.reason === 'duplicate_patient' ? 'duplicate_patient' : 'slot_conflict');
        }
      })
      .catch(() => {
        // Validation API down — payment gateway stays open, proceed normally
      });
  };

  const finalizeBooking = async (pData: PaymentData | null) => {
    const id = bookingId || `KN-${Date.now().toString(36).toUpperCase()}`;
    setBookingId(id);

    let reportFilesData: { name: string; type: string; data: string }[] = [];
    let ultrasoundData: { name: string; type: string; data: string } | null = null;

    // Process uploaded reports for every booking type (clinic, hospital, online, international)
    const MAX_EMBEDDED = 2 * 1024 * 1024;
    let embeddedBytes = 0;
    for (const f of reportFiles) {
      const item = await compressReportFile(f);
      if (item.data && embeddedBytes + item.data.length > MAX_EMBEDDED) item.data = '';
      if (item.data) embeddedBytes += item.data.length;
      reportFilesData.push(item);
    }
    if (ultrasoundFile) {
      const u = await compressReportFile(ultrasoundFile);
      if (u.data && embeddedBytes + u.data.length > MAX_EMBEDDED) u.data = '';
      ultrasoundData = u;
    }

    // Normalize phone: intl bookings store full international number (country code + digits)
    // so EMR lookup, WhatsApp links, and doctor messages all work correctly.
    const isIntl = isOutsideIndia;
    const fullPhone = isIntl && formData.countryCode
      ? `${formData.countryCode}${formData.phone.replace(/[\s-]/g, '')}`
      : formData.phone;

    const bookingData = {
      ...formData,
      phone: fullPhone,
      patientAccountId: patientAccountId || undefined,
      bookedByPatientAccountId: patientAccountId || undefined,
      relationship: patientAccountId ? (bookingFor === 'family' ? relationship : 'self') : 'self',
      bookingId: id, createdAt: new Date().toISOString(),
      status: 'pending', paymentStatus: pData ? 'paid' : 'unpaid', doctorName: 'Dr Rajesh Goel',
      consultationFee: consultFee,
      consultationFeeCurrency: consultCurrency,
      reportFiles: reportFilesData.length > 0 ? reportFilesData : undefined,
      ultrasoundFile: ultrasoundData || undefined,
      bookingMedicines: bookingMedicines.filter(m => m.name.trim()),
    };

    try {
      const existing = ((await getItem('emr-bookings')) as any[] || []).filter((b: any) => b.bookingId !== id);
      existing.push(bookingData);
      await setItem('emr-bookings', existing);
    } catch {
      try {
        const slimBooking = {
          ...bookingData,
          reportFiles: reportFilesData.map(({ name, type }) => ({ name, type, data: '' })),
          ultrasoundFile: ultrasoundData ? { ...ultrasoundData, data: '' } : null,
        };
        const existing = ((await getItem('emr-bookings')) as any[] || []).filter((b: any) => b.bookingId !== id);
        existing.push(slimBooking);
        await setItem('emr-bookings', existing);
      } catch {}
    }

    // Sync the booking (patient profile + uploaded reports) to the EMR database
    // so it appears in the doctor's EMR on any device. Best-effort — the
    // localStorage record above keeps the flow working if the sync fails.
    try {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingData,
          patientId: `obp-${id}`,
          paymentId: pData?.paymentId || undefined,
          razorpayOrderId: pData?.orderId || undefined,
        }),
      });
    } catch {}

    // Auto-generate invoice in EMR billing for all booking types
    // Online: invoice is PAID (Razorpay verify also creates one as backup)
    // Offline: invoice is PENDING (patient pays at clinic)
    try {
      fetch('/api/bookings/auto-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: id,
          patientName: `${formData.firstName} ${formData.lastName || ''}`.trim(),
          patientPhone: fullPhone,
          clinicId: formData.clinicId,
          consultationType: formData.consultationType,
          consultationFee: consultFee,
          currency: consultCurrency,
          date: formData.date,
          reason: formData.reason,
          paymentMethod: pData ? 'Razorpay' : 'CASH',
        }),
      }).catch(() => {});
    } catch {}

    // Also add patient to emr_added_patients so they appear in EMR Patients list
    try {
      const BOOKING_CLINIC_MAP: Record<string, string> = {
        'online': 'online', 'online-intl': 'online-intl', 'faridabad': 'kcc-faridabad',
        'kcc-faridabad': 'kcc-faridabad', 'psri': 'psri-delhi', 'psri-delhi': 'psri-delhi',
        'saket': 'kcc-saket', 'kcc-saket': 'kcc-saket',
      };
      const mappedClinic = BOOKING_CLINIC_MAP[formData.clinicId] || formData.clinicId || '';
      const uhidPrefix = mappedClinic === 'psri-delhi' ? 'PSRI' : mappedClinic === 'online' ? 'ONLINE' : 'KCC';
      const uhidNum = String(Math.floor(Math.random() * 9000) + 1000);
      const uhid = mappedClinic === 'online' ? `ONLINE-${new Date().getFullYear()}/${uhidNum}` : `${uhidPrefix}-${new Date().getFullYear()}-${uhidNum.slice(0, 3)}`;
      const patientRecord = {
        id: bookingId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: fullPhone,
        email: formData.email,
        address: formData.address || undefined,
        dateOfBirth: formData.age ? `${new Date().getFullYear() - parseInt(formData.age)}-01-01` : '',
        gender: formData.gender,
        clinicId: mappedClinic,
        source: 'website' as const,
        consultationType: formData.consultationType,
        isActive: true,
        isChronic: false,
        uhid,
        lastVisit: formData.date || new Date().toISOString().split('T')[0],
        totalVisits: 1,
        createdAt: new Date().toISOString(),
      };
      const addedPatients = ((await getItem('emr-added-patients')) as any[] || []);
      const exists = addedPatients.some((p: any) =>
        (p.phone && p.phone === fullPhone) || (p.email && p.email === formData.email)
      );
      if (!exists) {
        addedPatients.push(patientRecord);
        await setItem('emr-added-patients', addedPatients);
      }
    } catch {}

    // Upload report files to Supabase Storage so the doctor can open them
    // from WhatsApp or the EMR. Best-effort — the EMR keeps the embedded copy.
    let filesLink = '';
    try {
      const filesForUpload = [
        ...reportFilesData.filter((f) => f.data),
        ...(ultrasoundData && ultrasoundData.data ? [ultrasoundData] : []),
      ];
      if (filesForUpload.length > 0) {
        const res = await fetch('/api/booking-files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: id, files: filesForUpload }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.count > 0) {
            filesLink = `${window.location.origin}/api/booking-files?bookingId=${id}`;
          }
        }
      }
    } catch {}

    // Notify the doctor on WhatsApp with all booking details (every booking type)
    const reportNames = reportFiles.map(f => f.name).join(', ') || 'None';
    const usName = ultrasoundFile?.name || 'None';
    const isOnline = formData.consultationType === 'online' || isOutsideIndia;
    const bookingTypeLabel = isOutsideIndia ? 'International Online Consultation' : isOnline ? 'Online Consultation' : 'Clinic/Hospital Visit';
    const localTimeDisplay = isOutsideIndia && formData.timezone ? convertSlotToTz(formData.time, formData.timezone) : '';

    // Server-side WhatsApp notification to doctor (both numbers)
    fetch('/api/notify/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: id,
        clinicName: selectedClinic?.name || '',
        patientName: `${formData.firstName} ${formData.lastName}`,
        patientPhone: fullPhone,
        patientEmail: formData.email || undefined,
        address: formData.address || undefined,
        ageGender: `${formData.age} / ${formData.gender}`,
        age: formData.age || undefined,
        gender: formData.gender || undefined,
        date: formData.date,
        time: formData.time,
        consultationType: formData.consultationType,
        reason: formData.reason,
        fee: formatPricing(getConsultationPricing(formData.consultationType)),
        paymentStatus: pData ? `PAID via Razorpay` : 'UNPAID',
        paymentId: pData?.paymentId || undefined,
        country: isOutsideIndia ? formData.country : undefined,
        timezone: isOutsideIndia ? formData.timezone : undefined,
        complaints: formData.complaints || undefined,
        medicines: formData.medicines || formData.currentMedications || undefined,
        notes: formData.notes || undefined,
        localTimeDisplay: localTimeDisplay || undefined,
        relationship: patientAccountId ? (bookingFor === 'family' ? relationship : 'self') : 'self',
        bookedByPatientName: bookingFor === 'family' && currentPatient ? currentPatient.name : undefined,
        doctorName: 'Dr Rajesh Goel',
        clinicCity: selectedClinic?.city || undefined,
        reportsUploaded: reportFiles.length > 0,
        ultrasoundUploaded: !!ultrasoundFile,
      }),
    }).catch(() => {});

    // Also open WhatsApp from patient's browser as backup
    const doctorMsg = encodeURIComponent(
      `New Booking — ${bookingTypeLabel}\n\nBooking ID: ${id}\nClinic: ${selectedClinic?.name || ''}\nPatient: ${formData.firstName} ${formData.lastName}\nAge/Gender: ${formData.age} / ${formData.gender}\n${formData.address ? `Location: ${formData.address}\n` : ''}WhatsApp: ${fullPhone}\nDate: ${formData.date} at ${formData.time} IST${localTimeDisplay ? ` (patient local: ${localTimeDisplay})` : ''}\nReason: ${formData.reason}\nFee: ${formatPricing(getConsultationPricing(isOutsideIndia ? 'online_intl' : formData.consultationType))}\n${isOutsideIndia ? `Country: ${formData.country}\nTimezone: ${formData.timezone}\nPreferred Language: ${formData.preferredLanguage}\nInterpreter: ${formData.interpreterRequired ? 'Yes' : 'No'}\n` : ''}${pData ? `Payment: PAID via Razorpay - Payment ID: ${pData.paymentId}\n` : 'Payment: UNPAID\n'}--- Medical Details ---\nComplaints: ${formData.complaints || 'Not provided'}\nReports: ${reportNames}\nUltrasound: ${usName}\nCurrent Medicines: ${formData.medicines || formData.currentMedications || 'Not provided'}\nPrevious Kidney Issue: ${formData.previousKidneyIssue}\nNotes: ${formData.notes || 'None'}${filesLink ? `\n\nView/Download all uploaded reports: ${filesLink}` : ''}`
    );
    // Open WhatsApp to doctor (number 1) with full booking details — patient clicks Send
    window.open(`https://wa.me/919818235613?text=${doctorMsg}`, '_blank');

    // Also open WhatsApp to doctor (number 2) with same details — after a short delay
    setTimeout(() => {
      window.open(`https://wa.me/919818235688?text=${doctorMsg}`, '_blank');
    }, 1500);

    setShowPaymentGateway(false);
    setPaymentData(pData);
    setSubmitted(true);
    sessionStorage.removeItem('pending_booking_id');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'clinicId' || name === 'consultationType') {
      if (name === 'consultationType') {
        let clinicId = '';
        if (value === 'online') clinicId = 'online';
        else if (value === 'hospital') clinicId = 'psri';
        setFormData(prev => ({ ...prev, [name]: value, clinicId, time: '' }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value, time: '' }));
      }
    } else if (name === 'currentLocation') {
      const isOutside = value === 'outside_india';
      setFormData(prev => ({
        ...prev,
        currentLocation: value as 'india' | 'outside_india',
        isInternational: isOutside,
        consultationType: isOutside ? 'online_intl' : (prev.consultationType === 'online_intl' ? 'online' : prev.consultationType),
        time: '',
        country: isOutside ? prev.country : '',
        countryCode: isOutside ? prev.countryCode : '',
        timezone: isOutside ? prev.timezone : '',
      }));
    } else if (name === 'isInternational') {
      const isOutside = value === 'yes';
      setFormData(prev => ({
        ...prev,
        currentLocation: isOutside ? 'outside_india' : 'india',
        isInternational: isOutside,
        consultationType: isOutside ? 'online_intl' : (prev.consultationType === 'online_intl' ? 'online' : prev.consultationType),
        time: '',
      }));
    } else if (name === 'interpreterRequired') {
      setFormData(prev => ({ ...prev, interpreterRequired: value === 'yes' }));
    } else if (name === 'country') {
      setFormData(prev => ({
        ...prev,
        country: value,
        timezone: '',
        time: '',
        countryCode: value === 'USA' ? '+1' : value === 'UK' ? '+44' : value === 'UAE' ? '+971' : value === 'Canada' ? '+1' : prev.countryCode,
      }));
    } else if (name === 'timezone') {
      setFormData(prev => ({ ...prev, timezone: value, time: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const selectClinic = (id: string) => {
    setFormData(prev => ({ ...prev, clinicId: id, time: '' }));
  };

  // Patient's device (browser/phone) local date & time — used so only today's
  // upcoming slots are bookable in THEIR local time, not UTC
  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  const now = new Date(nowTick);
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const selectedClinic = clinics.find(c => c.id === formData.clinicId);
  const isOutsideIndia = formData.currentLocation === 'outside_india';
  const isOnline = formData.consultationType === 'online' || isOutsideIndia;
  const consultPricing = getConsultationPricing(isOutsideIndia ? 'online_intl' : formData.consultationType === 'hospital' ? 'hospital' : formData.consultationType === 'offline' ? 'offline' : 'online');
  const consultFee = isOutsideIndia ? consultPricing.amount : (selectedClinic?.fee || consultPricing.amount);
  const consultCurrency = isOutsideIndia ? 'USD' : 'INR';
  const isIntlBooking = isOutsideIndia;

  const isToday = formData.date === today;

  const holidayDates = useMemo(() => {
    if (!bookingSettings) return new Set<string>();
    return new Set(bookingSettings.holidays.filter(h => h.isFullDay).map(h => h.date));
  }, [bookingSettings]);

  const maxDate = useMemo(() => {
    if (!bookingSettings) return '';
    const d = new Date(nowTick);
    d.setDate(d.getDate() + bookingSettings.rules.maxAdvanceBookingDays);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, [bookingSettings, nowTick]);

  const isHoliday = formData.date ? holidayDates.has(formData.date) : false;

  const isTodayHoliday = useMemo(() => {
    if (!bookingSettings) return false;
    return bookingSettings.holidays.some(h => h.date === today);
  }, [bookingSettings, today]);

  const intlTz = isOutsideIndia ? formData.timezone : '';
  // Full phone with country code for intl patients (used by PaymentGateway, WhatsApp, EMR)
  const fullPatientPhone = isOutsideIndia && formData.countryCode
    ? `${formData.countryCode}${formData.phone.replace(/[\s-]/g, '')}`.replace(/[^0-9]/g, '').replace(/^\+/, '')
    : `91${formData.phone.replace(/[\s-]/g, '')}`;

  // Booked slots for the selected date/clinic (for visual indicators)
  useEffect(() => {
    if (!mounted || !formData.date || !formData.clinicId) {
      setBookedSlots(new Set());
      return;
    }
    getStoredBookings().then(bookings => {
      const taken = new Set<string>();
      for (const b of bookings) {
        if (b.date !== formData.date) continue;
        if (b.clinicId !== formData.clinicId) continue;
        if (!isActiveStatus(b.status)) continue;
        taken.add(b.time.replace(/\s+/g, '').toUpperCase());
      }
      setBookedSlots(taken);
    });
  }, [mounted, formData.date, formData.clinicId]);

  const slotOptions = useMemo(() => {
    if (!selectedClinic) return [];
    if (isHoliday) return [];
    // Slots are generated in IST and stored as IST. International patients see
    // the same slots converted to their local timezone (label), but the stored
    // value stays IST so slot-dedupe and the doctor's schedule stay consistent.
    const withBooked = selectedClinic.slots.map(s => ({
      value: s,
      label: intlTz ? convertSlotToTz(s, intlTz) : s,
      isBooked: bookedSlots.has(s.replace(/\s+/g, '').toUpperCase()),
    }));
    if (!isToday) return withBooked;
    // For intl patients compare against current IST time (derived from device time)
    const nowCompare = intlTz
      ? ((nowMinutes + new Date().getTimezoneOffset() + 330) % 1440 + 1440) % 1440
      : nowMinutes;
    return withBooked.filter(opt => {
      const mins = parseSlotMinutes(opt.value);
      if (mins === null) return true;
      return mins > nowCompare;
    });
  }, [selectedClinic, isToday, nowMinutes, intlTz, bookedSlots]);
  const upiId = '9818235688@pthdfc';
  const upiLink = `upi://pay?pa=${upiId}&pn=Kidney%20Care%20Centre&am=${consultFee}&cu=INR`;

  const steps = [
    { num: 0, label: 'Type' },
    { num: 1, label: 'Clinic' },
    { num: 2, label: 'Details' },
    { num: 3, label: 'Schedule' },
    { num: 4, label: 'Medical' },
    { num: 5, label: 'Confirm' },
  ];

  const canNext = () => {
    if (step === 0) return !!formData.consultationType;
    if (step === 1) return !!formData.clinicId;
    if (step === 2) {
      if (!formData.firstName || !formData.phone || !formData.age) return false;
      return true;
    }
    if (step === 3) return !!formData.date && !!formData.time && !isHoliday;
    if (step === 4) return true;
    if (step === 5) {
      if (!formData.firstName || !formData.phone || !formData.age) return false;
      if (isOutsideIndia && !formData.country) return false;
      return true;
    }
    return true;
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white overflow-x-hidden">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/favicon.png" alt="Online Nephrologist" className="h-9 w-9" />
              <span className="text-lg font-bold text-[#0A75BB]">Online Nephrologist</span>
            </Link>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 overflow-hidden">
            <img src="/images/dr-rajesh-goel.jpg" alt="Dr Rajesh Goel" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointment Booked Successfully!</h1>
          <p className="text-gray-600 mb-4">Dr Rajesh Goel will review your details and see you shortly.</p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-green-100 text-green-700">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Confirmation sent on WhatsApp
            </span>
            {formData.email && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-100 text-blue-700">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Email sent to {formData.email}
              </span>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6 text-left">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-[#0A75BB]/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-[#0A75BB]" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Booking Confirmation</p>
                <p className="text-sm font-bold text-slate-900">{bookingId}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-0.5">
                <p className="text-xs text-slate-500">Patient</p>
                <p className="font-semibold text-slate-900">{formData.firstName} {formData.lastName}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-slate-500">WhatsApp</p>
                <p className="font-semibold text-slate-900">+91 {formData.phone}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-slate-500">Date & Time</p>
                <p className="font-semibold text-slate-900">{formData.date} • {formData.time}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-slate-500">Clinic</p>
                <p className="font-semibold text-slate-900">{selectedClinic?.name}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-slate-500">Consultation Fee</p>
                <p className="font-bold text-[#0A75BB] text-lg">
                  {isOutsideIndia ? `$${consultFee} USD` : `₹${consultFee}`}
                </p>
              </div>
              {paymentData && (
                <div className="space-y-0.5">
                  <p className="text-xs text-slate-500">Payment</p>
                  <p className="font-semibold text-emerald-600 text-sm flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Paid
                    <span className="text-[10px] text-slate-400 font-mono ml-1">{paymentData.paymentId}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {formData.clinicId === 'psri' ? (
            <div className="bg-white rounded-2xl shadow-lg border p-6 mb-6">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                <Building2 className="w-8 h-8 text-blue-600" />
                <div className="text-left">
                  <span className="font-bold text-blue-700">Pay at Hospital</span>
                  <p className="text-xs text-blue-600">Payment to be made at PSRI Hospital during your visit</p>
                </div>
              </div>
            </div>
          ) : isOutsideIndia ? (
            <div className="bg-white rounded-2xl shadow-lg border p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Payment</h2>
              {paymentData ? (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  <div className="text-left">
                    <span className="font-bold text-emerald-700">Payment Received</span>
                    <p className="text-xs text-emerald-600">${consultFee} USD · Payment ID: {paymentData.paymentId}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl">
                  <AlertTriangle className="w-8 h-8 text-amber-600" />
                  <div className="text-left">
                    <span className="font-bold text-amber-700">Payment Pending</span>
                    <p className="text-xs text-amber-600">${consultFee} USD. Our team will contact you for international payment arrangements.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Complete Payment</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button onClick={() => setShowPayment(true)} className="flex flex-col items-center gap-2 p-6 border-2 border-emerald-200 bg-emerald-50 rounded-xl hover:bg-emerald-100 hover:border-emerald-300 transition-all cursor-pointer">
                  <IndianRupee className="w-8 h-8 text-emerald-600" />
                  <span className="font-bold text-emerald-700">Pay Now</span>
                  <span className="text-xs text-emerald-600">UPI / QR Code</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-6 border-2 border-blue-200 bg-blue-50 rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all cursor-pointer">
                  <Building2 className="w-8 h-8 text-blue-600" />
                  <span className="font-bold text-blue-700">Pay at Clinic</span>
                  <span className="text-xs text-blue-600">Pay when you visit</span>
                </button>
              </div>
            </div>
          )}

          {showPayment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowPayment(false)}>
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setShowPayment(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
                <div className="mb-4">
                  <img src="/favicon.png" alt="Kidney Care Centre" className="h-10 mx-auto mb-2" />
                  <h3 className="text-xl font-bold text-gray-900">Kidney Care Centre</h3>
                  <p className="text-sm text-gray-500">Scan this code to pay</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <img src="/upi-qr.jpeg" alt="UPI QR Code" className="w-56 h-56 mx-auto object-contain" />
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">UPI ID</p>
                  <p className="font-mono font-bold text-gray-900 text-lg">{upiId}</p>
                  <p className="text-sm text-gray-500 mt-1">+91 98182 35613</p>
                </div>
                <div className="bg-[#0A75BB]/5 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600">Amount to pay</p>
                  <p className="text-3xl font-bold text-[#0A75BB]">₹{consultFee}</p>
                </div>
                <a href={upiLink} className="block w-full py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors mb-3">
                  Open UPI App to Pay
                </a>
                <p className="text-xs text-gray-400">After payment, send screenshot on WhatsApp</p>
                <a href={`https://wa.me/919818235613?text=Hi%2C%20payment%20of%20Rs%20${consultFee}%20for%20booking%20${bookingId}`} target="_blank" rel="noopener noreferrer" className="block w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors mt-2">
                  Send Screenshot on WhatsApp
                </a>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={`https://wa.me/${fullPatientPhone}?text=${encodeURIComponent(
              `Appointment Confirmation\n\nHi ${formData.firstName}! Your appointment with Dr Rajesh Goel has been booked.\n\nBooking ID: ${bookingId}\nClinic: ${selectedClinic?.name}\nDate: ${formData.date}\nTime: ${isOutsideIndia && formData.timezone ? convertSlotToTz(formData.time, formData.timezone) : formData.time}\nFee: ${isOutsideIndia ? `$${consultFee} USD` : `₹${consultFee}`}\n\nFor any queries, call +91 98182 35613`
            )}`} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Send Confirmation on WhatsApp
            </a>
            <Link href="/" className="px-6 py-3 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] flex items-center justify-center gap-2">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MedicalBusiness",
          "name": "Kidney Care Centre - Online Nephrologist",
          "description": "Book appointment with Dr Rajesh Goel, Senior Nephrologist & Kidney Transplant Physician. Online video consultation and in-clinic visits in Delhi.",
          "url": "https://onlinenephrologist.com",
          "telephone": "+919818235613",
          "priceRange": "₹500 - ₹1200",
          "physician": {
            "@type": "Physician",
            "name": "Dr. Rajesh Goel",
            "medicalSpecialty": "Nephrology",
            "description": "Senior Nephrologist & Kidney Transplant Physician with 20+ years experience",
            "availableService": [
              { "@type": "MedicalProcedure", "name": "Online Video Consultation" },
              { "@type": "MedicalProcedure", "name": "International Video Consultation" },
              { "@type": "MedicalProcedure", "name": "In-Clinic Consultation" },
              { "@type": "MedicalProcedure", "name": "Hospital Visit" }
            ]
          },
          "availableService": [
            { "@type": "MedicalProcedure", "name": "Online Video Consultation", "procedureType": "https://schema.org/LeisureTimeActivity" },
            { "@type": "MedicalProcedure", "name": "In-Clinic Consultation" }
          ],
          "areaServed": ["Delhi", "Faridabad", "Noida", "Gurgaon", "India"],
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "2500"
          }
        }) }}
      />

      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/favicon.png" alt="Online Nephrologist" className="h-9 w-9" />
            <span className="text-lg font-bold text-[#0A75BB] hidden sm:block">Online Nephrologist</span>
          </Link>
          <Link href="/" className="text-sm text-slate-600 hover:text-[#0A75BB] font-medium flex items-center gap-1">
            &larr; Back to Home
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#0A75BB] to-[#085D94] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-6">
            <Link href="/dr-rajesh-goel" className="w-16 h-20 md:w-24 md:h-32 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shrink-0 overflow-hidden hover:border-white/60 transition-colors">
              <img src="/images/dr-rajesh-goel.jpg" alt="Dr Rajesh Goel" className="w-full h-full object-cover" />
            </Link>
            <div className="text-center md:text-left min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold mb-1">Book Appointment</h1>
              <p className="text-white/80 text-xs sm:text-sm md:text-base">Consult <Link href="/dr-rajesh-goel" className="text-white font-semibold underline underline-offset-2 decoration-2 decoration-white/60 hover:decoration-white transition-colors">Dr Rajesh Goel</Link>
                <span className="inline-flex items-center ml-1.5 align-middle bg-green-400 rounded-sm px-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                </span>
                <span className="hidden sm:inline"> — Senior Nephrologist & Kidney Transplant Physician</span>
                <span className="sm:hidden"> — Nephrologist</span>
              </p>
              <p className="text-[10px] sm:text-xs text-white/70 mt-0.5 hidden sm:block">MBBS | DNB Internal Medicine | DNB Nephrology | Fellow Kidney Transplant Medicine</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-2 mt-2">
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs bg-white/15 backdrop-blur-sm px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                  <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-yellow-300 fill-yellow-300" /> 4.9 Rating
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs bg-white/15 backdrop-blur-sm px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                  <Stethoscope className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> 20+ Years Experience
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] sm:text-xs bg-white/15 backdrop-blur-sm px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                  <Heart className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> 5000+ Patients Treated
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] sm:text-xs bg-white/15 backdrop-blur-sm px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                  Reg. No. DMC/R/734
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] sm:text-xs bg-white/15 backdrop-blur-sm px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                  English, Hindi
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center justify-between overflow-x-auto scrollbar-hide">
            {steps.map((s, i, arr) => (
              <React.Fragment key={s.num}>
                <button
                  onClick={() => { if (s.num < step) setStep(s.num); }}
                  className={cn(
                    'flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium transition-colors shrink-0',
                    step === s.num ? 'text-[#0A75BB]' : step > s.num ? 'text-emerald-600' : 'text-slate-400'
                  )}
                >
                  <span className={cn(
                    'w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold',
                    step === s.num ? 'bg-[#0A75BB] text-white' : step > s.num ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                  )}>
                    {step > s.num ? '✓' : s.num}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < arr.length - 1 && <div className={cn('w-4 sm:flex-1 h-0.5 mx-1 sm:mx-2 shrink-0', step > s.num ? 'bg-emerald-300' : 'bg-slate-200')} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Selection Summary Bar */}
      {step > 0 && (
        <div className="bg-slate-100 border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide whitespace-nowrap">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">Your Selection:</span>
              {formData.phone && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-slate-200 text-slate-700 border border-slate-300 shrink-0">
                  <Phone className="h-3 w-3" />
                  {phoneCountryCode} {formData.phone}
                  {phoneLookupResult === 'existing' && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                </span>
              )}
              <span className={cn(
                'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full shrink-0',
                isOnline
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-100 text-blue-700 border border-blue-200'
              )}>
                {isOnline ? <Video className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                {isOutsideIndia ? 'International Video' :
                 isOnline ? 'Online Video Consultation' : 'In-Clinic Visit'}
              </span>
              {step > 2 && selectedClinic && (
                <>
                  <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#0A75BB]/10 text-[#0A75BB] border border-[#0A75BB]/20 shrink-0">
                    <MapPin className="h-3 w-3" />
                    {formData.consultationType === 'hospital' ? 'PSRI Hospital' : (selectedClinic.shortName || selectedClinic.name)}
                    <span className="text-[#0A75BB]/60">• {isOutsideIndia ? `$${consultFee} USD` : `₹${consultFee}`}</span>
                  </span>
                </>
              )}
              {step > 3 && formData.date && (
                <>
                  <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200 shrink-0">
                    <Calendar className="h-3 w-3" />
                    {formData.date} • {formData.time}
                  </span>
                </>
              )}
              {step > 4 && formData.firstName && (
                <>
                  <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 shrink-0">
                    <User className="h-3 w-3" />
                    {formData.firstName} {formData.lastName}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={`flex-1 mx-auto px-3 sm:px-4 lg:px-8 py-5 sm:py-8 ${step >= 1 ? 'max-w-7xl' : 'max-w-3xl'}`}>
        {isTodayHoliday && (
          <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-2xl p-6 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-800 text-lg">Doctor is on Leave Today</h3>
                <p className="text-sm text-red-700 mt-1">
                  Today's appointments are not available. Please select a different date below, or call us for emergency consultation.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pl-13">
              <a href="tel:9818235688" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors">
                <Phone className="h-4 w-4" /> 9818235688
              </a>
              <a href="tel:9818235613" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors">
                <Phone className="h-4 w-4" /> 9818235613
              </a>
            </div>
          </div>
        )}
        {bookingSettings?.noticeBoard.enabled && bookingSettings.noticeBoard.message && (
          <div className={cn(
            'mb-6 p-4 rounded-2xl border flex items-start gap-3 text-sm',
            bookingSettings.noticeBoard.type === 'warning' && 'bg-amber-50 border-amber-200 text-amber-800',
            bookingSettings.noticeBoard.type === 'maintenance' && 'bg-red-50 border-red-200 text-red-800',
            bookingSettings.noticeBoard.type === 'info' && 'bg-blue-50 border-blue-200 text-blue-800',
          )}>
            {bookingSettings.noticeBoard.type === 'warning' ? <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" /> :
             bookingSettings.noticeBoard.type === 'maintenance' ? <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" /> :
             <Info className="h-5 w-5 shrink-0 mt-0.5" />}
            <span>{bookingSettings.noticeBoard.message}</span>
          </div>
        )}
        {/* Phone lookup moved to Step 5 Confirm */}
        {currentPatient && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">Welcome back, {currentPatient.name}!</p>
              <p className="text-xs text-slate-500">
                {bookingFor === 'self'
                  ? 'Your details have been auto-filled. You can book for yourself or a family member below.'
                  : 'Booking for a family member. Fill in their details in the patient information step.'}
                {' '}<button onClick={async () => {
                  try { await fetch('/api/patient-auth/logout', { method: 'POST' }); } catch {}
                  localStorage.removeItem('current-patient');
                  localStorage.removeItem('patient-accounts');
                  setCurrentPatientState(null);
                  setPatientAccountId(null);
                  setBookingFor('self');
                  setRelationship('');
                  setFormData(prev => ({
                    ...prev,
                    firstName: '', lastName: '', phone: '', email: '', age: '', gender: 'Male',
                  }));
                }} className="text-[#0A75BB] underline">Switch patient</button>
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className={step >= 1 ? 'flex flex-col lg:flex-row gap-6' : ''}>
          <div className={step >= 1 ? 'flex-1 min-w-0' : 'max-w-3xl mx-auto'}>
          {/* Step 0: Consultation Type */}
          {step === 0 && (
            <div className="space-y-6">
              {!forceInternational && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Where are you currently located?</label>
                  <p className="text-xs text-slate-500 mb-3">This determines your consultation fee and available payment methods.</p>
                  <div className="flex gap-3">
                    {[
                      { v: 'india', l: 'India', sub: 'Pay in INR (₹500)', icon: '🇮🇳' },
                      { v: 'outside_india', l: 'Outside India', sub: 'Pay in USD ($25)', icon: '🌎' },
                    ].map(o => (
                      <label key={o.v} className={cn(
                        'flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl cursor-pointer transition-all text-sm font-medium flex-1',
                        formData.currentLocation === o.v ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      )}>
                        <input type="radio" name="currentLocation" value={o.v} checked={formData.currentLocation === o.v} onChange={handleChange} className="sr-only" />
                        <span className="text-lg">{o.icon}</span>
                        <div>
                          <div>{o.l}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{o.sub}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
               {(forceInternational || formData.currentLocation === 'outside_india') ? (
                <div className="border-2 border-blue-500 bg-blue-50 rounded-2xl p-6 shadow-lg shadow-blue-100">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0">
                      <Globe className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-lg">International Video Consultation</h3>
                        <CheckCircle2 className="h-5 w-5 text-blue-500" />
                      </div>
                      <p className="text-sm text-slate-500 mb-3">Video consultation for patients outside India</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">Mon-Sun 7AM-11PM IST</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">${getConsultationPricing('online_intl').amount} USD</span>
                      </div>
                      <ul className="mt-3 space-y-1.5">
                        <li className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" /> Timezone-adjusted scheduling</li>
                        <li className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" /> English, Hindi, Urdu and more languages</li>
                        <li className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" /> Reports review + prescription + WhatsApp follow-up</li>
                      </ul>
                    </div>
                  </div>
                   <input type="hidden" name="consultationType" value="online_intl" />
                  <input type="hidden" name="currentLocation" value="outside_india" />
                </div>
              ) : (
              <>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">How would you like to consult?</h2>
                <p className="text-sm text-slate-500">Choose the consultation type that works best for you</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { value: 'online', icon: Video, title: 'Online Video Consultation', desc: 'Consult from home via video call', badge: 'Starting ₹500', color: 'emerald' },
                  { value: 'offline', icon: Building2, title: 'In-Clinic Visit', desc: 'Visit doctor at clinic in person — 2 locations in Delhi', badge: '2 Locations', color: 'blue' },
                  { value: 'hospital', icon: Hospital, title: 'Hospital Visit', desc: 'In-person visit at PSRI Hospital', badge: 'Pay at Hospital', color: 'amber' },
                ].map((opt) => (
                  <label key={opt.value} className={cn(
                    'relative border-2 rounded-2xl p-6 cursor-pointer transition-all duration-200',
                    formData.consultationType === opt.value
                      ? opt.color === 'emerald'
                        ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100'
                        : opt.color === 'blue'
                        ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100'
                        : opt.color === 'purple'
                        ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-100'
                        : 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-100'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md bg-white'
                  )}>
                    <input type="radio" name="consultationType" value={opt.value} checked={formData.consultationType === opt.value} onChange={handleChange} className="sr-only" />
                    {formData.consultationType === opt.value && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 className={cn('h-5 w-5',
                          opt.color === 'emerald' ? 'text-emerald-500' :
                          opt.color === 'blue' ? 'text-blue-500' :
                          opt.color === 'purple' ? 'text-purple-500' : 'text-amber-500'
                        )} />
                      </div>
                    )}
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center mb-3',
                      formData.consultationType === opt.value
                        ? opt.color === 'emerald' ? 'bg-emerald-500 text-white' :
                          opt.color === 'blue' ? 'bg-blue-500 text-white' :
                          opt.color === 'purple' ? 'bg-purple-500 text-white' : 'bg-amber-500 text-white'
                        : 'bg-slate-100 text-slate-500'
                    )}>
                      <opt.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">{opt.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{opt.desc}</p>
                    <span className={cn(
                      'inline-block mt-3 text-xs font-semibold px-2.5 py-1 rounded-full',
                      opt.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                      opt.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                      opt.color === 'purple' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                    )}>{opt.badge}</span>
                  </label>
                ))}
              </div>
              </>
              )}
              <div className="flex justify-end">
                <button type="button" onClick={() => { if (canNext()) setStep(1); }} disabled={!canNext()}
                  className="px-8 py-3 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] transition-colors disabled:opacity-50 flex items-center gap-2">
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Clinic Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {formData.consultationType === 'online' || isOutsideIndia ? 'Confirm Online Consultation' :
                   formData.consultationType === 'hospital' ? 'Hospital Visit — PSRI Hospital' : 'Select a Clinic'}
                </h2>
                <p className="text-sm text-slate-500">
                  {formData.consultationType === 'online' || isOutsideIndia
                    ? 'You will receive a video call link after booking'
                    : formData.consultationType === 'hospital'
                    ? 'Consultation at PSRI Hospital, New Delhi'
                    : 'Choose the clinic closest to you'}
                </p>
              </div>

              {(formData.consultationType === 'online' || isOutsideIndia) ? (
                <div className="border-2 border-emerald-500 bg-emerald-50 rounded-2xl p-6 shadow-lg shadow-emerald-100">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      {isOutsideIndia ? <Globe className="h-7 w-7" /> : <Video className="h-7 w-7" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-lg">
                          {isOutsideIndia ? 'International Video Consultation' : 'Online Video Consultation'}
                        </h3>
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      </div>
                      <p className="text-sm text-slate-500 mb-3">
                        {isOutsideIndia
                          ? 'Consult from anywhere in the world via secure video call'
                          : 'Consult from anywhere in India via secure video call'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
                          {isOutsideIndia
                            ? intlTz ? convertRangeToTz('Mon-Sun 7:00 AM - 11:00 PM', intlTz) : 'Mon-Sun 7AM-11PM IST'
                            : (clinics.find(c => c.id === 'online')?.timing || '')}
                        </span>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
                          {isOutsideIndia ? `$${consultFee} USD` : `₹${selectedClinic?.fee || 500}`}
                        </span>
                      </div>
                      <ul className="mt-3 space-y-1.5">
                        {(clinics.find(c => c.id === 'online')?.features || []).map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <input type="hidden" name="clinicId" value="online" />
                </div>
              ) : formData.consultationType === 'hospital' ? (
                <div className="border-2 border-amber-500 bg-amber-50 rounded-2xl p-6 shadow-lg shadow-amber-100">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                      <Hospital className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-lg">PSRI Hospital</h3>
                        <CheckCircle2 className="h-5 w-5 text-amber-500" />
                      </div>
                      <p className="text-sm text-slate-500 mb-3">Pushpawati Singhania Research Institute, New Delhi</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">Mon-Sat 1PM-7PM</span>
                        <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">Pay at Hospital</span>
                      </div>
                      <ul className="mt-3 space-y-1.5">
                        <li className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" /> Payment at hospital during visit
                        </li>
                        <li className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" /> Walk-in or pre-booked appointment
                        </li>
                      </ul>
                    </div>
                  </div>
                  <input type="hidden" name="clinicId" value="psri" />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {clinics.filter(c => c.id !== 'online' && c.id !== 'psri-delhi' && c.id !== 'online-intl').map((clinic) => {
                    const colors = COLOR_MAP[clinic.color];
                    const isSelected = formData.clinicId === clinic.id;
                    const Icon = clinic.icon;
                    return (
                      <button key={clinic.id} type="button" onClick={() => selectClinic(clinic.id)} className={cn(
                        'text-left border-2 rounded-2xl p-5 transition-all duration-200',
                        isSelected
                          ? cn(colors.selectedBorder, colors.selectedBg, 'shadow-lg')
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                      )}>
                        <div className="flex items-start justify-between mb-3">
                          <div className={cn(
                            'w-11 h-11 rounded-xl flex items-center justify-center',
                            isSelected ? cn(colors.icon.replace('text-', 'bg-').replace('-600', '-500'), 'text-white') : 'bg-slate-100 text-slate-500'
                          )}>
                            <Icon className="h-5 w-5" />
                          </div>
                          {isSelected && <CheckCircle2 className={cn('h-5 w-5', colors.icon)} />}
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm mb-1">{clinic.shortName}</h3>
                        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{clinic.address}</p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', colors.badge)}>
                            <Clock className="h-2.5 w-2.5 inline mr-0.5" />{clinic.timing.split(' ').slice(1).join(' ')}
                          </span>
                          <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', colors.badge)}>
                            ₹{clinic.fee}
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {clinic.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
                              <CheckCircle2 className="h-3 w-3 text-slate-400 shrink-0" /> {f}
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(0)} className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                  Back
                </button>
                <button type="button" onClick={() => canNext() && setStep(2)} disabled={!canNext()}
                  className="px-8 py-3 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] transition-colors disabled:opacity-50 flex items-center gap-2">
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Patient Info */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Patient Information</h2>
                <p className="text-sm text-slate-500">Enter your personal details for the appointment</p>
              </div>

              {/* Who is this appointment for? — only when logged in */}
              {patientAccountId && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Who is this appointment for?</label>
                  <div className="flex gap-3">
                    {[
                      { value: 'self', label: 'Myself', icon: User },
                      { value: 'family', label: 'Someone else / Family member', icon: Users },
                    ].map(o => (
                      <label key={o.value} className={cn(
                        'flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl cursor-pointer transition-all text-sm font-medium flex-1 justify-center',
                        bookingFor === o.value ? 'border-[#0A75BB] bg-[#0A75BB]/5 text-[#0A75BB]' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      )}>
                        <input type="radio" name="bookingFor" value={o.value} checked={bookingFor === o.value}
                          onChange={(e) => {
                            const val = e.target.value as 'self' | 'family';
                            setBookingFor(val);
                            if (val === 'self' && currentPatient) {
                              // Restore account holder's details
                              const first = currentPatient.name?.split(' ')[0] || '';
                              const last = currentPatient.name?.split(' ').slice(1).join(' ') || '';
                              setFormData(prev => ({
                                ...prev,
                                firstName: first,
                                lastName: last,
                                phone: currentPatient.phone || '',
                                email: currentPatient.email || '',
                              }));
                            } else if (val === 'family') {
                              // Clear patient fields for relative
                              setFormData(prev => ({
                                ...prev,
                                firstName: '', lastName: '', phone: '', email: '', age: '',
                              }));
                              setRelationship('');
                            }
                          }} className="sr-only" />
                        <o.icon className="h-4 w-4" />
                        {o.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">First Name *</label>
                    <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange}
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] transition-colors" placeholder="Enter first name" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Last Name</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] transition-colors" placeholder="Enter last name" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mobile / WhatsApp Number *</label>
                    <div className="relative">
                      {isOutsideIndia ? (
                        <select name="countryCode" value={formData.countryCode} onChange={handleChange}
                          className="absolute left-0 top-0 bottom-0 w-24 border-0 border-r border-slate-300 rounded-l-xl bg-slate-50 text-sm px-2 focus:ring-0 focus:border-[#0A75BB] appearance-auto">
                          <option value="">Code</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+971">🇦🇪 +971</option>
                          <option value="+966">🇸🇦 +966</option>
                          <option value="+61">🇦🇺 +61</option>
                          <option value="+65">🇸🇬 +65</option>
                          <option value="+60">🇲🇾 +60</option>
                          <option value="+234">🇳🇬 +234</option>
                          <option value="+254">🇰🇪 +254</option>
                          <option value="+880">🇧🇩 +880</option>
                          <option value="+92">🇵🇰 +92</option>
                          <option value="+94">🇱🇰 +94</option>
                          <option value="+977">🇳🇵 +977</option>
                          <option value="+63">🇵🇭 +63</option>
                          <option value="+20">🇪🇬 +20</option>
                          <option value="+27">🇿🇦 +27</option>
                          <option value="+81">🇯🇵 +81</option>
                          <option value="+82">🇰🇷 +82</option>
                          <option value="+86">🇨🇳 +86</option>
                          <option value="+49">🇩🇪 +49</option>
                          <option value="+33">🇫🇷 +33</option>
                          <option value="+39">🇮🇹 +39</option>
                          <option value="+34">🇪🇸 +34</option>
                          <option value="+31">🇳🇱 +31</option>
                          <option value="+46">🇸🇪 +46</option>
                          <option value="+47">🇳🇴 +47</option>
                          <option value="+353">🇮🇪 +353</option>
                          <option value="+64">🇳🇿 +64</option>
                          <option value="+968">🇴🇲 +968</option>
                          <option value="+974">🇶🇦 +974</option>
                          <option value="+973">🇧🇭 +973</option>
                          <option value="+965">🇰🇼 +965</option>
                          <option value="+962">🇯🇴 +962</option>
                          <option value="+961">🇱🇧 +961</option>
                          <option value="+212">🇲🇦 +212</option>
                          <option value="+216">🇹🇳 +216</option>
                          <option value="+218">🇱🇾 +218</option>
                          <option value="+249">🇸🇩 +249</option>
                          <option value="+251">🇪🇹 +251</option>
                          <option value="+256">🇺🇬 +256</option>
                          <option value="+255">🇹🇿 +255</option>
                          <option value="+263">🇿🇼 +263</option>
                          <option value="+260">🇿🇲 +260</option>
                          <option value="+267">🇧🇼 +267</option>
                          <option value="+264">🇳🇦 +264</option>
                          <option value="+354">🇮🇸 +354</option>
                          <option value="+358">🇫🇮 +358</option>
                          <option value="+45">🇩🇰 +45</option>
                          <option value="+48">🇵🇱 +48</option>
                          <option value="+420">🇨🇿 +420</option>
                          <option value="+43">🇦🇹 +43</option>
                          <option value="+41">🇨🇭 +41</option>
                          <option value="+351">🇵🇹 +351</option>
                          <option value="+30">🇬🇷 +30</option>
                          <option value="+90">🇹🇷 +90</option>
                          <option value="+66">🇹🇭 +66</option>
                          <option value="+84">🇻🇳 +84</option>
                          <option value="+62">🇮🇩 +62</option>
                          <option value="+95">🇲🇲 +95</option>
                          <option value="+855">🇰🇭 +855</option>
                          <option value="+856">🇱🇦 +856</option>
                          <option value="+976">🇲🇳 +976</option>
                          <option value="+98">🇮🇷 +98</option>
                          <option value="+964">🇮🇶 +964</option>
                          <option value="+972">🇮🇱 +972</option>
                          <option value="+213">🇩🇿 +213</option>
                          <option value="+229">🇧🇯 +229</option>
                          <option value="+225">🇨🇮 +225</option>
                          <option value="+233">🇬🇭 +233</option>
                          <option value="+228">🇹🇬 +228</option>
                          <option value="+227">🇳🇪 +227</option>
                          <option value="+226">🇧🇫 +226</option>
                          <option value="+245">🇬🇼 +245</option>
                          <option value="+240">🇬🇶 +240</option>
                          <option value="+241">🇬🇦 +241</option>
                          <option value="+242">🇨🇬 +242</option>
                          <option value="+243">🇨🇩 +243</option>
                          <option value="+262">🇷🇪 +262</option>
                          <option value="+509">🇭🇹 +509</option>
                          <option value="+503">🇸🇻 +503</option>
                          <option value="+502">🇬🇹 +502</option>
                          <option value="+504">🇭🇳 +504</option>
                          <option value="+505">🇳🇮 +505</option>
                          <option value="+506">🇨🇷 +506</option>
                          <option value="+507">🇵🇦 +507</option>
                          <option value="+51">🇵🇪 +51</option>
                          <option value="+56">🇨🇱 +56</option>
                          <option value="+57">🇨🇴 +57</option>
                          <option value="+58">🇻🇪 +58</option>
                          <option value="+55">🇧🇷 +55</option>
                          <option value="+54">🇦🇷 +54</option>
                          <option value="+598">🇺🇾 +598</option>
                          <option value="+595">🇵🇾 +595</option>
                          <option value="+593">🇪🇨 +593</option>
                          <option value="+591">🇧🇴 +591</option>
                        </select>
                      ) : (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">+91</span>
                      )}
                      <input type="tel" name="phone" required value={formData.phone} onChange={handleChange}
                        className={cn(
                          "w-full border border-slate-300 rounded-xl py-2.5 text-sm focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] transition-colors",
                          isOutsideIndia ? 'pl-28 pr-4' : 'pl-12 pr-4'
                        )} placeholder={isOutsideIndia ? 'WhatsApp number with country code' : '98182 35613'} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Booking confirmation will be sent on this WhatsApp</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] transition-colors" placeholder="email@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Age *</label>
                    <input type="number" name="age" required min="1" max="120" value={formData.age} onChange={handleChange}
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] transition-colors" placeholder="Your age" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gender *</label>
                    <select name="gender" value={formData.gender} onChange={handleChange}
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] transition-colors">
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                {!isOutsideIndia && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Address / Location</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] transition-colors"
                    placeholder="City, State" />
                </div>
                )}

                {/* Relationship field — only for family bookings */}
                {bookingFor === 'family' && (
                  <div className="border-t border-slate-200 pt-4 mt-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Relationship to you *</label>
                    <select required value={relationship} onChange={(e) => setRelationship(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] transition-colors">
                      <option value="">Select relationship</option>
                      <option value="father">Father</option>
                      <option value="mother">Mother</option>
                      <option value="son">Son</option>
                      <option value="daughter">Daughter</option>
                      <option value="spouse">Spouse</option>
                      <option value="sibling">Sibling</option>
                      <option value="other">Other</option>
                    </select>
                    <p className="text-[11px] text-slate-400 mt-1">This appointment will be booked under your account for your family member.</p>
                  </div>
                )}

                {/* International Patient Fields — shown when outside India */}
                {isOutsideIndia && (
                  <div className="border-t border-slate-200 pt-4 mt-4 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-5 w-5 text-purple-500" />
                      <h3 className="font-bold text-slate-900">International Patient Details</h3>
                    </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Country *</label>
                        <select name="country" required value={formData.country} onChange={handleChange}
                          className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] transition-colors">
                          <option value="">Select country</option>
                          <option value="USA">United States</option>
                          <option value="UK">United Kingdom</option>
                          <option value="UAE">United Arab Emirates</option>
                          <option value="Saudi Arabia">Saudi Arabia</option>
                          <option value="Qatar">Qatar</option>
                          <option value="Bahrain">Bahrain</option>
                          <option value="Oman">Oman</option>
                          <option value="Kuwait">Kuwait</option>
                          <option value="Pakistan">Pakistan</option>
                          <option value="Bangladesh">Bangladesh</option>
                          <option value="Sri Lanka">Sri Lanka</option>
                          <option value="Nepal">Nepal</option>
                          <option value="Myanmar">Myanmar</option>
                          <option value="Malaysia">Malaysia</option>
                          <option value="Singapore">Singapore</option>
                          <option value="Australia">Australia</option>
                          <option value="New Zealand">New Zealand</option>
                          <option value="South Africa">South Africa</option>
                          <option value="Nigeria">Nigeria</option>
                          <option value="Kenya">Kenya</option>
                          <option value="Egypt">Egypt</option>
                          <option value="Morocco">Morocco</option>
                          <option value="Ethiopia">Ethiopia</option>
                          <option value="Uganda">Uganda</option>
                          <option value="Tanzania">Tanzania</option>
                          <option value="Philippines">Philippines</option>
                          <option value="Indonesia">Indonesia</option>
                          <option value="Thailand">Thailand</option>
                          <option value="Vietnam">Vietnam</option>
                          <option value="Cambodia">Cambodia</option>
                          <option value="Laos">Laos</option>
                          <option value="China">China</option>
                          <option value="Japan">Japan</option>
                          <option value="South Korea">South Korea</option>
                          <option value="Germany">Germany</option>
                          <option value="France">France</option>
                          <option value="Italy">Italy</option>
                          <option value="Spain">Spain</option>
                          <option value="Netherlands">Netherlands</option>
                          <option value="Sweden">Sweden</option>
                          <option value="Norway">Norway</option>
                          <option value="Denmark">Denmark</option>
                          <option value="Finland">Finland</option>
                          <option value="Switzerland">Switzerland</option>
                          <option value="Austria">Austria</option>
                          <option value="Belgium">Belgium</option>
                          <option value="Poland">Poland</option>
                          <option value="Czech Republic">Czech Republic</option>
                          <option value="Slovakia">Slovakia</option>
                          <option value="Hungary">Hungary</option>
                          <option value="Romania">Romania</option>
                          <option value="Bulgaria">Bulgaria</option>
                          <option value="Croatia">Croatia</option>
                          <option value="Serbia">Serbia</option>
                          <option value="North Macedonia">North Macedonia</option>
                          <option value="Albania">Albania</option>
                          <option value="Slovenia">Slovenia</option>
                          <option value="Lithuania">Lithuania</option>
                          <option value="Latvia">Latvia</option>
                          <option value="Estonia">Estonia</option>
                          <option value="Canada">Canada</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Preferred Timezone</label>
                        <select name="timezone" value={formData.timezone} onChange={handleChange}
                          className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] transition-colors">
                          <option value="">{formData.country ? `Select timezone for ${formData.country}` : 'Select country first'}</option>
                          {timezonesForCountry(formData.country).map(tz => (
                            <option key={tz} value={tz}>{TIMEZONES[tz]}</option>
                          ))}
                        </select>
                        <p className="text-xs text-slate-400 mt-1">Showing timezones for {formData.country || 'all countries'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Passport Number</label>
                        <input type="text" name="passportNumber" value={formData.passportNumber} onChange={handleChange}
                          className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] transition-colors" placeholder="Optional — for medical visa" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Preferred Language</label>
                        <select name="preferredLanguage" value={formData.preferredLanguage} onChange={handleChange}
                          className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] transition-colors">
                          <option>English</option>
                          <option>Hindi</option>
                          <option>Arabic</option>
                          <option>Urdu</option>
                          <option>Bengali</option>
                          <option>Tamil</option>
                          <option>Telugu</option>
                          <option>Nepali</option>
                          <option>Sinhala</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Do you need an interpreter?</label>
                      <div className="flex gap-3">
                        {[{ v: 'yes', l: 'Yes' }, { v: 'no', l: 'No' }].map(o => (
                          <label key={o.v} className={cn(
                            'flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl cursor-pointer transition-all text-sm font-medium',
                            (formData.interpreterRequired ? 'yes' : 'no') === o.v ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          )}>
                            <input type="radio" name="interpreterRequired" value={o.v} checked={(formData.interpreterRequired ? 'yes' : 'no') === o.v} onChange={handleChange} className="sr-only" />
                            {o.l}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                  Back
                </button>
                <button type="button" onClick={() => canNext() && setStep(3)} disabled={!canNext()}
                  className="px-8 py-3 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] transition-colors disabled:opacity-50 flex items-center gap-2">
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

           {/* Step 3: Date & Time — DocIndia Style */}
          {step === 3 && (
            <div>
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left: Date & Time Picker */}
              <div className="flex-1 min-w-0 space-y-6">
                <div>
                  <h2 className="text-xl sm:text-xl font-bold text-gray-900 mb-1">Preferred Date & Time</h2>
                  <p className="text-sm sm:text-sm text-slate-500">Select your preferred appointment slot</p>
                </div>

                {/* International timezone notice */}
                {isOutsideIndia && (
                  intlTz ? (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-sm text-purple-700 flex items-center gap-2">
                      <Globe className="h-4 w-4 shrink-0" />
                      Times shown in your timezone: <strong>{TIMEZONES[intlTz]}</strong>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      Select your timezone in the previous step to see times locally
                    </div>
                  )
                )}

                {/* Date Picker + Time Slots */}
                {/* MOBILE: Simple dropdowns */}
                <div className="sm:hidden bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5">
                  <div>
                    <label className="block text-base font-semibold text-slate-700 mb-2">Select Date *</label>
                    <input
                      type="date"
                      required
                      min={today}
                      max={maxDate}
                      value={formData.date}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, date: e.target.value, time: '' }));
                        setBookedSlots(new Set());
                      }}
                      className="w-full border border-slate-300 rounded-xl px-4 py-3.5 text-base bg-white focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] transition-colors"
                    />
                    <p className="text-xs text-slate-400 mt-1.5">Book up to 30 days in advance</p>
                  </div>
                  {formData.date && (
                    <div>
                      <label className="block text-base font-semibold text-slate-700 mb-2">Select Time Slot *</label>
                      <select
                        required
                        value={formData.time}
                        onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full border border-slate-300 rounded-xl px-4 py-3.5 text-base bg-white focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] transition-colors"
                      >
                        <option value="">Select time</option>
                        {slotOptions.filter(s => !s.isBooked).map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {slotOptions.filter(s => !s.isBooked).length === 0 && (
                        <p className="text-xs text-amber-600 mt-1.5">No slots available — select a different date</p>
                      )}
                    </div>
                  )}
                </div>

                {/* DESKTOP: Grid date picker + time slots */}
                <div className="hidden sm:block bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                  {/* Horizontal Date Picker */}
                  <div className="px-2 sm:px-4 py-3 sm:py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDayOffset(Math.max(0, dayOffset - 1))}
                        disabled={dayOffset === 0}
                        className="p-2 rounded-full hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                      >
                        <ChevronLeft className="h-5 w-5 text-slate-500" />
                      </button>
                      <div className="flex gap-2 flex-1 overflow-x-auto pb-1 scrollbar-hide">
                        {Array.from({ length: 14 }, (_, i) => {
                          const d = new Date();
                          d.setDate(d.getDate() + dayOffset + i);
                          const dateStr = d.toISOString().split('T')[0];
                          const isSelected = formData.date === dateStr;
                          const dayOfWeek = d.getDay();
                          const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                          const dayClinic = clinics.find(c => c.id === formData.clinicId);
                          const schedule = bookingSettings.schedules.find(s => s.clinicId === formData.clinicId);
                          const isWorking = formData.clinicId === 'online'
                            || (schedule?.workingDays || []).includes(dayOfWeek);
                          const slotCount = isWorking && dayClinic ? dayClinic.slots.length : 0;
                          const isToday = i === 0 && dayOffset === 0;
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, date: dateStr, time: '' }));
                                setBookedSlots(new Set());
                              }}
                              className={cn(
                                'flex flex-col items-center px-2 py-2 rounded-xl text-xs transition-all min-w-[56px] sm:min-w-[64px] border shrink-0',
                                isSelected
                                  ? 'bg-white border-[#0A75BB] text-[#0A75BB] shadow-md'
                                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                              )}
                            >
                              <span className={cn('text-[10px] font-semibold tracking-wide', isSelected ? 'text-[#0A75BB]' : 'text-slate-400')}>
                                {isToday ? 'Today' : DAY_NAMES[d.getDay()]}
                              </span>
                              <span className="text-lg font-bold leading-tight mt-0.5">{d.getDate()}</span>
                              <span className={cn(
                                'text-[10px] font-medium mt-0.5',
                                isSelected ? 'text-[#0A75BB]' : isWorking ? 'text-emerald-500' : 'text-red-400'
                              )}>
                                {isWorking ? `${slotCount} slots` : 'No slots'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={() => setDayOffset(dayOffset + 1)}
                        disabled={dayOffset >= 20}
                        className="p-2 rounded-full hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                      >
                        <ChevronRight className="h-5 w-5 text-slate-500" />
                      </button>
                    </div>
                  </div>

                  {/* Time Slots Grid */}
                  <div className="px-3 sm:px-5 pb-4 sm:pb-5 border-t border-slate-200 pt-3 sm:pt-4 max-h-[380px] overflow-y-auto">
                    {isHoliday ? (
                      <div className="text-center py-8 text-slate-400">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50 text-red-400" />
                        <p className="text-sm font-medium text-red-600">Doctor is on Leave</p>
                        <p className="text-xs mt-1">Appointments not available on this date</p>
                        <div className="mt-3 flex gap-2 justify-center">
                          <a href="tel:9818235688" className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors">
                            Emergency: 9818235688
                          </a>
                        </div>
                      </div>
                    ) : slotOptions.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No slots available</p>
                        <p className="text-xs mt-1">Select a different date</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(() => {
                          const morning = slotOptions.filter(s => s.value.includes('AM'));
                          const afternoon = slotOptions.filter(s => {
                            if (!s.value.includes('PM')) return false;
                            const match = s.value.match(/^(\d{1,2}):/);
                            return match ? parseInt(match[1]) < 5 : false;
                          });
                          const evening = slotOptions.filter(s => {
                            if (!s.value.includes('PM')) return false;
                            const match = s.value.match(/^(\d{1,2}):/);
                            return match ? parseInt(match[1]) >= 5 : false;
                          });
                          const sections = [
                            ...(morning.length > 0 ? [{ label: 'MORNING', slots: morning }] : []),
                            ...(afternoon.length > 0 ? [{ label: 'AFTERNOON', slots: afternoon }] : []),
                            ...(evening.length > 0 ? [{ label: 'EVENING', slots: evening }] : []),
                          ];
                          return sections.map(section => (
                            <div key={section.label}>
                              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide mb-2">{section.label}</p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-2.5">
                                {section.slots.map(opt => (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                      if (!opt.isBooked) {
                                        setFormData(prev => ({ ...prev, time: opt.value }));
                                      }
                                    }}
                                    disabled={opt.isBooked}
                                    className={cn(
                                      'px-2 py-2 sm:px-3 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all border text-center',
                                      opt.isBooked
                                        ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed line-through'
                                        : formData.time === opt.value
                                          ? 'bg-[#0A75BB] text-white border-[#0A75BB] shadow-md'
                                          : 'bg-white text-[#0A75BB] border-[#0A75BB]/30 hover:border-[#0A75BB] hover:bg-[#0A75BB]/5'
                                    )}
                                  >
                                    {opt.isBooked ? opt.value.replace(/\s*(AM|PM)/i, '') : opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Hidden fields + Back/Next */}
                <input type="hidden" name="date" value={formData.date} required />
                <input type="hidden" name="time" value={formData.time} required />
              </div>

            </div>

            {/* Back/Next Buttons */}
            <div className="flex justify-between mt-6 gap-3">
              <button type="button" onClick={() => setStep(2)} className="flex-1 sm:flex-none px-6 py-3.5 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors text-center">
                Back
              </button>
              <button type="button" onClick={() => canNext() && setStep(4)} disabled={!canNext()}
                className="flex-1 sm:flex-none px-8 py-3.5 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            </div>
          )}

           {/* Step 4: Medical Info & Submit */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Medical Information</h2>
                <p className="text-sm text-slate-500">Help Dr Goel prepare for your consultation</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Reason for Consultation *</label>
                  <select name="reason" required value={formData.reason} onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] transition-colors">
                    <option value="">Select reason</option>
                    <option>Chronic Kidney Disease (CKD)</option>
                    <option>High Creatinine / Low eGFR</option>
                    <option>Diabetic Kidney Disease</option>
                    <option>Kidney Stones</option>
                    <option>Hypertension (High Blood Pressure)</option>
                    <option>Kidney Transplant Consultation</option>
                    <option>Dialysis Management</option>
                    <option>Follow-up Visit</option>
                    <option>Second Opinion</option>
                    <option>General Kidney Check-up</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Have you had kidney issues before?</label>
                  <div className="flex gap-3">
                    {[{ v: 'yes', l: 'Yes' }, { v: 'no', l: 'No' }].map(o => (
                      <label key={o.v} className={cn(
                        'flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl cursor-pointer transition-all text-sm font-medium',
                        formData.previousKidneyIssue === o.v ? 'border-[#0A75BB] bg-[#0A75BB]/5 text-[#0A75BB]' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      )}>
                        <input type="radio" name="previousKidneyIssue" value={o.v} checked={formData.previousKidneyIssue === o.v} onChange={handleChange} className="sr-only" />
                        {o.l}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Additional Notes</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] transition-colors resize-none"
                    placeholder="Any specific concerns or information for the doctor" />
                </div>
              </div>

              {/* Medical Details (online consultations only — offline patients bring reports in person) */}
              {(formData.consultationType === 'online' || isOutsideIndia) && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-5 w-5 text-[#0A75BB]" />
                  <h3 className="font-bold text-gray-900">Medical Details</h3>
                </div>
                <p className="text-xs text-slate-500 -mt-3">Helps Dr Goel prepare for your visit — reports go straight to the doctor</p>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">1. Patient&apos;s Complaints {formData.consultationType === 'online' || isOutsideIndia ? '*' : ''}</label>
                  <p className="text-xs text-slate-400 mb-2">Describe symptoms, when they started, and triggers</p>
                  <textarea name="complaints" required={formData.consultationType === 'online' || isOutsideIndia} value={formData.complaints} onChange={handleChange} rows={4}
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] transition-colors resize-none"
                      placeholder="e.g. Swelling in legs since 2 weeks, reduced urine output, fatigue..." />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">2. Recent Reports (2 main + Ultrasound) *</label>
                    <p className="text-xs text-slate-400 mb-2">Upload blood tests (KFT, CBC, HbA1c, etc.)</p>
                    <div className="space-y-3">
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-[#0A75BB] hover:bg-[#0A75BB]/5 transition-all">
                        <input type="file" id="reportFiles" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e) => setReportFiles(Array.from(e.target.files || []))} className="hidden" />
                        <label htmlFor="reportFiles" className="cursor-pointer">
                          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <span className="text-sm font-medium text-slate-700">
                            {reportFiles.length > 0 ? `${reportFiles.length} file(s) selected` : 'Click or drag to upload reports'}
                          </span>
                          <p className="text-xs text-slate-400 mt-1">Images (JPG/PNG) are auto-compressed; PDFs up to 2MB</p>
                        </label>
                      </div>
                      {reportFiles.length > 0 && (
                        <div className="space-y-1.5">
                          {reportFiles.map((f, i) => (
                            <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                                <span className="text-sm text-slate-700 truncate">{f.name}</span>
                                <span className="text-xs text-slate-400 shrink-0">({(f.size / 1024).toFixed(0)}KB)</span>
                              </div>
                              <button type="button" onClick={() => setReportFiles(reportFiles.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700 ml-2 shrink-0">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-[#0A75BB] hover:bg-[#0A75BB]/5 transition-all">
                        <input type="file" id="ultrasoundFile" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setUltrasoundFile(e.target.files?.[0] || null)} className="hidden" />
                        <label htmlFor="ultrasoundFile" className="cursor-pointer">
                          <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                          <span className="text-sm font-medium text-slate-700">
                            {ultrasoundFile ? ultrasoundFile.name : 'Upload Ultrasound (optional)'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">3. Current Medicines *</label>
                    <p className="text-xs text-slate-400 mb-2">Add each medicine you are currently taking</p>
                    <div className="space-y-2">
                      {bookingMedicines.map((med, idx) => (
                        <div key={med.id} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-2">
                          <span className="text-xs font-bold text-slate-400 w-5 text-center shrink-0">{idx + 1}</span>
                          <input
                            type="text"
                            value={med.name}
                            onChange={(e) => {
                              const updated = [...bookingMedicines];
                              updated[idx] = { ...updated[idx], name: e.target.value };
                              setBookingMedicines(updated);
                            }}
                            placeholder="Medicine name"
                            className="flex-1 min-w-0 px-2 py-1.5 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#0A75BB]"
                          />
                          <input
                            type="text"
                            value={med.strength}
                            onChange={(e) => {
                              const updated = [...bookingMedicines];
                              updated[idx] = { ...updated[idx], strength: e.target.value };
                              setBookingMedicines(updated);
                            }}
                            list={`strength-options-${idx}`}
                            placeholder="Strength"
                            className="w-20 px-1 py-1.5 text-xs border border-slate-200 rounded bg-white focus:outline-none"
                          />
                          <datalist id={`strength-options-${idx}`}>
                            {['5mg','10mg','20mg','25mg','30mg','40mg','50mg','60mg','75mg','100mg','120mg','250mg','500mg','1g'].map(s => <option key={s} value={s} />)}
                          </datalist>
                          <select
                            value={med.dosage}
                            onChange={(e) => {
                              const updated = [...bookingMedicines];
                              updated[idx] = { ...updated[idx], dosage: e.target.value };
                              setBookingMedicines(updated);
                            }}
                            className="w-20 px-1 py-1.5 text-xs border border-slate-200 rounded bg-white focus:outline-none"
                          >
                            <option value="">Dosage</option>
                            {['1-0-0','0-1-0','0-0-1','1-0-1','1-1-0','0-1-1','1-1-1','1-0-0,0-0-1','SOS'].map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                          <select
                            value={med.when}
                            onChange={(e) => {
                              const updated = [...bookingMedicines];
                              updated[idx] = { ...updated[idx], when: e.target.value };
                              setBookingMedicines(updated);
                            }}
                            className="w-24 px-1 py-1.5 text-xs border border-slate-200 rounded bg-white focus:outline-none"
                          >
                            <option value="">When</option>
                            {['After Food','Before Food','Empty Stomach','With Food','Any Time','BF','AF','Bed Time'].map(w => <option key={w} value={w}>{w}</option>)}
                          </select>
                          <select
                            value={med.frequency}
                            onChange={(e) => {
                              const updated = [...bookingMedicines];
                              updated[idx] = { ...updated[idx], frequency: e.target.value };
                              setBookingMedicines(updated);
                            }}
                            className="w-28 px-1 py-1.5 text-xs border border-slate-200 rounded bg-white focus:outline-none"
                          >
                            <option value="">Frequency</option>
                            {['daily','alternate day','weekly','fort night','monthly'].map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                          <select
                            value={med.duration}
                            onChange={(e) => {
                              const updated = [...bookingMedicines];
                              updated[idx] = { ...updated[idx], duration: e.target.value };
                              setBookingMedicines(updated);
                            }}
                            className="w-24 px-1 py-1.5 text-xs border border-slate-200 rounded bg-white focus:outline-none"
                          >
                            <option value="">Duration</option>
                            {['3 days','7 days','2 weeks','1 month','2 months','3 months','6 months','1 year','Ongoing'].map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                          <button
                            type="button"
                            onClick={() => setBookingMedicines(bookingMedicines.filter((_, i) => i !== idx))}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setBookingMedicines([...bookingMedicines, { id: `med-${Date.now()}`, name: '', strength: '', dosage: '', when: '', frequency: '', duration: '' }])}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#0A75BB] bg-[#0A75BB]/5 border border-dashed border-[#0A75BB]/30 rounded-lg hover:bg-[#0A75BB]/10 transition-colors w-full justify-center"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Medicine
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Fee Summary */}
              <div className="bg-gradient-to-r from-[#0A75BB] to-[#085D94] rounded-2xl p-5 text-white">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/80 font-medium">Consultation Fee</span>
                  <span className="text-3xl font-bold">{isOutsideIndia ? `$${consultFee}` : `₹${consultFee}`}</span>
                </div>
                <p className="text-xs text-white/60">
                  {isOutsideIndia ? 'Pay via Razorpay (USD)' :
                   'Pay now via Razorpay'}
                </p>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(3)} className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                  Back
                </button>
                <button type="button" onClick={() => canNext() && setStep(5)} disabled={!canNext()}
                  className="px-8 py-3 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] transition-colors disabled:opacity-50 flex items-center gap-2">
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-slate-400 text-center">
                By booking, you agree to our terms. Your data is kept confidential and used only for medical purposes.
              </p>
            </div>
          )}

          {/* Step 5: Confirm & Pay */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Confirm Your Booking</h2>
                <p className="text-sm text-slate-500">Review your booking details and confirm</p>
              </div>

              {/* Patient Summary */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
                <h3 className="font-bold text-slate-900">Patient Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Name</span><span className="font-medium text-slate-900">{formData.firstName} {formData.lastName}</span></div>
                  {formData.age && <div className="flex justify-between"><span className="text-slate-500">Age</span><span className="font-medium text-slate-900">{formData.age} years</span></div>}
                  {formData.gender && <div className="flex justify-between"><span className="text-slate-500">Gender</span><span className="font-medium text-slate-900">{formData.gender}</span></div>}
                  {formData.phone && <div className="flex justify-between"><span className="text-slate-500">Phone</span><span className="font-medium text-slate-900">{phoneCountryCode} {formData.phone}</span></div>}
                  {formData.email && <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="font-medium text-slate-900">{formData.email}</span></div>}
                </div>
              </div>

              {/* Booking Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
                <h3 className="font-bold text-slate-900">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Type</span><span className="font-medium text-slate-900 capitalize">{formData.consultationType?.replace('_', ' ')}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Date</span><span className="font-medium text-slate-900">{formData.date}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Time</span><span className="font-medium text-slate-900">{formData.time}</span></div>
                  {selectedClinic && <div className="flex justify-between"><span className="text-slate-500">Clinic</span><span className="font-medium text-slate-900">{selectedClinic.shortName || selectedClinic.name}</span></div>}
                  {formData.reason && <div className="flex justify-between"><span className="text-slate-500">Reason</span><span className="font-medium text-slate-900">{formData.reason}</span></div>}
                  <div className="flex justify-between border-t border-slate-200 pt-2">
                    <span className="text-slate-700 font-semibold">Fee</span>
                    <span className="text-lg font-bold text-[#0A75BB]">{isOutsideIndia ? `$${consultFee}` : `₹${consultFee}`}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(4)} className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                  Back
                </button>
                <button type="button" onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)} className="px-10 py-3.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 flex items-center gap-2 text-lg">
                  <CheckCircle2 className="h-5 w-5" /> Confirm & Pay
                </button>
              </div>

              <p className="text-xs text-slate-400 text-center">
                By booking, you agree to our terms. Your data is kept confidential and used only for medical purposes.
              </p>
            </div>
          )}

          </div>

          {/* Persistent Sidebar — shows on steps 1-5, hidden on mobile */}
          {step >= 1 && step <= 5 && (
          <div className="hidden lg:block w-[300px] shrink-0">
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* Patient Details Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 text-sm">Your Details</h3>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{step === 1 ? 'Step 1' : step === 2 ? 'Step 2' : step === 3 ? 'Step 3' : step === 4 ? 'Step 4' : 'Confirm'}</span>
                </div>
                <div className="space-y-2.5">
                  {formData.firstName && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Name</span>
                      <span className="text-xs font-semibold text-gray-900">{formData.firstName} {formData.lastName}</span>
                    </div>
                  )}
                  {formData.age && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Age</span>
                      <span className="text-xs font-semibold text-gray-900">{formData.age} years</span>
                    </div>
                  )}
                  {formData.gender && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Gender</span>
                      <span className="text-xs font-semibold text-gray-900">{formData.gender}</span>
                    </div>
                  )}
                  {formData.address && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Location</span>
                      <span className="text-xs font-semibold text-gray-900 text-right max-w-[150px] truncate">{formData.address}</span>
                    </div>
                  )}
                  {formData.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Phone</span>
                      <span className="text-xs font-semibold text-gray-900">{phoneCountryCode} {formData.phone}</span>
                    </div>
                  )}
                  {formData.consultationType && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Type</span>
                      <span className="text-xs font-semibold text-gray-900 capitalize">{formData.consultationType.replace(/_/g, ' ')}</span>
                    </div>
                  )}
                  {formData.date && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Date</span>
                      <span className="text-xs font-semibold text-gray-900">{formData.date}</span>
                    </div>
                  )}
                  {formData.time && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Time</span>
                      <span className="text-xs font-semibold text-gray-900">{formData.time}</span>
                    </div>
                  )}
                  {selectedClinic && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Clinic</span>
                      <span className="text-xs font-semibold text-gray-900">{selectedClinic.shortName || selectedClinic.name}</span>
                    </div>
                  )}
                </div>
                {selectedClinic && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Fee</span>
                    <span className="text-lg font-bold text-[#0A75BB]">
                      {isOutsideIndia ? `$${consultFee}` : `₹${selectedClinic.fee}`}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 text-right">{isOutsideIndia ? 'Pay via Razorpay (USD)' : 'Pay via Razorpay'}</p>
                </div>
                )}
              </div>

              {/* Consulting Hours */}
              {selectedClinic && (
              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <p className="text-[11px] text-slate-400 uppercase tracking-wide font-medium mb-1">Consulting hours at {selectedClinic.shortName}</p>
                <p className="font-medium text-gray-900 text-sm">{selectedClinic.timing}</p>
              </div>
              )}

              {/* Location & Timings */}
              {selectedClinic && formData.clinicId !== 'online' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wide font-medium mb-2">Location & timings</p>
                  <div className="flex items-start gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{selectedClinic.shortName}</p>
                      <p className="text-xs text-slate-500">{selectedClinic.address}</p>
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(selectedClinic.name + ' ' + selectedClinic.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#0A75BB] text-white text-xs font-semibold rounded-lg hover:bg-[#085a94] transition-colors"
                  >
                    <MapPin className="h-3 w-3" /> Get directions
                  </a>
                </div>
              )}
            </div>
          </div>
          )}
        </form>
      </div>

      {/* International Section — full width below form */}
      {(forceInternational || (mounted && formData.currentLocation === 'outside_india')) && (
      <div className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-5 uppercase tracking-wide text-center">Patients from 20+ Countries Trust Us</h3>
          {(() => {
            const countries = [
              { code: 'us', name: 'United States' },
              { code: 'gb', name: 'United Kingdom' },
              { code: 'ae', name: 'UAE' },
              { code: 'sa', name: 'Saudi Arabia' },
              { code: 'ca', name: 'Canada' },
              { code: 'au', name: 'Australia' },
              { code: 'sg', name: 'Singapore' },
              { code: 'my', name: 'Malaysia' },
              { code: 'ng', name: 'Nigeria' },
              { code: 'ke', name: 'Kenya' },
              { code: 'bd', name: 'Bangladesh' },
              { code: 'pk', name: 'Pakistan' },
              { code: 'lk', name: 'Sri Lanka' },
              { code: 'np', name: 'Nepal' },
              { code: 'ph', name: 'Philippines' },
              { code: 'eg', name: 'Egypt' },
              { code: 'za', name: 'South Africa' },
              { code: 'fr', name: 'France' },
              { code: 'de', name: 'Germany' },
              { code: 'jp', name: 'Japan' },
            ];
            const flagBadge = (c: { code: string; name: string }, i: number) => (
              <span key={`${c.code}-${i}`} className="inline-flex items-center gap-2 text-sm font-semibold bg-white border border-slate-200 text-slate-800 px-4 py-2 rounded-full shadow-sm whitespace-nowrap shrink-0">
                <img src={`https://flagcdn.com/w40/${c.code}.png`} alt={c.name} className="w-6 h-auto rounded-sm" loading="lazy" /> {c.name}
              </span>
            );
            return (
              <div className="overflow-hidden mb-10 relative">
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
                <div className="flex gap-2.5 animate-marquee w-max">
                  {countries.map((c, i) => flagBadge(c, i))}
                  {countries.map((c, i) => flagBadge(c, i + countries.length))}
                </div>
              </div>
            );
          })()}

          <h3 className="text-xl font-bold text-slate-900 text-center mb-1">What International Patients Say</h3>
          <p className="text-sm text-slate-500 text-center mb-6">Verified reviews from patients around the world</p>
          <div className="relative">
            <div id="intl-reviews-scroll" className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth">
              {[
                { name: 'Sarah Mitchell', role: 'New York, USA', code: 'us', text: 'Dr Goel reviewed my reports over video call and explained everything clearly. Saved me a trip to India. Very professional.' },
                { name: 'Ahmed Al Rashid', role: 'Dubai, UAE', code: 'ae', text: 'Excellent consultation. Dr Goel adjusted my dialysis plan and follow-up on WhatsApp was very convenient.' },
                { name: 'Priya Fernando', role: 'Colombo, Sri Lanka', code: 'lk', text: 'I was worried about my kidney function. Dr Goel guided me through the entire process online. Highly recommended.' },
                { name: 'James Okonkwo', role: 'Lagos, Nigeria', code: 'ng', text: 'Great experience. The timezone-adjusted scheduling made it easy to book from Nigeria. Very thorough consultation.' },
              ].map((r, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm w-[280px] sm:w-[340px] shrink-0 snap-center">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1,2,3,4,5].map(s => <Star key={s} className="h-3.5 w-3.5 fill-current" />)}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                  <div className="flex items-center gap-2 pt-1">
                    <img src={`https://flagcdn.com/w20/${r.code}.png`} alt="" className="w-5 h-auto rounded-sm" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{r.name}</p>
                      <p className="text-[11px] text-slate-400">{r.role}</p>
                    </div>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 ml-auto shrink-0" />
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => document.getElementById('intl-reviews-scroll')?.scrollBy({ left: -370, behavior: 'smooth' })} className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center hover:bg-slate-50 transition-colors z-10 cursor-pointer">
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </button>
            <button type="button" onClick={() => document.getElementById('intl-reviews-scroll')?.scrollBy({ left: 370, behavior: 'smooth' })} className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center hover:bg-slate-50 transition-colors z-10 cursor-pointer">
              <ChevronRight className="h-5 w-5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Trust Footer */}
      <div className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Shield, label: '100% Confidential', sub: 'Your data is secure' },
              { icon: Award, label: '20+ Years Experience', sub: 'Trusted by 5000+ patients' },
              { icon: Clock, label: 'Quick Response', sub: 'Same-day appointments' },
              { icon: Phone, label: 'WhatsApp Support', sub: '+91 98182 35613' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#0A75BB]/10 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-[#0A75BB]" />
                </div>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-500">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-sm">
        &copy; {new Date().getFullYear()} Online Nephrologist. All rights reserved.
      </footer>

      {/* Duplicate Appointment Modal */}
      {duplicateAppt && duplicateType && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={() => { setDuplicateAppt(null); setDuplicateType(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setDuplicateAppt(null); setDuplicateType(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {duplicateType === 'duplicate_patient' ? 'Appointment Already Exists' : 'Slot Already Booked'}
                </h3>
                <p className="text-sm text-gray-500">
                  {duplicateType === 'duplicate_patient'
                    ? 'You already have an appointment for this date.'
                    : 'This time slot is taken. Please choose another.'}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 mb-5">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-700"><span className="font-semibold">{duplicateAppt.patientName}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-700">{duplicateAppt.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-700">{duplicateAppt.clinicName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-700">{duplicateAppt.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-700">{duplicateAppt.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{duplicateAppt.status}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => { setDuplicateAppt(null); setDuplicateType(null); }}
                className="w-full py-2.5 bg-[#0A75BB] text-white font-semibold rounded-xl text-sm text-center hover:bg-[#085D94] transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setDuplicateAppt(null);
                  setDuplicateType(null);
                  setTimeout(() => {
                    const dateInput = document.querySelector('input[name="date"]') as HTMLInputElement | null;
                    if (dateInput) {
                      dateInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      dateInput.focus();
                    }
                  }, 100);
                }}
                className="w-full py-2.5 bg-amber-500 text-white font-semibold rounded-xl text-sm hover:bg-amber-600 transition-colors"
              >
                Reschedule
              </button>
              <button
                onClick={async () => {
                  try {
                    const bookings = ((await getItem('emr-bookings')) as any[] || []);
                    const idx = bookings.findIndex((b: any) => b.bookingId === duplicateAppt.bookingId);
                    if (idx >= 0) {
                      bookings[idx].status = 'cancelled';
                      await setItem('emr-bookings', bookings);
                    }
                  } catch {}
                  setDuplicateAppt(null);
                  setDuplicateType(null);
                }}
                className="w-full py-2.5 bg-red-50 text-red-600 font-semibold rounded-xl text-sm hover:bg-red-100 transition-colors"
              >
                Cancel Existing
              </button>
              <button
                onClick={() => { setDuplicateAppt(null); setDuplicateType(null); }}
                className="w-full py-2.5 text-gray-500 text-sm hover:text-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal */}
      {showPaymentGateway && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4" onClick={() => setShowPaymentGateway(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowPaymentGateway(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
            <PaymentGateway
              amount={consultFee}
              currency={consultCurrency}
              bookingId={bookingId || `KN-${Date.now().toString(36).toUpperCase()}`}
              patientName={`${formData.firstName} ${formData.lastName}`}
              patientPhone={fullPatientPhone}
              patientEmail={formData.email}
              patientCountry={formData.country}
              consultationType={formData.consultationType}
              isInternational={isIntlBooking}
              onPaymentSuccess={async (pd) => await finalizeBooking(pd)}
              onPaymentFailed={(reason) => { /* keep modal open — the gateway shows the failure reason inside; user can retry or close */ }}
              onSkipPayment={async () => await finalizeBooking(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookAppointmentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 text-[#0A75BB] animate-spin" /></div>}>
      <BookingForm />
    </Suspense>
  );
}
