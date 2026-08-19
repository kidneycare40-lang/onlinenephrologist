import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { authenticateRequest, applyRateLimit, apiError } from '@/lib/auth/middleware';

const BUCKET = 'booking-reports';
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 10;
const SIGNED_URL_EXPIRY = 60 * 15; // 15 minutes for authenticated access
const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

async function ensureBucket() {
  const db = getDb();
  const { data } = await db.storage.getBucket(BUCKET);
  if (data) {
    if (data.public) await db.storage.updateBucket(BUCKET, { public: false });
    return;
  }
  const { error } = await db.storage.createBucket(BUCKET, { public: false });
  if (error) throw error;
}

function safeName(name: string): string {
  return encodeURIComponent(name.replace(/[/\\]/g, '_'));
}

// POST — requires EMR auth: upload booking report files
export async function POST(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'booking');
    if (rlError) return rlError;

    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return apiError('Authentication required', 401);

    const body = await request.json();
    const bookingId = body?.bookingId;
    const files = body?.files;
    if (!bookingId || !Array.isArray(files) || files.length === 0) {
      return apiError('bookingId and files are required', 400);
    }
    if (files.length > MAX_FILES) {
      return apiError(`Maximum ${MAX_FILES} files allowed`, 400);
    }

    await ensureBucket();
    const db = getDb();

    const urls: { name: string; url: string }[] = [];
    for (const f of files) {
      if (!f?.data || !f?.name) continue;
      if (f.type && !ALLOWED_TYPES.has(f.type)) continue;
      const base64 = String(f.data).replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(base64, 'base64');
      if (buffer.byteLength === 0) continue;
      if (buffer.byteLength > MAX_FILE_SIZE_BYTES) continue;
      const path = `${bookingId}/${safeName(f.name)}`;
      const { error } = await db.storage.from(BUCKET).upload(path, buffer, {
        contentType: f.type || 'application/octet-stream',
        upsert: true,
      });
      if (error) continue;
      const { data: signed } = await db.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_EXPIRY);
      if (signed?.signedUrl) urls.push({ name: f.name, url: signed.signedUrl });
    }

    if (urls.length === 0) return apiError('No files could be uploaded', 500);
    return NextResponse.json({ success: true, count: urls.length, urls }, { status: 201 });
  } catch (error) {
    console.error('POST /api/booking-files error:', error);
    return apiError('Internal server error', 500);
  }
}

// GET — requires EMR auth: list files for a booking with short-lived signed URLs
export async function GET(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'booking');
    if (rlError) return rlError;

    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return apiError('Authentication required', 401);

    const bookingId = new URL(request.url).searchParams.get('bookingId');
    if (!bookingId) return apiError('bookingId is required', 400);

    await ensureBucket();
    const db = getDb();
    const { data: list, error } = await db.storage.from(BUCKET).list(bookingId);
    if (error || !list || list.length === 0) {
      return NextResponse.json({ success: true, files: [] });
    }

    const files: { name: string; url: string; path: string }[] = [];
    for (const item of list) {
      if ((item.id ?? '').endsWith('/')) continue;
      const path = `${bookingId}/${item.name}`;
      const { data: signed } = await db.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_EXPIRY);
      if (signed?.signedUrl) {
        files.push({ name: decodeURIComponent(item.name), url: signed.signedUrl, path });
      }
    }

    return NextResponse.json({ success: true, files });
  } catch (error) {
    console.error('GET /api/booking-files error:', error);
    return apiError('Internal server error', 500);
  }
}
