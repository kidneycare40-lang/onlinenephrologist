import type { EMRPatient } from '@/types/emr';

interface Booking {
  bookingId: string;
  firstName: string;
  lastName: string;
  phone: string;
  clinicId: string;
  date: string;
  time: string;
  status: string;
  doctorName?: string;
  patientId?: string;
}

export interface ExistingAppointment {
  bookingId: string;
  patientName: string;
  clinicName: string;
  doctorName: string;
  date: string;
  time: string;
  status: string;
  clinicId: string;
  phone: string;
}

interface ValidationResult {
  allowed: boolean;
  reason: 'duplicate_patient' | 'slot_conflict' | 'ok';
  existing?: ExistingAppointment;
  message: string;
}

function getClinicName(clinicId: string): string {
  const map: Record<string, string> = {
    'kcc-faridabad': 'KCC Faridabad',
    'kcc-saket': 'KCC Saket',
    'psri-delhi': 'PSRI Hospital',
    'online': 'Online',
    'faridabad': 'KCC Faridabad',
    'psri': 'PSRI Hospital',
    'saket': 'KCC Saket',
  };
  return map[clinicId] || clinicId || 'Unknown';
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10);
}

export function isActiveStatus(status: string): boolean {
  const active = ['pending', 'confirmed', 'booked', 'waiting', 'WAITING', 'IN_PROGRESS', 'CONFIRMED'];
  return active.includes(status);
}

export function getStoredBookings(): Booking[] {
  try {
    return JSON.parse(localStorage.getItem('emr_bookings') || '[]');
  } catch {
    return [];
  }
}

function getAllPatients(): EMRPatient[] {
  const all: EMRPatient[] = [];
  try { all.push(...JSON.parse(localStorage.getItem('emr_added_patients') || '[]')); } catch {}
  return all;
}

/**
 * Rule 1 & 3: Check if patient already has an active booking for the same date
 */
function checkPatientDuplicate(
  phone: string,
  date: string,
  excludeBookingId?: string
): ExistingAppointment | null {
  const bookings = getStoredBookings();
  const searchPhone = normalizePhone(phone);
  const match = bookings.find((b) => {
    if (excludeBookingId && b.bookingId === excludeBookingId) return false;
    if (b.date !== date) return false;
    if (!isActiveStatus(b.status)) return false;
    const bPhone = normalizePhone(b.phone);
    return bPhone === searchPhone && searchPhone.length >= 5;
  });
  if (!match) return null;
  return {
    bookingId: match.bookingId,
    patientName: `${match.firstName} ${match.lastName}`,
    clinicName: getClinicName(match.clinicId),
    doctorName: match.doctorName || 'Dr. Rajesh Goel',
    date: match.date,
    time: match.time,
    status: match.status,
    clinicId: match.clinicId,
    phone: match.phone,
  };
}

/**
 * Rule 2 & 4: Check if the slot is already taken by any patient
 */
function checkSlotConflict(
  clinicId: string,
  date: string,
  time: string,
  excludeBookingId?: string
): ExistingAppointment | null {
  const bookings = getStoredBookings();
  const match = bookings.find((b) => {
    if (excludeBookingId && b.bookingId === excludeBookingId) return false;
    if (b.date !== date) return false;
    if (!isActiveStatus(b.status)) return false;
    // Normalize clinic IDs for comparison
    const bClinic = b.clinicId;
    const targetClinic = clinicId;
    if (bClinic !== targetClinic) return false;
    // Compare times (normalize)
    const bTime = b.time.replace(/\s+/g, '').toUpperCase();
    const tTime = time.replace(/\s+/g, '').toUpperCase();
    return bTime === tTime;
  });
  if (!match) return null;
  return {
    bookingId: match.bookingId,
    patientName: `${match.firstName} ${match.lastName}`,
    clinicName: getClinicName(match.clinicId),
    doctorName: match.doctorName || 'Dr. Rajesh Goel',
    date: match.date,
    time: match.time,
    status: match.status,
    clinicId: match.clinicId,
    phone: match.phone,
  };
}

/**
 * Full validation: returns the first blocking issue found
 */
export function validateBooking(
  phone: string,
  clinicId: string,
  date: string,
  time: string,
  excludeBookingId?: string
): ValidationResult {
  // Rule 1 & 3: Same patient + same date
  const patientDup = checkPatientDuplicate(phone, date, excludeBookingId);
  if (patientDup) {
    return {
      allowed: false,
      reason: 'duplicate_patient',
      existing: patientDup,
      message: `This patient already has an appointment for ${date}.`,
    };
  }

  // Rule 2 & 4: Same slot (doctor + clinic + date + time)
  const slotDup = checkSlotConflict(clinicId, date, time, excludeBookingId);
  if (slotDup) {
    return {
      allowed: false,
      reason: 'slot_conflict',
      existing: slotDup,
      message: `This slot is already booked. Please choose another slot.`,
    };
  }

  return { allowed: true, reason: 'ok', message: '' };
}
