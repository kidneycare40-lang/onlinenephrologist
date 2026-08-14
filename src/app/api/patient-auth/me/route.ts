import { NextResponse } from 'next/server';
import { getPatientFromCookie } from '@/lib/patient-auth-server';

export async function GET() {
  const patient = await getPatientFromCookie();
  if (!patient || patient.patientId === 'pending') {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  return NextResponse.json({ patient });
}
