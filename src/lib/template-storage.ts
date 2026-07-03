import type { PrescriptionTemplate, AdviceTemplate, TestPanelTemplate } from '@/types/emr';

const MED_TPL_KEY = 'kcc_custom_templates';
const ADVICE_TPL_KEY = 'kcc_advice_templates';
const TEST_TPL_KEY = 'kcc_test_panel_templates';

function loadArray<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}

function saveArray<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

export const medTemplateStorage = {
  getAll: () => loadArray<PrescriptionTemplate>(MED_TPL_KEY),
  save: (items: PrescriptionTemplate[]) => saveArray(MED_TPL_KEY, items),
  add: (tpl: PrescriptionTemplate) => { const all = medTemplateStorage.getAll(); all.push(tpl); medTemplateStorage.save(all); },
  update: (tpl: PrescriptionTemplate) => { const all = medTemplateStorage.getAll().map((t) => t.id === tpl.id ? tpl : t); medTemplateStorage.save(all); },
  remove: (id: string) => { medTemplateStorage.save(medTemplateStorage.getAll().filter((t) => t.id !== id)); },
};

export const adviceTemplateStorage = {
  getAll: () => loadArray<AdviceTemplate>(ADVICE_TPL_KEY),
  save: (items: AdviceTemplate[]) => saveArray(ADVICE_TPL_KEY, items),
  add: (tpl: AdviceTemplate) => { const all = adviceTemplateStorage.getAll(); all.push(tpl); adviceTemplateStorage.save(all); },
  update: (tpl: AdviceTemplate) => { const all = adviceTemplateStorage.getAll().map((t) => t.id === tpl.id ? tpl : t); adviceTemplateStorage.save(all); },
  remove: (id: string) => { adviceTemplateStorage.save(adviceTemplateStorage.getAll().filter((t) => t.id !== id)); },
};

export const testTemplateStorage = {
  getAll: () => loadArray<TestPanelTemplate>(TEST_TPL_KEY),
  save: (items: TestPanelTemplate[]) => saveArray(TEST_TPL_KEY, items),
  add: (tpl: TestPanelTemplate) => { const all = testTemplateStorage.getAll(); all.push(tpl); testTemplateStorage.save(all); },
  update: (tpl: TestPanelTemplate) => { const all = testTemplateStorage.getAll().map((t) => t.id === tpl.id ? tpl : t); testTemplateStorage.save(all); },
  remove: (id: string) => { testTemplateStorage.save(testTemplateStorage.getAll().filter((t) => t.id !== id)); },
};
