import { getDb } from '../client';
import type { PaginationParams, PaginatedResult, SortParams, FilterParams } from '../types';

// ============================================================
// Base Repository - Reusable CRUD operations
// ============================================================

export class BaseRepository<T> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  protected get db() {
    return getDb();
  }

  // --------------------------------------------------------
  // READ
  // --------------------------------------------------------

  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.db
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error) return null;
    return data as T;
  }

  async findByIdWithRelations(id: string, relations: string): Promise<T | null> {
    const { data, error } = await this.db
      .from(this.tableName)
      .select(relations)
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error) return null;
    return data as T;
  }

  async findMany(params: {
    filters?: FilterParams;
    pagination?: PaginationParams;
    sort?: SortParams;
    select?: string;
  } = {}): Promise<PaginatedResult<T>> {
    const { filters = {}, pagination = {}, sort = {}, select = '*' } = params;
    const { page = 1, limit = 50 } = pagination;
    const { sortBy = 'created_at', sortOrder = 'desc' } = sort;
    const offset = (page - 1) * limit;

    let query = this.db
      .from(this.tableName)
      .select(select, { count: 'exact' })
      .eq('is_deleted', false);

    // Apply filters
    if (filters.clinicId) {
      query = query.eq('clinic_id', filters.clinicId);
    }
    if (filters.doctorId) {
      query = query.eq('doctor_id', filters.doctorId);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    // Sort
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Paginate
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error(`Error fetching ${this.tableName}:`, error);
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }

    return {
      data: (data || []) as T[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  async count(filters?: FilterParams): Promise<number> {
    let query = this.db
      .from(this.tableName)
      .select('id', { count: 'exact', head: true })
      .eq('is_deleted', false);

    if (filters?.clinicId) query = query.eq('clinic_id', filters.clinicId);
    if (filters?.doctorId) query = query.eq('doctor_id', filters.doctorId);
    if (filters?.status) query = query.eq('status', filters.status);

    const { count, error } = await query;
    if (error) return 0;
    return count || 0;
  }

  // --------------------------------------------------------
  // CREATE
  // --------------------------------------------------------

  async create(data: Partial<T>): Promise<T | null> {
    const { data: result, error } = await this.db
      .from(this.tableName)
      .insert(data as any)
      .select()
      .single();

    if (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      return null;
    }
    return result as T;
  }

  async createMany(data: Partial<T>[]): Promise<T[]> {
    const { data: result, error } = await this.db
      .from(this.tableName)
      .insert(data as any)
      .select();

    if (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      return [];
    }
    return (result || []) as T[];
  }

  // --------------------------------------------------------
  // UPDATE
  // --------------------------------------------------------

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const { data: result, error } = await this.db
      .from(this.tableName)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      return null;
    }
    return result as T;
  }

  // --------------------------------------------------------
  // SOFT DELETE
  // --------------------------------------------------------

  async softDelete(id: string): Promise<boolean> {
    const { error } = await this.db
      .from(this.tableName)
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error(`Error soft-deleting ${this.tableName}:`, error);
      return false;
    }
    return true;
  }

  // --------------------------------------------------------
  // SEARCH (using ilike for text fields)
  // --------------------------------------------------------

  async search(query: string, columns: string[], limit = 20): Promise<T[]> {
    if (!query || query.length < 2) return [];

    const orFilters = columns.map((col) => `${col}.ilike.%${query}%`).join(',');

    const { data, error } = await this.db
      .from(this.tableName)
      .select('*')
      .eq('is_deleted', false)
      .or(orFilters)
      .limit(limit);

    if (error) return [];
    return (data || []) as T[];
  }
}
