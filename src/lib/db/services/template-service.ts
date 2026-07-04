// ============================================================
// Template Services
// Complaints, Diagnoses, Medicines, Investigations, Advice
// ============================================================

import { getDb } from '../client';
import type {
  ComplaintTemplate,
  DiagnosisTemplate,
  Medicine,
  MedicineTemplate,
  MedicineTemplateItem,
  InvestigationTemplate,
  InvestigationTemplateItem,
  AdviceTemplate,
  AdviceTemplateItem,
  TemplateFilterParams,
  MedicineSearchParams,
  PaginatedResult,
} from '../types';

// ============================================================
// COMPLAINT TEMPLATE SERVICE
// ============================================================
export class ComplaintTemplateService {
  static async list(filter: TemplateFilterParams = {}): Promise<ComplaintTemplate[]> {
    const db = getDb();
    let query = db
      .from('complaint_templates')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (filter.category) {
      query = query.eq('category', filter.category);
    }
    if (filter.clinicId) {
      query = query.or(`clinic_id.eq.${filter.clinicId},clinic_id.is.null`);
    }
    if (filter.search) {
      query = query.ilike('name', `%${filter.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async create(template: Partial<ComplaintTemplate>): Promise<ComplaintTemplate> {
    const db = getDb();
    const { data, error } = await db
      .from('complaint_templates')
      .insert(template)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async update(id: string, template: Partial<ComplaintTemplate>): Promise<ComplaintTemplate> {
    const db = getDb();
    const { data, error } = await db
      .from('complaint_templates')
      .update({ ...template, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const db = getDb();
    const { error } = await db
      .from('complaint_templates')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}

// ============================================================
// DIAGNOSIS TEMPLATE SERVICE
// ============================================================
export class DiagnosisTemplateService {
  static async list(filter: TemplateFilterParams = {}): Promise<DiagnosisTemplate[]> {
    const db = getDb();
    let query = db
      .from('diagnosis_templates')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (filter.category) {
      query = query.eq('category', filter.category);
    }
    if (filter.ckdStage) {
      query = query.eq('ckd_stage', filter.ckdStage);
    }
    if (filter.clinicId) {
      query = query.or(`clinic_id.eq.${filter.clinicId},clinic_id.is.null`);
    }
    if (filter.search) {
      query = query.ilike('name', `%${filter.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async create(template: Partial<DiagnosisTemplate>): Promise<DiagnosisTemplate> {
    const db = getDb();
    const { data, error } = await db
      .from('diagnosis_templates')
      .insert(template)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async update(id: string, template: Partial<DiagnosisTemplate>): Promise<DiagnosisTemplate> {
    const db = getDb();
    const { data, error } = await db
      .from('diagnosis_templates')
      .update({ ...template, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const db = getDb();
    const { error } = await db
      .from('diagnosis_templates')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}

// ============================================================
// MEDICINE SERVICE (Search & Autocomplete)
// ============================================================
export class MedicineService {
  static async search(params: MedicineSearchParams = {}): Promise<Medicine[]> {
    const db = getDb();
    let query = db
      .from('medicines')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (params.query) {
      query = query.or(`name.ilike.%${params.query}%,generic_name.ilike.%${params.query}%,brand_name.ilike.%${params.query}%`);
    }
    if (params.category) {
      query = query.eq('category', params.category);
    }
    if (params.form) {
      query = query.eq('form', params.form);
    }
    if (params.isNephrotoxic !== undefined) {
      query = query.eq('is_nephrotoxic', params.isNephrotoxic);
    }
    if (params.limit) {
      query = query.limit(params.limit);
    } else {
      query = query.limit(50);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<Medicine | null> {
    const db = getDb();
    const { data, error } = await db
      .from('medicines')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async create(medicine: Partial<Medicine>): Promise<Medicine> {
    const db = getDb();
    const { data, error } = await db
      .from('medicines')
      .insert(medicine)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async update(id: string, medicine: Partial<Medicine>): Promise<Medicine> {
    const db = getDb();
    const { data, error } = await db
      .from('medicines')
      .update({ ...medicine, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

// ============================================================
// MEDICINE TEMPLATE SERVICE
// ============================================================
export class MedicineTemplateService {
  static async list(filter: TemplateFilterParams = {}): Promise<MedicineTemplate[]> {
    const db = getDb();
    let query = db
      .from('medicine_templates')
      .select('*, items:medicine_template_items(*, medicine:medicines(*))')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (filter.category) {
      query = query.eq('category', filter.category);
    }
    if (filter.clinicId) {
      query = query.or(`clinic_id.eq.${filter.clinicId},clinic_id.is.null`);
    }
    if (filter.search) {
      query = query.ilike('name', `%${filter.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<MedicineTemplate | null> {
    const db = getDb();
    const { data, error } = await db
      .from('medicine_templates')
      .select('*, items:medicine_template_items(*, medicine:medicines(*))')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async create(template: Partial<MedicineTemplate>, items: Partial<MedicineTemplateItem>[] = []): Promise<MedicineTemplate> {
    const db = getDb();
    const { data: templateData, error: templateError } = await db
      .from('medicine_templates')
      .insert(template)
      .select()
      .single();
    if (templateError) throw templateError;

    if (items.length > 0) {
      const itemsWithTemplateId = items.map(item => ({
        ...item,
        template_id: templateData.id,
      }));
      const { error: itemsError } = await db
        .from('medicine_template_items')
        .insert(itemsWithTemplateId);
      if (itemsError) throw itemsError;
    }

    return templateData;
  }

  static async update(id: string, template: Partial<MedicineTemplate>): Promise<MedicineTemplate> {
    const db = getDb();
    const { data, error } = await db
      .from('medicine_templates')
      .update({ ...template, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const db = getDb();
    const { error } = await db
      .from('medicine_templates')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  static async updateItems(templateId: string, items: Partial<MedicineTemplateItem>[]): Promise<void> {
    const db = getDb();
    // Delete existing items
    await db
      .from('medicine_template_items')
      .delete()
      .eq('template_id', templateId);

    // Insert new items
    if (items.length > 0) {
      const itemsWithTemplateId = items.map(item => ({
        ...item,
        template_id: templateId,
      }));
      const { error } = await db
        .from('medicine_template_items')
        .insert(itemsWithTemplateId);
      if (error) throw error;
    }
  }
}

// ============================================================
// INVESTIGATION TEMPLATE SERVICE
// ============================================================
export class InvestigationTemplateService {
  static async list(filter: TemplateFilterParams = {}): Promise<InvestigationTemplate[]> {
    const db = getDb();
    let query = db
      .from('investigation_templates')
      .select('*, items:investigation_template_items(*)')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (filter.category) {
      query = query.eq('category', filter.category);
    }
    if (filter.clinicId) {
      query = query.or(`clinic_id.eq.${filter.clinicId},clinic_id.is.null`);
    }
    if (filter.search) {
      query = query.ilike('name', `%${filter.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<InvestigationTemplate | null> {
    const db = getDb();
    const { data, error } = await db
      .from('investigation_templates')
      .select('*, items:investigation_template_items(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async create(template: Partial<InvestigationTemplate>, items: Partial<InvestigationTemplateItem>[] = []): Promise<InvestigationTemplate> {
    const db = getDb();
    const { data: templateData, error: templateError } = await db
      .from('investigation_templates')
      .insert(template)
      .select()
      .single();
    if (templateError) throw templateError;

    if (items.length > 0) {
      const itemsWithTemplateId = items.map(item => ({
        ...item,
        template_id: templateData.id,
      }));
      const { error: itemsError } = await db
        .from('investigation_template_items')
        .insert(itemsWithTemplateId);
      if (itemsError) throw itemsError;
    }

    return templateData;
  }

  static async update(id: string, template: Partial<InvestigationTemplate>): Promise<InvestigationTemplate> {
    const db = getDb();
    const { data, error } = await db
      .from('investigation_templates')
      .update({ ...template, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const db = getDb();
    const { error } = await db
      .from('investigation_templates')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  static async updateItems(templateId: string, items: Partial<InvestigationTemplateItem>[]): Promise<void> {
    const db = getDb();
    await db
      .from('investigation_template_items')
      .delete()
      .eq('template_id', templateId);

    if (items.length > 0) {
      const itemsWithTemplateId = items.map(item => ({
        ...item,
        template_id: templateId,
      }));
      const { error } = await db
        .from('investigation_template_items')
        .insert(itemsWithTemplateId);
      if (error) throw error;
    }
  }
}

// ============================================================
// ADVICE TEMPLATE SERVICE
// ============================================================
export class AdviceTemplateService {
  static async list(filter: TemplateFilterParams = {}): Promise<AdviceTemplate[]> {
    const db = getDb();
    let query = db
      .from('advice_templates')
      .select('*, items:advice_template_items(*)')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (filter.category) {
      query = query.eq('category', filter.category);
    }
    if (filter.clinicId) {
      query = query.or(`clinic_id.eq.${filter.clinicId},clinic_id.is.null`);
    }
    if (filter.search) {
      query = query.ilike('name', `%${filter.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getById(id: string): Promise<AdviceTemplate | null> {
    const db = getDb();
    const { data, error } = await db
      .from('advice_templates')
      .select('*, items:advice_template_items(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async create(template: Partial<AdviceTemplate>, items: Partial<AdviceTemplateItem>[] = []): Promise<AdviceTemplate> {
    const db = getDb();
    const { data: templateData, error: templateError } = await db
      .from('advice_templates')
      .insert(template)
      .select()
      .single();
    if (templateError) throw templateError;

    if (items.length > 0) {
      const itemsWithTemplateId = items.map(item => ({
        ...item,
        template_id: templateData.id,
      }));
      const { error: itemsError } = await db
        .from('advice_template_items')
        .insert(itemsWithTemplateId);
      if (itemsError) throw itemsError;
    }

    return templateData;
  }

  static async update(id: string, template: Partial<AdviceTemplate>): Promise<AdviceTemplate> {
    const db = getDb();
    const { data, error } = await db
      .from('advice_templates')
      .update({ ...template, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const db = getDb();
    const { error } = await db
      .from('advice_templates')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  static async updateItems(templateId: string, items: Partial<AdviceTemplateItem>[]): Promise<void> {
    const db = getDb();
    await db
      .from('advice_template_items')
      .delete()
      .eq('template_id', templateId);

    if (items.length > 0) {
      const itemsWithTemplateId = items.map(item => ({
        ...item,
        template_id: templateId,
      }));
      const { error } = await db
        .from('advice_template_items')
        .insert(itemsWithTemplateId);
      if (error) throw error;
    }
  }
}
