import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function getDb() {
  try {
    const { getSupabase } = await import('@/lib/supabase');
    return getSupabase();
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const clinicId = req.nextUrl.searchParams.get('clinicId');
  if (!clinicId) {
    return NextResponse.json({ error: 'clinicId required' }, { status: 400 });
  }

  try {
    const supabase = await getDb();
    if (!supabase) return NextResponse.json({ header: '', footer: '' });

    const result: { header?: string; footer?: string } = {};

    const headerKey = `letterhead_header_${clinicId}`;
    const footerKey = `letterhead_footer_${clinicId}`;

    const { data: headerData } = await supabase
      .from('emr_store')
      .select('value')
      .eq('key', headerKey)
      .single();
    if (headerData) result.header = headerData.value;

    const { data: footerData } = await supabase
      .from('emr_store')
      .select('value')
      .eq('key', footerKey)
      .single();
    if (footerData) result.footer = footerData.value;

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ header: '', footer: '' });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { clinicId, type, data } = await req.json();
    if (!clinicId || !type) {
      return NextResponse.json({ error: 'clinicId and type required' }, { status: 400 });
    }

    const supabase = await getDb();
    if (!supabase) return NextResponse.json({ ok: true, note: 'no database' });

    const key = `letterhead_${type}_${clinicId}`;

    if (data) {
      await supabase.from('emr_store').upsert(
        { key, value: data },
        { onConflict: 'key' }
      );
    } else {
      await supabase.from('emr_store').delete().eq('key', key);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
