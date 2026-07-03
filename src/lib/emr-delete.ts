'use client';

import { EMRPatient } from '@/types/emr';

const DELETED_PATIENTS_KEY = 'emr_deleted_patients';
const ADDED_PATIENTS_KEY = 'emr_added_patients';
const BOOKINGS_KEY = 'emr_bookings';

export function getDeletedPatientIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(DELETED_PATIENTS_KEY) || '[]');
  } catch { return []; }
}

export function markPatientDeleted(patientId: string): void {
  const deleted = getDeletedPatientIds();
  if (!deleted.includes(patientId)) {
    deleted.push(patientId);
    localStorage.setItem(DELETED_PATIENTS_KEY, JSON.stringify(deleted));
  }
}

export function isPatientDeleted(patientId: string): boolean {
  return getDeletedPatientIds().includes(patientId);
}

export function deleteAddedPatient(patientId: string): void {
  try {
    const patients: EMRPatient[] = JSON.parse(localStorage.getItem(ADDED_PATIENTS_KEY) || '[]');
    const filtered = patients.filter((p) => p.id !== patientId);
    localStorage.setItem(ADDED_PATIENTS_KEY, JSON.stringify(filtered));
  } catch { /* ignore */ }
}

export function deleteOnlineBooking(bookingId: string): void {
  try {
    const bookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
    const filtered = bookings.filter((b: { bookingId: string }) => b.bookingId !== bookingId);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(filtered));
  } catch { /* ignore */ }
}

export function filterDeletedPatients<T extends { id: string }>(patientList: T[]): T[] {
  const deleted = getDeletedPatientIds();
  if (deleted.length === 0) return patientList;
  return patientList.filter((p) => !deleted.includes(p.id));
}
