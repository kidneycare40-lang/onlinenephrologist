'use client';

import { getItem, setItem } from '@/lib/client-storage';
import { patientsApi } from '@/lib/api-client';

const ADDED_PATIENTS_KEY = 'emr-added-patients';

export type LocalPatient = Record<string, any>;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string | null | undefined): boolean {
  return !!value && UUID_RE.test(value);
}

function normalizePhone(phone: string | null | undefined): string {
  return (phone || '').replace(/\D/g, '');
}

/**
 * Upsert a patient into the shared local patient store (emr-added-patients).
 * Dedupes by id, or by phone when both records have one, so the same patient
 * is never stored twice. Never throws — this is a safety-net write.
 */
export async function upsertLocalPatient(rec: LocalPatient): Promise<void> {
  if (!rec || (!rec.id && !rec.serverId)) return;
  try {
    const list = ((await getItem(ADDED_PATIENTS_KEY)) as LocalPatient[]) || [];
    const phone = normalizePhone(rec.phone);
    const idx = list.findIndex((p) => {
      if (rec.id && p.id === rec.id) return true;
      if (rec.serverId && (p.id === rec.serverId || p.serverId === rec.serverId)) return true;
      const pPhone = normalizePhone(p.phone);
      if (phone && pPhone && phone === pPhone) return true;
      return false;
    });
    if (idx >= 0) list[idx] = { ...list[idx], ...rec };
    else list.push(rec);
    await setItem(ADDED_PATIENTS_KEY, list);
  } catch {}
}

/**
 * Called after a bill is saved (or kept pending) so the patient used on the
 * bill is ALWAYS in the local store — and, when the server assigned its real
 * patients-table UUID, that UUID is recorded too so EMR pages resolve it.
 * Custom billing patients (custom-*) are re-keyed to the server UUID so all
 * lists show one canonical record (the old local record is merged, not kept,
 * so no duplicate ever appears).
 */
export async function ensureInvoicePatientLocal(opts: {
  patientId?: string | null;
  previousLocalId?: string | null;
  serverPatientId?: string | null;
  fullName?: string | null;
  phone?: string | null;
  gender?: string | null;
  clinicId?: string | null;
}): Promise<void> {
  const name = (opts.fullName || '').trim();
  const prev = opts.previousLocalId || opts.patientId || null;
  if (!name && !prev && !opts.serverPatientId) return;
  const serverOk = isUuid(opts.serverPatientId);
  const useServerId = serverOk && (!prev || prev.startsWith('custom-'));
  const id = useServerId ? opts.serverPatientId! : (prev || opts.serverPatientId);
  if (!id) return;

  const parts = name.split(/\s+/).filter(Boolean);
  const phone = normalizePhone(opts.phone);
  try {
    const list = ((await getItem(ADDED_PATIENTS_KEY)) as LocalPatient[]) || [];
    let merged: LocalPatient | null = null;
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i] || {};
      const match =
        (prev && p.id === prev) ||
        p.id === id ||
        (serverOk && (p.id === opts.serverPatientId || p.serverId === opts.serverPatientId)) ||
        (!!phone && normalizePhone(p.phone) === phone);
      if (match) {
        if (!merged) merged = { ...p };
        list.splice(i, 1);
      }
    }
    const rec: LocalPatient = merged || {};
    rec.id = id;
    if (serverOk) rec.serverId = opts.serverPatientId;
    if (name) {
      rec.firstName = parts[0] || name;
      rec.lastName = parts.slice(1).join(' ');
    }
    if (phone) rec.phone = phone;
    if (opts.gender) rec.gender = opts.gender;
    rec.clinicId = opts.clinicId || rec.clinicId || 'kcc-faridabad';
    rec.source = rec.source || 'billing';
    if (rec.uhid === undefined) rec.uhid = '';
    list.push(rec);
    await setItem(ADDED_PATIENTS_KEY, list);
  } catch {}
}

function toDbGender(gender: string | undefined): 'male' | 'female' | 'other' | undefined {
  if (!gender) return undefined;
  const g = gender.toLowerCase();
  if (g === 'female' || g === 'f') return 'female';
  if (g === 'other' || g === 'o') return 'other';
  return 'male';
}

/**
 * Retry local patients that were added while the server call failed
 * (pendingSync flag). On success the flag is cleared; on failure the record
 * stays flagged and is retried on the next page load. Never throws.
 */
export async function retryPendingLocalPatients(): Promise<void> {
  try {
    const list = ((await getItem(ADDED_PATIENTS_KEY)) as LocalPatient[]) || [];
    const pending = list.filter((p) => p && p.pendingSync);
    if (pending.length === 0) return;
    let changed = false;
    for (const p of pending) {
      try {
        const phone = (p.phone || p.phoneNumber || '').trim();
        // If the server already knows this phone, don't create a duplicate —
        // just adopt the existing server record and stop retrying.
        if (phone) {
          try {
            const found = await patientsApi.search(phone);
            const hit = Array.isArray(found) ? found[0] : Array.isArray((found as any)?.data) ? (found as any).data[0] : null;
            if (hit && hit.id) {
              p.pendingSync = undefined;
              p.serverId = hit.id;
              changed = true;
              continue;
            }
          } catch {}
        }
        const created = await patientsApi.create({
          first_name: p.firstName || p.first_name || 'Patient',
          last_name: p.lastName || p.last_name || '',
          phone: phone || undefined,
          email: p.email || undefined,
          date_of_birth: p.dateOfBirth || undefined,
          gender: toDbGender(p.gender),
          blood_group: p.bloodGroup || undefined,
          medical_history: p.medicalHistory || undefined,
          insurance_provider: p.insuranceProvider || undefined,
          insurance_number: p.insuranceNumber || undefined,
        });
        if (created && created.id) {
          p.pendingSync = undefined;
          p.serverId = created.id;
          changed = true;
        }
      } catch {
        // still failing — keep pendingSync so it is retried next time
      }
    }
    if (changed) await setItem(ADDED_PATIENTS_KEY, list);
  } catch {}
}
