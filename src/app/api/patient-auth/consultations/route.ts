import { NextResponse } from 'next/server';
import { requireAuth, getPatientConsultations } from '@/lib/patient-portal-server';

export async function GET() {
  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const consultations = await getPatientConsultations(auth.patientAccountId);
  const res = NextResponse.json({ consultations });
  res.headers.set('Cache-Control', 'no-store, private');
  return res;
}
