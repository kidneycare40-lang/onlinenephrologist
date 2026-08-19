'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PatientPortalNav, PatientPortalMobileNav } from '@/components/patient-portal/PatientPortalNav';

const PUBLIC_PATIENT_PATHS = ['/patient/login'];

export default function PatientPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  const isPublicPage = PUBLIC_PATIENT_PATHS.includes(pathname);

  useEffect(() => {
    if (isPublicPage) {
      setAuthorized(true);
      setChecking(false);
      return;
    }

    fetch('/api/patient-auth/me')
      .then(r => {
        if (!r.ok) throw new Error('not auth');
        return r.json();
      })
      .then(data => {
        if (data.patient?.patientId === 'pending') {
          router.push('/patient/login');
          return;
        }
        setAuthorized(true);
        setChecking(false);
      })
      .catch(() => {
        router.push('/patient/login?redirect=' + encodeURIComponent(pathname));
      });
  }, [router, pathname, isPublicPage]);

  if (isPublicPage) {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#0A75BB] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientPortalNav />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-6">
        {children}
      </main>
      <PatientPortalMobileNav />
    </div>
  );
}
