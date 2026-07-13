import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('emr_refresh_token')?.value;
    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
    }

    const payload = await verifyToken(refreshToken);
    if (!payload || (payload as any).type !== 'refresh') {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    const db = (await import('@/lib/db/client')).getDb();
    const { data: user } = await db
      .from('users')
      .select('id, email, first_name, last_name, role, is_active')
      .eq('id', payload.userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.is_active) {
      return NextResponse.json({ error: 'Account is deactivated. Contact admin.' }, { status: 403 });
    }

    const newAccessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: `${user.first_name} ${user.last_name}`,
    });
    const newRefreshToken = await signRefreshToken(user.id);

    const response = NextResponse.json({ token: newAccessToken });
    await setAuthCookies(newAccessToken, newRefreshToken);
    return response;

  } catch (error) {
    console.error('REFRESH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
