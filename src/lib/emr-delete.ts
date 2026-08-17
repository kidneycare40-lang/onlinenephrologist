'use client';

import { getItem, setItem } from '@/lib/client-storage';
import { EMRPatient } from '@/types/emr';

const DELETED_PATIENTS_KEY = 'emr-deleted-patients';
const ADDED_PATIENTS_KEY = 'emr-added-patients';
const BOOKINGS_KEY = 'emr-bookings';

export async function getDeletedPatientIds(): Promise<string[]> {
  if (typeof window === 'undefined') return [];
  try {
    return ((await getItem(DELETED_PATIENTS_KEY)) as string[]) || [];
  } catch { return []; }
}

export async function markPatientDeleted(patientId: string): Promise<void> {
  const deleted = await getDeletedPatientIds();
  if (!deleted.includes(patientId)) {
    deleted.push(patientId);
    await setItem(DELETED_PATIENTS_KEY, deleted);
  }
}

export async function isPatientDeleted(patientId: string): Promise<boolean> {
  return (await getDeletedPatientIds()).includes(patientId);
}

export async function deleteAddedPatient(patientId: string): Promise<void> {
  try {
    const patients = ((await getItem(ADDED_PATIENTS_KEY)) as EMRPatient[]) || [];
    const filtered = patients.filter((p) => p.id !== patientId);
    await setItem(ADDED_PATIENTS_KEY, filtered);
  } catch { /* ignore */ }
}

export async function deleteOnlineBooking(bookingId: string): Promise<void> {
  try {
    const bookings = ((await getItem(BOOKINGS_KEY)) as { bookingId: string }[]) || [];
    const filtered = bookings.filter((b) => b.bookingId !== bookingId);
    await setItem(BOOKINGS_KEY, filtered);
  } catch { /* ignore */ }
}

export async function filterDeletedPatients<T extends { id: string }>(patientList: T[]): Promise<T[]> {
  const deleted = await getDeletedPatientIds();
  if (deleted.length === 0) return patientList;
  return patientList.filter((p) => !deleted.includes(p.id));
}
