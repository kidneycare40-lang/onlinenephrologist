import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';
import { BreadcrumbSchema, FAQSchema } from '@/components/seo/JsonLd';
import { JsonLd } from '@/components/seo/JsonLd';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TestTube, Droplets, Scan, Microscope, ChevronRight, CheckCircle, AlertTriangle, Info, Shield, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tests for Kidney Disease | eGFR, Creatinine, Urine Test, Ultrasound | Dr Rajesh Goel Delhi',
  description: 'Complete guide to kidney disease tests - eGFR, serum creatinine, urine albumin (uACR), BUN, cystatin C, kidney ultrasound and biopsy. Book kidney function test with Dr Rajesh Goel, Senior Nephrologist in Delhi. Call +91 98182 35613.',
  keywords: [
    'kidney disease tests', 'kidney function test', 'kidney test near me', 'renal function test',
    'eGFR test', 'eGFR normal range', 'eGFR calculator', 'estimated glomerular filtration rate',
    'serum creatinine test', 'creatinine test', 'creatinine normal range',
    'urine albumin test', 'uACR test', 'urine albumin to creatinine ratio', 'microalbumin test',
    'BUN test', 'blood urea nitrogen', 'kidney blood test',
    'cystatin C test', 'kidney ultrasound', 'renal ultrasound', 'kidney biopsy',
    'urinalysis', 'urine test kidney disease', 'protein in urine test',
    'how to test kidney function', 'kidney disease screening', 'kidney stone test',
    'nephrologist Delhi', 'kidney specialist Delhi', 'Dr Rajesh Goel nephrologist',
    'kidney disease diagnosis', 'chronic kidney disease test', 'CKD test',
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
  { test: 'eGFR', type: 'Blood', purpose: 'Measures overall kidney function', frequency: 'Every 3-12 months' },
  { test: 'Serum Creatinine', type: 'Blood', purpose: 'Indicates how well kidneys filter waste', frequency: 'Every 3-12 months' },
  { test: 'BUN', type: 'Blood', purpose: 'Measures urea nitrogen waste product', frequency: 'Every 3-12 months' },
  { test: 'Cystatin C', type: 'Blood', purpose: 'Alternative kidney function marker', frequency: 'As needed' },
  { test: 'uACR', type: 'Urine', purpose: 'Detects early kidney damage (albumin leak)', frequency: 'Annually' },
  { test: 'Urinalysis', type: 'Urine', purpose: 'Screening for infection, blood, protein', frequency: 'Annually' },
  { test: 'uPCR', type: 'Urine', purpose: 'Measures total protein in urine', frequency: 'Every 3-12 months' },
  { test: 'Kidney Ultrasound', type: 'Imaging', purpose: 'Evaluates kidney structure and size', frequency: 'As needed' },
  { test: 'CT Scan', type: 'Imaging', purpose: 'Detailed imaging for stones, tumors, trauma', frequency: 'As needed' },
  { test: 'Kidney Biopsy', type: 'Tissue', purpose: 'Definitive diagnosis of kidney disease', frequency: 'Once (diagnostic)' },
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
              <a href="#blood-tests" className="flex items-center gap-2 text-sm text-[#0A75BB] hover:underline"><span className="text-[#0A75BB] font-bold">1.</span> Blood Tests (eGFR, Creatinine, BUN, Cystatin C)</a>
              <a href="#urine-tests" className="flex items-center gap-2 text-sm text-[#0A75BB] hover:underline"><span className="text-[#0A75BB] font-bold">2.</span> Urine Tests (uACR, Urinalysis, uPCR)</a>
              <a href="#imaging-tests" className="flex items-center gap-2 text-sm text-[#0A75BB] hover:underline"><span className="text-[#0A75BB] font-bold">3.</span> Imaging Tests (Ultrasound, CT, MRI)</a>
              <a href="#biopsy" className="flex items-center gap-2 text-sm text-[#0A75BB] hover:underline"><span className="text-[#0A75BB] font-bold">4.</span> Kidney Biopsy</a>
              <a href="#comparison" className="flex items-center gap-2 text-sm text-[#0A75BB] hover:underline"><span className="text-[#0A75BB] font-bold">5.</span> Test Comparison Table</a>
              <a href="#faqs" className="flex items-center gap-2 text-sm text-[#0A75BB] hover:underline"><span className="text-[#0A75BB] font-bold">6.</span> Frequently Asked Questions</a>
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
                Dr. Rajesh Goel, Senior Nephrologist with 15+ years of experience, recommends at least annual kidney function screening for all at-risk patients. Early detection allows for lifestyle changes and medications that can slow or stop kidney disease progression.
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
                          'bg-purple-100 text-purple-700'
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
                            'bg-purple-100 text-purple-700'
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
