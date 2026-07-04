import { BaseRepository } from './base-repository';
import { getDb } from '../client';
import type {
  Patient,
  PatientCreate,
  PatientWithRelations,
  PatientSearchResult,
  PatientAddress,
  PatientAddressCreate,
  PatientEmergencyContact,
  PatientEmergencyContactCreate,
  PaginatedResult,
  FilterParams,
  PaginationParams,
  SortParams,
} from '../types';

// ============================================================
// Patient Repository
// ============================================================

export class PatientRepository extends BaseRepository<Patient> {
  constructor() {
    super('patients');
  }

  async findByUHID(uhid: string): Promise<Patient | null> {
    const { data, error } = await this.db
      .from('patients')
      .select('*')
      .eq('uhid', uhid)
      .eq('is_deleted', false)
      .single();

    if (error) return null;
    return data as Patient;
  }

  async findByPhone(phone: string): Promise<Patient | null> {
    const { data, error } = await this.db
      .from('patients')
      .select('*')
      .eq('phone', phone)
      .eq('is_deleted', false)
      .single();

    if (error) return null;
    return data as Patient;
  }

  async findByIdWithRelations(id: string): Promise<PatientWithRelations | null> {
    const { data, error } = await this.db
      .from('patients')
      .select(`
        *,
        addresses:patient_addresses(*),
        emergency_contacts:patient_emergency_contacts(*),
        family_members:patient_family_members(*),
        allergies:patient_allergies(*),
        medical_history_records:patient_medical_history(*),
        surgical_history:patient_surgical_history(*),
        social_history:patient_social_history(*),
        primary_clinic:clinics(id, name, short_name, parent_name)
      `)
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error) return null;
    return data as PatientWithRelations;
  }

  async searchPatients(query: string, limit = 20): Promise<PatientSearchResult[]> {
    if (!query || query.length < 2) return [];

    const searchLower = query.toLowerCase();
    const searchPhone = query.replace(/\D/g, '');

    const { data, error } = await this.db
      .from('patients')
      .select('id, uhid, first_name, last_name, phone, email, date_of_birth, gender, total_visits, last_visit_date')
      .eq('is_deleted', false)
      .or(
        `first_name.ilike.%${query}%,last_name.ilike.%${query}%,uhid.ilike.%${query}%,email.ilike.%${query}%` +
        (searchPhone.length >= 3 ? `,phone.ilike.%${searchPhone}%` : '')
      )
      .limit(limit);

    if (error) return [];
    return (data || []) as PatientSearchResult[];
  }

  async getManyWithRelations(params: {
    filters?: FilterParams;
    pagination?: PaginationParams;
    sort?: SortParams;
  } = {}): Promise<PaginatedResult<PatientWithRelations>> {
    const { filters = {}, pagination = {}, sort = {} } = params;
    const { page = 1, limit = 50 } = pagination;
    const { sortBy = 'created_at', sortOrder = 'desc' } = sort;
    const offset = (page - 1) * limit;

    let query = this.db
      .from('patients')
      .select(`
        *,
        primary_clinic:clinics(id, name, short_name)
      `, { count: 'exact' })
      .eq('is_deleted', false);

    if (filters.search) {
      const s = filters.search;
      const sp = s.replace(/\D/g, '');
      query = query.or(
        `first_name.ilike.%${s}%,last_name.ilike.%${s}%,uhid.ilike.%${s}%,email.ilike.%${s}%` +
        (sp.length >= 3 ? `,phone.ilike.%${sp}%` : '')
      );
    }
    if (filters.clinicId) {
      query = query.eq('primary_clinic_id', filters.clinicId);
    }

    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) return { data: [], total: 0, page, limit, totalPages: 0 };

    return {
      data: (data || []) as PatientWithRelations[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  async incrementVisitCount(patientId: string): Promise<void> {
    const { error } = await this.db.rpc('increment_patient_visits', { patient_id_param: patientId });
    if (error) {
      // Fallback: manual increment
      const { data } = await this.db
        .from('patients')
        .select('total_visits')
        .eq('id', patientId)
        .single();
      if (data) {
        await this.db
          .from('patients')
          .update({
            total_visits: (data.total_visits || 0) + 1,
            last_visit_date: new Date().toISOString().split('T')[0],
          })
          .eq('id', patientId);
      }
    }
  }
}

// ============================================================
// Patient Address Repository
// ============================================================

export class PatientAddressRepository extends BaseRepository<PatientAddress> {
  constructor() {
    super('patient_addresses');
  }

  async findByPatientId(patientId: string): Promise<PatientAddress[]> {
    const { data, error } = await this.db
      .from('patient_addresses')
      .select('*')
      .eq('patient_id', patientId)
      .order('is_primary', { ascending: false });

    if (error) return [];
    return (data || []) as PatientAddress[];
  }

  async upsert(patientId: string, address: PatientAddressCreate): Promise<PatientAddress | null> {
    // Check if exists
    const { data: existing } = await this.db
      .from('patient_addresses')
      .select('id')
      .eq('patient_id', patientId)
      .eq('type', address.type || 'current')
      .single();

    if (existing) {
      const { data, error } = await this.db
        .from('patient_addresses')
        .update({ ...address, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) return null;
      return data as PatientAddress;
    }

    const { data, error } = await this.db
      .from('patient_addresses')
      .insert({ ...address, patient_id: patientId })
      .select()
      .single();
    if (error) return null;
    return data as PatientAddress;
  }
}

// ============================================================
// Patient Emergency Contact Repository
// ============================================================

export class PatientEmergencyContactRepository extends BaseRepository<PatientEmergencyContact> {
  constructor() {
    super('patient_emergency_contacts');
  }

  async findByPatientId(patientId: string): Promise<PatientEmergencyContact[]> {
    const { data, error } = await this.db
      .from('patient_emergency_contacts')
      .select('*')
      .eq('patient_id', patientId)
      .order('is_primary', { ascending: false });

    if (error) return [];
    return (data || []) as PatientEmergencyContact[];
  }
}

// ============================================================
// Patient Service (orchestrates repositories)
// ============================================================

export class PatientService {
  private patientRepo = new PatientRepository();
  private addressRepo = new PatientAddressRepository();
  private contactRepo = new PatientEmergencyContactRepository();

  async getById(id: string): Promise<PatientWithRelations | null> {
    return this.patientRepo.findByIdWithRelations(id);
  }

  async getByUHID(uhid: string): Promise<PatientWithRelations | null> {
    const patient = await this.patientRepo.findByUHID(uhid);
    if (!patient) return null;
    return this.patientRepo.findByIdWithRelations(patient.id);
  }

  async getByPhone(phone: string): Promise<Patient | null> {
    return this.patientRepo.findByPhone(phone);
  }

  async search(query: string, limit = 20): Promise<PatientSearchResult[]> {
    return this.patientRepo.searchPatients(query, limit);
  }

  async list(params: {
    filters?: FilterParams;
    pagination?: PaginationParams;
    sort?: SortParams;
  } = {}): Promise<PaginatedResult<PatientWithRelations>> {
    return this.patientRepo.getManyWithRelations(params);
  }

  async create(data: PatientCreate, createdBy?: string): Promise<PatientWithRelations | null> {
    // Generate UHID
    const clinicPrefix = data.primary_clinic_id ? 'KCC' : 'KCC';
    const uhid = await this.generateUHID(clinicPrefix);

    const patientData = {
      ...data,
      uhid,
      total_visits: 0,
      is_active: true,
      country_code: data.country_code || '+91',
      preferred_language: data.preferred_language || 'English',
      created_by: createdBy,
    };

    const patient = await this.patientRepo.create(patientData as Partial<Patient>);
    if (!patient) return null;

    // Create address if provided
    if (data.address) {
      await this.addressRepo.upsert(patient.id, data.address);
    }

    // Create emergency contact if provided
    if (data.emergency_contact) {
      await this.contactRepo.create({
        patient_id: patient.id,
        ...data.emergency_contact,
      } as Partial<PatientEmergencyContact>);
    }

    return this.patientRepo.findByIdWithRelations(patient.id);
  }

  async update(id: string, data: Partial<PatientCreate>, updatedBy?: string): Promise<PatientWithRelations | null> {
    const { address, emergency_contact, ...patientData } = data;

    await this.patientRepo.update(id, {
      ...patientData,
      updated_by: updatedBy,
    } as Partial<Patient>);

    if (address) {
      await this.addressRepo.upsert(id, address);
    }

    return this.patientRepo.findByIdWithRelations(id);
  }

  async delete(id: string): Promise<boolean> {
    return this.patientRepo.softDelete(id);
  }

  async incrementVisitCount(patientId: string): Promise<void> {
    return this.patientRepo.incrementVisitCount(patientId);
  }

  async count(filters?: FilterParams): Promise<number> {
    return this.patientRepo.count(filters);
  }

  private async generateUHID(prefix: string): Promise<string> {
    const year = new Date().getFullYear();
    const { count } = await this.db
      .from('patients')
      .select('id', { count: 'exact', head: true });

    const seq = (count || 0) + 1;
    return `${prefix}-${year}-${String(seq).padStart(5, '0')}`;
  }

  private get db() {
    return getDb();
  }
}

// Singleton
let _patientService: PatientService | null = null;
export function getPatientService(): PatientService {
  if (!_patientService) _patientService = new PatientService();
  return _patientService;
}
