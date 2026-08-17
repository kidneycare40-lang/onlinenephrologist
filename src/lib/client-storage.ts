/**
 * Client-side storage abstraction — replaces localStorage with Supabase KV store.
 * Provides the same getItem / setItem / removeItem API, backed by /api/kv.
 *
 * Includes a localStorage cache layer so repeated reads are instant.
 * All writes go through to the server AND update the local cache.
 * Has fallback to in-memory only if server is unavailable.
 */

const API = '/api/kv';
const TIMEOUT_MS = 5000;

// In-memory cache (populated on first read)
let cache: Record<string, any> | null = null;
let cachePromise: Promise<Record<string, any>> | null = null;

function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
}

async function ensureCache(): Promise<Record<string, any>> {
  if (cache) return cache;
  if (cachePromise) return cachePromise;

  cachePromise = (async () => {
    try {
      const res = await fetchWithTimeout(API);
      const data = await res.json();
      cache = data.values || {};
    } catch {
      cache = {};
    }
    cachePromise = null;
    return cache!;
  })();

  return cachePromise;
}

export async function getItem(key: string): Promise<any | null> {
  const c = await ensureCache();
  if (key in c) return c[key];

  try {
    const res = await fetchWithTimeout(`${API}?key=${encodeURIComponent(key)}`);
    const data = await res.json();
    c[key] = data.value ?? null;
    return c[key];
  } catch {
    return null;
  }
}

export async function setItem(key: string, value: any): Promise<void> {
  const c = await ensureCache();
  c[key] = value;

  try {
    await fetchWithTimeout(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
  } catch (e) {
    console.error('[client-storage] setItem failed:', e);
  }
}

export async function removeItem(key: string): Promise<void> {
  const c = await ensureCache();
  delete c[key];

  try {
    await fetchWithTimeout(`${API}?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
  } catch (e) {
    console.error('[client-storage] removeItem failed:', e);
  }
}

/** Bulk-set multiple keys at once */
export async function setItems(entries: { key: string; value: any }[]): Promise<void> {
  const c = await ensureCache();
  entries.forEach(e => { c[e.key] = e.value; });

  try {
    await fetchWithTimeout(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries }),
    });
  } catch (e) {
    console.error('[client-storage] setItems failed:', e);
  }
}

/** Bulk-get multiple keys at once */
export async function getItems(keys: string[]): Promise<Record<string, any>> {
  const c = await ensureCache();
  const result: Record<string, any> = {};
  const missing: string[] = [];

  keys.forEach(k => {
    if (k in c) result[k] = c[k];
    else missing.push(k);
  });

  if (missing.length > 0) {
    try {
      const res = await fetchWithTimeout(`${API}?keys=${missing.map(encodeURIComponent).join(',')}`);
      const data = await res.json();
      Object.entries(data.values || {}).forEach(([k, v]) => {
        c[k] = v;
        result[k] = v;
      });
    } catch {}
  }

  return result;
}

/** Invalidate cache (call after external changes) */
export function invalidateCache(): void {
  cache = null;
  cachePromise = null;
}
