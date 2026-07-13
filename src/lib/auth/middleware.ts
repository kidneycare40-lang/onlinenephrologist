import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, type TokenPayload } from './jwt';
import { checkPermission, type RolePermissions } from './permissions';
import { checkRateLimit, getRateLimitHeaders } from './rate-limit';
import { logAudit } from '@/lib/db/audit';

export interface AuthResult {
  user: TokenPayload | null;
  error: NextResponse | null;
}

export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const cookieToken = request.cookies.get('emr_token')?.value;
  const accessToken = token || cookieToken;

  if (!accessToken) {
    return { user: null, error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) };
  }

  const payload = await verifyToken(accessToken);
  if (!payload) {
    return { user: null, error: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }) };
  }

  return { user: payload, error: null };
}

export function requirePermission(user: TokenPayload | null, section: keyof RolePermissions, action: string): NextResponse | null {
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  if (!checkPermission(user.role, section, action)) {
    logAudit({ userId: user.userId, action: 'VIEW', entityType: 'permission_denied', entityId: `${section}.${action}` });
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }
  return null;
}

export function applyRateLimit(request: NextRequest, endpoint: string): NextResponse | null {
  // Use the platform-verified connection IP. On Vercel this is `request.ip`.
  // Do NOT trust client-supplied X-Forwarded-For unless a trusted proxy rewrites it.
  const ip = request.ip || request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || '127.0.0.1';
  const { allowed } = checkRateLimit(ip, endpoint);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429, headers: getRateLimitHeaders(ip, endpoint) as HeadersInit });
  }
  return null;
}

export function withAudit(action: string, entityType: string, userId?: string, entityId?: string, oldValues?: Record<string, unknown>, newValues?: Record<string, unknown>) {
  logAudit({ userId, action: action as any, entityType, entityId, oldValues, newValues });
}

export function apiError(message: string, status: number, details?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...details }, { status });
}
