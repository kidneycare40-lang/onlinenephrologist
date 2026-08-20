import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { authenticateRequest, requirePermission, applyRateLimit, apiError } from '@/lib/auth/middleware';
import { autoBridgeFromBooking, getEmrPatientId, ensureEmrBridge } from '@/lib/patient-portal-server';

// Find or create an EMR patient record for a relative.
// Matches by name + DOB to avoid duplicates; falls back to phone match.
async function findOrCreateEmrPatientForRelative(data: {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  countryCode?: string;
}): Promise<string | null> {
  const db = getDb();
  const clean = (s: string) => (s || '').trim().toLowerCase();

  // 1. Try match by first_name + last_name + date_of_birth
  if (data.dateOfBirth) {
    const { data: existing } = await db
      .from('patients')
      .select('id')
      .ilike('first_name', data.firstName)
      .ilike('last_name', data.lastName)
      .eq('date_of_birth', data.dateOfBirth)
      .eq('is_deleted', false)
      .limit(1);
    if (existing && existing.length > 0) return existing[0].id;
  }

  // 2. Try match by phone — ONLY when DOB was also provided (phone as supporting evidence, not sole identity)
  // If DOB is missing, we skip phone-only matching to avoid false merges on shared/family numbers.
  if (data.phone && data.dateOfBirth) {
    const cleanPhone = data.phone.replace(/\D/g, '');
    const { data: byPhone } = await db
      .from('patients')
      .select('id, first_name, last_name, date_of_birth')
      .or(`phone.eq.${cleanPhone},phone.eq.${data.phone}`)
      .eq('is_deleted', false)
      .limit(5);
    // Only match if the phone-based result also matches the name (fuzzy)
    if (byPhone && byPhone.length > 0) {
      const match = byPhone.find((p: any) =>
        p.first_name?.toLowerCase().trim() === data.firstName.toLowerCase().trim() &&
        p.last_name?.toLowerCase().trim() === data.lastName.toLowerCase().trim()
      );
      if (match) return match.id;
    }
  }

  // 3. Create new EMR patient record
  const uhidNum = String(Math.floor(Math.random() * 9000) + 1000);
  const uhid = `ONLINE-${new Date().getFullYear()}/${uhidNum}`;

  const patientRow: Record<string, unknown> = {
    uhid,
    first_name: data.firstName.trim(),
    last_name: data.lastName.trim(),
    is_active: true,
    is_chronic: false,
    is_international: false,
    country_code: data.countryCode || '+91',
    preferred_language: 'English',
  };
  if (data.dateOfBirth) patientRow.date_of_birth = data.dateOfBirth;
  if (data.gender) patientRow.gender = data.gender;
  if (data.phone) patientRow.phone = data.phone.replace(/\D/g, '');

  const { data: newPatient, error } = await db
    .from('patients')
    .insert(patientRow)
    .select('id')
    .single();

  if (error) {
    console.error('[findOrCreateEmrPatientForRelative] insert error:', error);
    return null;
  }
  return newPatient?.id || null;
}

// Map the booking form payload (camelCase) to the bookings table (snake_case)
// Note: paymentStatus, paymentId, razorpayOrderId are NEVER set by the client.
// They are only set server-side via verify/webhook routes.
function toRow(body: any) {
  return {
    booking_id: body.bookingId,
    patient_id: body.patientId || null,
    patient_account_id: body.patientAccountId || null,
    booked_by_patient_account_id: body.bookedByPatientAccountId || body.patientAccountId || null,
    relationship: body.relationship || 'self',
    actual_patient_id: body.actualPatientId || null,
    first_name: body.firstName,
    last_name: body.lastName,
    phone: body.phone,
    email: body.email || null,
    age: body.age || null,
    gender: body.gender || null,
    current_location: body.currentLocation || null,
    country: body.country || null,
    timezone: body.timezone || null,
    preferred_language: body.preferredLanguage || null,
    interpreter_required: !!body.interpreterRequired,
    consultation_type: body.consultationType || 'online',
    clinic_id: body.clinicId || null,
    booking_date: body.date || null,
    booking_time: body.time || null,
    reason: body.reason || null,
    complaints: body.complaints || null,
    current_medications: body.currentMedications || body.medicines || null,
    notes: body.notes || null,
    previous_kidney_issue: body.previousKidneyIssue || null,
    report_files: body.reportFiles || [],
    ultrasound_file: body.ultrasoundFile || null,
    booking_medicines: body.bookingMedicines || [],
    consultation_fee: body.consultationFee ?? null,
    consultation_fee_currency: body.consultationFeeCurrency || 'INR',
    payment_status: 'unpaid',
    payment_id: null,
    razorpay_order_id: null,
    doctor_name: body.doctorName || 'Dr Rajesh Goel',
    status: body.status || 'pending',
  };
}

// Map a bookings table row back to the booking form shape used by the EMR
function rowToBooking(row: any) {
  return {
    bookingId: row.booking_id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    email: row.email || '',
    age: row.age || '',
    gender: row.gender || '',
    currentLocation: row.current_location || 'india',
    country: row.country || '',
    timezone: row.timezone || '',
    preferredLanguage: row.preferred_language || '',
    interpreterRequired: !!row.interpreter_required,
    consultationType: row.consultation_type,
    clinicId: row.clinic_id || '',
    date: row.booking_date || '',
    time: row.booking_time || '',
    reason: row.reason || '',
    complaints: row.complaints || '',
    currentMedications: row.current_medications || '',
    medicines: row.current_medications || '',
    notes: row.notes || '',
    previousKidneyIssue: row.previous_kidney_issue || '',
    reportFiles: row.report_files || [],
    ultrasoundFile: row.ultrasound_file || null,
    bookingMedicines: row.booking_medicines || [],
    consultationFee: row.consultation_fee ?? 0,
    consultationFeeCurrency: row.consultation_fee_currency || 'INR',
    paymentStatus: row.payment_status || 'unpaid',
    paymentId: row.payment_id || '',
    razorpayOrderId: row.razorpay_order_id || '',
    doctorName: row.doctor_name || '',
    status: row.status || 'pending',
    createdAt: row.created_at || '',
    bookedByPatientAccountId: row.booked_by_patient_account_id || null,
    relationship: row.relationship || 'self',
    actualPatientId: row.actual_patient_id || null,
  };
}

// POST — public booking form (no auth)
export async function POST(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'booking');
    if (rlError) return rlError;

    const body = await request.json();
    if (!body.bookingId || !body.firstName || !body.phone) {
      return apiError('bookingId, firstName, and phone are required', 400);
    }

    const db = getDb();

    // Idempotency: a booking with the same booking_id is not created twice
    const { data: existing } = await db
      .from('bookings')
      .select('booking_id')
      .eq('booking_id', body.bookingId)
      .limit(1);
    if (existing && existing.length > 0) {
      return NextResponse.json({ success: true, bookingId: body.bookingId, alreadyExists: true });
    }

    const effectiveClinicId = body.clinicId || null;
    const effectiveDate = body.date || null;
    const effectiveTime = body.time || null;

    // ─── SERVER-SIDE BOOKING VALIDATIONS ───────────────────────────

    // TEST 16: current_location outside_india + consultationType online → rejected
    // TEST 15: current_location india + consultationType online_intl → rejected
    if (body.currentLocation && body.consultationType) {
      const loc = body.currentLocation; // 'india' or 'outside_india'
      const ct = body.consultationType; // 'online', 'online_intl', 'offline', 'hospital'

      if (loc === 'outside_india' && ct !== 'online_intl') {
        return apiError('Patients currently outside India must select International Video Consultation.', 400);
      }
      if (loc === 'india' && ct === 'online_intl') {
        return apiError('International consultation is only available for patients currently located outside India.', 400);
      }
    }

    // Validate service exists and is enabled (TEST 7, 8: disabled/invalid service)
    if (effectiveClinicId) {
      const { data: svc } = await db
        .from('booking_services')
        .select('id, max_advance_days, min_advance_minutes, max_appointments_per_day')
        .eq('slug', effectiveClinicId)
        .eq('enabled', true)
        .limit(1);

      if (!svc || svc.length === 0) {
        return apiError('This consultation service is not currently available.', 400);
      }
      const service = svc[0];

      // TEST 13: Beyond maxAdvance — reject if date exceeds max_advance_days from today
      if (effectiveDate) {
        const bookingDate = new Date(effectiveDate + 'T12:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const maxDate = new Date(today);
        maxDate.setDate(maxDate.getDate() + service.max_advance_days);

        if (bookingDate < today) {
          return apiError('Cannot book appointments in the past.', 400);
        }
        if (bookingDate > maxDate) {
          return apiError(`Cannot book more than ${service.max_advance_days} days in advance.`, 400);
        }
      }

      // TEST 12: Past slot + TEST 11: Unavailable slot + TEST 14: Max appointments
      if (effectiveDate && effectiveTime) {
        // Check holiday
        const { data: holidays } = await db
          .from('booking_holidays')
          .select('id')
          .eq('enabled', true)
          .lte('start_date', effectiveDate)
          .gte('end_date', effectiveDate);

        const blocked = (holidays || []).some(
          (h: any) => h.scope === 'all' || h.service_id === service.id
        );
        if (blocked) {
          return apiError('This date is blocked (holiday). Please choose another date.', 400);
        }

        // Check schedule exists for this day of week
        const dateObj = new Date(effectiveDate + 'T12:00:00');
        const dayOfWeek = dateObj.getDay();

        const { data: schedules } = await db
          .from('booking_service_schedules')
          .select('id')
          .eq('service_id', service.id)
          .eq('day_of_week', dayOfWeek)
          .eq('enabled', true)
          .limit(1);

        if (!schedules || schedules.length === 0) {
          return apiError('This service is not available on the selected day.', 400);
        }

        // Check slot exists in the schedule periods (TEST 11: unavailable slot)
        const { data: periodRows } = await db
          .from('booking_service_schedule_periods')
          .select('start_time, end_time, slot_interval_minutes')
          .eq('schedule_id', schedules[0].id)
          .order('sort_order', { ascending: true });

        const validSlots = new Set<string>();
        for (const period of periodRows || []) {
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
            validSlots.add(`${h12}:${m.toString().padStart(2, '0')} ${ampm}`);
            t += interval;
          }
        }

        if (!validSlots.has(effectiveTime)) {
          return apiError('The selected time slot is not available for this service.', 400);
        }

        // TEST 12: Past slot — reject if today + time has already passed
        const now = new Date();
        const isToday = effectiveDate === now.toISOString().split('T')[0];
        if (isToday) {
          const slotDate = parseSlotToDate(effectiveTime, effectiveDate);
          if (slotDate.getTime() < now.getTime()) {
            return apiError('Cannot book appointments in the past.', 400);
          }
        }

        // TEST 14: Max appointments per day
        const { count } = await db
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('clinic_id', effectiveClinicId)
          .eq('booking_date', effectiveDate)
          .in('status', ['pending', 'confirmed', 'booked']);

        if ((count || 0) >= service.max_appointments_per_day) {
          return apiError('This date is fully booked. Please choose another date.', 400);
        }
      }
    }

    // ─── SERVER-SIDE BOOKING VALIDATIONS END ───────────────────────

    // Server-side duplicate booking prevention
    // Check by patient_account_id (logged-in patients) OR by phone + date + clinic (guests)
    const cleanPhone = (body.phone || '').replace(/\D/g, '').replace(/^0+/, '').replace(/^91/, '');

    if (effectiveClinicId && effectiveDate && effectiveTime) {
      // Build OR conditions: account match OR phone match
      const orConditions = [];
      if (body.patientAccountId) {
        orConditions.push(`patient_account_id.eq.${body.patientAccountId}`);
      }
      if (cleanPhone.length >= 6) {
        orConditions.push(`phone.ilike.%${cleanPhone}%`);
      }

      if (orConditions.length > 0) {
        const { data: duplicates } = await db
          .from('bookings')
          .select('booking_id, first_name, last_name, phone, booking_date, booking_time, status')
          .eq('clinic_id', effectiveClinicId)
          .eq('booking_date', effectiveDate)
          .eq('booking_time', effectiveTime)
          .or(orConditions.join(','))
          .in('status', ['pending', 'confirmed', 'booked'])
          .limit(5);

        if (duplicates && duplicates.length > 0) {
          const isOwn = duplicates.some(
            (d) => body.patientAccountId && d.first_name?.toLowerCase() === (body.firstName || '').toLowerCase()
          );
          return apiError(
            isOwn
              ? 'You already have an appointment booked for this date and time.'
              : 'An appointment already exists for this patient at this date and time.',
            409,
            { existing: duplicates[0] }
          );
        }
      }
    }

    const { error } = await db.from('bookings').insert(toRow(body));
    if (error) {
      console.error('POST /api/bookings insert error:', error);
      return apiError('Failed to save booking', 500);
    }

    // Resolve the actual EMR patient for this booking
    const relationship = body.relationship || 'self';
    const isFamilyBooking = relationship !== 'self' && body.patientAccountId;

    if (isFamilyBooking) {
      // Family booking: create/find EMR patient for the relative
      try {
        const emrPatientId = await findOrCreateEmrPatientForRelative({
          firstName: body.firstName,
          lastName: body.lastName,
          dateOfBirth: body.patientDateOfBirth || undefined,
          gender: body.gender || undefined,
          phone: body.patientPhone || body.phone || undefined,
          countryCode: body.countryCode || undefined,
        });
        if (emrPatientId) {
          await db.from('bookings').update({ actual_patient_id: emrPatientId }).eq('booking_id', body.bookingId);
        }
      } catch (e) {
        console.error('[bookings] Failed to create EMR patient for relative:', e);
      }
    } else if (body.patientAccountId) {
      // Self-booking: resolve EMR patient via bridge, create if missing
      try {
        await autoBridgeFromBooking(body.patientAccountId, body.phone || '');
        let emrPatientId = await getEmrPatientId(body.patientAccountId);
        if (!emrPatientId) {
          // No bridge exists — create EMR patient from the booking/account data
          emrPatientId = await findOrCreateEmrPatientForRelative({
            firstName: body.firstName,
            lastName: body.lastName,
            dateOfBirth: body.patientDateOfBirth || undefined,
            gender: body.gender || undefined,
            phone: body.phone || undefined,
            countryCode: body.countryCode || undefined,
          });
          if (emrPatientId) {
            await ensureEmrBridge(body.patientAccountId, emrPatientId);
          }
        }
        if (emrPatientId) {
          await db.from('bookings').update({ actual_patient_id: emrPatientId }).eq('booking_id', body.bookingId);
        }
      } catch {
        // Non-blocking
      }
    }

    return NextResponse.json({ success: true, bookingId: body.bookingId }, { status: 201 });
  } catch (error) {
    console.error('POST /api/bookings error:', error);
    return apiError('Internal server error', 500);
  }
}

// GET — authenticated (EMR). ?id= returns one booking, otherwise lists
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const permError = requirePermission(user, 'consultations', 'view');
    if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const db = getDb();

    const id = searchParams.get('id');
    if (id) {
      const { data, error } = await db
        .from('bookings')
        .select('*')
        .eq('booking_id', id)
        .limit(1);
      if (error) return apiError('Failed to load booking', 500);
      if (!data || data.length === 0) return apiError('Booking not found', 404);
      return NextResponse.json(rowToBooking(data[0]));
    }

    let query = db.from('bookings').select('*').order('created_at', { ascending: false });
    const clinicId = searchParams.get('clinicId');
    if (clinicId) query = query.eq('clinic_id', clinicId);
    const limit = parseInt(searchParams.get('limit') || '100');
    query = query.limit(Math.min(limit, 500));

    const { data, error } = await query;
    if (error) {
      console.error('GET /api/bookings error:', error);
      return apiError('Failed to load bookings', 500);
    }
    return NextResponse.json((data || []).map(rowToBooking));
  } catch (error) {
    console.error('GET /api/bookings error:', error);
    return apiError('Internal server error', 500);
  }
}

// PUT — authenticated (EMR). Update status / payment status of a booking
export async function PUT(request: NextRequest) {
  try {
    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const permError = requirePermission(user, 'consultations', 'edit');
    if (permError) return permError;

    const body = await request.json();
    const { bookingId } = body;
    if (!bookingId) return apiError('bookingId is required', 400);

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.status) updates.status = body.status;
    if (body.paymentStatus) updates.payment_status = body.paymentStatus;
    if (body.paymentId) updates.payment_id = body.paymentId;

    const db = getDb();
    const { error } = await db.from('bookings').update(updates).eq('booking_id', bookingId);
    if (error) return apiError('Failed to update booking', 500);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/bookings error:', error);
    return apiError('Internal server error', 500);
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