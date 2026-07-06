import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';
import { BreadcrumbSchema, FAQSchema } from '@/components/seo/JsonLd';
import { JsonLd } from '@/components/seo/JsonLd';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TestTube, Droplets, Scan, Microscope, ChevronRight, CheckCircle, AlertTriangle, Info, Shield, Phone, Activity, FlaskConical, Heart, Apple, Droplet } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kidney Disease Tests: eGFR, Creatinine & More | Dr Goel',
  description: 'Complete guide to kidney disease tests - eGFR, serum creatinine, urine albumin (uACR), BUN, cystatin C, kidney ultrasound and biopsy. Book kidney function test with Dr Rajesh Goel, Senior Nephrologist in Delhi. Call +91 98182 35613.',
  keywords: [
    'kidney disease tests', 'kidney function test', 'kidney test near me', 'renal function test',
    'eGFR test', 'eGFR normal range', 'eGFR calculator', 'estimated glomerular filtration rate',
    'serum creatinine test', 'creatinine test', 'creatinine normal range',
    'urine albumin test', 'uACR test', 'urine albumin to creatinine ratio', 'microalbumin test',
    'BUN test', 'blood urea nitrogen', 'kidney blood test',
    'blood urea test', 'serum uric acid test',
    'cystatin C test', 'kidney ultrasound', 'renal ultrasound', 'kidney biopsy',
    'urinalysis', 'urine test kidney disease', 'protein in urine test',
    'urine culture and sensitivity test',
    'electrolytes test kidney', 'sodium potassium test', 'bicarbonate test',
    'calcium phosphorus test', 'parathyroid hormone PTH test', 'vitamin D test kidney',
    'magnesium test', 'alkaline phosphatase test',
    'CBC test kidney disease', 'haemoglobin test', 'anemia kidney disease',
    'iron studies test', 'ferritin test', 'TIBC test', 'transferrin saturation',
    'vitamin B12 test kidney', 'folate test',
    'HbA1c test kidney', 'fasting blood sugar test', 'diabetes kidney test',
    'lipid profile test', 'liver function test kidney',
    'serum albumin test', 'total protein test',
    'dialysis adequacy test', 'Kt/V test', 'hepatitis B test dialysis',
    'how to test kidney function', 'kidney disease screening', 'kidney stone test',
    'nephrologist Delhi', 'kidney specialist Delhi', 'Dr Rajesh Goel nephrologist',
    'kidney disease diagnosis', 'chronic kidney disease test', 'CKD test',
    'CKD monitoring panel', 'essential kidney tests',
  ],
  authors: [{ name: 'Dr Rajesh Goel', url: `${SITE_CONFIG.url}/dr-rajesh-goel` }],
  creator: 'Dr Rajesh Goel',
  publisher: SITE_CONFIG.name,
  alternates: {
    canonical: `${SITE_CONFIG.url}/tests-for-kidney-disease`,
    languages: { 'en-us': `${SITE_CONFIG.url}/tests-for-kidney-disease` },
  },
  openGraph: {
    title: 'Tests for Kidney Disease | Complete Guide to Kidney Screening',
    description: 'Everything you need to know about kidney disease tests - eGFR, creatinine, urine albumin, ultrasound, biopsy. Expert guide by Dr Rajesh Goel, Senior Nephrologist.',
    url: `${SITE_CONFIG.url}/tests-for-kidney-disease`,
    siteName: SITE_CONFIG.name,
    type: 'article',
    locale: 'en_US',
    publishedTime: '2025-01-15T00:00:00Z',
    modifiedTime: new Date().toISOString(),
    authors: ['Dr Rajesh Goel'],
    images: [
      {
        url: `${SITE_CONFIG.url}/images/dr-rajesh-goel.jpg`,
        width: 1200,
        height: 630,
        alt: 'Dr Rajesh Goel - Kidney Disease Tests and Diagnosis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tests for Kidney Disease | eGFR, Creatinine, Urine Test Guide',
    description: 'Complete guide to kidney disease screening tests. Learn about eGFR, creatinine, urine albumin, ultrasound and biopsy. Book consultation with Dr Rajesh Goel.',
    images: [`${SITE_CONFIG.url}/images/dr-rajesh-goel.jpg`],
    creator: '@kidneycarecentre',
    site: '@kidneycarecentre',
  },
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
};

const bloodTests = [
  {
    name: 'Estimated Glomerular Filtration Rate (eGFR)',
    icon: '🩸',
    whatItIs: 'eGFR is a calculated number that estimates how well your kidneys are filtering waste from your blood. It is the most important test for detecting and staging chronic kidney disease (CKD).',
    howItWorks: 'The eGFR is calculated from your serum creatinine level, age, gender, and sometimes race. A higher eGFR means better kidney function.',
    normalRange: '90 mL/min/1.73 m² or higher',
    whatResultsMean: [
      { range: '90 or above', meaning: 'Normal kidney function', color: 'green' },
      { range: '60-89', meaning: 'Mildly decreased kidney function (CKD Stage 2)', color: 'yellow' },
      { range: '45-59', meaning: 'Mildly to moderately decreased (CKD Stage 3a)', color: 'orange' },
      { range: '30-44', meaning: 'Moderately to severely decreased (CKD Stage 3b)', color: 'orange' },
      { range: '15-29', meaning: 'Severely decreased (CKD Stage 4)', color: 'red' },
      { range: 'Below 15', meaning: 'Kidney failure (CKD Stage 5)', color: 'red' },
    ],
    whoShouldGetTested: 'Everyone with diabetes, high blood pressure, heart disease, or a family history of kidney disease. Adults over 60 should be screened annually.',
    frequency: 'Annually for at-risk patients; every 3-6 months if eGFR is declining.',
  },
  {
    name: 'Serum Creatinine',
    icon: '🔬',
    whatItIs: 'Creatinine is a waste product produced by your muscles during normal activity. Healthy kidneys filter creatinine out of the blood and into the urine. High levels in blood indicate the kidneys are not filtering properly.',
    howItWorks: 'A simple blood test measures the amount of creatinine in your blood. Your doctor uses this value along with age, gender, and body size to calculate your eGFR.',
    normalRange: 'Men: 0.7-1.3 mg/dL | Women: 0.6-1.1 mg/dL',
    whatResultsMean: [
      { range: 'Normal range', meaning: 'Kidneys are filtering waste properly', color: 'green' },
      { range: 'Slightly elevated', meaning: 'Early kidney damage or dehydration', color: 'yellow' },
      { range: 'Moderately elevated', meaning: 'Moderate kidney dysfunction', color: 'orange' },
      { range: 'Significantly elevated', meaning: 'Severe kidney dysfunction or kidney failure', color: 'red' },
    ],
    whoShouldGetTested: 'Patients with diabetes, hypertension, family history of kidney disease, or those on medications that may affect kidneys (NSAIDs, certain antibiotics).',
    frequency: 'As part of routine annual check-up; more frequent if kidney disease is suspected.',
  },
  {
    name: 'Blood Urea Nitrogen (BUN)',
    icon: '🧪',
    whatItIs: 'BUN measures the amount of nitrogen in your blood that comes from urea, a waste product made when protein is broken down in your body. The kidneys remove urea from the blood.',
    howItWorks: 'A simple blood test. BUN is often measured alongside creatinine. The BUN-to-creatinine ratio can help doctors determine the cause of kidney problems.',
    normalRange: '7-20 mg/dL',
    whatResultsMean: [
      { range: 'Normal range', meaning: 'Kidneys are filtering urea properly', color: 'green' },
      { range: 'Mildly elevated', meaning: 'Dehydration, high protein diet, or mild kidney dysfunction', color: 'yellow' },
      { range: 'Significantly elevated', meaning: 'Kidney failure, severe dehydration, or GI bleeding', color: 'red' },
    ],
    whoShouldGetTested: 'Usually ordered as part of a comprehensive metabolic panel. Important for patients with kidney disease, heart failure, or GI bleeding.',
    frequency: 'As directed by your doctor, typically alongside other kidney function tests.',
  },
  {
    name: 'Cystatin C',
    icon: '🧬',
    whatItIs: 'Cystatin C is a protein produced by all cells in the body. Unlike creatinine, it is less affected by muscle mass, age, or diet, making it a more accurate marker of kidney function in certain patients.',
    howItWorks: 'A blood test measures cystatin C levels. It may be used to confirm eGFR calculated from creatinine, especially when creatinine-based estimates may be inaccurate.',
    normalRange: '0.51-0.98 mg/L',
    whatResultsMean: [
      { range: 'Normal range', meaning: 'Normal kidney function confirmed', color: 'green' },
      { range: 'Elevated', meaning: 'May indicate reduced kidney function even if creatinine appears normal', color: 'orange' },
    ],
    whoShouldGetTested: 'Elderly patients, very thin or muscular individuals, amputees, patients with cirrhosis, or when eGFR from creatinine seems inaccurate.',
    frequency: 'As recommended by your nephrologist.',
  },
  {
    name: 'Serum Uric Acid',
    icon: '⚗️',
    whatItIs: 'Uric acid is a waste product formed when the body breaks down purines (substances found in certain foods and cells). High levels can indicate reduced kidney excretion and may contribute to kidney stone formation and further kidney damage.',
    howItWorks: 'A simple blood test measures uric acid levels. Elevated levels are common in CKD patients and gout.',
    normalRange: 'Men: 3.4-7.0 mg/dL | Women: 2.4-6.0 mg/dL',
    whatResultsMean: [
      { range: 'Normal range', meaning: 'Normal uric acid metabolism and kidney excretion', color: 'green' },
      { range: 'Mildly elevated (7-9 mg/dL)', meaning: 'Hyperuricemia - may indicate reduced kidney function or high purine intake', color: 'yellow' },
      { range: 'Significantly elevated (>9 mg/dL)', meaning: 'Severe hyperuricemia - risk of gout, kidney stones, and further kidney damage', color: 'red' },
    ],
    whoShouldGetTested: 'All CKD patients, patients with gout, recurrent kidney stones, or unexplained joint pain.',
    frequency: 'Every 3-6 months in CKD patients; more often if elevated.',
  },
  {
    name: 'Blood Urea',
    icon: '🩸',
    whatItIs: 'Blood urea measures the total amount of urea nitrogen in your blood. Urea is a waste product from protein metabolism that is excreted by the kidneys. It is a key marker alongside creatinine for assessing kidney function.',
    howItWorks: 'A simple blood test. Urea levels rise when kidneys are unable to filter waste properly. It can also be affected by dehydration, high protein diet, and GI bleeding.',
    normalRange: '15-40 mg/dL (or 7-20 mg/dL for BUN)',
    whatResultsMean: [
      { range: 'Normal range', meaning: 'Kidneys are filtering urea properly', color: 'green' },
      { range: 'Mildly elevated', meaning: 'Dehydration, high protein diet, or mild kidney dysfunction', color: 'yellow' },
      { range: 'Moderately elevated', meaning: 'Moderate kidney dysfunction or significant dehydration', color: 'orange' },
      { range: 'Significantly elevated', meaning: 'Severe kidney failure, GI bleeding, or catabolic state', color: 'red' },
    ],
    whoShouldGetTested: 'All CKD patients, patients with dehydration, GI bleeding, or on high protein diets.',
    frequency: 'Every 1-3 months alongside creatinine and eGFR.',
  },
];

const urineTests = [
  {
    name: 'Urine Albumin-to-Creatinine Ratio (uACR)',
    icon: '💧',
    whatItIs: 'uACR measures the amount of albumin (a type of protein) in your urine compared to creatinine. Albumin in the urine is one of the earliest signs of kidney damage, especially in diabetes.',
    howItWorks: 'A spot urine sample (first morning sample is best) is tested. You do not need to collect urine for 24 hours.',
    normalRange: 'Less than 30 mg/g',
    whatResultsMean: [
      { range: 'Less than 30 mg/g', meaning: 'Normal - no significant albumin in urine', color: 'green' },
      { range: '30-300 mg/g', meaning: 'Moderately increased (microalbuminuria) - early kidney damage', color: 'yellow' },
      { range: 'More than 300 mg/g', meaning: 'Severely increased (macroalbuminuria) - significant kidney damage', color: 'red' },
    ],
    whoShouldGetTested: 'Everyone with diabetes (annually), hypertension, or suspected kidney disease. This is the most sensitive early test for diabetic kidney disease.',
    frequency: 'Annually for diabetics; more frequently if abnormal.',
  },
  {
    name: 'Urinalysis (Routine Urine Test)',
    icon: '🫗',
    whatItIs: 'A comprehensive dipstick and microscopic examination of your urine. It can detect blood, protein, white blood cells, bacteria, sugar, and other substances that may indicate kidney disease or urinary tract infection.',
    howItWorks: 'A midstream clean-catch urine sample is dipped in reagent strips and examined under a microscope for cells, crystals, and casts.',
    normalRange: 'Clear, pale yellow; no blood, no protein, no bacteria',
    whatResultsMean: [
      { range: 'Blood in urine (hematuria)', meaning: 'Kidney stones, infection, glomerulonephritis, or cancer', color: 'red' },
      { range: 'Protein in urine', meaning: 'Kidney damage, nephrotic syndrome', color: 'orange' },
      { range: 'White blood cells', meaning: 'Urinary tract infection or kidney infection', color: 'yellow' },
      { range: 'Glucose in urine', meaning: 'Uncontrolled diabetes', color: 'yellow' },
      { range: 'RBC casts', meaning: 'Glomerulonephritis (kidney inflammation)', color: 'red' },
      { range: 'WBC casts', meaning: 'Kidney infection (pyelonephritis)', color: 'orange' },
    ],
    whoShouldGetTested: 'Part of every routine health check-up. Essential for anyone with symptoms of kidney disease (swelling, foamy urine, blood in urine).',
    frequency: 'Annually as part of routine check-up; more frequently if abnormal.',
  },
  {
    name: 'Urine Protein-to-Creatinine Ratio (uPCR)',
    icon: '📉',
    whatItIs: 'uPCR measures total protein in your urine. Unlike uACR which measures only albumin, uPCR captures all types of protein loss. It is used to assess nephrotic-range proteinuria.',
    howItWorks: 'A spot urine sample is analyzed. Values above 3.5 g/g suggest nephrotic syndrome.',
    normalRange: 'Less than 150 mg/g (less than 0.15 g/g)',
    whatResultsMean: [
      { range: 'Less than 150 mg/g', meaning: 'Normal protein excretion', color: 'green' },
      { range: '150-3000 mg/g', meaning: 'Sub-nephrotic proteinuria', color: 'yellow' },
      { range: 'More than 3500 mg/g', meaning: 'Nephrotic-range proteinuria', color: 'red' },
    ],
    whoShouldGetTested: 'Patients with persistent proteinuria on urinalysis, suspected nephrotic syndrome, or monitoring treatment response.',
    frequency: 'As directed by nephrologist based on kidney disease severity.',
  },
  {
    name: 'Urine Culture & Sensitivity',
    icon: '🦠',
    whatItIs: 'Urine culture identifies the specific bacteria causing a urinary tract infection (UTI) and determines which antibiotics will be most effective. This is especially important in CKD patients who are prone to recurrent infections.',
    howItWorks: 'A clean-catch midstream urine sample is cultured on special media. If bacteria grow, they are tested against various antibiotics to determine sensitivity.',
    normalRange: 'No growth (negative culture)',
    whatResultsMean: [
      { range: 'No growth', meaning: 'No active urinary tract infection', color: 'green' },
      { range: 'Growth of organism', meaning: 'Active UTI - specific organism identified with antibiotic sensitivity', color: 'red' },
    ],
    whoShouldGetTested: 'CKD patients with symptoms of UTI (burning urination, frequency, fever), recurrent UTIs, or before starting immunosuppressive therapy.',
    frequency: 'As needed when infection is suspected; not a routine test.',
  },
];

const imagingTests = [
  {
    name: 'Kidney Ultrasound (Renal USG)',
    icon: '📡',
    whatItIs: 'A non-invasive imaging test that uses sound waves to create pictures of your kidneys. It shows the size, shape, and structure of the kidneys, and can detect stones, cysts, blockages, and tumors.',
    howItWorks: 'A transducer is placed on your abdomen with gel. It sends sound waves that bounce off the kidneys and create real-time images on a screen.',
    normalRange: 'Kidneys should be normal in size (9-12 cm), smooth contour, no hydronephrosis',
    whatItShows: [
      'Kidney size and volume',
      'Hydronephrosis (swelling due to urine backup)',
      'Kidney stones',
      'Kidney cysts or masses',
      'Obstruction in the urinary tract',
      'Kidney blood flow (with Doppler)',
    ],
    whoShouldGetTested: 'Anyone with suspected kidney disease, recurrent UTIs, kidney stones, flank pain, or elevated creatinine.',
    preparation: 'May require fasting for 4-6 hours before the test.',
  },
  {
    name: 'CT Scan of Kidneys (KUB with contrast)',
    icon: '🖥️',
    whatItIs: 'A detailed imaging test using X-rays to create cross-sectional images of the kidneys, ureters, and bladder. CT with contrast provides detailed evaluation of kidney masses, stones, and vascular abnormalities.',
    howItWorks: 'You lie on a table that slides through a ring-shaped scanner. Contrast dye may be injected to highlight structures.',
    normalRange: 'Normal kidney size, no masses, no stones, no hydronephrosis',
    whatItShows: [
      'Detailed kidney anatomy',
      'Kidney tumors and masses (staging)',
      'Stones (even small ones not seen on X-ray)',
      'Kidney infections (abscess)',
      'Blood vessel abnormalities',
      'Trauma injuries',
    ],
    whoShouldGetTested: 'When ultrasound is inconclusive, suspected kidney cancer, complex kidney stones, or trauma.',
    preparation: 'Fasting 4-6 hours; inform doctor if allergic to contrast or have kidney disease (contrast risk).',
  },
  {
    name: 'Kidney MRI (MR Urography)',
    icon: '🧲',
    whatItIs: 'An advanced imaging test that uses magnetic fields and radio waves to create detailed images without radiation. It is especially useful for evaluating complex kidney masses and planning surgery.',
    howItWorks: 'You lie inside a large magnet. The machine creates detailed images. Contrast (gadolinium) may be used for better detail.',
    normalRange: 'Normal kidney anatomy without masses or hydronephrosis',
    whatItShows: [
      'Detailed soft tissue evaluation',
      'Characterization of kidney masses (benign vs malignant)',
      'Evaluation before kidney transplant',
      'Vascular abnormalities',
      'Avoids radiation exposure',
    ],
    whoShouldGetTested: 'Complex kidney masses, patients who cannot have CT contrast, pre-transplant evaluation.',
    preparation: 'No metal objects; inform doctor of implants or claustrophobia.',
  },
];

const electrolyteTests = [
  {
    name: 'Sodium (Na)',
    icon: '⚡',
    whatItIs: 'Sodium is the main electrolyte that regulates fluid balance, nerve signals, and muscle function. Kidney disease can cause sodium retention or dilution.',
    normalRange: '136-145 mEq/L',
    whatResultsMean: [
      { range: 'Normal range', meaning: 'Normal fluid and electrolyte balance', color: 'green' },
      { range: 'Low sodium (<136)', meaning: 'Hyponatremia - fluid overload, diuretics, or SIADH', color: 'yellow' },
      { range: 'High sodium (>145)', meaning: 'Hypernatremia - dehydration or excess sodium intake', color: 'red' },
    ],
    frequency: 'Every 1-3 months in CKD patients',
  },
  {
    name: 'Potassium (K)',
    icon: '⚡',
    whatItIs: 'Potassium is critical for heart rhythm and muscle function. Impaired kidneys cannot excrete potassium properly, leading to dangerous hyperkalemia.',
    normalRange: '3.5-5.0 mEq/L',
    whatResultsMean: [
      { range: 'Normal range', meaning: 'Normal potassium balance', color: 'green' },
      { range: 'Low potassium (<3.5)', meaning: 'Hypokalemia - diarrhea, diuretics, or poor intake', color: 'yellow' },
      { range: 'High potassium (>5.0)', meaning: 'Hyperkalemia - reduced kidney excretion, medications (ACEi, ARBs, K-sparing diuretics)', color: 'red' },
      { range: 'Very high (>6.0)', meaning: 'Severe hyperkalemia - risk of cardiac arrhythmia, emergency', color: 'red' },
    ],
    frequency: 'Every 1-3 months; more often with RAAS blockers',
  },
  {
    name: 'Chloride (Cl)',
    icon: '⚡',
    whatItIs: 'Chloride works with sodium to maintain fluid balance and acid-base status. It is often measured alongside sodium and bicarbonate.',
    normalRange: '98-106 mEq/L',
    whatResultsMean: [
      { range: 'Normal range', meaning: 'Normal electrolyte balance', color: 'green' },
      { range: 'Low chloride', meaning: 'Vomiting, metabolic alkalosis, or diuretic use', color: 'yellow' },
      { range: 'High chloride', meaning: 'Dehydration, metabolic acidosis, or excess saline', color: 'orange' },
    ],
    frequency: 'Every 1-3 months in CKD patients',
  },
  {
    name: 'Bicarbonate (HCO₃)',
    icon: '⚡',
    whatItIs: 'Bicarbonate measures the acid-base status of your blood. CKD patients often develop metabolic acidosis because kidneys cannot excrete acid properly.',
    normalRange: '22-28 mEq/L',
    whatResultsMean: [
      { range: 'Normal range', meaning: 'Normal acid-base balance', color: 'green' },
      { range: 'Low bicarbonate (<22)', meaning: 'Metabolic acidosis - common in CKD stages 4-5, accelerates kidney disease progression', color: 'orange' },
      { range: 'High bicarbonate (>28)', meaning: 'Metabolic alkalosis - vomiting, excess antacids', color: 'yellow' },
    ],
    frequency: 'Every 1-3 months in CKD; guides bicarbonate supplementation',
  },
];

const mineralBoneTests = [
  {
    name: 'Calcium',
    icon: '🦴',
    whatItIs: 'Calcium is essential for bones, heart function, and nerve signaling. In CKD, low calcium and high phosphorus lead to renal osteodystrophy and vascular calcification.',
    normalRange: '8.5-10.5 mg/dL',
    whatResultsMean: [
      { range: 'Normal range', meaning: 'Normal calcium metabolism', color: 'green' },
      { range: 'Low calcium', meaning: 'Hypocalcemia - vitamin D deficiency, high phosphorus, low PTH', color: 'yellow' },
      { range: 'High calcium', meaning: 'Hypercalcemia - excess vitamin D, hyperparathyroidism, malignancy', color: 'red' },
    ],
    frequency: 'Every 3-6 months in CKD',
  },
  {
    name: 'Phosphorus',
    icon: '🦴',
    whatItIs: 'Phosphorus is a mineral that works with calcium for bone health. In CKD, phosphorus builds up causing bone disease, itching, and cardiovascular calcification.',
    normalRange: '2.5-4.5 mg/dL',
    whatResultsMean: [
      { range: 'Normal range', meaning: 'Normal phosphorus balance', color: 'green' },
      { range: 'High phosphorus (>4.5)', meaning: 'Hyperphosphatemia - reduced kidney excretion, accelerates bone disease and cardiovascular risk', color: 'red' },
      { range: 'Low phosphorus', meaning: 'Hypophosphatemia - malnutrition, phosphate binders overdose', color: 'yellow' },
    ],
    frequency: 'Every 3-6 months in CKD stages 3-5',
  },
  {
    name: 'Magnesium',
    icon: '🦴',
    whatItIs: 'Magnesium is involved in over 300 enzyme reactions. CKD patients may have abnormal levels affecting heart rhythm, muscle function, and bone health.',
    normalRange: '1.7-2.2 mg/dL',
    whatResultsMean: [
      { range: 'Normal range', meaning: 'Normal magnesium balance', color: 'green' },
      { range: 'Low magnesium', meaning: 'Hypomagnesemia - diuretics, poor intake, diarrhea', color: 'yellow' },
      { range: 'High magnesium', meaning: 'Hypermagnesemia - severe CKD, excess magnesium-containing medications', color: 'red' },
    ],
    frequency: 'Every 3-6 months in CKD',
  },
  {
    name: 'Alkaline Phosphatase (ALP)',
    icon: '🦴',
    whatItIs: 'ALP is an enzyme found in bones and liver. Elevated levels in CKD may indicate renal osteodystrophy (bone disease) or liver problems.',
    normalRange: '44-147 IU/L',
    whatResultsMean: [
      { range: 'Normal range', meaning: 'Normal bone and liver function', color: 'green' },
      { range: 'Elevated', meaning: 'Bone disease (renal osteodystrophy), liver disease, or vitamin D deficiency', color: 'orange' },
    ],
    frequency: 'Every 6-12 months in CKD',
  },
  {
    name: 'Intact Parathyroid Hormone (iPTH)',
    icon: '🦴',
    whatItIs: 'iPTH is the most important test for bone-mineral disorder in CKD. As kidney function declines, PTH rises causing bone pain, fractures, and vascular calcification.',
    normalRange: '10-65 pg/mL (target varies by CKD stage)',
    whatResultsMean: [
      { range: 'Normal range', meaning: 'Normal PTH regulation', color: 'green' },
      { range: 'Mildly elevated', meaning: 'Early secondary hyperparathyroidism - CKD stage 3-4', color: 'yellow' },
      { range: 'Significantly elevated (>300)', meaning: 'Overt secondary hyperparathyroidism - CKD stage 4-5, bone disease risk', color: 'orange' },
      { range: 'Very high (>600)', meaning: 'Severe hyperparathyroidism - may need calcimimetics or parathyroidectomy', color: 'red' },
    ],
    frequency: 'Every 6-12 months; more frequent in advanced CKD',
  },
  {
    name: 'Vitamin D (25-OH)',
    icon: '☀️',
    whatItIs: 'Vitamin D is essential for calcium absorption and bone health. CKD patients are at high risk of deficiency due to reduced kidney activation of vitamin D.',
    normalRange: '30-100 ng/mL (sufficient >30)',
    whatResultsMean: [
      { range: 'Sufficient (>30)', meaning: 'Adequate vitamin D levels', color: 'green' },
      { range: 'Insufficient (20-30)', meaning: 'Mild deficiency - supplementation recommended', color: 'yellow' },
      { range: 'Deficient (<20)', meaning: 'Significant deficiency - high-dose supplementation needed', color: 'red' },
    ],
    frequency: 'Every 6-12 months in CKD',
  },
];

const cbcBloodTests = [
  {
    name: 'Complete Blood Count (CBC)',
    icon: '🩸',
    whatItIs: 'CBC measures haemoglobin, white blood cells, platelets, and red blood cell indices. Anemia is extremely common in CKD due to reduced erythropoietin production by damaged kidneys.',
    normalRange: 'Haemoglobin: Men 13-17 g/dL, Women 12-15 g/dL',
    whatResultsMean: [
      { range: 'Normal haemoglobin', meaning: 'No anemia', color: 'green' },
      { range: 'Mild anemia (10-12)', meaning: 'Early CKD-related anemia', color: 'yellow' },
      { range: 'Moderate anemia (8-10)', meaning: 'Significant anemia - may need erythropoietin', color: 'orange' },
      { range: 'Severe anemia (<8)', meaning: 'Severe anemia - transfusion may be needed', color: 'red' },
    ],
    frequency: 'Every 1-3 months in CKD',
  },
  {
    name: 'Serum Iron',
    icon: '🩸',
    whatItIs: 'Measures the amount of iron in your blood. Essential for evaluating anemia in CKD patients, especially before starting erythropoietin therapy.',
    normalRange: '60-170 mcg/dL',
    whatResultsMean: [
      { range: 'Normal range', meaning: 'Adequate iron stores', color: 'green' },
      { range: 'Low iron', meaning: 'Iron deficiency - common in CKD, may need supplementation', color: 'yellow' },
    ],
    frequency: 'Every 3 months in CKD with anemia',
  },
  {
    name: 'Ferritin',
    icon: '🩸',
    whatItIs: 'Ferritin measures total iron stores in the body. In CKD, ferritin levels guide iron supplementation and erythropoietin therapy.',
    normalRange: '200-500 ng/mL (CKD target)',
    whatResultsMean: [
      { range: 'Adequate (200-500)', meaning: 'Sufficient iron stores for erythropoietin therapy', color: 'green' },
      { range: 'Low (<100)', meaning: 'Iron deficiency - needs IV or oral iron supplementation', color: 'yellow' },
      { range: 'Very low (<50)', meaning: 'Severe iron deficiency - must correct before starting EPO', color: 'red' },
    ],
    frequency: 'Every 3 months in CKD with anemia',
  },
  {
    name: 'Total Iron Binding Capacity (TIBC)',
    icon: '🩸',
    whatItIs: 'TIBC measures the blood\'s capacity to bind iron with transferrin. It helps differentiate between iron deficiency anemia and anemia of chronic disease.',
    normalRange: '250-370 mcg/dL',
    whatResultsMean: [
      { range: 'Normal range', meaning: 'Normal iron transport capacity', color: 'green' },
      { range: 'High TIBC', meaning: 'Iron deficiency - body is trying to absorb more iron', color: 'yellow' },
      { range: 'Low TIBC', meaning: 'Chronic disease, inflammation, or liver disease', color: 'orange' },
    ],
    frequency: 'Every 3 months with iron studies',
  },
  {
    name: 'Transferrin Saturation (TSAT)',
    icon: '🩸',
    whatItIs: 'TSAT calculates the percentage of transferrin that is saturated with iron. It is a key marker for iron-deficiency anemia in CKD and guides ESA therapy.',
    normalRange: '20-50%',
    whatResultsMean: [
      { range: 'Normal (20-50%)', meaning: 'Adequate iron availability', color: 'green' },
      { range: 'Low (<20%)', meaning: 'Iron deficiency - ESA hyporesponsive if not corrected', color: 'yellow' },
      { range: 'Very low (<10%)', meaning: 'Severe iron deficiency - IV iron may be needed', color: 'red' },
    ],
    frequency: 'Every 3 months in CKD with anemia',
  },
  {
    name: 'Vitamin B12',
    icon: '💊',
    whatItIs: 'Vitamin B12 is essential for red blood cell formation and nerve function. Deficiency can cause or worsen anemia independent of kidney function.',
    normalRange: '200-900 pg/mL',
    whatResultsMean: [
      { range: 'Normal range', meaning: 'Adequate B12 levels', color: 'green' },
      { range: 'Low (<200)', meaning: 'B12 deficiency - may contribute to anemia, needs supplementation', color: 'yellow' },
    ],
    frequency: 'If anemia is unexplained or macrocytosis present',
  },
  {
    name: 'Folate',
    icon: '💊',
    whatItIs: 'Folate (Vitamin B9) works with B12 for red blood cell production. Deficiency causes megaloblastic anemia.',
    normalRange: '2.7-17.0 ng/mL',
    whatResultsMean: [
      { range: 'Normal range', meaning: 'Adequate folate levels', color: 'green' },
      { range: 'Low (<2.7)', meaning: 'Folate deficiency - supplementation needed', color: 'yellow' },
    ],
    frequency: 'If anemia is unexplained or macrocytosis present',
  },
];

const diabetesTests = [
  {
    name: 'Fasting Blood Sugar (FBS)',
    icon: '🍬',
    whatItIs: 'Measures blood glucose after an overnight fast (8-12 hours). Essential for monitoring diabetes control, which is the leading cause of kidney disease.',
    normalRange: '70-100 mg/dL (normal), <126 mg/dL (diabetic)',
    whatResultsMean: [
      { range: 'Normal (<100)', meaning: 'Good blood sugar control', color: 'green' },
      { range: 'Pre-diabetic (100-125)', meaning: 'Impaired fasting glucose - lifestyle changes needed', color: 'yellow' },
      { range: 'Diabetic (>126)', meaning: 'Uncontrolled diabetes - medications adjustment needed', color: 'red' },
    ],
    frequency: 'Every 3 months in diabetic CKD patients',
  },
  {
    name: 'Post-Prandial Blood Sugar (PPBS)',
    icon: '🍬',
    whatItIs: 'Measures blood glucose 2 hours after a meal. Shows how well the body handles glucose after eating.',
    normalRange: '<140 mg/dL (normal), <200 mg/dL (diabetic)',
    whatResultsMean: [
      { range: 'Normal (<140)', meaning: 'Good post-meal glucose control', color: 'green' },
      { range: 'Pre-diabetic (140-199)', meaning: 'Impaired glucose tolerance', color: 'yellow' },
      { range: 'Diabetic (>200)', meaning: 'Uncontrolled post-meal glucose', color: 'red' },
    ],
    frequency: 'Every 3 months in diabetic CKD patients',
  },
  {
    name: 'HbA1c',
    icon: '🍬',
    whatItIs: 'HbA1c reflects average blood sugar over the past 2-3 months. It is the gold standard for monitoring long-term diabetes control and guiding treatment in diabetic kidney disease.',
    normalRange: '<5.7% (normal), <7% (diabetic target)',
    whatResultsMean: [
      { range: 'Normal (<5.7%)', meaning: 'No diabetes', color: 'green' },
      { range: 'Pre-diabetic (5.7-6.4%)', meaning: 'Pre-diabetes - lifestyle intervention critical', color: 'yellow' },
      { range: 'Diabetic (6.5-8%)', meaning: 'Diabetes - on target if <7%', color: 'orange' },
      { range: 'Poorly controlled (>8%)', meaning: 'Uncontrolled diabetes - high risk of kidney progression', color: 'red' },
    ],
    frequency: 'Every 3 months in diabetic CKD patients',
  },
];

const heartMetabolicTests = [
  {
    name: 'Lipid Profile',
    icon: '❤️',
    whatItIs: 'Measures cholesterol and triglycerides. CKD patients have significantly elevated cardiovascular risk, and lipid management is crucial.',
    normalRange: 'Total Cholesterol <200, LDL <100, HDL >40, Triglycerides <150 mg/dL',
    whatResultsMean: [
      { range: 'Normal lipid levels', meaning: 'Low cardiovascular risk', color: 'green' },
      { range: 'High LDL (>100)', meaning: 'Elevated cardiovascular risk - statin therapy may be needed', color: 'yellow' },
      { range: 'High triglycerides (>150)', meaning: 'Metabolic risk - dietary changes and medications', color: 'orange' },
    ],
    frequency: 'Every 6-12 months in CKD',
  },
  {
    name: 'Liver Function Test (LFT)',
    icon: '🫀',
    whatItIs: 'LFT measures liver enzymes (SGOT, SGPT, ALP) and bilirubin. Important for drug metabolism and detecting liver disease that may coexist with kidney disease.',
    normalRange: 'SGOT: 5-40 U/L, SGPT: 7-56 U/L, ALP: 44-147 IU/L',
    whatResultsMean: [
      { range: 'Normal liver enzymes', meaning: 'Normal liver function', color: 'green' },
      { range: 'Mildly elevated', meaning: 'May indicate fatty liver, medications effect, or early liver disease', color: 'yellow' },
      { range: 'Significantly elevated', meaning: 'Liver damage - medication review needed', color: 'red' },
    ],
    frequency: 'Every 6-12 months in CKD',
  },
];

const nutritionTests = [
  {
    name: 'Serum Albumin',
    icon: '🥗',
    whatItIs: 'Albumin is the main protein in blood, made by the liver. Low albumin in CKD indicates malnutrition, inflammation, or nephrotic syndrome. It is a strong predictor of outcomes.',
    normalRange: '3.5-5.0 g/dL',
    whatResultsMean: [
      { range: 'Normal (3.5-5.0)', meaning: 'Adequate nutritional status', color: 'green' },
      { range: 'Low (3.0-3.5)', meaning: 'Mild hypoalbuminemia - nutritional support needed', color: 'yellow' },
      { range: 'Very low (<3.0)', meaning: 'Severe malnutrition or nephrotic syndrome - poor prognosis marker', color: 'red' },
    ],
    frequency: 'Every 1-3 months in CKD stages 4-5',
  },
  {
    name: 'Total Protein',
    icon: '🥗',
    whatItIs: 'Total protein measures all proteins in your blood (albumin + globulin). It helps assess nutritional status and detect conditions like nephrotic syndrome or multiple myeloma.',
    normalRange: '6.0-8.3 g/dL',
    whatResultsMean: [
      { range: 'Normal range', meaning: 'Adequate protein status', color: 'green' },
      { range: 'Low (<6.0)', meaning: 'Malnutrition, liver disease, or protein-losing conditions', color: 'yellow' },
      { range: 'High (>8.3)', meaning: 'Dehydration, chronic inflammation, or multiple myeloma', color: 'orange' },
    ],
    frequency: 'Every 3-6 months in CKD',
  },
];

const dialysisTests = [
  {
    name: 'Pre- and Post-Dialysis Urea',
    icon: '🔬',
    whatItIs: 'Measures urea before and after dialysis to calculate Kt/V (dialysis adequacy) and URR (Urea Reduction Ratio). Ensures dialysis sessions are effective.',
    normalRange: 'Kt/V >1.2, URR >65%',
    whatResultsMean: [
      { range: 'Kt/V >1.2', meaning: 'Adequate dialysis', color: 'green' },
      { range: 'Kt/V 1.0-1.2', meaning: 'Borderline dialysis adequacy - may need longer sessions', color: 'yellow' },
      { range: 'Kt/V <1.0', meaning: 'Inadequate dialysis - must increase session time or frequency', color: 'red' },
    ],
    frequency: 'Monthly for hemodialysis patients',
  },
  {
    name: 'Hepatitis B Screening',
    icon: '🛡️',
    whatItIs: 'Hepatitis B (HbsAg, Anti-HBs) screening is mandatory for dialysis patients to prevent transmission and guide vaccination.',
    normalRange: 'HbsAg negative, Anti-HBs positive (if vaccinated)',
    whatResultsMean: [
      { range: 'HbsAg negative', meaning: 'No active hepatitis B infection', color: 'green' },
      { range: 'HbsAg positive', meaning: 'Active hepatitis B - isolation protocols needed in dialysis unit', color: 'red' },
    ],
    frequency: 'At initiation of dialysis, then annually',
  },
  {
    name: 'Hepatitis C Screening',
    icon: '🛡️',
    whatItIs: 'Anti-HCV testing identifies hepatitis C infection. Dialysis patients are at higher risk due to blood exposure.',
    normalRange: 'Anti-HCV negative',
    whatResultsMean: [
      { range: 'Negative', meaning: 'No hepatitis C infection', color: 'green' },
      { range: 'Positive', meaning: 'Hepatitis C infection - treatable with DAA therapy', color: 'red' },
    ],
    frequency: 'At initiation of dialysis, then annually',
  },
  {
    name: 'HIV Screening',
    icon: '🛡️',
    whatItIs: 'HIV testing is part of standard dialysis protocol to ensure safety of staff and patients.',
    normalRange: 'HIV 1&2 negative',
    whatResultsMean: [
      { range: 'Negative', meaning: 'No HIV infection', color: 'green' },
      { range: 'Positive', meaning: 'HIV infection - antiretroviral therapy and dialysis precautions needed', color: 'red' },
    ],
    frequency: 'At initiation of dialysis, then annually',
  },
];

const biopsySection = {
  name: 'Kidney Biopsy (Renal Biopsy)',
  icon: '🔬',
  whatItIs: 'A kidney biopsy is the gold standard for diagnosing many kidney diseases. A small piece of kidney tissue is removed using a thin needle and examined under a microscope.',
  whenIsItNeeded: [
    'Unexplained kidney failure or declining eGFR',
    'Persistent blood or protein in urine without clear cause',
    'Suspected glomerulonephritis or vasculitis',
    'Kidney transplant evaluation (to check for rejection)',
    'To determine the cause of nephrotic syndrome',
    'To guide treatment decisions in complex cases',
  ],
  procedure: 'Performed under local anesthesia with ultrasound guidance. You lie face down (or on your side). A needle is inserted through the back to obtain tiny tissue samples. The procedure takes about 30-60 minutes.',
  risks: [
    'Bleeding (most common - blood in urine for 1-2 days)',
    'Pain at biopsy site',
    'Very rare: significant bleeding requiring transfusion',
    'Extremely rare: damage to other organs',
  ],
  results: 'Tissue is examined by a kidney pathologist. Results typically take 3-7 days and can diagnose: glomerulonephritis, IgA nephropathy, diabetic nephropathy, lupus nephritis, FSGS, amyloidosis, and many other conditions.',
};

const testComparison = [
  { test: 'eGFR', type: 'Blood', purpose: 'Measures overall kidney function', frequency: 'Every 1-3 months' },
  { test: 'Serum Creatinine', type: 'Blood', purpose: 'Indicates how well kidneys filter waste', frequency: 'Every 1-3 months' },
  { test: 'Blood Urea', type: 'Blood', purpose: 'Measures urea waste product', frequency: 'Every 1-3 months' },
  { test: 'Blood Urea Nitrogen (BUN)', type: 'Blood', purpose: 'Measures urea nitrogen waste product', frequency: 'Every 1-3 months' },
  { test: 'Cystatin C', type: 'Blood', purpose: 'Alternative kidney function marker', frequency: 'As needed' },
  { test: 'Serum Uric Acid', type: 'Blood', purpose: 'Monitors purine metabolism and kidney excretion', frequency: 'Every 3-6 months' },
  { test: 'Sodium (Na)', type: 'Electrolyte', purpose: 'Fluid balance regulation', frequency: 'Every 1-3 months' },
  { test: 'Potassium (K)', type: 'Electrolyte', purpose: 'Heart rhythm and muscle function', frequency: 'Every 1-3 months' },
  { test: 'Chloride (Cl)', type: 'Electrolyte', purpose: 'Fluid and acid-base balance', frequency: 'Every 1-3 months' },
  { test: 'Bicarbonate (HCO₃)', type: 'Electrolyte', purpose: 'Acid-base status of blood', frequency: 'Every 1-3 months' },
  { test: 'Calcium', type: 'Mineral', purpose: 'Bone health and heart function', frequency: 'Every 3-6 months' },
  { test: 'Phosphorus', type: 'Mineral', purpose: 'Bone health, cardiovascular risk', frequency: 'Every 3-6 months' },
  { test: 'Magnesium', type: 'Mineral', purpose: 'Enzyme reactions, heart rhythm', frequency: 'Every 3-6 months' },
  { test: 'Alkaline Phosphatase', type: 'Mineral', purpose: 'Bone disease and liver function', frequency: 'Every 6-12 months' },
  { test: 'Intact PTH', type: 'Mineral', purpose: 'Bone-mineral disorder in CKD', frequency: 'Every 6-12 months' },
  { test: 'Vitamin D (25-OH)', type: 'Mineral', purpose: 'Calcium absorption and bone health', frequency: 'Every 6-12 months' },
  { test: 'CBC', type: 'Blood', purpose: 'Anemia assessment and monitoring', frequency: 'Every 1-3 months' },
  { test: 'Serum Iron', type: 'Blood', purpose: 'Iron availability for erythropoiesis', frequency: 'Every 3 months' },
  { test: 'Ferritin', type: 'Blood', purpose: 'Total iron stores assessment', frequency: 'Every 3 months' },
  { test: 'TIBC', type: 'Blood', purpose: 'Iron transport capacity', frequency: 'Every 3 months' },
  { test: 'Transferrin Saturation', type: 'Blood', purpose: 'Iron availability for ESA therapy', frequency: 'Every 3 months' },
  { test: 'Vitamin B12', type: 'Blood', purpose: 'Red blood cell formation', frequency: 'If anemia present' },
  { test: 'Folate', type: 'Blood', purpose: 'Red blood cell formation', frequency: 'If anemia present' },
  { test: 'Fasting Blood Sugar', type: 'Diabetes', purpose: 'Blood glucose control monitoring', frequency: 'Every 3 months' },
  { test: 'Post-Prandial Blood Sugar', type: 'Diabetes', purpose: 'Post-meal glucose control', frequency: 'Every 3 months' },
  { test: 'HbA1c', type: 'Diabetes', purpose: 'Average glucose over 2-3 months', frequency: 'Every 3 months' },
  { test: 'Lipid Profile', type: 'Heart', purpose: 'Cardiovascular risk assessment', frequency: 'Every 6-12 months' },
  { test: 'Liver Function Test', type: 'Heart', purpose: 'Liver function and drug metabolism', frequency: 'Every 6-12 months' },
  { test: 'Serum Albumin', type: 'Nutrition', purpose: 'Nutritional status assessment', frequency: 'Every 1-3 months' },
  { test: 'Total Protein', type: 'Nutrition', purpose: 'Overall protein status', frequency: 'Every 3-6 months' },
  { test: 'Urine Routine', type: 'Urine', purpose: 'Screening for infection, blood, protein', frequency: 'Every 3-6 months' },
  { test: 'uACR', type: 'Urine', purpose: 'Detects early kidney damage (albumin leak)', frequency: 'Every 3-6 months' },
  { test: 'uPCR', type: 'Urine', purpose: 'Measures total protein in urine', frequency: 'Every 3-12 months' },
  { test: 'Urine Culture & Sensitivity', type: 'Urine', purpose: 'Identifies UTI organism and antibiotic sensitivity', frequency: 'As needed' },
  { test: 'Kidney Ultrasound', type: 'Imaging', purpose: 'Evaluates kidney structure and size', frequency: 'Every 6-12 months' },
  { test: 'CT Scan', type: 'Imaging', purpose: 'Detailed imaging for stones, tumors, trauma', frequency: 'As needed' },
  { test: 'Kidney MRI', type: 'Imaging', purpose: 'Advanced soft tissue evaluation', frequency: 'As needed' },
  { test: 'Kidney Biopsy', type: 'Tissue', purpose: 'Definitive diagnosis of kidney disease', frequency: 'Once (diagnostic)' },
  { test: 'Pre/Post-Dialysis Urea (Kt/V)', type: 'Dialysis', purpose: 'Dialysis adequacy assessment', frequency: 'Monthly' },
  { test: 'Hepatitis B Screening', type: 'Dialysis', purpose: 'Infection screening for dialysis', frequency: 'Annually' },
  { test: 'Hepatitis C Screening', type: 'Dialysis', purpose: 'Infection screening for dialysis', frequency: 'Annually' },
  { test: 'HIV Screening', type: 'Dialysis', purpose: 'Infection screening for dialysis', frequency: 'Annually' },
];

const faqs = [
  {
    q: 'How often should I get my kidney function tested?',
    a: 'If you have diabetes, hypertension, or other risk factors, get tested at least once a year. If you have already been diagnosed with kidney disease, your nephrologist may recommend testing every 3-6 months depending on the stage.',
  },
  {
    q: 'Is a kidney biopsy dangerous?',
    a: 'Kidney biopsy is generally safe when performed by experienced doctors under ultrasound guidance. The most common complication is blood in the urine, which usually resolves on its own. Serious complications are very rare (less than 1%).',
  },
  {
    q: 'Do I need to fast before kidney blood tests?',
    a: 'For most kidney function tests (creatinine, BUN, eGFR), fasting is not required. However, if your doctor orders additional tests along with kidney tests (like lipid profile or glucose), fasting may be needed. Follow your doctor\'s specific instructions.',
  },
  {
    q: 'What is the difference between uACR and uPCR?',
    a: 'uACR (Urine Albumin-to-Creatinine Ratio) specifically measures albumin, the most common protein leaked in kidney disease. uPCR (Urine Protein-to-Creatinine Ratio) measures ALL types of protein. uACR is more sensitive for early detection, while uPCR is used to assess total protein loss in nephrotic syndrome.',
  },
  {
    q: 'Can kidney disease be detected before symptoms appear?',
    a: 'Yes! That is why regular screening is so important. Blood tests (eGFR, creatinine) and urine tests (uACR, urinalysis) can detect kidney disease in early stages before any symptoms develop. Early detection allows for earlier treatment and better outcomes.',
  },
  {
    q: 'What does a low eGFR mean?',
    a: 'A low eGFR means your kidneys are not filtering blood as well as they should. An eGFR below 60 for more than 3 months indicates chronic kidney disease. The lower the number, the worse the kidney function. An eGFR below 15 indicates kidney failure requiring dialysis or transplant.',
  },
  {
    q: 'Should I be worried about protein in my urine?',
    a: 'Small amounts of protein in urine can be temporary (after exercise, fever, or dehydration). However, persistent protein in urine (especially albumin) can be an early sign of kidney damage. If your urine test shows protein, your doctor will likely repeat the test and may order additional tests to determine the cause.',
  },
  {
    q: 'Is kidney ultrasound painful?',
    a: 'No, kidney ultrasound is completely painless. It is a non-invasive test that uses sound waves. A gel is applied to your abdomen and a transducer is moved over the skin. The entire procedure takes about 15-30 minutes.',
  },
];

export default function TestsForKidneyDiseasePage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: SITE_CONFIG.url },
          { name: 'Tests for Kidney Disease', url: `${SITE_CONFIG.url}/tests-for-kidney-disease` },
        ]}
      />
      <FAQSchema faqs={faqs.map(f => ({ question: f.q, answer: f.a }))} />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Tests for Kidney Disease - Complete Guide to Kidney Screening',
        description: 'Comprehensive guide to all kidney disease tests including eGFR, serum creatinine, urine albumin (uACR), BUN, cystatin C, kidney ultrasound, and kidney biopsy.',
        url: `${SITE_CONFIG.url}/tests-for-kidney-disease`,
        image: `${SITE_CONFIG.url}/images/dr-rajesh-goel.jpg`,
        datePublished: '2025-01-15T00:00:00+05:30',
        dateModified: new Date().toISOString(),
        author: {
          '@type': 'Physician',
          name: 'Dr Rajesh Goel',
          url: `${SITE_CONFIG.url}/dr-rajesh-goel`,
          medicalSpecialty: 'Nephrology',
          qualifications: 'MBBS, DNB Internal Medicine, DNB Nephrology, Fellow Kidney Transplant Medicine',
        },
        publisher: {
          '@type': 'Organization',
          name: SITE_CONFIG.name,
          logo: { '@type': 'ImageObject', url: `${SITE_CONFIG.url}/favicon.png` },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${SITE_CONFIG.url}/tests-for-kidney-disease`,
        },
        about: {
          '@type': 'MedicalCondition',
          name: 'Kidney Disease',
          medicalCode: [
            { '@type': 'MedicalCode', code: 'N18', codingSystem: 'ICD-10' },
          ],
        },
        mentions: [
          { '@type': 'Physician', name: 'Dr Rajesh Goel', url: `${SITE_CONFIG.url}/dr-rajesh-goel` },
          { '@type': 'MedicalProcedure', name: 'eGFR Test' },
          { '@type': 'MedicalProcedure', name: 'Serum Creatinine Test' },
          { '@type': 'MedicalProcedure', name: 'Urine Albumin Test' },
          { '@type': 'MedicalProcedure', name: 'Kidney Ultrasound' },
          { '@type': 'MedicalProcedure', name: 'Kidney Biopsy' },
        ],
      }} />

      <Navbar />

      <div className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="text-xs text-slate-500">
              <Link href="/" className="hover:text-[#0A75BB]">Home</Link>
              <span className="mx-1.5">/</span>
              <span className="text-slate-800 font-medium">Tests for Kidney Disease</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <div className="bg-gradient-to-r from-[#0A75BB] to-[#085D94] text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-white/20 rounded-xl">
                <TestTube className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-white/80 bg-white/10 px-3 py-1 rounded-full">Kidney Health</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Tests for Kidney Disease</h1>
            <p className="text-lg text-white/80 max-w-2xl">
              Early detection of kidney disease saves lives. Learn about the essential blood tests, urine tests, imaging studies, and biopsy procedures used to diagnose and monitor kidney disease.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link href="/book-appointment?type=online" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#0A75BB] font-semibold rounded-xl hover:bg-white/90 transition-colors text-sm">
                Book Consultation <ChevronRight className="h-4 w-4" />
              </Link>
              <a href="https://wa.me/919818235613" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors text-sm border border-white/20">
                <Phone className="h-4 w-4" /> WhatsApp Us
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Table of Contents */}
          <nav className="mb-10 bg-slate-50 border border-slate-200 rounded-2xl p-6" aria-label="Table of Contents">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">On This Page</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              <a href="#blood-tests" className="flex items-center gap-2 text-sm text-[#0A75BB] hover:underline"><span className="text-[#0A75BB] font-bold">1.</span> Blood Tests (eGFR, Creatinine, Urea, Uric Acid)</a>
              <a href="#urine-tests" className="flex items-center gap-2 text-sm text-[#0A75BB] hover:underline"><span className="text-[#0A75BB] font-bold">2.</span> Urine Tests (uACR, Urinalysis, uPCR, Culture)</a>
              <a href="#electrolytes" className="flex items-center gap-2 text-sm text-[#0A75BB] hover:underline"><span className="text-[#0A75BB] font-bold">3.</span> Electrolytes (Na, K, Cl, HCO₃)</a>
              <a href="#mineral-bone" className="flex items-center gap-2 text-sm text-[#0A75BB] hover:underline"><span className="text-[#0A75BB] font-bold">4.</span> Mineral &amp; Bone Profile</a>
              <a href="#cbc-blood" className="flex items-center gap-2 text-sm text-[#0A75BB] hover:underline"><span className="text-[#0A75BB] font-bold">5.</span> CBC &amp; Blood Tests</a>
              <a href="#diabetes" className="flex items-center gap-2 text-sm text-[#0A75BB] hover:underline"><span className="text-[#0A75BB] font-bold">6.</span> Diabetes Monitoring</a>
              <a href="#heart-metabolic" className="flex items-center gap-2 text-sm text-[#0A75BB] hover:underline"><span className="text-[#0A75BB] font-bold">7.</span> Heart &amp; Metabolic Risk</a>
              <a href="#nutrition" className="flex items-center gap-2 text-sm text-[#0A75BB] hover:underline"><span className="text-[#0A75BB] font-bold">8.</span> Nutrition Tests</a>
              <a href="#imaging-tests" className="flex items-center gap-2 text-sm text-[#0A75BB] hover:underline"><span className="text-[#0A75BB] font-bold">9.</span> Imaging Tests</a>
              <a href="#dialysis-tests" className="flex items-center gap-2 text-sm text-[#0A75BB] hover:underline"><span className="text-[#0A75BB] font-bold">10.</span> Dialysis Tests</a>
              <a href="#biopsy" className="flex items-center gap-2 text-sm text-[#0A75BB] hover:underline"><span className="text-[#0A75BB] font-bold">11.</span> Kidney Biopsy</a>
              <a href="#comparison" className="flex items-center gap-2 text-sm text-[#0A75BB] hover:underline"><span className="text-[#0A75BB] font-bold">12.</span> Test Comparison Table</a>
              <a href="#faqs" className="flex items-center gap-2 text-sm text-[#0A75BB] hover:underline"><span className="text-[#0A75BB] font-bold">13.</span> Frequently Asked Questions</a>
            </div>
          </nav>

          {/* Overview */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Why Kidney Tests Matter</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <p className="text-slate-700 leading-relaxed">
                Kidney disease is often called a &quot;silent disease&quot; because symptoms may not appear until significant damage has occurred. Regular testing is the only way to catch kidney problems early. If you have <strong>diabetes</strong>, <strong>high blood pressure</strong>, a <strong>family history of kidney disease</strong>, or are over 60 years old, regular kidney screening is essential.
              </p>
              <p className="text-slate-700 leading-relaxed mt-3">
                Dr. Rajesh Goel, Senior Nephrologist with 18+ years of experience, recommends at least annual kidney function screening for all at-risk patients. Early detection allows for lifestyle changes and medications that can slow or stop kidney disease progression.
              </p>
            </div>
          </section>

          {/* Quick Test Overview Table */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Kidney Tests at a Glance</h2>
            <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f0f4f8]">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Test</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Purpose</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Recommended Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {testComparison.map((t, i) => (
                    <tr key={i} className="border-t border-slate-100 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-800">{t.test}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          t.type === 'Blood' ? 'bg-red-100 text-red-700' :
                          t.type === 'Urine' ? 'bg-amber-100 text-amber-700' :
                          t.type === 'Imaging' ? 'bg-blue-100 text-blue-700' :
                          t.type === 'Electrolyte' ? 'bg-yellow-100 text-yellow-700' :
                          t.type === 'Mineral' ? 'bg-orange-100 text-orange-700' :
                          t.type === 'Diabetes' ? 'bg-pink-100 text-pink-700' :
                          t.type === 'Heart' ? 'bg-rose-100 text-rose-700' :
                          t.type === 'Nutrition' ? 'bg-green-100 text-green-700' :
                          t.type === 'Dialysis' ? 'bg-cyan-100 text-cyan-700' :
                          t.type === 'Tissue' ? 'bg-purple-100 text-purple-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{t.purpose}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{t.frequency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Blood Tests */}
          <section className="mb-12" id="blood-tests">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 rounded-xl">
                <TestTube className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Blood Tests for Kidney Disease</h2>
            </div>
            <div className="space-y-6">
              {bloodTests.map((test, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{test.icon}</span>
                    <h3 className="text-lg font-bold text-slate-900">{test.name}</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{test.whatItIs}</p>
                  <div className="bg-slate-50 rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">How It Works</p>
                    <p className="text-sm text-slate-700">{test.howItWorks}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Normal Range</p>
                    <p className="text-sm font-medium text-blue-800">{test.normalRange}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">What Your Results Mean</p>
                    <div className="space-y-1.5">
                      {test.whatResultsMean.map((r, ri) => (
                        <div key={ri} className="flex items-center gap-3 text-sm">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            r.color === 'green' ? 'bg-emerald-500' :
                            r.color === 'yellow' ? 'bg-yellow-500' :
                            r.color === 'orange' ? 'bg-orange-500' :
                            'bg-red-500'
                          }`} />
                          <span className="font-medium text-slate-800 min-w-[120px]">{r.range}:</span>
                          <span className="text-slate-600">{r.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="bg-emerald-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-emerald-600 uppercase mb-1">Who Should Get Tested</p>
                      <p className="text-xs text-emerald-800">{test.whoShouldGetTested}</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-purple-600 uppercase mb-1">Frequency</p>
                      <p className="text-xs text-purple-800">{test.frequency}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Urine Tests */}
          <section className="mb-12" id="urine-tests">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-100 rounded-xl">
                <Droplets className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Urine Tests for Kidney Disease</h2>
            </div>
            <div className="space-y-6">
              {urineTests.map((test, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{test.icon}</span>
                    <h3 className="text-lg font-bold text-slate-900">{test.name}</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{test.whatItIs}</p>
                  <div className="bg-slate-50 rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">How It Works</p>
                    <p className="text-sm text-slate-700">{test.howItWorks}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Normal Range</p>
                    <p className="text-sm font-medium text-blue-800">{test.normalRange}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">What Your Results Mean</p>
                    <div className="space-y-1.5">
                      {test.whatResultsMean.map((r, ri) => (
                        <div key={ri} className="flex items-center gap-3 text-sm">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            r.color === 'green' ? 'bg-emerald-500' :
                            r.color === 'yellow' ? 'bg-yellow-500' :
                            r.color === 'orange' ? 'bg-orange-500' :
                            'bg-red-500'
                          }`} />
                          <span className="font-medium text-slate-800 min-w-[120px]">{r.range}:</span>
                          <span className="text-slate-600">{r.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="bg-emerald-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-emerald-600 uppercase mb-1">Who Should Get Tested</p>
                      <p className="text-xs text-emerald-800">{test.whoShouldGetTested}</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-purple-600 uppercase mb-1">Frequency</p>
                      <p className="text-xs text-purple-800">{test.frequency}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Imaging Tests */}
          <section className="mb-12" id="imaging-tests">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Scan className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Imaging Tests</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {imagingTests.map((test, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{test.icon}</span>
                    <h3 className="text-base font-bold text-slate-900">{test.name}</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">{test.whatItIs}</p>
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">What It Shows</p>
                    <ul className="space-y-1.5">
                      {test.whatItShows.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-slate-600">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-amber-600 uppercase mb-1">Preparation</p>
                    <p className="text-xs text-amber-800">{test.preparation}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Electrolytes */}
          <section className="mb-12" id="electrolytes">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-yellow-100 rounded-xl">
                <Activity className="h-5 w-5 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Electrolytes &amp; Acid-Base Balance</h2>
            </div>
            <p className="text-sm text-slate-600 mb-6">Electrolyte imbalances are common and potentially dangerous in CKD. Regular monitoring helps prevent life-threatening complications like hyperkalemia and metabolic acidosis.</p>
            <div className="grid md:grid-cols-2 gap-6">
              {electrolyteTests.map((test, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{test.icon}</span>
                    <h3 className="text-lg font-bold text-slate-900">{test.name}</h3>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Normal Range</p>
                    <p className="text-sm font-medium text-blue-800">{test.normalRange}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">What Your Results Mean</p>
                    <div className="space-y-1.5">
                      {test.whatResultsMean.map((r, ri) => (
                        <div key={ri} className="flex items-center gap-3 text-sm">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            r.color === 'green' ? 'bg-emerald-500' :
                            r.color === 'yellow' ? 'bg-yellow-500' :
                            r.color === 'orange' ? 'bg-orange-500' :
                            'bg-red-500'
                          }`} />
                          <span className="font-medium text-slate-800 min-w-[120px]">{r.range}:</span>
                          <span className="text-slate-600">{r.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-purple-600 uppercase mb-1">Frequency</p>
                    <p className="text-xs text-purple-800">{test.frequency}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Mineral & Bone Profile */}
          <section className="mb-12" id="mineral-bone">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-100 rounded-xl">
                <FlaskConical className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Mineral &amp; Bone Profile</h2>
            </div>
            <p className="text-sm text-slate-600 mb-6">CKD-Mineral and Bone Disorder (CKD-MBD) is a serious complication. As kidney function declines, calcium, phosphorus, and PTH imbalances lead to bone disease and cardiovascular calcification.</p>
            <div className="space-y-6">
              {mineralBoneTests.map((test, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{test.icon}</span>
                    <h3 className="text-lg font-bold text-slate-900">{test.name}</h3>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Normal Range</p>
                    <p className="text-sm font-medium text-blue-800">{test.normalRange}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">What Your Results Mean</p>
                    <div className="space-y-1.5">
                      {test.whatResultsMean.map((r, ri) => (
                        <div key={ri} className="flex items-center gap-3 text-sm">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            r.color === 'green' ? 'bg-emerald-500' :
                            r.color === 'yellow' ? 'bg-yellow-500' :
                            r.color === 'orange' ? 'bg-orange-500' :
                            'bg-red-500'
                          }`} />
                          <span className="font-medium text-slate-800 min-w-[120px]">{r.range}:</span>
                          <span className="text-slate-600">{r.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-purple-600 uppercase mb-1">Frequency</p>
                    <p className="text-xs text-purple-800">{test.frequency}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CBC & Blood Tests */}
          <section className="mb-12" id="cbc-blood">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 rounded-xl">
                <TestTube className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">CBC &amp; Blood Tests</h2>
            </div>
            <p className="text-sm text-slate-600 mb-6">Anemia is nearly universal in advanced CKD. These tests help diagnose the type and severity of anemia and guide treatment with erythropoietin and iron supplementation.</p>
            <div className="space-y-6">
              {cbcBloodTests.map((test, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{test.icon}</span>
                    <h3 className="text-lg font-bold text-slate-900">{test.name}</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{test.whatItIs}</p>
                  <div className="bg-blue-50 rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Normal Range</p>
                    <p className="text-sm font-medium text-blue-800">{test.normalRange}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">What Your Results Mean</p>
                    <div className="space-y-1.5">
                      {test.whatResultsMean.map((r, ri) => (
                        <div key={ri} className="flex items-center gap-3 text-sm">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            r.color === 'green' ? 'bg-emerald-500' :
                            r.color === 'yellow' ? 'bg-yellow-500' :
                            r.color === 'orange' ? 'bg-orange-500' :
                            'bg-red-500'
                          }`} />
                          <span className="font-medium text-slate-800 min-w-[120px]">{r.range}:</span>
                          <span className="text-slate-600">{r.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-purple-600 uppercase mb-1">Frequency</p>
                    <p className="text-xs text-purple-800">{test.frequency}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Diabetes Monitoring */}
          <section className="mb-12" id="diabetes">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-pink-100 rounded-xl">
                <Droplet className="h-5 w-5 text-pink-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Diabetes Monitoring</h2>
            </div>
            <p className="text-sm text-slate-600 mb-6">Diabetes is the #1 cause of kidney disease worldwide. Tight blood sugar control is essential to slow progression of diabetic kidney disease.</p>
            <div className="space-y-6">
              {diabetesTests.map((test, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{test.icon}</span>
                    <h3 className="text-lg font-bold text-slate-900">{test.name}</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{test.whatItIs}</p>
                  <div className="bg-blue-50 rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Normal Range</p>
                    <p className="text-sm font-medium text-blue-800">{test.normalRange}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">What Your Results Mean</p>
                    <div className="space-y-1.5">
                      {test.whatResultsMean.map((r, ri) => (
                        <div key={ri} className="flex items-center gap-3 text-sm">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            r.color === 'green' ? 'bg-emerald-500' :
                            r.color === 'yellow' ? 'bg-yellow-500' :
                            r.color === 'orange' ? 'bg-orange-500' :
                            'bg-red-500'
                          }`} />
                          <span className="font-medium text-slate-800 min-w-[120px]">{r.range}:</span>
                          <span className="text-slate-600">{r.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-purple-600 uppercase mb-1">Frequency</p>
                    <p className="text-xs text-purple-800">{test.frequency}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Heart & Metabolic Risk */}
          <section className="mb-12" id="heart-metabolic">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-rose-100 rounded-xl">
                <Heart className="h-5 w-5 text-rose-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Heart &amp; Metabolic Risk</h2>
            </div>
            <p className="text-sm text-slate-600 mb-6">CKD patients have 10-20x higher cardiovascular risk than the general population. Heart disease is the leading cause of death in CKD patients.</p>
            <div className="grid md:grid-cols-2 gap-6">
              {heartMetabolicTests.map((test, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{test.icon}</span>
                    <h3 className="text-lg font-bold text-slate-900">{test.name}</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{test.whatItIs}</p>
                  <div className="bg-blue-50 rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Normal Range</p>
                    <p className="text-sm font-medium text-blue-800">{test.normalRange}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">What Your Results Mean</p>
                    <div className="space-y-1.5">
                      {test.whatResultsMean.map((r, ri) => (
                        <div key={ri} className="flex items-center gap-3 text-sm">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            r.color === 'green' ? 'bg-emerald-500' :
                            r.color === 'yellow' ? 'bg-yellow-500' :
                            r.color === 'orange' ? 'bg-orange-500' :
                            'bg-red-500'
                          }`} />
                          <span className="font-medium text-slate-800 min-w-[120px]">{r.range}:</span>
                          <span className="text-slate-600">{r.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-purple-600 uppercase mb-1">Frequency</p>
                    <p className="text-xs text-purple-800">{test.frequency}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Nutrition Tests */}
          <section className="mb-12" id="nutrition">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-xl">
                <Apple className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Nutrition Tests</h2>
            </div>
            <p className="text-sm text-slate-600 mb-6">Malnutrition is common in CKD, especially in advanced stages. Protein-energy wasting is associated with poor outcomes and hospitalization.</p>
            <div className="grid md:grid-cols-2 gap-6">
              {nutritionTests.map((test, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{test.icon}</span>
                    <h3 className="text-lg font-bold text-slate-900">{test.name}</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{test.whatItIs}</p>
                  <div className="bg-blue-50 rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Normal Range</p>
                    <p className="text-sm font-medium text-blue-800">{test.normalRange}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">What Your Results Mean</p>
                    <div className="space-y-1.5">
                      {test.whatResultsMean.map((r, ri) => (
                        <div key={ri} className="flex items-center gap-3 text-sm">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            r.color === 'green' ? 'bg-emerald-500' :
                            r.color === 'yellow' ? 'bg-yellow-500' :
                            r.color === 'orange' ? 'bg-orange-500' :
                            'bg-red-500'
                          }`} />
                          <span className="font-medium text-slate-800 min-w-[120px]">{r.range}:</span>
                          <span className="text-slate-600">{r.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-purple-600 uppercase mb-1">Frequency</p>
                    <p className="text-xs text-purple-800">{test.frequency}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Dialysis Tests */}
          <section className="mb-12" id="dialysis-tests">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-cyan-100 rounded-xl">
                <Activity className="h-5 w-5 text-cyan-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Dialysis-Specific Tests</h2>
            </div>
            <p className="text-sm text-slate-600 mb-6">Patients on dialysis require regular monitoring of dialysis adequacy and screening for blood-borne infections as part of standard dialysis protocol.</p>
            <div className="space-y-6">
              {dialysisTests.map((test, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{test.icon}</span>
                    <h3 className="text-lg font-bold text-slate-900">{test.name}</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{test.whatItIs}</p>
                  <div className="bg-blue-50 rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold text-blue-600 uppercase mb-1">Normal Range</p>
                    <p className="text-sm font-medium text-blue-800">{test.normalRange}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">What Your Results Mean</p>
                    <div className="space-y-1.5">
                      {test.whatResultsMean.map((r, ri) => (
                        <div key={ri} className="flex items-center gap-3 text-sm">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            r.color === 'green' ? 'bg-emerald-500' :
                            r.color === 'yellow' ? 'bg-yellow-500' :
                            r.color === 'orange' ? 'bg-orange-500' :
                            'bg-red-500'
                          }`} />
                          <span className="font-medium text-slate-800 min-w-[120px]">{r.range}:</span>
                          <span className="text-slate-600">{r.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-purple-600 uppercase mb-1">Frequency</p>
                    <p className="text-xs text-purple-800">{test.frequency}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Kidney Biopsy */}
          <section className="mb-12" id="biopsy">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-xl">
                <Microscope className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Kidney Biopsy</h2>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <p className="text-sm text-slate-600 mb-4">{biopsySection.whatItIs}</p>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-800 mb-3">When Is a Kidney Biopsy Needed?</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {biopsySection.whenIsItNeeded.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-600 bg-slate-50 rounded-xl p-3">
                      <CheckCircle className="h-4 w-4 text-[#0A75BB] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <p className="text-xs font-semibold text-blue-600 uppercase mb-1">The Procedure</p>
                <p className="text-sm text-blue-800">{biopsySection.procedure}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Risks</h3>
                <div className="space-y-2">
                  {biopsySection.risks.map((risk, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-slate-600">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-emerald-600 uppercase mb-1">Results</p>
                <p className="text-sm text-emerald-800">{biopsySection.results}</p>
              </div>
            </div>
          </section>

          {/* Comparison Table */}
          <section className="mb-12" id="comparison">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Kidney Test Comparison Table</h2>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-6 py-3 font-bold text-slate-700">Test</th>
                      <th className="text-left px-6 py-3 font-bold text-slate-700">Type</th>
                      <th className="text-left px-6 py-3 font-bold text-slate-700">Purpose</th>
                      <th className="text-left px-6 py-3 font-bold text-slate-700">Frequency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testComparison.map((row, i) => (
                      <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="px-6 py-3 font-semibold text-slate-800">{row.test}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            row.type === 'Blood' ? 'bg-red-100 text-red-700' :
                            row.type === 'Urine' ? 'bg-amber-100 text-amber-700' :
                            row.type === 'Imaging' ? 'bg-blue-100 text-blue-700' :
                            row.type === 'Electrolyte' ? 'bg-yellow-100 text-yellow-700' :
                            row.type === 'Mineral' ? 'bg-orange-100 text-orange-700' :
                            row.type === 'Diabetes' ? 'bg-pink-100 text-pink-700' :
                            row.type === 'Heart' ? 'bg-rose-100 text-rose-700' :
                            row.type === 'Nutrition' ? 'bg-green-100 text-green-700' :
                            row.type === 'Dialysis' ? 'bg-cyan-100 text-cyan-700' :
                            row.type === 'Tissue' ? 'bg-purple-100 text-purple-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>{row.type}</span>
                        </td>
                        <td className="px-6 py-3 text-slate-600">{row.purpose}</td>
                        <td className="px-6 py-3 text-slate-600">{row.frequency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-[#0A75BB] to-[#085D94] rounded-2xl p-8 text-center text-white">
              <h2 className="text-2xl font-bold mb-3">Get Your Kidneys Tested Today</h2>
              <p className="text-white/80 mb-6 max-w-xl mx-auto">
                Don&apos;t wait for symptoms. Early detection of kidney disease can prevent progression to kidney failure. Consult Dr. Rajesh Goel for comprehensive kidney evaluation.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/book-appointment?type=online" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#0A75BB] font-semibold rounded-xl hover:bg-white/90 transition-colors">
                  Book Online Consultation <ChevronRight className="h-4 w-4" />
                </Link>
                <Link href="/book-appointment" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors border border-white/20">
                  Visit Clinic <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className="mb-12" id="faqs">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details key={i} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <summary className="px-6 py-4 cursor-pointer font-medium text-slate-800 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    {faq.q}
                    <ChevronRight className="h-4 w-4 text-slate-400 group-open:rotate-90 transition-transform shrink-0 ml-2" />
                  </summary>
                  <div className="px-6 pb-4 text-sm text-slate-600 leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* Related Conditions */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Kidney Conditions</h2>
            <p className="text-sm text-slate-600 mb-4">These tests are used to diagnose and monitor the following kidney conditions:</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Link href="/conditions/chronic-kidney-disease" className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 hover:border-[#0A75BB] hover:shadow-md transition-all">
                <span className="text-2xl">🏥</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Chronic Kidney Disease</p>
                  <p className="text-xs text-slate-500">eGFR &lt;60 for 3+ months</p>
                </div>
              </Link>
              <Link href="/conditions/diabetic-kidney-disease" className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 hover:border-[#0A75BB] hover:shadow-md transition-all">
                <span className="text-2xl">💉</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Diabetic Kidney Disease</p>
                  <p className="text-xs text-slate-500">uACR &gt;30 mg/g</p>
                </div>
              </Link>
              <Link href="/conditions/kidney-stones" className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 hover:border-[#0A75BB] hover:shadow-md transition-all">
                <span className="text-2xl">💎</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Kidney Stones</p>
                  <p className="text-xs text-slate-500">Imaging &amp; urine tests</p>
                </div>
              </Link>
              <Link href="/conditions/acute-kidney-injury" className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 hover:border-[#0A75BB] hover:shadow-md transition-all">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Acute Kidney Injury</p>
                  <p className="text-xs text-slate-500">Sudden creatinine rise</p>
                </div>
              </Link>
              <Link href="/conditions/nephrotic-syndrome" className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 hover:border-[#0A75BB] hover:shadow-md transition-all">
                <span className="text-2xl">🧬</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Nephrotic Syndrome</p>
                  <p className="text-xs text-slate-500">Proteinuria &gt;3.5 g/day</p>
                </div>
              </Link>
              <Link href="/conditions/polycystic-kidney-disease" className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 hover:border-[#0A75BB] hover:shadow-md transition-all">
                <span className="text-2xl">🫧</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Polycystic Kidney Disease</p>
                  <p className="text-xs text-slate-500">Ultrasound screening</p>
                </div>
              </Link>
            </div>
            <div className="mt-4 text-center">
              <Link href="/conditions" className="text-sm text-[#0A75BB] font-semibold hover:underline">
                View All Kidney Conditions →
              </Link>
            </div>
          </section>

          {/* Last Reviewed */}
          <div className="text-center text-xs text-slate-400 mb-8">
            <p>Medically reviewed by <Link href="/dr-rajesh-goel" className="text-[#0A75BB] hover:underline">Dr Rajesh Goel</Link>, Senior Nephrologist, New Delhi</p>
            <p className="mt-1">Last reviewed: January 2025 | Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
