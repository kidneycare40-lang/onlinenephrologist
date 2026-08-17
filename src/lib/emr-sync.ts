import { getItem, setItem } from '@/lib/client-storage';

let isHydrated = false;

export async function hydrateFromServer() {
  if (isHydrated || typeof window === 'undefined') return;

  try {
    const res = await fetch('/api/emr/data');
    if (!res.ok) return;
    const store = await res.json();

    for (const [key, value] of Object.entries(store)) {
      if (value !== null && value !== undefined) {
        const existing = await getItem(key);
        const serverVal = typeof value === 'string' ? value : JSON.stringify(value);
        const localVal = typeof existing === 'string' ? existing : JSON.stringify(existing);
        if (localVal !== serverVal) {
          await setItem(key, value);
        }
      }
    }
  } catch { /* server unavailable, use local data */ }

  isHydrated = true;
}

export function initEmrSync() {
  if (typeof window === 'undefined') return;
  hydrateFromServer();
}
