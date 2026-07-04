'use client';

import { useState, useEffect, useCallback } from 'react';
import { prescriptionsApi } from '@/lib/api-client';

export function usePrescriptions(patientId: string | null) {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) { setLoading(false); return; }
    prescriptionsApi.getByPatient(patientId)
      .then(setPrescriptions)
      .catch(() => setPrescriptions([]))
      .finally(() => setLoading(false));
  }, [patientId]);

  return { prescriptions, loading, setPrescriptions };
}

export function usePrescription(id: string | null) {
  const [prescription, setPrescription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    prescriptionsApi.get(id)
      .then(setPrescription)
      .catch(() => setPrescription(null))
      .finally(() => setLoading(false));
  }, [id]);

  return { prescription, loading, setPrescription };
}

export function usePrescriptionTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prescriptionsApi.getTemplates()
      .then(setTemplates)
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, []);

  return { templates, loading };
}
