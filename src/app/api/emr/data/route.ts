import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

function getStorePath() {
  return path.join(process.cwd(), 'data', 'emr-store.json');
}

let storeCache: Record<string, unknown> | null = null;
let lastRead = 0;

async function readStore(): Promise<Record<string, unknown>> {
  const now = Date.now();
  if (storeCache && now - lastRead < 2000) return storeCache;
  try {
    const { readFile, mkdir } = await import('fs/promises');
    const { existsSync } = await import('fs');
    const dir = path.dirname(getStorePath());
    if (!existsSync(dir)) await mkdir(dir, { recursive: true });
    const filePath = getStorePath();
    if (!existsSync(filePath)) { storeCache = {}; lastRead = now; return storeCache; }
    const raw = await readFile(filePath, 'utf-8');
    storeCache = JSON.parse(raw);
    lastRead = now;
    return storeCache;
  } catch {
    storeCache = {};
    return storeCache;
  }
}

async function writeStore(data: Record<string, unknown>) {
  try {
    const { writeFile, mkdir } = await import('fs/promises');
    const { existsSync } = await import('fs');
    const dir = path.dirname(getStorePath());
    if (!existsSync(dir)) await mkdir(dir, { recursive: true });
    await writeFile(getStorePath(), JSON.stringify(data, null, 2), 'utf-8');
    storeCache = data;
  } catch {
    // fs not available on this host - silently skip server persistence
  }
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key');
  const store = await readStore();
  if (key) return NextResponse.json({ value: store[key] ?? null });
  return NextResponse.json(store);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const store = await readStore();

    if (body.flush && body.queue) {
      for (const [k, v] of Object.entries(body.queue) as [string, string][]) {
        if (v === '' || v === null || v === undefined) delete store[k];
        else store[k] = v;
      }
      await writeStore(store);
      return NextResponse.json({ ok: true });
    }

    const { key, value } = body;
    if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 });

    if (value === null || value === undefined || value === '') delete store[key];
    else store[key] = value;

    await writeStore(store);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
