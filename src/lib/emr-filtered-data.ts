'use client';

import { useClinic } from '@/lib/emr-clinic-context';
import { patients, consultations, todayAppointments } from '@/lib/data/emr-mock';

export function useFilteredData() {
  const { clinicId } = useClinic();

  const filteredPatients = clinicId
    ? patients.filter((p) => p.clinicId === clinicId)
    : [];

  const filteredConsultations = clinicId
    ? consultations.filter((c) => c.clinicId === clinicId)
    : [];

  const patientIds = new Set(filteredPatients.map((p) => p.id));

  const filteredAppointments = clinicId
    ? todayAppointments.filter((a) => patientIds.has(a.patientId))
    : [];

  return {
    clinicId,
    patients: filteredPatients,
    consultations: filteredConsultations,
    appointments: filteredAppointments,
  };
}
