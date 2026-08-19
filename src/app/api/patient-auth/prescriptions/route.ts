import { NextResponse } from 'next/server';
import { requireAuth, getPatientPrescriptions } from '@/lib/patient-portal-server';

export async function GET() {
  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const prescriptions = await getPatientPrescriptions(auth.patientAccountId);
  const res = NextResponse.json({ prescriptions });
  res.headers.set('Cache-Control', 'no-store, private');
  return res;
}
