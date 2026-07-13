import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { hashPassword } from '@/lib/auth/password';
import { checkRateLimit } from '@/lib/auth/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const { allowed } = checkRateLimit(ip, 'login');
    if (!allowed) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const { email, pin, setupKey } = body;

    if (!setupKey || setupKey !== process.env.SETUP_KEY) {
      return NextResponse.json({ error: 'Invalid setup key. Set SETUP_KEY in your environment variables.' }, { status: 403 });
    }

    if (!email || !pin || pin.length < 4 || pin.length > 6) {
      return NextResponse.json({ error: 'Valid email and 4-6 digit PIN required' }, { status: 400 });
    }

    const db = getDb();
    const { data: users } = await db
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase().trim())
      .limit(1);

    const user = users?.[0];
    if (!user) {
      return NextResponse.json({ error: 'User not found with that email' }, { status: 404 });
    }

    const pinHash = await hashPassword(pin);
    await db.from('users').update({ password_hash: pinHash }).eq('id', user.id);

    return NextResponse.json({ success: true, message: `PIN set for ${email}` });
  } catch (error) {
    console.error('INIT error:', error);
    const msg = error instanceof Error && error.message.includes('not configured')
      ? 'Server not configured. Set SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables.'
      : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
