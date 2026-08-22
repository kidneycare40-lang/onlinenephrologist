import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { authenticateRequest } from '@/lib/auth/middleware';

const BUCKET = 'message-attachments';
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

async function ensureBucket() {
  const db = getDb();
  const { data } = await db.storage.getBucket(BUCKET);
  if (data) return;
  const { error } = await db.storage.createBucket(BUCKET, { public: false });
  if (error) throw error;
}

function safeName(name: string): string {
  return encodeURIComponent(name.replace(/[/\\]/g, '_'));
}

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return authError;
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const files = body?.files;
    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: 'files array is required' }, { status: 400 });
    }
    if (files.length > 5) {
      return NextResponse.json({ error: 'Maximum 5 files allowed' }, { status: 400 });
    }

    await ensureBucket();
    const db = getDb();
    const folder = `emr-${user.userId}`;

    const uploaded: { file_name: string; storage_path: string; file_type: string; file_size: number }[] = [];

    for (const f of files) {
      if (!f?.data || !f?.name) continue;
      if (f.type && !ALLOWED_TYPES.has(f.type)) continue;
      const base64 = String(f.data).replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(base64, 'base64');
      if (buffer.byteLength === 0 || buffer.byteLength > MAX_FILE_SIZE_BYTES) continue;

      const uniqueName = `${Date.now()}-${safeName(f.name)}`;
      const path = `${folder}/${uniqueName}`;

      const { error } = await db.storage.from(BUCKET).upload(path, buffer, {
        contentType: f.type || 'application/octet-stream',
        upsert: false,
      });
      if (error) continue;

      uploaded.push({
        file_name: f.name,
        storage_path: path,
        file_type: f.type || 'application/octet-stream',
        file_size: buffer.byteLength,
      });
    }

    if (uploaded.length === 0) {
      return NextResponse.json({ error: 'No files could be uploaded' }, { status: 500 });
    }

    return NextResponse.json({ success: true, files: uploaded });
  } catch (error) {
    console.error('POST /api/emr/messages/upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
