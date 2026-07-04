import { getDb } from '../client';
import type {
  Clinic,
  ClinicCreate,
  User,
  UserCreate,
  Setting,
  SettingCreate,
  Letterhead,
  LetterheadCreate,
} from '../types';

// ============================================================
// Clinic Repository
// ============================================================

export class ClinicRepository {
  async findAll(): Promise<Clinic[]> {
    const { data, error } = await getDb()
      .from('clinics')
      .select('*')
      .eq('is_deleted', false)
      .order('name');

    if (error) return [];
    return (data || []) as Clinic[];
  }

  async findById(id: string): Promise<Clinic | null> {
    const { data, error } = await getDb()
      .from('clinics')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error) return null;
    return data as Clinic;
  }

  async findByShortName(shortName: string): Promise<Clinic | null> {
    const { data, error } = await getDb()
      .from('clinics')
      .select('*')
      .eq('short_name', shortName)
      .eq('is_deleted', false)
      .single();

    if (error) return null;
    return data as Clinic;
  }

  async create(data: ClinicCreate): Promise<Clinic | null> {
    const { data: clinic, error } = await getDb()
      .from('clinics')
      .insert(data)
      .select()
      .single();

    if (error) return null;
    return clinic as Clinic;
  }

  async update(id: string, data: Partial<ClinicCreate>): Promise<Clinic | null> {
    const { data: clinic, error } = await getDb()
      .from('clinics')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return null;
    return clinic as Clinic;
  }
}

// ============================================================
// User Repository
// ============================================================

export class UserRepository {
  async findAll(): Promise<User[]> {
    const { data, error } = await getDb()
      .from('users')
      .select('*')
      .eq('is_deleted', false)
      .order('first_name');

    if (error) return [];
    return (data || []) as User[];
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await getDb()
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error) return null;
    return data as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await getDb()
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_deleted', false)
      .single();

    if (error) return null;
    return data as User;
  }

  async findDoctors(clinicId?: string): Promise<User[]> {
    let query = getDb()
      .from('users')
      .select('*')
      .eq('role', 'DOCTOR')
      .eq('is_deleted', false)
      .order('first_name');

    if (clinicId) query = query.contains('clinic_ids', [clinicId]);

    const { data, error } = await query;
    if (error) return [];
    return (data || []) as User[];
  }

  async create(data: UserCreate): Promise<User | null> {
    const { data: user, error } = await getDb()
      .from('users')
      .insert(data)
      .select()
      .single();

    if (error) return null;
    return user as User;
  }

  async update(id: string, data: Partial<UserCreate>): Promise<User | null> {
    const { data: user, error } = await getDb()
      .from('users')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return null;
    return user as User;
  }
}

// ============================================================
// Setting Repository
// ============================================================

export class SettingRepository {
  async get(key: string, clinicId?: string): Promise<Setting | null> {
    let query = getDb()
      .from('settings')
      .select('*')
      .eq('key', key);

    if (clinicId) {
      query = query.or(`clinic_id.eq.${clinicId},clinic_id.is.null`);
    } else {
      query = query.is('clinic_id', null);
    }

    const { data, error } = await query.single();
    if (error) return null;
    return data as Setting;
  }

  async getMany(keys: string[], clinicId?: string): Promise<Record<string, any>> {
    let query = getDb()
      .from('settings')
      .select('key, value')
      .in('key', keys);

    if (clinicId) {
      query = query.or(`clinic_id.eq.${clinicId},clinic_id.is.null`);
    } else {
      query = query.is('clinic_id', null);
    }

    const { data, error } = await query;
    if (error) return {};

    const result: Record<string, any> = {};
    (data || []).forEach((s: any) => {
      result[s.key] = s.value;
    });
    return result;
  }

  async set(key: string, value: any, clinicId?: string): Promise<Setting | null> {
    const { data: existing } = await getDb()
      .from('settings')
      .select('id')
      .eq('key', key)
      .eq('clinic_id', clinicId || null)
      .single();

    if (existing) {
      const { data, error } = await getDb()
        .from('settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) return null;
      return data as Setting;
    }

    const { data, error } = await getDb()
      .from('settings')
      .insert({ key, value, clinic_id: clinicId || null })
      .select()
      .single();

    if (error) return null;
    return data as Setting;
  }

  async delete(key: string, clinicId?: string): Promise<boolean> {
    const { error } = await getDb()
      .from('settings')
      .delete()
      .eq('key', key)
      .eq('clinic_id', clinicId || null);

    return !error;
  }

  async getAll(clinicId?: string): Promise<Record<string, any>> {
    let query = getDb()
      .from('settings')
      .select('key, value');

    if (clinicId) {
      query = query.or(`clinic_id.eq.${clinicId},clinic_id.is.null`);
    } else {
      query = query.is('clinic_id', null);
    }

    const { data, error } = await query;
    if (error) return {};

    const result: Record<string, any> = {};
    (data || []).forEach((s: any) => {
      result[s.key] = s.value;
    });
    return result;
  }
}

// ============================================================
// Letterhead Repository
// ============================================================

export class LetterheadRepository {
  async findAll(clinicId?: string): Promise<Letterhead[]> {
    let query = getDb()
      .from('letterheads')
      .select('*')
      .eq('is_deleted', false);

    if (clinicId) query = query.eq('clinic_id', clinicId);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return [];
    return (data || []) as Letterhead[];
  }

  async findById(id: string): Promise<Letterhead | null> {
    const { data, error } = await getDb()
      .from('letterheads')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error) return null;
    return data as Letterhead;
  }

  async findActive(clinicId?: string): Promise<Letterhead | null> {
    let query = getDb()
      .from('letterheads')
      .select('*')
      .eq('is_active', true)
      .eq('is_deleted', false);

    if (clinicId) query = query.eq('clinic_id', clinicId);

    const { data, error } = await query.single();
    if (error) return null;
    return data as Letterhead;
  }

  async create(data: LetterheadCreate): Promise<Letterhead | null> {
    // Deactivate others for same clinic
    if (data.is_active && data.clinic_id) {
      await getDb()
        .from('letterheads')
        .update({ is_active: false })
        .eq('clinic_id', data.clinic_id)
        .eq('is_active', true);
    }

    const { data: lh, error } = await getDb()
      .from('letterheads')
      .insert(data)
      .select()
      .single();

    if (error) return null;
    return lh as Letterhead;
  }

  async update(id: string, data: Partial<LetterheadCreate>): Promise<Letterhead | null> {
    const { data: lh, error } = await getDb()
      .from('letterheads')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return null;
    return lh as Letterhead;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await getDb()
      .from('letterheads')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    return !error;
  }
}

// ============================================================
// Settings Service (orchestrates all settings-related repos)
// ============================================================

export class SettingsService {
  private clinicRepo = new ClinicRepository();
  private userRepo = new UserRepository();
  private settingRepo = new SettingRepository();
  private letterheadRepo = new LetterheadRepository();

  // --- Clinics ---
  async getClinics(): Promise<Clinic[]> { return this.clinicRepo.findAll(); }
  async getClinic(id: string): Promise<Clinic | null> { return this.clinicRepo.findById(id); }
  async createClinic(data: ClinicCreate): Promise<Clinic | null> { return this.clinicRepo.create(data); }
  async updateClinic(id: string, data: Partial<ClinicCreate>): Promise<Clinic | null> { return this.clinicRepo.update(id, data); }

  // --- Users ---
  async getUsers(): Promise<User[]> { return this.userRepo.findAll(); }
  async getDoctors(clinicId?: string): Promise<User[]> { return this.userRepo.findDoctors(clinicId); }
  async getUser(id: string): Promise<User | null> { return this.userRepo.findById(id); }
  async getUserByEmail(email: string): Promise<User | null> { return this.userRepo.findByEmail(email); }
  async createUser(data: UserCreate): Promise<User | null> { return this.userRepo.create(data); }
  async updateUser(id: string, data: Partial<UserCreate>): Promise<User | null> { return this.userRepo.update(id, data); }

  // --- Settings ---
  async getSetting(key: string, clinicId?: string): Promise<any> {
    const setting = await this.settingRepo.get(key, clinicId);
    return setting?.value ?? null;
  }

  async getSettings(keys: string[], clinicId?: string): Promise<Record<string, any>> {
    return this.settingRepo.getMany(keys, clinicId);
  }

  async setSetting(key: string, value: any, clinicId?: string): Promise<boolean> {
    const result = await this.settingRepo.set(key, value, clinicId);
    return !!result;
  }

  async getAllSettings(clinicId?: string): Promise<Record<string, any>> {
    return this.settingRepo.getAll(clinicId);
  }

  // --- Letterheads ---
  async getLetterheads(clinicId?: string): Promise<Letterhead[]> { return this.letterheadRepo.findAll(clinicId); }
  async getActiveLetterhead(clinicId?: string): Promise<Letterhead | null> { return this.letterheadRepo.findActive(clinicId); }
  async createLetterhead(data: LetterheadCreate): Promise<Letterhead | null> { return this.letterheadRepo.create(data); }
  async updateLetterhead(id: string, data: Partial<LetterheadCreate>): Promise<Letterhead | null> { return this.letterheadRepo.update(id, data); }
  async deleteLetterhead(id: string): Promise<boolean> { return this.letterheadRepo.delete(id); }
}

// Singleton
let _settingsService: SettingsService | null = null;
export function getSettingsService(): SettingsService {
  if (!_settingsService) _settingsService = new SettingsService();
  return _settingsService;
}
