import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requirePermission, applyRateLimit, apiError } from '@/lib/auth/middleware';
import { queryAuditLogs, type AuditAction } from '@/lib/db/audit';

export async function GET(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'audit', 'view'); if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const result = await queryAuditLogs({
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
      userId: searchParams.get('userId') || undefined,
      entityType: searchParams.get('entityType') || undefined,
      action: (searchParams.get('action') as AuditAction) || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    });
    return NextResponse.json(result);
  } catch (error) { console.error('GET /api/audit error:', error); return apiError('Internal server error', 500); }
}
