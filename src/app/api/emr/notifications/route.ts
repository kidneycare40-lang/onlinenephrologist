import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { authenticateRequest, apiError } from '@/lib/auth/middleware';

// GET — list notifications (newest first), supports ?unread=true and ?limit=N
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);

    let query = db
      .from('emr_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) query = query.eq('is_read', false);

    const { data, error } = await query;
    if (error) {
      console.error('[notifications] GET error:', error);
      return apiError('Failed to load notifications', 500);
    }

    // Get unread count
    const { count } = await db
      .from('emr_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    return NextResponse.json({ notifications: data || [], unreadCount: count || 0 });
  } catch (error) {
    console.error('[notifications] GET error:', error);
    return apiError('Failed to load notifications', 500);
  }
}

// PUT — mark notification(s) as read
// Body: { id?: string } — single notification, or { markAll: true } — all
export async function PUT(request: NextRequest) {
  try {
    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const db = getDb();
    const body = await request.json();
    const now = new Date().toISOString();

    if (body.markAll) {
      const { error } = await db
        .from('emr_notifications')
        .update({ is_read: true, read_at: now })
        .eq('is_read', false);
      if (error) return apiError('Failed to mark notifications', 500);
      return NextResponse.json({ success: true });
    }

    if (body.id) {
      const { error } = await db
        .from('emr_notifications')
        .update({ is_read: true, read_at: now })
        .eq('id', body.id);
      if (error) return apiError('Failed to mark notification', 500);
      return NextResponse.json({ success: true });
    }

    return apiError('Provide { id } or { markAll: true }', 400);
  } catch (error) {
    console.error('[notifications] PUT error:', error);
    return apiError('Failed to update notification', 500);
  }
}
