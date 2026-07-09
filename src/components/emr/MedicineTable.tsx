'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X, Plus, Search, RotateCcw, FileText, Save, Trash2, Pencil, ChevronDown, Check, ChevronRight } from 'lucide-react';
import { commonMedicines, recentFrequentMedicines, prescriptionTemplates } from '@/lib/data/emr-mock';
import { medTemplateStorage } from '@/lib/template-storage';
import type { PrescriptionItem, PrescriptionTemplate, Medication } from '@/types/emr';

interface MasterMedicine {
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  route: string;
}

const MASTER_STORAGE_KEY = 'emr_master_medicines';

function loadMasterList(): MasterMedicine[] {
  if (typeof window === 'undefined') return [...commonMedicines];
  try {
    const saved = JSON.parse(localStorage.getItem(MASTER_STORAGE_KEY) || '[]');
    const builtIn = commonMedicines.map(m => ({ name: m.name, genericName: m.genericName, dosage: m.dosage, frequency: m.frequency, route: m.route }));
    const merged = [...builtIn];
    for (const s of saved) {
      if (!merged.some(m => m.name === s.name && m.dosage === s.dosage && m.genericName === s.genericName)) {
        merged.push(s);
      }
    }
    return merged;
  } catch {
    return [...commonMedicines];
  }
}

function saveMasterList(list: MasterMedicine[]) {
  const builtInNames = new Set(commonMedicines.map(m => `${m.name}|${m.dosage}|${m.genericName}`));
  const custom = list.filter(m => !builtInNames.has(`${m.name}|${m.dosage}|${m.genericName}`));
  localStorage.setItem(MASTER_STORAGE_KEY, JSON.stringify(custom));
}

interface MedicineTableProps {
  prescriptions: PrescriptionItem[];
  onChange: (prescriptions: PrescriptionItem[]) => void;
  onLoadTemplate?: (data: { medications: PrescriptionItem[]; advice: string; testsPrescribed: string[] }) => void;
  diagnoses?: string[];
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const strengthOptions = ['5mg', '10mg', '20mg', '25mg', '30mg', '40mg', '50mg', '60mg', '75mg', '100mg', '120mg', '200mg', '250mg', '500mg', '1g', '60000 IU', '10 ML', '15 ML', '30 ML'];
const dosageOptions = ['1-0-0', '0-1-0', '0-0-1', '1-0-1', '1-1-1', '1-1-0', '0-1-1', 'SOS'];
const whenOptions = ['After Food', 'Before Food', 'Empty Stomach', 'With Food', 'Any Time', 'BF', 'AF', 'Bed Time'];
const frequencyOptions = ['Once daily', 'Twice daily', 'Thrice daily', 'Once weekly', 'Twice weekly', 'Alternate day', 'Monthly', 'As needed', 'STAT'];
const durationOptions = ['3 days', '5 days', '7 days', '10 days', '2 weeks', '1 month', '2 months', '3 months', '6 months', '1 year'];

function HpDropdown({ value, options, onChange, placeholder, allowCustom }: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder?: string;
  allowCustom?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customVal, setCustomVal] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [dropPos, setDropPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

  const updatePosition = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropPos({ top: rect.bottom + 2, left: rect.left, width: rect.width });
    }
  };

  useEffect(() => {
    function handleClick(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (ref.current && !ref.current.contains(target) && dropRef.current && !dropRef.current.contains(target)) {
        setOpen(false);
        setShowCustom(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, []);

  useEffect(() => {
    if (showCustom) customInputRef.current?.focus();
  }, [showCustom]);

  return (
    <div ref={ref} className="relative">
      {showCustom ? (
        <div className="flex items-center gap-0.5">
          <input
            ref={customInputRef}
            type="text"
            value={customVal}
            onChange={(e) => setCustomVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customVal.trim()) {
                onChange(customVal.trim());
                setShowCustom(false);
                setOpen(false);
              }
              if (e.key === 'Escape') {
                setShowCustom(false);
                setCustomVal('');
              }
            }}
            onBlur={() => {
              if (customVal.trim()) {
                onChange(customVal.trim());
              }
              setShowCustom(false);
              setCustomVal('');
            }}
            placeholder="Type dose..."
            className="w-full px-2 py-1.5 text-[12px] border border-[#0A75BB] rounded bg-white focus:outline-none"
          />
        </div>
      ) : (
        <button
          ref={btnRef}
          onClick={() => {
            if (!open) updatePosition();
            setOpen(!open);
          }}
          className="w-full flex items-center justify-between px-2 py-1.5 text-[12px] text-left border border-slate-200 rounded bg-white hover:border-slate-300 transition-colors cursor-pointer group/d"
        >
          <span className={cn('truncate', !value && 'text-slate-400')}>{value || placeholder || 'Select'}</span>
          <ChevronDown className="h-3 w-3 text-slate-400 shrink-0 ml-1 group-hover/d:text-slate-600" />
        </button>
      )}
      {open && !showCustom && createPortal(
        <div
          ref={dropRef}
          className="fixed bg-white border border-slate-200 rounded-lg shadow-xl z-[250] max-h-48 overflow-y-auto"
          style={{ top: dropPos.top, left: dropPos.left, width: Math.max(dropPos.width, 120) }}
        >
          {placeholder && (
            <button
              onClick={() => { onChange(''); setOpen(false); }}
              className="w-full text-left px-2.5 py-1.5 text-[11px] text-slate-400 hover:bg-slate-50"
            >
              {placeholder}
            </button>
          )}
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={cn(
                'w-full text-left px-2.5 py-1.5 text-[12px] hover:bg-slate-50 transition-colors',
                value === opt ? 'bg-[#0A75BB]/5 text-[#0A75BB] font-medium' : 'text-slate-700'
              )}
            >
              {opt}
            </button>
          ))}
          {allowCustom && (
            <>
              <div className="border-t border-slate-100" />
              <button
                onClick={() => { setShowCustom(true); setCustomVal(value && !options.includes(value) ? value : ''); setOpen(false); }}
                className="w-full text-left px-2.5 py-1.5 text-[12px] text-[#0A75BB] hover:bg-[#0A75BB]/5 font-medium"
              >
                + Custom...
              </button>
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

export default function MedicineTable({ prescriptions, onChange, onLoadTemplate, diagnoses = [] }: MedicineTableProps) {
  const [showLoadPrev, setShowLoadPrev] = useState(false);
  const [showSaveAs, setShowSaveAs] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [customTemplates, setCustomTemplates] = useState<PrescriptionTemplate[]>([]);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const templateDropdownRef = useRef<HTMLDivElement>(null);
  const templatePanelRef = useRef<HTMLDivElement>(null);
  const [masterList, setMasterList] = useState<MasterMedicine[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [diagnosisBasedSuggestions, setDiagnosisBasedSuggestions] = useState<any[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const editInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dosagePatternRe = /^\d-\d-\d$|^SOS$/;

  useEffect(() => {
    let changed = false;
    const fixed = prescriptions.map((rx) => {
      const freqIsDosage = rx.frequency && dosagePatternRe.test(rx.frequency) && !rx.dosage;
      const doseIsFreq = rx.dosage && !dosagePatternRe.test(rx.dosage) && frequencyOptions.includes(rx.dosage);
      if (freqIsDosage) {
        changed = true;
        return { ...rx, dosage: rx.frequency, frequency: '' };
      }
      if (doseIsFreq) {
        changed = true;
        return { ...rx, frequency: rx.dosage, dosage: '' };
      }
      return rx;
    });
    if (changed) onChange(fixed);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prescriptions]);

  useEffect(() => {
    setCustomTemplates(medTemplateStorage.getAll());
    setMasterList(loadMasterList());
  }, []);

  // Fetch diagnosis-based suggestions when diagnoses change
  useEffect(() => {
    if (diagnoses.length === 0) {
      setDiagnosisBasedSuggestions([]);
      return;
    }
    const existing = prescriptions.filter(p => p.name).map(p => p.name).join(',');
    const diagnosesStr = diagnoses.join(',');
    fetch(`/api/ai/medicines?diagnoses=${encodeURIComponent(diagnosesStr)}&existing=${encodeURIComponent(existing)}`)
      .then(r => r.json())
      .then(data => setDiagnosisBasedSuggestions(data.suggestions || []))
      .catch(() => setDiagnosisBasedSuggestions([]));
  }, [diagnoses, prescriptions]);

  useEffect(() => {
    function handleClick(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      const inBtn = templateDropdownRef.current && templateDropdownRef.current.contains(target);
      const inPanel = templatePanelRef.current && templatePanelRef.current.contains(target);
      if (!inBtn && !inPanel) {
        setShowTemplateDropdown(false);
        setConfirmDeleteId(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, []);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      const len = editInputRef.current.value.length;
      editInputRef.current.setSelectionRange(len, len);
    }
  }, [editingId]);

  useEffect(() => {
    if (editingId === null) return;
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (dropdownRef.current && dropdownRef.current.contains(target)) return;
      if (editInputRef.current && editInputRef.current.contains(target)) return;
      setEditingId(null);
      setEditValue('');
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [editingId]);

  const existingMedicineKeys = useMemo(() => {
    return new Set(
      prescriptions
        .filter((p) => p.name)
        .map((p) => p.name.toLowerCase().trim())
    );
  }, [prescriptions]);

  const filtered = useMemo(() => {
    if (!editValue) return masterList.slice(0, 15);
    const q = editValue.toLowerCase();
    return masterList.filter(
      (m) => m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q)
    ).slice(0, 15);
  }, [editValue, masterList]);

  // Fetch AI suggestions when typing (debounced)
  useEffect(() => {
    if (!editValue || editValue.length < 1) {
      setAiSuggestions([]);
      return;
    }
    const existing = prescriptions.filter(p => p.name).map(p => p.name).join(',');
    const diagnosesStr = diagnoses.join(',');
    const controller = new AbortController();
    setAiLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/ai/medicines?q=${encodeURIComponent(editValue)}&diagnoses=${encodeURIComponent(diagnosesStr)}&existing=${encodeURIComponent(existing)}`, { signal: controller.signal })
        .then(r => r.json())
        .then(data => setAiSuggestions(data.suggestions || []))
        .catch(() => {})
        .finally(() => setAiLoading(false));
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [editValue, diagnoses, prescriptions]);

  const addMedicineFromList = (med: MasterMedicine) => {
    const key = med.name.toLowerCase().trim();
    if (existingMedicineKeys.has(key)) {
      setDuplicateWarning(med.name);
      setTimeout(() => setDuplicateWarning(null), 3000);
      return;
    }
    onChange([
      ...prescriptions,
      {
        id: generateId(),
        name: med.name,
        genericName: med.genericName,
        strength: med.dosage,
        dosage: '1-0-1',
        frequency: med.frequency || 'Once daily',
        duration: '1 month',
        route: med.route,
        instructions: '',
      },
    ]);
    setEditingId(null);
    setEditValue('');
  };

  const addNewCustomMedicine = (name: string) => {
    if (!name.trim()) return;
    const key = name.trim().toLowerCase();
    if (existingMedicineKeys.has(key)) {
      setDuplicateWarning(name.trim());
      setTimeout(() => setDuplicateWarning(null), 3000);
      return;
    }
    const newMed: MasterMedicine = { name: name.trim(), genericName: name.trim(), dosage: '10mg', frequency: 'daily', route: 'Oral' };
    const updated = [...masterList, newMed];
    setMasterList(updated);
    saveMasterList(updated);
    addMedicineFromList(newMed);
  };

  const startEditingMedicine = (id: string | null, currentValue: string) => {
    setEditingId(id);
    setEditValue(currentValue || '');
    setSelectedIdx(-1);
    setTimeout(() => {
      if (editInputRef.current) {
        const rect = editInputRef.current.getBoundingClientRect();
        setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
      }
    }, 0);
  };

  const updateEditPosition = () => {
    if (editInputRef.current) {
      const rect = editInputRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filtered.length === 0 && !editValue.trim()) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((p) => (p < filtered.length - 1 ? p + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((p) => (p > 0 ? p - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIdx >= 0 && selectedIdx < filtered.length) {
        addMedicineFromList(filtered[selectedIdx]);
      } else if (editValue.trim() && filtered.length === 0) {
        addNewCustomMedicine(editValue);
      } else if (editValue.trim()) {
        addNewCustomMedicine(editValue);
      }
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditValue('');
    }
  };

  const removeMedicine = (id: string) => {
    onChange(prescriptions.filter((r) => r.id !== id));
  };

  const updateMedicine = (id: string, field: keyof PrescriptionItem, value: string) => {
    onChange(prescriptions.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const insertRowBelow = (idx: number) => {
    const newRx = [...prescriptions];
    newRx.splice(idx + 1, 0, {
      id: generateId(), name: '', genericName: '', strength: '', dosage: '',
      frequency: '', duration: '', route: 'Oral', instructions: '',
    });
    onChange(newRx);
    setTimeout(() => startEditingMedicine(newRx[idx + 1].id, ''), 0);
  };

  const loadPrevMedicines = () => {
    const newRx = recentFrequentMedicines.filter(
      (m) => !existingMedicineKeys.has(m.name.toLowerCase().trim())
    ).map((m) => ({
      id: generateId(),
      name: m.name,
      genericName: m.genericName,
      dosage: m.dosage,
      frequency: m.frequency,
      duration: '1 month',
      route: m.route,
      instructions: '',
    }));
    if (newRx.length === 0) {
      setDuplicateWarning('All frequent medicines already added');
      setTimeout(() => setDuplicateWarning(null), 3000);
      setShowLoadPrev(false);
      return;
    }
    onChange([...prescriptions, ...newRx]);
    setShowLoadPrev(false);
  };

  const loadTemplate = (template: PrescriptionTemplate) => {
    const newRx = template.medications.map((m) => ({
      id: generateId(),
      name: m.name,
      genericName: m.name,
      strength: m.dosage,
      dosage: m.dosage.includes('-') ? m.dosage : '1-0-1',
      frequency: m.frequency,
      duration: m.duration,
      route: 'Oral',
      instructions: m.instructions || '',
    }));
    const uniqueNew = newRx.filter((r) => !existingMedicineKeys.has(r.name.toLowerCase().trim()));
    const skippedCount = newRx.length - uniqueNew.length;
    if (skippedCount > 0) {
      setDuplicateWarning(`${skippedCount} duplicate${skippedCount > 1 ? 's' : ''} skipped`);
      setTimeout(() => setDuplicateWarning(null), 3000);
    }
    if (uniqueNew.length === 0) {
      setDuplicateWarning(`All medicines in "${template.name}" already added`);
      setTimeout(() => setDuplicateWarning(null), 3000);
      return;
    }
    if (onLoadTemplate) {
      onLoadTemplate({
        medications: uniqueNew,
        advice: template.advice || '',
        testsPrescribed: template.testsPrescribed || [],
      });
    } else {
      onChange([...prescriptions, ...uniqueNew]);
    }
    setActiveTemplateId(template.id);
    setShowTemplateDropdown(false);
  };

  const saveAsTemplate = () => {
    if (!templateName.trim()) return;
    const template: PrescriptionTemplate = {
      id: 'custom_' + Date.now(),
      name: templateName,
      description: `${prescriptions.length} medicines`,
      diagnosis: '',
      medications: prescriptions.map((p) => ({
        name: p.name,
        dosage: p.strength || p.dosage,
        frequency: p.frequency,
        duration: p.duration,
        instructions: p.instructions,
      })),
      isCustom: true,
    };
    const updated = [...customTemplates, template];
    setCustomTemplates(updated);
    medTemplateStorage.save(updated);
    setShowSaveAs(false);
    setTemplateName('');
  };

  const deleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customTemplates.filter((t) => t.id !== id);
    setCustomTemplates(updated);
    medTemplateStorage.save(updated);
    setConfirmDeleteId(null);
    if (activeTemplateId === id) setActiveTemplateId(null);
  };

  const renderMedicineDropdown = () => {
    if (editingId === null) return null;

    // Merge AI suggestions with local filtered, removing duplicates
    const allSuggestions = [...aiSuggestions];
    const aiKeys = new Set(aiSuggestions.map((s: any) => `${s.name}|${s.dosage}`));
    for (const m of filtered) {
      if (!aiKeys.has(`${m.name}|${m.dosage}`)) {
        allSuggestions.push({ ...m, _local: true });
      }
    }
    const displayItems = allSuggestions.slice(0, 15);

    return createPortal(
      <div ref={dropdownRef} className="fixed z-[250] bg-white border border-slate-200 rounded-lg shadow-xl max-h-72 overflow-y-auto" style={{ top: dropdownPos.top, left: dropdownPos.left, width: Math.max(dropdownPos.width, 320) }}>
        {aiLoading && editValue && (
          <div className="px-3 py-2 text-[11px] text-[#0A75BB] bg-[#0A75BB]/5 border-b border-slate-100 flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-[#0A75BB] border-t-transparent rounded-full animate-spin" />
            AI suggestions loading...
          </div>
        )}
        {displayItems.map((m: any, i: number) => {
          const isDuplicate = existingMedicineKeys.has(m.name.toLowerCase().trim());
          const isAi = !m._local;
          return (
            <button
              key={`${m.name}-${m.dosage}-${i}`}
              onMouseDown={(e) => { e.preventDefault(); addMedicineFromList(m); }}
              className={cn(
                'w-full text-left px-3 py-2 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0',
                i === selectedIdx ? 'bg-[#0A75BB]/10' : 'hover:bg-slate-50',
                isDuplicate && 'opacity-50'
              )}
            >
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
                isAi ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-[#0A75BB]/10'
              )}>
                {isAi ? (
                  <span className="text-[10px] font-bold text-white">AI</span>
                ) : (
                  <span className="text-[10px] font-bold text-[#0A75BB]">{m.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-slate-800 uppercase leading-tight">{m.name}</span>
                  {isAi && (
                    <span className="px-1.5 py-0.5 text-[8px] font-bold text-violet-700 bg-violet-100 rounded-full">AI</span>
                  )}
                  {isDuplicate && (
                    <span className="px-1.5 py-0.5 text-[8px] font-bold text-amber-700 bg-amber-100 rounded-full">ADDED</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {m.genericName} {m.dosage ? `| ${m.dosage}` : ''} {m.frequency ? `| ${m.frequency}` : ''}
                  {m.reason ? ` · ${m.reason}` : ''}
                </div>
              </div>
              {!isDuplicate && <Plus className="h-4 w-4 text-slate-300 shrink-0" />}
            </button>
          );
        })}
        {editValue.trim() && !masterList.some(m => m.name.toLowerCase() === editValue.trim().toLowerCase()) && (
          <button
            onMouseDown={(e) => { e.preventDefault(); addNewCustomMedicine(editValue); }}
            className="w-full text-left px-3 py-2.5 flex items-center gap-3 bg-[#0A75BB]/5 hover:bg-[#0A75BB]/10 border-t border-[#0A75BB]/20 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[#0A75BB]/15 flex items-center justify-center shrink-0">
              <Plus className="h-4 w-4 text-[#0A75BB]" />
            </div>
            <div>
              <div className="text-[13px] font-medium text-[#0A75BB]">Add &quot;{editValue.trim()}&quot;</div>
              <div className="text-[10px] text-slate-400">New medicine — saved for future</div>
            </div>
          </button>
        )}
        {displayItems.length === 0 && !aiLoading && !editValue.trim() && (
          <div className="px-4 py-6 text-center text-xs text-slate-400">Type to search medicines...</div>
        )}
      </div>,
      document.body
    );
  };

  const [templateBtnPos, setTemplateBtnPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

  const renderTemplateDropdown = () => {
    if (!showTemplateDropdown) return null;
    return createPortal(
        <div
          ref={templatePanelRef}
          className="fixed z-[250] bg-white border border-slate-200 rounded-xl shadow-xl w-72"
          style={{ bottom: window.innerHeight - templateBtnPos.top + 4, left: Math.max(8, templateBtnPos.left + templateBtnPos.width - 288), width: 288 }}
        >
        <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500">Saved Templates</p>
          <button onClick={() => setShowTemplateDropdown(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {customTemplates.length === 0 && prescriptionTemplates.length === 0 && (
            <div className="px-3 py-6 text-center text-xs text-slate-400">No templates saved yet</div>
          )}
          {customTemplates.map((tpl) => (
            <div key={tpl.id}
              className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 cursor-pointer group/tpl"
              onClick={() => loadTemplate(tpl)}>
              <div className="flex items-center gap-2 min-w-0">
                {activeTemplateId === tpl.id && <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                <span className={cn('text-sm truncate', activeTemplateId === tpl.id ? 'font-semibold text-emerald-700' : 'text-slate-700')}>
                  {tpl.name}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                {confirmDeleteId === tpl.id ? (
                  <>
                    <button onClick={(e) => deleteTemplate(tpl.id, e)}
                      className="px-2 py-1 text-[10px] font-medium text-white bg-red-500 rounded hover:bg-red-600">Del</button>
                    <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                      className="px-2 py-1 text-[10px] font-medium text-slate-500 bg-slate-100 rounded">No</button>
                  </>
                ) : (
                  <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(tpl.id); }}
                    className="p-1.5 text-slate-400 hover:text-red-500 sm:opacity-0 sm:group-hover/tpl:opacity-100 transition-all rounded">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {prescriptionTemplates.length > 0 && (
            <>
              {customTemplates.length > 0 && <div className="border-t border-slate-100" />}
              {prescriptionTemplates.map((tpl) => (
                <div key={tpl.id}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer"
                  onClick={() => loadTemplate(tpl)}>
                  {activeTemplateId === tpl.id && <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                  <span className={cn('text-sm truncate', activeTemplateId === tpl.id ? 'font-semibold text-emerald-700' : 'text-slate-700')}>
                    {tpl.name}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden" id="section-medicine">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr style={{ background: '#dce4f0' }}>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-600 w-10 border-b border-slate-200">#</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-600 min-w-[200px] border-b border-slate-200">Medicine</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-600 w-28 border-b border-slate-200">
                <span className="flex items-center gap-1">Strength <ChevronDown className="h-3 w-3 text-slate-400" /></span>
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-600 w-24 border-b border-slate-200">
                <span className="flex items-center gap-1">Dosage <ChevronDown className="h-3 w-3 text-slate-400" /></span>
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-600 w-28 border-b border-slate-200">
                <span className="flex items-center gap-1">When <ChevronDown className="h-3 w-3 text-slate-400" /></span>
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-600 w-28 border-b border-slate-200">
                <span className="flex items-center gap-1">Frequency <ChevronDown className="h-3 w-3 text-slate-400" /></span>
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-600 w-28 border-b border-slate-200">
                <span className="flex items-center gap-1">Duration <ChevronDown className="h-3 w-3 text-slate-400" /></span>
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-600 w-32 border-b border-slate-200">Notes</th>
              <th className="w-10 border-b border-slate-200"></th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map((rx, idx) => (
              <tr key={rx.id} className="group/row hover:bg-slate-50/50" style={{ borderBottom: '1px solid #e8ecf1' }}>
                <td className="px-3 py-2 text-[13px] text-slate-500 align-top pt-3">{idx + 1}</td>
                <td className="px-3 py-2 align-top">
                  <div className="flex items-start gap-1.5">
                    <div className="flex-1 min-w-0">
                      {editingId === rx.id ? (
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => {
                            setEditValue(e.target.value);
                            setSelectedIdx(-1);
                            updateEditPosition();
                          }}
                          onKeyDown={handleKeyDown}
                          onFocus={updateEditPosition}
                          className="w-full px-2 py-1 text-[13px] border border-[#0A75BB] rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#0A75BB] uppercase"
                          placeholder="Type medicine name..."
                        />
                      ) : rx.name ? (
                        <div
                          onClick={() => startEditingMedicine(rx.id, rx.name)}
                          className="cursor-text"
                        >
                          <div className="text-[13px] font-bold text-slate-900 uppercase leading-tight">{rx.name}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Pencil className="h-2.5 w-2.5 text-[#0A75BB] shrink-0" />
                            <span className="text-[11px] text-[#0A75BB] truncate leading-tight">
                              {rx.genericName && rx.genericName !== rx.name ? rx.genericName : 'Click to edit'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditingMedicine(rx.id, '')}
                          className="text-[13px] text-slate-400 hover:text-[#0A75BB] transition-colors min-h-[44px] py-2 w-full text-left"
                        >
                          Add Medicine
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => insertRowBelow(idx)}
                      className="mt-1 w-8 h-8 rounded bg-[#0A75BB] text-white flex items-center justify-center hover:bg-[#085a94] transition-colors shrink-0"
                      title="Add row below"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </td>
                <td className="px-3 py-2 align-top pt-2">
                  <HpDropdown
                    value={rx.strength || ''}
                    options={strengthOptions}
                    onChange={(v) => updateMedicine(rx.id, 'strength', v)}
                    placeholder="mg"
                    allowCustom
                  />
                </td>
                <td className="px-3 py-2 align-top pt-2">
                  <HpDropdown
                    value={rx.dosage}
                    options={dosageOptions}
                    onChange={(v) => updateMedicine(rx.id, 'dosage', v)}
                    placeholder="Select"
                  />
                </td>
                <td className="px-3 py-2 align-top pt-2">
                  <HpDropdown
                    value={rx.when || ''}
                    options={whenOptions}
                    onChange={(v) => updateMedicine(rx.id, 'when', v)}
                    placeholder="Select"
                  />
                </td>
                <td className="px-3 py-2 align-top pt-2">
                  <HpDropdown
                    value={rx.frequency}
                    options={frequencyOptions}
                    onChange={(v) => updateMedicine(rx.id, 'frequency', v)}
                    placeholder="Select"
                  />
                </td>
                <td className="px-3 py-2 align-top pt-2">
                  <HpDropdown
                    value={rx.duration}
                    options={durationOptions}
                    onChange={(v) => updateMedicine(rx.id, 'duration', v)}
                    placeholder="Select"
                  />
                </td>
                <td className="px-3 py-2 align-top pt-2">
                  <input
                    type="text"
                    value={rx.instructions || ''}
                    onChange={(e) => updateMedicine(rx.id, 'instructions', e.target.value)}
                    className="w-full px-2 py-1.5 text-[12px] border border-slate-200 rounded bg-white focus:outline-none focus:border-[#0A75BB]"
                    placeholder=""
                  />
                </td>
                <td className="px-3 py-2 align-top pt-2">
                  <button
                    onClick={() => removeMedicine(rx.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 sm:opacity-0 sm:group-hover/row:opacity-100 transition-all rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            <tr
              className="cursor-pointer hover:bg-[#0A75BB]/5"
              style={{ borderBottom: '1px solid #e8ecf1' }}
            >
              <td className="px-3 py-2.5 text-[13px] text-slate-400">{prescriptions.length + 1}</td>
              <td className="px-3 py-2.5" colSpan={8}>
                {editingId === '__new__' ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editValue}
                    onChange={(e) => {
                      setEditValue(e.target.value);
                      setSelectedIdx(-1);
                      updateEditPosition();
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={updateEditPosition}
                    className="w-full px-2 py-1 text-[13px] text-slate-400 border border-[#0A75BB] rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#0A75BB]"
                    placeholder="Type medicine name..."
                  />
                ) : (
                  <button
                    onClick={() => startEditingMedicine('__new__', '')}
                    className="w-full text-left px-2 py-3 min-h-[44px] text-[13px] font-medium text-slate-400 hover:text-[#0A75BB] transition-colors rounded"
                  >
                    + Add Medicine
                  </button>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {renderMedicineDropdown()}

      {/* Bottom Action Bar */}
      <div className="px-3 py-2 border-t border-slate-200 flex items-center justify-end gap-2">
        <button onClick={() => setShowLoadPrev(true)}
          className="flex items-center gap-1.5 px-3 h-10 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors rounded hover:bg-slate-50">
          <RotateCcw className="h-3.5 w-3.5" /> Load Prev
        </button>

        <div ref={templateDropdownRef} className="relative">
          <button onClick={() => {
            if (!showTemplateDropdown) {
              const btn = (templateDropdownRef.current as HTMLElement)?.querySelector('button');
              if (btn) {
                const rect = btn.getBoundingClientRect();
                setTemplateBtnPos({ top: rect.top, left: rect.left, width: rect.width });
              }
            }
            setShowTemplateDropdown(!showTemplateDropdown);
          }}
            className="flex items-center gap-1.5 px-3 h-10 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors rounded hover:bg-slate-50">
            <FileText className="h-3.5 w-3.5" /> Load template
            {activeTemplateId && <Check className="h-3.5 w-3.5 text-emerald-500" />}
          </button>
        </div>

        {renderTemplateDropdown()}

        <button onClick={() => setShowSaveAs(true)}
          className="flex items-center gap-1.5 px-3 h-10 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors rounded hover:bg-slate-50">
          <Save className="h-3.5 w-3.5" /> Save as template
        </button>
        <button onClick={() => { onChange([]); setActiveTemplateId(null); }}
          className="flex items-center gap-1.5 px-3 h-10 text-xs font-medium text-red-400 hover:text-red-600 transition-colors rounded hover:bg-red-50">
          <Trash2 className="h-3 w-3" /> Clear All
        </button>
      </div>

      {/* Load Prev Modal */}
      {showLoadPrev && (
        <div className="fixed inset-0 z-[150] flex items-start justify-center bg-black/50 pt-[15vh]" onClick={() => setShowLoadPrev(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Load Previous Medicines</h3>
              <button onClick={() => setShowLoadPrev(false)} className="p-1 hover:bg-slate-100 rounded"><X className="h-4 w-4 text-slate-500" /></button>
            </div>
            <div className="p-3 max-h-80 overflow-y-auto">
              <p className="text-xs text-slate-500 mb-3">Frequently prescribed medicines</p>
              {recentFrequentMedicines.map((m, i) => {
                const isDuplicate = existingMedicineKeys.has(m.name.toLowerCase().trim());
                return (
                  <div key={i} className={cn("flex items-center justify-between py-2 border-b border-slate-50 last:border-0", isDuplicate && "opacity-60")}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800">{m.name}</span>
                        {isDuplicate && (
                          <span className="px-1.5 py-0.5 text-[9px] font-semibold text-amber-700 bg-amber-100 rounded-full">Already added</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{m.dosage} | {m.frequency}</div>
                    </div>
                    <button onClick={() => addMedicineFromList(m)}
                      className="px-2 py-1 text-[10px] font-medium text-[#0A75BB] bg-[#0A75BB]/10 rounded hover:bg-[#0A75BB]/20 transition-colors">Add</button>
                  </div>
                );
              })}
              <button onClick={loadPrevMedicines}
                className="w-full mt-3 px-3 py-2 text-xs font-medium text-white bg-[#0A75BB] rounded-lg hover:bg-[#085a94] transition-colors">Add All</button>
            </div>
          </div>
        </div>
      )}

      {/* Save as Template Modal */}
      {showSaveAs && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50" onClick={() => setShowSaveAs(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Save as Template</h3>
              <button onClick={() => setShowSaveAs(false)} className="p-1 hover:bg-slate-100 rounded"><X className="h-4 w-4 text-slate-500" /></button>
            </div>
            <div className="p-4">
              <p className="text-xs text-slate-500 mb-3">Save {prescriptions.length} medicines as a reusable template</p>
              <input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A75BB] mb-3"
                placeholder="Template name (e.g., CKD Stage 4)" autoFocus />
              <button onClick={saveAsTemplate} disabled={!templateName.trim()}
                className="w-full px-3 py-2 text-xs font-medium text-white bg-[#0A75BB] rounded-lg hover:bg-[#085a94] transition-colors disabled:opacity-50">Save Template</button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Warning Toast */}
      {duplicateWarning && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-4">
          <span className="text-sm font-medium text-amber-800">{duplicateWarning}</span>
          <button onClick={() => setDuplicateWarning(null)} className="p-0.5 hover:bg-amber-100 rounded">
            <X className="h-3.5 w-3.5 text-amber-500" />
          </button>
        </div>
      )}
    </div>
  );
}
