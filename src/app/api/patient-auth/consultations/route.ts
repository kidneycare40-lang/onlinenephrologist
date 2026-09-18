import { NextResponse } from 'next/server';
import { requireVerifiedAuth, getPatientConsultations } from '@/lib/patient-portal-server';

export async function GET() {
  const auth = await requireVerifiedAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error, emailVerified: auth.emailVerified ?? true }, { status: auth.status });

  const consultations = await getPatientConsultations(auth.patientAccountId);
  const res = NextResponse.json({ consultations });
  res.headers.set('Cache-Control', 'no-store, private');
  return res;
}
