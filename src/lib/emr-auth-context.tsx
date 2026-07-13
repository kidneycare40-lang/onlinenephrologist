'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi, setAccessToken, getAccessToken } from '@/lib/api-client';
import { getPermissionsForRole, type EMRRole as PermRole, type RolePermissions } from '@/lib/auth/permissions';

export type EMRRole = 'super_admin' | 'doctor' | 'receptionist' | 'billing' | 'lab' | 'nurse' | 'readonly';

export interface EMRUser {
  id: string;
  name: string;
  email: string;
  role: EMRRole;
  firstName?: string;
  lastName?: string;
  qualification?: string;
  registrationNumber?: string;
  specialization?: string;
  experienceYears?: number;
  profilePhoto?: string;
  isActive?: boolean;
  lastLogin?: string;
}

interface AuthContextType {
  user: EMRUser | null;
  permissions: RolePermissions | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsSetup?: boolean }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  can: (section: keyof RolePermissions, action: string) => boolean;
}

const emptyPermissions: RolePermissions = {
  patients: { view: false, create: false, edit: false, delete: false, export: false },
  appointments: { view: false, create: false, edit: false, cancel: false, reschedule: false },
  consultations: { view: false, create: false, edit: false, delete: false, complete: false },
  prescriptions: { view: false, create: false, edit: false, delete: false, finalize: false },
  billing: { view: false, create: false, edit: false, delete: false, recordPayment: false, refund: false },
  medicines: { view: false, create: false, edit: false, delete: false },
  reports: { view: false, export: false },
  settings: { view: false, edit: false },
  users: { view: false, create: false, edit: false, delete: false },
  audit: { view: false },
  dashboard: { view: false },
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  permissions: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false } as const),
  logout: async () => {},
  checkAuth: async () => {},
  can: () => false,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<EMRUser | null>(null);
  const [permissions, setPermissions] = useState<RolePermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const tokenFromStorage = getAccessToken();
      if (!tokenFromStorage) {
        const data = await authApi.me();
        if (data.user) {
          setUser(data.user);
          setPermissions(data.permissions || getPermissionsForRole(data.user.role) || emptyPermissions);
          return;
        }
      } else {
        const data = await authApi.me();
        if (data.user) {
          setUser(data.user);
          setPermissions(data.permissions || getPermissionsForRole(data.user.role) || emptyPermissions);
          return;
        }
      }
    } catch {
      // Not authenticated, that's ok
    }
    setUser(null);
    setPermissions(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuth().finally(() => setIsLoading(false));
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string; needsSetup?: boolean }> => {
    try {
      const data = await authApi.login(email, password);
      if (data.token) {
        setAccessToken(data.token);
      }
      setUser(data.user);
      setPermissions(getPermissionsForRole(data.user.role) || emptyPermissions);
      return { success: true };
    } catch (err: any) {
      const body = err.responseBody || {};
      return { success: false, error: err.message || 'Login failed', needsSetup: body.needsSetup === true };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    setAccessToken(null);
    setUser(null);
    setPermissions(null);
  }, []);

  const can = useCallback((section: keyof RolePermissions, action: string): boolean => {
    if (!permissions) return false;
    const sectionPerms = permissions[section];
    if (!sectionPerms) return false;
    return (sectionPerms as Record<string, boolean>)[action] ?? false;
  }, [permissions]);

  return (
    <AuthContext.Provider value={{ user, permissions, isAuthenticated: !!user, isLoading, login, logout, checkAuth, can }}>
      {children}
    </AuthContext.Provider>
  );
}
