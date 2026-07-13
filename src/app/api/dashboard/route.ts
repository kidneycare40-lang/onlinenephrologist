import { NextRequest, NextResponse } from 'next/server';
import { getDashboardService } from '@/lib/db/services';
import { authenticateRequest, requirePermission, applyRateLimit, apiError } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'dashboard', 'view'); if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const dashboardService = getDashboardService();
    const clinicId = searchParams.get('clinicId') || undefined;
    const doctorId = searchParams.get('doctorId') || undefined;
    const section = searchParams.get('section');

    if (section === 'today-appointments') return NextResponse.json(await dashboardService.getTodayAppointments({ clinicId, doctorId }));
    if (section === 'recent-consultations') return NextResponse.json(await dashboardService.getRecentConsultations({ clinicId, doctorId, limit: parseInt(searchParams.get('limit') || '10') }));
    if (section === 'revenue') { const startDate = searchParams.get('startDate') || undefined; const endDate = searchParams.get('endDate') || undefined; return NextResponse.json(await dashboardService.getRevenueSummary({ clinicId, startDate, endDate })); }
    if (section === 'activity') return NextResponse.json(await dashboardService.getRecentActivity({ limit: parseInt(searchParams.get('limit') || '20'), clinicId }));
    return NextResponse.json(await dashboardService.getStats({ clinicId, doctorId }));
  } catch (error) { console.error('GET /api/dashboard error:', error); return apiError('Internal server error', 500); }
}
