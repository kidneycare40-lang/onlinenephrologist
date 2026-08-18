import { NextResponse } from 'next/server';
import {
  requireAuth,
  getActiveFollowUpEntitlement,
  getAllFollowUpEntitlements,
  expireOldEntitlements,
} from '@/lib/patient-portal-server';

/** GET: Check follow-up eligibility and list all entitlements */
export async function GET() {
  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  // Expire old ones first
  await expireOldEntitlements(auth.patientAccountId);

  const [active, all] = await Promise.all([
    getActiveFollowUpEntitlement(auth.patientAccountId),
    getAllFollowUpEntitlements(auth.patientAccountId),
  ]);

  return NextResponse.json({
    activeEntitlement: active,
    allEntitlements: all,
    isEligible: !!active,
    validUntil: active?.valid_until || null,
    remainingDays: active
      ? Math.ceil((new Date(active.valid_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0,
  });
}
