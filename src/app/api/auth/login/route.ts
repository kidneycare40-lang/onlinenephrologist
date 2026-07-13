import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth/jwt';
import { checkRateLimit } from '@/lib/auth/rate-limit';
import { logAudit } from '@/lib/db/audit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const { allowed } = checkRateLimit(ip, 'login');
    if (!allowed) {
      return NextResponse.json({ error: 'Too many login attempts. Try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const { email, password, pin } = body;

    if (!email || (!password && !pin)) {
      return NextResponse.json({ error: 'Email and password or PIN are required' }, { status: 400 });
    }

    const db = getDb();
    const { data: users, error } = await db
      .from('users')
      .select('id, email, first_name, last_name, role, password_hash, is_active')
      .eq('email', email.toLowerCase().trim())
      .limit(1);

    if (error || !users || users.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const user = users[0];

    if (!user.is_active) {
      logAudit({ userId: user.id, action: 'LOGIN', entityType: 'user_login', entityId: user.id, newValues: { status: 'blocked_inactive' } });
      return NextResponse.json({ error: 'Account is deactivated. Contact admin.' }, { status: 403 });
    }

    let valid = false;

    if (pin) {
      if (user.password_hash) valid = await verifyPassword(pin, user.password_hash);
    } else if (password) {
      if (user.password_hash) valid = await verifyPassword(password, user.password_hash);
    }

    if (!valid) {
      logAudit({ userId: user.id, action: 'LOGIN', entityType: 'user_login', entityId: user.id, newValues: { status: 'failed' } });
      if (!user.password_hash) {
        return NextResponse.json({ error: 'Account has no credentials configured yet. Go to the /emr/setup page to set your PIN.', needsSetup: true }, { status: 403 });
      }
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const accessToken = await signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: `${user.first_name} ${user.last_name}`,
    });
    const refreshToken = await signRefreshToken(user.id);

    await db.from('users').update({ last_login_at: new Date().toISOString() }).eq('id', user.id);

    logAudit({ userId: user.id, action: 'LOGIN', entityType: 'user_login', entityId: user.id, newValues: { status: 'success' } });

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
      token: accessToken,
    });

    await setAuthCookies(accessToken, refreshToken);
    return response;

  } catch (error) {
    console.error('LOGIN error:', error);
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
