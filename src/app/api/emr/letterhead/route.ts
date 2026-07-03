import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'letterhead');

async function ensureDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

function getFilePath(clinicId: string, type: string) {
  return path.join(DATA_DIR, `${clinicId}-${type}.dat`);
}

export async function GET(req: NextRequest) {
  const clinicId = req.nextUrl.searchParams.get('clinicId');
  if (!clinicId) {
    return NextResponse.json({ error: 'clinicId required' }, { status: 400 });
  }

  try {
    await ensureDir();
    const result: { header?: string; footer?: string } = {};

    const headerPath = getFilePath(clinicId, 'header');
    if (existsSync(headerPath)) {
      result.header = await readFile(headerPath, 'utf-8');
    }

    const footerPath = getFilePath(clinicId, 'footer');
    if (existsSync(footerPath)) {
      result.footer = await readFile(footerPath, 'utf-8');
    }

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

    await ensureDir();
    const filePath = getFilePath(clinicId, type);

    if (data) {
      await writeFile(filePath, data, 'utf-8');
    } else if (existsSync(filePath)) {
      const { unlink } = await import('fs/promises');
      await unlink(filePath);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
