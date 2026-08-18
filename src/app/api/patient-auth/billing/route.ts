import { NextResponse } from 'next/server';
import { requireAuth, getPatientInvoices, getPatientBookingPayments } from '@/lib/patient-portal-server';

export async function GET() {
  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const [invoices, bookingPayments] = await Promise.all([
    getPatientInvoices(auth.patientAccountId),
    getPatientBookingPayments(auth.patientAccountId),
  ]);

  return NextResponse.json({ invoices, bookingPayments });
}
