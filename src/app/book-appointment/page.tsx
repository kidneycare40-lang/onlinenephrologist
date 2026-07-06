'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SITE_CONFIG } from '@/lib/constants';
import {
  Video, Building2, CheckCircle2, MapPin, Clock, IndianRupee, AlertTriangle,
  Phone, Calendar, User, FileText, ChevronRight, Star, Info,
  Shield, Award, Heart, Upload, X, Loader2, Globe, LogIn, Hospital
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { loadBookingSettings, type BookingSettings } from '@/lib/booking-settings';
import { loadAllClinics } from '@/lib/clinic-settings';
import { validateBooking, type ExistingAppointment, getStoredBookings, isActiveStatus } from '@/lib/booking-validator';
import { getCurrentPatient, type Patient } from '@/lib/patient-auth';
import PaymentGateway, { type PaymentData } from '@/components/emr/PaymentGateway';

type ClinicSlot = { id: string; name: string; shortName: string; address: string; timing: string; fee: number; icon: typeof Video; color: string; features: string[]; slots: string[] };

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

function buildClinicsFromSettings(settings: BookingSettings): ClinicSlot[] {
  const allClinics = loadAllClinics();
  return settings.schedules.filter(s => s.enabled).map(s => {
    const clinicDetail = allClinics.find(c => c.id === s.clinicId);
    const info = clinicDetail
      ? { name: clinicDetail.name, shortName: clinicDetail.shortName, address: clinicDetail.address, fee: clinicDetail.fee, color: clinicDetail.color, features: clinicDetail.features }
      : { name: s.clinicName, shortName: s.clinicName, address: '', fee: 500, color: 'blue', features: [] };
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

  const [bookingSettings, setBookingSettings] = useState<BookingSettings>(() => loadBookingSettings());
  const [clinics, setClinics] = useState<ClinicSlot[]>(() => buildClinicsFromSettings(loadBookingSettings()));

  useEffect(() => {
    const s = loadBookingSettings();
    setBookingSettings(s);
    setClinics(buildClinicsFromSettings(s));
  }, []);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', phone: '', email: '', age: '', gender: 'Male',
    consultationType: initialType,
    clinicId: initialType === 'online' ? 'online' : '',
    date: '', time: '', reason: '', previousKidneyIssue: 'no',
    currentMedications: '', notes: '', complaints: '', medicines: '',
    isInternational: false, country: '', countryCode: '', timezone: '', passportNumber: '',
    whatsappNumber: '', preferredLanguage: 'English', interpreterRequired: false,
  });
  const [reportFiles, setReportFiles] = useState<File[]>([]);
  const [ultrasoundFile, setUltrasoundFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [duplicateAppt, setDuplicateAppt] = useState<ExistingAppointment | null>(null);
  const [duplicateType, setDuplicateType] = useState<'duplicate_patient' | 'slot_conflict' | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentPatient, setCurrentPatientState] = useState<Patient | null>(null);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [bookingSettingsState, setBookingSettingsState] = useState<BookingSettings | null>(null);

  useEffect(() => {
    setMounted(true);
    const patient = getCurrentPatient();
    setCurrentPatientState(patient);
    if (patient) {
      setFormData(prev => ({
        ...prev,
        firstName: patient.name.split(' ')[0] || prev.firstName,
        lastName: patient.name.split(' ').slice(1).join(' ') || prev.lastName,
        phone: patient.phone || prev.phone,
        email: patient.email || prev.email,
        age: patient.age?.toString() || prev.age,
        gender: patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : prev.gender,
        isInternational: patient.isInternational || prev.isInternational,
        country: patient.country || prev.country,
        countryCode: patient.countryCode || prev.countryCode,
        timezone: patient.timezone || prev.timezone,
        whatsappNumber: patient.whatsappNumber || prev.whatsappNumber,
      }));
    }
  }, []);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate for duplicates before saving
    const validation = validateBooking(formData.phone, formData.clinicId, formData.date, formData.time);
    if (!validation.allowed && validation.existing) {
      setDuplicateAppt(validation.existing);
      setDuplicateType(validation.reason === 'duplicate_patient' ? 'duplicate_patient' : 'slot_conflict');
      return;
    }

    // Check if payment gateway requires payment
    const pg = bookingSettings?.paymentGateway;
    if (pg?.enabled && pg.provider !== 'manual') {
      const needsPayment =
        ((formData.consultationType === 'online' || formData.consultationType === 'online_intl') && pg.requirePaymentForOnline) ||
        ((formData.consultationType === 'offline' || formData.consultationType === 'hospital') && pg.requirePaymentForClinic);
      if (needsPayment) {
        setShowPaymentGateway(true);
        return;
      }
    }

    await finalizeBooking(null);
  };

  const finalizeBooking = async (pData: PaymentData | null) => {
    const id = `KN-${Date.now().toString(36).toUpperCase()}`;
    setBookingId(id);

    let reportFilesData: { name: string; type: string; data: string }[] = [];
    let ultrasoundData: { name: string; type: string; data: string } | null = null;

    if (formData.consultationType === 'online' || formData.consultationType === 'online_intl') {
      for (const f of reportFiles) {
        reportFilesData.push({ name: f.name, type: f.type, data: await fileToBase64(f) });
      }
      if (ultrasoundFile) {
        ultrasoundData = { name: ultrasoundFile.name, type: ultrasoundFile.type, data: await fileToBase64(ultrasoundFile) };
      }
    }

    const bookingData = {
      ...formData, bookingId: id, createdAt: new Date().toISOString(),
      status: 'pending', paymentStatus: pData ? 'paid' : 'unpaid', doctorName: 'Dr Rajesh Goel',
      consultationFee: consultFee,
      consultationFeeCurrency: formData.consultationType === 'online_intl' ? 'USD' : 'INR',
      reportFiles: reportFilesData.length > 0 ? reportFilesData : undefined,
      ultrasoundFile: ultrasoundData || undefined,
    };

    try {
      const existing = JSON.parse(localStorage.getItem('emr_bookings') || '[]');
      existing.push(bookingData);
      localStorage.setItem('emr_bookings', JSON.stringify(existing));
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
        phone: formData.phone,
        email: formData.email,
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
      const addedPatients = JSON.parse(localStorage.getItem('emr_added_patients') || '[]');
      const exists = addedPatients.some((p: any) =>
        (p.phone && p.phone === formData.phone) || (p.email && p.email === formData.email)
      );
      if (!exists) {
        addedPatients.push(patientRecord);
        localStorage.setItem('emr_added_patients', JSON.stringify(addedPatients));
      }
    } catch {}

    if (formData.consultationType === 'online' || formData.consultationType === 'online_intl') {
      const reportNames = reportFiles.map(f => f.name).join(', ') || 'None';
      const usName = ultrasoundFile?.name || 'None';
      const doctorMsg = encodeURIComponent(
        `${formData.consultationType === 'online_intl' ? 'New International' : 'New'} Online Consultation Booking\n\nBooking ID: ${id}\nPatient: ${formData.firstName} ${formData.lastName}\nAge/Gender: ${formData.age} / ${formData.gender}\nWhatsApp: ${formData.phone}\nDate: ${formData.date} at ${formData.time}\nReason: ${formData.reason}\n${formData.isInternational ? `Country: ${formData.country}\nTimezone: ${formData.timezone}\nPreferred Language: ${formData.preferredLanguage}\nInterpreter: ${formData.interpreterRequired ? 'Yes' : 'No'}\n` : ''}${pData ? `Payment: ${pData.method.toUpperCase()} - ${pData.paymentId}\n` : ''}--- Medical Details ---\nComplaints: ${formData.complaints || 'Not provided'}\nReports: ${reportNames}\nUltrasound: ${usName}\nCurrent Medicines: ${formData.medicines || formData.currentMedications || 'Not provided'}\nPrevious Kidney Issue: ${formData.previousKidneyIssue}\nNotes: ${formData.notes || 'None'}`
      );
      window.open(`https://wa.me/919818235613?text=${doctorMsg}`, '_blank');
    }

    const patientMsg = encodeURIComponent(
      `Appointment Confirmation\n\nHi ${formData.firstName}! Your appointment with Dr Rajesh Goel has been booked.\n\nBooking ID: ${id}\nClinic: ${selectedClinic?.name}\nDate: ${formData.date}\nTime: ${formData.time}\nFee: ${formData.consultationType === 'online_intl' ? '$20 USD' : `₹${consultFee}`}\n${pData ? `Payment: Paid (${pData.method})\n` : ''}${formData.clinicId === 'psri' ? 'Payment: Pay at Hospital' : pData ? '' : 'Payment: Pay now or at clinic'}\n\nFor any queries, call +91 98182 35613`
    );
    window.open(`https://wa.me/91${formData.phone}?text=${patientMsg}`, '_blank');

    setShowPaymentGateway(false);
    setPaymentData(pData);
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'clinicId' || name === 'consultationType') {
      if (name === 'consultationType') {
        let clinicId = '';
        let isIntl = false;
        if (value === 'online') clinicId = 'online';
        else if (value === 'online_intl') { clinicId = 'online'; isIntl = true; }
        else if (value === 'hospital') clinicId = 'psri';
        setFormData(prev => ({ ...prev, [name]: value, clinicId, time: '', isInternational: isIntl }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value, time: '' }));
      }
    } else if (name === 'isInternational') {
      setFormData(prev => ({ ...prev, isInternational: value === 'yes' }));
    } else if (name === 'interpreterRequired') {
      setFormData(prev => ({ ...prev, interpreterRequired: value === 'yes' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const selectClinic = (id: string) => {
    setFormData(prev => ({ ...prev, clinicId: id, time: '' }));
  };

  const today = new Date().toISOString().split('T')[0];
  const selectedClinic = clinics.find(c => c.id === formData.clinicId);
  const isOnline = formData.consultationType === 'online' || formData.consultationType === 'online_intl';
  const consultFee = formData.consultationType === 'online_intl' ? (selectedClinic?.fee || 20) : (selectedClinic?.fee || 500);

  const isToday = formData.date === today;
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const holidayDates = useMemo(() => {
    if (!bookingSettings) return new Set<string>();
    return new Set(bookingSettings.holidays.filter(h => h.isFullDay).map(h => h.date));
  }, [bookingSettings]);

  const maxDate = useMemo(() => {
    if (!bookingSettings) return '';
    const d = new Date();
    d.setDate(d.getDate() + bookingSettings.rules.maxAdvanceBookingDays);
    return d.toISOString().split('T')[0];
  }, [bookingSettings]);

  const isHoliday = formData.date ? holidayDates.has(formData.date) : false;

  const isTodayHoliday = useMemo(() => {
    if (!bookingSettings) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return bookingSettings.holidays.some(h => h.date === todayStr);
  }, [bookingSettings]);

  const availableSlots = useMemo(() => {
    if (!selectedClinic) return [];
    if (isHoliday) return [];
    if (!isToday) return selectedClinic.slots;
    return selectedClinic.slots.filter(slot => {
      const match = slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (!match) return true;
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      if (match[3].toUpperCase() === 'PM' && h !== 12) h += 12;
      if (match[3].toUpperCase() === 'AM' && h === 12) h = 0;
      return (h * 60 + m) > nowMinutes;
    });
  }, [selectedClinic, isToday, nowMinutes]);

  // Booked slots for the selected date/clinic (for visual indicators)
  const bookedSlots = useMemo(() => {
    if (!mounted || !formData.date || !formData.clinicId) return new Set<string>();
    const bookings = getStoredBookings();
    const taken = new Set<string>();
    for (const b of bookings) {
      if (b.date !== formData.date) continue;
      if (b.clinicId !== formData.clinicId) continue;
      if (!isActiveStatus(b.status)) continue;
      taken.add(b.time.replace(/\s+/g, '').toUpperCase());
    }
    return taken;
  }, [mounted, formData.date, formData.clinicId]);
  const upiId = '9818235688@pthdfc';
  const upiLink = `upi://pay?pa=${upiId}&pn=Kidney%20Care%20Centre&am=${consultFee}&cu=INR`;

  const steps = [
    { num: 1, label: 'Type' },
    { num: 2, label: 'Clinic' },
    { num: 3, label: 'Details' },
    { num: 4, label: 'Schedule' },
    { num: 5, label: 'Medical' },
  ];

  const canNext = () => {
    if (step === 1) return !!formData.consultationType;
    if (step === 2) return !!formData.clinicId;
    if (step === 3) {
      if (!formData.firstName || !formData.lastName || !formData.phone || !formData.age) return false;
      if (formData.isInternational && !formData.country) return false;
      return true;
    }
    if (step === 4) return !!formData.date && !!formData.time && !isHoliday;
    return true;
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
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
          <p className="text-gray-600 mb-8">Dr Rajesh Goel will review your details and see you shortly.</p>

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
                <p className="font-bold text-[#0A75BB] text-lg">₹{consultFee}</p>
              </div>
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
            <a href={`https://wa.me/91${formData.phone}?text=${encodeURIComponent(
              `Appointment Confirmation\n\nHi ${formData.firstName}! Your appointment with Dr Rajesh Goel has been booked.\n\nBooking ID: ${bookingId}\nClinic: ${selectedClinic?.name}\nDate: ${formData.date}\nTime: ${formData.time}\nFee: ₹${consultFee}\n\nFor any queries, call +91 98182 35613`
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
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
            "description": "Senior Nephrologist & Kidney Transplant Physician with 18+ years experience",
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shrink-0 overflow-hidden">
              <img src="/images/dr-rajesh-goel.jpg" alt="Dr Rajesh Goel" className="w-full h-full object-cover" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold mb-1">Book Appointment</h1>
              <p className="text-white/80 text-sm md:text-base">Consult <strong className="text-white">Dr Rajesh Goel</strong> — Senior Nephrologist & Kidney Transplant Physician</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                <span className="inline-flex items-center gap-1 text-xs bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  <Star className="h-3 w-3 text-yellow-300 fill-yellow-300" /> 4.9 Rating
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  <Award className="h-3 w-3" /> 15+ Years Experience
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  <Heart className="h-3 w-3" /> 5000+ Patients Treated
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <React.Fragment key={s.num}>
                <button
                  onClick={() => { if (s.num < step) setStep(s.num); }}
                  className={cn(
                    'flex items-center gap-1.5 text-xs font-medium transition-colors',
                    step === s.num ? 'text-[#0A75BB]' : step > s.num ? 'text-emerald-600' : 'text-slate-400'
                  )}
                >
                  <span className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                    step === s.num ? 'bg-[#0A75BB] text-white' : step > s.num ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                  )}>
                    {step > s.num ? '✓' : s.num}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < steps.length - 1 && <div className={cn('flex-1 h-0.5 mx-2', step > s.num ? 'bg-emerald-300' : 'bg-slate-200')} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Selection Summary Bar */}
      {step > 1 && (
        <div className="bg-slate-100 border-b border-slate-200">
          <div className="max-w-3xl mx-auto px-4 py-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Selection:</span>
              <span className={cn(
                'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full',
                isOnline
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-100 text-blue-700 border border-blue-200'
              )}>
                {isOnline ? <Video className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                {formData.consultationType === 'online_intl' ? 'International Video' :
                 isOnline ? 'Online Video Consultation' : 'In-Clinic Visit'}
              </span>
              {step > 2 && selectedClinic && (
                <>
                  <ChevronRight className="h-3 w-3 text-slate-400" />
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#0A75BB]/10 text-[#0A75BB] border border-[#0A75BB]/20">
                    <MapPin className="h-3 w-3" />
                    {formData.consultationType === 'hospital' ? 'PSRI Hospital' : (selectedClinic.shortName || selectedClinic.name)}
                    <span className="text-[#0A75BB]/60">• ₹{consultFee}</span>
                  </span>
                </>
              )}
              {step > 3 && formData.date && (
                <>
                  <ChevronRight className="h-3 w-3 text-slate-400" />
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                    <Calendar className="h-3 w-3" />
                    {formData.date} • {formData.time}
                  </span>
                </>
              )}
              {step > 4 && formData.firstName && (
                <>
                  <ChevronRight className="h-3 w-3 text-slate-400" />
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                    <User className="h-3 w-3" />
                    {formData.firstName} {formData.lastName}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        {/* Patient Login Banner */}
        {!currentPatient && mounted && (
          <div className="mb-6 bg-gradient-to-r from-[#0A75BB]/5 to-blue-50 border border-[#0A75BB]/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-[#0A75BB]/10 flex items-center justify-center shrink-0">
                <LogIn className="h-5 w-5 text-[#0A75BB]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Already a patient? Sign in to auto-fill your details</p>
                <p className="text-xs text-slate-500">Faster booking with saved information</p>
              </div>
            </div>
            <Link href="/patient/login" className="px-5 py-2.5 bg-[#0A75BB] text-white text-sm font-semibold rounded-xl hover:bg-[#085a94] transition-colors whitespace-nowrap flex items-center gap-2">
              <LogIn className="h-4 w-4" /> Sign In
            </Link>
          </div>
        )}
        {currentPatient && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">Welcome back, {currentPatient.name}!</p>
              <p className="text-xs text-slate-500">Your details have been auto-filled. <button onClick={() => { window.location.reload(); }} className="text-[#0A75BB] underline">Switch patient</button></p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Consultation Type */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">How would you like to consult?</h2>
                <p className="text-sm text-slate-500">Choose the consultation type that works best for you</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { value: 'online', icon: Video, title: 'Online Video (India)', desc: 'Consult from home via video call — for patients in India', badge: 'Starting ₹500', color: 'emerald' },
                  { value: 'offline', icon: Building2, title: 'In-Clinic Visit', desc: 'Visit doctor at clinic in person — 2 locations in Delhi', badge: '2 Locations', color: 'blue' },
                  { value: 'online_intl', icon: Globe, title: 'International Video', desc: 'Video consultation for patients outside India', badge: '$20 USD', color: 'purple' },
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
              <div className="flex justify-end">
                <button type="button" onClick={() => canNext() && setStep(2)} disabled={!canNext()}
                  className="px-8 py-3 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] transition-colors disabled:opacity-50 flex items-center gap-2">
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Clinic Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {formData.consultationType === 'online' || formData.consultationType === 'online_intl' ? 'Confirm Online Consultation' :
                   formData.consultationType === 'hospital' ? 'Hospital Visit — PSRI Hospital' : 'Select a Clinic'}
                </h2>
                <p className="text-sm text-slate-500">
                  {formData.consultationType === 'online' || formData.consultationType === 'online_intl'
                    ? 'You will receive a video call link after booking'
                    : formData.consultationType === 'hospital'
                    ? 'Consultation at PSRI Hospital, New Delhi'
                    : 'Choose the clinic closest to you'}
                </p>
              </div>

              {(formData.consultationType === 'online' || formData.consultationType === 'online_intl') ? (
                <div className="border-2 border-emerald-500 bg-emerald-50 rounded-2xl p-6 shadow-lg shadow-emerald-100">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      {formData.consultationType === 'online_intl' ? <Globe className="h-7 w-7" /> : <Video className="h-7 w-7" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 text-lg">
                          {formData.consultationType === 'online_intl' ? 'International Video Consultation' : 'Online Video Consultation'}
                        </h3>
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      </div>
                      <p className="text-sm text-slate-500 mb-3">
                        {formData.consultationType === 'online_intl'
                          ? 'Consult from anywhere in the world via secure video call'
                          : 'Consult from anywhere in India via secure video call'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
                          {formData.consultationType === 'online_intl' ? 'Mon-Sun 7AM-11PM IST' : (clinics.find(c => c.id === 'online')?.timing || '')}
                        </span>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
                          {formData.consultationType === 'online_intl' ? `$20 USD` : `₹${selectedClinic?.fee || 500}`}
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

          {/* Step 3: Patient Info */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Patient Information</h2>
                <p className="text-sm text-slate-500">Enter your personal details for the appointment</p>
              </div>

              {/* International Patient Toggle */}
              {(formData.consultationType === 'online_intl' || formData.consultationType === 'online') && (
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Are you an international patient?</label>
                  <div className="flex gap-3">
                    {[{ v: 'yes', l: 'Yes — Outside India' }, { v: 'no', l: 'No — In India' }].map(o => (
                      <label key={o.v} className={cn(
                        'flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl cursor-pointer transition-all text-sm font-medium',
                        (formData.isInternational ? 'yes' : 'no') === o.v ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      )}>
                        <input type="radio" name="isInternational" value={o.v} checked={(formData.isInternational ? 'yes' : 'no') === o.v} onChange={handleChange} className="sr-only" />
                        {o.l}
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
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Last Name *</label>
                    <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange}
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] transition-colors" placeholder="Enter last name" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      {formData.isInternational ? 'WhatsApp Number *' : 'WhatsApp Number *'}
                    </label>
                    <div className="relative">
                      {formData.isInternational ? (
                        <select name="countryCode" value={formData.countryCode} onChange={handleChange}
                          className="absolute left-0 top-0 bottom-0 w-20 border-0 border-r border-slate-300 rounded-l-xl bg-slate-50 text-sm px-2 focus:ring-0 focus:border-[#0A75BB] appearance-auto">
                          <option value="">Code</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+971">🇦🇪 +971</option>
                          <option value="+966">🇸🇦 +966</option>
                          <option value="+974">🇶🇦 +974</option>
                          <option value="+973">🇧🇭 +973</option>
                          <option value="+968">🇴🇲 +968</option>
                          <option value="+965">🇰🇼 +965</option>
                          <option value="+92">🇵🇰 +92</option>
                          <option value="+880">🇧🇩 +880</option>
                          <option value="+94">🇱🇰 +94</option>
                          <option value="+977">🇳🇵 +977</option>
                          <option value="+95">🇲🇲 +95</option>
                          <option value="+60">🇲🇾 +60</option>
                          <option value="+65">🇸🇬 +65</option>
                          <option value="+61">🇦🇺 +61</option>
                          <option value="+64">🇳🇿 +64</option>
                          <option value="+27">🇿🇦 +27</option>
                          <option value="+234">🇳🇬 +234</option>
                          <option value="+254">🇰🇪 +254</option>
                          <option value="+20">🇪🇬 +20</option>
                          <option value="+212">🇲🇦 +212</option>
                          <option value="+251">🇪🇹 +251</option>
                          <option value="+256">🇺🇬 +256</option>
                          <option value="+255">🇹🇿 +255</option>
                          <option value="+63">🇵🇭 +63</option>
                          <option value="+62">🇮🇩 +62</option>
                          <option value="+66">🇹🇭 +66</option>
                          <option value="+84">🇻🇳 +84</option>
                          <option value="+855">🇰🇭 +855</option>
                          <option value="+856">🇱🇦 +856</option>
                          <option value="+91">🇮🇳 +91</option>
                          <option value="+86">🇨🇳 +86</option>
                          <option value="+81">🇯🇵 +81</option>
                          <option value="+82">🇰🇷 +82</option>
                          <option value="+49">🇩🇪 +49</option>
                          <option value="+33">🇫🇷 +33</option>
                          <option value="+39">🇮🇹 +39</option>
                          <option value="+34">🇪🇸 +34</option>
                          <option value="+31">🇳🇱 +31</option>
                          <option value="+46">🇸🇪 +46</option>
                          <option value="+47">🇳🇴 +47</option>
                          <option value="+45">🇩🇰 +45</option>
                          <option value="+358">🇫🇮 +358</option>
                          <option value="+41">🇨🇭 +41</option>
                          <option value="+43">🇦🇹 +43</option>
                          <option value="+32">🇧🇪 +32</option>
                          <option value="+48">🇵🇱 +48</option>
                          <option value="+420">🇨🇿 +420</option>
                          <option value="+421">🇸🇰 +421</option>
                          <option value="+36">🇭🇺 +36</option>
                          <option value="+40">🇷🇴 +40</option>
                          <option value="+359">🇧🇬 +359</option>
                          <option value="+385">🇭🇷 +385</option>
                          <option value="+381">🇷🇸 +381</option>
                          <option value="+389">🇲🇰 +389</option>
                          <option value="+355">🇦🇱 +355</option>
                          <option value="+386">🇸🇮 +386</option>
                          <option value="+370">🇱🇹 +370</option>
                          <option value="+371">🇱🇻 +371</option>
                          <option value="+372">🇪🇪 +372</option>
                        </select>
                      ) : (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">+91</span>
                      )}
                      <input type="tel" name="phone" required value={formData.phone} onChange={handleChange}
                        className={cn(
                          "w-full border border-slate-300 rounded-xl py-2.5 text-sm focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] transition-colors",
                          formData.isInternational ? 'pl-24 pr-4' : 'pl-12 pr-4'
                        )} placeholder={formData.isInternational ? 'WhatsApp number with country code' : '98182 35613'} />
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

                {/* International Patient Fields */}
                {formData.isInternational && (
                  <div className="border-t border-slate-200 pt-4 mt-4 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-5 w-5 text-purple-500" />
                      <h3 className="font-bold text-slate-900">International Patient Details</h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
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
                          <option value="">Select timezone</option>
                          <option value="IST">IST (India, UTC+5:30)</option>
                          <option value="GST">GST (UAE, UTC+4)</option>
                          <option value="AST">AST (Saudi Arabia, UTC+3)</option>
                          <option value="GMT">GMT (UK, UTC+0)</option>
                          <option value="CET">CET (Central Europe, UTC+1)</option>
                          <option value="EST">EST (US East, UTC-5)</option>
                          <option value="CST">CST (US Central, UTC-6)</option>
                          <option value="PST">PST (US West, UTC-8)</option>
                          <option value="AEST">AEST (Australia East, UTC+10)</option>
                          <option value="NZST">NZST (New Zealand, UTC+12)</option>
                          <option value="SGT">SGT (Singapore, UTC+8)</option>
                          <option value="JST">JST (Japan, UTC+9)</option>
                          <option value="KST">KST (Korea, UTC+9)</option>
                          <option value="PKT">PKT (Pakistan, UTC+5)</option>
                          <option value="BDT">BDT (Bangladesh, UTC+6)</option>
                          <option value="SLST">SLST (Sri Lanka, UTC+5:30)</option>
                          <option value="NPT">NPT (Nepal, UTC+5:45)</option>
                          <option value="WAT">WAT (West Africa, UTC+1)</option>
                          <option value="EAT">EAT (East Africa, UTC+3)</option>
                          <option value="SAST">SAST (South Africa, UTC+2)</option>
                        </select>
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
                <button type="button" onClick={() => setStep(2)} className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                  Back
                </button>
                <button type="button" onClick={() => canNext() && setStep(4)} disabled={!canNext()}
                  className="px-8 py-3 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] transition-colors disabled:opacity-50 flex items-center gap-2">
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Date & Time */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Preferred Date & Time</h2>
                <p className="text-sm text-slate-500">Select your preferred appointment slot</p>
              </div>
              {selectedClinic && (
                <div className={cn(
                  'border-2 rounded-2xl p-4 flex items-center gap-4',
                  formData.clinicId === 'online' ? 'border-emerald-200 bg-emerald-50' : 'border-blue-200 bg-blue-50'
                )}>
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center',
                    formData.clinicId === 'online' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'
                  )}>
                    {formData.clinicId === 'online' ? <Video className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{selectedClinic.name}</p>
                    <p className="text-xs text-slate-500">{selectedClinic.timing} • ₹{selectedClinic.fee}</p>
                  </div>
                </div>
              )}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Date *</label>
                    <input type="date" name="date" required min={today} max={maxDate || undefined} value={formData.date} onChange={handleChange}
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] transition-colors" />
                    {maxDate && <p className="text-[11px] text-slate-400 mt-1">Book up to {bookingSettings?.rules.maxAdvanceBookingDays || 30} days in advance</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Time Slot *</label>
                    <select name="time" required value={formData.time} onChange={handleChange}
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] transition-colors"
                      disabled={isHoliday}>
                      <option value="">{isHoliday ? 'No slots on holiday' : 'Choose time slot'}</option>
                      {availableSlots.map((slot) => {
                        const isBooked = bookedSlots.has(slot.replace(/\s+/g, '').toUpperCase());
                        return (
                          <option key={slot} value={slot} disabled={isBooked}>
                            {slot}{isBooked ? ' — Booked' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                {isHoliday && (
                  <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 text-center space-y-3">
                    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                      <AlertTriangle className="h-7 w-7 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-red-800">Doctor is on Leave</h3>
                    <p className="text-sm text-red-600">Appointments are not available on this date.</p>
                    <div className="bg-white border border-red-200 rounded-xl p-4 mt-3">
                      <p className="text-sm font-semibold text-gray-900 mb-2">For Emergency / Urgent Consultation</p>
                      <a href="tel:9818235688" className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors mr-2">
                        <Phone className="h-4 w-4" /> Call: 9818235688
                      </a>
                      <a href="tel:9818235613" className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors">
                        <Phone className="h-4 w-4" /> Call: 9818235613
                      </a>
                    </div>
                  </div>
                )}
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
            </div>
          )}

          {/* Step 5: Medical Info & Submit */}
          {step === 5 && (
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
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Medications (if any)</label>
                  <input type="text" name="currentMedications" value={formData.currentMedications} onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] transition-colors"
                    placeholder="e.g. Amlodipine 5mg, Metformin 500mg" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Additional Notes</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] transition-colors resize-none"
                    placeholder="Any specific concerns or information for the doctor" />
                </div>
              </div>

              {/* Online Extra Fields */}
              {(formData.consultationType === 'online' || formData.consultationType === 'online_intl') && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-5 w-5 text-[#0A75BB]" />
                    <h3 className="font-bold text-gray-900">Medical Details for Online Consultation</h3>
                  </div>
                  <p className="text-xs text-slate-500 -mt-3">Required for video consultation — helps Dr Goel prepare</p>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">1. Patient&apos;s Complaints *</label>
                    <p className="text-xs text-slate-400 mb-2">Describe symptoms, when they started, and triggers</p>
                    <textarea name="complaints" required value={formData.complaints} onChange={handleChange} rows={4}
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
                          <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 10MB each</p>
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
                    <p className="text-xs text-slate-400 mb-2">List all medicines with generic names if possible</p>
                    <textarea name="medicines" required value={formData.medicines} onChange={handleChange} rows={4}
                      className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] transition-colors resize-none"
                      placeholder="e.g. Amlodipine 5mg (Amlodipine), Telmisartan 40mg..." />
                  </div>
                </div>
              )}

              {/* Fee Summary */}
              <div className="bg-gradient-to-r from-[#0A75BB] to-[#085D94] rounded-2xl p-5 text-white">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/80 font-medium">Consultation Fee</span>
                  <span className="text-3xl font-bold">{formData.consultationType === 'online_intl' ? '$20' : `₹${consultFee}`}</span>
                </div>
                <p className="text-xs text-white/60">
                  {formData.consultationType === 'hospital' ? 'Pay at PSRI Hospital during your visit' :
                   formData.consultationType === 'online_intl' ? 'Pay via international bank transfer or PayPal' :
                   'Pay now via UPI or pay at clinic'}
                </p>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(4)} className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                  Back
                </button>
                <button type="submit" className="px-10 py-3.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 flex items-center gap-2 text-lg">
                  <CheckCircle2 className="h-5 w-5" /> Confirm Appointment
                </button>
              </div>

              <p className="text-xs text-slate-400 text-center">
                By booking, you agree to our terms. Your data is kept confidential and used only for medical purposes.
              </p>
            </div>
          )}
        </form>
      </div>

      {/* Trust Footer */}
      <div className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Shield, label: '100% Confidential', sub: 'Your data is secure' },
              { icon: Award, label: '15+ Years Experience', sub: 'Trusted by 5000+ patients' },
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
              <a
                href={`/emr/consultation/consult-obp-${duplicateAppt.bookingId}`}
                className="w-full py-2.5 bg-[#0A75BB] text-white font-semibold rounded-xl text-sm text-center hover:bg-[#085D94] transition-colors"
              >
                View Appointment
              </a>
              <button
                onClick={() => { setDuplicateAppt(null); setDuplicateType(null); }}
                className="w-full py-2.5 bg-amber-500 text-white font-semibold rounded-xl text-sm hover:bg-amber-600 transition-colors"
              >
                Reschedule
              </button>
              <button
                onClick={() => {
                  try {
                    const bookings = JSON.parse(localStorage.getItem('emr_bookings') || '[]');
                    const idx = bookings.findIndex((b: any) => b.bookingId === duplicateAppt.bookingId);
                    if (idx >= 0) {
                      bookings[idx].status = 'cancelled';
                      localStorage.setItem('emr_bookings', JSON.stringify(bookings));
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
              currency={formData.consultationType === 'online_intl' ? 'USD' : 'INR'}
              bookingId={`KN-${Date.now().toString(36).toUpperCase()}`}
              patientName={`${formData.firstName} ${formData.lastName}`}
              patientPhone={formData.phone}
              consultationType={selectedClinic?.name || 'Consultation'}
              onPaymentSuccess={async (pd) => await finalizeBooking(pd)}
              onPaymentFailed={(reason) => { setShowPaymentGateway(false); }}
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
