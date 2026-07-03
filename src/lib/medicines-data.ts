export interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  duration?: string;
  notes?: string;
  warning?: string;
  category: string;
  subcategory?: string;
}

export interface MedicineCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
  subcategories?: string[];
}

export const medicineCategories: MedicineCategory[] = [
  { id: 'fever-pain', label: 'Fever & Pain', icon: '🌡️', description: 'For fever, pain, acidity, and vomiting' },
  { id: 'skin-sleep', label: 'Skin & Sleep', icon: '😴', description: 'For itching, sleep disturbance' },
  { id: 'constipation', label: 'Constipation', icon: '💊', description: 'Laxatives and bowel management' },
  { id: 'multivitamin', label: 'Multivitamin & Nutrition', icon: '💉', description: 'Nutritional support and vitamins' },
  { id: 'dialysis', label: 'Dialysis Support', icon: '🏥', description: 'Post-dialysis injections and supplements' },
  { id: 'vitamin-mineral', label: 'Vitamin & Minerals', icon: '🦴', description: 'Calcium, vitamin D, phosphate binders' },
  { id: 'bp-kidney', label: 'BP & Kidney Protection', icon: '❤️', description: 'Blood pressure and kidney medicines' },
  { id: 'anemia', label: 'Anemia Management', icon: '🩸', description: 'Iron and erythropoietin therapy' },
  { id: 'specific', label: 'Specific Conditions', icon: '🎯', description: 'Uric acid, acidosis, appetite' },
  { id: 'infection', label: 'Infections', icon: '🦠', description: 'GI, urinary, respiratory infections' },
  { id: 'nephrotic', label: 'Nephrotic Syndrome', icon: '🔬', description: 'Steroid therapy and monitoring' },
  { id: 'advanced', label: 'Advanced Kidney Disease', icon: '⚠️', description: 'Azotemia, dialysis initiation' },
  { id: 'catheter', label: 'Catheter Infection', icon: '🩹', description: 'Dialysis catheter management' },
  { id: 'urti', label: 'URTI (Cold & Cough)', icon: '🤧', description: 'Upper respiratory tract infections' },
  { id: 'severe', label: 'Severe Infections', icon: '🚨', description: 'IV antibiotics for serious infections' },
];

export const medicines: Medicine[] = [
  // Fever & Pain
  { id: 'crocin-500', name: 'Crocin 500 mg', category: 'fever-pain', dosage: '500 mg', frequency: 'SOS', notes: 'For fever', subcategory: 'Fever' },
  { id: 'crocin-650', name: 'Crocin 650 mg', category: 'fever-pain', dosage: '650 mg', frequency: 'SOS', notes: 'For mild to moderate pain', subcategory: 'Pain' },
  { id: 'tapentadol', name: 'Tapentadol 50 mg', category: 'fever-pain', dosage: '50 mg', frequency: 'SOS', notes: 'For severe pain', warning: 'Strong opioid — use only under supervision', subcategory: 'Pain' },
  { id: 'drotin', name: 'Drotin', category: 'fever-pain', dosage: 'As directed', frequency: 'SOS', notes: 'For abdominal pain / cramps', subcategory: 'Pain' },
  { id: 'pantocid-40', name: 'Pantocid 40 mg', category: 'fever-pain', dosage: '40 mg', frequency: 'Twice daily before meals', notes: 'For gas and acidity', subcategory: 'Acidity' },
  { id: 'emeset', name: 'Emeset 4 mg', category: 'fever-pain', dosage: '4 mg', frequency: 'As required', notes: 'For vomiting / nausea', subcategory: 'Vomiting' },
  { id: 'pantocid-dsr', name: 'Pantocid DSR', category: 'fever-pain', dosage: 'As directed', frequency: 'Twice daily on empty stomach', notes: 'For acidity and vomiting together', subcategory: 'Acidity' },

  // Skin & Sleep
  { id: 'atarax', name: 'Atarax 25 mg', category: 'skin-sleep', dosage: '25 mg', frequency: 'Bedtime as required', notes: 'For itching', subcategory: 'Skin' },
  { id: 'moisturizer', name: 'Moisturizing Body Lotion', category: 'skin-sleep', dosage: 'Apply as needed', frequency: 'Daily after bath', notes: 'Prevents dry skin in kidney patients', subcategory: 'Skin' },
  { id: 'clonazepam', name: 'Clonazepam 0.25 mg', category: 'skin-sleep', dosage: '0.25 mg', frequency: 'Bedtime as required', notes: 'For sleep disturbance', warning: 'Avoid long-term use. May cause drowsiness.', subcategory: 'Sleep' },

  // Constipation
  { id: 'softovac', name: 'Softovac Powder', category: 'constipation', dosage: '4 tsp with milk', frequency: 'Bedtime', notes: 'Gentle overnight laxative', subcategory: 'Mild' },
  { id: 'cremalax', name: 'Cremalax', category: 'constipation', dosage: '2 tablets', frequency: 'Bedtime', notes: 'Alternative to Softovac', subcategory: 'Mild' },
  { id: 'exelyte', name: 'Exelyte', category: 'constipation', dosage: '1 bottle + 200 ml Limca', frequency: 'Over 2 hours', notes: 'For severe constipation — consume slowly over 2 hours', subcategory: 'Severe' },
  { id: 'pc-enema', name: 'PC Enema', category: 'constipation', dosage: 'As directed', frequency: 'As required', notes: 'For severe constipation — requires physician administration', warning: 'Consult general surgeon. Do per rectal examination first.', subcategory: 'Severe' },

  // Multivitamin & Nutrition
  { id: 'neurobion', name: 'Neurobion Forte', category: 'multivitamin', dosage: 'As directed', frequency: 'Once daily', notes: 'B-complex vitamin supplement' },
  { id: 'folvite', name: 'Folvite 5 mg', category: 'multivitamin', dosage: '5 mg', frequency: 'Once daily', notes: 'Folic acid supplement' },
  { id: 'vitocofol', name: 'Vitocofol 2 ml IM', category: 'multivitamin', dosage: '2 ml IM', frequency: 'Once daily × 5 days', notes: 'Injection — iron + folic acid combination' },

  // Dialysis Support
  { id: 'eldervit', name: 'Eldervit Injection', category: 'dialysis', dosage: 'As directed', frequency: 'Once weekly post Dialysis', notes: 'B-complex and multivitamin for dialysis patients' },
  { id: 'lcarnitine', name: 'L-Carnitine Injection', category: 'dialysis', dosage: 'As directed', frequency: 'Once weekly post Dialysis', notes: 'Reduces fatigue and muscle weakness in dialysis patients' },

  // Vitamin & Mineral
  { id: 'cholecalciferol', name: 'Cholecalciferol 60,000 IU', category: 'vitamin-mineral', dosage: '60,000 IU', frequency: 'Once weekly × 8 weeks, then monthly', notes: 'Vitamin D supplementation' },
  { id: 'shelcal', name: 'Shelcal 500 mg', category: 'vitamin-mineral', dosage: '500 mg', frequency: 'Twice daily', notes: 'Calcium supplement' },
  { id: 'sevelamer', name: 'Sevelamer 800 mg', category: 'vitamin-mineral', dosage: '800 mg', frequency: 'Thrice daily with meals', notes: 'Phosphate binder — take with food', warning: 'Take with each meal. Do not crush tablets.', subcategory: 'Phosphate Binders' },
  { id: 'phostat', name: 'Phostat 667 mg', category: 'vitamin-mineral', dosage: '667 mg', frequency: 'Thrice daily with meals', notes: 'Alternative phosphate binder', subcategory: 'Phosphate Binders' },

  // BP & Kidney Protection
  { id: 'amlodipine', name: 'Amlodipine 5 mg', category: 'bp-kidney', dosage: '5 mg', frequency: 'Once daily', notes: 'Start if BP > 140/90', subcategory: 'Blood Pressure' },
  { id: 'telma', name: 'Telma 40 mg', category: 'bp-kidney', dosage: '40 mg', frequency: 'Twice daily', notes: 'ARB — kidney protective. Monitor creatinine and potassium.', warning: 'STOP if Creatinine > 2 or Potassium > 5.2. Monitor at 1 week, 3 weeks, then monthly.', subcategory: 'Blood Pressure' },

  // Anemia Management
  { id: 'oral-iron', name: 'Oral Iron Supplement', category: 'anemia', dosage: 'As directed', frequency: 'Twice daily between meals', notes: 'Take between meals. Avoid milk, calcium, and antacids within 2 hours.', warning: 'Do NOT take with calcium or antacids — reduces absorption.' },
  { id: 'fcm', name: 'Ferric Carboxymaltose 500 mg IV', category: 'anemia', dosage: '500 mg IV × 2 doses', frequency: 'As directed', notes: 'IV iron — requires test dose first', warning: 'Give test dose first. Monitor for reaction.' },
  { id: 'ironsucrose', name: 'Iron Sucrose 100 mg IV', category: 'anemia', dosage: '100 mg IV post Dialysis', frequency: '× 10 doses, then once in 15 days', notes: 'For dialysis patients — no active infection', warning: 'Do not use if infection is present.' },
  { id: 'epo', name: 'Erythropoietin 10,000 units SC', category: 'anemia', dosage: '10,000 units SC', frequency: 'Once weekly', notes: 'Stimulates red blood cell production', subcategory: 'EPO' },
  { id: 'darbepoetin', name: 'Darbepoetin (Zynesp) 40 mcg SC', category: 'anemia', dosage: '40 mcg SC', frequency: 'Once every 15 days', notes: 'Longer-acting EPO alternative', subcategory: 'EPO' },
  { id: 'desidustat', name: 'Desidustat 100 mg', category: 'anemia', dosage: '100 mg', frequency: 'Thrice weekly', notes: 'Oral HIF-PHI — alternative to injectable EPO', subcategory: 'EPO' },

  // Specific Conditions
  { id: 'febuxostat', name: 'Febuxostat 40 mg', category: 'specific', dosage: '40 mg', frequency: 'Once daily', notes: 'For high uric acid (gout)', subcategory: 'Uric Acid' },
  { id: 'sodium-bicarb', name: 'Sodium Bicarbonate 1 gm', category: 'specific', dosage: '1 gm', frequency: 'Thrice daily', notes: 'For metabolic acidosis in kidney disease', subcategory: 'Acidosis' },
  { id: 'megesterol', name: 'Megesterol 160 mg', category: 'specific', dosage: '160 mg', frequency: 'Once daily × 10 days', notes: 'For poor appetite / weight gain', subcategory: 'Appetite' },

  // GI Infections
  { id: 'cefexime-oflox-gi', name: 'Cefexime 200 mg + Oflox 200 mg', category: 'infection', dosage: '200 mg each', frequency: 'Twice daily × 5 days', notes: 'For gastrointestinal infections', subcategory: 'GI Infection' },
  { id: 'bifilac', name: 'Bifilac', category: 'infection', dosage: 'As directed', frequency: 'Twice daily × 5 days', notes: 'Probiotic — restores gut flora during antibiotics', subcategory: 'GI Infection' },

  // Nephrotic Syndrome
  { id: 'wysolone', name: 'Wysolone (Prednisolone)', category: 'nephrotic', dosage: 'As directed', frequency: 'After meals once daily', notes: 'Steroid — do not stop abruptly. Taper under supervision.', warning: 'Do NOT stop suddenly. Taper gradually under nephrologist guidance.' },
  { id: 'rantac', name: 'Rantac 150 mg', category: 'nephrotic', dosage: '150 mg', frequency: 'Before breakfast once daily', notes: 'Protects stomach from steroid side effects' },
  { id: 'calcirol', name: 'Calcirol Sachet', category: 'nephrotic', dosage: 'As directed', frequency: 'Once weekly × 4 weeks', notes: 'Vitamin D supplement during steroid therapy' },
  { id: 'urostix', name: 'Urostix (Urine Albumin Strips)', category: 'nephrotic', dosage: 'Test strip', frequency: 'Daily', notes: 'Check urine albumin daily at home', subcategory: 'Monitoring' },

  // Advanced Kidney Disease
  { id: 'dialysis-init', name: 'Dialysis Initiation', category: 'advanced', dosage: 'As directed', frequency: 'As required', notes: 'Requires arteriovenous fistula creation and catheter insertion', warning: 'Condition not stable — urgent nephrology evaluation required.' },

  // Catheter Infection
  { id: 'vancomycin', name: 'Vancomycin 1 gm post Dialysis', category: 'catheter', dosage: '1 gm post Dialysis', frequency: '× 3 doses', notes: 'For catheter-related infection', warning: 'Remove infected catheter first. Do blood cultures before starting.', subcategory: 'Antibiotics' },
  { id: 'ceftazidime', name: 'Ceftazidime 1 gm', category: 'catheter', dosage: '1 gm', frequency: 'Alternate days × 4 doses', notes: 'IV antibiotic for catheter infection', subcategory: 'Antibiotics' },
  { id: 'femoral-cath', name: 'Temporary Femoral Catheter', category: 'catheter', dosage: 'As directed', frequency: 'For 2 Dialysis sessions', notes: 'If fistula not ready — temporary access', subcategory: 'Access' },
  { id: 'neck-cath', name: 'New Neck Catheter', category: 'catheter', dosage: 'As directed', frequency: 'If required', notes: 'Insert new catheter if old one cannot be saved', subcategory: 'Access' },

  // URTI
  { id: 'augmentin', name: 'Augmentin 625 mg', category: 'urti', dosage: '625 mg', frequency: 'Twice daily × 5 days', notes: 'Antibiotic for URTI — Option 1', subcategory: 'Option 1' },
  { id: 'ascorl', name: 'Ascorl Syrup', category: 'urti', dosage: '5 ml', frequency: 'Thrice daily', notes: 'Vitamin C + zinc. Use sugar-free if diabetic.', subcategory: 'Support' },
  { id: 'abphylline', name: 'Abphylline 100 mg', category: 'urti', dosage: '100 mg', frequency: 'Twice daily × 5 days', notes: 'Bronchodilator for cough/breathing', subcategory: 'Option 1' },
  { id: 'azee', name: 'Azee 500 mg', category: 'urti', dosage: '500 mg', frequency: 'Once daily × 5 days', notes: 'Antibiotic for URTI — Option 2', subcategory: 'Option 2' },
  { id: 'montair-lc', name: 'Montair LC', category: 'urti', dosage: 'As directed', frequency: 'Bedtime', notes: 'For allergic rhinitis / sneezing', subcategory: 'Option 2' },
  { id: 'zincovit', name: 'Zincovit', category: 'urti', dosage: 'As directed', frequency: 'Once daily', notes: 'Multivitamin with zinc', subcategory: 'Option 2' },

  // Severe Infections
  { id: 'meropenem', name: 'Meropenem 1 gm IV', category: 'severe', dosage: '1 gm in 100 ml NS over 1 hour', frequency: '× 7 days', notes: 'For severe / resistant infections', warning: 'Last-resort antibiotic. Use only under strict supervision.' },
];

export function getMedicinesByCategory(categoryId: string): Medicine[] {
  return medicines.filter((m) => m.category === categoryId);
}

export function searchMedicines(query: string): Medicine[] {
  const q = query.toLowerCase();
  return medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.genericName?.toLowerCase().includes(q) ||
      m.notes?.toLowerCase().includes(q) ||
      m.dosage.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
  );
}
