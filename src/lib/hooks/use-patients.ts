'use client';

import { useState, useEffect, useCallback } from 'react';
import { patientsApi, ApiError } from '@/lib/api-client';

export function usePatients(params?: { search?: string; clinicId?: string }) {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await patientsApi.list(params as any);
      setPatients(result.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params?.search, params?.clinicId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { patients, loading, error, refresh, setPatients };
}

export function usePatientSearch(query: string) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    patientsApi.search(query)
      .then(data => { if (!cancelled) setResults(data || []); })
      .catch(() => { if (!cancelled) setResults([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [query]);

  return { results, loading };
}

export function usePatient(id: string | null) {
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    patientsApi.get(id)
      .then(setPatient)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const update = useCallback(async (data: any) => {
    if (!id) return;
    const updated = await patientsApi.update(id, data);
    setPatient(updated);
    return updated;
  }, [id]);

  return { patient, loading, error, setPatient, update };
}
