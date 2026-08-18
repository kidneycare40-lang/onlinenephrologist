import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { authenticateRequest, requirePermission, applyRateLimit, apiError } from '@/lib/auth/middleware';

// Map the booking form payload (camelCase) to the bookings table (snake_case)
// Note: paymentStatus, paymentId, razorpayOrderId are NEVER set by the client.
// They are only set server-side via verify/webhook routes.
function toRow(body: any) {
  return {
    booking_id: body.bookingId,
    patient_id: body.patientId || null,
    patient_account_id: body.patientAccountId || null,
    first_name: body.firstName,
    last_name: body.lastName,
    phone: body.phone,
    email: body.email || null,
    age: body.age || null,
    gender: body.gender || null,
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

    // Server-side duplicate booking prevention
    // Check by patient_account_id (logged-in patients) OR by phone + date + clinic (guests)
    const cleanPhone = (body.phone || '').replace(/\D/g, '').replace(/^0+/, '').replace(/^91/, '');
    const effectiveClinicId = body.clinicId || null;
    const effectiveDate = body.date || null;
    const effectiveTime = body.time || null;

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