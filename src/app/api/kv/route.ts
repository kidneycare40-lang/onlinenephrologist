import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { authenticateRequest, applyRateLimit } from '@/lib/auth/middleware';

function kvAuthError(): NextResponse {
  return NextResponse.json({ error: 'Authentication required for write operations' }, { status: 401 });
}

// GET /api/kv?key=xxx — public read (used by client-storage for settings/clinics)
export async function GET(req: NextRequest) {
  try {
    const rlError = applyRateLimit(req, 'kv');
    if (rlError) return rlError;

    const db = getDb();
    const key = req.nextUrl.searchParams.get('key');
    const keys = req.nextUrl.searchParams.get('keys');

    if (key) {
      const { data } = await db
        .from('app_kv_store')
        .select('store_key, store_value')
        .eq('store_key', key)
        .single();
      return NextResponse.json({ key, value: data?.store_value ?? null });
    }

    if (keys) {
      const keyList = keys.split(',').map(k => k.trim()).filter(Boolean);
      const { data } = await db
        .from('app_kv_store')
        .select('store_key, store_value')
        .in('store_key', keyList);
      const result: Record<string, any> = {};
      (data || []).forEach(row => { result[row.store_key] = row.store_value; });
      return NextResponse.json({ values: result });
    }

    const { data } = await db
      .from('app_kv_store')
      .select('store_key, store_value');
    const result: Record<string, any> = {};
    (data || []).forEach(row => { result[row.store_key] = row.store_value; });
    return NextResponse.json({ values: result });
  } catch (e) {
    console.error('[kv GET]', e);
    return NextResponse.json({ error: 'Failed to read' }, { status: 500 });
  }
}

// POST /api/kv — requires EMR auth (staff/admin only)
export async function POST(req: NextRequest) {
  try {
    const rlError = applyRateLimit(req, 'kv');
    if (rlError) return rlError;

    const { user, error: authError } = await authenticateRequest(req);
    if (authError) return kvAuthError();

    const db = getDb();
    const body = await req.json();

    if (body.entries && Array.isArray(body.entries)) {
      const rows = body.entries.map((e: { key: string; value: any }) => ({
        store_key: e.key,
        store_value: e.value,
        updated_at: new Date().toISOString(),
      }));
      const { error } = await db
        .from('app_kv_store')
        .upsert(rows, { onConflict: 'store_key' });
      if (error) throw error;
      return NextResponse.json({ ok: true, count: rows.length });
    }

    if (body.key && body.value !== undefined) {
      const { error } = await db
        .from('app_kv_store')
        .upsert({
          store_key: body.key,
          store_value: body.value,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'store_key' });
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Provide { key, value } or { entries }' }, { status: 400 });
  } catch (e) {
    console.error('[kv POST]', e);
    return NextResponse.json({ error: 'Failed to write' }, { status: 500 });
  }
}

// DELETE /api/kv?key=xxx — requires EMR auth (staff/admin only)
export async function DELETE(req: NextRequest) {
  try {
    const rlError = applyRateLimit(req, 'kv');
    if (rlError) return rlError;

    const { user, error: authError } = await authenticateRequest(req);
    if (authError) return kvAuthError();

    const db = getDb();
    const key = req.nextUrl.searchParams.get('key');
    if (!key) {
      return NextResponse.json({ error: 'Provide key param' }, { status: 400 });
    }
    await db.from('app_kv_store').delete().eq('store_key', key);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[kv DELETE]', e);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
