// Consultation data mapper - bridges EMRConsultation format to/from API format

import { consultationsApi, patientsApi } from '@/lib/api-client';
import type { EMRConsultation, EMRPatient } from '@/types/emr';

// Map API consultation response to EMRConsultation format
export function apiConsultationToEMR(apiConsult: any, patient?: any): EMRConsultation {
  const patientData = apiConsult.patient || patient;
  return {
    id: apiConsult.id,
    patientId: apiConsult.patient_id,
    clinicId: apiConsult.clinic_id || '',
    date: apiConsult.consultation_date || '',
    doctorName: apiConsult.doctor
      ? `Dr. ${apiConsult.doctor.first_name} ${apiConsult.doctor.last_name}`
      : 'Dr. Rajesh Goel',
    status: apiConsult.status || 'IN_PROGRESS',
    tokenId: apiConsult.token_id || '',
    chiefComplaint: apiConsult.chief_complaint || '',
    hpi: apiConsult.hpi || '',
    examination: apiConsult.examination || '',
    vitals: apiConsult.vitals ? {
      bloodPressure: apiConsult.vitals.blood_pressure_systolic
        ? `${apiConsult.vitals.blood_pressure_systolic}/${apiConsult.vitals.blood_pressure_diastolic || ''}`
        : '',
      pulse: apiConsult.vitals.heart_rate?.toString() || '',
      temperature: apiConsult.vitals.temperature?.toString() || '',
      spo2: apiConsult.vitals.oxygen_saturation?.toString() || '',
      weight: apiConsult.vitals.weight?.toString() || '',
      height: apiConsult.vitals.height?.toString() || '',
      bmi: apiConsult.vitals.bmi?.toString() || '',
    } : { bloodPressure: '', pulse: '', temperature: '', spo2: '', weight: '', height: '', bmi: '' },
    diagnoses: (apiConsult.diagnoses || []).map((d: any) => ({
      id: d.id,
      name: d.name,
      icdCode: d.icd_code || '',
      isPrimary: d.is_primary || false,
      notes: d.notes || '',
    })),
    prescriptions: (apiConsult.prescriptions || []).flatMap((rx: any) =>
      (rx.medicines || []).map((med: any) => ({
        id: med.id,
        name: med.medicine_name,
        dosage: med.dosage || '',
        frequency: med.frequency || '',
        duration: med.duration || '',
        instructions: med.instructions || '',
        strength: med.strength || '',
        when: med.when_to_take || '',
        genericName: med.generic_name || '',
        route: med.route || 'oral',
      }))
    ),
    investigations: (apiConsult.prescriptions || []).flatMap((rx: any) =>
      (rx.investigations || []).map((inv: any) => inv.test_name)
    ),
    advice: apiConsult.notes || '',
    notes: apiConsult.notes || '',
    followUpDate: apiConsult.follow_up_date || '',
  };
}

// Map API patient response to EMRPatient format
export function apiPatientToEMR(apiPatient: any): EMRPatient {
  return {
    id: apiPatient.id,
    firstName: apiPatient.first_name || '',
    lastName: apiPatient.last_name || '',
    phone: apiPatient.phone || '',
    email: apiPatient.email || '',
    dateOfBirth: apiPatient.date_of_birth || '',
    gender: apiPatient.gender || 'Male',
    bloodGroup: apiPatient.blood_group || '',
    uhid: apiPatient.uhid || '',
    clinicId: apiPatient.primary_clinic_id || '',
    abhaNumber: apiPatient.abha_number || '',
    address: apiPatient.addresses?.[0]?.address_line1 || '',
    city: apiPatient.addresses?.[0]?.city || '',
    state: apiPatient.addresses?.[0]?.state || '',
    pincode: apiPatient.addresses?.[0]?.pincode || '',
    emergencyContactName: apiPatient.emergency_contacts?.[0]?.name || '',
    emergencyContactPhone: apiPatient.emergency_contacts?.[0]?.phone || '',
    emergencyContactRelation: apiPatient.emergency_contacts?.[0]?.relation || '',
    allergies: (apiPatient.allergies || []).map((a: any) => a.allergen),
    medicalHistory: apiPatient.medical_history || '',
    isChronic: apiPatient.is_chronic || false,
    isActive: apiPatient.is_active !== false,
    createdAt: apiPatient.created_at || '',
    lastVisit: apiPatient.last_visit_date || '',
    totalVisits: apiPatient.total_visits || 0,
    familyMembers: (apiPatient.family_members || []).map((f: any) => ({
      name: f.name,
      relation: f.relation || '',
      phone: f.phone || '',
    })),
  };
}

// Load consultation from API with localStorage fallback
export async function loadConsultationFromApi(id: string, clinicId?: string): Promise<{ consultation: EMRConsultation | null; patient: EMRPatient | null }> {
  try {
    const data = await consultationsApi.get(id);
    if (data) {
      const consult = apiConsultationToEMR(data);
      if (clinicId && consult.clinicId && consult.clinicId !== clinicId) {
        return { consultation: null, patient: null };
      }
      return {
        consultation: consult,
        patient: data.patient ? apiPatientToEMR(data.patient) : null,
      };
    }
  } catch {
    // Fall through to localStorage
  }

  return { consultation: null, patient: null };
}

// Load patient from API with localStorage fallback
export async function loadPatientFromApi(patientId: string, clinicId?: string): Promise<EMRPatient | null> {
  try {
    const data = await patientsApi.get(patientId);
    if (data) {
      const patient = apiPatientToEMR(data);
      if (clinicId && patient.clinicId && patient.clinicId !== clinicId) {
        return null;
      }
      return patient;
    }
  } catch {
    // Fall through
  }
  return null;
}

// Save consultation to API (also saves to localStorage as backup)
export async function saveConsultationToApi(
  consultation: EMRConsultation,
  patientId: string,
  clinicId: string
): Promise<boolean> {
  const hasContent = consultation.prescriptions.length > 0 ||
    consultation.diagnoses.length > 0 ||
    consultation.advice ||
    consultation.chiefComplaint;

  if (!hasContent) return false;

  try {
    // Save via API
    if (consultation.id && !consultation.id.startsWith('consult-')) {
      // Existing consultation - update
      await consultationsApi.update(consultation.id, {
        chief_complaint: consultation.chiefComplaint,
        hpi: consultation.hpi,
        examination: consultation.examination,
        notes: consultation.advice || consultation.notes,
        follow_up_date: consultation.followUpDate,
        status: consultation.status,
      });
    } else {
      // New consultation - create
      const created = await consultationsApi.create({
        patient_id: patientId,
        doctor_id: '00000000-0000-0000-0000-000000000001', // default doctor
        clinic_id: clinicId,
        consultation_date: consultation.date || new Date().toISOString().split('T')[0],
        chief_complaint: consultation.chiefComplaint,
        hpi: consultation.hpi,
        examination: consultation.examination,
        notes: consultation.advice || consultation.notes,
        follow_up_date: consultation.followUpDate,
        status: consultation.status || 'IN_PROGRESS',
      });
      if (created) {
        // Don't mutate the original consultation ID - it's used as localStorage key
      }
    }

    // Also save to localStorage as backup
    saveConsultationToLocalStorage(consultation);
    return true;
  } catch {
    // Fallback: save to localStorage only
    saveConsultationToLocalStorage(consultation);
    return false;
  }
}

// Save to localStorage (existing logic)
function saveConsultationToLocalStorage(consultation: EMRConsultation) {
  try {
    const stored = JSON.parse(localStorage.getItem('emr_consultations') || '[]') as EMRConsultation[];
    const idx = stored.findIndex((c) => c.id === consultation.id);
    const updated = { ...consultation, updatedAt: new Date().toISOString() };
    if (idx >= 0) {
      stored[idx] = updated;
    } else {
      stored.push(updated);
    }
    localStorage.setItem('emr_consultations', JSON.stringify(stored));
  } catch { /* ignore */ }
}

// Search patients via API
export async function searchPatientsForConsultation(query: string): Promise<EMRPatient[]> {
  if (!query || query.length < 2) return [];
  try {
    const results = await patientsApi.search(query);
    return (results || []).map(apiPatientToEMR);
  } catch {
    return [];
  }
}
