import { BaseRepository } from './base-repository';
import { getDb } from '../client';
import type {
  Consultation,
  ConsultationWithRelations,
  Diagnosis,
  DiagnosisCreate,
  Prescription,
  PrescriptionWithRelations,
  PrescriptionMedicine,
  PrescriptionMedicineCreate,
  PrescriptionInvestigation,
  Vitals,
  VitalsCreate,
  KidneyParameter,
  KidneyParameterCreate,
  InvestigationOrder,
  InvestigationOrderWithRelations,
  InvestigationItem,
  PaginatedResult,
  FilterParams,
  PaginationParams,
} from '../types';

// ============================================================
// Consultation Repository
// ============================================================

export class ConsultationRepository extends BaseRepository<Consultation> {
  constructor() {
    super('consultations');
  }

  async findByIdWithRelations(id: string): Promise<ConsultationWithRelations | null> {
    const { data, error } = await this.db
      .from('consultations')
      .select(`
        *,
        patient:patients(id, first_name, last_name, phone, uhid, date_of_birth, gender),
        doctor:users(id, first_name, last_name, qualification, registration_number),
        clinic:clinics(id, name, short_name),
        diagnoses:diagnoses(*),
        prescriptions:prescriptions(*, medicines:prescription_medicines(*)),
        vitals:vitals(*),
        kidney_parameters:kidney_parameters(*)
      `)
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error) return null;
    return data as ConsultationWithRelations;
  }

  async findByPatientId(patientId: string, limit = 20): Promise<ConsultationWithRelations[]> {
    const { data, error } = await this.db
      .from('consultations')
      .select(`
        *,
        doctor:users(id, first_name, last_name),
        clinic:clinics(id, name),
        diagnoses:diagnoses(*),
        prescriptions:prescriptions(id, prescription_number, prescription_date, status, medicines:prescription_medicines(medicine_name, dosage, frequency))
      `)
      .eq('patient_id', patientId)
      .eq('is_deleted', false)
      .order('consultation_date', { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data || []) as ConsultationWithRelations[];
  }

  async findByDoctorAndDate(doctorId: string, date: string): Promise<ConsultationWithRelations[]> {
    const { data, error } = await this.db
      .from('consultations')
      .select(`
        *,
        patient:patients(id, first_name, last_name, phone, uhid),
        diagnoses:diagnoses(*)
      `)
      .eq('doctor_id', doctorId)
      .eq('consultation_date', date)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (error) return [];
    return (data || []) as ConsultationWithRelations[];
  }
}

// ============================================================
// Diagnosis Repository
// ============================================================

export class DiagnosisRepository extends BaseRepository<Diagnosis> {
  constructor() {
    super('diagnoses');
  }

  async findByConsultationId(consultationId: string): Promise<Diagnosis[]> {
    const { data, error } = await this.db
      .from('diagnoses')
      .select('*')
      .eq('consultation_id', consultationId)
      .order('is_primary', { ascending: false });

    if (error) return [];
    return (data || []) as Diagnosis[];
  }

  async createManyForConsultation(consultationId: string, diagnoses: DiagnosisCreate[]): Promise<Diagnosis[]> {
    if (diagnoses.length === 0) return [];

    const records = diagnoses.map((d, i) => ({
      consultation_id: consultationId,
      ...d,
      is_primary: d.is_primary ?? (i === 0),
    }));

    const { data, error } = await this.db
      .from('diagnoses')
      .insert(records)
      .select();

    if (error) return [];
    return (data || []) as Diagnosis[];
  }

  async deleteByConsultationId(consultationId: string): Promise<void> {
    await this.db
      .from('diagnoses')
      .delete()
      .eq('consultation_id', consultationId);
  }
}

// ============================================================
// Prescription Repository
// ============================================================

export class PrescriptionRepository extends BaseRepository<Prescription> {
  constructor() {
    super('prescriptions');
  }

  async findByIdWithRelations(id: string): Promise<PrescriptionWithRelations | null> {
    const { data, error } = await this.db
      .from('prescriptions')
      .select(`
        *,
        patient:patients(id, first_name, last_name, phone, uhid, date_of_birth, gender),
        doctor:users(id, first_name, last_name, qualification, registration_number),
        clinic:clinics(id, name, short_name, parent_name),
        medicines:prescription_medicines(*),
        investigations:prescription_investigations(*)
      `)
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error) return null;
    return data as PrescriptionWithRelations;
  }

  async findByPatientId(patientId: string, limit = 20): Promise<PrescriptionWithRelations[]> {
    const { data, error } = await this.db
      .from('prescriptions')
      .select(`
        *,
        doctor:users(id, first_name, last_name),
        medicines:prescription_medicines(medicine_name, dosage, frequency, duration)
      `)
      .eq('patient_id', patientId)
      .eq('is_deleted', false)
      .order('prescription_date', { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data || []) as PrescriptionWithRelations[];
  }

  async findAllWithRelations(status?: string): Promise<PrescriptionWithRelations[]> {
    let query = this.db
      .from('prescriptions')
      .select(`
        *,
        patient:patients(id, first_name, last_name, phone, uhid, date_of_birth, gender),
        doctor:users(id, first_name, last_name, qualification),
        medicines:prescription_medicines(*),
        investigations:prescription_investigations(*)
      `)
      .eq('is_deleted', false)
      .order('prescription_date', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) return [];
    return (data || []) as PrescriptionWithRelations[];
  }

  async findTemplates(): Promise<Prescription[]> {
    const { data, error } = await this.db
      .from('prescriptions')
      .select('*')
      .eq('is_template', true)
      .eq('is_deleted', false)
      .order('template_name');

    if (error) return [];
    return (data || []) as Prescription[];
  }

  async createWithMedicines(
    prescription: {
      patient_id: string;
      doctor_id: string;
      clinic_id: string;
      consultation_id?: string | null;
      prescription_date: string;
      notes?: string | null;
      diagnosis?: string | null;
      advice?: string | null;
      follow_up_date?: string | null;
      is_template?: boolean;
      template_name?: string | null;
      template_category?: string | null;
      status?: string;
      created_by?: string | null;
    },
    medicines: PrescriptionMedicineCreate[],
    investigations?: string[]
  ): Promise<PrescriptionWithRelations | null> {
    // Generate prescription number
    const rxNumber = await this.generatePrescriptionNumber();

    const { data: rx, error: rxError } = await this.db
      .from('prescriptions')
      .insert({ ...prescription, prescription_number: rxNumber })
      .select()
      .single();

    if (rxError || !rx) return null;

    // Insert medicines
    if (medicines.length > 0) {
      const medRecords = medicines.map((m, i) => ({
        prescription_id: rx.id,
        ...m,
        sort_order: m.sort_order ?? i,
      }));
      await this.db.from('prescription_medicines').insert(medRecords);
    }

    // Insert investigations
    if (investigations && investigations.length > 0) {
      const invRecords = investigations.map((name, i) => ({
        prescription_id: rx.id,
        test_name: name,
        sort_order: i,
      }));
      await this.db.from('prescription_investigations').insert(invRecords);
    }

    return this.findByIdWithRelations(rx.id);
  }

  private async generatePrescriptionNumber(): Promise<string> {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const { count } = await this.db
      .from('prescriptions')
      .select('id', { count: 'exact', head: true });

    return `RX-${today}-${String((count || 0) + 1).padStart(4, '0')}`;
  }
}

// ============================================================
// Vitals Repository
// ============================================================

export class VitalsRepository extends BaseRepository<Vitals> {
  constructor() {
    super('vitals');
  }

  async findLatestByPatient(patientId: string): Promise<Vitals | null> {
    const { data, error } = await this.db
      .from('vitals')
      .select('*')
      .eq('patient_id', patientId)
      .eq('is_deleted', false)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    if (error) return null;
    return data as Vitals;
  }

  async findByPatientHistory(patientId: string, limit = 50): Promise<Vitals[]> {
    const { data, error } = await this.db
      .from('vitals')
      .select('*')
      .eq('patient_id', patientId)
      .eq('is_deleted', false)
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data || []) as Vitals[];
  }
}

// ============================================================
// Kidney Parameters Repository
// ============================================================

export class KidneyParameterRepository extends BaseRepository<KidneyParameter> {
  constructor() {
    super('kidney_parameters');
  }

  async findLatestByPatient(patientId: string): Promise<KidneyParameter | null> {
    const { data, error } = await this.db
      .from('kidney_parameters')
      .select('*')
      .eq('patient_id', patientId)
      .eq('is_deleted', false)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    if (error) return null;
    return data as KidneyParameter;
  }

  async findTrendByPatient(patientId: string, limit = 20): Promise<KidneyParameter[]> {
    const { data, error } = await this.db
      .from('kidney_parameters')
      .select('*')
      .eq('patient_id', patientId)
      .eq('is_deleted', false)
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data || []) as KidneyParameter[];
  }
}

// ============================================================
// Investigation Repository
// ============================================================

export class InvestigationRepository extends BaseRepository<InvestigationOrder> {
  constructor() {
    super('investigation_orders');
  }

  async findByIdWithItems(id: string): Promise<InvestigationOrderWithRelations | null> {
    const { data, error } = await this.db
      .from('investigation_orders')
      .select(`
        *,
        patient:patients(id, first_name, last_name, uhid),
        doctor:users(id, first_name, last_name),
        items:investigation_items(*)
      `)
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error) return null;
    return data as InvestigationOrderWithRelations;
  }

  async findByPatientId(patientId: string, limit = 20): Promise<InvestigationOrderWithRelations[]> {
    const { data, error } = await this.db
      .from('investigation_orders')
      .select(`
        *,
        doctor:users(id, first_name, last_name),
        items:investigation_items(test_name, result_value, unit, is_abnormal, status)
      `)
      .eq('patient_id', patientId)
      .eq('is_deleted', false)
      .order('order_date', { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data || []) as InvestigationOrderWithRelations[];
  }
}

// ============================================================
// Consultation Service (orchestrates all consultation-related repos)
// ============================================================

export class ConsultationService {
  private consultationRepo = new ConsultationRepository();
  private diagnosisRepo = new DiagnosisRepository();
  private vitalsRepo = new VitalsRepository();
  private kidneyRepo = new KidneyParameterRepository();
  private prescriptionRepo = new PrescriptionRepository();

  async getById(id: string): Promise<ConsultationWithRelations | null> {
    return this.consultationRepo.findByIdWithRelations(id);
  }

  async getByPatient(patientId: string, limit = 20): Promise<ConsultationWithRelations[]> {
    return this.consultationRepo.findByPatientId(patientId, limit);
  }

  async getByDoctorAndDate(doctorId: string, date: string): Promise<ConsultationWithRelations[]> {
    return this.consultationRepo.findByDoctorAndDate(doctorId, date);
  }

  async create(data: {
    patient_id: string;
    doctor_id: string;
    clinic_id: string;
    appointment_id?: string;
    chief_complaint?: string;
    hpi?: string;
    examination?: string;
    notes?: string;
    follow_up_date?: string;
    diagnoses?: DiagnosisCreate[];
    vitals?: VitalsCreate;
    kidney_parameters?: KidneyParameterCreate;
    createdBy?: string;
  }): Promise<ConsultationWithRelations | null> {
    const consultation = await this.consultationRepo.create({
      patient_id: data.patient_id,
      doctor_id: data.doctor_id,
      clinic_id: data.clinic_id,
      appointment_id: data.appointment_id || null,
      consultation_date: new Date().toISOString().split('T')[0],
      status: 'IN_PROGRESS',
      chief_complaint: data.chief_complaint || null,
      hpi: data.hpi || null,
      examination: data.examination || null,
      notes: data.notes || null,
      follow_up_date: data.follow_up_date || null,
      created_by: data.createdBy,
    } as Partial<Consultation>);

    if (!consultation) return null;

    // Add diagnoses
    if (data.diagnoses && data.diagnoses.length > 0) {
      await this.diagnosisRepo.createManyForConsultation(consultation.id, data.diagnoses);
    }

    // Add vitals
    if (data.vitals) {
      await this.vitalsRepo.create({
        ...data.vitals,
        patient_id: data.patient_id,
        consultation_id: consultation.id,
      } as Partial<Vitals>);
    }

    // Add kidney parameters
    if (data.kidney_parameters) {
      await this.kidneyRepo.create({
        ...data.kidney_parameters,
        patient_id: data.patient_id,
        consultation_id: consultation.id,
      } as Partial<KidneyParameter>);
    }

    return this.consultationRepo.findByIdWithRelations(consultation.id);
  }

  async update(id: string, data: {
    chief_complaint?: string;
    hpi?: string;
    examination?: string;
    notes?: string;
    follow_up_date?: string;
    status?: string;
    diagnoses?: DiagnosisCreate[];
  }): Promise<ConsultationWithRelations | null> {
    await this.consultationRepo.update(id, {
      chief_complaint: data.chief_complaint,
      hpi: data.hpi,
      examination: data.examination,
      notes: data.notes,
      follow_up_date: data.follow_up_date,
      status: data.status,
    } as Partial<Consultation>);

    // Replace diagnoses if provided
    if (data.diagnoses) {
      await this.diagnosisRepo.deleteByConsultationId(id);
      if (data.diagnoses.length > 0) {
        await this.diagnosisRepo.createManyForConsultation(id, data.diagnoses);
      }
    }

    return this.consultationRepo.findByIdWithRelations(id);
  }

  async complete(id: string): Promise<ConsultationWithRelations | null> {
    await this.consultationRepo.update(id, { status: 'COMPLETED' } as Partial<Consultation>);
    return this.consultationRepo.findByIdWithRelations(id);
  }

  async delete(id: string): Promise<boolean> {
    return this.consultationRepo.softDelete(id);
  }

  async getPatientVitalsHistory(patientId: string, limit = 50): Promise<Vitals[]> {
    return this.vitalsRepo.findByPatientHistory(patientId, limit);
  }

  async getPatientKidneyTrend(patientId: string, limit = 20): Promise<KidneyParameter[]> {
    return this.kidneyRepo.findTrendByPatient(patientId, limit);
  }

  async getPrescriptionHistory(patientId: string, limit = 20): Promise<PrescriptionWithRelations[]> {
    return this.prescriptionRepo.findByPatientId(patientId, limit);
  }
}

// Singleton
let _consultationService: ConsultationService | null = null;
export function getConsultationService(): ConsultationService {
  if (!_consultationService) _consultationService = new ConsultationService();
  return _consultationService;
}
