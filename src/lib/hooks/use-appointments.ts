'use client';

import { useState, useEffect, useCallback } from 'react';
import { appointmentsApi } from '@/lib/api-client';

export function useAppointments(params?: {
  date?: string;
  doctorId?: string;
  clinicId?: string;
  patientId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (params?.startDate && params?.endDate) {
        const data = await appointmentsApi.getByDateRange(
          params.startDate, params.endDate, params.doctorId
        );
        setAppointments(data || []);
      } else if (params?.doctorId && params?.date) {
        const data = await appointmentsApi.getByDoctorAndDate(params.doctorId, params.date);
        setAppointments(data || []);
      } else {
        const result = await appointmentsApi.list(params as any);
        setAppointments(result.data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [params?.date, params?.doctorId, params?.clinicId, params?.startDate, params?.endDate]);

  useEffect(() => { refresh(); }, [refresh]);

  return { appointments, loading, error, refresh, setAppointments };
}

export function useAppointment(id: string | null) {
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    appointmentsApi.list({ id })
      .then(setAppointment)
      .catch(() => setAppointment(null))
      .finally(() => setLoading(false));
  }, [id]);

  return { appointment, loading, setAppointment };
}
