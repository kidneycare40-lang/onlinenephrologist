import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { authenticateRequest, applyRateLimit, apiError } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

function getDb() { try { return getSupabase(); } catch { return null; } }

export async function GET(req: NextRequest) {
  try {
    const rlError = applyRateLimit(req, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(req); if (authError) return authError;

    const clinicId = req.nextUrl.searchParams.get('clinicId');
    if (!clinicId) return apiError('clinicId required', 400);
    const supabase = getDb();
    if (!supabase) return NextResponse.json({ header: '', footer: '' });

    const result: { header?: string; footer?: string } = {};
    const keys = [`letterhead_header_${clinicId}`, `emr_custom_rx_header_${clinicId}`];
    const footerKeys = [`letterhead_footer_${clinicId}`, `emr_custom_rx_footer_${clinicId}`];

    const { data: headerData } = await supabase.from('emr_store').select('value').in('key', keys);
    if (headerData && headerData.length > 0) result.header = headerData[0].value;
    const { data: footerData } = await supabase.from('emr_store').select('value').in('key', footerKeys);
    if (footerData && footerData.length > 0) result.footer = footerData[0].value;
    return NextResponse.json(result);
  } catch { return NextResponse.json({ header: '', footer: '' }); }
}

export async function POST(req: NextRequest) {
  try {
    const rlError = applyRateLimit(req, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(req); if (authError) return authError;

    const { clinicId, type, data } = await req.json();
    if (!clinicId || !type) return apiError('clinicId and type required', 400);
    if (type !== 'header' && type !== 'footer') return apiError('type must be header or footer', 400);

    const supabase = getDb();
    if (!supabase) return NextResponse.json({ ok: true, note: 'no database' });
    const key = `letterhead_${type}_${clinicId}`;
    const syncKey = `emr_custom_rx_${type}_${clinicId}`;

    if (data) { await supabase.from('emr_store').upsert([{ key, value: data }, { key: syncKey, value: data }], { onConflict: 'key' }); }
    else { await supabase.from('emr_store').delete().in('key', [key, syncKey]); }
    return NextResponse.json({ ok: true });
  } catch { return apiError('Failed to save', 500); }
}
