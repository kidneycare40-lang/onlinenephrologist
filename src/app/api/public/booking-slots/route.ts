import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { applyRateLimit, apiError } from '@/lib/auth/middleware';

// Public endpoint — no auth required.
// Returns available time slots for a given service and date.
// All computation is server-side; the client never generates slots.

export async function GET(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'booking');
    if (rlError) return rlError;

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const date = searchParams.get('date'); // YYYY-MM-DD

    if (!slug || !date) {
      return apiError('slug and date are required', 400);
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return apiError('date must be YYYY-MM-DD format', 400);
    }

    const db = getDb();

    // 1. Look up service
    const { data: services } = await db
      .from('booking_services')
      .select('*')
      .eq('slug', slug)
      .eq('enabled', true)
      .limit(1);

    if (!services || services.length === 0) {
      return apiError('Service not found or not available', 404);
    }
    const service = services[0];

    // 2. Check if date is blocked by a holiday
    const { data: holidays } = await db
      .from('booking_holidays')
      .select('*')
      .eq('enabled', true)
      .lte('start_date', date)
      .gte('end_date', date);

    const blockedByHoliday = (holidays || []).some(
      (h: any) => h.scope === 'all' || h.service_id === service.id
    );

    if (blockedByHoliday) {
      return NextResponse.json({
        slug,
        date,
        slots: [],
        blocked: true,
        reason: 'holiday',
      });
    }

    // 3. Get day of week (0=Sun, 6=Sat)
    const dateObj = new Date(date + 'T12:00:00');
    const dayOfWeek = dateObj.getDay();

    // 4. Find schedule for this service + day
    const { data: schedules } = await db
      .from('booking_service_schedules')
      .select('*')
      .eq('service_id', service.id)
      .eq('day_of_week', dayOfWeek)
      .eq('enabled', true)
      .limit(1);

    if (!schedules || schedules.length === 0) {
      return NextResponse.json({
        slug,
        date,
        slots: [],
        blocked: false,
        reason: 'no_schedule',
      });
    }
    const schedule = schedules[0];

    // 5. Get periods for this schedule
    const { data: periodRows } = await db
      .from('booking_service_schedule_periods')
      .select('*')
      .eq('schedule_id', schedule.id)
      .order('sort_order', { ascending: true });

    if (!periodRows || periodRows.length === 0) {
      return NextResponse.json({
        slug,
        date,
        slots: [],
        blocked: false,
        reason: 'no_periods',
      });
    }

    // 6. Generate all possible slots from periods
    const allSlots: string[] = [];
    for (const period of periodRows) {
      const [startH, startM] = (period.start_time as string).split(':').map(Number);
      const [endH, endM] = (period.end_time as string).split(':').map(Number);
      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;
      const interval = period.slot_interval_minutes;

      let t = startMin;
      while (t < endMin) {
        const h24 = Math.floor(t / 60);
        const m = t % 60;
        const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
        const ampm = h24 >= 12 ? 'PM' : 'AM';
        allSlots.push(`${h12}:${m.toString().padStart(2, '0')} ${ampm}`);
        t += interval;
      }
    }

    // 7. Filter out past slots (if today) based on min_advance_minutes
    const now = new Date();
    const isToday = date === now.toISOString().split('T')[0];
    const minAdvanceMs = service.min_advance_minutes * 60 * 1000;

    let availableSlots = allSlots;
    if (isToday) {
      availableSlots = allSlots.filter((slot) => {
        const slotTime = parseSlotToDate(slot, date);
        return slotTime.getTime() - now.getTime() >= minAdvanceMs;
      });
    }

    // 8. Check existing bookings for this service + date
    // clinic_id in bookings table stores the service slug
    const { data: existingBookings } = await db
      .from('bookings')
      .select('booking_time, status')
      .eq('clinic_id', slug)
      .eq('booking_date', date)
      .in('status', ['pending', 'confirmed', 'booked']);

    const bookedTimes = new Set(
      (existingBookings || []).map((b: any) => b.booking_time)
    );

    // 9. Mark slots as available or booked
    const slots = availableSlots.map((time) => ({
      time,
      available: !bookedTimes.has(time),
    }));

    // 10. Check max appointments per day
    const bookingCount = (existingBookings || []).length;
    const maxReached = bookingCount >= service.max_appointments_per_day;

    return NextResponse.json({
      slug,
      date,
      slots,
      maxAppointmentsPerDay: service.max_appointments_per_day,
      currentBookingCount: bookingCount,
      maxReached,
    });
  } catch (error) {
    console.error('[booking-slots] error:', error);
    return apiError('Failed to load available slots', 500);
  }
}

// Parse a "h:mm AM/PM" slot string to a Date object on the given date
function parseSlotToDate(slotTime: string, date: string): Date {
  const match = slotTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return new Date(date + 'T00:00:00');

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();

  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  return new Date(`${date}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`);
}
