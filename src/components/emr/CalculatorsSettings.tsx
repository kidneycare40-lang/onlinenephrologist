'use client';

import { useState } from 'react';
import { Save, Plus, Trash2, X, RotateCcw } from 'lucide-react';
import {
  loadCalculatorSettings,
  saveCalculatorSettings,
  resetCalculatorSettings,
  type CalculatorSettings,
  type BMICategory,
  type EGFRStage,
  type PotassiumRisk,
  type PotassiumFood,
  type CreatinineCategory,
  type UACRCategory,
} from '@/lib/calculator-settings';

type CalcTab = 'bmi' | 'egfr' | 'potassium' | 'creatinine' | 'uacr';

const calcTabs: { id: CalcTab; label: string }[] = [
  { id: 'bmi', label: 'BMI' },
  { id: 'egfr', label: 'eGFR' },
  { id: 'potassium', label: 'Potassium' },
  { id: 'creatinine', label: 'Creatinine' },
  { id: 'uacr', label: 'uACR' },
];

const colorOptions = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'amber', label: 'Amber', class: 'bg-amber-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'red-400', label: 'Light Red', class: 'bg-red-400' },
  { value: 'red-500', label: 'Medium Red', class: 'bg-red-500' },
  { value: 'red-700', label: 'Dark Red', class: 'bg-red-700' },
];

const riskOptions = ['Low', 'Moderate', 'High', 'Critical'];

export default function CalculatorsSettings() {
  const [settings, setSettings] = useState<CalculatorSettings>(loadCalculatorSettings);
  const [activeTab, setActiveTab] = useState<CalcTab>('bmi');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveCalculatorSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm('Reset all calculator settings to defaults? This cannot be undone.')) {
      resetCalculatorSettings();
      setSettings(loadCalculatorSettings());
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Calculator Settings</h2>
          <p className="text-sm text-gray-500">Customize ranges, categories, symptoms, and risk levels for each calculator.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <RotateCcw className="h-3.5 w-3.5" /> Reset Defaults
          </button>
          <button onClick={handleSave} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${saved ? 'bg-green-600 text-white' : 'bg-[#0A75BB] text-white hover:bg-[#085a94]'}`}>
            <Save className="h-3.5 w-3.5" /> {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {calcTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        {activeTab === 'bmi' && <BMITab settings={settings} setSettings={setSettings} />}
        {activeTab === 'egfr' && <EGFRTab settings={settings} setSettings={setSettings} />}
        {activeTab === 'potassium' && <PotassiumTab settings={settings} setSettings={setSettings} />}
        {activeTab === 'creatinine' && <CreatinineTab settings={settings} setSettings={setSettings} />}
        {activeTab === 'uacr' && <UACRTab settings={settings} setSettings={setSettings} />}
      </div>
    </div>
  );
}

function BMITab({ settings, setSettings }: { settings: CalculatorSettings; setSettings: (s: CalculatorSettings) => void }) {
  const categories = settings.bmi.categories;

  const update = (id: string, field: keyof BMICategory, value: string | number | null) => {
    setSettings({
      ...settings,
      bmi: {
        ...settings.bmi,
        categories: categories.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
      },
    });
  };

  const add = () => {
    const newCat: BMICategory = {
      id: `bmi-${Date.now()}`,
      label: 'New Category',
      min: 0,
      max: null,
      color: 'blue',
    };
    setSettings({
      ...settings,
      bmi: { ...settings.bmi, categories: [...categories, newCat] },
    });
  };

  const remove = (id: string) => {
    setSettings({
      ...settings,
      bmi: { ...settings.bmi, categories: categories.filter((c) => c.id !== id) },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">BMI Categories</h3>
        <p className="text-xs text-gray-500">Define the BMI range categories shown in the calculator results.</p>
      </div>
      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className={`w-3 h-3 rounded-full bg-${cat.color}-500 shrink-0`} />
            <input
              value={cat.label}
              onChange={(e) => update(cat.id, 'label', e.target.value)}
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
              placeholder="Category name"
            />
            <input
              type="number"
              value={cat.min}
              onChange={(e) => update(cat.id, 'min', Number(e.target.value))}
              className="w-20 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
              placeholder="Min"
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="number"
              value={cat.max ?? ''}
              onChange={(e) => update(cat.id, 'max', e.target.value ? Number(e.target.value) : null)}
              className="w-20 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
              placeholder="∞"
            />
            <select
              value={cat.color}
              onChange={(e) => update(cat.id, 'color', e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-2 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
            >
              {colorOptions.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <button onClick={() => remove(cat.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button onClick={add} className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#0A75BB] hover:bg-blue-50 rounded-lg transition-colors font-medium">
        <Plus className="h-4 w-4" /> Add Category
      </button>
    </div>
  );
}

function EGFRTab({ settings, setSettings }: { settings: CalculatorSettings; setSettings: (s: CalculatorSettings) => void }) {
  const stages = settings.egfr.stages;

  const update = (id: string, field: keyof EGFRStage, value: string | number | null) => {
    setSettings({
      ...settings,
      egfr: {
        ...settings.egfr,
        stages: stages.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
      },
    });
  };

  const add = () => {
    const newStage: EGFRStage = {
      id: `egfr-${Date.now()}`,
      label: 'New Stage',
      min: 0,
      max: null,
      color: 'green',
    };
    setSettings({
      ...settings,
      egfr: { ...settings.egfr, stages: [...stages, newStage] },
    });
  };

  const remove = (id: string) => {
    setSettings({
      ...settings,
      egfr: { ...settings.egfr, stages: stages.filter((s) => s.id !== id) },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">eGFR CKD Stages</h3>
        <p className="text-xs text-gray-500">Define CKD stages based on eGFR ranges (mL/min/1.73m²).</p>
      </div>
      <div className="space-y-3">
        {stages.map((stage) => (
          <div key={stage.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className={`w-3 h-3 rounded-full bg-${stage.color}-500 shrink-0`} />
            <input
              value={stage.label}
              onChange={(e) => update(stage.id, 'label', e.target.value)}
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
              placeholder="Stage label"
            />
            <input
              type="number"
              value={stage.min}
              onChange={(e) => update(stage.id, 'min', Number(e.target.value))}
              className="w-20 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
              placeholder="Min"
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="number"
              value={stage.max ?? ''}
              onChange={(e) => update(stage.id, 'max', e.target.value ? Number(e.target.value) : null)}
              className="w-20 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
              placeholder="∞"
            />
            <select
              value={stage.color}
              onChange={(e) => update(stage.id, 'color', e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-2 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
            >
              {colorOptions.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <button onClick={() => remove(stage.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button onClick={add} className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#0A75BB] hover:bg-blue-50 rounded-lg transition-colors font-medium">
        <Plus className="h-4 w-4" /> Add Stage
      </button>
    </div>
  );
}

function PotassiumTab({ settings, setSettings }: { settings: CalculatorSettings; setSettings: (s: CalculatorSettings) => void }) {
  const { symptoms, risks, foods } = settings.potassium;
  const [newSymptom, setNewSymptom] = useState('');

  const addSymptom = () => {
    if (!newSymptom.trim()) return;
    setSettings({
      ...settings,
      potassium: { ...settings.potassium, symptoms: [...symptoms, newSymptom.trim()] },
    });
    setNewSymptom('');
  };

  const removeSymptom = (idx: number) => {
    setSettings({
      ...settings,
      potassium: { ...settings.potassium, symptoms: symptoms.filter((_, i) => i !== idx) },
    });
  };

  const updateRisk = (id: string, field: keyof PotassiumRisk, value: string | number | null) => {
    setSettings({
      ...settings,
      potassium: {
        ...settings.potassium,
        risks: risks.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
      },
    });
  };

  const addRisk = () => {
    const newRisk: PotassiumRisk = {
      id: `k-${Date.now()}`,
      label: 'New Risk Level',
      min: 0,
      max: null,
      color: 'green',
      risk: 'Low',
      action: 'Describe the recommended action.',
    };
    setSettings({
      ...settings,
      potassium: { ...settings.potassium, risks: [...risks, newRisk] },
    });
  };

  const removeRisk = (id: string) => {
    setSettings({
      ...settings,
      potassium: { ...settings.potassium, risks: risks.filter((r) => r.id !== id) },
    });
  };

  const updateFood = (id: string, field: keyof PotassiumFood, value: string | number) => {
    setSettings({
      ...settings,
      potassium: {
        ...settings.potassium,
        foods: foods.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
      },
    });
  };

  const addFood = () => {
    const newFood: PotassiumFood = {
      id: `f-${Date.now()}`,
      name: 'New Food Item',
      potassium: 0,
      serving: '1 serving',
      level: 'low',
    };
    setSettings({
      ...settings,
      potassium: { ...settings.potassium, foods: [...foods, newFood] },
    });
  };

  const removeFood = (id: string) => {
    setSettings({
      ...settings,
      potassium: { ...settings.potassium, foods: foods.filter((f) => f.id !== id) },
    });
  };

  const levelColors: Record<string, string> = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-8">
      {/* Symptoms */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Potassium Symptoms</h3>
        <p className="text-xs text-gray-500 mb-3">Symptoms patients can check in the potassium calculator.</p>
        <div className="space-y-2">
          {symptoms.map((s, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                value={s}
                onChange={(e) => {
                  const updated = [...symptoms];
                  updated[idx] = e.target.value;
                  setSettings({ ...settings, potassium: { ...settings.potassium, symptoms: updated } });
                }}
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
              />
              <button onClick={() => removeSymptom(idx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <input
            value={newSymptom}
            onChange={(e) => setNewSymptom(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSymptom()}
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
            placeholder="New symptom"
          />
          <button onClick={addSymptom} className="flex items-center gap-1 px-3 py-2 text-sm text-[#0A75BB] hover:bg-blue-50 rounded-lg transition-colors font-medium">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </div>

      {/* Risk Levels */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Risk Levels</h3>
        <p className="text-xs text-gray-500 mb-3">Define potassium ranges and their associated risk levels and recommended actions.</p>
        <div className="space-y-3">
          {risks.map((risk) => (
            <div key={risk.id} className="p-4 bg-gray-50 rounded-xl space-y-3">
              <div className="flex items-center gap-3">
                <input
                  value={risk.label}
                  onChange={(e) => updateRisk(risk.id, 'label', e.target.value)}
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
                  placeholder="Risk label"
                />
                <select
                  value={risk.color}
                  onChange={(e) => updateRisk(risk.id, 'color', e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-2 py-2 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
                >
                  {colorOptions.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <button onClick={() => removeRisk(risk.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">Range:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={risk.min}
                    onChange={(e) => updateRisk(risk.id, 'min', Number(e.target.value))}
                    className="w-20 text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
                  />
                  <span className="text-xs text-gray-400">to</span>
                  <input
                    type="number"
                    step="0.1"
                    value={risk.max ?? ''}
                    onChange={(e) => updateRisk(risk.id, 'max', e.target.value ? Number(e.target.value) : null)}
                    className="w-20 text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
                    placeholder="∞"
                  />
                  <span className="text-xs text-gray-400">mEq/L</span>
                </div>
                <select
                  value={risk.risk}
                  onChange={(e) => updateRisk(risk.id, 'risk', e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
                >
                  {riskOptions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <textarea
                value={risk.action}
                onChange={(e) => updateRisk(risk.id, 'action', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] resize-none"
                rows={2}
                placeholder="Recommended action"
              />
            </div>
          ))}
        </div>
        <button onClick={addRisk} className="flex items-center gap-1.5 px-3 py-2 mt-3 text-sm text-[#0A75BB] hover:bg-blue-50 rounded-lg transition-colors font-medium">
          <Plus className="h-4 w-4" /> Add Risk Level
        </button>
      </div>

      {/* Food Items */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Food Items (Potassium Content)</h3>
        <p className="text-xs text-gray-500 mb-3">Foods with their potassium content per serving. Low (&lt;200mg), Medium (200–400mg), High (&gt;400mg).</p>

        {/* Quick legend */}
        <div className="flex gap-3 mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs"><span className="w-2 h-2 rounded-full bg-green-500" /> Low (&lt;200mg)</span>
          <span className="inline-flex items-center gap-1.5 text-xs"><span className="w-2 h-2 rounded-full bg-amber-500" /> Medium (200–400mg)</span>
          <span className="inline-flex items-center gap-1.5 text-xs"><span className="w-2 h-2 rounded-full bg-red-500" /> High (&gt;400mg)</span>
        </div>

        <div className="space-y-2">
          {foods.map((food) => (
            <div key={food.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <input
                value={food.name}
                onChange={(e) => updateFood(food.id, 'name', e.target.value)}
                className="flex-1 min-w-0 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
                placeholder="Food name"
              />
              <input
                type="number"
                value={food.potassium}
                onChange={(e) => updateFood(food.id, 'potassium', Number(e.target.value))}
                className="w-24 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
                placeholder="mg"
              />
              <span className="text-xs text-gray-400 shrink-0">mg</span>
              <input
                value={food.serving}
                onChange={(e) => updateFood(food.id, 'serving', e.target.value)}
                className="w-32 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
                placeholder="Serving"
              />
              <select
                value={food.level}
                onChange={(e) => updateFood(food.id, 'level', e.target.value)}
                className={`text-xs font-medium border-0 rounded-lg px-2 py-2 ${levelColors[food.level]}`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button onClick={() => removeFood(food.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button onClick={addFood} className="flex items-center gap-1.5 px-3 py-2 mt-3 text-sm text-[#0A75BB] hover:bg-blue-50 rounded-lg transition-colors font-medium">
          <Plus className="h-4 w-4" /> Add Food Item
        </button>
      </div>
    </div>
  );
}

function CreatinineTab({ settings, setSettings }: { settings: CalculatorSettings; setSettings: (s: CalculatorSettings) => void }) {
  const categories = settings.creatinine.categories;

  const update = (id: string, field: keyof CreatinineCategory, value: string | number | null) => {
    setSettings({
      ...settings,
      creatinine: {
        ...settings.creatinine,
        categories: categories.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
      },
    });
  };

  const add = () => {
    const newCat: CreatinineCategory = {
      id: `crcl-${Date.now()}`,
      label: 'New Category',
      min: 0,
      max: null,
      color: 'green',
    };
    setSettings({
      ...settings,
      creatinine: { ...settings.creatinine, categories: [...categories, newCat] },
    });
  };

  const remove = (id: string) => {
    setSettings({
      ...settings,
      creatinine: { ...settings.creatinine, categories: categories.filter((c) => c.id !== id) },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Creatinine Clearance Categories</h3>
        <p className="text-xs text-gray-500">Define CrCl ranges (mL/min) based on the Cockcroft-Gault formula.</p>
      </div>
      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className={`w-3 h-3 rounded-full bg-${cat.color}-500 shrink-0`} />
            <input
              value={cat.label}
              onChange={(e) => update(cat.id, 'label', e.target.value)}
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
              placeholder="Category name"
            />
            <input
              type="number"
              value={cat.min}
              onChange={(e) => update(cat.id, 'min', Number(e.target.value))}
              className="w-20 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
              placeholder="Min"
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="number"
              value={cat.max ?? ''}
              onChange={(e) => update(cat.id, 'max', e.target.value ? Number(e.target.value) : null)}
              className="w-20 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
              placeholder="∞"
            />
            <select
              value={cat.color}
              onChange={(e) => update(cat.id, 'color', e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-2 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
            >
              {colorOptions.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <button onClick={() => remove(cat.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button onClick={add} className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#0A75BB] hover:bg-blue-50 rounded-lg transition-colors font-medium">
        <Plus className="h-4 w-4" /> Add Category
      </button>
    </div>
  );
}

function UACRTab({ settings, setSettings }: { settings: CalculatorSettings; setSettings: (s: CalculatorSettings) => void }) {
  const categories = settings.uacr.categories;

  const update = (id: string, field: keyof UACRCategory, value: string | number | null) => {
    setSettings({
      ...settings,
      uacr: {
        ...settings.uacr,
        categories: categories.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
      },
    });
  };

  const add = () => {
    const newCat: UACRCategory = {
      id: `uacr-${Date.now()}`,
      label: 'New Category',
      min: 0,
      max: null,
      color: 'green',
      description: 'Describe what this result means.',
    };
    setSettings({
      ...settings,
      uacr: { ...settings.uacr, categories: [...categories, newCat] },
    });
  };

  const remove = (id: string) => {
    setSettings({
      ...settings,
      uacr: { ...settings.uacr, categories: categories.filter((c) => c.id !== id) },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">uACR Categories</h3>
        <p className="text-xs text-gray-500">Define urine albumin-to-creatinine ratio ranges (mg/g) and their descriptions.</p>
      </div>
      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.id} className="p-4 bg-gray-50 rounded-xl space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full bg-${cat.color}-500 shrink-0`} />
              <input
                value={cat.label}
                onChange={(e) => update(cat.id, 'label', e.target.value)}
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
                placeholder="Category name"
              />
              <select
                value={cat.color}
                onChange={(e) => update(cat.id, 'color', e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-2 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
              >
                {colorOptions.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <button onClick={() => remove(cat.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-gray-500">Range (mg/g):</label>
              <input
                type="number"
                value={cat.min}
                onChange={(e) => update(cat.id, 'min', Number(e.target.value))}
                className="w-20 text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
              />
              <span className="text-xs text-gray-400">to</span>
              <input
                type="number"
                value={cat.max ?? ''}
                onChange={(e) => update(cat.id, 'max', e.target.value ? Number(e.target.value) : null)}
                className="w-20 text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
                placeholder="∞"
              />
            </div>
            <textarea
              value={cat.description}
              onChange={(e) => update(cat.id, 'description', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB] resize-none"
              rows={2}
              placeholder="Description shown to patient"
            />
          </div>
        ))}
      </div>
      <button onClick={add} className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#0A75BB] hover:bg-blue-50 rounded-lg transition-colors font-medium">
        <Plus className="h-4 w-4" /> Add Category
      </button>
    </div>
  );
}
