'use client';

import { useState, useEffect, useCallback } from 'react';
import { billingApi } from '@/lib/api-client';

export function useInvoices(params?: { patientId?: string; status?: string; clinicId?: string }) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (params?.patientId) {
        const data = await billingApi.getByPatient(params.patientId);
        setInvoices(data || []);
      } else if (params?.status) {
        const data = await billingApi.list({ status: params.status });
        setInvoices(Array.isArray(data) ? data : data.data || []);
      } else {
        const result = await billingApi.list(params as any);
        setInvoices(result.data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params?.patientId, params?.status, params?.clinicId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { invoices, loading, error, refresh, setInvoices };
}

export function useInvoice(id: string | null) {
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    billingApi.get(id)
      .then(setInvoice)
      .catch(() => setInvoice(null))
      .finally(() => setLoading(false));
  }, [id]);

  return { invoice, loading, setInvoice };
}
