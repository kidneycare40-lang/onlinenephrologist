'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type EMRRole = 'admin' | 'doctor' | 'receptionist';

export interface EMRUser {
  id: string;
  name: string;
  email: string;
  role: EMRRole;
  pin: string;
  avatar?: string;
  createdAt: string;
}

export interface RolePermissions {
  dashboard: boolean;
  patients: boolean;
  appointments: boolean;
  consultation: boolean;
  prescriptions: boolean;
  billing: boolean;
  reports: boolean;
  settings: boolean;
  manageUsers: boolean;
  deleteData: boolean;
  exportData: boolean;
}

const defaultPermissions: Record<EMRRole, RolePermissions> = {
  admin: {
    dashboard: true,
    patients: true,
    appointments: true,
    consultation: true,
    prescriptions: true,
    billing: true,
    reports: true,
    settings: true,
    manageUsers: true,
    deleteData: true,
    exportData: true,
  },
  doctor: {
    dashboard: true,
    patients: true,
    appointments: true,
    consultation: true,
    prescriptions: true,
    billing: false,
    reports: true,
    settings: false,
    manageUsers: false,
    deleteData: false,
    exportData: true,
  },
  receptionist: {
    dashboard: true,
    patients: true,
    appointments: true,
    consultation: false,
    prescriptions: false,
    billing: true,
    reports: false,
    settings: false,
    manageUsers: false,
    deleteData: false,
    exportData: false,
  },
};

const defaultUsers: EMRUser[] = [
  { id: 'u-admin', name: 'Dr. Rajesh Goel', email: 'admin@kcc.in', role: 'admin', pin: '1256', createdAt: '2024-01-01' },
  { id: 'u-doc1', name: 'Dr. Rajesh Goel', email: 'doctor@kcc.in', role: 'doctor', pin: '1111', createdAt: '2024-01-01' },
  { id: 'u-rec1', name: 'Reception', email: 'reception@kcc.in', role: 'receptionist', pin: '2222', createdAt: '2024-01-01' },
];

interface AuthContextType {
  user: EMRUser | null;
  users: EMRUser[];
  permissions: RolePermissions;
  isAuthenticated: boolean;
  login: (email: string, pin: string) => boolean;
  loginAs: (userId: string) => void;
  logout: () => void;
  addUser: (user: Omit<EMRUser, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<EMRUser>) => void;
  deleteUser: (id: string) => void;
  can: (permission: keyof RolePermissions) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  users: [],
  permissions: defaultPermissions.receptionist,
  isAuthenticated: false,
  login: () => false,
  loginAs: () => {},
  logout: () => {},
  addUser: () => {},
  updateUser: () => {},
  deleteUser: () => {},
  can: () => false,
});

export function useAuth() {
  return useContext(AuthContext);
}

function loadUsers(): EMRUser[] {
  try {
    const stored = localStorage.getItem('emr_users');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return defaultUsers;
}

function saveUsers(users: EMRUser[]) {
  try { localStorage.setItem('emr_users', JSON.stringify(users)); } catch {}
}

function loadCurrentUser(): EMRUser | null {
  try {
    const stored = localStorage.getItem('emr_current_user');
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

function saveCurrentUser(user: EMRUser | null) {
  try {
    if (user) localStorage.setItem('emr_current_user', JSON.stringify(user));
    else localStorage.removeItem('emr_current_user');
  } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<EMRUser | null>(null);
  const [users, setUsers] = useState<EMRUser[]>([]);

  useEffect(() => {
    setUsers(loadUsers());
    setUser(loadCurrentUser());
  }, []);

  const permissions = user ? defaultPermissions[user.role] : defaultPermissions.receptionist;

  const login = useCallback((email: string, pin: string): boolean => {
    const allUsers = loadUsers();
    const found = allUsers.find((u) => u.email === email && u.pin === pin);
    if (found) {
      setUser(found);
      saveCurrentUser(found);
      setUsers(allUsers);
      return true;
    }
    return false;
  }, []);

  const loginAs = useCallback((userId: string) => {
    const allUsers = loadUsers();
    const found = allUsers.find((u) => u.id === userId);
    if (found) {
      setUser(found);
      saveCurrentUser(found);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    saveCurrentUser(null);
  }, []);

  const addUser = useCallback((userData: Omit<EMRUser, 'id' | 'createdAt'>) => {
    const newUser: EMRUser = {
      ...userData,
      id: `u-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [...loadUsers(), newUser];
    setUsers(updated);
    saveUsers(updated);
  }, []);

  const updateUser = useCallback((id: string, updates: Partial<EMRUser>) => {
    const updated = loadUsers().map((u) => u.id === id ? { ...u, ...updates } : u);
    setUsers(updated);
    saveUsers(updated);
    if (user?.id === id) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      saveCurrentUser(updatedUser);
    }
  }, [user]);

  const deleteUser = useCallback((id: string) => {
    const updated = loadUsers().filter((u) => u.id !== id);
    setUsers(updated);
    saveUsers(updated);
    if (user?.id === id) {
      setUser(null);
      saveCurrentUser(null);
    }
  }, [user]);

  const can = useCallback((permission: keyof RolePermissions): boolean => {
    return permissions[permission];
  }, [permissions]);

  return (
    <AuthContext.Provider value={{ user, users, permissions, isAuthenticated: !!user, login, loginAs, logout, addUser, updateUser, deleteUser, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export { defaultPermissions };
