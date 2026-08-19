import { NextResponse } from 'next/server';
import { requirePatientAuth, getOrCreateConversation, getMessages, sendPatientMessage, markAsRead, getPatientUnreadCount } from '@/lib/patient-messages-server';

/** GET: Get conversation + messages + unread count */
export async function GET() {
  const auth = await requirePatientAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const conversation = await getOrCreateConversation(auth.patientAccountId);

  // Only fetch messages and mark as read if there are unread doctor messages
  const unreadCount = await getPatientUnreadCount(auth.patientAccountId);
  let messages;
  if (unreadCount > 0) {
    messages = await getMessages(conversation.id);
    await markAsRead(conversation.id, 'patient');
  } else {
    messages = await getMessages(conversation.id);
  }

  const response = NextResponse.json({ conversation, messages, unreadCount });
  response.headers.set('Cache-Control', 'no-store, private');
  return response;
}

/** POST: Send a message */
export async function POST(req: Request) {
  const auth = await requirePatientAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json();
  const { message, attachments } = body;

  if (!message || !message.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  if (message.length > 5000) {
    return NextResponse.json({ error: 'Message too long (max 5000 characters)' }, { status: 400 });
  }

  const msg = await sendPatientMessage(auth.patientAccountId, message.trim(), attachments);
  if (!msg) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: msg });
}
