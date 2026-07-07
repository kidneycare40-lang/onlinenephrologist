'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import TopNav from '@/components/emr/TopNav';
import MobileBottomNav from '@/components/emr/MobileBottomNav';
import { ClinicProvider } from '@/lib/emr-clinic-context';
import { AuthProvider, useAuth } from '@/lib/emr-auth-context';
import { initEmrSync } from '@/lib/emr-sync';

const publicPaths = ['/emr/login', '/emr', '/emr/clinic-selection'];

function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));

  useEffect(() => {
    if (!isPublic && !isAuthenticated) {
      router.replace('/emr/login');
    }
  }, [isPublic, isAuthenticated, router]);

  if (!isPublic && !isAuthenticated) return null;
  return <>{children}</>;
}

export default function EMRLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideTopNav = pathname === '/emr/login' || pathname === '/emr/clinic-selection' || pathname === '/emr';
  const isFullWidth = pathname.startsWith('/emr/consultation/');

  useEffect(() => {
    initEmrSync();
  }, []);

  const content = hideTopNav ? (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  ) : (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNav />
      <main className={`flex-1 w-full pt-14 pb-20 lg:pb-0 ${isFullWidth ? 'lg:pl-2' : 'px-4 lg:px-6'}`}>
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );

  return (
    <AuthProvider>
      <ClinicProvider>
        <AuthGuard>{content}</AuthGuard>
      </ClinicProvider>
    </AuthProvider>
  );
}
