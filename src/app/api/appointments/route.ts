import { NextRequest, NextResponse } from 'next/server';
import { getAppointmentService } from '@/lib/db/services';
import type { FilterParams, PaginationParams, SortParams } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appointmentService = getAppointmentService();

    const id = searchParams.get('id');
    if (id) {
      const appointment = await appointmentService.getById(id);
      if (!appointment) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }
      return NextResponse.json(appointment);
    }

    // Filter by date range
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate && endDate) {
      const doctorId = searchParams.get('doctorId') || undefined;
      const clinicId = searchParams.get('clinicId') || undefined;
      const appointments = await appointmentService.getByDateRange(startDate, endDate, doctorId, clinicId);
      return NextResponse.json(appointments);
    }

    // Filter by patient
    const patientId = searchParams.get('patientId');
    if (patientId) {
      const appointments = await appointmentService.getByPatient(patientId);
      return NextResponse.json(appointments);
    }

    // Filter by doctor + date
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');
    if (doctorId && date) {
      const appointments = await appointmentService.getByDoctorAndDate(doctorId, date);
      return NextResponse.json(appointments);
    }

    // List with pagination
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const appointmentService = getAppointmentService();

    if (!body.patient_id || !body.doctor_id || !body.clinic_id || !body.appointment_date || !body.appointment_time) {
      return NextResponse.json(
        { error: 'Patient, doctor, clinic, date, and time are required' },
        { status: 400 }
      );
    }

    const appointment = await appointmentService.create(body, body.created_by);
    return NextResponse.json(appointment, { status: 201 });

  } catch (error: any) {
    console.error('POST /api/appointments error:', error);

    if (error?.message === 'Slot already booked') {
      return NextResponse.json({ error: 'This time slot is already booked' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
    }

    const appointmentService = getAppointmentService();

    // Handle special actions
    if (action === 'cancel') {
      const appointment = await appointmentService.cancel(id);
      return NextResponse.json(appointment);
    }

    if (action === 'reschedule' && updateData.newDate && updateData.newTime) {
      const appointment = await appointmentService.reschedule(id, updateData.newDate, updateData.newTime);
      return NextResponse.json(appointment);
    }

    if (action === 'checkin') {
      const appointment = await appointmentService.updateStatus(id, 'CHECKED_IN');
      return NextResponse.json(appointment);
    }

    // Regular update
    const appointment = await appointmentService.updateStatus(id, updateData.status || 'SCHEDULED');
    return NextResponse.json(appointment);

  } catch (error: any) {
    console.error('PUT /api/appointments error:', error);

    if (error?.message === 'New slot already booked') {
      return NextResponse.json({ error: 'The new time slot is already booked' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
    }

    const appointmentService = getAppointmentService();
    const success = await appointmentService.delete(id);
    if (!success) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('DELETE /api/appointments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
