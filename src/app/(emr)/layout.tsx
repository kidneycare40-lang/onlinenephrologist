'use client';

import { usePathname } from 'next/navigation';
import TopNav from '@/components/emr/TopNav';
import MobileBottomNav from '@/components/emr/MobileBottomNav';
import { ClinicProvider } from '@/lib/emr-clinic-context';

export default function EMRLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideTopNav = pathname === '/emr/login' || pathname === '/emr/clinic-selection' || pathname === '/emr';

  if (hideTopNav) {
    return (
      <ClinicProvider>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </ClinicProvider>
    );
  }

  return (
    <ClinicProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <TopNav />
        <main className="flex-1 pt-14 pb-16 lg:pb-0">
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </ClinicProvider>
  );
}
