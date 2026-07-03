'use client';

import { useState, useRef } from 'react';
import {
  Settings, Save, RotateCcw, GripVertical, Eye, EyeOff,
  HeartPulse, ClipboardList, FileText, MessageSquare,
  FlaskConical, Stethoscope, Pill, Lightbulb, TestTube,
  GitBranch, Activity, Droplets, Heart, Apple,
  Plus, X,
} from 'lucide-react';
import {
  loadConsultationSettings,
  saveConsultationSettings,
  resetConsultationSettings,
  type ConsultationSettings,
  type ConsultationSection,
} from '@/lib/consultation-settings';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  HeartPulse, ClipboardList, FileText, MessageSquare,
  FlaskConical, Stethoscope, Pill, Lightbulb, TestTube,
  GitBranch, Activity, Droplets, Heart, Apple,
};

const colorMap: Record<string, string> = {
  HeartPulse: 'text-red-500 bg-red-50',
  ClipboardList: 'text-purple-500 bg-purple-50',
  FileText: 'text-gray-500 bg-gray-50',
  MessageSquare: 'text-blue-500 bg-blue-50',
  FlaskConical: 'text-orange-500 bg-orange-50',
  Stethoscope: 'text-primary-500 bg-primary-50',
  Pill: 'text-emerald-500 bg-emerald-50',
  Lightbulb: 'text-yellow-500 bg-yellow-50',
  TestTube: 'text-pink-500 bg-pink-50',
  GitBranch: 'text-teal-500 bg-teal-50',
  Activity: 'text-cyan-500 bg-cyan-50',
  Droplets: 'text-blue-400 bg-blue-50',
  Heart: 'text-rose-500 bg-rose-50',
  Apple: 'text-green-500 bg-green-50',
};

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
        enabled ? 'bg-primary-600' : 'bg-gray-200'
      }`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition duration-200 ${
        enabled ? 'translate-x-5' : 'translate-x-0'
      }`} />
    </button>
  );
}

export default function ConsultationSettingsComponent() {
  const [settings, setSettings] = useState<ConsultationSettings>(loadConsultationSettings);
  const [saved, setSaved] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newComplaint, setNewComplaint] = useState('');
  const [newAdvice, setNewAdvice] = useState('');
  const dragItem = useRef<number | null>(null);

  function handleSave() {
    saveConsultationSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    if (confirm('Reset all consultation settings to defaults?')) {
      resetConsultationSettings();
      setSettings(loadConsultationSettings());
    }
  }

  function toggleSection(id: string) {
    setSettings(s => ({
      ...s,
      sections: s.sections.map(sec => sec.id === id ? { ...sec, enabled: !sec.enabled } : sec),
    }));
  }

  function moveSection(fromIdx: number, toIdx: number) {
    if (toIdx < 0 || toIdx >= settings.sections.length) return;
    const arr = [...settings.sections];
    const [moved] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, moved);
    // Update order numbers
    const reordered = arr.map((s, i) => ({ ...s, order: i }));
    setSettings(s => ({ ...s, sections: reordered }));
  }

  function handleDragStart(idx: number) {
    dragItem.current = idx;
    setDragIdx(idx);
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragItem.current === null || dragItem.current === idx) return;
    moveSection(dragItem.current, idx);
    dragItem.current = idx;
  }

  function handleDragEnd() {
    dragItem.current = null;
    setDragIdx(null);
  }

  function addListItem(field: 'customDiagnosisSuggestions' | 'customComplaintSuggestions' | 'defaultAdvice', value: string, setter: (v: string) => void) {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (settings[field].includes(trimmed)) return;
    setSettings(s => ({ ...s, [field]: [...s[field], trimmed] }));
    setter('');
  }

  function removeListItem(field: 'customDiagnosisSuggestions' | 'customComplaintSuggestions' | 'defaultAdvice', idx: number) {
    setSettings(s => ({ ...s, [field]: s[field].filter((_, i) => i !== idx) }));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <Settings className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Consultation Page Settings</h2>
            <p className="text-xs text-gray-500">Customize sections, defaults, and suggestions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
          <button onClick={handleSave} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm ${
            saved ? 'bg-emerald-500 text-white' : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}>
            <Save className="h-3.5 w-3.5" />
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Section Order & Visibility */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Sidebar Sections</h3>
          <p className="text-xs text-gray-500 mt-0.5">Drag to reorder, toggle to show/hide sections in the consultation sidebar</p>
        </div>
        <div className="divide-y divide-gray-100">
          {settings.sections.map((sec, idx) => {
            const Icon = iconMap[sec.icon] || FileText;
            const color = colorMap[sec.icon] || 'text-gray-500 bg-gray-50';
            return (
              <div
                key={sec.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                  dragIdx === idx ? 'bg-primary-50' : 'hover:bg-gray-50'
                } ${!sec.enabled ? 'opacity-50' : ''}`}
              >
                <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500">
                  <GripVertical className="h-4 w-4" />
                </div>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-gray-900 flex-1">{sec.label}</span>
                {sec.isLink && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">LINK</span>
                )}
                <button
                  onClick={() => toggleSection(sec.id)}
                  className={`p-1.5 rounded-lg transition-colors ${sec.enabled ? 'text-primary-600 hover:bg-primary-50' : 'text-gray-400 hover:bg-gray-100'}`}
                  title={sec.enabled ? 'Hide section' : 'Show section'}
                >
                  {sec.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Default Vitals */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Default Vitals</h3>
          <p className="text-xs text-gray-500 mt-0.5">Pre-fill vitals when opening a new consultation</p>
        </div>
        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {([
            ['height', 'Height (cm)'],
            ['weight', 'Weight (kg)'],
            ['bpSystolic', 'BP Systolic'],
            ['bpDiastolic', 'BP Diastolic'],
            ['pulse', 'Pulse'],
            ['temperature', 'Temp (°F)'],
            ['spo2', 'SpO2 (%)'],
          ] as const).map(([key, label]) => (
            <div key={key}>
              <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
              <input
                type="text"
                value={settings.defaultVitals[key]}
                onChange={(e) => setSettings(s => ({
                  ...s,
                  defaultVitals: { ...s.defaultVitals, [key]: e.target.value },
                }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="-"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Custom Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagnosis Suggestions */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Custom Diagnosis Suggestions</h3>
            <p className="text-xs text-gray-500 mt-0.5">Add frequent diagnoses for quick selection</p>
          </div>
          <div className="p-6">
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newDiagnosis}
                onChange={(e) => setNewDiagnosis(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addListItem('customDiagnosisSuggestions', newDiagnosis, setNewDiagnosis); }}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g. CKD Stage 4"
              />
              <button
                onClick={() => addListItem('customDiagnosisSuggestions', newDiagnosis, setNewDiagnosis)}
                className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
              {settings.customDiagnosisSuggestions.length === 0 && (
                <p className="text-xs text-gray-400 italic">No custom diagnoses added yet</p>
              )}
              {settings.customDiagnosisSuggestions.map((d, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium">
                  {d}
                  <button onClick={() => removeListItem('customDiagnosisSuggestions', i)} className="hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Complaint Suggestions */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Custom Complaint Suggestions</h3>
            <p className="text-xs text-gray-500 mt-0.5">Add frequent complaints for quick selection</p>
          </div>
          <div className="p-6">
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newComplaint}
                onChange={(e) => setNewComplaint(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addListItem('customComplaintSuggestions', newComplaint, setNewComplaint); }}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g. Reduced urine output"
              />
              <button
                onClick={() => addListItem('customComplaintSuggestions', newComplaint, setNewComplaint)}
                className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
              {settings.customComplaintSuggestions.length === 0 && (
                <p className="text-xs text-gray-400 italic">No custom complaints added yet</p>
              )}
              {settings.customComplaintSuggestions.map((c, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium">
                  {c}
                  <button onClick={() => removeListItem('customComplaintSuggestions', i)} className="hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Default Advice */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Default Advice Templates</h3>
          <p className="text-xs text-gray-500 mt-0.5">Pre-fill advice for every new consultation</p>
        </div>
        <div className="p-6">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newAdvice}
              onChange={(e) => setNewAdvice(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addListItem('defaultAdvice', newAdvice, setNewAdvice); }}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g. Low salt diet, Adequate hydration"
            />
            <button
              onClick={() => addListItem('defaultAdvice', newAdvice, setNewAdvice)}
              className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
            {settings.defaultAdvice.length === 0 && (
              <p className="text-xs text-gray-400 italic">No default advice added yet</p>
            )}
            {settings.defaultAdvice.map((a, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-medium">
                {a}
                <button onClick={() => removeListItem('defaultAdvice', i)} className="hover:text-red-500">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* General Toggles */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Display Options</h3>
        </div>
        <div className="p-6 space-y-1">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">Show Patient Info Header</p>
              <p className="text-xs text-gray-500">Display patient name, age, gender at top of consultation</p>
            </div>
            <Toggle enabled={settings.showPatientInfo} onChange={(v) => setSettings(s => ({ ...s, showPatientInfo: v }))} />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">Show Prescription Preview</p>
              <p className="text-xs text-gray-500">Show live prescription preview panel on the right</p>
            </div>
            <Toggle enabled={settings.showPrescriptionPreview} onChange={(v) => setSettings(s => ({ ...s, showPrescriptionPreview: v }))} />
          </div>
        </div>
      </div>
    </div>
  );
}
