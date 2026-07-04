'use client';

import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '@/lib/api-client';

export function useDashboardStats(clinicId?: string) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = clinicId ? { clinicId } : undefined;
      const data = await dashboardApi.getStats(params);
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { stats, loading, error, refresh };
}

export function useTodayAppointments(clinicId?: string) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const params = clinicId ? { clinicId } : undefined;
      const data = await dashboardApi.getTodayAppointments(params);
      setAppointments(data || []);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { appointments, loading, refresh };
}
