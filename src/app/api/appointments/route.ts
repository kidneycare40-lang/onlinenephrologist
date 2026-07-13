import { NextRequest, NextResponse } from 'next/server';
import { getAppointmentService } from '@/lib/db/services';
import { authenticateRequest, requirePermission, applyRateLimit, withAudit, apiError } from '@/lib/auth/middleware';
import type { FilterParams, PaginationParams, SortParams } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api');
    if (rlError) return rlError;

    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const permError = requirePermission(user, 'appointments', 'view');
    if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const appointmentService = getAppointmentService();

    const id = searchParams.get('id');
    if (id) {
      const appointment = await appointmentService.getById(id);
      if (!appointment) return apiError('Appointment not found', 404);
      return NextResponse.json(appointment);
    }

    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate && endDate) {
      const doctorId = searchParams.get('doctorId') || undefined;
      const clinicId = searchParams.get('clinicId') || undefined;
      const appointments = await appointmentService.getByDateRange(startDate, endDate, doctorId, clinicId);
      return NextResponse.json(appointments);
    }

    const patientId = searchParams.get('patientId');
    if (patientId) {
      const appointments = await appointmentService.getByPatient(patientId);
      return NextResponse.json(appointments);
    }

    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');
    if (doctorId && date) {
      const appointments = await appointmentService.getByDoctorAndDate(doctorId, date);
      return NextResponse.json(appointments);
    }

    const filters: FilterParams = {};
    const pagination: PaginationParams = {};
    const sort: SortParams = {};

    if (searchParams.get('search')) filters.search = searchParams.get('search')!;
    if (searchParams.get('clinicId')) filters.clinicId = searchParams.get('clinicId')!;
    if (searchParams.get('status')) filters.status = searchParams.get('status')!;
    if (searchParams.get('page')) pagination.page = parseInt(searchParams.get('page')!);
    if (searchParams.get('limit')) pagination.limit = parseInt(searchParams.get('limit')!);

    const result = await appointmentService.list({ filters, pagination, sort });
    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/appointments error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'booking');
    if (rlError) return rlError;

    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const permError = requirePermission(user, 'appointments', 'create');
    if (permError) return permError;

    const body = await request.json();
    const appointmentService = getAppointmentService();

    if (!body.patient_id || !body.doctor_id || !body.clinic_id || !body.appointment_date || !body.appointment_time) {
      return apiError('Patient, doctor, clinic, date, and time are required', 400);
    }

    const appointment = await appointmentService.create(body, user!.userId);
    withAudit('CREATE', 'appointment', user!.userId, appointment?.id, undefined, {
      patient_id: body.patient_id, doctor_id: body.doctor_id, date: body.appointment_date, time: body.appointment_time
    });
    return NextResponse.json(appointment, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/appointments error:', error);
    if (error?.message === 'Slot already booked') return apiError('This time slot is already booked', 409);
    return apiError('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api');
    if (rlError) return rlError;

    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const permError = requirePermission(user, 'appointments', 'edit');
    if (permError) return permError;

    const body = await request.json();
    const { id, action, ...updateData } = body;
    if (!id) return apiError('Appointment ID is required', 400);

    const appointmentService = getAppointmentService();

    if (action === 'cancel') {
      const cancelPerm = requirePermission(user, 'appointments', 'cancel');
      if (cancelPerm) return cancelPerm;

      const appointment = await appointmentService.cancel(id);
      withAudit('UPDATE', 'appointment', user!.userId, id, undefined, { status: 'CANCELLED' });
      return NextResponse.json(appointment);
    }

    if (action === 'reschedule' && updateData.newDate && updateData.newTime) {
      const reschedulePerm = requirePermission(user, 'appointments', 'reschedule');
      if (reschedulePerm) return reschedulePerm;

      const appointment = await appointmentService.reschedule(id, updateData.newDate, updateData.newTime);
      withAudit('UPDATE', 'appointment', user!.userId, id, undefined, { rescheduled: true, date: updateData.newDate, time: updateData.newTime });
      return NextResponse.json(appointment);
    }

    if (action === 'checkin') {
      const appointment = await appointmentService.updateStatus(id, 'CHECKED_IN');
      return NextResponse.json(appointment);
    }

    const appointment = await appointmentService.updateStatus(id, updateData.status || 'SCHEDULED');
    withAudit('UPDATE', 'appointment', user!.userId, id, undefined, { status: updateData.status });
    return NextResponse.json(appointment);
  } catch (error: any) {
    console.error('PUT /api/appointments error:', error);
    if (error?.message === 'New slot already booked') return apiError('The new time slot is already booked', 409);
    return apiError('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api');
    if (rlError) return rlError;

    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const permError = requirePermission(user, 'appointments', 'cancel');
    if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return apiError('Appointment ID is required', 400);

    const appointmentService = getAppointmentService();
    const success = await appointmentService.delete(id);
    if (!success) return apiError('Appointment not found', 404);

    withAudit('DELETE', 'appointment', user!.userId, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/appointments error:', error);
    return apiError('Internal server error', 500);
  }
}
