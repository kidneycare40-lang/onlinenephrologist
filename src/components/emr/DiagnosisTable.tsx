'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, Plus, PenLine, Undo2, Trash2 } from 'lucide-react';
import { icdDiagnoses } from '@/lib/data/emr-mock';
import type { Diagnosis } from '@/types/emr';
import { autoCorrect } from '@/lib/spellcheck';

interface DiagnosisTableProps {
  diagnoses: Diagnosis[];
  onChange: (diagnoses: Diagnosis[]) => void;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const COMMON_DIAGNOSES = [
  { icdCode: 'N18.9', name: 'CKD' },
  { icdCode: 'N18.6', name: 'CKD Stage 5 / ESRD' },
  { icdCode: 'N18.5', name: 'CKD Stage 5' },
  { icdCode: 'N18.4', name: 'CKD Stage 4' },
  { icdCode: 'N18.3', name: 'CKD Stage 3' },
  { icdCode: 'I10', name: 'Hypertension' },
  { icdCode: 'E11.9', name: 'DM' },
  { icdCode: 'E11.2', name: 'Diabetic Nephropathy' },
  { icdCode: 'I25.1', name: 'CAD' },
  { icdCode: 'I50.9', name: 'CHF' },
  { icdCode: 'N04', name: 'Nephrotic Syndrome' },
  { icdCode: 'N20.0', name: 'Renal Calculus' },
  { icdCode: 'N39.0', name: 'UTI' },
  { icdCode: 'D63.1', name: 'Anemia in CKD' },
  { icdCode: 'E87.5', name: 'Hyperkalemia' },
  { icdCode: 'E87.2', name: 'Metabolic Acidosis' },
  { icdCode: 'E21.1', name: 'Secondary Hyperparathyroidism' },
  { icdCode: 'E79.0', name: 'Hyperuricemia' },
  { icdCode: 'R80.9', name: 'Proteinuria' },
  { icdCode: 'N02', name: 'Recurrent Hematuria' },
];

function getSuggestions(query: string): { icdCode: string; name: string }[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const seen = new Set<string>();
  const results: { icdCode: string; name: string }[] = [];
  const addUnique = (d: { icdCode: string; name: string }) => {
    if (seen.has(d.name.toLowerCase())) return;
    seen.add(d.name.toLowerCase());
    results.push(d);
  };
  for (const d of COMMON_DIAGNOSES) {
    if (d.name.toLowerCase().includes(q) || d.icdCode.toLowerCase().includes(q)) addUnique(d);
  }
  for (const d of icdDiagnoses) {
    if (d.name.toLowerCase().includes(q) || d.icdCode.toLowerCase().includes(q)) addUnique(d);
  }
  return results.slice(0, 12);
}

export default function DiagnosisTable({ diagnoses, onChange }: DiagnosisTableProps) {
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [suggestions, setSuggestions] = useState<{ icdCode: string; name: string }[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [history, setHistory] = useState<Diagnosis[][]>([diagnoses]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (editingCell?.field === 'name' && inputRef.current) {
      inputRef.current.focus();
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [editingCell]);

  useEffect(() => {
    if (editingCell?.field !== 'name') return;
    const handleClick = (e: MouseEvent | TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        saveEdit();
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [editingCell, editValue]);

  const pushHistory = (newDiags: Diagnosis[]) => {
    const h = history.slice(0, historyIdx + 1);
    h.push(newDiags.map((d) => ({ ...d })));
    setHistory(h);
    setHistoryIdx(h.length - 1);
  };

  const startEditing = (id: string, field: string, currentValue: string) => {
    setEditingCell({ id, field });
    setEditValue(currentValue || '');
    setSelectedIdx(-1);
    if (field === 'name') {
      setSuggestions(getSuggestions(currentValue || ''));
      setTimeout(() => {
        if (inputRef.current) {
          const rect = inputRef.current.getBoundingClientRect();
          setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
        }
      }, 0);
    }
  };

  const saveEdit = () => {
    if (editingCell) {
      let corrected = editingCell.field === 'name' ? autoCorrect(editValue) : editValue;
      const newDiags = diagnoses.map((d) => (d.id === editingCell.id ? { ...d, [editingCell.field]: corrected } : d));
      onChange(newDiags);
      pushHistory(newDiags);
      setEditingCell(null);
      setEditValue('');
      setSuggestions([]);
    }
  };

  const selectSuggestion = (s: { icdCode: string; name: string }) => {
    if (!editingCell) return;
    const newDiags = diagnoses.map((d) =>
      d.id === editingCell.id ? { ...d, name: s.name, icdCode: s.icdCode } : d
    );
    onChange(newDiags);
    pushHistory(newDiags);
    setEditingCell(null);
    setEditValue('');
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (editingCell?.field === 'name' && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((p) => (p < suggestions.length - 1 ? p + 1 : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((p) => (p > 0 ? p - 1 : suggestions.length - 1));
        return;
      }
      if (e.key === 'Enter' && selectedIdx >= 0) {
        e.preventDefault();
        selectSuggestion(suggestions[selectedIdx]);
        return;
      }
    }
    if (e.key === 'Enter' && editingCell?.field !== 'name') saveEdit();
    if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
      setSuggestions([]);
    }
    if (e.key === 'Tab') saveEdit();
  };

  const addEmptyRow = () => {
    const newDiags = [
      ...diagnoses,
      { id: generateId(), icdCode: '', name: '', isPrimary: diagnoses.length === 0, notes: '', snomedCode: '', date: new Date().toISOString().split('T')[0], duration: '' },
    ];
    onChange(newDiags);
    pushHistory(newDiags);
    setEditingCell({ id: newDiags[newDiags.length - 1].id, field: 'name' });
    setEditValue('');
  };

  const removeDiagnosis = (id: string) => {
    const filtered = diagnoses.filter((d) => d.id !== id);
    if (filtered.length > 0 && !filtered.some((d) => d.isPrimary)) {
      filtered[0].isPrimary = true;
    }
    onChange(filtered);
    pushHistory(filtered);
  };

  const updateField = (id: string, field: string, value: string) => {
    const newDiags = diagnoses.map((d) => (d.id === id ? { ...d, [field]: value } : d));
    onChange(newDiags);
    pushHistory(newDiags);
  };

  const undo = () => {
    if (historyIdx > 0) {
      setHistoryIdx(historyIdx - 1);
      onChange(history[historyIdx - 1]);
    }
  };

  const isEditing = (id: string, field: string) => {
    return editingCell?.id === id && editingCell?.field === field;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg" id="section-diagnosis">
      <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Diagnosis</h3>
        <div className="flex items-center gap-1">
          <button onClick={undo} disabled={historyIdx === 0}
            className="p-2 text-slate-400 hover:text-[#0A75BB] hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30" title="Undo">
            <Undo2 className="h-4 w-4" />
          </button>
          <button onClick={addEmptyRow}
            className="p-2 text-slate-400 hover:text-[#0A75BB] hover:bg-slate-100 rounded-lg transition-colors" title="Add diagnosis">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#f0f4f8] text-left">
              <th className="px-3 py-2 text-[11px] font-semibold text-slate-500 w-8">#</th>
              <th className="px-3 py-2 text-[11px] font-semibold text-slate-500">Diagnosis</th>
              <th className="px-3 py-2 text-[11px] font-semibold text-slate-500">SNOMED Code</th>
              <th className="px-3 py-2 text-[11px] font-semibold text-slate-500">Duration</th>
              <th className="px-3 py-2 text-[11px] font-semibold text-slate-500">Date</th>
              <th className="px-3 py-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {diagnoses.map((diag, idx) => (
              <tr key={diag.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                <td className="px-3 py-2 text-[11px] text-slate-400 text-center">
                  {idx + 1}
                  {diag.isPrimary && <span className="ml-1 text-[9px] text-[#0A75BB] font-bold">P</span>}
                </td>

                {/* Diagnosis cell with inline auto-suggest */}
                <td className="px-3 py-1.5 relative">
                  {isEditing(diag.id, 'name') ? (
                    <div ref={wrapperRef}>
                      <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => {
                          setEditValue(e.target.value);
                          setSuggestions(getSuggestions(e.target.value));
                          setSelectedIdx(-1);
                          if (inputRef.current) {
                            const rect = inputRef.current.getBoundingClientRect();
                            setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
                          }
                        }}
                        onKeyDown={handleKeyDown}
                        className="w-full px-2 py-1 text-[12px] border border-[#0A75BB] rounded focus:outline-none focus:ring-1 focus:ring-[#0A75BB] bg-white"
                        placeholder="Type to search..."
                      />
                      {suggestions.length > 0 && (
                        <div
                          className="fixed z-[200] bg-white border border-slate-200 rounded-lg shadow-lg max-h-56 overflow-y-auto"
                          style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}
                        >
                          {suggestions.map((s, si) => (
                            <button
                              key={s.icdCode + s.name}
                              onMouseDown={(e) => { e.preventDefault(); selectSuggestion(s); }}
                              className={cn(
                                'w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors',
                                si === selectedIdx ? 'bg-[#0A75BB]/10 text-[#0A75BB]' : 'hover:bg-slate-50 text-slate-700'
                              )}
                            >
                              <span className="font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                                {s.icdCode}
                              </span>
                              <span className="font-medium truncate">{s.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditing(diag.id, 'name', diag.name)}
                      className={cn(
                        'w-full text-left text-[12px] py-1 px-1 rounded transition-colors cursor-text min-h-[36px] border border-transparent',
                        'hover:border-slate-200 hover:bg-white',
                        diag.name ? 'text-slate-800 font-medium' : 'text-slate-400 italic'
                      )}
                    >
                      {diag.name || 'Type to add...'}
                    </button>
                  )}
                </td>

                {/* SNOMED Code */}
                <td className="px-3 py-1.5">
                  {isEditing(diag.id, 'snomedCode') ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={saveEdit}
                      autoFocus
                      className="w-full px-2 py-1 text-[12px] border border-[#0A75BB] rounded focus:outline-none focus:ring-1 focus:ring-[#0A75BB]"
                    />
                  ) : (
                    <button
                      onClick={() => startEditing(diag.id, 'snomedCode', diag.snomedCode || '')}
                      className={cn(
                        'w-full text-left text-[12px] py-1 px-1 rounded transition-colors cursor-text min-h-[36px] border border-transparent',
                        'hover:border-slate-200 hover:bg-white',
                        diag.snomedCode ? 'text-slate-700 font-mono text-[11px]' : 'text-slate-400'
                      )}
                    >
                      {diag.snomedCode || '-'}
                    </button>
                  )}
                </td>

                {/* Duration */}
                <td className="px-3 py-1.5">
                  {isEditing(diag.id, 'duration') ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={saveEdit}
                      autoFocus
                      className="w-full px-2 py-1 text-[12px] border border-[#0A75BB] rounded focus:outline-none focus:ring-1 focus:ring-[#0A75BB]"
                      placeholder="e.g. 3 months"
                    />
                  ) : (
                    <button
                      onClick={() => startEditing(diag.id, 'duration', diag.duration || '')}
                      className={cn(
                        'w-full text-left text-[12px] py-1 px-1 rounded transition-colors cursor-text min-h-[36px] border border-transparent',
                        'hover:border-slate-200 hover:bg-white',
                        diag.duration ? 'text-slate-700' : 'text-slate-400'
                      )}
                    >
                      {diag.duration || 'select'}
                    </button>
                  )}
                </td>

                {/* Date */}
                <td className="px-3 py-1.5">
                  <input
                    type="date"
                    value={diag.date || ''}
                    onChange={(e) => updateField(diag.id, 'date', e.target.value)}
                    className="px-2 py-1 text-[11px] border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#0A75BB] max-w-[130px] cursor-pointer"
                  />
                </td>

                {/* Delete */}
                <td className="px-3 py-1.5">
                  <button
                    onClick={() => removeDiagnosis(diag.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}

            {diagnoses.length === 0 && (
              <tr className="border-t border-slate-200">
                <td colSpan={6} className="px-3 py-8 text-center">
                  <p className="text-xs text-slate-400 mb-2">No diagnoses added</p>
                  <button
                    onClick={addEmptyRow}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0A75BB] bg-[#0A75BB]/10 rounded-lg hover:bg-[#0A75BB]/20 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Diagnosis
                  </button>
                </td>
              </tr>
            )}

            {diagnoses.length > 0 && (
              <tr className="border-t border-slate-200 cursor-pointer hover:bg-[#0A75BB]/5" onClick={addEmptyRow}>
                <td className="px-3 py-2.5 text-xs text-slate-400 text-center">{diagnoses.length + 1}</td>
                <td colSpan={5} className="px-3 py-2.5">
                  <span className="text-xs font-medium text-[#0A75BB] flex items-center gap-1.5">
                    <Plus className="h-4 w-4" /> Add another diagnosis
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
