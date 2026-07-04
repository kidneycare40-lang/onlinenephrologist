import { getDb } from '../client';
import type {
  DashboardStats,
  DashboardAppointment,
  DashboardConsultation,
  DashboardRevenue,
  RecentActivity,
  AppointmentStatus,
} from '../types';

export class DashboardService {
  async getStats(params: {
    clinicId?: string;
    doctorId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<DashboardStats> {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

    // Build filters
    const filters: string[] = ['is_deleted = false'];
    if (params.clinicId) filters.push(`clinic_id = '${params.clinicId}'`);
    if (params.doctorId) filters.push(`doctor_id = '${params.doctorId}'`);

    const filterStr = filters.join(' AND ');

    // Parallel queries
    const [
      totalPatients,
      newPatientsToday,
      todayAppointments,
      completedToday,
      pendingAppointments,
      totalConsultations,
      monthlyRevenue,
      pendingDues,
      recentPatients,
      appointmentsByStatus,
    ] = await Promise.all([
      // Total active patients
      db.from('patients').select('id', { count: 'exact', head: true }).eq('is_deleted', false),
      // New patients today
      db.from('patients').select('id', { count: 'exact', head: true }).eq('is_deleted', false).eq('registration_date', today),
      // Today's appointments
      db.from('appointments').select('id', { count: 'exact', head: true }).eq('is_deleted', false).eq('appointment_date', today),
      // Completed consultations today
      db.from('consultations').select('id', { count: 'exact', head: true }).eq('is_deleted', false).eq('consultation_date', today).eq('status', 'COMPLETED'),
      // Pending/scheduled appointments
      db.from('appointments').select('id', { count: 'exact', head: true }).eq('is_deleted', false).in('status', ['SCHEDULED', 'CONFIRMED']).gte('appointment_date', today),
      // Total consultations this month
      db.from('consultations').select('id', { count: 'exact', head: true }).eq('is_deleted', false).gte('consultation_date', startOfMonth).lte('consultation_date', endOfMonth),
      // Monthly revenue
      db.from('payments').select('amount').eq('is_deleted', false).eq('status', 'COMPLETED').gte('payment_date', startOfMonth).lte('payment_date', endOfMonth),
      // Pending dues
      db.from('invoices').select('total_amount, paid_amount').eq('is_deleted', false).in('status', ['PENDING', 'OVERDUE', 'PARTIAL']),
      // Recent patients
      db.from('patients').select('id, first_name, last_name, uhid, phone, last_visit_date, total_visits').eq('is_deleted', false).order('created_at', { ascending: false }).limit(5),
      // Appointments by status today
      db.from('appointments').select('status').eq('is_deleted', false).eq('appointment_date', today),
    ]);

    const totalRevenue = (monthlyRevenue.data || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const pendingAmount = (pendingDues.data || []).reduce((sum: number, inv: any) => sum + ((inv.total_amount || 0) - (inv.paid_amount || 0)), 0);

    // Group appointments by status
    const statusCounts: Record<string, number> = {};
    (appointmentsByStatus.data || []).forEach((a: any) => {
      statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
    });

    return {
      totalPatients: totalPatients.count || 0,
      newPatientsToday: newPatientsToday.count || 0,
      todayAppointments: todayAppointments.count || 0,
      completedToday: completedToday.count || 0,
      pendingAppointments: pendingAppointments.count || 0,
      totalConsultationsMonth: totalConsultations.count || 0,
      totalRevenue,
      pendingDues: pendingAmount,
      recentPatients: (recentPatients.data || []) as any,
      appointmentsByStatus: statusCounts as Record<AppointmentStatus, number>,
    };
  }

  async getTodayAppointments(params: {
    clinicId?: string;
    doctorId?: string;
  }): Promise<DashboardAppointment[]> {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];

    let query = db
      .from('appointments')
      .select(`
        id, appointment_time, appointment_type, status, reason,
        patient:patients(id, first_name, last_name, phone, uhid),
        doctor:users(id, first_name, last_name),
        clinic:clinics(id, name)
      `)
      .eq('is_deleted', false)
      .eq('appointment_date', today)
      .order('appointment_time', { ascending: true });

    if (params.clinicId) query = query.eq('clinic_id', params.clinicId);
    if (params.doctorId) query = query.eq('doctor_id', params.doctorId);

    const { data, error } = await query;
    if (error) return [];
    return (data || []) as unknown as DashboardAppointment[];
  }

  async getRecentConsultations(params: {
    clinicId?: string;
    doctorId?: string;
    limit?: number;
  }): Promise<DashboardConsultation[]> {
    const db = getDb();
    const limit = params.limit || 10;

    let query = db
      .from('consultations')
      .select(`
        id, consultation_date, status, chief_complaint,
        patient:patients(id, first_name, last_name, uhid),
        doctor:users(id, first_name, last_name),
        diagnoses:diagnoses(diagnosis_name, is_primary)
      `)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (params.clinicId) query = query.eq('clinic_id', params.clinicId);
    if (params.doctorId) query = query.eq('doctor_id', params.doctorId);

    const { data, error } = await query;
    if (error) return [];
    return (data || []) as unknown as DashboardConsultation[];
  }

  async getRevenueSummary(params: {
    clinicId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<DashboardRevenue[]> {
    const db = getDb();
    const startDate = params.startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const endDate = params.endDate || new Date().toISOString().split('T')[0];

    // Group by date
    const { data, error } = await db
      .from('payments')
      .select('payment_date, amount, payment_method')
      .eq('is_deleted', false)
      .eq('status', 'COMPLETED')
      .gte('payment_date', startDate)
      .lte('payment_date', endDate)
      .order('payment_date', { ascending: true });

    if (error) return [];

    // Aggregate by date
    const byDate: Record<string, DashboardRevenue> = {};
    (data || []).forEach((p: any) => {
      if (!byDate[p.payment_date]) {
        byDate[p.payment_date] = {
          date: p.payment_date,
          total: 0,
          byMethod: {},
        };
      }
      byDate[p.payment_date].total += p.amount || 0;
      byDate[p.payment_date].byMethod[p.payment_method] =
        (byDate[p.payment_date].byMethod[p.payment_method] || 0) + (p.amount || 0);
    });

    return Object.values(byDate);
  }

  async getRecentActivity(params: {
    limit?: number;
    clinicId?: string;
  }): Promise<RecentActivity[]> {
    const db = getDb();
    const limit = params.limit || 20;

    const { data, error } = await db
      .from('activity_logs')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data || []) as RecentActivity[];
  }
}

// Singleton
let _dashboardService: DashboardService | null = null;
export function getDashboardService(): DashboardService {
  if (!_dashboardService) _dashboardService = new DashboardService();
  return _dashboardService;
}
