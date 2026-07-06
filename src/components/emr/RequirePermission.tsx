'use client';

import { useAuth, type RolePermissions } from '@/lib/emr-auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function RequirePermission({
  permission,
  children,
}: {
  permission: keyof RolePermissions;
  children: React.ReactNode;
}) {
  const { can, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !can(permission)) {
      router.replace('/emr/dashboard');
    }
  }, [isAuthenticated, can, permission, router]);

  if (!isAuthenticated) return null;
  if (!can(permission)) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center p-8 bg-red-50 rounded-2xl border border-red-100 max-w-sm">
        <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-red-600 text-xl">🔒</span>
        </div>
        <h2 className="text-lg font-bold text-red-900 mb-2">Access Denied</h2>
        <p className="text-sm text-red-600">You don't have permission to access this page.</p>
      </div>
    </div>
  );

  return <>{children}</>;
}
