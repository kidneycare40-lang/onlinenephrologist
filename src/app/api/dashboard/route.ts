import { NextRequest, NextResponse } from 'next/server';
import { getDashboardService } from '@/lib/db/services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dashboardService = getDashboardService();

    const clinicId = searchParams.get('clinicId') || undefined;
    const doctorId = searchParams.get('doctorId') || undefined;

    const section = searchParams.get('section');

    if (section === 'today-appointments') {
      const appointments = await dashboardService.getTodayAppointments({ clinicId, doctorId });
      return NextResponse.json(appointments);
    }

    if (section === 'recent-consultations') {
      const limit = parseInt(searchParams.get('limit') || '10');
      const consultations = await dashboardService.getRecentConsultations({ clinicId, doctorId, limit });
      return NextResponse.json(consultations);
    }

    if (section === 'revenue') {
      const startDate = searchParams.get('startDate') || undefined;
      const endDate = searchParams.get('endDate') || undefined;
      const revenue = await dashboardService.getRevenueSummary({ clinicId, startDate, endDate });
      return NextResponse.json(revenue);
    }

    if (section === 'activity') {
      const limit = parseInt(searchParams.get('limit') || '20');
      const activity = await dashboardService.getRecentActivity({ limit, clinicId });
      return NextResponse.json(activity);
    }

    // Default: full dashboard stats
    const stats = await dashboardService.getStats({ clinicId, doctorId });
    return NextResponse.json(stats);

  } catch (error) {
    console.error('GET /api/dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
