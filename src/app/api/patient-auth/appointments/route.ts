import { NextResponse } from 'next/server';
import {
  getPatientFromCookie,
  getPatientAppointments,
  createAppointment,
  cancelAppointment,
  checkDuplicateAppointment,
} from '@/lib/patient-auth-server';

export async function GET(req: Request) {
  const patient = await getPatientFromCookie();
  if (!patient || patient.patientId === 'pending') {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get('status') || 'all';
  const type = url.searchParams.get('type') || 'all';

  const appointments = await getPatientAppointments(patient.patientId, { status, type });
  return NextResponse.json({ appointments });
}

export async function POST(req: Request) {
  const patient = await getPatientFromCookie();
  if (!patient || patient.patientId === 'pending') {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const { appointment, duplicate } = await createAppointment({
      patient_id: patient.patientId,
      clinic_id: body.clinicId,
      clinic_name: body.clinicName,
      appointment_type: body.appointmentType,
      appointment_date: body.appointmentDate,
      appointment_time: body.appointmentTime,
      reason: body.reason,
      complaints: body.complaints,
      reports: body.reports,
      consultation_fee: body.consultationFee,
      currency: body.currency,
      payment_status: body.paymentStatus,
      payment_id: body.paymentId,
    });

    if (duplicate) {
      return NextResponse.json({
        error: 'You already have an appointment booked for this date and time.',
        existing: appointment,
      }, { status: 409 });
    }

    return NextResponse.json({ appointment, success: true });
  } catch (err: any) {
    console.error('create appointment error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create appointment.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const patient = await getPatientFromCookie();
  if (!patient || patient.patientId === 'pending') {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { appointmentId } = await req.json();
  if (!appointmentId) {
    return NextResponse.json({ error: 'Appointment ID required.' }, { status: 400 });
  }

  const ok = await cancelAppointment(appointmentId, patient.patientId);
  if (!ok) {
    return NextResponse.json({ error: 'Cannot cancel this appointment.' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
