import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { authenticateRequest, applyRateLimit, apiError } from '@/lib/auth/middleware';

const BUCKET = 'booking-reports';
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 10;
const SIGNED_URL_EXPIRY = 60 * 60 * 24; // 24 hours
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
    if (data.public) {
      await db.storage.updateBucket(BUCKET, { public: false });
    }
    return;
  }
  const { error } = await db.storage.createBucket(BUCKET, { public: false });
  if (error) throw error;
}

function safeName(name: string): string {
  return encodeURIComponent(name.replace(/[/\\]/g, '_'));
}

async function createSignedUrl(db: any, path: string): Promise<string | null> {
  const { data, error } = await db.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_EXPIRY);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
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
      const signedUrl = await createSignedUrl(db, path);
      if (signedUrl) urls.push({ name: f.name, url: signedUrl });
    }

    if (urls.length === 0) return apiError('No files could be uploaded', 500);
    return NextResponse.json({ success: true, count: urls.length, urls }, { status: 201 });
  } catch (error) {
    console.error('POST /api/booking-files error:', error);
    return apiError('Internal server error', 500);
  }
}

function htmlPage(bookingId: string, files: { name: string; url: string }[]) {
  const rows = files.length
    ? files.map((f, i) => `
      <div class="row">
        <span class="idx">${i + 1}</span>
        <span class="name">${f.name}</span>
        <a class="btn" href="${f.url}" target="_blank" rel="noopener">Open</a>
        <a class="btn" href="${f.url}" download>Download</a>
      </div>`).join('')
    : '<p class="empty">No reports uploaded for this booking.</p>';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Booking Reports — ${bookingId}</title>
  <style>
    body { font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; background: #f1f5f9; margin: 0; padding: 24px; }
    .card { max-width: 720px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,.1); }
    h1 { font-size: 18px; margin: 0 0 4px; color: #0f172a; }
    .sub { color: #64748b; font-size: 13px; margin-bottom: 20px; }
    .row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
    .idx { width: 24px; height: 24px; border-radius: 50%; background: #0A75BB; color: #fff; font-size: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .name { flex: 1; font-size: 14px; color: #0f172a; word-break: break-all; }
    .btn { font-size: 12px; font-weight: 600; color: #0A75BB; text-decoration: none; border: 1px solid #0A75BB; border-radius: 6px; padding: 4px 10px; flex-shrink: 0; }
    .btn:hover { background: #0A75BB; color: #fff; }
    .empty { color: #64748b; font-size: 14px; }
    .note { color: #94a3b8; font-size: 11px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Uploaded Reports</h1>
    <div class="sub">Booking ${bookingId} — ${files.length} file(s)</div>
    ${rows}
    <p class="note">Links expire in 24 hours. Contact the clinic if you need to re-access these files.</p>
  </div>
</body>
</html>`;
}

// GET — public page with signed URLs (linked from WhatsApp to patients)
export async function GET(request: NextRequest) {
  try {
    const bookingId = new URL(request.url).searchParams.get('bookingId');
    if (!bookingId) return apiError('bookingId is required', 400);

    await ensureBucket();
    const db = getDb();
    const { data: list, error } = await db.storage.from(BUCKET).list(bookingId);
    if (error || !list || list.length === 0) {
      return new NextResponse(htmlPage(bookingId, []), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    const files: { name: string; url: string }[] = [];
    for (const item of list) {
      if ((item.id ?? '').endsWith('/')) continue;
      const signedUrl = await createSignedUrl(db, `${bookingId}/${item.name}`);
      if (signedUrl) {
        files.push({ name: decodeURIComponent(item.name), url: signedUrl });
      }
    }

    return new NextResponse(htmlPage(bookingId, files), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    console.error('GET /api/booking-files error:', error);
    return apiError('Internal server error', 500);
  }
}
