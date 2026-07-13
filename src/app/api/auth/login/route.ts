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
      .select('id, email, first_name, last_name, role, password_hash, pin_hash, is_active')
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
      if (user.pin_hash) valid = await verifyPassword(pin, user.pin_hash);
    } else if (password) {
      const looksLikePin = /^\d{4,6}$/.test(password) && user.pin_hash;
      if (looksLikePin) valid = await verifyPassword(password, user.pin_hash);
      if (!valid && user.password_hash) valid = await verifyPassword(password, user.password_hash);
    }

    if (!valid) {
      logAudit({ userId: user.id, action: 'LOGIN', entityType: 'user_login', entityId: user.id, newValues: { status: 'failed' } });
      // No credentials configured at all — needs initial setup
      if (!user.password_hash && !user.pin_hash) {
        return NextResponse.json({ error: 'Account has no credentials configured yet. Ask an admin to run the initial setup in Settings > Users & Roles, or use the /emr/setup page.', needsSetup: true }, { status: 403 });
      }
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Auto-set password_hash from pin_hash if user only has PIN (legacy migration)
    if (!user.password_hash && user.pin_hash && password) {
      const newHash = await hashPassword(password);
      await db.from('users').update({ password_hash: newHash }).eq('id', user.id);
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
