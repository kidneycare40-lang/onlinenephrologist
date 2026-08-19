import { NextResponse } from 'next/server';
import { getPatientFromCookie } from '@/lib/patient-auth-server';

export async function GET() {
  const patient = await getPatientFromCookie();
  if (!patient || patient.patientId === 'pending') {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const res = NextResponse.json({ patient });
  res.headers.set('Cache-Control', 'no-store, private');
  return res;
}
