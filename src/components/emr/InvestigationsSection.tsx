'use client';

import React, { useState, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Plus, Calendar, Search, X, ChevronDown } from 'lucide-react';
import { labTestGroups } from '@/lib/data/emr-mock';

const allSuggestedTests = labTestGroups.flatMap((g) => g.tests);

const referenceRanges: Record<string, { min: number; max: number; unit: string }> = {
  'Haemoglobin (Hb)': { min: 12, max: 16, unit: 'Gms %' },
  'Hemoglobin': { min: 12, max: 16, unit: 'Gms %' },
  'Blood Urea': { min: 7, max: 20, unit: 'mg/dL' },
  'Blood Urea Nitrogen': { min: 7, max: 20, unit: 'mg/dL' },
  'Serum Creatinine': { min: 0.6, max: 1.2, unit: 'mg/dL' },
  'eGFR': { min: 60, max: 999, unit: 'mL/min/1.73m²' },
  'Serum Sodium': { min: 136, max: 145, unit: 'mEq/L' },
  'Serum Sodium (Na+)': { min: 136, max: 145, unit: 'mEq/L' },
  'Serum Potassium': { min: 3.5, max: 5.0, unit: 'mEq/L' },
  'Serum Potassium (K+)': { min: 3.5, max: 5.0, unit: 'mEq/L' },
  'Serum Uric Acid': { min: 3.5, max: 7.2, unit: 'mg/dL' },
  'Serum Calcium': { min: 8.5, max: 10.5, unit: 'mg/dL' },
  'Phosphorous (PO4)': { min: 2.5, max: 4.5, unit: 'mg/dL' },
  'Phosphorus': { min: 2.5, max: 4.5, unit: 'mg/dL' },
  'Serum Protein - Albumin': { min: 3.5, max: 5.0, unit: 'g/dL' },
  'Serum Albumin': { min: 3.5, max: 5.0, unit: 'g/dL' },
  'SGPT (ALT)': { min: 0, max: 40, unit: 'IU/L' },
  'SGOT (AST)': { min: 0, max: 40, unit: 'IU/L' },
  'HbA1c': { min: 0, max: 7.0, unit: '%' },
  'Intact PTH': { min: 15, max: 65, unit: 'pg/mL' },
  'Blood Glucose': { min: 70, max: 140, unit: 'mg/dL' },
  'WBC Count': { min: 4000, max: 11000, unit: '/μL' },
  'Platelet Count': { min: 150000, max: 400000, unit: '/μL' },
  'Serum Magnesium': { min: 1.7, max: 2.2, unit: 'mg/dL' },
  'Total Cholesterol': { min: 0, max: 200, unit: 'mg/dL' },
  'Triglycerides': { min: 0, max: 150, unit: 'mg/dL' },
  'Serum Iron': { min: 60, max: 170, unit: 'μg/dL' },
  'Ferritin': { min: 12, max: 300, unit: 'ng/mL' },
  'TIBC': { min: 250, max: 370, unit: 'μg/dL' },
};

export function isAbnormal(testName: string, value: string): boolean {
  const ref = referenceRanges[testName];
  if (!ref) return false;
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  return num < ref.min || num > ref.max;
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDisplayDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

interface LabResult {
  testName: string;
  value: string;
  unit: string;
  date: string;
  dateISO: string;
  isAbnormal: boolean;
}

export function InvestigationsTable({
  pastResults,
}: {
  pastResults: { testName: string; value: string; unit: string; date: string; isAbnormal: boolean }[];
}) {
  const [showAddInput, setShowAddInput] = useState(false);
  const [newTestName, setNewTestName] = useState('');
  const [editingCell, setEditingCell] = useState<{ testName: string; dateISO: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showAddDate, setShowAddDate] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [showAllTests, setShowAllTests] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const todayISO = toISODate(new Date());

  const normalizeDate = (raw: string): string => {
    if (raw.includes('-') && raw.length === 10) return raw;
    const d = new Date(raw);
    return toISODate(d);
  };

  const [entries, setEntries] = useState<LabResult[]>(() =>
    pastResults.map((r) => ({
      ...r,
      dateISO: normalizeDate(r.date),
    }))
  );

  const [extraDates, setExtraDates] = useState<string[]>([]);

  const allTestNames = useMemo(() => {
    const names = [...new Set(entries.map((r) => r.testName))];
    return names.sort();
  }, [entries]);

  const dates = useMemo(() => {
    const dateSet = new Set(entries.map((r) => r.dateISO));
    dateSet.add(todayISO);
    extraDates.forEach((d) => dateSet.add(d));
    return [...dateSet].sort((a, b) => b.localeCompare(a));
  }, [entries, todayISO, extraDates]);

  const suggestedTests = useMemo(() => {
    if (!newTestName.trim()) return allSuggestedTests.filter((t) => !allTestNames.includes(t)).slice(0, 20);
    const q = newTestName.toLowerCase();
    return allSuggestedTests
      .filter((t) => t.toLowerCase().includes(q) && !allTestNames.includes(t))
      .slice(0, 10);
  }, [newTestName, allTestNames]);

  const addTest = (testName: string) => {
    const trimmed = testName.trim();
    if (!trimmed || allTestNames.includes(trimmed)) return;
    const ref = referenceRanges[trimmed];
    setEntries([
      ...entries,
      { testName: trimmed, value: '', unit: ref?.unit || '', date: formatDisplayDate(todayISO), dateISO: todayISO, isAbnormal: false },
    ]);
    setNewTestName('');
    setShowAddInput(false);
  };

  const addNewDate = () => {
    if (!newDate) return;
    const iso = newDate;
    if (!dates.includes(iso)) {
      setExtraDates((prev) => [...prev, iso]);
    }
    setNewDate('');
    setShowAddDate(false);
  };

  const removeTest = (testName: string) => {
    setEntries((prev) => prev.filter((r) => r.testName !== testName));
  };

  const getValue = (testName: string, dateISO: string): string => {
    const entry = entries.find((r) => r.testName === testName && r.dateISO === dateISO);
    return entry?.value || '';
  };

  const getUnit = (testName: string): string => {
    const entry = entries.find((r) => r.testName === testName);
    return entry?.unit || referenceRanges[testName]?.unit || '';
  };

  const updateValue = (testName: string, dateISO: string, value: string) => {
    const abnormal = isAbnormal(testName, value);
    setEntries((prev) => {
      const existing = prev.find((r) => r.testName === testName && r.dateISO === dateISO);
      if (existing) {
        return prev.map((r) =>
          r.testName === testName && r.dateISO === dateISO
            ? { ...r, value, isAbnormal: abnormal }
            : r
        );
      }
      const ref = referenceRanges[testName];
      return [...prev, {
        testName,
        value,
        unit: ref?.unit || '',
        date: formatDisplayDate(dateISO),
        dateISO,
        isAbnormal: abnormal,
      }];
    });
  };

  const startEditing = (testName: string, dateISO: string) => {
    setEditingCell({ testName, dateISO });
    setEditValue(getValue(testName, dateISO));
  };

  const saveEdit = () => {
    if (editingCell) {
      updateValue(editingCell.testName, editingCell.dateISO, editValue);
      setEditingCell(null);
      setEditValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden" id="section-investigations">
      {/* Header - HealthPlix style */}
      <div className="px-3 py-2.5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-[13px] font-semibold text-slate-700">Investigations</h3>

          <button
            onClick={() => setShowAllTests(!showAllTests)}
            className={cn(
              'px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors',
              showAllTests
                ? 'bg-[#0A75BB] text-white'
                : 'bg-[#0A75BB]/10 text-[#0A75BB] hover:bg-[#0A75BB]/20'
            )}
          >
            View All Tests
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowAddDate(!showAddDate); setShowAddInput(false); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
          >
            <Calendar className="h-3 w-3" />
            Date
          </button>
        </div>
      </div>

      {/* Add Date bar */}
      {showAddDate && (
        <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <input
            type="date"
            value={newDate}
            max={todayISO}
            onChange={(e) => setNewDate(e.target.value)}
            className="px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0A75BB]"
          />
          <button
            onClick={addNewDate}
            disabled={!newDate}
            className="px-2.5 py-1 text-xs font-medium text-white bg-[#0A75BB] rounded-md hover:bg-[#085a94] disabled:opacity-50 transition-colors"
          >
            Add
          </button>
          <button
            onClick={() => { setShowAddDate(false); setNewDate(''); }}
            className="p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <colgroup>
            <col style={{ width: '40px' }} />
            <col style={{ minWidth: '200px' }} />
            <col style={{ width: '80px' }} />
            {dates.map((d) => (
              <col key={d} style={{ width: '110px' }} />
            ))}
          </colgroup>
          <thead>
            <tr style={{ background: '#dce4f0' }}>
              <th className="px-2 py-2.5 text-left text-[11px] font-semibold text-slate-600 border-b border-slate-200">#</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-600 border-b border-slate-200">Tests/Investigations</th>
              <th className="px-2 py-2.5 text-left text-[11px] font-semibold text-slate-600 border-b border-slate-200">Units</th>
              {dates.map((d) => (
                <th key={d} className={cn(
                  "px-2 py-2.5 text-center text-[11px] font-semibold border-b border-slate-200",
                  d === todayISO ? 'text-[#0A75BB]' : 'text-slate-600'
                )}>
                  {formatDisplayDate(d)}
                  {d === todayISO && <span className="text-[10px] font-normal ml-0.5">Today</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allTestNames.length === 0 ? (
              <tr>
                <td colSpan={3 + dates.length} className="px-3 py-10 text-center text-sm text-slate-400">
                  No investigations added yet.
                </td>
              </tr>
            ) : (
              allTestNames.map((testName, idx) => {
                const unit = getUnit(testName);
                return (
                  <tr key={testName} className="group/row" style={{ borderBottom: '1px solid #e8ecf1' }}>
                    <td className="px-2 py-2 text-[12px] text-slate-400 align-middle">{idx + 1}</td>
                    <td className="px-3 py-2 align-middle">
                      <span className="text-[12px] font-medium text-slate-800">{testName}</span>
                    </td>
                    <td className="px-2 py-2 text-[11px] text-slate-500 align-middle">{unit}</td>
                    {dates.map((d) => {
                      const isEditing = editingCell?.testName === testName && editingCell?.dateISO === d;
                      const val = getValue(testName, d);
                      const abnormal = val ? isAbnormal(testName, val) : false;

                      return (
                        <td key={d} className={cn(
                          "px-1 py-1 border-l border-slate-100",
                          abnormal && val ? 'bg-red-50' : ''
                        )}>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              onBlur={saveEdit}
                              autoFocus
                              className="w-full px-2 h-11 text-[13px] text-center border border-[#0A75BB] rounded focus:outline-none focus:ring-1 focus:ring-[#0A75BB] font-semibold"
                            />
                          ) : (
                            <button
                              onClick={() => startEditing(testName, d)}
                              className={cn(
                                'w-full text-[12px] font-semibold py-1 px-1 rounded transition-colors cursor-text text-center',
                                'hover:bg-slate-100',
                                val
                                  ? abnormal ? 'text-red-600 font-bold' : 'text-slate-700'
                                  : 'text-transparent hover:text-[#0A75BB]'
                              )}
                              title={d === todayISO ? 'Click to enter value' : 'Click to edit'}
                            >
                              {val || '\u00A0'}
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}

            {/* Add Investigation row */}
            <tr
              className="cursor-pointer group/add hover:bg-[#0A75BB]/5"
              style={{ borderBottom: '1px solid #e8ecf1' }}
              onClick={() => { setShowAddInput(true); setTimeout(() => searchInputRef.current?.focus(), 50); }}
            >
              <td className="px-2 py-2.5 text-[12px] text-slate-400">{allTestNames.length + 1}</td>
              <td colSpan={2 + dates.length} className="px-3 py-2.5">
                {showAddInput ? (
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Search className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={newTestName}
                      onChange={(e) => setNewTestName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (suggestedTests.length > 0 && newTestName) {
                            addTest(suggestedTests[0]);
                          } else if (newTestName.trim()) {
                            addTest(newTestName);
                          }
                        }
                        if (e.key === 'Escape') { setShowAddInput(false); setNewTestName(''); }
                      }}
                      placeholder="Type to search tests..."
                      className="flex-1 px-3 h-11 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#0A75BB]"
                    />
                    <button
                      onClick={() => addTest(newTestName)}
                      disabled={!newTestName.trim()}
                      className="px-3 h-11 text-xs font-medium text-white bg-[#0A75BB] rounded hover:bg-[#085a94] disabled:opacity-50 transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => { setShowAddInput(false); setNewTestName(''); }}
                      className="p-2.5 text-slate-400 hover:text-slate-600 rounded-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[13px] font-medium text-slate-400 group-hover/add:text-[#0A75BB] transition-colors">
                    Add Investigation
                  </span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Search suggestions dropdown */}
      {showAddInput && newTestName && suggestedTests.length > 0 && (
        <div className="mx-3 mb-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestedTests.map((test) => (
            <button
              key={test}
              onClick={() => addTest(test)}
              className="w-full text-left px-3 py-2 text-[12px] hover:bg-slate-50 text-slate-700 flex items-center gap-2 border-b border-slate-50 last:border-0"
            >
              <Plus className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="font-medium">{test}</span>
              {referenceRanges[test] && (
                <span className="text-[10px] text-slate-400 ml-auto">{referenceRanges[test].unit}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* View All Tests panel */}
      {showAllTests && (
        <div className="px-3 py-2 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Available Tests ({allSuggestedTests.length})</p>
            <button onClick={() => setShowAllTests(false)} className="p-0.5 hover:bg-slate-200 rounded">
              <X className="h-3 w-3 text-slate-400" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 max-h-40 overflow-y-auto">
            {allSuggestedTests.filter((t) => !allTestNames.includes(t)).map((test) => (
              <button
                key={test}
                onClick={() => addTest(test)}
                className="text-left px-2 py-1 text-[11px] text-slate-600 hover:bg-[#0A75BB]/10 hover:text-[#0A75BB] rounded transition-colors truncate"
              >
                + {test}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
