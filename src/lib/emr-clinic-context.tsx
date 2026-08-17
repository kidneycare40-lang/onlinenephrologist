'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getItem, setItem, removeItem } from '@/lib/client-storage';

export interface ClinicInfo {
  id: string;
  name: string;
  parentName: string;
}

const clinicMap: Record<string, ClinicInfo> = {
  'kcc-faridabad': { id: 'kcc-faridabad', name: 'Kidney Care Centre - Faridabad', parentName: 'Kidney Care Centre' },
  'kcc-saket': { id: 'kcc-saket', name: 'Kidney Care Centre - Saket', parentName: 'Kidney Care Centre' },
  'psri-delhi': { id: 'psri-delhi', name: 'PSRI Hospital Delhi', parentName: 'PSRI Hospital' },
  'online': { id: 'online', name: 'Online Consultation', parentName: 'Online' },
};

interface ClinicContextType {
  clinicId: string | null;
  clinic: ClinicInfo | null;
  setClinicId: (id: string) => void;
  clearClinic: () => void;
}

const ClinicContext = createContext<ClinicContextType>({
  clinicId: null,
  clinic: null,
  setClinicId: () => {},
  clearClinic: () => {},
});

export function useClinic() {
  return useContext(ClinicContext);
}

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [clinicId, setClinicIdState] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const saved = typeof window !== 'undefined' ? await getItem('emr-clinic-id') : null;
      if (saved && clinicMap[saved as string]) {
        setClinicIdState(saved as string);
      }
    })();
  }, []);

  async function setClinicId(id: string) {
    setClinicIdState(id);
    await setItem('emr-clinic-id', id);
  }

  async function clearClinic() {
    setClinicIdState(null);
    await removeItem('emr-clinic-id');
  }

  const clinic = clinicId ? clinicMap[clinicId] || null : null;

  return (
    <ClinicContext.Provider value={{ clinicId, clinic, setClinicId, clearClinic }}>
      {children}
    </ClinicContext.Provider>
  );
}
