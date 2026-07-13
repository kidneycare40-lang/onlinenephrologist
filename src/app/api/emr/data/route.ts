import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requirePermission, applyRateLimit, apiError } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

async function getDb() {
  try { const { getSupabase } = await import('@/lib/supabase'); return getSupabase(); }
  catch { return null; }
}

export async function GET(req: NextRequest) {
  try {
    const rlError = applyRateLimit(req, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(req); if (authError) return authError;
    const permError = requirePermission(user, 'settings', 'view'); if (permError) return permError;

    const key = req.nextUrl.searchParams.get('key');
    const supabase = await getDb();
    if (!supabase) return NextResponse.json(key ? { value: null } : {});

    if (key) {
      const { data, error } = await supabase.from('emr_store').select('value').eq('key', key).single();
      if (error && error.code !== 'PGRST116') { return NextResponse.json({ value: null }); }
      return NextResponse.json({ value: data?.value ?? null });
    }

    const { data, error } = await supabase.from('emr_store').select('key, value').limit(1000);
    if (error) return NextResponse.json({});
    const store: Record<string, string> = {};
    for (const row of data || []) store[row.key] = row.value;
    return NextResponse.json(store);
  } catch { return NextResponse.json({}); }
}

export async function POST(req: NextRequest) {
  try {
    const rlError = applyRateLimit(req, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(req); if (authError) return authError;
    const permError = requirePermission(user, 'settings', 'edit'); if (permError) return permError;

    const body = await req.json();
    const supabase = await getDb();
    if (!supabase) return NextResponse.json({ ok: true, note: 'no database' });

    if (body.flush && body.queue) {
      const entries = Object.entries(body.queue) as [string, string][];
      const upserts = entries.filter(([, v]) => v !== '' && v !== null && v !== undefined).map(([k, v]) => ({ key: k, value: v }));
      const deletes = entries.filter(([, v]) => v === '' || v === null || v === undefined).map(([k]) => k);
      if (upserts.length > 0) { await supabase.from('emr_store').upsert(upserts, { onConflict: 'key' }); }
      if (deletes.length > 0) { await supabase.from('emr_store').delete().in('key', deletes); }
      return NextResponse.json({ ok: true });
    }

    const { key, value } = body;
    if (!key) return apiError('key required', 400);
    if (value === null || value === undefined || value === '') { await supabase.from('emr_store').delete().eq('key', key); }
    else { await supabase.from('emr_store').upsert({ key, value: typeof value === 'string' ? value : JSON.stringify(value) }, { onConflict: 'key' }); }
    return NextResponse.json({ ok: true });
  } catch { return apiError('Failed to save', 500); }
}
