/**
 * AI Medicine Suggestion Engine for Nephrology
 * Rule-based smart suggestions based on diagnosis, CKD stage, and clinical context
 */

export interface MedicineSuggestion {
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  route: string;
  reason: string;
  category: string;
  priority: number; // 1 = most common/first-line
}

export interface DiagnosisMedicineMap {
  diagnosis: string;
  keywords: string[];
  ckdStages?: number[];
  medicines: MedicineSuggestion[];
}

export const diagnosisMedicineMaps: DiagnosisMedicineMap[] = [
  // CKD / Chronic Kidney Disease
  {
    diagnosis: 'Chronic Kidney Disease',
    keywords: ['ckd', 'chronic kidney', 'renal failure', 'kidney disease', 'ckd stage'],
    medicines: [
      { name: 'Telmesartan', genericName: 'Telmesartan', dosage: '40mg', frequency: 'Once daily', route: 'Oral', reason: 'RAAS blockade - renoprotective', category: 'BP/Renal', priority: 1 },
      { name: 'Telmesartan', genericName: 'Telmesartan', dosage: '80mg', frequency: 'Once daily', route: 'Oral', reason: 'RAAS blockade - higher dose for proteinuria', category: 'BP/Renal', priority: 2 },
      { name: 'Sevelamer', genericName: 'Sevelamer Carbonate', dosage: '800mg', frequency: '3 times/day', route: 'Oral', reason: 'Phosphate binder - controls hyperphosphatemia', category: 'Bone/Mineral', priority: 1 },
      { name: 'Calcitriol', genericName: 'Calcitriol', dosage: '0.25mcg', frequency: 'Once daily', route: 'Oral', reason: 'Active Vitamin D - secondary hyperparathyroidism', category: 'Bone/Mineral', priority: 1 },
      { name: 'Calcium Carbonate', genericName: 'Calcium Carbonate', dosage: '500mg', frequency: 'Twice daily', route: 'Oral', reason: 'Phosphate binder + calcium supplement', category: 'Bone/Mineral', priority: 2 },
      { name: 'Epoetin Alfa', genericName: 'Erythropoietin', dosage: '4000 IU', frequency: '3 times/week', route: 'SC', reason: 'ESAs for renal anemia (Hb <10)', category: 'Anemia', priority: 1 },
      { name: 'Iron Sucrose', genericName: 'Iron Sucrose', dosage: '100mg', frequency: '3 times/week', route: 'IV', reason: 'IV iron for ESA hyporesponsiveness', category: 'Anemia', priority: 1 },
      { name: 'Furosemide', genericName: 'Furosemide', dosage: '40mg', frequency: 'Once daily', route: 'Oral', reason: 'Diuretic for volume overload/edema', category: 'Diuretic', priority: 1 },
      { name: 'Furosemide', genericName: 'Furosemide', dosage: '80mg', frequency: 'Once daily', route: 'Oral', reason: 'Higher dose diuretic for refractory edema', category: 'Diuretic', priority: 2 },
      { name: 'Metformin', genericName: 'Metformin HCl', dosage: '500mg', frequency: 'Twice daily', route: 'Oral', reason: 'First-line for DM with CKD (eGFR >30)', category: 'Diabetes', priority: 1 },
      { name: 'Dapagliflozin', genericName: 'Dapagliflozin', dosage: '10mg', frequency: 'Once daily', route: 'Oral', reason: 'SGLT2i - renoprotective in CKD', category: 'Renoprotective', priority: 1 },
      { name: 'Empagliflozin', genericName: 'Empagliflozin', dosage: '10mg', frequency: 'Once daily', route: 'Oral', reason: 'SGLT2i - renoprotective in CKD', category: 'Renoprotective', priority: 2 },
    ],
  },
  // Diabetic Nephropathy
  {
    diagnosis: 'Diabetic Nephropathy',
    keywords: ['diabetic nephropathy', 'diabetic kidney', 'dkd', 'dm nephropathy', 'diabetes with kidney'],
    medicines: [
      { name: 'Dapagliflozin', genericName: 'Dapagliflozin', dosage: '10mg', frequency: 'Once daily', route: 'Oral', reason: 'SGLT2i - first-line renoprotective in DKD', category: 'Renoprotective', priority: 1 },
      { name: 'Empagliflozin', genericName: 'Empagliflozin', dosage: '10mg', frequency: 'Once daily', route: 'Oral', reason: 'SGLT2i - renoprotective in DKD', category: 'Renoprotective', priority: 2 },
      { name: 'Telmesartan', genericName: 'Telmesartan', dosage: '40mg', frequency: 'Once daily', route: 'Oral', reason: 'RAAS blockade for proteinuria', category: 'BP/Renal', priority: 1 },
      { name: 'Metformin', genericName: 'Metformin HCl', dosage: '500mg', frequency: 'Twice daily', route: 'Oral', reason: 'First-line DM agent (eGFR >30)', category: 'Diabetes', priority: 1 },
      { name: 'Sitagliptin', genericName: 'Sitagliptin', dosage: '100mg', frequency: 'Once daily', route: 'Oral', reason: 'DPP4i - safe in CKD, no hypoglycemia', category: 'Diabetes', priority: 2 },
      { name: 'Insulin', genericName: 'Human Insulin', dosage: 'As directed', frequency: 'As directed', route: 'SC', reason: 'Safe in advanced CKD', category: 'Diabetes', priority: 3 },
      { name: 'Sevelamer', genericName: 'Sevelamer Carbonate', dosage: '800mg', frequency: '3 times/day', route: 'Oral', reason: 'Phosphate binder', category: 'Bone/Mineral', priority: 1 },
    ],
  },
  // Hypertension
  {
    diagnosis: 'Hypertension',
    keywords: ['hypertension', 'high blood pressure', 'htn', 'bp high', 'blood pressure'],
    medicines: [
      { name: 'Telmesartan', genericName: 'Telmesartan', dosage: '40mg', frequency: 'Once daily', route: 'Oral', reason: 'ARB - first-line, renoprotective', category: 'BP/Renal', priority: 1 },
      { name: 'Amlodipine', genericName: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', route: 'Oral', reason: 'CCB - add-on for BP control', category: 'BP/Renal', priority: 1 },
      { name: 'Amlodipine', genericName: 'Amlodipine', dosage: '10mg', frequency: 'Once daily', route: 'Oral', reason: 'CCB - higher dose', category: 'BP/Renal', priority: 2 },
      { name: 'Metoprolol', genericName: 'Metoprolol Succinate', dosage: '25mg', frequency: 'Once daily', route: 'Oral', reason: 'Beta-blocker - rate control + BP', category: 'Cardiac', priority: 2 },
      { name: 'Metoprolol', genericName: 'Metoprolol Succinate', dosage: '50mg', frequency: 'Once daily', route: 'Oral', reason: 'Beta-blocker - higher dose', category: 'Cardiac', priority: 3 },
      { name: 'Nifedipine', genericName: 'Nifedipine', dosage: '30mg', frequency: 'Once daily', route: 'Oral', reason: 'Long-acting CCB', category: 'BP/Renal', priority: 3 },
    ],
  },
  // Nephrotic Syndrome
  {
    diagnosis: 'Nephrotic Syndrome',
    keywords: ['nephrotic', 'nephrotic syndrome', 'proteinuria', 'minimal change', 'membranous'],
    medicines: [
      { name: 'Telmesartan', genericName: 'Telmesartan', dosage: '80mg', frequency: 'Once daily', route: 'Oral', reason: 'ARB - antiproteinuric effect', category: 'BP/Renal', priority: 1 },
      { name: 'Furosemide', genericName: 'Furosemide', dosage: '40mg', frequency: 'Once daily', route: 'Oral', reason: 'Diuretic for edema', category: 'Diuretic', priority: 1 },
      { name: 'Furosemide', genericName: 'Furosemide', dosage: '80mg', frequency: 'Once daily', route: 'Oral', reason: 'Higher diuretic dose for severe edema', category: 'Diuretic', priority: 2 },
      { name: 'Calcium Carbonate', genericName: 'Calcium Carbonate', dosage: '500mg', frequency: 'Twice daily', route: 'Oral', reason: 'Albumin-bound calcium supplementation', category: 'Bone/Mineral', priority: 1 },
      { name: 'Atorvastatin', genericName: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', route: 'Oral', reason: 'Statin for dyslipidemia in nephrotic syndrome', category: 'Lipid', priority: 1 },
      { name: 'Warfarin', genericName: 'Warfarin', dosage: 'As per INR', frequency: 'Once daily', route: 'Oral', reason: 'Anticoagulation for severe nephrotic syndrome', category: 'Anticoagulant', priority: 3 },
    ],
  },
  // Acute Kidney Injury
  {
    diagnosis: 'Acute Kidney Injury',
    keywords: ['aki', 'acute kidney', 'acute renal', 'acute renal failure', 'arF'],
    medicines: [
      { name: 'Furosemide', genericName: 'Furosemide', dosage: '80mg', frequency: 'Twice daily', route: 'Oral', reason: 'Diuresis in oliguric AKI', category: 'Diuretic', priority: 1 },
      { name: 'Sodium Bicarbonate', genericName: 'Sodium Bicarbonate', dosage: '500mg', frequency: '3 times/day', route: 'Oral', reason: 'Correct metabolic acidosis', category: 'Metabolic', priority: 1 },
      { name: 'Calcium Carbonate', genericName: 'Calcium Carbonate', dosage: '500mg', frequency: '3 times/day', route: 'Oral', reason: 'Treat acute hyperkalemia (emergency)', category: 'Emergency', priority: 1 },
      { name: 'Insulin', genericName: 'Human Insulin', dosage: '10 units', frequency: 'STAT', route: 'IV', reason: 'Emergency treatment of hyperkalemia', category: 'Emergency', priority: 1 },
    ],
  },
  // Dialysis
  {
    diagnosis: 'Dialysis',
    keywords: ['dialysis', 'hemodialysis', 'hd', 'peritoneal dialysis', 'pd', 'maintenance dialysis'],
    medicines: [
      { name: 'Sevelamer', genericName: 'Sevelamer Carbonate', dosage: '800mg', frequency: '3 times/day', route: 'Oral', reason: 'Phosphate binder - pre-dialysis/inter-dialysis', category: 'Bone/Mineral', priority: 1 },
      { name: 'Calcitriol', genericName: 'Calcitriol', dosage: '0.25mcg', frequency: 'Once daily', route: 'Oral', reason: 'Active Vitamin D supplementation', category: 'Bone/Mineral', priority: 1 },
      { name: 'Epoetin Alfa', genericName: 'Erythropoietin', dosage: '4000 IU', frequency: '3 times/week', route: 'SC', reason: 'ESA for dialysis anemia', category: 'Anemia', priority: 1 },
      { name: 'Iron Sucrose', genericName: 'Iron Sucrose', dosage: '100mg', frequency: '3 times/week', route: 'IV', reason: 'IV iron post-dialysis', category: 'Anemia', priority: 1 },
      { name: 'Calcium Carbonate', genericName: 'Calcium Carbonate', dosage: '500mg', frequency: 'Twice daily', route: 'Oral', reason: 'Calcium supplementation', category: 'Bone/Mineral', priority: 2 },
      { name: 'Furosemide', genericName: 'Furosemide', dosage: '80mg', frequency: 'Once daily', route: 'Oral', reason: 'Residual renal function preservation', category: 'Diuretic', priority: 2 },
    ],
  },
  // Kidney Stones / Nephrolithiasis
  {
    diagnosis: 'Nephrolithiasis',
    keywords: ['kidney stone', 'renal stone', 'nephrolithiasis', 'urolithiasis', 'calculus'],
    medicines: [
      { name: 'Tamsulosin', genericName: 'Tamsulosin', dosage: '0.4mg', frequency: 'Once daily', route: 'Oral', reason: 'Alpha-blocker - stone expulsion therapy', category: 'Urological', priority: 1 },
      { name: 'Silodosin', genericName: 'Silodosin', dosage: '8mg', frequency: 'Once daily', route: 'Oral', reason: 'Alpha-blocker - alternative for stone passage', category: 'Urological', priority: 2 },
      { name: 'Diclofenac', genericName: 'Diclofenac Sodium', dosage: '50mg', frequency: '3 times/day', route: 'Oral', reason: 'NSAID for renal colic pain', category: 'Pain', priority: 1 },
      { name: 'Paracetamol', genericName: 'Paracetamol', dosage: '500mg', frequency: 'As needed', route: 'Oral', reason: 'Analgesic - safe in kidney stones', category: 'Pain', priority: 2 },
      { name: 'Potassium Citrate', genericName: 'Potassium Citrate', dosage: '10mL', frequency: 'Twice daily', route: 'Oral', reason: 'Alkalinize urine for uric acid stones', category: 'Metabolic', priority: 1 },
    ],
  },
  // Gout / Hyperuricemia
  {
    diagnosis: 'Gout',
    keywords: ['gout', 'hyperuricemia', 'uric acid', 'gouty arthritis', 'urate'],
    medicines: [
      { name: 'Febuxostat', genericName: 'Febuxostat', dosage: '40mg', frequency: 'Once daily', route: 'Oral', reason: 'XOI - urate lowering therapy (CKD safe)', category: 'Urate', priority: 1 },
      { name: 'Febuxostat', genericName: 'Febuxostat', dosage: '80mg', frequency: 'Once daily', route: 'Oral', reason: 'XOI - higher dose if target not achieved', category: 'Urate', priority: 2 },
      { name: 'Allopurinol', genericName: 'Allopurinol', dosage: '100mg', frequency: 'Once daily', route: 'Oral', reason: 'XOI - urate lowering (dose adjust in CKD)', category: 'Urate', priority: 2 },
      { name: 'Colchicine', genericName: 'Colchicine', dosage: '0.5mg', frequency: 'Twice daily', route: 'Oral', reason: 'Acute gout flare prophylaxis', category: 'Anti-inflammatory', priority: 1 },
      { name: 'Diclofenac', genericName: 'Diclofenac Sodium', dosage: '50mg', frequency: '3 times/day', route: 'Oral', reason: 'NSAID for acute gout (if eGFR >30)', category: 'Anti-inflammatory', priority: 2 },
    ],
  },
  // Polycystic Kidney Disease
  {
    diagnosis: 'PKD',
    keywords: ['polycystic kidney', 'pkd', 'autosomal dominant', 'adpkd', 'cystic kidney'],
    medicines: [
      { name: 'Telmesartan', genericName: 'Telmesartan', dosage: '80mg', frequency: 'Once daily', route: 'Oral', reason: 'BP control - target <110/75', category: 'BP/Renal', priority: 1 },
      { name: 'Tolvaptan', genericName: 'Tolvaptan', dosage: '45mg', frequency: 'Once daily', route: 'Oral', reason: 'V2 receptor antagonist - slows cyst growth', category: 'Disease-modifying', priority: 1 },
      { name: 'Amlodipine', genericName: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', route: 'Oral', reason: 'Add-on BP control', category: 'BP/Renal', priority: 2 },
    ],
  },
  // Glomerulonephritis
  {
    diagnosis: 'Glomerulonephritis',
    keywords: ['glomerulonephritis', 'gn', 'iga nephropathy', 'lupus nephritis', 'fsgs', 'mpgn'],
    medicines: [
      { name: 'Telmesartan', genericName: 'Telmesartan', dosage: '80mg', frequency: 'Once daily', route: 'Oral', reason: 'ARB - antiproteinuric', category: 'BP/Renal', priority: 1 },
      { name: 'Furosemide', genericName: 'Furosemide', dosage: '40mg', frequency: 'Once daily', route: 'Oral', reason: 'Diuretic for edema', category: 'Diuretic', priority: 1 },
      { name: 'Dapagliflozin', genericName: 'Dapagliflozin', dosage: '10mg', frequency: 'Once daily', route: 'Oral', reason: 'SGLT2i - renoprotective in GN', category: 'Renoprotective', priority: 1 },
      { name: 'Atorvastatin', genericName: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', route: 'Oral', reason: 'Cardiovascular risk reduction', category: 'Lipid', priority: 2 },
    ],
  },
  // Uremia / Advanced CKD (Stage 4-5)
  {
    diagnosis: 'Uremia',
    keywords: ['uremia', 'uraemia', 'stage 5', 'end stage', 'esrd', 'stage 4', 'advanced ckd'],
    medicines: [
      { name: 'Sevelamer', genericName: 'Sevelamer Carbonate', dosage: '800mg', frequency: '3 times/day', route: 'Oral', reason: 'Phosphate binder - essential in advanced CKD', category: 'Bone/Mineral', priority: 1 },
      { name: 'Calcitriol', genericName: 'Calcitriol', dosage: '0.25mcg', frequency: 'Once daily', route: 'Oral', reason: 'Active Vitamin D', category: 'Bone/Mineral', priority: 1 },
      { name: 'Epoetin Alfa', genericName: 'Erythropoietin', dosage: '4000 IU', frequency: '3 times/week', route: 'SC', reason: 'ESA for anemia', category: 'Anemia', priority: 1 },
      { name: 'Iron Sucrose', genericName: 'Iron Sucrose', dosage: '100mg', frequency: '3 times/week', route: 'IV', reason: 'IV iron for ESA hyporesponsiveness', category: 'Anemia', priority: 1 },
      { name: 'Pantoprazole', genericName: 'Pantoprazole', dosage: '40mg', frequency: 'Once daily', route: 'Oral', reason: 'GI prophylaxis in uremia', category: 'GI', priority: 1 },
      { name: 'Furosemide', genericName: 'Furosemide', dosage: '80mg', frequency: 'Once daily', route: 'Oral', reason: 'Maintain urine output', category: 'Diuretic', priority: 2 },
    ],
  },
  // Renal Transplant
  {
    diagnosis: 'Transplant',
    keywords: ['transplant', 'kidney transplant', 'renal transplant', 'graft'],
    medicines: [
      { name: 'Tacrolimus', genericName: 'Tacrolimus', dosage: '1mg', frequency: 'Twice daily', route: 'Oral', reason: 'Calcineurin inhibitor - immunosuppression', category: 'Immunosuppressant', priority: 1 },
      { name: 'Mycophenolate', genericName: 'Mycophenolate Mofetil', dosage: '500mg', frequency: 'Twice daily', route: 'Oral', reason: 'Antiproliferative - immunosuppression', category: 'Immunosuppressant', priority: 1 },
      { name: 'Prednisolone', genericName: 'Prednisolone', dosage: '5mg', frequency: 'Once daily', route: 'Oral', reason: 'Corticosteroid - maintenance immunosuppression', category: 'Immunosuppressant', priority: 1 },
      { name: 'Pantoprazole', genericName: 'Pantoprazole', dosage: '40mg', frequency: 'Once daily', route: 'Oral', reason: 'GI prophylaxis on immunosuppression', category: 'GI', priority: 1 },
    ],
  },
  // Proteinuria
  {
    diagnosis: 'Proteinuria',
    keywords: ['proteinuria', 'proteinuria', 'albuminuria', 'microalbuminuria', 'protein leak'],
    medicines: [
      { name: 'Telmesartan', genericName: 'Telmesartan', dosage: '80mg', frequency: 'Once daily', route: 'Oral', reason: 'ARB - reduces proteinuria', category: 'BP/Renal', priority: 1 },
      { name: 'Dapagliflozin', genericName: 'Dapagliflozin', dosage: '10mg', frequency: 'Once daily', route: 'Oral', reason: 'SGLT2i - reduces albuminuria', category: 'Renoprotective', priority: 1 },
      { name: 'Empagliflozin', genericName: 'Empagliflozin', dosage: '10mg', frequency: 'Once daily', route: 'Oral', reason: 'SGLT2i - reduces albuminuria', category: 'Renoprotective', priority: 2 },
    ],
  },
  // Anemia of CKD
  {
    diagnosis: 'Anemia',
    keywords: ['anemia', 'low hemoglobin', 'low hb', 'renal anemia', 'iron deficiency'],
    medicines: [
      { name: 'Epoetin Alfa', genericName: 'Erythropoietin', dosage: '4000 IU', frequency: '3 times/week', route: 'SC', reason: 'ESA - target Hb 10-11.5', category: 'Anemia', priority: 1 },
      { name: 'Iron Sucrose', genericName: 'Iron Sucrose', dosage: '100mg', frequency: '3 times/week', route: 'IV', reason: 'IV iron - first correct iron stores', category: 'Anemia', priority: 1 },
    ],
  },
  // Hyperkalemia
  {
    diagnosis: 'Hyperkalemia',
    keywords: ['hyperkalemia', 'high potassium', 'high k', 'potassium'],
    medicines: [
      { name: 'Calcium Carbonate', genericName: 'Calcium Carbonate', dosage: '500mg', frequency: '3 times/day', route: 'Oral', reason: 'GI potassium binder', category: 'Metabolic', priority: 1 },
      { name: 'Sodium Bicarbonate', genericName: 'Sodium Bicarbonate', dosage: '500mg', frequency: '3 times/day', route: 'Oral', reason: 'Correct acidosis driving K+', category: 'Metabolic', priority: 1 },
      { name: 'Furosemide', genericName: 'Furosemide', dosage: '40mg', frequency: 'Once daily', route: 'Oral', reason: 'Renal K+ excretion', category: 'Diuretic', priority: 2 },
    ],
  },
  // Metabolic Acidosis
  {
    diagnosis: 'Metabolic Acidosis',
    keywords: ['metabolic acidosis', 'acidosis', 'low bicarbonate', 'bicarbonate'],
    medicines: [
      { name: 'Sodium Bicarbonate', genericName: 'Sodium Bicarbonate', dosage: '500mg', frequency: '3 times/day', route: 'Oral', reason: 'Oral bicarb supplementation', category: 'Metabolic', priority: 1 },
    ],
  },
  // Renal calculi pain
  {
    diagnosis: 'Renal Colic',
    keywords: ['renal colic', 'colic', 'kidney pain', 'flank pain', 'ureteric colic'],
    medicines: [
      { name: 'Diclofenac', genericName: 'Diclofenac Sodium', dosage: '75mg', frequency: 'Twice daily', route: 'Oral', reason: 'NSAID - first-line for renal colic', category: 'Pain', priority: 1 },
      { name: 'Drotaverine', genericName: 'Drotaverine', dosage: '80mg', frequency: '3 times/day', route: 'Oral', reason: 'Antispasmodic for colic', category: 'Pain', priority: 2 },
      { name: 'Tamsulosin', genericName: 'Tamsulosin', dosage: '0.4mg', frequency: 'Once daily', route: 'Oral', reason: 'Alpha-blocker for stone passage', category: 'Urological', priority: 1 },
    ],
  },
];

/**
 * Nephrology-specific medicine database for fuzzy matching
 */
export const nephrologyMedicines: MedicineSuggestion[] = [
  // BP / Renal
  { name: 'Telmesartan', genericName: 'Telmesartan', dosage: '40mg', frequency: 'Once daily', route: 'Oral', reason: 'ARB', category: 'BP/Renal', priority: 1 },
  { name: 'Telmesartan', genericName: 'Telmesartan', dosage: '80mg', frequency: 'Once daily', route: 'Oral', reason: 'ARB high dose', category: 'BP/Renal', priority: 2 },
  { name: 'Amlodipine', genericName: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', route: 'Oral', reason: 'CCB', category: 'BP/Renal', priority: 1 },
  { name: 'Amlodipine', genericName: 'Amlodipine', dosage: '10mg', frequency: 'Once daily', route: 'Oral', reason: 'CCB high dose', category: 'BP/Renal', priority: 2 },
  { name: 'Losartan', genericName: 'Losartan Potassium', dosage: '50mg', frequency: 'Once daily', route: 'Oral', reason: 'ARB', category: 'BP/Renal', priority: 2 },
  { name: 'Nifedipine', genericName: 'Nifedipine', dosage: '30mg', frequency: 'Once daily', route: 'Oral', reason: 'Long-acting CCB', category: 'BP/Renal', priority: 3 },
  { name: 'Metoprolol', genericName: 'Metoprolol Succinate', dosage: '50mg', frequency: 'Once daily', route: 'Oral', reason: 'Beta-blocker', category: 'Cardiac', priority: 2 },
  { name: 'Carvedilol', genericName: 'Carvedilol', dosage: '6.25mg', frequency: 'Twice daily', route: 'Oral', reason: 'Alpha+beta blocker', category: 'Cardiac', priority: 3 },

  // Renoprotective
  { name: 'Dapagliflozin', genericName: 'Dapagliflozin', dosage: '10mg', frequency: 'Once daily', route: 'Oral', reason: 'SGLT2i - renoprotective', category: 'Renoprotective', priority: 1 },
  { name: 'Empagliflozin', genericName: 'Empagliflozin', dosage: '10mg', frequency: 'Once daily', route: 'Oral', reason: 'SGLT2i - renoprotective', category: 'Renoprotective', priority: 2 },

  // Diabetes
  { name: 'Metformin', genericName: 'Metformin HCl', dosage: '500mg', frequency: 'Twice daily', route: 'Oral', reason: 'First-line DM', category: 'Diabetes', priority: 1 },
  { name: 'Metformin', genericName: 'Metformin HCl', dosage: '1000mg', frequency: 'Twice daily', route: 'Oral', reason: 'Higher dose DM', category: 'Diabetes', priority: 2 },
  { name: 'Glimepiride', genericName: 'Glimepiride', dosage: '2mg', frequency: 'Once daily', route: 'Oral', reason: 'SU - second-line DM', category: 'Diabetes', priority: 3 },
  { name: 'Sitagliptin', genericName: 'Sitagliptin', dosage: '100mg', frequency: 'Once daily', route: 'Oral', reason: 'DPP4i - CKD safe', category: 'Diabetes', priority: 2 },

  // Bone/Mineral
  { name: 'Sevelamer', genericName: 'Sevelamer Carbonate', dosage: '800mg', frequency: '3 times/day', route: 'Oral', reason: 'Phosphate binder', category: 'Bone/Mineral', priority: 1 },
  { name: 'Calcium Carbonate', genericName: 'Calcium Carbonate', dosage: '500mg', frequency: 'Twice daily', route: 'Oral', reason: 'Calcium supplement', category: 'Bone/Mineral', priority: 1 },
  { name: 'Calcitriol', genericName: 'Calcitriol', dosage: '0.25mcg', frequency: 'Once daily', route: 'Oral', reason: 'Active Vitamin D', category: 'Bone/Mineral', priority: 1 },

  // Anemia
  { name: 'Epoetin Alfa', genericName: 'Erythropoietin', dosage: '4000 IU', frequency: '3 times/week', route: 'SC', reason: 'ESA for anemia', category: 'Anemia', priority: 1 },
  { name: 'Iron Sucrose', genericName: 'Iron Sucrose', dosage: '100mg', frequency: '3 times/week', route: 'IV', reason: 'IV iron', category: 'Anemia', priority: 1 },

  // Diuretics
  { name: 'Furosemide', genericName: 'Furosemide', dosage: '40mg', frequency: 'Once daily', route: 'Oral', reason: 'Loop diuretic', category: 'Diuretic', priority: 1 },
  { name: 'Furosemide', genericName: 'Furosemide', dosage: '80mg', frequency: 'Once daily', route: 'Oral', reason: 'High dose diuretic', category: 'Diuretic', priority: 2 },

  // Uric Acid / Gout
  { name: 'Febuxostat', genericName: 'Febuxostat', dosage: '40mg', frequency: 'Once daily', route: 'Oral', reason: 'XOI - CKD safe', category: 'Urate', priority: 1 },
  { name: 'Febuxostat', genericName: 'Febuxostat', dosage: '80mg', frequency: 'Once daily', route: 'Oral', reason: 'XOI higher dose', category: 'Urate', priority: 2 },
  { name: 'Allopurinol', genericName: 'Allopurinol', dosage: '100mg', frequency: 'Once daily', route: 'Oral', reason: 'XOI', category: 'Urate', priority: 2 },
  { name: 'Colchicine', genericName: 'Colchicine', dosage: '0.5mg', frequency: 'Twice daily', route: 'Oral', reason: 'Gout prophylaxis', category: 'Anti-inflammatory', priority: 1 },

  // Urological
  { name: 'Tamsulosin', genericName: 'Tamsulosin', dosage: '0.4mg', frequency: 'Once daily', route: 'Oral', reason: 'Alpha-blocker for stones', category: 'Urological', priority: 1 },
  { name: 'Silodosin', genericName: 'Silodosin', dosage: '8mg', frequency: 'Once daily', route: 'Oral', reason: 'Alpha-blocker for stones', category: 'Urological', priority: 2 },

  // Pain
  { name: 'Diclofenac', genericName: 'Diclofenac Sodium', dosage: '50mg', frequency: '3 times/day', route: 'Oral', reason: 'NSAID', category: 'Pain', priority: 1 },
  { name: 'Paracetamol', genericName: 'Paracetamol', dosage: '500mg', frequency: 'As needed', route: 'Oral', reason: 'Analgesic', category: 'Pain', priority: 1 },
  { name: 'Pregabalin', genericName: 'Pregabalin', dosage: '75mg', frequency: 'Twice daily', route: 'Oral', reason: 'Neuropathic pain', category: 'Pain', priority: 2 },
  { name: 'Gabapentin', genericName: 'Gabapentin', dosage: '300mg', frequency: '3 times/day', route: 'Oral', reason: 'Neuropathic pain', category: 'Pain', priority: 3 },

  // GI
  { name: 'Pantoprazole', genericName: 'Pantoprazole', dosage: '40mg', frequency: 'Once daily', route: 'Oral', reason: 'PPI - GI protection', category: 'GI', priority: 1 },
  { name: 'Ondansetron', genericName: 'Ondansetron', dosage: '4mg', frequency: 'As needed', route: 'Oral', reason: 'Antiemetic', category: 'GI', priority: 1 },

  // Transplant
  { name: 'Tacrolimus', genericName: 'Tacrolimus', dosage: '1mg', frequency: 'Twice daily', route: 'Oral', reason: 'CNI immunosuppression', category: 'Immunosuppressant', priority: 1 },
  { name: 'Mycophenolate', genericName: 'Mycophenolate Mofetil', dosage: '500mg', frequency: 'Twice daily', route: 'Oral', reason: 'Antiproliferative', category: 'Immunosuppressant', priority: 1 },
  { name: 'Prednisolone', genericName: 'Prednisolone', dosage: '5mg', frequency: 'Once daily', route: 'Oral', reason: 'Steroid maintenance', category: 'Immunosuppressant', priority: 1 },

  // Metabolic
  { name: 'Sodium Bicarbonate', genericName: 'Sodium Bicarbonate', dosage: '500mg', frequency: '3 times/day', route: 'Oral', reason: 'Correct acidosis', category: 'Metabolic', priority: 1 },
  { name: 'Potassium Citrate', genericName: 'Potassium Citrate', dosage: '10mL', frequency: 'Twice daily', route: 'Oral', reason: 'Alkalinize urine', category: 'Metabolic', priority: 1 },
];

/**
 * Search medicines by first letter or partial match
 */
export function searchMedicines(
  query: string,
  diagnoses: string[] = [],
  existingMeds: string[] = []
): MedicineSuggestion[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const existingSet = new Set(existingMeds.map(m => m.toLowerCase().trim()));

  // Direct name/generic match
  const directMatches = nephrologyMedicines.filter(
    m =>
      (m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q)) &&
      !existingSet.has(m.name.toLowerCase().trim())
  );

  // Diagnosis-based suggestions (filtered by query)
  const diagnosisSuggestions: MedicineSuggestion[] = [];
  for (const diag of diagnoses) {
    const diagLower = diag.toLowerCase();
    for (const map of diagnosisMedicineMaps) {
      if (map.keywords.some(kw => diagLower.includes(kw) || kw.includes(diagLower))) {
        for (const med of map.medicines) {
          if (
            (med.name.toLowerCase().includes(q) || med.genericName.toLowerCase().includes(q)) &&
            !existingSet.has(med.name.toLowerCase().trim()) &&
            !diagnosisSuggestions.some(d => d.name === med.name && d.dosage === med.dosage)
          ) {
            diagnosisSuggestions.push({ ...med, priority: med.priority - 0.5 }); // Boost priority for diagnosis matches
          }
        }
      }
    }
  }

  // Combine: diagnosis matches first (higher priority), then direct matches
  const combined = [...diagnosisSuggestions, ...directMatches];
  const unique = combined.filter(
    (m, i, arr) =>
      arr.findIndex(x => x.name === m.name && x.dosage === m.dosage) === i
  );

  return unique.slice(0, 12);
}

/**
 * Get AI suggestions for a patient based on their diagnoses
 * (Used to show "Suggested for this patient" section)
 */
export function getDiagnosisBasedSuggestions(
  diagnoses: string[],
  existingMeds: string[] = []
): MedicineSuggestion[] {
  const existingSet = new Set(existingMeds.map(m => m.toLowerCase().trim()));
  const results: MedicineSuggestion[] = [];

  for (const diag of diagnoses) {
    const diagLower = diag.toLowerCase();
    for (const map of diagnosisMedicineMaps) {
      if (map.keywords.some(kw => diagLower.includes(kw) || kw.includes(diagLower))) {
        for (const med of map.medicines) {
          if (
            !existingSet.has(med.name.toLowerCase().trim()) &&
            !results.some(r => r.name === med.name && r.dosage === med.dosage)
          ) {
            results.push(med);
          }
        }
      }
    }
  }

  return results.slice(0, 8);
}
