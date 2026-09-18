import { NextResponse } from 'next/server';
import { requireVerifiedAuth, getPatientReports } from '@/lib/patient-portal-server';

export async function GET() {
  const auth = await requireVerifiedAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error, emailVerified: auth.emailVerified ?? true }, { status: auth.status });

  const reports = await getPatientReports(auth.patientAccountId);
  const res = NextResponse.json({ reports });
  res.headers.set('Cache-Control', 'no-store, private');
  return res;
}
