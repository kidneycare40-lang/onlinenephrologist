import type { PrescriptionTemplate, AdviceTemplate, TestPanelTemplate } from '@/types/emr';
import { getItem, setItem } from '@/lib/client-storage';

const MED_TPL_KEY = 'template-med';
const ADVICE_TPL_KEY = 'template-advice';
const TEST_TPL_KEY = 'template-test-panel';

async function loadArray<T>(key: string): Promise<T[]> {
  try {
    const data = await getItem(key);
    return Array.isArray(data) ? data as T[] : [];
  } catch {
    return [];
  }
}

async function saveArray<T>(key: string, items: T[]): Promise<void> {
  await setItem(key, items);
}

export const medTemplateStorage = {
  getAll: () => loadArray<PrescriptionTemplate>(MED_TPL_KEY),
  save: (items: PrescriptionTemplate[]) => saveArray(MED_TPL_KEY, items),
  add: async (tpl: PrescriptionTemplate) => { const all = await medTemplateStorage.getAll(); all.push(tpl); await medTemplateStorage.save(all); },
  update: async (tpl: PrescriptionTemplate) => { const all = (await medTemplateStorage.getAll()).map((t) => t.id === tpl.id ? tpl : t); await medTemplateStorage.save(all); },
  remove: async (id: string) => { await medTemplateStorage.save((await medTemplateStorage.getAll()).filter((t) => t.id !== id)); },
};

export const adviceTemplateStorage = {
  getAll: () => loadArray<AdviceTemplate>(ADVICE_TPL_KEY),
  save: (items: AdviceTemplate[]) => saveArray(ADVICE_TPL_KEY, items),
  add: async (tpl: AdviceTemplate) => { const all = await adviceTemplateStorage.getAll(); all.push(tpl); await adviceTemplateStorage.save(all); },
  update: async (tpl: AdviceTemplate) => { const all = (await adviceTemplateStorage.getAll()).map((t) => t.id === tpl.id ? tpl : t); await adviceTemplateStorage.save(all); },
  remove: async (id: string) => { await adviceTemplateStorage.save((await adviceTemplateStorage.getAll()).filter((t) => t.id !== id)); },
};

export const testTemplateStorage = {
  getAll: () => loadArray<TestPanelTemplate>(TEST_TPL_KEY),
  save: (items: TestPanelTemplate[]) => saveArray(TEST_TPL_KEY, items),
  add: async (tpl: TestPanelTemplate) => { const all = await testTemplateStorage.getAll(); all.push(tpl); await testTemplateStorage.save(all); },
  update: async (tpl: TestPanelTemplate) => { const all = (await testTemplateStorage.getAll()).map((t) => t.id === tpl.id ? tpl : t); await testTemplateStorage.save(all); },
  remove: async (id: string) => { await testTemplateStorage.save((await testTemplateStorage.getAll()).filter((t) => t.id !== id)); },
};
