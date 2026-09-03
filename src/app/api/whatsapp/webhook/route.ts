import { NextRequest, NextResponse } from 'next/server';
import {
  verifyWebhookSignature,
  upsertMessageRecord,
  updateMessageStatus,
} from '@/lib/whatsapp';

// ─── Safe structured logging (never log tokens, secrets, or full payloads) ──

function logWebhook(event: string, data: Record<string, unknown>) {
  console.log(`[whatsapp-webhook] ${event}`, JSON.stringify(data));
}

// ─── GET /api/whatsapp/webhook ─────────────────────────────────────────
// Meta webhook verification challenge

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    logWebhook('verification_success', {});
    return new NextResponse(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }

  logWebhook('verification_failed', { mode, tokenProvided: !!token });
  return new NextResponse('Forbidden', { status: 403 });
}

// ─── POST /api/whatsapp/webhook ───────────────────────────────────────
// Receive WhatsApp Cloud API webhook events

export async function POST(request: NextRequest) {
  // 1. Read raw body for signature verification
  const rawBody = await request.text();

  // 2. Verify signature if app secret is configured
  const signatureHeader = request.headers.get('x-hub-signature-256');
  if (process.env.WHATSAPP_APP_SECRET) {
    if (!verifyWebhookSignature(rawBody, signatureHeader)) {
      logWebhook('signature_invalid', {});
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }
  }

  // 3. Parse body
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    logWebhook('parse_error', {});
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // 4. Acknowledge immediately — Meta retries on timeout/5xx
  // Process events asynchronously to avoid Meta retries

  // 5. Process each entry
  try {
    const entries = (body.object === 'whatsapp_business_account' ? body.entry : []) as Array<Record<string, unknown>>;

    for (const entry of entries) {
      const changes = (entry.changes || []) as Array<Record<string, unknown>>;

      for (const change of changes) {
        if (change.field !== 'messages') continue;

        const value = (change.value || {}) as Record<string, unknown>;
        const metadata = (value.metadata || {}) as Record<string, unknown>;
        const phoneNumberId = metadata.phone_number_id;

        // ── Incoming messages ──
        const messages = (value.messages || []) as Array<Record<string, unknown>>;
        for (const msg of messages) {
          const messageId = msg.id as string;
          const from = msg.from as string;
          const msgType = msg.type as string;
          const timestamp = msg.timestamp as string;

          // Extract text content
          let content = '';
          if (msgType === 'text') {
            const textObj = (msg.text || {}) as Record<string, unknown>;
            content = (textObj.body as string) || '';
          }

          logWebhook('message_received', {
            messageId,
            from,
            type: msgType,
          });

          // Store inbound message
          const config = getPhoneConfig();
          await upsertMessageRecord({
            direction: 'inbound',
            fromNumber: from,
            toNumber: (phoneNumberId as string) || config.phoneNumberId,
            waMessageId: messageId,
            messageType: msgType,
            content: content || `[${msgType} message]`,
            status: 'received',
          });
        }

        // ── Status updates ──
        const statuses = (value.statuses || []) as Array<Record<string, unknown>>;
        for (const status of statuses) {
          const messageId = status.id as string;
          const statusValue = status.status as string;
          const timestamp = status.timestamp as string;

          // Extract error info if present
          let errorCode: string | undefined;
          let errorMessage: string | undefined;
          if (status.errors && Array.isArray(status.errors) && status.errors.length > 0) {
            const err = status.errors[0] as Record<string, unknown>;
            errorCode = (err.code as string) || (err.error_code as string);
            errorMessage = (err.title as string) || (err.message as string) || (err.error_data as string);
          }

          logWebhook('status_update', {
            messageId,
            status: statusValue,
            errorCode,
          });

          // Map Meta status to our status values
          const mappedStatus = mapStatus(statusValue);

          // Update message record
          await updateMessageStatus(messageId, mappedStatus, errorCode, errorMessage);
        }
      }
    }
  } catch (processErr) {
    // Log but don't return 5xx — Meta would retry
    console.error('[whatsapp-webhook] Processing error:', processErr);
  }

  // Always return 200 to prevent Meta retries
  return NextResponse.json({ status: 'ok' });
}

// ─── Helpers ──────────────────────────────────────────────────────────

function getPhoneConfig() {
  return {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  };
}

function mapStatus(metaStatus: string): 'sent' | 'delivered' | 'read' | 'failed' {
  switch (metaStatus) {
    case 'sent': return 'sent';
    case 'delivered': return 'delivered';
    case 'read': return 'read';
    case 'failed': return 'failed';
    case 'undeliverable': return 'failed';
    case 'rejected': return 'failed';
    default: return 'sent';
  }
}
