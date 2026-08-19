import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { authenticateRequest, applyRateLimit, apiError } from '@/lib/auth/middleware';
import crypto from 'crypto';

const BUCKET = 'booking-reports';
const SHARE_URL_EXPIRY = 60 * 15; // 15 minutes for share tokens

// GET — public: redeem a share token for a short-lived signed URL (15 min, logged, revocable)
export async function GET(request: NextRequest) {
  try {
    const token = new URL(request.url).searchParams.get('token');
    if (!token || !/^[a-f0-9]{64}$/.test(token)) {
      return apiError('Invalid or missing share token', 400);
    }

    const db = getDb();
    const { data: record, error: lookupError } = await db
      .from('file_share_tokens')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (lookupError || !record) {
      return apiError('Invalid share link', 404);
    }

    if (record.revoked) {
      return apiError('This share link has been revoked', 410);
    }

    if (new Date(record.expires_at) < new Date()) {
      return apiError('This share link has expired', 410);
    }

    // Generate short-lived signed URL
    const { data: signed, error: signError } = await db.storage
      .from(BUCKET)
      .createSignedUrl(record.file_path, 60 * 15);

    if (signError || !signed?.signedUrl) {
      return apiError('File unavailable', 500);
    }

    // Log access and increment counter
    await db
      .from('file_share_tokens')
      .update({
        access_count: (record.access_count || 0) + 1,
        last_accessed_at: new Date().toISOString(),
      })
      .eq('id', record.id);

    // Return HTML page (linked from WhatsApp) or redirect
    const fileName = record.file_name || 'report';
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${fileName}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f1f5f9; }
    .card { background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,.08); text-align: center; max-width: 400px; }
    h1 { font-size: 18px; color: #0f172a; margin: 0 0 8px; }
    p { color: #64748b; font-size: 13px; margin: 0 0 20px; }
    a { display: inline-block; background: #0A75BB; color: #fff; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; }
    a:hover { background: #08609a; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${fileName}</h1>
    <p>This link expires in 15 minutes.</p>
    <a href="${signed.signedUrl}" target="_blank" rel="noopener">Open File</a>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    console.error('GET /api/booking-files/share error:', error);
    return apiError('Internal server error', 500);
  }
}

// POST — requires EMR auth: create a time-limited share token for a specific file
export async function POST(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'booking');
    if (rlError) return rlError;

    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return apiError('Authentication required', 401);

    const body = await request.json();
    const { bookingId, filePath, fileName } = body;
    if (!bookingId || !filePath || !fileName) {
      return apiError('bookingId, filePath, and fileName are required', 400);
    }

    // Validate filePath doesn't contain path traversal
    if (filePath.includes('..') || filePath.includes('\\')) {
      return apiError('Invalid file path', 400);
    }

    const db = getDb();
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SHARE_URL_EXPIRY * 1000).toISOString();

    const { error: insertError } = await db.from('file_share_tokens').insert({
      booking_id: bookingId,
      file_path: filePath,
      file_name: fileName,
      token,
      created_by: user?.userId || 'unknown',
      expires_at: expiresAt,
      revoked: false,
      access_count: 0,
    });

    if (insertError) {
      console.error('Failed to create share token:', insertError);
      return apiError('Failed to create share link', 500);
    }

    const shareUrl = `${new URL(request.url).origin}/api/booking-files/share?token=${token}`;

    return NextResponse.json({
      success: true,
      shareUrl,
      expiresAt,
      expiresInMinutes: 15,
    });
  } catch (error) {
    console.error('POST /api/booking-files/share error:', error);
    return apiError('Internal server error', 500);
  }
}

// DELETE — requires EMR auth: revoke a share token
export async function DELETE(request: NextRequest) {
  try {
    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return apiError('Authentication required', 401);

    const body = await request.json();
    const { token } = body;
    if (!token) return apiError('token is required', 400);

    const db = getDb();
    const { error } = await db
      .from('file_share_tokens')
      .update({ revoked: true })
      .eq('token', token);

    if (error) return apiError('Failed to revoke token', 500);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/booking-files/share error:', error);
    return apiError('Internal server error', 500);
  }
}
