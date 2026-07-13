import { NextRequest } from 'next/server';
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
  } catch {}
}

export function extractRequestContext(request: NextRequest): { ipAddress?: string; userAgent?: string } {
  return {
    ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  };
}

export async function logAuditWithRequest(request: NextRequest, params: AuditLogParams): Promise<void> {
  const ctx = extractRequestContext(request);
  await logAudit({ ...params, ...ctx });
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
  } catch {}
}

export async function queryAuditLogs(params: {
  limit?: number;
  offset?: number;
  userId?: string;
  entityType?: string;
  action?: AuditAction;
  startDate?: string;
  endDate?: string;
}) {
  const db = getDbOrNull();
  if (!db) return { logs: [], total: 0 };
  try {
    let query = db.from('audit_logs').select('*', { count: 'exact' });
    if (params.userId) query = query.eq('user_id', params.userId);
    if (params.entityType) query = query.eq('entity_type', params.entityType);
    if (params.action) query = query.eq('action', params.action);
    if (params.startDate) query = query.gte('created_at', params.startDate);
    if (params.endDate) query = query.lte('created_at', params.endDate);
    query = query.order('created_at', { ascending: false });
    query = query.range(params.offset || 0, ((params.offset || 0) + (params.limit || 50)) - 1);
    const { data, count, error } = await query;
    if (error) return { logs: [], total: 0 };
    return { logs: data || [], total: count || 0 };
  } catch { return { logs: [], total: 0 }; }
}
