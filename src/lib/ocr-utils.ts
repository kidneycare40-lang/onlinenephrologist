import Tesseract from 'tesseract.js';

export interface ExtractedLabValue {
  testName: string;
  value: string;
  unit: string;
  normalRange?: string;
}

export interface ExtractedMedicine {
  name: string;
  dosage: string;
  strength: string;
  frequency: string;
  duration: string;
  instructions: string;
  when: string;
  route: string;
}

export interface OCRResult {
  rawText: string;
  labValues: ExtractedLabValue[];
  vitals: {
    systolic?: string;
    diastolic?: string;
    pulse?: string;
    temperature?: string;
    spo2?: string;
    weight?: string;
    height?: string;
  };
  diagnoses: string[];
  medicines: string[];
  structuredMedicines: ExtractedMedicine[];
  complaints: string[];
}

const LAB_PATTERNS: { pattern: RegExp; testName: string; unit: string }[] = [
  { pattern: /(?:serum\s+)?creatinine\s*[:\-]?\s*([\d.]+)/i, testName: 'Serum Creatinine', unit: 'mg/dL' },
  { pattern: /(?:eGFR|estimated\s+GFR)\s*[:\-]?\s*([\d.]+)/i, testName: 'eGFR', unit: 'mL/min/1.73m²' },
  { pattern: /(?:blood\s+urea\s+nitrogen|BUN)\s*[:\-]?\s*([\d.]+)/i, testName: 'BUN', unit: 'mg/dL' },
  { pattern: /(?:blood\s+urea|urea\s+nitrogen)\s*[:\-]?\s*([\d.]+)/i, testName: 'Blood Urea', unit: 'mg/dL' },
  { pattern: /HbA1c\s*[:\-]?\s*([\d.]+)/i, testName: 'HbA1c', unit: '%' },
  { pattern: /(?:hemoglobin|Hb)\s*[:\-]?\s*([\d.]+)/i, testName: 'Hemoglobin', unit: 'g/dL' },
  { pattern: /(?:fasting\s+)?(?:blood\s+)?glucose\s*[:\-]?\s*([\d.]+)/i, testName: 'Blood Glucose', unit: 'mg/dL' },
  { pattern: /(?:random\s+)?(?:blood\s+)?sugar\s*[:\-]?\s*([\d.]+)/i, testName: 'Blood Sugar (Random)', unit: 'mg/dL' },
  { pattern: /(?:PP\s+(?:blood\s+)?sugar|post\s+prandial)\s*[:\-]?\s*([\d.]+)/i, testName: 'PP Blood Sugar', unit: 'mg/dL' },
  { pattern: /(?:total\s+)?(?:WBC|white\s+blood\s+(?:cell)?s?)\s*(?:count)?\s*[:\-]?\s*([\d,]+)/i, testName: 'WBC Count', unit: '/μL' },
  { pattern: /platelet\s*(?:count)?\s*[:\-]?\s*([\d,]+)/i, testName: 'Platelet Count', unit: '/μL' },
  { pattern: /(?:serum\s+)?(?:sodium|Na\+?)\s*[:\-]?\s*([\d.]+)/i, testName: 'Serum Sodium', unit: 'mEq/L' },
  { pattern: /(?:serum\s+)?(?:potassium|K\+?)\s*[:\-]?\s*([\d.]+)/i, testName: 'Serum Potassium', unit: 'mEq/L' },
  { pattern: /(?:serum\s+)?calcium\s*[:\-]?\s*([\d.]+)/i, testName: 'Serum Calcium', unit: 'mg/dL' },
  { pattern: /(?:serum\s+)?phosphorus?\s*[:\-]?\s*([\d.]+)/i, testName: 'Serum Phosphorus', unit: 'mg/dL' },
  { pattern: /(?:serum\s+)?albumin\s*[:\-]?\s*([\d.]+)/i, testName: 'Serum Albumin', unit: 'g/dL' },
  { pattern: /(?:total\s+)?bilirubin\s*[:\-]?\s*([\d.]+)/i, testName: 'Total Bilirubin', unit: 'mg/dL' },
  { pattern: /(?:direct\s+)?bilirubin\s*[:\-]?\s*([\d.]+)/i, testName: 'Direct Bilirubin', unit: 'mg/dL' },
  { pattern: /(?:indirect\s+)?bilirubin\s*[:\-]?\s*([\d.]+)/i, testName: 'Indirect Bilirubin', unit: 'mg/dL' },
  { pattern: /(?:SGOT|AST|GOT)\s*[:\-]?\s*([\d.]+)/i, testName: 'SGOT (AST)', unit: 'U/L' },
  { pattern: /(?:SGPT|ALT|GPT)\s*[:\-]?\s*([\d.]+)/i, testName: 'SGPT (ALT)', unit: 'U/L' },
  { pattern: /(?:ALP|alkaline\s+phosphatase)\s*[:\-]?\s*([\d.]+)/i, testName: 'Alkaline Phosphatase', unit: 'U/L' },
  { pattern: /(?:GGT|gamma\s+GT)\s*[:\-]?\s*([\d.]+)/i, testName: 'GGT', unit: 'U/L' },
  { pattern: /(?:serum\s+)?uric\s+acid\s*[:\-]?\s*([\d.]+)/i, testName: 'Serum Uric Acid', unit: 'mg/dL' },
  { pattern: /(?:PTH|parathyroid\s+hormone|intact\s+PTH)\s*[:\-]?\s*([\d.]+)/i, testName: 'Intact PTH', unit: 'pg/mL' },
  { pattern: /(?:vitamin\s+D|25[-\s]?OH[-\s]?D)\s*[:\-]?\s*([\d.]+)/i, testName: 'Vitamin D', unit: 'ng/mL' },
  { pattern: /(?:vitamin\s+B12|cobalamin)\s*[:\-]?\s*([\d.]+)/i, testName: 'Vitamin B12', unit: 'pg/mL' },
  { pattern: /(?:TSH|thyroid\s+stimulating\s+hormone)\s*[:\-]?\s*([\d.]+)/i, testName: 'TSH', unit: 'μIU/mL' },
  { pattern: /(?:free\s+T3|FT3)\s*[:\-]?\s*([\d.]+)/i, testName: 'Free T3', unit: 'pg/mL' },
  { pattern: /(?:free\s+T4|FT4)\s*[:\-]?\s*([\d.]+)/i, testName: 'Free T4', unit: 'ng/dL' },
  { pattern: /(?:hematocrit|HCT|PCV)\s*[:\-]?\s*([\d.]+)/i, testName: 'Hematocrit', unit: '%' },
  { pattern: /(?:RBC|red\s+blood\s+cell)\s*(?:count)?\s*[:\-]?\s*([\d.]+)/i, testName: 'RBC Count', unit: 'million/μL' },
  { pattern: /(?:MCV)\s*[:\-]?\s*([\d.]+)/i, testName: 'MCV', unit: 'fL' },
  { pattern: /(?:MCH)\s*[:\-]?\s*([\d.]+)/i, testName: 'MCH', unit: 'pg' },
  { pattern: /(?:MCHC)\s*[:\-]?\s*([\d.]+)/i, testName: 'MCHC', unit: 'g/dL' },
  { pattern: /(?:RDW)\s*[:\-]?\s*([\d.]+)/i, testName: 'RDW', unit: '%' },
  { pattern: /(?:neutrophils?|NEUT%?)\s*[:\-]?\s*([\d.]+)/i, testName: 'Neutrophils', unit: '%' },
  { pattern: /(?:lymphocytes?|LYMPH%?)\s*[:\-]?\s*([\d.]+)/i, testName: 'Lymphocytes', unit: '%' },
  { pattern: /(?:eosinophils?|EOS%?)\s*[:\-]?\s*([\d.]+)/i, testName: 'Eosinophils', unit: '%' },
  { pattern: /(?:monocytes?|MONO%?)\s*[:\-]?\s*([\d.]+)/i, testName: 'Monocytes', unit: '%' },
  { pattern: /(?:basophils?|BASO%?)\s*[:\-]?\s*([\d.]+)/i, testName: 'Basophils', unit: '%' },
  { pattern: /(?:urea\s+nitrogen\s+creatinine\s+ratio|UN\/Cr)\s*[:\-]?\s*([\d.]+)/i, testName: 'BUN/Cr Ratio', unit: '' },
  { pattern: /(?:protein\s+(?:to\s+)?(?:creatinine\s+)?ratio|PCR)\s*[:\-]?\s*([\d.]+)/i, testName: 'Protein/Creatinine Ratio', unit: '' },
  { pattern: /(?:albumin\s+(?:to\s+)?(?:creatinine\s+)?ratio|ACR)\s*[:\-]?\s*([\d.]+)/i, testName: 'Albumin/Creatinine Ratio', unit: 'mg/g' },
  { pattern: /(?:LDL|low\s+density\s+lipoprotein)\s*[:\-]?\s*([\d.]+)/i, testName: 'LDL Cholesterol', unit: 'mg/dL' },
  { pattern: /(?:HDL|high\s+density\s+lipoprotein)\s*[:\-]?\s*([\d.]+)/i, testName: 'HDL Cholesterol', unit: 'mg/dL' },
  { pattern: /(?:triglycerides?)\s*[:\-]?\s*([\d.]+)/i, testName: 'Triglycerides', unit: 'mg/dL' },
  { pattern: /(?:total\s+)?cholesterol\s*[:\-]?\s*([\d.]+)/i, testName: 'Total Cholesterol', unit: 'mg/dL' },
  { pattern: /(?:VLDL)\s*[:\-]?\s*([\d.]+)/i, testName: 'VLDL', unit: 'mg/dL' },
  { pattern: /(?:serum\s+)?iron\s*[:\-]?\s*([\d.]+)/i, testName: 'Serum Iron', unit: 'μg/dL' },
  { pattern: /(?:ferritin)\s*[:\-]?\s*([\d.]+)/i, testName: 'Serum Ferritin', unit: 'ng/mL' },
  { pattern: /(?:transferrin\s+saturation)\s*[:\-]?\s*([\d.]+)/i, testName: 'Transferrin Saturation', unit: '%' },
  { pattern: /(?:TIBC)\s*[:\-]?\s*([\d.]+)/i, testName: 'TIBC', unit: 'μg/dL' },
  { pattern: /(?:total\s+)?protein\s*[:\-]?\s*([\d.]+)/i, testName: 'Total Protein', unit: 'g/dL' },
  { pattern: /(?:BUN|blood\s+urea)\s*[:\-]?\s*([\d.]+)/i, testName: 'BUN', unit: 'mg/dL' },
  { pattern: /(?:creatinine\s+clearance|CrCl)\s*[:\-]?\s*([\d.]+)/i, testName: 'Creatinine Clearance', unit: 'mL/min' },
  { pattern: /(?:UA\/Cr|urine\s+albumin\s+creatinine)\s*[:\-]?\s*([\d.]+)/i, testName: 'Urine ACR', unit: 'mg/g' },
  { pattern: /(?:spot\s+urine\s+)?protein\s*[:\-]?\s*([\d.]+)/i, testName: 'Urine Protein', unit: 'mg/dL' },
  { pattern: /(?:24\s*(?:hr|hour)?\s*)?urine\s+(?:volume|output)\s*[:\-]?\s*([\d.]+)/i, testName: '24hr Urine Volume', unit: 'mL' },
  { pattern: /(?:urine\s+)?sodium\s*[:\-]?\s*([\d.]+)/i, testName: 'Urine Sodium', unit: 'mEq/L' },
  { pattern: /(?:urine\s+)?creatinine\s*[:\-]?\s*([\d.]+)/i, testName: 'Urine Creatinine', unit: 'mg/dL' },
  { pattern: /(?:CRP|C[\s-]?reactive\s+protein)\s*[:\-]?\s*([\d.]+)/i, testName: 'CRP', unit: 'mg/L' },
  { pattern: /(?:ESR|erythrocyte\s+sedimentation)\s*[:\-]?\s*([\d.]+)/i, testName: 'ESR', unit: 'mm/hr' },
  { pattern: /(?:UA|urinalysis|routine\s+and\s+microscopy|R\/M)\s*[:\-]?\s*(.+)/i, testName: 'Urinalysis', unit: '' },
  { pattern: /(?:urine\s+)?micro\s*[:\-]?\s*(.+)/i, testName: 'Urine Microscopy', unit: '' },
  { pattern: /(?:procalcitonin|PCT)\s*[:\-]?\s*([\d.]+)/i, testName: 'Procalcitonin', unit: 'ng/mL' },
  { pattern: /(?:BNP|NT[\s-]?proBNP)\s*[:\-]?\s*([\d,]+)/i, testName: 'BNP/NT-proBNP', unit: 'pg/mL' },
  { pattern: /(?:D[\s-]?dimer)\s*[:\-]?\s*([\d.]+)/i, testName: 'D-Dimer', unit: 'μg/mL' },
  { pattern: /(?:homocysteine)\s*[:\-]?\s*([\d.]+)/i, testName: 'Homocysteine', unit: 'μmol/L' },
  { pattern: /(?:lipase)\s*[:\-]?\s*([\d.]+)/i, testName: 'Lipase', unit: 'U/L' },
  { pattern: /(?:amylase)\s*[:\-]?\s*([\d.]+)/i, testName: 'Amylase', unit: 'U/L' },
  { pattern: /(?:uric\s+acid)\s*[:\-]?\s*([\d.]+)/i, testName: 'Uric Acid', unit: 'mg/dL' },
  { pattern: /(?:serum\s+)?magnesium\s*[:\-]?\s*([\d.]+)/i, testName: 'Serum Magnesium', unit: 'mg/dL' },
  { pattern: /(?:chloride|Cl-?)\s*[:\-]?\s*([\d.]+)/i, testName: 'Serum Chloride', unit: 'mEq/L' },
  { pattern: /(?:bicarbonate|HCO3|CO2)\s*[:\-]?\s*([\d.]+)/i, testName: 'Bicarbonate (HCO3)', unit: 'mEq/L' },
];

const VITAL_PATTERNS = [
  { pattern: /(?:bp|blood\s+pressure)\s*[:\-]?\s*(\d{2,3})\s*[\/xX]\s*(\d{2,3})/i, fields: ['systolic', 'diastolic'] as const },
  { pattern: /(?:systolic)\s*[:\-]?\s*(\d{2,3})/i, fields: ['systolic'] as const },
  { pattern: /(?:diastolic)\s*[:\-]?\s*(\d{2,3})/i, fields: ['diastolic'] as const },
  { pattern: /(?:pulse|heart\s+rate|HR)\s*[:\-]?\s*(\d{2,3})/i, fields: ['pulse'] as const },
  { pattern: /(?:temperature|temp|fever)\s*[:\-]?\s*([\d.]+)/i, fields: ['temperature'] as const },
  { pattern: /(?:SpO2|oxygen\s+saturation|sao2)\s*[:\-]?\s*(\d{2,3})/i, fields: ['spo2'] as const },
  { pattern: /(?:weight|wt)\s*[:\-]?\s*([\d.]+)\s*(?:kg)?/i, fields: ['weight'] as const },
  { pattern: /(?:height|ht)\s*[:\-]?\s*([\d.]+)\s*(?:cm)?/i, fields: ['height'] as const },
];

const KNOWN_MEDICINES: Record<string, string> = {
  'nexpro': 'Esomeprazole',
  'nexpro rd': 'Esomeprazole',
  'nexpro 40': 'Esomeprazole',
  'tide': 'Telmisartan',
  'tide 20': 'Telmisartan',
  'ecosprin': 'Aspirin',
  'ecosprin av': 'Aspirin + Atorvastatin',
  'ecosprin 75': 'Aspirin',
  'nikoran': 'Nicorandil',
  'darba': 'Darbepoetin',
  'enphio': 'Iron Sucrose',
  'enphio fcm': 'Ferric Carboxymaltose',
  'fcm': 'Ferric Carboxymaltose',
  'folvite': 'Folic Acid',
  'polybion': 'Methylcobalamin',
  'sevelamer': 'Sevelamer',
  'sevelamer 400': 'Sevelamer',
  'sevelamer 800': 'Sevelamer',
  'apptrol': 'Amlodipine',
  'ketoberry': 'Ketosteril',
  'krolina': 'Calcium + Vitamin D3',
  'gp': 'Glimepiride',
  'lantus': 'Insulin Glargine',
  'ubitate': 'Darbepoetin Alfa',
  'telmisartan': 'Telmisartan',
  'amlodipine': 'Amlodipine',
  'losartan': 'Losartan',
  'metformin': 'Metformin',
  'glimepiride': 'Glimepiride',
  'empagliflozin': 'Empagliflozin',
  'dapagliflozin': 'Dapagliflozin',
  'atorvastatin': 'Atorvastatin',
  'aspirin': 'Aspirin',
  'clopidogrel': 'Clopidogrel',
  'olmesartan': 'Olmesartan',
  'furosemide': 'Furosemide',
  'spironolactone': 'Spironolactone',
  'calcium carbonate': 'Calcium Carbonate',
  'calcitriol': 'Calcitriol',
  'erythropoietin': 'EPO',
  'epoetin': 'EPO',
  'darbepoetin': 'Darbepoetin',
  'iron sucrose': 'Iron Sucrose',
  'sodium bicarbonate': 'Sodium Bicarbonate',
  'pantoprazole': 'Pantoprazole',
  'omeprazole': 'Omeprazole',
  'tacrolimus': 'Tacrolimus',
  'mycophenolate': 'Mycophenolate',
  'prednisolone': 'Prednisolone',
  'azithromycin': 'Azithromycin',
  'amoxicillin': 'Amoxicillin',
  'ciprofloxacin': 'Ciprofloxacin',
  'paracetamol': 'Paracetamol',
  'ibuprofen': 'Ibuprofen',
  'dolo': 'Paracetamol',
  'dolo 650': 'Paracetamol',
  'crocin': 'Paracetamol',
  'panadol': 'Paracetamol',
  'combiflam': 'Ibuprofen + Paracetamol',
  'allegra': 'Fexofenadine',
  'cetirizine': 'Cetirizine',
  'levocetirizine': 'Levocetirizine',
  'montair': 'Montelukast',
  'montelukast': 'Montelukast',
  'pantop': 'Pantoprazole',
  'pantodac': 'Pantoprazole',
  'ranitidine': 'Ranitidine',
  'esomeprazole': 'Esomeprazole',
  'rabeprazole': 'Rabeprazole',
  'ondansetron': 'Ondansetron',
  'metoclopramide': 'Metoclopramide',
  'domperidone': 'Domperidone',
  'lactulose': 'Lactulose',
  'loperamide': 'Loperamide',
  'aceclofenac': 'Aceclofenac',
  'diclofenac': 'Diclofenac',
  'tramadol': 'Tramadol',
  'pregabalin': 'Pregabalin',
  'gabapentin': 'Gabapentin',
  'carbamazepine': 'Carbamazepine',
  'valproate': 'Valproate',
  'levetiracetam': 'Levetiracetam',
  'atorva': 'Atorvastatin',
  'rosuva': 'Rosuvastatin',
  'rosuvastatin': 'Rosuvastatin',
  'statin': 'Statin',
  'betablocker': 'Beta Blocker',
  'metoprolol': 'Metoprolol',
  'atenolol': 'Atenolol',
  'bisoprolol': 'Bisoprolol',
  'carvedilol': 'Carvedilol',
  'nebivolol': 'Nebivolol',
  'sildenafil': 'Sildenafil',
  'tadalafil': 'Tadalafil',
  'finasteride': 'Finasteride',
  'tamsulosin': 'Tamsulosin',
  'alpha': 'Alfuzosin',
  'doxazosin': 'Doxazosin',
  'prazosin': 'Prazosin',
  'chlorthalidone': 'Chlorthalidone',
  'hydrochlorothiazide': 'Hydrochlorothiazide',
  'torsemide': 'Torsemide',
  'torasemide': 'Torsemide',
  'mannitol': 'Mannitol',
  'acetazolamide': 'Acetazolamide',
  'insulin': 'Insulin',
  'human mixtard': 'Insulin',
  'novorapid': 'Insulin',
  'humalog': 'Insulin',
  'novomix': 'Insulin',
  'glargine': 'Insulin Glargine',
  'sitagliptin': 'Sitagliptin',
  'voglibose': 'Voglibose',
  'pioglitazone': 'Pioglitazone',
  'gliclazide': 'Gliclazide',
  'teneligliptin': 'Teneligliptin',
  'linagliptin': 'Linagliptin',
  'sacubitril': 'Sacubitril',
  'valsartan': 'Valsartan',
  'entresto': 'Sacubitril/Valsartan',
  'digoxin': 'Digoxin',
  'amiodarone': 'Amiodarone',
  'warfarin': 'Warfarin',
  'heparin': 'Heparin',
  'enoxaparin': 'Enoxaparin',
  'rivaroxaban': 'Rivaroxaban',
  'apixaban': 'Apixaban',
  'methotrexate': 'Methotrexate',
  'cyclophosphamide': 'Cyclophosphamide',
  'rituximab': 'Rituximab',
  'prednisone': 'Prednisone',
  'methylprednisolone': 'Methylprednisolone',
  'dexamethasone': 'Dexamethasone',
  'deferasirox': 'Deferasirox',
  'desferrioxamine': 'Desferrioxamine',
  'lanthanum': 'Lanthanum',
  'sucroferric': 'Sucroferric Oxyhydroxide',
  'cinacalcet': 'Cinacalcet',
  'paricalcitol': 'Paricalcitol',
  'etelcalcetide': 'Etelcalcetide',
  'allopurinol': 'Allopurinol',
  'febuxostat': 'Febuxostat',
  'colchicine': 'Colchicine',
  'methycobal': 'Methylcobalamin',
  'neurobion': 'Vitamin B Complex',
  'supradyn': 'Multivitamin',
  'becosules': 'Vitamin B Complex',
  'neurobion forte': 'Vitamin B Complex',
  'shelcal': 'Calcium + Vitamin D3',
  'oscal': 'Calcium',
  'd-rise': 'Vitamin D3',
  'd3 must': 'Vitamin D3',
  'tacrograf': 'Tacrolimus',
  'myfortic': 'Mycophenolate',
  'cellcept': 'Mycophenolate',
  'azoran': 'Azathioprine',
  'immunocin': 'Cyclosporine',
  'cyclosporine': 'Cyclosporine',
};

function normalizeMedicineName(raw: string): string {
  const cleaned = raw
    .replace(/\b(tab(?:let)?|cap(?:sule)?|inj(?:ection)?|syrup|suspension|sugar\s+free|sr|xr|xl|od|hf)\b/gi, '')
    .replace(/\d+\s*(?:mg|mcg|g|ml|iu|units?|u)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  if (KNOWN_MEDICINES[cleaned]) return KNOWN_MEDICINES[cleaned];
  for (const [key, val] of Object.entries(KNOWN_MEDICINES)) {
    if (cleaned.includes(key)) return val;
  }
  return raw.replace(/\b(tab(?:let)?|cap(?:sule)?|inj(?:ection)?)\b/gi, '').trim();
}

function parseFrequency(text: string): { frequency: string; when: string } {
  const lower = text.toLowerCase();
  if (lower.includes('3 times') || lower.includes('tid') || lower.includes('thrice')) {
    return { frequency: '1-1-1', when: '' };
  }
  if (lower.includes('2 times') || lower.includes('bid') || lower.includes('twice')) {
    if (lower.includes('morning') && lower.includes('evening')) return { frequency: '1-0-1', when: '' };
    if (lower.includes('morning') && lower.includes('afternoon')) return { frequency: '1-1-0', when: '' };
    return { frequency: '1-0-1', when: '' };
  }
  if (lower.includes('1 time') || lower.includes('once') || lower.includes('qd') || lower.match(/1\s*time/)) {
    if (lower.includes('morning') || lower.includes('bed')) return { frequency: '1-0-0', when: lower.includes('bed') ? 'bed time' : 'morning' };
    if (lower.includes('night') || lower.includes('bed')) return { frequency: '0-0-1', when: 'bed time' };
    if (lower.includes('afternoon')) return { frequency: '0-1-0', when: 'afternoon' };
    return { frequency: '1-0-0', when: '' };
  }
  if (lower.includes('week')) {
    return { frequency: text, when: '' };
  }
  return { frequency: text, when: '' };
}

function parseWhen(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('before food') || lower.includes('before meal') || lower.includes('empty stomach') || lower.includes('bf') || lower.includes('ac')) return 'before food';
  if (lower.includes('after food') || lower.includes('after meal') || lower.includes('with food') || lower.includes('af') || lower.includes('pc')) return 'after food';
  if (lower.includes('bed time') || lower.includes('bedtime') || lower.includes('hs')) return 'bed time';
  if (lower.includes('any time') || lower.includes('anytime')) return '';
  return '';
}

function parseStructuredMedicineTable(text: string): ExtractedMedicine[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const medicines: ExtractedMedicine[] = [];

  let headerLine = -1;
  let nameIdx = -1, dosageIdx = -1, freqIdx = -1, instructIdx = -1, durationIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase();
    if ((lower.includes('medicine') || lower.includes('drug') || lower.includes('rx') || lower.includes('medication')) && lower.includes('name')) {
      headerLine = i;
      const parts = lines[i].split(/\t+|\s{2,}/);
      for (let j = 0; j < parts.length; j++) {
        const p = parts[j].toLowerCase().trim();
        if (p.includes('name') || p.includes('medicine') || p.includes('drug')) nameIdx = j;
        if (p.includes('dosage') || p.includes('dose') || p.includes('strength')) dosageIdx = j;
        if (p.includes('freq') || p.includes('schedule') || p.includes('times')) freqIdx = j;
        if (p.includes('instruct') || p.includes('advice') || p.includes('intake') || p.includes('before') || p.includes('after')) instructIdx = j;
        if (p.includes('duration') || p.includes('days') || p.includes('months') || p.includes('weeks')) durationIdx = j;
      }
      break;
    }
  }

  if (headerLine === -1) {
    for (let i = 0; i < lines.length; i++) {
      const lower = lines[i].toLowerCase();
      if (lower.match(/rx\s*#/) || lower.match(/^\d+\s+\w/) && lower.includes('mg')) {
        headerLine = i;
        const parts = lines[i].split(/\t+|\s{2,}/);
        nameIdx = 1;
        dosageIdx = 2;
        freqIdx = 3;
        instructIdx = 4;
        durationIdx = 5;
        break;
      }
    }
  }

  if (headerLine === -1) return medicines;

  for (let i = headerLine + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    if (line.toLowerCase().includes('signature') || line.toLowerCase().includes('doctor') || line.toLowerCase().includes('note:')) break;

    let parts = line.split(/\t+|\s{2,}/);
    if (parts.length < 2) {
      const spaceSplit = line.split(/\s{3,}/);
      if (spaceSplit.length >= 2) parts = spaceSplit;
    }

    const hasRxNum = parts[0]?.match(/^\d+$/);
    if (hasRxNum && parts.length >= 3) {
      const med: ExtractedMedicine = {
        name: normalizeMedicineName(parts[nameIdx > 0 ? nameIdx : 1] || ''),
        dosage: parts[dosageIdx > 0 ? dosageIdx : 2] || '',
        strength: '',
        frequency: '',
        duration: '',
        instructions: '',
        when: '',
        route: 'oral',
      };

      const freqText = parts[freqIdx > 0 ? freqIdx : 3] || '';
      const parsed = parseFrequency(freqText);
      med.frequency = parsed.frequency;
      if (parsed.when) med.when = parsed.when;

      if (instructIdx > 0 && parts[instructIdx]) {
        med.instructions = parts[instructIdx];
        const when = parseWhen(parts[instructIdx]);
        if (when) med.when = when;
      }

      if (durationIdx > 0 && parts[durationIdx]) {
        med.duration = parts[durationIdx];
      } else if (parts.length > 4) {
        med.duration = parts[parts.length - 1];
      }

      if (med.dosage.toLowerCase().includes('injection') || med.dosage.toLowerCase().includes('syringe')) {
        med.route = 'injection';
      }

      if (med.name && med.name.length > 1) {
        medicines.push(med);
      }
    } else if (parts.length >= 2 && !hasRxNum) {
      const lineText = line.toLowerCase();
      const isMedicineLine = lineText.includes('tab') || lineText.includes('cap') || lineText.includes('inj') || lineText.match(/\d+\s*(?:mg|mcg|ml|u\b|unit)/);
      if (isMedicineLine) {
        const med: ExtractedMedicine = {
          name: normalizeMedicineName(parts[0]),
          dosage: parts[1] || '',
          strength: '',
          frequency: parts.length > 2 ? parts[2] : '',
          duration: parts.length > 3 ? parts[parts.length - 1] : '',
          instructions: '',
          when: '',
          route: lineText.includes('inj') ? 'injection' : 'oral',
        };
        if (med.name && med.name.length > 1) {
          medicines.push(med);
        }
      }
    }
  }

  return medicines;
}

function parseMedicineLines(text: string): string[] {
  const medicines: string[] = [];
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.length < 3 || trimmed.length > 200) continue;
    const lower = trimmed.toLowerCase();
    if (lower.startsWith('signature') || lower.startsWith('doctor') || lower.startsWith('note:') || lower.startsWith('pharmacy')) continue;
    if (lower.match(/^(date|patient|age|sex|gender|address|phone|mr\.|mrs\.|dr\.\s)/)) continue;

    const hasStrength = lower.match(/\d+\s*(?:mg|mcg|g|ml|iu|u\b|units?|scoop)/);
    const hasForm = lower.match(/\b(tab(?:let)?|cap(?:sule)?|inj(?:ection)?|syrup|suspension|drops?|gel|cream|ointment|inhaler|puff|nebules?|sachet|syringe|pen)\b/);
    const hasKnownDrug = Object.keys(KNOWN_MEDICINES).some(k => lower.includes(k));
    const hasDoseNumber = lower.match(/\b\d+\s*(?:mg|mcg)/);

    if (hasStrength && (hasForm || hasKnownDrug)) {
      if (!medicines.includes(trimmed)) medicines.push(trimmed);
    } else if (hasForm && hasDoseNumber) {
      if (!medicines.includes(trimmed)) medicines.push(trimmed);
    } else if (hasKnownDrug && hasStrength) {
      if (!medicines.includes(trimmed)) medicines.push(trimmed);
    } else if (hasKnownDrug && lower.match(/\d+/)) {
      if (!medicines.includes(trimmed)) medicines.push(trimmed);
    } else {
      const parts = trimmed.split(/\t+|\s{2,}/);
      if (parts.length >= 2) {
        const firstWord = parts[0].toLowerCase().replace(/\b(tab|cap|inj|tablet|capsule|injection)\b/gi, '').trim();
        if (firstWord.length > 1 && (Object.keys(KNOWN_MEDICINES).some(k => firstWord.includes(k)) || parts.some(p => p.toLowerCase().match(/\d+\s*(?:mg|mcg|ml|iu)/)))) {
          if (!medicines.includes(trimmed)) medicines.push(trimmed);
        }
      }
    }
  }
  return medicines;
}

function parseExtractedText(text: string): OCRResult {
  const labValues: ExtractedLabValue[] = [];
  for (const { pattern, testName, unit } of LAB_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      labValues.push({ testName, value: match[1], unit });
    }
  }

  const vitals: OCRResult['vitals'] = {};
  for (const { pattern, fields } of VITAL_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      fields.forEach((f, i) => {
        if (match[i + 1]) vitals[f] = match[i + 1];
      });
    }
  }

  const diagnoses: string[] = [];
  const diagnosisPatterns = [
    /(?:diagnosis|dx|impression|provisional\s+diagnosis)\s*[:\-]?\s*(.+)/gi,
    /(?:CKD\s+(?:stage\s+)?[1-5]\w*)/gi,
    /(?:chronic\s+kidney\s+disease)/gi,
    /(?:diabetic\s+(?:nephropathy|kidney))/gi,
    /(?:hypertension|HTN)/gi,
    /(?:kidney\s+stones?|nephrolithiasis|renal\s+calculus)/gi,
    /(?:polycystic\s+kidney)/gi,
    /(?:nephrotic\s+syndrome)/gi,
    /(?:acute\s+kidney\s+injury|AKI)/gi,
    /(?:renal\s+failure|kidney\s+failure)/gi,
    /(?:end\s+stage\s+renal\s+disease|ESRD|ESKD)/gi,
    /(?:chronic\s+renal\s+failure|CRF)/gi,
    /(?:diabetes\s+mellitus|DM\s*(?:type\s+[12])?)/gi,
    /(?:type\s+[12]\s+diabetes)/gi,
    /(?:anemia|anaemia)/gi,
    /(?:iron\s+deficiency)/gi,
    /(?:hyperkalemia|hyperkalemia)/gi,
    /(?:hypocalcemia)/gi,
    /(?:hyperphosphatemia)/gi,
    /(?:secondary\s+hyperparathyroidism)/gi,
    /(?:renal\s+osteodystrophy)/gi,
    /(?:dialysis|hemodialysis|peritoneal\s+dialysis)/gi,
    /(?:vesicoureteral\s+reflux)/gi,
    /(?:glomerulonephritis)/gi,
    /(?:lupus\s+nephritis)/gi,
    /(?:IgA\s+nephropathy)/gi,
    /(?:membranous\s+nephropathy)/gi,
    /(?:focal\s+segmental\s+glomerulosclerosis|FSGS)/gi,
    /(?:minimal\s+change\s+disease|MCD)/gi,
    /(?:polycystic\s+kidney\s+disease|PKD)/gi,
    /(?:hydronephrosis)/gi,
    /(?:pyelonephritis)/gi,
    /(?:cystitis)/gi,
    /(?:urinary\s+tract\s+infection|UTI)/gi,
    /(?:BPH|benign\s+prostatic\s+hyperplasia)/gi,
    /(?:prostatomegaly)/gi,
    /(?:renal\s+artery\s+stenosis)/gi,
    /(?:atherosclerosis)/gi,
    /(?:congestive\s+heart\s+failure|CHF)/gi,
    /(?:heart\s+failure)/gi,
    /(?:atrial\s+fibrillation|AF)/gi,
    /(?:coronary\s+artery\s+disease|CAD)/gi,
    /(?:ischemic\s+heart\s+disease|IHD)/gi,
    /(?:myocardial\s+infarction|MI)/gi,
    /(?:peripheral\s+vascular\s+disease)/gi,
    /(?:stroke|CVA|cerebrovascular\s+accident)/gi,
    /(?:cirrhosis|liver\s+cirrhosis)/gi,
    /(?:hepatitis)/gi,
    /(?:fatty\s+liver|NAFLD|NASH)/gi,
    /(?:pancreatitis)/gi,
    /(?:cholelithiasis|gallstones)/gi,
    /(?:hypothyroidism)/gi,
    /(?:hyperthyroidism)/gi,
    /(?:hypouricemia|hyperuricemia)/gi,
    /(?:gout)/gi,
    /(?:obesity)/gi,
    /(?:COPD|chronic\s+obstructive)/gi,
    /(?:asthma)/gi,
    /(?:pneumonia)/gi,
    /(?:tuberculosis|TB)/gi,
    /(?:COVID|covid|coronavirus)/gi,
    /(?:osteoporosis)/gi,
    /(?:osteopenia)/gi,
    /(?:rheumatoid\s+arthritis|RA)/gi,
    /(?:SLE|lupus)/gi,
    /(?:scleroderma)/gi,
    /(?:vasculitis)/gi,
  ];
  for (const p of diagnosisPatterns) {
    let m;
    while ((m = p.exec(text)) !== null) {
      const d = m[0].trim();
      if (d && !diagnoses.includes(d)) diagnoses.push(d);
    }
  }

  const structuredMedicines = parseStructuredMedicineTable(text);
  const medicines = structuredMedicines.length > 0
    ? structuredMedicines.map(m => `${m.name} ${m.dosage}`.trim())
    : parseMedicineLines(text);

  const complaints: string[] = [];
  const complaintPatterns = [
    /(?:complaint|symptom|presenting\s+complaint|chief\s+complaint|history\s+of\s+present\s+illness|HPI)\s*[:\-]?\s*(.+)/gi,
    /(?:swelling|edema|oedema)/gi,
    /(?:fatigue|tired|tiredness|weakness|lethargy)/gi,
    /(?:nausea|vomiting|retching)/gi,
    /(?:breathlessness|dyspnea|shortness\s+of\s+breath|SOB|dyspnoea)/gi,
    /(?:anorexia|loss\s+of\s+appetite|decreased\s+appetite)/gi,
    /(?:pruritus|itching|itchy\s+skin)/gi,
    /(?:decreased\s+(?:urine|urination)|oliguria|anuria|low\s+urine\s+output)/gi,
    /(?:haematuria|hematuria|blood\s+in\s+urine)/gi,
    /(?:foam[ying]*\s+(?:urine|urination))/gi,
    /(?:chest\s+pain|angina)/gi,
    /(?:palpitation|rapid\s+heart|irregular\s+heartbeat)/gi,
    /(?:dizziness|vertigo|giddiness|lightheadedness)/gi,
    /(?:headache|migraine)/gi,
    /(?:abdominal\s+pain|stomach\s+pain|belly\s+pain)/gi,
    /(?:diarrhea|loose\s+stools|watery\s+stools)/gi,
    /(?:constipation)/gi,
    /(?:bloating|distension)/gi,
    /(?:heartburn|acid\s+reflux|GERD)/gi,
    /(?:difficulty\s+swallowing|dysphagia)/gi,
    /(?:insomnia|sleep\s+disturbance|difficulty\s+sleeping)/gi,
    /(?:nocturia|frequent\s+urination|polyuria)/gi,
    /(?:urgency|urgency\s+to\s+urinate)/gi,
    /(?:dysuria|painful\s+urination)/gi,
    /(?:flank\s+pain|loin\s+pain|renal\s+pain)/gi,
    /(?:back\s+pain|lumbar\s+pain)/gi,
    /(?:joint\s+pain|arthralgia)/gi,
    /(?:muscle\s+cramp|cramping)/gi,
    /(?:restless\s+leg)/gi,
    /(?:numbness|tingling|paresthesia)/gi,
    /(?:blurred\s+vision|visual\s+disturbance)/gi,
    /(?:confusion|altered\s+sensorium|disorientation)/gi,
    /(?:weight\s+loss|unintentional\s+weight\s+loss)/gi,
    /(?:weight\s+gain)/gi,
    /(?:fever|pyrexia|high\s+temperature)/gi,
    /(?:cough|dry\s+cough|productive\s+cough)/gi,
    /(?:cold|intolerance)/gi,
    /(?:polydipsia|excessive\s+thirst)/gi,
    /(?:burning\s+micturition)/gi,
    /(?:raised\s+blood\s+pressure)/gi,
    /(?:pedal\s+edema|facial\s+swelling|periorbital\s+edema)/gi,
    /(?:ascites|abdominal\s+distension)/gi,
    /(?:hiccups|singultus)/gi,
    /(?:bad\s+taste\s+in\s+mouth|metallic\s+taste|dysgeusia)/gi,
    /(?:body\s+aches|myalgia)/gi,
    /(?:generalised\s+weakness|general\s+weakness)/gi,
    /(?:recent\s+(?:weight|wt)\s*(?:loss|gain))/gi,
  ];
  for (const p of complaintPatterns) {
    let m;
    while ((m = p.exec(text)) !== null) {
      const c = m[0].trim();
      if (c && !complaints.includes(c)) complaints.push(c);
    }
  }

  return { rawText: text, labValues, vitals, diagnoses, medicines, structuredMedicines, complaints };
}

async function preprocessImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 3000;
      const scale = Math.min(2, maxDim / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }
      ctx.putImageData(imageData, 0, 0);

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        resolve(blob || file);
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, useSystemFonts: true }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    if (fullText.trim().length < 20) {
      const result = await Tesseract.recognize(file, 'eng', {});
      return result.data.text;
    }
    return fullText;
  }

  if (file.type.startsWith('image/')) {
    const preprocessed = await preprocessImage(file);
    const result1 = await Tesseract.recognize(preprocessed, 'eng', {});
    const text1 = result1.data.text;

    if (text1.trim().length > 50) {
      return text1;
    }

    const result2 = await Tesseract.recognize(file, 'eng', {});
    return result2.data.text.length > text1.length ? result2.data.text : text1;
  }

  return '';
}

export async function processUploadedFiles(files: File[]): Promise<OCRResult> {
  let allText = '';
  for (const file of files) {
    const text = await extractTextFromFile(file);
    allText += text + '\n\n--- FILE SEPARATOR ---\n\n';
  }
  return parseExtractedText(allText);
}
