export type EMRRole = 'super_admin' | 'doctor' | 'receptionist' | 'billing' | 'lab' | 'nurse' | 'readonly';

export interface RolePermissions {
  patients: { view: boolean; create: boolean; edit: boolean; delete: boolean; export: boolean };
  appointments: { view: boolean; create: boolean; edit: boolean; cancel: boolean; reschedule: boolean };
  consultations: { view: boolean; create: boolean; edit: boolean; delete: boolean; complete: boolean };
  prescriptions: { view: boolean; create: boolean; edit: boolean; delete: boolean; finalize: boolean };
  billing: { view: boolean; create: boolean; edit: boolean; delete: boolean; recordPayment: boolean; refund: boolean };
  medicines: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  reports: { view: boolean; export: boolean };
  settings: { view: boolean; edit: boolean };
  users: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  audit: { view: boolean };
  dashboard: { view: boolean };
}

const allTrue = (): RolePermissions => ({
  patients: { view: true, create: true, edit: true, delete: true, export: true },
  appointments: { view: true, create: true, edit: true, cancel: true, reschedule: true },
  consultations: { view: true, create: true, edit: true, delete: true, complete: true },
  prescriptions: { view: true, create: true, edit: true, delete: true, finalize: true },
  billing: { view: true, create: true, edit: true, delete: true, recordPayment: true, refund: true },
  medicines: { view: true, create: true, edit: true, delete: true },
  reports: { view: true, export: true },
  settings: { view: true, edit: true },
  users: { view: true, create: true, edit: true, delete: true },
  audit: { view: true },
  dashboard: { view: true },
});

const allFalse = (): RolePermissions => ({
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
});

export const ROLE_PERMISSIONS: Record<EMRRole, RolePermissions> = {
  super_admin: allTrue(),

  doctor: {
    patients: { view: true, create: true, edit: true, delete: false, export: true },
    appointments: { view: true, create: true, edit: true, cancel: false, reschedule: true },
    consultations: { view: true, create: true, edit: true, delete: false, complete: true },
    prescriptions: { view: true, create: true, edit: true, delete: false, finalize: true },
    billing: { view: true, create: false, edit: false, delete: false, recordPayment: false, refund: false },
    medicines: { view: true, create: true, edit: false, delete: false },
    reports: { view: true, export: true },
    settings: { view: true, edit: false },
    users: { view: false, create: false, edit: false, delete: false },
    audit: { view: false },
    dashboard: { view: true },
  },

  receptionist: {
    patients: { view: true, create: true, edit: true, delete: false, export: false },
    appointments: { view: true, create: true, edit: true, cancel: true, reschedule: true },
    consultations: { view: false, create: false, edit: false, delete: false, complete: false },
    prescriptions: { view: false, create: false, edit: false, delete: false, finalize: false },
    billing: { view: true, create: true, edit: false, delete: false, recordPayment: true, refund: false },
    medicines: { view: true, create: false, edit: false, delete: false },
    reports: { view: false, export: false },
    settings: { view: false, edit: false },
    users: { view: false, create: false, edit: false, delete: false },
    audit: { view: false },
    dashboard: { view: true },
  },

  billing: {
    patients: { view: true, create: false, edit: false, delete: false, export: false },
    appointments: { view: true, create: false, edit: false, cancel: false, reschedule: false },
    consultations: { view: false, create: false, edit: false, delete: false, complete: false },
    prescriptions: { view: false, create: false, edit: false, delete: false, finalize: false },
    billing: { view: true, create: true, edit: true, delete: false, recordPayment: true, refund: false },
    medicines: { view: false, create: false, edit: false, delete: false },
    reports: { view: false, export: false },
    settings: { view: false, edit: false },
    users: { view: false, create: false, edit: false, delete: false },
    audit: { view: false },
    dashboard: { view: true },
  },

  lab: {
    patients: { view: true, create: false, edit: false, delete: false, export: false },
    appointments: { view: false, create: false, edit: false, cancel: false, reschedule: false },
    consultations: { view: false, create: false, edit: false, delete: false, complete: false },
    prescriptions: { view: false, create: false, edit: false, delete: false, finalize: false },
    billing: { view: false, create: false, edit: false, delete: false, recordPayment: false, refund: false },
    medicines: { view: false, create: false, edit: false, delete: false },
    reports: { view: true, export: true },
    settings: { view: false, edit: false },
    users: { view: false, create: false, edit: false, delete: false },
    audit: { view: false },
    dashboard: { view: true },
  },

  nurse: {
    patients: { view: true, create: false, edit: true, delete: false, export: false },
    appointments: { view: true, create: false, edit: false, cancel: false, reschedule: false },
    consultations: { view: true, create: false, edit: false, delete: false, complete: false },
    prescriptions: { view: true, create: false, edit: false, delete: false, finalize: false },
    billing: { view: false, create: false, edit: false, delete: false, recordPayment: false, refund: false },
    medicines: { view: true, create: false, edit: false, delete: false },
    reports: { view: false, export: false },
    settings: { view: false, edit: false },
    users: { view: false, create: false, edit: false, delete: false },
    audit: { view: false },
    dashboard: { view: true },
  },

  readonly: {
    patients: { view: true, create: false, edit: false, delete: false, export: false },
    appointments: { view: true, create: false, edit: false, cancel: false, reschedule: false },
    consultations: { view: true, create: false, edit: false, delete: false, complete: false },
    prescriptions: { view: true, create: false, edit: false, delete: false, finalize: false },
    billing: { view: true, create: false, edit: false, delete: false, recordPayment: false, refund: false },
    medicines: { view: true, create: false, edit: false, delete: false },
    reports: { view: true, export: false },
    settings: { view: false, edit: false },
    users: { view: false, create: false, edit: false, delete: false },
    audit: { view: false },
    dashboard: { view: true },
  },
};

export function checkPermission(role: string, section: keyof RolePermissions, action: string): boolean {
  const normalizedRole = role as EMRRole;
  const perms = ROLE_PERMISSIONS[normalizedRole];
  if (!perms) return false;
  const sectionPerms = perms[section];
  if (!sectionPerms) return false;
  return (sectionPerms as Record<string, boolean>)[action] ?? false;
}

export function getPermissionsForRole(role: string): RolePermissions | null {
  return ROLE_PERMISSIONS[role as EMRRole] || null;
}

export const EMRRoleLabels: Record<EMRRole, string> = {
  super_admin: 'Super Admin',
  doctor: 'Doctor',
  receptionist: 'Receptionist',
  billing: 'Billing Staff',
  lab: 'Laboratory',
  nurse: 'Nurse',
  readonly: 'Read-only User',
};

export const EMRRoleColors: Record<EMRRole, string> = {
  super_admin: 'purple',
  doctor: 'blue',
  receptionist: 'emerald',
  billing: 'orange',
  lab: 'cyan',
  nurse: 'pink',
  readonly: 'gray',
};
