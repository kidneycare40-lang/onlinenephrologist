'use client';

import { useState, useEffect, useCallback } from 'react';
import { consultationsApi } from '@/lib/api-client';

export function useConsultation(id: string | null) {
  const [consultation, setConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    consultationsApi.get(id)
      .then(setConsultation)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const update = useCallback(async (data: any) => {
    if (!id) return;
    const updated = await consultationsApi.update(id, data);
    setConsultation(updated);
    return updated;
  }, [id]);

  const complete = useCallback(async () => {
    if (!id) return;
    const updated = await consultationsApi.complete(id);
    setConsultation(updated);
    return updated;
  }, [id]);

  return { consultation, loading, error, setConsultation, update, complete };
}

export function usePatientConsultations(patientId: string | null) {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) { setLoading(false); return; }
    consultationsApi.getByPatient(patientId)
      .then(setConsultations)
      .catch(() => setConsultations([]))
      .finally(() => setLoading(false));
  }, [patientId]);

  return { consultations, loading, setConsultations };
}
