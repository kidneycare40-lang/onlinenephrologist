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
  'emr_billing_settings',
  'kcc_consultation_settings',
  'kcc_clinic_settings',
  'kcc_booking_settings',
  'emr_booking_settings',
  'kcc_calculator_settings',
  'kcc_custom_templates',
  'kcc_advice_templates',
  'kcc_test_panel_templates',
  'emr_master_medicines',
];

const writeQueue: Record<string, string> = {};
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let isHydrated = false;

let _origSetItem: ((key: string, value: string) => void) | null = null;
let _origRemoveItem: ((key: string) => void) | null = null;

function isEmrKey(key: string): boolean {
  return (
    EMR_KEYS.includes(key) ||
    key.startsWith('emr_')
  );
}

async function flushToServer() {
  const entries = Object.entries(writeQueue);
  if (entries.length === 0) return;

  await Promise.allSettled(
    entries.map(([key, value]) =>
      fetch('/api/emr/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      }).catch(() => {})
    )
  );

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

function patchedSetItem(this: Storage, key: string, value: string) {
  _origSetItem!.call(this, key, value);

  if (isHydrated && isEmrKey(key)) {
    writeQueue[key] = value;
    scheduleFlush();
  }
}

function patchedRemoveItem(this: Storage, key: string) {
  _origRemoveItem!.call(this, key);

  if (isHydrated && isEmrKey(key)) {
    writeQueue[key] = '';
    scheduleFlush();
  }
}

export async function hydrateFromServer() {
  if (isHydrated || typeof window === 'undefined') return;

  _origSetItem = Storage.prototype.setItem;
  _origRemoveItem = Storage.prototype.removeItem;

  try {
    const res = await fetch('/api/emr/data');
    if (!res.ok) return;
    const store = await res.json();

    for (const [key, value] of Object.entries(store)) {
      if (value !== null && value !== undefined) {
        const existing = localStorage.getItem(key);
        const serverVal = typeof value === 'string' ? value : JSON.stringify(value);
        if (existing !== serverVal) {
          _origSetItem.call(localStorage, key, serverVal);
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
      const blob = new Blob([JSON.stringify({ flush: true, queue: writeQueue })], { type: 'application/json' });
      navigator.sendBeacon('/api/emr/data', blob);
    }
  });
}
