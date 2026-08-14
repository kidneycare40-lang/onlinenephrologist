import { NextResponse } from 'next/server';
import { clearPatientCookie } from '@/lib/patient-auth-server';

export async function POST() {
  await clearPatientCookie();
  return NextResponse.json({ success: true });
}
