import { BaseRepository } from './base-repository';
import { getDb } from '../client';
import type {
  Appointment,
  AppointmentCreate,
  AppointmentWithRelations,
  PaginatedResult,
  FilterParams,
  PaginationParams,
  SortParams,
} from '../types';

// ============================================================
// Appointment Repository
// ============================================================

export class AppointmentRepository extends BaseRepository<Appointment> {
  constructor() {
    super('appointments');
  }

  async findByIdWithRelations(id: string): Promise<AppointmentWithRelations | null> {
    const { data, error } = await this.db
      .from('appointments')
      .select(`
        *,
        patient:patients(id, first_name, last_name, phone, uhid, date_of_birth),
        doctor:users(id, first_name, last_name, qualification),
        clinic:clinics(id, name, short_name),
        consultation:consultations(id, status, consultation_date)
      `)
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error) return null;
    return data as AppointmentWithRelations;
  }

  async findByDateRange(startDate: string, endDate: string, doctorId?: string, clinicId?: string): Promise<AppointmentWithRelations[]> {
    let query = this.db
      .from('appointments')
      .select(`
        *,
        patient:patients(id, first_name, last_name, phone, uhid),
        doctor:users(id, first_name, last_name),
        clinic:clinics(id, name)
      `)
      .eq('is_deleted', false)
      .gte('appointment_date', startDate)
      .lte('appointment_date', endDate)
      .order('appointment_time', { ascending: true });

    if (doctorId) query = query.eq('doctor_id', doctorId);
    if (clinicId) query = query.eq('clinic_id', clinicId);

    const { data, error } = await query;
    if (error) return [];
    return (data || []) as AppointmentWithRelations[];
  }

  async findByPatient(patientId: string, limit = 20): Promise<AppointmentWithRelations[]> {
    const { data, error } = await this.db
      .from('appointments')
      .select(`
        *,
        doctor:users(id, first_name, last_name),
        clinic:clinics(id, name),
        consultation:consultations(id, status)
      `)
      .eq('patient_id', patientId)
      .eq('is_deleted', false)
      .order('appointment_date', { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data || []) as AppointmentWithRelations[];
  }

  async findByDoctorDate(doctorId: string, date: string): Promise<AppointmentWithRelations[]> {
    const { data, error } = await this.db
      .from('appointments')
      .select(`
        *,
        patient:patients(id, first_name, last_name, phone, uhid),
        clinic:clinics(id, name)
      `)
      .eq('doctor_id', doctorId)
      .eq('appointment_date', date)
      .eq('is_deleted', false)
      .order('appointment_time', { ascending: true });

    if (error) return [];
    return (data || []) as AppointmentWithRelations[];
  }

  async checkSlotConflict(doctorId: string, date: string, time: string, excludeId?: string): Promise<boolean> {
    let query = this.db
      .from('appointments')
      .select('id')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', date)
      .eq('appointment_time', time)
      .in('status', ['SCHEDULED', 'CONFIRMED', 'CHECKED_IN'])
      .eq('is_deleted', false);

    if (excludeId) query = query.neq('id', excludeId);

    const { data, error } = await query;
    if (error) return false;
    return (data || []).length > 0;
  }

  async countToday(doctorId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const { count } = await this.db
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('doctor_id', doctorId)
      .eq('appointment_date', today)
      .in('status', ['SCHEDULED', 'CONFIRMED', 'CHECKED_IN'])
      .eq('is_deleted', false);

    return count || 0;
  }
}

// ============================================================
// Appointment Service
// ============================================================

export class AppointmentService {
  private repo = new AppointmentRepository();

  async getById(id: string): Promise<AppointmentWithRelations | null> {
    return this.repo.findByIdWithRelations(id);
  }

  async list(params: {
    filters?: FilterParams;
    pagination?: PaginationParams;
    sort?: SortParams;
  } = {}): Promise<PaginatedResult<AppointmentWithRelations>> {
    const result = await this.repo.findMany(params);
    return result as PaginatedResult<AppointmentWithRelations>;
  }

  async getByDateRange(startDate: string, endDate: string, doctorId?: string, clinicId?: string): Promise<AppointmentWithRelations[]> {
    return this.repo.findByDateRange(startDate, endDate, doctorId, clinicId);
  }

  async getByPatient(patientId: string): Promise<AppointmentWithRelations[]> {
    return this.repo.findByPatient(patientId);
  }

  async getByDoctorAndDate(doctorId: string, date: string): Promise<AppointmentWithRelations[]> {
    return this.repo.findByDoctorDate(doctorId, date);
  }

  async create(data: AppointmentCreate, createdBy?: string): Promise<AppointmentWithRelations | null> {
    // Check slot conflict
    const hasConflict = await this.repo.checkSlotConflict(
      data.doctor_id,
      data.appointment_date,
      data.appointment_time,
    );

    if (hasConflict) {
      throw new Error('Slot already booked');
    }

    const appointment = await this.repo.create({
      ...data,
      status: data.status || 'SCHEDULED',
      created_by: createdBy,
    } as Partial<Appointment>);

    if (!appointment) return null;
    return this.repo.findByIdWithRelations(appointment.id);
  }

  async updateStatus(id: string, status: string): Promise<AppointmentWithRelations | null> {
    await this.repo.update(id, { status } as Partial<Appointment>);
    return this.repo.findByIdWithRelations(id);
  }

  async reschedule(id: string, newDate: string, newTime: string): Promise<AppointmentWithRelations | null> {
    const appointment = await this.repo.findById(id);
    if (!appointment) return null;

    // Check new slot
    const hasConflict = await this.repo.checkSlotConflict(
      appointment.doctor_id,
      newDate,
      newTime,
      id,
    );

    if (hasConflict) {
      throw new Error('New slot already booked');
    }

    await this.repo.update(id, {
      appointment_date: newDate,
      appointment_time: newTime,
      status: 'RESCHEDULED',
    } as Partial<Appointment>);

    return this.repo.findByIdWithRelations(id);
  }

  async cancel(id: string): Promise<AppointmentWithRelations | null> {
    await this.repo.update(id, { status: 'CANCELLED' } as Partial<Appointment>);
    return this.repo.findByIdWithRelations(id);
  }

  async delete(id: string): Promise<boolean> {
    return this.repo.softDelete(id);
  }

  async countToday(doctorId: string): Promise<number> {
    return this.repo.countToday(doctorId);
  }
}

// Singleton
let _appointmentService: AppointmentService | null = null;
export function getAppointmentService(): AppointmentService {
  if (!_appointmentService) _appointmentService = new AppointmentService();
  return _appointmentService;
}
