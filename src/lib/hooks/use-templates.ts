'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  complaintTemplatesApi,
  diagnosisTemplatesApi,
  medicinesApi,
  medicineTemplatesApi,
  investigationTemplatesApi,
  adviceTemplatesApi,
} from '@/lib/api-client';

// ============================================================
// COMPLAINT TEMPLATES HOOK
// ============================================================
export function useComplaintTemplates(category?: string) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await complaintTemplatesApi.list({ category });
      setTemplates(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { load(); }, [load]);

  return { templates, loading, error, refresh: load };
}

// ============================================================
// DIAGNOSIS TEMPLATES HOOK
// ============================================================
export function useDiagnosisTemplates(category?: string, ckdStage?: number) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await diagnosisTemplatesApi.list({ category, ckdStage });
      setTemplates(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category, ckdStage]);

  useEffect(() => { load(); }, [load]);

  return { templates, loading, error, refresh: load };
}

// ============================================================
// MEDICINES SEARCH HOOK
// ============================================================
export function useMedicineSearch(query: string, options?: { category?: string; form?: string }) {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setMedicines([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await medicinesApi.search({
        q: searchQuery,
        category: options?.category,
        form: options?.form,
        limit: 20,
      });
      setMedicines(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [options?.category, options?.form]);

  useEffect(() => {
    const debounce = setTimeout(() => search(query), 300);
    return () => clearTimeout(debounce);
  }, [query, search]);

  return { medicines, loading, error };
}

// ============================================================
// MEDICINE TEMPLATES HOOK
// ============================================================
export function useMedicineTemplates(category?: string) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await medicineTemplatesApi.list({ category });
      setTemplates(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { load(); }, [load]);

  const addMedicineToTemplate = useCallback(async (templateId: string, medicine: any) => {
    try {
      const template = await medicineTemplatesApi.get(templateId);
      const items = [...(template.items || []), medicine];
      await medicineTemplatesApi.update(templateId, { items });
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  }, [load]);

  const removeMedicineFromTemplate = useCallback(async (templateId: string, itemId: string) => {
    try {
      const template = await medicineTemplatesApi.get(templateId);
      const items = (template.items || []).filter((i: any) => i.id !== itemId);
      await medicineTemplatesApi.update(templateId, { items });
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  }, [load]);

  return { templates, loading, error, refresh: load, addMedicineToTemplate, removeMedicineFromTemplate };
}

// ============================================================
// INVESTIGATION TEMPLATES HOOK
// ============================================================
export function useInvestigationTemplates(category?: string) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await investigationTemplatesApi.list({ category });
      setTemplates(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { load(); }, [load]);

  const addTestToTemplate = useCallback(async (templateId: string, test: any) => {
    try {
      const template = await investigationTemplatesApi.get(templateId);
      const items = [...(template.items || []), test];
      await investigationTemplatesApi.update(templateId, { items });
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  }, [load]);

  const removeTestFromTemplate = useCallback(async (templateId: string, itemId: string) => {
    try {
      const template = await investigationTemplatesApi.get(templateId);
      const items = (template.items || []).filter((i: any) => i.id !== itemId);
      await investigationTemplatesApi.update(templateId, { items });
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  }, [load]);

  return { templates, loading, error, refresh: load, addTestToTemplate, removeTestFromTemplate };
}

// ============================================================
// ADVICE TEMPLATES HOOK
// ============================================================
export function useAdviceTemplates(category?: string) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adviceTemplatesApi.list({ category });
      setTemplates(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { load(); }, [load]);

  const addAdviceToTemplate = useCallback(async (templateId: string, advice: any) => {
    try {
      const template = await adviceTemplatesApi.get(templateId);
      const items = [...(template.items || []), advice];
      await adviceTemplatesApi.update(templateId, { items });
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  }, [load]);

  const removeAdviceFromTemplate = useCallback(async (templateId: string, itemId: string) => {
    try {
      const template = await adviceTemplatesApi.get(templateId);
      const items = (template.items || []).filter((i: any) => i.id !== itemId);
      await adviceTemplatesApi.update(templateId, { items });
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  }, [load]);

  return { templates, loading, error, refresh: load, addAdviceToTemplate, removeAdviceFromTemplate };
}
