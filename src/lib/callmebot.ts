import { getDb } from '@/lib/db/client';

/**
 * CallMeBot — free WhatsApp auto-send fallback when Meta Cloud API is down.
 *
 * Activation (one-time per destination phone):
 *   From WhatsApp, message +34 644 71 81 98 with:
 *     I allow callmebot to send me messages
 *   You'll receive an API key for that phone number.
 *
 * Configure in environment:
 *   CALLMEBOT_API_KEY=...                (single key, works for the activated phone)
 *   CALLMEBOT_API_KEYS={"<phone>":"<key", ...} (per-phone keys)
 */

export function getCallMeBotApiKeyFor(phone: string): string | undefined {
  const raw = process.env.CALLMEBOT_API_KEYS;
  if (raw) {
    try {
      const map = JSON.parse(raw) as Record<string, string>;
      const key = map[phone];
      if (key) return key;
    } catch {
      // ignore malformed JSON
    }
  }
  const single = process.env.CALLMEBOT_API_KEY;
  return single && !single.startsWith('add-your-') ? single : undefined;
}

export interface CallMeBotResult {
  ok: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a free-form WhatsApp message via CallMeBot.
 * The API key must match the activated destination phone number.
 */
export async function sendWhatsAppViaCallMeBot(
  to: string,
  text: string,
  apiKey?: string
): Promise<CallMeBotResult> {
  const key = apiKey || getCallMeBotApiKeyFor(to);
  if (!key) {
    return {
      ok: false,
      error: 'CallMeBot not configured for this phone. Activate it first.',
    };
  }

  const cleanPhone = to.replace(/\D/g, '');
  const url =
    `https://api.callmebot.com/whatsapp.php?` +
    `phone=${encodeURIComponent(cleanPhone)}` +
    `&text=${encodeURIComponent(text)}` +
    `&apikey=${encodeURIComponent(key)}`;

  try {
    const res = await fetch(url, { method: 'GET' });
    const body = await res.text();

    if (res.ok && /message sent/i.test(body)) {
      return { ok: true, messageId: `callmebot:${cleanPhone}`, error: body };
    }
    return { ok: false, error: body || `HTTP ${res.status}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[callmebot] send error:', msg);
    return { ok: false, error: msg };
  }
}

/**
 * Record a CallMeBot send in whatsapp_cloud_messages (best-effort, non-blocking).
 */
export async function recordCallMeBotMessage(record: {
  bookingId?: string;
  direction: 'inbound' | 'outbound';
  fromNumber: string;
  toNumber: string;
  content?: string;
  status?: string;
  errorCode?: string;
  errorMessage?: string;
}): Promise<void> {
  try {
    const db = getDb();
    const now = new Date().toISOString();
    await db.from('whatsapp_cloud_messages').insert({
      booking_id: record.bookingId || null,
      direction: record.direction,
      from_number: record.fromNumber,
      to_number: record.toNumber,
      wa_message_id: null,
      message_type: 'text',
      template_name: null,
      content: record.content || null,
      status: record.status || 'sent',
      error_code: record.errorCode || null,
      error_message: record.errorMessage || null,
      received_at: record.direction === 'inbound' ? now : null,
      sent_at: record.direction === 'outbound' ? now : null,
      created_at: now,
      updated_at: now,
    });
  } catch (err) {
    console.error('[callmebot] failed to record message:', err);
  }
}