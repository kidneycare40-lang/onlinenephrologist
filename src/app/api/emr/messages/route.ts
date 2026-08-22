import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { getMessages, sendDoctorMessage, markAsRead, getConversationsWithUnread } from '@/lib/patient-messages-server';

/** GET: List conversations (EMR) or get messages for a conversation */
export async function GET(req: NextRequest) {
  const { user, error: authError } = await authenticateRequest(req);
  if (authError) return authError;

  const url = new URL(req.url);
  const conversationId = url.searchParams.get('conversationId');

  if (conversationId) {
    const messages = await getMessages(conversationId);
    await markAsRead(conversationId, 'doctor');
    return NextResponse.json({ messages });
  }

  const conversations = await getConversationsWithUnread();
  return NextResponse.json({ conversations });
}

/** POST: Send a message from doctor/admin */
export async function POST(req: NextRequest) {
  const { user, error: authError } = await authenticateRequest(req);
  if (authError) return authError;

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { conversationId, message, attachments } = body;

  if (!conversationId || !message?.trim()) {
    return NextResponse.json({ error: 'conversationId and message are required' }, { status: 400 });
  }

  const senderType = user.role === 'doctor' ? 'doctor' : 'admin';
  const msg = await sendDoctorMessage(conversationId, user.userId, senderType, message.trim(), attachments);
  if (!msg) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: msg });
}
