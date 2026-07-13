import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth/jwt';
import { logAudit } from '@/lib/db/audit';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    const userId = request.headers.get('x-emr-user') || undefined;
    
    if (userId) {
      logAudit({ userId, action: 'LOGOUT', entityType: 'user_logout', entityId: userId });
    }

    await clearAuthCookies();
    response.cookies.set('emr_token', '', { maxAge: 0, path: '/' });
    response.cookies.set('emr_refresh_token', '', { maxAge: 0, path: '/' });
    
    return response;
  } catch (error) {
    console.error('LOGOUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
