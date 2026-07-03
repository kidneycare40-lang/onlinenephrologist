const STORAGE_KEY = 'emr_calculator_settings';

export interface BMICategory {
  id: string;
  label: string;
  min: number;
  max: number | null; // null = no upper limit
  color: string;
}

export interface EGFRStage {
  id: string;
  label: string;
  min: number;
  max: number | null;
  color: string;
}

export interface PotassiumRisk {
  id: string;
  label: string;
  min: number;
  max: number | null;
  color: string;
  risk: string;
  action: string;
}

export interface PotassiumFood {
  id: string;
  name: string;
  potassium: number; // mg per serving
  serving: string;
  level: 'low' | 'medium' | 'high';
}

export interface CreatinineCategory {
  id: string;
  label: string;
  min: number;
  max: number | null;
  color: string;
}

export interface UACRCategory {
  id: string;
  label: string;
  min: number;
  max: number | null;
  color: string;
  description: string;
}

export interface CalculatorSettings {
  bmi: {
    categories: BMICategory[];
  };
  egfr: {
    stages: EGFRStage[];
  };
  potassium: {
    symptoms: string[];
    risks: PotassiumRisk[];
    foods: PotassiumFood[];
  };
  creatinine: {
    categories: CreatinineCategory[];
  };
  uacr: {
    categories: UACRCategory[];
  };
}

export const defaultCalculatorSettings: CalculatorSettings = {
  bmi: {
    categories: [
      { id: 'bmi-under', label: 'Underweight', min: 0, max: 18.5, color: 'blue' },
      { id: 'bmi-normal', label: 'Normal Weight', min: 18.5, max: 25, color: 'green' },
      { id: 'bmi-over', label: 'Overweight', min: 25, max: 30, color: 'amber' },
      { id: 'bmi-obese', label: 'Obese', min: 30, max: null, color: 'red' },
    ],
  },
  egfr: {
    stages: [
      { id: 'egfr-1', label: 'Normal / Stage 1', min: 90, max: null, color: 'green' },
      { id: 'egfr-2', label: 'Mildly Decreased / Stage 2', min: 60, max: 89, color: 'amber' },
      { id: 'egfr-3a', label: 'Mild-Moderate / Stage 3a', min: 45, max: 59, color: 'orange' },
      { id: 'egfr-3b', label: 'Moderate-Severe / Stage 3b', min: 30, max: 44, color: 'red-400' },
      { id: 'egfr-4', label: 'Severely Decreased / Stage 4', min: 15, max: 29, color: 'red' },
      { id: 'egfr-5', label: 'Kidney Failure / Stage 5', min: 0, max: 14, color: 'red-700' },
    ],
  },
  potassium: {
    symptoms: [
      'Muscle weakness',
      'Fatigue',
      'Nausea',
      'Palpitations',
      'Numbness/tingling',
      'Chest pain',
      'Difficulty breathing',
    ],
    risks: [
      { id: 'k-hypo', label: 'Hypokalemia (Low)', min: 0, max: 3.5, color: 'blue', risk: 'Moderate', action: 'May cause muscle cramps, weakness. Consult your doctor.' },
      { id: 'k-normal', label: 'Normal', min: 3.5, max: 5.0, color: 'green', risk: 'Low', action: 'Potassium level is within normal range.' },
      { id: 'k-mild', label: 'Mild Hyperkalemia', min: 5.0, max: 5.5, color: 'amber', risk: 'Moderate', action: 'Monitor closely. Review medications. Consult Dr Goel.' },
      { id: 'k-mod', label: 'Moderate Hyperkalemia', min: 5.5, max: 6.0, color: 'orange', risk: 'High', action: 'Seek medical attention. ECG recommended. Contact Dr Goel.' },
      { id: 'k-severe', label: 'Severe Hyperkalemia', min: 6.0, max: null, color: 'red', risk: 'Critical', action: 'EMERGENCY — Seek immediate medical care. Risk of cardiac arrest.' },
    ],
    foods: [
      { id: 'f-banana', name: 'Banana', potassium: 422, serving: '1 medium', level: 'high' },
      { id: 'f-orange', name: 'Orange', potassium: 237, serving: '1 medium', level: 'medium' },
      { id: 'f-potato', name: 'Potato (boiled)', potassium: 610, serving: '1 medium', level: 'high' },
      { id: 'f-spinach', name: 'Spinach (cooked)', potassium: 839, serving: '1 cup', level: 'high' },
      { id: 'f-tomato', name: 'Tomato', potassium: 292, serving: '1 medium', level: 'medium' },
      { id: 'f-apple', name: 'Apple', potassium: 195, serving: '1 medium', level: 'low' },
      { id: 'f-rice', name: 'White Rice', potassium: 55, serving: '1 cup cooked', level: 'low' },
      { id: 'f-bread', name: 'White Bread', potassium: 70, serving: '1 slice', level: 'low' },
      { id: 'f-egg', name: 'Egg', potassium: 63, serving: '1 large', level: 'low' },
      { id: 'f-milk', name: 'Milk', potassium: 150, serving: '1 cup', level: 'low' },
      { id: 'f-yogurt', name: 'Yogurt', potassium: 380, serving: '1 cup', level: 'medium' },
      { id: 'f-salmon', name: 'Salmon', potassium: 326, serving: '3 oz', level: 'medium' },
      { id: 'f-chicken', name: 'Chicken Breast', potassium: 220, serving: '3 oz', level: 'low' },
      { id: 'f-lentils', name: 'Lentils (cooked)', potassium: 731, serving: '1 cup', level: 'high' },
      { id: 'f-avocado', name: 'Avocado', potassium: 708, serving: '1 whole', level: 'high' },
      { id: 'f-watermelon', name: 'Watermelon', potassium: 170, serving: '1 cup', level: 'low' },
      { id: 'f-mango', name: 'Mango', potassium: 277, serving: '1 cup', level: 'medium' },
      { id: 'f-coconut', name: 'Coconut Water', potassium: 600, serving: '1 cup', level: 'high' },
      { id: 'f-peanut', name: 'Peanuts', potassium: 208, serving: '1 oz', level: 'low' },
      { id: 'f-mushroom', name: 'Mushroom', potassium: 356, serving: '1 cup', level: 'medium' },
    ],
  },
  creatinine: {
    categories: [
      { id: 'crcl-normal', label: 'Normal kidney function', min: 90, max: null, color: 'green' },
      { id: 'crcl-mild', label: 'Mildly reduced', min: 60, max: 89, color: 'amber' },
      { id: 'crcl-mod', label: 'Moderately reduced', min: 30, max: 59, color: 'orange' },
      { id: 'crcl-severe', label: 'Severely reduced', min: 15, max: 29, color: 'red-500' },
      { id: 'crcl-failure', label: 'Kidney failure', min: 0, max: 14, color: 'red-700' },
    ],
  },
  uacr: {
    categories: [
      { id: 'uacr-normal', label: 'Normal', min: 0, max: 30, color: 'green', description: 'Low risk of kidney disease. Continue annual screening if at risk.' },
      { id: 'uacr-moderate', label: 'Moderately Increased (Microalbuminuria)', min: 30, max: 300, color: 'amber', description: 'Early sign of kidney damage. Consult Dr Goel for evaluation and treatment.' },
      { id: 'uacr-severe', label: 'Severely Increased (Macroalbuminuria)', min: 300, max: null, color: 'red', description: 'Significant kidney damage. Urgent nephrology consultation recommended.' },
    ],
  },
};

export function loadCalculatorSettings(): CalculatorSettings {
  if (typeof window === 'undefined') return defaultCalculatorSettings;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultCalculatorSettings;
    const parsed = JSON.parse(stored);
    // Merge with defaults to handle new fields
    return {
      bmi: { ...defaultCalculatorSettings.bmi, ...parsed.bmi },
      egfr: { ...defaultCalculatorSettings.egfr, ...parsed.egfr },
      potassium: { ...defaultCalculatorSettings.potassium, ...parsed.potassium },
      creatinine: { ...defaultCalculatorSettings.creatinine, ...parsed.creatinine },
      uacr: { ...defaultCalculatorSettings.uacr, ...parsed.uacr },
    };
  } catch {
    return defaultCalculatorSettings;
  }
}

export function saveCalculatorSettings(settings: CalculatorSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function resetCalculatorSettings() {
  localStorage.removeItem(STORAGE_KEY);
}
