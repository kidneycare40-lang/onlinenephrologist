/**
 * Server-side patient-doctor messaging library.
 * Handles conversations, messages, attachments, and unread counts.
 * All queries use service_role key (bypasses RLS).
 * Authorization: patients can only see their own conversations.
 */
import { getDb } from '@/lib/db/client';
import { getPatientFromCookie } from '@/lib/patient-auth-server';

// ── Types ──────────────────────────────────────────────────

export interface Conversation {
  id: string;
  patient_account_id: string;
  assigned_doctor_id: string | null;
  status: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count_patient: number;
  unread_count_doctor: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: string;
  sender_user_id: string | null;
  sender_patient_account_id: string | null;
  message: string;
  created_at: string;
  read_at: string | null;
}

export interface Attachment {
  id: string;
  message_id: string;
  file_name: string;
  storage_path: string;
  file_type: string | null;
  file_size: number | null;
}

export interface ConversationWithMessages extends Conversation {
  messages: (Message & { attachments: Attachment[] })[];
  patient_name?: string;
  patient_email?: string;
}

// ── Auth Helper ────────────────────────────────────────────

export async function requirePatientAuth(): Promise<{ patientAccountId: string } | { error: string; status: number }> {
  const patient = await getPatientFromCookie();
  if (!patient || patient.patientId === 'pending') {
    return { error: 'Not authenticated', status: 401 };
  }
  return { patientAccountId: patient.patientId };
}

// ── Conversations ──────────────────────────────────────────

/** Get or create the patient's conversation thread. */
export async function getOrCreateConversation(patientAccountId: string): Promise<Conversation> {
  const db = getDb();

  const { data: existing } = await db
    .from('patient_conversations')
    .select('*')
    .eq('patient_account_id', patientAccountId)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) return existing;

  const { data: created, error } = await db
    .from('patient_conversations')
    .insert({
      patient_account_id: patientAccountId,
      status: 'open',
    })
    .select()
    .single();

  if (error) throw new Error('Failed to create conversation');
  return created;
}

/** Get all conversations (for EMR/admin). */
export async function getAllConversations(): Promise<Conversation[]> {
  const db = getDb();
  const { data, error } = await db
    .from('patient_conversations')
    .select('*')
    .order('last_message_at', { ascending: false })
    .limit(100);

  if (error || !data) return [];
  return data;
}

/** Get conversations with unread counts for EMR. */
export async function getConversationsWithUnread(): Promise<(Conversation & { patient_name: string; patient_email: string })[]> {
  const db = getDb();
  const { data, error } = await db
    .from('patient_conversations')
    .select(`
      *,
      patient:patient_accounts(first_name, last_name, email)
    `)
    .order('last_message_at', { ascending: false })
    .limit(100);

  if (error || !data) return [];
  return data.map((c: any) => ({
    ...c,
    patient_name: c.patient ? `${c.patient.first_name} ${c.patient.last_name}`.trim() : 'Patient',
    patient_email: c.patient?.email || '',
  }));
}

// ── Messages ───────────────────────────────────────────────

/** Get messages for a conversation. */
export async function getMessages(conversationId: string): Promise<(Message & { attachments: Attachment[] })[]> {
  const db = getDb();
  const { data: messages, error } = await db
    .from('patient_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(200);

  if (error || !messages) return [];

  // Fetch attachments for all messages
  const msgIds = messages.map((m: any) => m.id);
  let attachments: Attachment[] = [];
  if (msgIds.length > 0) {
    const { data: attData } = await db
      .from('message_attachments')
      .select('*')
      .in('message_id', msgIds);
    attachments = attData || [];
  }

  const attByMsg: Record<string, Attachment[]> = {};
  for (const a of attachments) {
    if (!attByMsg[a.message_id]) attByMsg[a.message_id] = [];
    attByMsg[a.message_id].push(a);
  }

  return messages.map((m: any) => ({
    ...m,
    attachments: attByMsg[m.id] || [],
  }));
}

/** Send a message from patient. */
export async function sendPatientMessage(
  patientAccountId: string,
  message: string,
  attachments?: { file_name: string; storage_path: string; file_type?: string; file_size?: number }[]
): Promise<Message | null> {
  const db = getDb();

  // Get or create conversation
  const conversation = await getOrCreateConversation(patientAccountId);

  // Insert message
  const { data: msg, error } = await db
    .from('patient_messages')
    .insert({
      conversation_id: conversation.id,
      sender_type: 'patient',
      sender_patient_account_id: patientAccountId,
      message,
    })
    .select()
    .single();

  if (error || !msg) return null;

  // Insert attachments if any
  if (attachments && attachments.length > 0) {
    await db.from('message_attachments').insert(
      attachments.map(a => ({
        message_id: msg.id,
        file_name: a.file_name,
        storage_path: a.storage_path,
        file_type: a.file_type || null,
        file_size: a.file_size || null,
      }))
    );
  }

  // Update conversation
  await db
    .from('patient_conversations')
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: message.slice(0, 200),
      unread_count_doctor: (conversation.unread_count_doctor || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversation.id);

  return msg;
}

/** Send a message from doctor/admin (EMR). */
export async function sendDoctorMessage(
  conversationId: string,
  userId: string,
  senderType: 'doctor' | 'admin',
  message: string,
  attachments?: { file_name: string; storage_path: string; file_type?: string; file_size?: number }[]
): Promise<Message | null> {
  const db = getDb();

  const { data: msg, error } = await db
    .from('patient_messages')
    .insert({
      conversation_id: conversationId,
      sender_type: senderType,
      sender_user_id: userId,
      message,
    })
    .select()
    .single();

  if (error || !msg) return null;

  if (attachments && attachments.length > 0) {
    await db.from('message_attachments').insert(
      attachments.map(a => ({
        message_id: msg.id,
        file_name: a.file_name,
        storage_path: a.storage_path,
        file_type: a.file_type || null,
        file_size: a.file_size || null,
      }))
    );
  }

  // Update conversation
  await db
    .from('patient_conversations')
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: message.slice(0, 200),
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId);

  // Increment patient unread count
  const { data: conv } = await db.from('patient_conversations').select('unread_count_patient').eq('id', conversationId).single();
  if (conv) {
    await db.from('patient_conversations').update({ unread_count_patient: (conv.unread_count_patient || 0) + 1 }).eq('id', conversationId);
  }

  return msg;
}

/** Mark messages as read. */
export async function markAsRead(conversationId: string, readerType: 'patient' | 'doctor'): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();

  // Mark unread messages from the other side as read
  const senderType = readerType === 'patient' ? 'doctor' : 'patient';
  await db
    .from('patient_messages')
    .update({ read_at: now })
    .eq('conversation_id', conversationId)
    .eq('sender_type', senderType)
    .is('read_at', null);

  // Reset unread count
  const countField = readerType === 'patient' ? 'unread_count_patient' : 'unread_count_doctor';
  await db
    .from('patient_conversations')
    .update({ [countField]: 0, updated_at: now })
    .eq('id', conversationId);
}

/** Get total unread count for a patient. */
export async function getPatientUnreadCount(patientAccountId: string): Promise<number> {
  const db = getDb();
  const { data } = await db
    .from('patient_conversations')
    .select('unread_count_patient')
    .eq('patient_account_id', patientAccountId)
    .eq('status', 'open');
  if (!data) return 0;
  return data.reduce((sum: number, c: any) => sum + (c.unread_count_patient || 0), 0);
}

/** Get total unread count for EMR (all conversations). */
export async function getEMRUnreadCount(): Promise<number> {
  const db = getDb();
  const { data } = await db
    .from('patient_conversations')
    .select('unread_count_doctor')
    .eq('status', 'open');
  if (!data) return 0;
  return data.reduce((sum: number, c: any) => sum + (c.unread_count_doctor || 0), 0);
}
