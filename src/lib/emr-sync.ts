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

async function flushToServer() {
  const entries = Object.entries(writeQueue);
  if (entries.length === 0) return;

  for (const [key, value] of entries) {
    try {
      await fetch('/api/emr/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
    } catch { /* server sync failed, will retry */ }
  }

  for (const key of Object.keys(writeQueue)) {
    delete writeQueue[key];
  }
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
    const res = await fetch('/api/emr/data');
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

  try {
    Storage.prototype.setItem = patchedSetItem as typeof Storage.prototype.setItem;
    Storage.prototype.removeItem = patchedRemoveItem as typeof Storage.prototype.removeItem;
  } catch { /* browser blocked prototype patching, sync disabled */ }
}

export function initEmrSync() {
  if (typeof window === 'undefined') return;
  hydrateFromServer();

  window.addEventListener('beforeunload', () => {
    if (Object.keys(writeQueue).length > 0) {
      navigator.sendBeacon('/api/emr/data', JSON.stringify({ flush: true, queue: writeQueue }));
    }
  });
}
