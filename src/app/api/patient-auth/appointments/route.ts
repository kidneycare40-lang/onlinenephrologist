import { NextResponse } from 'next/server';
import {
  getPatientFromCookie,
  getPatientBookings,
  cancelBooking,
} from '@/lib/patient-auth-server';

export async function GET(req: Request) {
  const patient = await getPatientFromCookie();
  if (!patient || patient.patientId === 'pending') {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get('status') || 'all';
  const type = url.searchParams.get('type') || 'all';

  const bookings = await getPatientBookings(patient.patientId, { status, type });
  return NextResponse.json({ bookings });
}

export async function DELETE(req: Request) {
  const patient = await getPatientFromCookie();
  if (!patient || patient.patientId === 'pending') {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { bookingId } = await req.json();
  if (!bookingId) {
    return NextResponse.json({ error: 'Booking ID required.' }, { status: 400 });
  }

  const ok = await cancelBooking(bookingId, patient.patientId);
  if (!ok) {
    return NextResponse.json({ error: 'Cannot cancel this booking.' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
