import { getDbOrNull } from '@/lib/db/client';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT' | 'LOGIN' | 'LOGOUT';

interface AuditLogParams {
  userId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAudit(params: AuditLogParams): Promise<void> {
  const db = getDbOrNull();
  if (!db) return;

  try {
    await db.from('audit_logs').insert({
      user_id: params.userId || null,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId || null,
      old_values: params.oldValues || null,
      new_values: params.newValues || null,
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
    });
  } catch {
  }
}

interface ActivityLogParams {
  userId?: string;
  patientId?: string;
  action: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export async function logActivity(params: ActivityLogParams): Promise<void> {
  const db = getDbOrNull();
  if (!db) return;

  try {
    await db.from('activity_logs').insert({
      user_id: params.userId || null,
      patient_id: params.patientId || null,
      action: params.action,
      description: params.description || null,
      metadata: params.metadata || null,
    });
  } catch {
  }
}
