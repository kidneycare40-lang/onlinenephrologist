import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';

const SIGNED_URL_EXPIRY = 60 * 15;

export async function GET(request: NextRequest) {
  try {
    const path = request.nextUrl.searchParams.get('path');
    if (!path) return NextResponse.json({ error: 'path is required' }, { status: 400 });

    const decodedPath = decodeURIComponent(path);
    const bucket = decodedPath.startsWith('message-attachments/') ? 'message-attachments' : 'booking-reports';

    const db = getDb();
    const { data, error } = await db.storage.from(bucket).createSignedUrl(decodedPath, SIGNED_URL_EXPIRY);
    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.redirect(data.signedUrl, 302);
  } catch (error) {
    console.error('GET /api/attachment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
