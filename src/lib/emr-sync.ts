const EMR_KEYS = [
  'emr_added_patients',
  'emr_consultations',
  'emr_bookings',
  'emr_custom_rx_header_kcc-faridabad',
  'emr_custom_rx_footer_kcc-faridabad',
  'emr_custom_rx_header_kcc-saket',
  'emr_custom_rx_footer_kcc-saket',
  'emr_custom_rx_header_psri-delhi',
  'emr_custom_rx_footer_psri-delhi',
  'kcc_billing_settings',
  'kcc_consultation_settings',
  'kcc_clinic_settings',
  'kcc_booking_settings',
  'kcc_calculator_settings',
  'kcc_custom_templates',
  'kcc_advice_templates',
  'kcc_test_panel_templates',
  'emr_master_medicines',
];

const writeQueue: Record<string, string> = {};
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let isHydrated = false;

function fetchWithTimeout(url: string, init?: RequestInit, ms = 5000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
}

async function flushToServer() {
  const entries = Object.entries(writeQueue);
  if (entries.length === 0) return;

  const toFlush = { ...writeQueue };
  for (const key of Object.keys(writeQueue)) {
    delete writeQueue[key];
  }

  await Promise.allSettled(
    Object.entries(toFlush).map(([key, value]) =>
      fetchWithTimeout('/api/emr/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      }, 8000).catch(() => {})
    )
  );
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushToServer();
  }, 500);
}

function patchedSetItem(key: string, value: string) {
  const originalSetItem = Storage.prototype.setItem;
  originalSetItem.call(localStorage, key, value);

  if (isHydrated && (EMR_KEYS.includes(key) || key.startsWith('emr_custom_rx_') || key.startsWith('emr_'))) {
    writeQueue[key] = value;
    scheduleFlush();
  }
}

function patchedRemoveItem(key: string) {
  const originalRemoveItem = Storage.prototype.removeItem;
  originalRemoveItem.call(localStorage, key);

  if (isHydrated && (EMR_KEYS.includes(key) || key.startsWith('emr_custom_rx_') || key.startsWith('emr_'))) {
    writeQueue[key] = '';
    scheduleFlush();
  }
}

export async function hydrateFromServer() {
  if (isHydrated || typeof window === 'undefined') return;

  try {
    const res = await fetchWithTimeout('/api/emr/data', undefined, 5000);
    if (!res.ok) return;
    const store = await res.json();
    const originalSetItem = Storage.prototype.setItem;

    for (const [key, value] of Object.entries(store)) {
      if (value !== null && value !== undefined) {
        const existing = localStorage.getItem(key);
        const serverVal = typeof value === 'string' ? value : JSON.stringify(value);
        if (existing !== serverVal) {
          originalSetItem.call(localStorage, key, serverVal);
        }
      }
    }
  } catch { /* server unavailable, use local data */ }

  isHydrated = true;

  Storage.prototype.setItem = patchedSetItem as typeof Storage.prototype.setItem;
  Storage.prototype.removeItem = patchedRemoveItem as typeof Storage.prototype.removeItem;
}

let listenersAttached = false;

export function initEmrSync() {
  if (typeof window === 'undefined') return;
  hydrateFromServer();

  if (!listenersAttached) {
    listenersAttached = true;
    window.addEventListener('beforeunload', () => {
      if (Object.keys(writeQueue).length > 0) {
        navigator.sendBeacon('/api/emr/data', JSON.stringify({ flush: true, queue: writeQueue }));
      }
    });
  }
}
