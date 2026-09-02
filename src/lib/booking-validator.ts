import { getItem } from '@/lib/client-storage';
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

export async function getStoredBookings(): Promise<Booking[]> {
  try {
    const res = await fetch('/api/bookings/list-public', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (Array.isArray(data) ? data : data.bookings || []) as Booking[];
  } catch {
    return [];
  }
}

async function getAllPatients(): Promise<EMRPatient[]> {
  const all: EMRPatient[] = [];
  try { all.push(...((await getItem('emr-added-patients')) as EMRPatient[] || [])); } catch {}
  return all;
}

/**
 * Rule 1 & 3: Check if patient already has an active booking for the same date
 */
async function checkPatientDuplicate(
  phone: string,
  date: string,
  excludeBookingId?: string
): Promise<ExistingAppointment | null> {
  const bookings = await getStoredBookings();
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
async function checkSlotConflict(
  clinicId: string,
  date: string,
  time: string,
  excludeBookingId?: string
): Promise<ExistingAppointment | null> {
  const tTime = time.replace(/\s+/g, '').toUpperCase();

  // Check localStorage bookings
  const bookings = await getStoredBookings();
  const localMatch = bookings.find((b) => {
    if (excludeBookingId && b.bookingId === excludeBookingId) return false;
    if (b.date !== date) return false;
    if (!isActiveStatus(b.status)) return false;
    if (b.clinicId !== clinicId) return false;
    return b.time.replace(/\s+/g, '').toUpperCase() === tTime;
  });
  if (localMatch) {
    return {
      bookingId: localMatch.bookingId,
      patientName: `${localMatch.firstName} ${localMatch.lastName}`,
      clinicName: getClinicName(localMatch.clinicId),
      doctorName: localMatch.doctorName || 'Dr. Rajesh Goel',
      date: localMatch.date,
      time: localMatch.time,
      status: localMatch.status,
      clinicId: localMatch.clinicId,
      phone: localMatch.phone,
    };
  }

  // Also check EMR appointments table via API
  try {
    const res = await fetch(`/api/slots/booked?date=${date}&clinicId=${clinicId}`);
    const data: { booked?: string[] } = await res.json();
    const booked = (data.booked || []).map(t => t.replace(/\s+/g, '').toUpperCase());
    if (booked.includes(tTime)) {
      return {
        bookingId: 'emr-' + Date.now(),
        patientName: 'Existing patient',
        clinicName: getClinicName(clinicId),
        doctorName: 'Dr. Rajesh Goel',
        date,
        time,
        status: 'WAITING',
        clinicId,
        phone: '',
      };
    }
  } catch { /* ignore */ }

  return null;
}

/**
 * Full validation: returns the first blocking issue found
 */
export async function validateBooking(
  phone: string,
  clinicId: string,
  date: string,
  time: string,
  excludeBookingId?: string
): Promise<ValidationResult> {
  // Rule 1 & 3: Same patient + same date
  const patientDup = await checkPatientDuplicate(phone, date, excludeBookingId);
  if (patientDup) {
    return {
      allowed: false,
      reason: 'duplicate_patient',
      existing: patientDup,
      message: `This patient already has an appointment for ${date}.`,
    };
  }

  // Rule 2 & 4: Same slot (doctor + clinic + date + time)
  const slotDup = await checkSlotConflict(clinicId, date, time, excludeBookingId);
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
