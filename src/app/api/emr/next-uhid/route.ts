import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { authenticateRequest } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const clinicId = request.nextUrl.searchParams.get('clinicId') || 'kcc-faridabad';
    const year = new Date().getFullYear();

    let prefix = 'KCC';
    if (clinicId === 'psri-delhi') prefix = 'PSRI';
    else if (clinicId === 'online' || clinicId === 'online-intl') prefix = 'ONLINE';

    const pattern = `${prefix}-${year}-%`;
    const db = getDb();
    const { data } = await db
      .from('patients')
      .select('uhid')
      .like('uhid', pattern)
      .order('uhid', { ascending: false })
      .limit(1);

    let seq = 1;
    if (data && data.length > 0) {
      const lastUhid = data[0].uhid;
      const parts = lastUhid.split('-');
      const lastSeq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSeq)) seq = lastSeq + 1;
    }

    const uhid = `${prefix}-${year}-${String(seq).padStart(3, '0')}`;
    return NextResponse.json({ uhid });
  } catch (error) {
    console.error('GET /api/emr/next-uhid error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
