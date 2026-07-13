'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BreadcrumbSchema, WebPageSchema, FAQSchema } from '@/components/seo/JsonLd';
import { SITE_CONFIG } from '@/lib/constants';
import { Calculator, ChevronRight, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { loadCalculatorSettings, type CalculatorSettings } from '@/lib/calculator-settings';

type Tab = 'bmi' | 'egfr' | 'potassium' | 'creatinine' | 'bsa' | 'uacr';

const calculators = [
  { id: 'bmi' as Tab, name: 'BMI Calculator', icon: '⚖️', desc: 'Body Mass Index' },
  { id: 'egfr' as Tab, name: 'eGFR Calculator', icon: '🫘', desc: 'Kidney Function' },
  { id: 'potassium' as Tab, name: 'Potassium Calculator', icon: '🧪', desc: 'K+ Risk Assessment' },
  { id: 'creatinine' as Tab, name: 'Creatinine Calculator', icon: '💉', desc: 'Serum Creatinine' },
  { id: 'bsa' as Tab, name: 'BSA Calculator', icon: '📐', desc: 'Body Surface Area' },
  { id: 'uacr' as Tab, name: 'uACR Calculator', icon: '🔬', desc: 'Urine Albumin Ratio' },
];

export default function CalculatorsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('bmi');
  const [settings, setSettings] = useState<CalculatorSettings | null>(null);

  useEffect(() => {
    setSettings(loadCalculatorSettings());
  }, []);

  return (
    <>
      <Navbar />

      <section className="bg-gradient-to-br from-[#0A75BB] to-[#063d5c] text-white py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4 text-sm">
            <Calculator className="h-4 w-4" /> Health Calculators
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Kidney Health Calculators</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">Free medical calculators for kidney function, BMI, potassium levels, and more. For educational purposes only — consult Dr Rajesh Goel for clinical decisions.</p>
        </div>
      </section>

      <section className="py-10 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {calculators.map((calc) => (
              <button
                key={calc.id}
                onClick={() => setActiveTab(calc.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === calc.id
                    ? 'bg-[#0A75BB] text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span>{calc.icon}</span>
                <span className="hidden sm:inline">{calc.name}</span>
              </button>
            ))}
          </div>

          {/* Calculator Content */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {activeTab === 'bmi' && <BMICalculator settings={settings?.bmi} />}
            {activeTab === 'egfr' && <EGFRCalculator settings={settings?.egfr} />}
            {activeTab === 'potassium' && <PotassiumCalculator settings={settings?.potassium} />}
            {activeTab === 'creatinine' && <CreatinineCalculator settings={settings?.creatinine} />}
            {activeTab === 'bsa' && <BSACalculator />}
            {activeTab === 'uacr' && <UACRCalculator settings={settings?.uacr} />}
          </div>

          {/* Disclaimer */}
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Medical Disclaimer</p>
              <p>These calculators are for educational and informational purposes only. They do not replace professional medical advice, diagnosis, or treatment. Always consult Dr Rajesh Goel or your healthcare provider for clinical decisions.</p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <Link href="/book-appointment" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] transition-all">
              Consult Dr Rajesh Goel <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <BreadcrumbSchema
        items={[
          { name: 'Home', url: SITE_CONFIG.url },
          { name: 'Kidney Health Calculators', url: `${SITE_CONFIG.url}/calculators` },
        ]}
      />
      <WebPageSchema
        title="Kidney Health Calculators | Dr Rajesh Goel"
        description="Free online kidney health calculators — BMI, eGFR (CKD-EPI 2021), potassium risk, creatinine clearance, BSA, and uACR."
        url={`${SITE_CONFIG.url}/calculators`}
      />
      <Footer />
    </>
  );
}

function BMICalculator({ settings }: { settings?: CalculatorSettings['bmi'] }) {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');

  const categories = settings?.categories ?? [
    { id: 'bmi-under', label: 'Underweight', min: 0, max: 18.5, color: 'blue' },
    { id: 'bmi-normal', label: 'Normal Weight', min: 18.5, max: 25, color: 'green' },
    { id: 'bmi-over', label: 'Overweight', min: 25, max: 30, color: 'amber' },
    { id: 'bmi-obese', label: 'Obese', min: 30, max: null, color: 'red' },
  ];

  const calculate = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) return null;

    let bmi: number;
    if (unit === 'metric') {
      bmi = w / ((h / 100) ** 2);
    } else {
      bmi = (w / (h ** 2)) * 703;
    }

    const matched = categories.find((c) => bmi >= c.min && (c.max === null || bmi < c.max));
    const category = matched?.label ?? 'Unknown';
    const color = `text-${matched?.color ?? 'gray'}-600`;

    return { bmi: bmi.toFixed(1), category, color };
  };

  const result = calculate();

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">BMI Calculator</h2>
      <p className="text-gray-500 text-sm mb-6">Calculate your Body Mass Index. Obesity is a risk factor for kidney disease.</p>

      {/* Unit Toggle */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setUnit('metric')} className={`px-4 py-2 rounded-lg text-sm font-medium ${unit === 'metric' ? 'bg-[#0A75BB] text-white' : 'bg-gray-100 text-gray-600'}`}>Metric (kg/cm)</button>
        <button onClick={() => setUnit('imperial')} className={`px-4 py-2 rounded-lg text-sm font-medium ${unit === 'imperial' ? 'bg-[#0A75BB] text-white' : 'bg-gray-100 text-gray-600'}`}>Imperial (lbs/in)</button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{unit === 'metric' ? 'Height (cm)' : 'Height (inches)'}</label>
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder={unit === 'metric' ? '170' : '67'} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{unit === 'metric' ? 'Weight (kg)' : 'Weight (lbs)'}</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={unit === 'metric' ? '70' : '154'} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent outline-none" />
        </div>
      </div>

      {result && (
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Your BMI</p>
            <p className={`text-5xl font-bold ${result.color}`}>{result.bmi}</p>
            <p className={`text-lg font-semibold mt-2 ${result.color}`}>{result.category}</p>
          </div>
          <div className="mt-4 grid gap-2 text-xs text-center" style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 4)}, 1fr)` }}>
            {categories.map((cat) => (
              <div key={cat.id} className={`bg-${cat.color}-50 rounded-lg p-2`}>
                <div className={`font-bold text-${cat.color}-600`}>{cat.max !== null ? `${cat.min}–${cat.max}` : `≥${cat.min}`}</div>
                {cat.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EGFRCalculator({ settings }: { settings?: CalculatorSettings['egfr'] }) {
  const [creatinine, setCreatinine] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [race, setRace] = useState<'other' | 'black'>('other');

  const stages = settings?.stages ?? [
    { id: 'egfr-1', label: 'Normal / Stage 1', min: 90, max: null, color: 'green' },
    { id: 'egfr-2', label: 'Mildly Decreased / Stage 2', min: 60, max: 89, color: 'amber' },
    { id: 'egfr-3a', label: 'Mild-Moderate / Stage 3a', min: 45, max: 59, color: 'orange' },
    { id: 'egfr-3b', label: 'Moderate-Severe / Stage 3b', min: 30, max: 44, color: 'red-400' },
    { id: 'egfr-4', label: 'Severely Decreased / Stage 4', min: 15, max: 29, color: 'red' },
    { id: 'egfr-5', label: 'Kidney Failure / Stage 5', min: 0, max: 14, color: 'red-700' },
  ];

  const calculate = () => {
    const scr = parseFloat(creatinine);
    const a = parseInt(age);
    if (!scr || !a || scr <= 0 || a <= 0) return null;

    let egfr: number;
    const kappa = gender === 'female' ? 0.7 : 0.9;
    const alpha = gender === 'female' ? -0.241 : -0.302;
    const genderFactor = gender === 'female' ? 1.012 : 1.0;

    const scrOverKappa = scr / kappa;
    const minScr = Math.min(scrOverKappa, 1);
    const maxScr = Math.max(scrOverKappa, 1);

    egfr = 142 * Math.pow(minScr, alpha) * Math.pow(maxScr, -1.200) * Math.pow(0.9938, a) * genderFactor;

    const matched = stages.find((s) => egfr >= s.min && (s.max === null || egfr <= s.max));
    const stage = matched?.label ?? 'Unknown';
    const color = `text-${matched?.color ?? 'gray'}-600`;

    return { egfr: Math.round(egfr), stage, color };
  };

  const result = calculate();

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">eGFR Calculator</h2>
      <p className="text-gray-500 text-sm mb-6">Estimated Glomerular Filtration Rate — the best indicator of kidney function.</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Serum Creatinine (mg/dL)</label>
          <input type="number" step="0.1" value={creatinine} onChange={(e) => setCreatinine(e.target.value)} placeholder="1.0" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age (years)</label>
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="45" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent outline-none" />
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <div className="flex gap-2">
            <button onClick={() => setGender('male')} className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${gender === 'male' ? 'bg-[#0A75BB] text-white' : 'bg-gray-100 text-gray-600'}`}>Male</button>
            <button onClick={() => setGender('female')} className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${gender === 'female' ? 'bg-[#0A75BB] text-white' : 'bg-gray-100 text-gray-600'}`}>Female</button>
          </div>
        </div>
      </div>

      {result && (
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">Your eGFR</p>
            <p className={`text-5xl font-bold ${result.color}`}>{result.egfr}</p>
            <p className="text-sm text-gray-400 mt-1">mL/min/1.73m²</p>
            <p className={`text-lg font-semibold mt-2 ${result.color}`}>{result.stage}</p>
          </div>
          <div className="mt-4 space-y-2">
            {stages.map((s) => (
              <div key={s.id} className="flex items-center gap-3 text-sm">
                <div className={`w-3 h-3 rounded-full bg-${s.color}-500 shrink-0`} />
                <span className="font-mono text-gray-600 w-16">{s.max !== null ? `${s.min}–${s.max}` : `≥${s.min}`}</span>
                <span className={`text-${s.color}-700`}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PotassiumCalculator({ settings }: { settings?: CalculatorSettings['potassium'] }) {
  const [potassium, setPotassium] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<Record<string, number>>({});
  const [showFoodSection, setShowFoodSection] = useState(false);

  const symptomList = settings?.symptoms ?? ['Muscle weakness', 'Fatigue', 'Nausea', 'Palpitations', 'Numbness/tingling', 'None'];
  const risks = settings?.risks ?? [
    { id: 'k-hypo', label: 'Hypokalemia (Low)', min: 0, max: 3.5, color: 'blue', risk: 'Moderate', action: 'May cause muscle cramps, weakness. Consult your doctor.' },
    { id: 'k-normal', label: 'Normal', min: 3.5, max: 5.0, color: 'green', risk: 'Low', action: 'Potassium level is within normal range.' },
    { id: 'k-mild', label: 'Mild Hyperkalemia', min: 5.0, max: 5.5, color: 'amber', risk: 'Moderate', action: 'Monitor closely. Review medications. Consult Dr Goel.' },
    { id: 'k-mod', label: 'Moderate Hyperkalemia', min: 5.5, max: 6.0, color: 'orange', risk: 'High', action: 'Seek medical attention. ECG recommended. Contact Dr Goel.' },
    { id: 'k-severe', label: 'Severe Hyperkalemia', min: 6.0, max: null, color: 'red', risk: 'Critical', action: 'EMERGENCY — Seek immediate medical care. Risk of cardiac arrest.' },
  ];
  const foods = settings?.foods ?? [];

  const toggleSymptom = (s: string) => {
    if (s === 'None') { setSymptoms([]); return; }
    setSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev.filter((x) => x !== 'None'), s]);
  };

  const toggleFood = (foodId: string) => {
    setSelectedFoods((prev) => {
      if (prev[foodId] !== undefined) {
        const next = { ...prev };
        delete next[foodId];
        return next;
      }
      return { ...prev, [foodId]: 1 };
    });
  };

  const updateFoodQty = (foodId: string, qty: number) => {
    if (qty <= 0) {
      setSelectedFoods((prev) => { const next = { ...prev }; delete next[foodId]; return next; });
    } else {
      setSelectedFoods((prev) => ({ ...prev, [foodId]: qty }));
    }
  };

  const totalFoodPotassium = Object.entries(selectedFoods).reduce((sum, [id, qty]) => {
    const food = foods.find((f) => f.id === id);
    return sum + (food ? food.potassium * qty : 0);
  }, 0);

  const levelColors: Record<string, string> = {
    low: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    high: 'bg-red-100 text-red-700 border-red-200',
  };

  const calculate = () => {
    const k = parseFloat(potassium);
    if (!k || k <= 0) return null;

    const matched = risks.find((r) => k >= r.min && (r.max === null || k <= r.max));
    const level = matched?.label ?? 'Unknown';
    const color = `text-${matched?.color ?? 'gray'}-600`;
    const risk = matched?.risk ?? 'Unknown';
    const action = matched?.action ?? '';

    const hasSymptoms = symptoms.length > 0 && !symptoms.includes('None');

    return { level, color, risk, action, hasSymptoms };
  };

  const result = calculate();

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Potassium Level Calculator</h2>
      <p className="text-gray-500 text-sm mb-6">Check your serum potassium level and assess hyperkalemia risk — critical for kidney patients.</p>

      {/* Serum Potassium Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Serum Potassium (mEq/L)</label>
        <input type="number" step="0.1" value={potassium} onChange={(e) => setPotassium(e.target.value)} placeholder="4.0" className="w-full max-w-xs px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent outline-none" />
        <p className="text-xs text-gray-400 mt-1">Normal range: 3.5 – 5.0 mEq/L</p>
      </div>

      {/* Symptoms */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Any symptoms?</label>
        <div className="flex flex-wrap gap-2">
          {symptomList.map((s) => (
            <button key={s} onClick={() => toggleSymptom(s)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${symptoms.includes(s) ? 'bg-[#0A75BB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Serum Potassium Result */}
      {result && (
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <div className="text-center mb-4">
            <p className={`text-2xl font-bold ${result.color}`}>{result.level}</p>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 ${
              result.risk === 'Low' ? 'bg-green-100 text-green-700' :
              result.risk === 'Moderate' ? 'bg-amber-100 text-amber-700' :
              result.risk === 'High' ? 'bg-orange-100 text-orange-700' :
              'bg-red-100 text-red-700'
            }`}>Risk: {result.risk}</div>
          </div>
          <div className={`p-4 rounded-lg text-sm ${result.risk === 'Critical' ? 'bg-red-50 text-red-800' : 'bg-blue-50 text-blue-800'}`}>
            <p className="font-semibold mb-1">Recommended Action:</p>
            <p>{result.action}</p>
          </div>
          {result.hasSymptoms && (
            <div className="mt-3 p-3 bg-amber-50 rounded-lg text-sm text-amber-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Symptoms present — consult Dr Rajesh Goel promptly.
            </div>
          )}
        </div>
      )}

      {/* Food Items Section */}
      {foods.length > 0 && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowFoodSection(!showFoodSection)}
            className="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🍎</span>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">Food Potassium Checker</p>
                <p className="text-xs text-gray-500">Select foods you ate today to calculate total potassium intake</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {Object.keys(selectedFoods).length > 0 && (
                <span className="bg-[#0A75BB] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {Object.keys(selectedFoods).length} selected
                </span>
              )}
              <svg className={`h-5 w-5 text-gray-400 transition-transform ${showFoodSection ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </button>

          {showFoodSection && (
            <div className="p-5">
              {/* Quick stats */}
              {Object.keys(selectedFoods).length > 0 && (
                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Total Potassium from Food</p>
                      <p className={`text-3xl font-bold ${totalFoodPotassium > 400 ? 'text-red-600' : totalFoodPotassium > 200 ? 'text-amber-600' : 'text-green-600'}`}>
                        {totalFoodPotassium} <span className="text-sm font-normal">mg</span>
                      </p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                      totalFoodPotassium > 400 ? 'bg-red-100 text-red-700' :
                      totalFoodPotassium > 200 ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {totalFoodPotassium > 400 ? '⚠️ High Intake' : totalFoodPotassium > 200 ? '⚡ Moderate Intake' : '✅ Low Intake'}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {totalFoodPotassium > 400
                      ? 'High potassium intake. Kidney patients should limit to under 2000mg/day. Consult Dr Goel.'
                      : totalFoodPotassium > 200
                      ? 'Moderate intake. Consider choosing lower-potassium alternatives for remaining meals.'
                      : 'Good choice! Low potassium food options selected.'}
                  </p>
                </div>
              )}

              {/* Food grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {foods.map((food) => {
                  const isSelected = selectedFoods[food.id] !== undefined;
                  const qty = selectedFoods[food.id] ?? 0;
                  return (
                    <div
                      key={food.id}
                      onClick={() => toggleFood(food.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#0A75BB] bg-blue-50 shadow-sm'
                          : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'bg-[#0A75BB] border-[#0A75BB]' : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">{food.name}</p>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${levelColors[food.level]}`}>
                            {food.level}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{food.potassium}mg per {food.serving}</p>
                      </div>
                      {isSelected && (
                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => updateFoodQty(food.id, qty - 1)}
                            className="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-bold text-gray-600"
                          >-</button>
                          <span className="w-8 text-center text-sm font-semibold text-gray-900">{qty}</span>
                          <button
                            onClick={() => updateFoodQty(food.id, qty + 1)}
                            className="w-7 h-7 rounded-lg bg-[#0A75BB] hover:bg-[#085a94] flex items-center justify-center text-sm font-bold text-white"
                          >+</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Food potassium result */}
              {Object.keys(selectedFoods).length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Selected Foods Summary</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedFoods).map(([id, qty]) => {
                      const food = foods.find((f) => f.id === id);
                      if (!food) return null;
                      return (
                        <div key={id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{food.name} × {qty}</span>
                          <span className="font-medium text-gray-900">{food.potassium * qty} mg</span>
                        </div>
                      );
                    })}
                    <div className="border-t border-gray-200 pt-2 mt-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">Total from food</span>
                      <span className={`text-lg font-bold ${totalFoodPotassium > 400 ? 'text-red-600' : totalFoodPotassium > 200 ? 'text-amber-600' : 'text-green-600'}`}>
                        {totalFoodPotassium} mg
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CreatinineCalculator({ settings }: { settings?: CalculatorSettings['creatinine'] }) {
  const [creatinine, setCreatinine] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState('');

  const categories = settings?.categories ?? [
    { id: 'crcl-normal', label: 'Normal kidney function', min: 90, max: null, color: 'green' },
    { id: 'crcl-mild', label: 'Mildly reduced', min: 60, max: 89, color: 'amber' },
    { id: 'crcl-mod', label: 'Moderately reduced', min: 30, max: 59, color: 'orange' },
    { id: 'crcl-severe', label: 'Severely reduced', min: 15, max: 29, color: 'red-500' },
    { id: 'crcl-failure', label: 'Kidney failure', min: 0, max: 14, color: 'red-700' },
  ];

  const calculate = () => {
    const scr = parseFloat(creatinine);
    const a = parseInt(age);
    const w = parseFloat(weight);
    if (!scr || !a || !w || scr <= 0 || a <= 0 || w <= 0) return null;

    let crcl = ((140 - a) * w) / (72 * scr);
    if (gender === 'female') crcl *= 0.85;

    const matched = categories.find((c) => crcl >= c.min && (c.max === null || crcl <= c.max));
    const category = matched?.label ?? 'Unknown';
    const color = `text-${matched?.color ?? 'gray'}-600`;

    return { crcl: Math.round(crcl), category, color };
  };

  const result = calculate();

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Creatinine Clearance Calculator</h2>
      <p className="text-gray-500 text-sm mb-6">Cockcroft-Gault formula — estimates kidney function and helps with drug dosing.</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Serum Creatinine (mg/dL)</label>
          <input type="number" step="0.1" value={creatinine} onChange={(e) => setCreatinine(e.target.value)} placeholder="1.0" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age (years)</label>
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="45" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <div className="flex gap-2">
            <button onClick={() => setGender('male')} className={`flex-1 py-3 rounded-xl text-sm font-medium ${gender === 'male' ? 'bg-[#0A75BB] text-white' : 'bg-gray-100 text-gray-600'}`}>Male</button>
            <button onClick={() => setGender('female')} className={`flex-1 py-3 rounded-xl text-sm font-medium ${gender === 'female' ? 'bg-[#0A75BB] text-white' : 'bg-gray-100 text-gray-600'}`}>Female</button>
          </div>
        </div>
      </div>

      {result && (
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <p className="text-sm text-gray-500 mb-1">Creatinine Clearance (CrCl)</p>
          <p className={`text-5xl font-bold ${result.color}`}>{result.crcl}</p>
          <p className="text-sm text-gray-400 mt-1">mL/min</p>
          <p className={`text-lg font-semibold mt-2 ${result.color}`}>{result.category}</p>
        </div>
      )}
    </div>
  );
}

function BSACalculator() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');

  const calculate = () => {
    let h = parseFloat(height);
    let w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) return null;

    if (unit === 'imperial') {
      h = h * 2.54;
      w = w * 0.453592;
    }

    // Mosteller formula
    const bsa = Math.sqrt((h * w) / 3600);
    return { bsa: bsa.toFixed(2) };
  };

  const result = calculate();

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Body Surface Area (BSA) Calculator</h2>
      <p className="text-gray-500 text-sm mb-6">BSA is used for drug dosing in kidney disease and dialysis patients.</p>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setUnit('metric')} className={`px-4 py-2 rounded-lg text-sm font-medium ${unit === 'metric' ? 'bg-[#0A75BB] text-white' : 'bg-gray-100 text-gray-600'}`}>Metric</button>
        <button onClick={() => setUnit('imperial')} className={`px-4 py-2 rounded-lg text-sm font-medium ${unit === 'imperial' ? 'bg-[#0A75BB] text-white' : 'bg-gray-100 text-gray-600'}`}>Imperial</button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{unit === 'metric' ? 'Height (cm)' : 'Height (inches)'}</label>
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder={unit === 'metric' ? '170' : '67'} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{unit === 'metric' ? 'Weight (kg)' : 'Weight (lbs)'}</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={unit === 'metric' ? '70' : '154'} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent outline-none" />
        </div>
      </div>

      {result && (
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <p className="text-sm text-gray-500 mb-1">Your BSA</p>
          <p className="text-5xl font-bold text-[#0A75BB]">{result.bsa}</p>
          <p className="text-sm text-gray-400 mt-1">m²</p>
          <p className="text-sm text-gray-500 mt-3">Normal adult BSA: 1.5 – 2.0 m²</p>
        </div>
      )}
    </div>
  );
}

function UACRCalculator({ settings }: { settings?: CalculatorSettings['uacr'] }) {
  const [albumin, setAlbumin] = useState('');
  const [creatinine, setCreatinine] = useState('');

  const categories = settings?.categories ?? [
    { id: 'uacr-normal', label: 'Normal', min: 0, max: 30, color: 'green', description: 'Low risk of kidney disease. Continue annual screening if at risk.' },
    { id: 'uacr-moderate', label: 'Moderately Increased (Microalbuminuria)', min: 30, max: 300, color: 'amber', description: 'Early sign of kidney damage. Consult Dr Goel for evaluation and treatment.' },
    { id: 'uacr-severe', label: 'Severely Increased (Macroalbuminuria)', min: 300, max: null, color: 'red', description: 'Significant kidney damage. Urgent nephrology consultation recommended.' },
  ];

  const calculate = () => {
    const a = parseFloat(albumin);
    const c = parseFloat(creatinine);
    if (!a || !c || a < 0 || c <= 0) return null;

    const uacr = (a / c) * 100;

    const matched = categories.find((cat) => uacr >= cat.min && (cat.max === null || uacr < cat.max));
    const category = matched?.label ?? 'Unknown';
    const color = `text-${matched?.color ?? 'gray'}-600`;
    const desc = matched?.description ?? '';

    return { uacr: Math.round(uacr), category, color, desc };
  };

  const result = calculate();

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">uACR Calculator</h2>
      <p className="text-gray-500 text-sm mb-6">Urine Albumin-to-Creatinine Ratio — detects early kidney damage (albumin leak).</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Urine Albumin (mg/dL)</label>
          <input type="number" step="0.1" value={albumin} onChange={(e) => setAlbumin(e.target.value)} placeholder="20" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Urine Creatinine (mg/dL)</label>
          <input type="number" step="0.1" value={creatinine} onChange={(e) => setCreatinine(e.target.value)} placeholder="100" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent outline-none" />
        </div>
      </div>

      {result && (
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500 mb-1">Your uACR</p>
            <p className={`text-5xl font-bold ${result.color}`}>{result.uacr}</p>
            <p className="text-sm text-gray-400 mt-1">mg/g</p>
            <p className={`text-lg font-semibold mt-2 ${result.color}`}>{result.category}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
            <p className="font-semibold mb-1">What this means:</p>
            <p>{result.desc}</p>
          </div>
          <div className="mt-4 grid gap-2 text-xs text-center" style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 3)}, 1fr)` }}>
            {categories.map((cat) => (
              <div key={cat.id} className={`bg-${cat.color}-50 rounded-lg p-2`}>
                <div className={`font-bold text-${cat.color}-600`}>{cat.max !== null ? `${cat.min}–${cat.max}` : `>${cat.min}`}</div>
                {cat.label.length > 20 ? cat.label.substring(0, 20) + '...' : cat.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
