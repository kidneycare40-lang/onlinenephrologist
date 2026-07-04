'use client';

import { useState, useEffect, useCallback } from 'react';
import { vitalsApi } from '@/lib/api-client';

export function useVitals(patientId: string | null) {
  const [vitals, setVitals] = useState<{ latest: any; history: any[] }>({ latest: null, history: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) { setLoading(false); return; }
    vitalsApi.get(patientId, 'vitals')
      .then(data => setVitals({ latest: data?.latest || null, history: data?.history || [] }))
      .catch(() => setVitals({ latest: null, history: [] }))
      .finally(() => setLoading(false));
  }, [patientId]);

  return { vitals, loading, setVitals };
}

export function useKidneyParams(patientId: string | null) {
  const [kidneyParams, setKidneyParams] = useState<{ latest: any; trend: any[] }>({ latest: null, trend: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) { setLoading(false); return; }
    vitalsApi.get(patientId, 'kidney')
      .then(data => setKidneyParams({ latest: data?.latest || null, trend: data?.trend || [] }))
      .catch(() => setKidneyParams({ latest: null, trend: [] }))
      .finally(() => setLoading(false));
  }, [patientId]);

  return { kidneyParams, loading, setKidneyParams };
}
