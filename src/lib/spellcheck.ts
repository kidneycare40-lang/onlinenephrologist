const MEDICAL_DICTIONARY: Record<string, string> = {
  // Common nephrology misspellings
  'dialisis': 'dialysis',
  'dialyis': 'dialysis',
  'dialysis': 'dialysis',
  'alysis': 'dialysis',
  'alisis': 'dialysis',
  'dialysia': 'dialysis',
  'dialysiss': 'dialysis',
  'dialyses': 'dialyses',
  'hemodialysis': 'haemodialysis',
  'predialysis': 'pre-dialysis',
  'predialitic': 'pre-dialytic',
  'interdialytic': 'interdialytic',
  'peridialytic': 'peridialytic',

  'kidney': 'kidney',
  'kidneys': 'kidneys',
  'kidny': 'kidney',
  'kidne': 'kidney',
  'kideny': 'kidney',
  'kiney': 'kidney',
  'kineyd': 'kidney',

  'nephrology': 'nephrology',
  'nephorology': 'nephrology',
  'nephrologist': 'nephrologist',
  'nephropathy': 'nephropathy',
  'nephropthy': 'nephropathy',
  'nephrotic': 'nephrotic',
  'nephritic': 'nephritic',
  'nephritis': 'nephritis',
  'nephrolithiasis': 'nephrolithiasis',
  'nephrolith': 'nephrolith',

  'bicarbonate': 'bicarbonate',
  'bicartonnate': 'bicarbonate',
  'bicarbonat': 'bicarbonate',
  'bicarbnate': 'bicarbonate',
  'bicarbonite': 'bicarbonate',
  'bicarinate': 'bicarbonate',
  'sodium bicabonate': 'sodium bicarbonate',
  'sodium bicarbonat': 'sodium bicarbonate',

  'creatinine': 'creatinine',
  'creatinene': 'creatinine',
  'creatine': 'creatinine',
  'creatinin': 'creatinine',
  'ceratinine': 'creatinine',

  'potassium': 'potassium',
  'potasium': 'potassium',
  'pottasium': 'potassium',

  'phosphorus': 'phosphorus',
  'phosphorous': 'phosphorus',
  'phosphrate': 'phosphate',

  'electrolytes': 'electrolytes',
  'electrolyte': 'electrolyte',
  'electroyltes': 'electrolytes',
  'electroylte': 'electrolyte',

  'hypertension': 'hypertension',
  'hypertention': 'hypertension',
  'hyper tension': 'hypertension',
  'hypotension': 'hypotension',
  'hypotention': 'hypotension',

  'diabetes': 'diabetes',
  'diabeties': 'diabetes',
  'diabetese': 'diabetes',
  'diabetic': 'diabetic',
  'diabetec': 'diabetic',

  'transplant': 'transplant',
  'transplat': 'transplant',
  'transplent': 'transplant',
  'trasplant': 'transplant',

  'erythropoietin': 'erythropoietin',
  'erythropoetin': 'erythropoietin',
  'erythopoietin': 'erythropoietin',
  'erythropioetin': 'erythropoietin',

  'sevelamer': 'sevelamer',
  'sevelamr': 'sevelamer',

  'calcitriol': 'calcitriol',
  'calcitral': 'calcitriol',
  'calcitrol': 'calcitriol',

  'albumin': 'albumin',
  'alubmin': 'albumin',
  'albiumin': 'albumin',
  'albuimn': 'albumin',

  'hemoglobin': 'haemoglobin',
  'hemaglobin': 'haemoglobin',
  'haemoglobin': 'haemoglobin',
  'hemogoblin': 'haemoglobin',

  'urine': 'urine',
  'urien': 'urine',
  'urinie': 'urine',

  'urinalysis': 'urinalysis',
  'urinanalysis': 'urinalysis',
  'urianalysis': 'urinalysis',

  'anemia': 'anaemia',
  'anaemia': 'anaemia',
  'anamia': 'anaemia',

  'edema': 'oedema',
  'oedema': 'oedema',
  'oedima': 'oedema',
  'edmea': 'oedema',

  'proteinuria': 'proteinuria',
  'proteinurea': 'proteinuria',
  'protienuria': 'proteinuria',

  'hematuria': 'haematuria',
  'haematuria': 'haematuria',
  'hemeturia': 'haematuria',

  'azotemia': 'azotaemia',
  'azotaemia': 'azotaemia',

  'uremia': 'uraemia',
  'uraemia': 'uraemia',
  'ureimia': 'uraemia',

  'gout': 'gout',
  'gaut': 'gout',

  'gfr': 'GFR',
  'egfr': 'eGFR',
  'egfR': 'eGFR',

  'dialyzer': 'dialyser',
  'catheter': 'catheter',
  'cathater': 'catheter',
  'cathter': 'catheter',

  'fistula': 'fistula',
  'fistual': 'fistula',
  'fistulla': 'fistula',

  'peritoneal': 'peritoneal',
  'peritonial': 'peritoneal',

  'ultrafiltration': 'ultrafiltration',
  'ultrafilatration': 'ultrafiltration',

  'erythropoiesis': 'erythropoiesis',

  'calcium': 'calcium',
  'calcuim': 'calcium',
  'calcum': 'calcium',

  'magnesium': 'magnesium',
  'magnesum': 'magnesium',

  'sodium': 'sodium',
  'soidum': 'sodium',
  'sodum': 'sodium',

  'glucose': 'glucose',
  'gloucose': 'glucose',
  'glucoase': 'glucose',

  'insulin': 'insulin',
  'insluin': 'insulin',
  'insuln': 'insulin',

  'folate': 'folate',
  'folvite': 'Folvite',
  'folic': 'folic',

  'hematocrit': 'haematocrit',
  'haematocrit': 'haematocrit',
  'hemtocrit': 'haematocrit',

  'bilirubin': 'bilirubin',
  'billirubin': 'bilirubin',
  'billrubin': 'bilirubin',

  'platelet': 'platelet',
  'platelets': 'platelets',
  'platelects': 'platelets',

  'potassium chloride': 'potassium chloride',
  'sodium bicarbonate': 'sodium bicarbonate',

  'regular': 'regular',
  'reguar': 'regular',
  'regulr': 'regular',
  'reguluar': 'regular',

  'thrice': 'thrice',
  'thrist': 'thrice',

  'weekly': 'weekly',
  'weakly': 'weekly',

  'monthly': 'monthly',

  'diarrhea': 'diarrhoea',
  'diarrhoea': 'diarrhoea',
  'diarhoea': 'diarrhoea',
  'diarreah': 'diarrhoea',

  'constipation': 'constipation',
  'constipaton': 'constipation',

  'nausea': 'nausea',
  'nausia': 'nausea',

  'vomiting': 'vomiting',
  'vomitting': 'vomiting',
  'vomting': 'vomiting',

  'fatigue': 'fatigue',
  'fatique': 'fatigue',
  'fatige': 'fatigue',

  'weakness': 'weakness',
  'weaknes': 'weakness',
  'weaknss': 'weakness',

  'pruritus': 'pruritus',
  'pruritis': 'pruritus',

  'swelling': 'swelling',
  'sweling': 'swelling',

  'breathlessness': 'breathlessness',
  'breathlessnes': 'breathlessness',
  'breathlesness': 'breathlessness',

  'anorexia': 'anorexia',

  'follow up': 'follow-up',
  'followup': 'follow-up',
  'follow-up': 'follow-up',

  'laboratory': 'laboratory',
  'labratory': 'laboratory',
  'labortory': 'laboratory',

  'ultrasound': 'ultrasound',
  'ultrasonography': 'ultrasonography',
  'ultrsound': 'ultrasound',

  'antihypertensive': 'antihypertensive',
  'antihypertensives': 'antihypertensives',

  'phosphate binder': 'phosphate binder',
  'phosphate binders': 'phosphate binders',

  'iron sucrose': 'iron sucrose',

  'tacrolimus': 'tacrolimus',

  'mycophenolate': 'mycophenolate',
  'mycophenolate mofetil': 'mycophenolate mofetil',

  'pantoprazole': 'pantoprazole',
  'pantoprezole': 'pantoprazole',
  'pantoprazle': 'pantoprazole',

  'amlodipine': 'amlodipine',
  'amlopdipine': 'amlodipine',
  'amlodipene': 'amlodipine',

  'telmisartan': 'telmisartan',
  'telimestran': 'telmisartan',

  'losartan': 'losartan',
  'loserton': 'losartan',

  'metformin': 'metformin',
  'metforman': 'metformin',

  'atorvastatin': 'atorvastatin',
  'atorvastin': 'atorvastatin',

  'aspirin': 'aspirin',

  'clopidogrel': 'clopidogrel',
  'clopidogral': 'clopidogrel',

  'furosemide': 'furosemide',
  'frusemide': 'furosemide',

  'spironolactone': 'spironolactone',

  'chlorthalidone': 'chlorthalidone',

  'acetazolamide': 'acetazolamide',

  'lanthanum': 'lanthanum',
  'lanthanum carbonate': 'lanthanum carbonate',

  'epoetin': 'epoetin',
  'epoetin alfa': 'epoetin alfa',

  'darbepoetin': 'darbepoetin',
  'darbepoetin alfa': 'darbepoetin alfa',

  'tenofovir': 'tenofovir',
  'entecavir': 'entecavir',

  'omeprazole': 'omeprazole',
  'omeprezole': 'omeprazole',

  'esomeprazole': 'esomeprazole',

  'iron deficiency': 'iron deficiency',
  'iron defeciency': 'iron deficiency',

  'anemia of chronic disease': 'anaemia of chronic disease',

  'resistant hypertension': 'resistant hypertension',
  'resistent hypertension': 'resistant hypertension',

  'renal': 'renal',
  'renl': 'renal',
  'renal failure': 'renal failure',
  'renal impairement': 'renal impairment',

  'chronic kidney disease': 'chronic kidney disease',
  'chronic renal disease': 'chronic renal disease',
  'ckd': 'CKD',

  'polycystic kidney disease': 'polycystic kidney disease',

  'acute kidney injury': 'acute kidney injury',
  'aki': 'AKI',

  'diabetic nephropathy': 'diabetic nephropathy',
  'diabetic kidney disease': 'diabetic kidney disease',

  'lupus nephritis': 'lupus nephritis',

  'iga nephropathy': 'IgA nephropathy',

  'focal segmental glomerulosclerosis': 'focal segmental glomerulosclerosis',
  'fsgs': 'FSGS',

  'membranous nephropathy': 'membranous nephropathy',

  'minimal change disease': 'minimal change disease',

  'bartter syndrome': 'Bartter syndrome',

  'gitelman syndrome': 'Gitelman syndrome',

  'alport syndrome': 'Alport syndrome',

  'medullary cystic disease': 'medullary cystic disease',

  'nephrosclerosis': 'nephrosclerosis',

  'hydronephrosis': 'hydronephrosis',
  'hydro nephrosis': 'hydronephrosis',


  'pyelonephritis': 'pyelonephritis',
  'pylonephritis': 'pyelonephritis',
  'pielonephritis': 'pyelonephritis',

  'cystitis': 'cystitis',

  'glomerulonephritis': 'glomerulonephritis',
  'glomerulonephrits': 'glomerulonephritis',

  'renal calculus': 'renal calculus',
  'renal calculi': 'renal calculi',

  'ureteric calculus': 'ureteric calculus',

  'vesicoureteric reflux': 'vesicoureteric reflux',
  'vesicouretral reflux': 'vesicoureteric reflux',

  'haemodialysis': 'haemodialysis',
  'haemodialisis': 'haemodialysis',

  'peritoneal dialysis': 'peritoneal dialysis',
  'capd': 'CAPD',

  'renal biopsy': 'renal biopsy',

  'renal transplant': 'renal transplant',
  'kidney transplant': 'kidney transplant',

  'vascular access': 'vascular access',
  'av fistula': 'AV fistula',
  'av graft': 'AV graft',

  'dialysis access': 'dialysis access',

  'interdialytic weight gain': 'interdialytic weight gain',

  'dry weight': 'dry weight',


  'kussmaul breathing': 'Kussmaul breathing',

  'rest as before': 'Rest as before',
  'rest in bed': 'Rest in bed',

  'regular follow': 'regular follow-up',
  'regular follw up': 'regular follow-up',
  'regular folow up': 'regular follow-up',
  'regular f/u': 'regular follow-up',

  'cbc': 'CBC',
  'kft': 'KFT',
  'lft': 'LFT',
  'rft': 'RFT',
};

export function autoCorrect(text: string): string {
  if (!text || text.length < 2) return text;
  let result = text;
  const entries = Object.entries(MEDICAL_DICTIONARY);
  for (const [wrong, correct] of entries) {
    if (wrong === correct) continue;
    const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
    result = result.replace(regex, (match) => {
      if (match === correct) return match;
      if (match[0] === match[0].toUpperCase() && correct[0] === correct[0].toLowerCase()) {
        return correct.charAt(0).toUpperCase() + correct.slice(1);
      }
      return correct;
    });
  }
  return result;
}
