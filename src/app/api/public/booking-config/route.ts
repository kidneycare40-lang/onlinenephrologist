import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { applyRateLimit, apiError } from '@/lib/auth/middleware';

// Public endpoint — no auth required.
// Returns all booking configuration the public /book-appointment page needs.
// Response is safe to expose: no secrets, no internal IDs beyond UUIDs.
export async function GET(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'booking');
    if (rlError) return rlError;

    const db = getDb();

    // 1. Fetch all enabled services
    const { data: services, error: svcErr } = await db
      .from('booking_services')
      .select('*')
      .eq('enabled', true)
      .order('fee', { ascending: true });

    if (svcErr) {
      console.error('[booking-config] services error:', svcErr);
      return apiError('Failed to load booking configuration', 500);
    }

    // 2. Fetch all schedules + periods for enabled services
    const serviceIds = (services || []).map((s: any) => s.id);

    let schedules: any[] = [];
    let periods: any[] = [];

    if (serviceIds.length > 0) {
      const { data: schedData } = await db
        .from('booking_service_schedules')
        .select('*')
        .in('service_id', serviceIds)
        .eq('enabled', true);

      schedules = schedData || [];

      const scheduleIds = schedules.map((s: any) => s.id);
      if (scheduleIds.length > 0) {
        const { data: periodData } = await db
          .from('booking_service_schedule_periods')
          .select('*')
          .in('schedule_id', scheduleIds)
          .order('sort_order', { ascending: true });

        periods = periodData || [];
      }
    }

    // 3. Fetch upcoming holidays (from today onward, enabled)
    const today = new Date().toISOString().split('T')[0];
    const { data: holidays } = await db
      .from('booking_holidays')
      .select('*')
      .eq('enabled', true)
      .gte('end_date', today)
      .order('start_date', { ascending: true });

    // 4. Fetch settings
    const { data: settingsRows } = await db
      .from('booking_settings')
      .select('setting_key, setting_value, description');

    // Convert settings array to a keyed object
    const settings: Record<string, any> = {};
    (settingsRows || []).forEach((row: any) => {
      settings[row.setting_key] = row.setting_value;
    });

    // 5. Build response — group schedules/periods by service
    const servicesWithSchedule = (services || []).map((svc: any) => {
      const svcSchedules = schedules.filter((s: any) => s.service_id === svc.id);
      const scheduleData = svcSchedules.map((sched: any) => ({
        id: sched.id,
        dayOfWeek: sched.day_of_week,
        enabled: sched.enabled,
        periods: periods
          .filter((p: any) => p.schedule_id === sched.id)
          .map((p: any) => ({
            id: p.id,
            startTime: p.start_time,
            endTime: p.end_time,
            slotIntervalMinutes: p.slot_interval_minutes,
            sortOrder: p.sort_order,
          })),
      }));

      return {
        id: svc.id,
        slug: svc.slug,
        name: svc.name,
        clinicName: svc.clinic_name,
        clinicType: svc.clinic_type,
        consultationType: svc.consultation_type,
        address: svc.address,
        city: svc.city,
        state: svc.state,
        country: svc.country,
        timezone: svc.timezone,
        mapsUrl: svc.maps_url,
        fee: Number(svc.fee),
        currency: svc.currency,
        feeLabel: svc.fee_label,
        description: svc.description,
        maxAppointmentsPerDay: svc.max_appointments_per_day,
        minAdvanceMinutes: svc.min_advance_minutes,
        maxAdvanceDays: svc.max_advance_days,
        schedules: scheduleData,
      };
    });

    // Format holidays for public consumption
    const publicHolidays = (holidays || []).map((h: any) => ({
      id: h.id,
      startDate: h.start_date,
      endDate: h.end_date,
      title: h.title,
      reason: h.reason,
      scope: h.scope,
      serviceId: h.service_id,
    }));

    return NextResponse.json({
      services: servicesWithSchedule,
      settings,
      holidays: publicHolidays,
    });
  } catch (error) {
    console.error('[booking-config] error:', error);
    return apiError('Failed to load booking configuration', 500);
  }
}
