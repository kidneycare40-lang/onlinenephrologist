import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';

function generateId() {
  return 'vax_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientName, phone, email, age, gender, diagnosis, vaccinations, notes, patientAccountId } = body;

    if (!patientName || !phone) {
      return NextResponse.json({ error: 'Patient name and phone are required' }, { status: 400 });
    }

    const recordId = generateId();
    const record = {
      id: recordId,
      patientName,
      phone,
      email: email || '',
      age: age || '',
      gender: gender || '',
      diagnosis: diagnosis || '',
      vaccinations: vaccinations || {},
      notes: notes || '',
      patientAccountId: patientAccountId || null,
      createdAt: new Date().toISOString(),
    };

    const db = getDb();

    const { error } = await db
      .from('emr_store')
      .upsert(
        {
          key: `vaccination-${recordId}`,
          value: JSON.stringify(record),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );

    if (error) {
      console.error('[vaccination POST] DB error:', error);
      return NextResponse.json({ error: 'Failed to save vaccination record' }, { status: 500 });
    }

    // Also save to a patient-specific index for easy lookup by phone
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      const indexKey = `vaccination-index-${cleanPhone}`;
      const { data: existing } = await db
        .from('emr_store')
        .select('value')
        .eq('key', indexKey)
        .single();

      const existingIds = existing?.value ? JSON.parse(existing.value) : [];
      const updatedIds = [recordId, ...existingIds.filter((id: string) => id !== recordId)].slice(0, 50);

      await db
        .from('emr_store')
        .upsert(
          {
            key: indexKey,
            value: JSON.stringify(updatedIds),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );
    }

    return NextResponse.json({ success: true, id: recordId });
  } catch (e) {
    console.error('[vaccination POST]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    const phone = req.nextUrl.searchParams.get('phone');

    const db = getDb();

    if (id) {
      const { data, error } = await db
        .from('emr_store')
        .select('value')
        .eq('key', `vaccination-${id}`)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'Record not found' }, { status: 404 });
      }

      return NextResponse.json({ record: JSON.parse(data.value) });
    }

    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      const { data: indexData } = await db
        .from('emr_store')
        .select('value')
        .eq('key', `vaccination-index-${cleanPhone}`)
        .single();

      if (!indexData) {
        return NextResponse.json({ records: [] });
      }

      const ids: string[] = JSON.parse(indexData.value);
      const records = [];

      for (const recordId of ids.slice(0, 20)) {
        const { data } = await db
          .from('emr_store')
          .select('value')
          .eq('key', `vaccination-${recordId}`)
          .single();
        if (data) records.push(JSON.parse(data.value));
      }

      return NextResponse.json({ records });
    }

    return NextResponse.json({ error: 'Provide id or phone param' }, { status: 400 });
  } catch (e) {
    console.error('[vaccination GET]', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
