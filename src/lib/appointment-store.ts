import { getItem, setItem, removeItem } from '@/lib/client-storage';

const APPOINTMENTS_KEY = 'emr-appointments';
const SLOT_LOCKS_KEY = 'emr-slot-locks';

export type AppointmentType = 'clinic' | 'hospital' | 'online' | 'international';
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  type: AppointmentType;
  clinicName: string;
  date: string; // YYYY-MM-DD
  time: string;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  fee: number;
  paid: boolean;
  // International patient fields
  countryCode?: string;
  timezone?: string;
  whatsappNumber?: string;
  preferredLanguage?: string;
  interpreterRequired?: boolean;
  // Reports
  reports?: string[];
  // Created
  createdAt: string;
  updatedAt: string;
}

export interface SlotLock {
  slotKey: string; // type-date-time
  lockedBy: string; // patientId
  lockedAt: number; // timestamp
  expiresAt: number;
}

// Get all appointments
async function getAppointments(): Promise<Appointment[]> {
  try {
    const stored = await getItem(APPOINTMENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

async function saveAppointments(appts: Appointment[]): Promise<void> {
  await setItem(APPOINTMENTS_KEY, JSON.stringify(appts));
}

// Get appointments for a patient
export async function getPatientAppointments(patientId: string): Promise<Appointment[]> {
  return (await getAppointments()).filter((a) => a.patientId === patientId);
}

// Get upcoming appointments for a patient
export async function getUpcomingAppointments(patientId: string): Promise<Appointment[]> {
  const today = new Date().toISOString().split('T')[0];
  return (await getAppointments())
    .filter((a) => a.patientId === patientId && a.date >= today && ['pending', 'confirmed'].includes(a.status))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}

// Get past appointments for a patient
export async function getPastAppointments(patientId: string): Promise<Appointment[]> {
  const today = new Date().toISOString().split('T')[0];
  return (await getAppointments())
    .filter((a) => a.patientId === patientId && (a.date < today || ['completed', 'cancelled'].includes(a.status)))
    .sort((a, b) => b.date.localeCompare(a.date));
}

// Check for duplicate booking
export async function hasDuplicateBooking(patientId: string, type: AppointmentType, date: string, time: string): Promise<Appointment | null> {
  const appts = await getAppointments();
  return appts.find(
    (a) =>
      a.patientId === patientId &&
      a.type === type &&
      a.date === date &&
      a.time === time &&
      ['pending', 'confirmed'].includes(a.status)
  ) || null;
}

// Check if slot is available (not booked by anyone)
export async function isSlotAvailable(type: AppointmentType, date: string, time: string): Promise<boolean> {
  const appts = await getAppointments();
  const booked = appts.some(
    (a) =>
      a.type === type &&
      a.date === date &&
      a.time === time &&
      ['pending', 'confirmed'].includes(a.status)
  );
  if (booked) return false;

  // Check slot locks
  const locks = await getSlotLocks();
  const slotKey = `${type}-${date}-${time}`;
  const lock = locks.find((l) => l.slotKey === slotKey);
  if (lock && Date.now() < lock.expiresAt) return false;

  return true;
}

// Lock a slot
export async function lockSlot(type: AppointmentType, date: string, time: string, patientId: string): Promise<boolean> {
  if (!(await isSlotAvailable(type, date, time))) return false;
  const locks = await getSlotLocks();
  const slotKey = `${type}-${date}-${time}`;

  // Remove expired locks
  const now = Date.now();
  const validLocks = locks.filter((l) => l.expiresAt > now);

  // Check if already locked by someone else
  const existing = validLocks.find((l) => l.slotKey === slotKey);
  if (existing && existing.lockedBy !== patientId) return false;

  validLocks.push({
    slotKey,
    lockedBy: patientId,
    lockedAt: now,
    expiresAt: now + 10 * 60 * 1000, // 10 minutes
  });

  await setItem(SLOT_LOCKS_KEY, JSON.stringify(validLocks));
  return true;
}

// Unlock a slot
export async function unlockSlot(type: AppointmentType, date: string, time: string, patientId: string): Promise<void> {
  const locks = await getSlotLocks();
  const slotKey = `${type}-${date}-${time}`;
  const filtered = locks.filter((l) => !(l.slotKey === slotKey && l.lockedBy === patientId));
  await setItem(SLOT_LOCKS_KEY, JSON.stringify(filtered));
}

// Get slot locks
async function getSlotLocks(): Promise<SlotLock[]> {
  try {
    const stored = await getItem(SLOT_LOCKS_KEY);
    if (!stored) return [];
    const locks: SlotLock[] = JSON.parse(stored);
    // Clean expired locks
    const now = Date.now();
    return locks.filter((l) => l.expiresAt > now);
  } catch {
    return [];
  }
}

// Create appointment
export async function createAppointment(data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
  // Check for duplicate
  const duplicate = await hasDuplicateBooking(data.patientId, data.type, data.date, data.time);
  if (duplicate) {
    throw new Error(`You already have an appointment on ${data.date} at ${data.time}. Status: ${duplicate.status}`);
  }

  // Check slot availability
  if (!(await isSlotAvailable(data.type, data.date, data.time))) {
    throw new Error('This slot is no longer available. Please choose a different time.');
  }

  const appts = await getAppointments();
  const appointment: Appointment = {
    ...data,
    id: `apt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  appts.push(appointment);
  await saveAppointments(appts);

  // Unlock the slot
  await unlockSlot(data.type, data.date, data.time, data.patientId);

  return appointment;
}

// Cancel appointment
export async function cancelAppointment(appointmentId: string): Promise<boolean> {
  const appts = await getAppointments();
  const idx = appts.findIndex((a) => a.id === appointmentId);
  if (idx === -1) return false;
  appts[idx].status = 'cancelled';
  appts[idx].updatedAt = new Date().toISOString();
  await saveAppointments(appts);
  return true;
}

// Reschedule appointment
export async function rescheduleAppointment(appointmentId: string, newDate: string, newTime: string): Promise<boolean> {
  const appts = await getAppointments();
  const idx = appts.findIndex((a) => a.id === appointmentId);
  if (idx === -1) return false;

  const apt = appts[idx];
  // Check new slot availability
  if (!(await isSlotAvailable(apt.type, newDate, newTime))) {
    throw new Error('This slot is not available.');
  }

  appts[idx].date = newDate;
  appts[idx].time = newTime;
  appts[idx].status = 'rescheduled';
  appts[idx].updatedAt = new Date().toISOString();
  await saveAppointments(appts);
  return true;
}

// Get all appointments (for doctor dashboard)
export async function getAllAppointments(): Promise<Appointment[]> {
  return await getAppointments();
}

// Get today's appointments
export async function getTodayAppointments(): Promise<Appointment[]> {
  const today = new Date().toISOString().split('T')[0];
  return (await getAppointments())
    .filter((a) => a.date === today && ['pending', 'confirmed'].includes(a.status))
    .sort((a, b) => a.time.localeCompare(b.time));
}
