import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_CONFIG, DOCTOR_INFO, CONSULTATION_FEE } from '@/lib/constants';
import {
  MedicalOrganizationSchema,
  PhysicianSchema,
  FAQSchema,
  WebPageSchema,
} from '@/components/seo/JsonLd';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Online Nephrologist Consultation in India | Book Video Call | Dr Rajesh Goel',
  description:
    'Consult the best nephrologist online in India. Dr Rajesh Goel (18+ years exp) offers video consultation for CKD, high creatinine, kidney failure, dialysis, transplant & all kidney diseases. Book now — starting ₹1000.',
  keywords: [
    'online nephrologist consultation',
    'consult nephrologist online',
    'online kidney specialist',
    'kidney doctor online consultation',
    'best nephrologist online',
    'online kidney consultation',
    'kidney specialist consultation online',
    'video consultation nephrologist',
    'kidney doctor online india',
    'nephrologist consultation india',
    'online kidney treatment',
    'kidney disease specialist',
    'ckd specialist online',
    'renal specialist online',
    'kidney care online',
    'kidney transplant consultation',
    'dialysis specialist online',
    'high creatinine treatment online',
    'protein in urine treatment',
    'blood in urine kidney doctor',
    'kidney stones treatment online',
    'diabetic kidney disease specialist',
    'second opinion nephrologist online',
    'online renal consultation india',
    'kidney specialist for international patients',
    'dr rajesh goel nephrologist',
    'best nephrologist in delhi',
    'kidney specialist delhi',
    'online nephrologist for diabetes kidney disease',
    'chronic kidney disease treatment online',
  ],
  openGraph: {
    title: 'Online Nephrologist Consultation in India | Dr Rajesh Goel',
    description:
      'Consult the best nephrologist online in India. Video consultation for CKD, high creatinine, kidney failure, dialysis, transplant. Book now!',
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: '/images/dr-rajesh-goel.png',
        width: 1200,
        height: 630,
        alt: 'Dr Rajesh Goel - Online Nephrologist Consultation',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Nephrologist Consultation | Dr Rajesh Goel',
    description: 'Book online kidney specialist consultation. CKD, dialysis, transplant, high creatinine treatment.',
    images: ['/images/dr-rajesh-goel.png'],
  },
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const faqs = [
  { question: 'Can I consult a nephrologist online?', answer: 'Yes, you can consult Dr Rajesh Goel, a senior nephrologist with 18+ years of experience, entirely online through video consultation. This is ideal for follow-ups, second opinions, and initial consultations for patients who cannot visit in person. You can book an online appointment through our website or WhatsApp at +91 9818235613.' },
  { question: 'Is online kidney consultation effective?', answer: 'Yes, online kidney consultation is highly effective for most non-emergency situations. Dr Rajesh Goel can review your blood reports, urine tests, ultrasound reports, and medication history through video call. He provides the same quality diagnosis, treatment planning, and prescription as an in-person visit. For procedures like dialysis or physical examination, an in-clinic visit may be recommended.' },
  { question: 'What reports should I upload before an online consultation?', answer: 'Before your online consultation, please have these ready: Recent kidney function tests (creatinine, eGFR, BUN, electrolytes), complete blood count (CBC), urine routine and microscopy, ultrasound abdomen (if done), any previous biopsy reports, current medication list, and blood pressure records if available. Upload these through our booking portal or share via WhatsApp before your appointment.' },
  { question: 'Can I get kidney treatment without visiting the clinic?', answer: 'Yes, for many kidney conditions, Dr Rajesh Goel can prescribe medications and treatment plans through online consultation. This includes management of CKD stages 1-4, blood pressure control, diabetes-related kidney issues, dietary guidance, and medication adjustments. For dialysis, transplant evaluation, or emergency situations, an in-person visit is necessary.' },
  { question: 'Can international patients consult online?', answer: 'Absolutely. Dr Rajesh Goel regularly consults with international patients from the USA, UK, UAE, Singapore, and other countries. The consultation fee for international patients is $20 USD (₹1500). We can coordinate across time zones and provide treatment plans that can be followed locally with your referring physician.' },
  { question: 'Can I get a second opinion from Dr Rajesh Goel?', answer: 'Yes, Dr Rajesh Goel frequently provides second opinions for kidney disease patients. If you have been diagnosed with CKD, kidney failure, or need a transplant evaluation, a second opinion from an experienced nephrologist can help you understand your options better. Simply book an online consultation and share your existing reports.' },
  { question: 'Can medicines be prescribed online in India?', answer: 'Yes, under Indian medical regulations, registered doctors can prescribe medicines through online consultation. Dr Rajesh Goel will provide a detailed prescription after your video consultation. You can purchase the prescribed medicines from any pharmacy. For certain controlled substances, an in-person consultation may be required.' },
  { question: 'What diseases does a nephrologist treat?', answer: 'A nephrologist treats all kidney-related conditions including Chronic Kidney Disease (CKD), Acute Kidney Injury (AKI), kidney stones, diabetic kidney disease, hypertensive kidney disease, nephrotic syndrome, glomerulonephritis, polycystic kidney disease, electrolyte disorders, kidney infections, proteinuria, hematuria, and prepares patients for dialysis or kidney transplant.' },
  { question: 'What is the consultation fee?', answer: 'The consultation fee for domestic patients is ₹1000 and for international patients it is $20 USD (₹1500). This covers a comprehensive evaluation, review of all reports, personalized treatment plan, prescription, and follow-up guidance. There are no hidden charges.' },
  { question: 'How long is the online consultation?', answer: 'Online consultations with Dr Rajesh Goel typically last 15-30 minutes, depending on the complexity of your case. This is sufficient time to review your reports, discuss symptoms, explain the diagnosis, and create a treatment plan. Follow-up consultations may be shorter.' },
  { question: 'What is Chronic Kidney Disease (CKD)?', answer: 'Chronic Kidney Disease (CKD) is a condition where the kidneys gradually lose their ability to filter waste from the blood. It is classified into 5 stages based on eGFR (estimated Glomerular Filtration Rate). Early stages (1-2) may have no symptoms, while advanced stages (4-5) can cause fatigue, swelling, nausea, and eventually require dialysis or transplant. Common causes include diabetes, high blood pressure, and glomerulonephritis.' },
  { question: 'When should I see a nephrologist for high creatinine?', answer: 'You should consult a nephrologist if your serum creatinine is consistently above 1.2 mg/dL (men) or 1.0 mg/dL (women), or if there is a sudden rise in creatinine levels. A rising creatinine indicates declining kidney function. Dr Rajesh Goel can evaluate the cause, stage the kidney disease, and start appropriate treatment to slow progression.' },
  { question: 'What is eGFR and why is it important?', answer: 'eGFR (estimated Glomerular Filtration Rate) measures how well your kidneys filter waste from blood. A normal eGFR is above 90 mL/min/1.73m². An eGFR below 60 for 3 or more months indicates CKD. Below 15 indicates kidney failure. eGFR is the most important number to track kidney health. You can calculate your eGFR using our online eGFR calculator.' },
  { question: 'What causes high creatinine levels?', answer: 'High creatinine can be caused by Chronic Kidney Disease, dehydration, high protein diet, certain medications (NSAIDs, ACE inhibitors), kidney stones, urinary tract obstruction, muscle injury, or acute kidney injury. Dr Rajesh Goel will evaluate the underlying cause through blood tests, urine tests, and imaging to provide appropriate treatment.' },
  { question: 'When is dialysis needed?', answer: 'Dialysis is typically needed when eGFR drops below 10-15 mL/min (Stage 5 CKD / kidney failure) or when symptoms of uremia become severe (nausea, vomiting, confusion, difficulty breathing, severe swelling). Dr Rajesh Goel will assess your overall condition, nutritional status, and symptoms to determine the right time to start dialysis. Early planning for dialysis access (fistula) is recommended when eGFR drops below 20.' },
  { question: 'What is the difference between hemodialysis and peritoneal dialysis?', answer: 'Hemodialysis uses a machine to filter blood outside the body, typically done 3 times a week at a dialysis center. Peritoneal dialysis uses the lining of your abdomen (peritoneum) to filter blood inside your body, which can be done at home. Dr Rajesh Goel will help you choose the best option based on your lifestyle, medical condition, and preferences.' },
  { question: 'Can kidney disease be reversed?', answer: 'Early-stage CKD (stages 1-2) can sometimes be reversed if the underlying cause is treated (e.g., controlling diabetes, treating infections). Later stages (3-5) are generally not reversible, but progression can be significantly slowed with proper treatment, diet, and lifestyle changes. The key is early detection and consistent management under a nephrologist.' },
  { question: 'What foods should kidney disease patients avoid?', answer: 'Kidney disease patients should limit sodium (salt), potassium-rich foods (bananas, oranges, potatoes, tomatoes), phosphorus-rich foods (dairy, nuts, colas), and protein (in advanced CKD). They should also limit fluid intake in later stages. Each patient\'s dietary needs are different based on their stage, lab values, and dialysis status. Dr Rajesh Goel provides personalized diet guidance. Use our potassium calculator to check food potassium levels.' },
  { question: 'Is kidney transplant better than dialysis?', answer: 'For eligible patients, kidney transplant generally offers better quality of life and long-term survival compared to dialysis. A successful transplant eliminates the need for dialysis, allows more dietary freedom, and provides better overall health. However, not everyone is a transplant candidate, and lifelong immunosuppressive medications are required. Dr Rajesh Goel can evaluate your transplant eligibility during consultation.' },
  { question: 'What is protein in urine (proteinuria)?', answer: 'Proteinuria means excess protein in urine, which is an early sign of kidney damage. Normally, kidneys prevent protein from leaking into urine. When kidneys are damaged, protein leaks through. It is detected by urine test (uACR or urine dipstick). Persistent proteinuria requires evaluation by a nephrologist to determine the cause and start treatment. Check your uACR using our online calculator.' },
  { question: 'What is blood in urine (hematuria)?', answer: 'Blood in urine (hematuria) can be a sign of kidney stones, urinary tract infection, kidney disease, or in rare cases, kidney cancer. It may be visible (red/pink urine) or microscopic (detected only on lab test). Any persistent blood in urine should be evaluated by a nephrologist. Dr Rajesh Goel will order appropriate tests to identify the cause.' },
  { question: 'How is kidney disease related to diabetes?', answer: 'Diabetic kidney disease (diabetic nephropathy) is the leading cause of kidney failure worldwide. High blood sugar damages the small blood vessels in kidneys over time, reducing their filtering ability. About 40% of diabetic patients develop kidney disease. Early screening with urine albumin test and eGFR is crucial for diabetic patients. Dr Rajesh Goel specializes in managing diabetic kidney disease.' },
  { question: 'Can high blood pressure cause kidney disease?', answer: 'Yes, hypertension (high blood pressure) is the second leading cause of kidney disease after diabetes. Uncontrolled BP damages kidney blood vessels, reducing their ability to filter waste. Conversely, kidney disease also raises blood pressure, creating a dangerous cycle. Maintaining BP below 130/80 is crucial for kidney patients. Dr Rajesh Goel provides specialized hypertension management.' },
  { question: 'What is kidney stone and how is it treated?', answer: 'Kidney stones are hard deposits of minerals and salts that form inside kidneys. They cause severe pain when they move through the urinary tract. Treatment depends on stone size and location: small stones pass with hydration and pain management, while larger stones may need lithotripsy (shock wave), ureteroscopy, or surgery. Dr Rajesh Goel provides prevention strategies including diet and medication.' },
  { question: 'What are the symptoms of kidney failure?', answer: 'Symptoms of kidney failure include: severe fatigue, loss of appetite, nausea/vomiting, swelling in legs/ankles/face, shortness of breath, difficulty sleeping, muscle cramps, foamy or bloody urine, frequent urination (especially at night), and itching. In advanced stages, confusion and seizures may occur. These symptoms require urgent nephrology evaluation.' },
  { question: 'How often should I get my kidneys checked?', answer: 'If you have diabetes, high blood pressure, or a family history of kidney disease, get screened annually with urine albumin test and eGFR. If you have existing kidney disease, frequency depends on your stage: Stage 1-2 (every 6-12 months), Stage 3 (every 3-6 months), Stage 4-5 (every 1-3 months). Regular monitoring is key to catching problems early.' },
  { question: 'What is the normal creatinine level?', answer: 'Normal serum creatinine ranges are: Men: 0.7-1.3 mg/dL, Women: 0.6-1.1 mg/dL. However, "normal" varies by age, muscle mass, and body size. A creatinine of 1.5 may be normal for a muscular young man but abnormal for an elderly woman. What matters most is the trend — a rising creatinine over time indicates declining kidney function.' },
  { question: 'What is a kidney biopsy and when is it needed?', answer: 'A kidney biopsy involves taking a small sample of kidney tissue with a needle for examination under a microscope. It is needed when: the cause of kidney disease is unclear, treatment is not working, kidney function is declining rapidly, or there is suspicion of glomerulonephritis or other specific conditions. Dr Rajesh Goel performs biopsies at PSRI Hospital, New Delhi.' },
  { question: 'How can I prevent kidney disease?', answer: 'Prevent kidney disease by: controlling blood sugar (if diabetic), maintaining healthy blood pressure below 130/80, staying hydrated, reducing salt intake, maintaining healthy weight, exercising regularly, avoiding smoking and excessive alcohol, avoiding overuse of painkillers (NSAIDs), and getting regular kidney function tests if you have risk factors.' },
  { question: 'What is the role of a nephrologist vs a urologist?', answer: 'A nephrologist is a kidney medicine specialist who manages medical kidney diseases (CKD, kidney failure, electrolyte disorders, glomerulonephritis, dialysis management). A urologist is a surgeon who treats structural problems of the urinary system (kidney stones, prostate issues, urinary tract infections, bladder problems). Some conditions like kidney stones may need both.' },
];

export default function HomePage() {
  return (
    <>
      <MedicalOrganizationSchema />
      <PhysicianSchema />
      <FAQSchema faqs={faqs} />
      <WebPageSchema
        title="Online Nephrologist Consultation in India"
        description={SITE_CONFIG.description}
        url={SITE_CONFIG.url}
        image="/images/dr-rajesh-goel.png"
      />

      <Navbar />

      {/* Hero Section — Primary Keyword Targeted */}
      <section className="relative bg-gradient-to-br from-[#0A75BB] to-[#063d5c] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/kidney_logo.png')] bg-repeat opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Available for Online Consultation
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Online Nephrologist Consultation in <span className="text-blue-200">India</span>
              </h1>
              <p className="text-lg text-blue-100 mb-4 leading-relaxed">
                Consult <strong className="text-white">Dr Rajesh Goel</strong>, one of the best nephrologists in Delhi, online from anywhere in India or abroad. <strong className="text-white">18+ years of experience</strong> treating CKD, kidney failure, dialysis, transplant, and all kidney conditions.
              </p>
              <p className="text-sm text-blue-200 mb-8 leading-relaxed">
                Expert kidney specialist online consultation via video call. Get diagnosis, treatment plan, and prescription without leaving your home. Starting at just ₹1000.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <Link href="/book-appointment" className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-[#0A75BB] font-bold rounded-xl hover:bg-gray-100 transition-all shadow-xl text-base sm:text-lg">
                  Book Online Consultation
                </Link>
                <a href={`tel:${SITE_CONFIG.phone}`} className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all text-base sm:text-lg">
                  Call: +91 9818235613
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-blue-200">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  18+ Years Experience
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  Video Consultation
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  Starting ₹{CONSULTATION_FEE}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  International Patients Welcome
                </span>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden shadow-2xl">
                  <img src="/images/dr-rajesh-goel.png" alt="Dr Rajesh Goel - Online Nephrologist Consultation India" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl px-4 py-3 shadow-lg">
                  <div className="text-[#0A75BB] font-bold text-sm">Dr Rajesh Goel</div>
                  <div className="text-gray-500 text-xs">Nephrologist, Delhi</div>
                </div>
                <div className="absolute -top-4 -right-4 bg-green-500 text-white rounded-xl px-3 py-2 shadow-lg text-sm font-semibold">
                  18+ Years
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-[#0A75BB]">18+</div>
              <div className="text-sm text-gray-500">Years Experience</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#0A75BB]">10,000+</div>
              <div className="text-sm text-gray-500">Patients Treated</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#0A75BB]">3</div>
              <div className="text-sm text-gray-500">Clinic Locations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#0A75BB]">4.9</div>
              <div className="text-sm text-gray-500">Patient Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section — E-E-A-T */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Consult Dr Rajesh Goel Online?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">One of the best nephrologists in Delhi with 18+ years of experience, now available for online kidney consultation across India and internationally.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🩺', title: '18+ Years Experience', desc: 'DNB Nephrology from PSRI Hospital. Kidney Transplant Fellowship from Medanta Hospital. Expert in all kidney diseases.' },
              { icon: '🏥', title: '3 Clinic Locations', desc: 'PSRI Hospital Saket, Kidney Care Centre Faridabad, and Kidney Care Centre Saket. Plus online consultation from anywhere.' },
              { icon: '📹', title: 'Video Consultation', desc: 'Consult from home via video call. Same quality care — report review, diagnosis, prescription, and follow-up guidance.' },
              { icon: '🌍', title: 'International Patients', desc: 'Patients from USA, UK, UAE, Singapore consult regularly. ₹1500 ($20) for international patients. Time zone flexible.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-all">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Online Consultation Process */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How Online Kidney Consultation Works</h2>
            <p className="text-gray-600">Book your appointment in 3 simple steps — consult the best nephrologist online from anywhere</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Book Appointment', desc: 'Choose online video consultation. Pick a date and time that works for you.', icon: '📅' },
              { step: '2', title: 'Upload Reports', desc: 'Share your kidney function tests, urine reports, ultrasound, and medication list via WhatsApp or booking portal.', icon: '📄' },
              { step: '3', title: 'Video Consultation', desc: 'Meet Dr Rajesh Goel via video call. Discuss symptoms, review reports, and get personalized treatment plan.', icon: '📹' },
              { step: '4', title: 'Get Prescription', desc: 'Receive digital prescription and treatment plan. Medicines can be purchased from any pharmacy.', icon: '💊' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-[#0A75BB] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">{item.step}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/book-online-consultation" className="inline-flex items-center gap-2 px-8 py-4 bg-[#0A75BB] text-white font-bold rounded-xl hover:bg-[#085a94] transition-all shadow-lg text-lg">
              Book Online Consultation Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Conditions Treated — Internal Links */}
      <section className="py-16 bg-gray-50" id="conditions">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Kidney Conditions Treated Online</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Dr Rajesh Goel treats all kidney conditions through online consultation. Click on any condition to learn more.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🫘', title: 'Chronic Kidney Disease (CKD)', desc: 'Expert management of all CKD stages. Slowing progression, dietary guidance, and medication management.', href: '/conditions/chronic-kidney-disease' },
              { icon: '💉', title: 'Dialysis Management', desc: 'Comprehensive dialysis care — when to start, access planning, peritoneal vs hemodialysis.', href: '/conditions/dialysis' },
              { icon: '🫀', title: 'Kidney Transplant', desc: 'Pre-transplant evaluation, post-transplant care, second opinions for transplant.', href: '/conditions/kidney-transplant' },
              { icon: '🩸', title: 'High Creatinine Treatment', desc: 'Evaluation of rising creatinine levels, identifying the cause, and treatment to slow kidney decline.', href: '/conditions/chronic-kidney-disease' },
              { icon: '🔬', title: 'Protein in Urine', desc: 'Diagnosis and treatment of proteinuria — early sign of kidney damage.', href: '/conditions/nephrotic-syndrome' },
              { icon: '🩸', title: 'Blood in Urine', desc: 'Evaluation of hematuria — kidney stones, infections, or kidney disease.', href: '/conditions/kidney-stones' },
              { icon: '💎', title: 'Kidney Stones', desc: 'Prevention, dietary changes, and treatment for recurrent kidney stones.', href: '/conditions/kidney-stones' },
              { icon: '🩺', title: 'Diabetic Kidney Disease', desc: 'Specialized management of kidney disease caused by diabetes.', href: '/conditions/diabetic-kidney-disease' },
              { icon: '❤️', title: 'Hypertension & Kidneys', desc: 'Blood pressure management to protect kidney function.', href: '/conditions/hypertension-kidney-disease' },
            ].map((service, i) => (
              <Link key={i} href={service.href} className="block bg-white rounded-xl p-6 shadow-sm border hover:shadow-md hover:border-[#0A75BB] transition-all group">
                <div className="text-3xl mb-3">{service.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#0A75BB] transition-colors">{service.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{service.desc}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/conditions" className="text-[#0A75BB] font-semibold hover:underline">View All Kidney Conditions →</Link>
          </div>
        </div>
      </section>

      {/* Who Should Consult Online */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Who Should Consult a Nephrologist Online?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">If you have any of these symptoms or conditions, consult Dr Rajesh Goel for expert kidney care online.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { text: 'Swelling in legs, ankles, or face', href: '/conditions/chronic-kidney-disease' },
              { text: 'Foamy or frothy urine (protein in urine)', href: '/conditions/nephrotic-syndrome' },
              { text: 'Blood in urine (pink or red urine)', href: '/conditions/kidney-stones' },
              { text: 'Persistent high blood pressure', href: '/conditions/hypertension-kidney-disease' },
              { text: 'Diabetes with kidney concerns', href: '/conditions/diabetic-kidney-disease' },
              { text: 'Recurrent kidney stones', href: '/conditions/kidney-stones' },
              { text: 'Elevated creatinine in blood test', href: '/tests-for-kidney-disease' },
              { text: 'Low eGFR on kidney function test', href: '/tests-for-kidney-disease' },
              { text: 'Chronic fatigue and weakness', href: '/conditions/chronic-kidney-disease' },
              { text: 'Loss of appetite and nausea', href: '/conditions/acute-kidney-injury' },
              { text: 'Muscle cramps and numbness', href: '/conditions/electrolyte-disorders' },
              { text: 'Difficulty sleeping in kidney disease', href: '/conditions/chronic-kidney-disease' },
            ].map((item, i) => (
              <Link key={i} href={item.href} className="flex items-center gap-3 p-4 bg-red-50 rounded-lg hover:bg-red-100 hover:shadow-sm transition-all group">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                <span className="text-gray-700 text-sm font-medium group-hover:text-[#0A75BB] transition-colors">{item.text}</span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/book-appointment" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] transition-all shadow-md">
              Consult Dr Rajesh Goel Now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits of Online Consultation */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Benefits of Online Kidney Consultation</h2>
            <p className="text-gray-600">Why thousands of patients prefer online consultation with Dr Rajesh Goel</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🏠', title: 'Consult From Home', desc: 'No travel, no waiting rooms. Get expert kidney care from the comfort of your home.' },
              { icon: '🕐', title: 'Flexible Scheduling', desc: 'Book appointments at your convenience. Morning, evening, or weekend slots available.' },
              { icon: '🌍', title: 'Access From Anywhere', desc: 'Patients from any city in India or abroad can consult. No geographical barriers.' },
              { icon: '📋', title: 'Report Review Online', desc: 'Dr Goel reviews all your reports during the video call and explains findings clearly.' },
              { icon: '💊', title: 'Digital Prescription', desc: 'Get prescription immediately after consultation. Purchase medicines from any pharmacy.' },
              { icon: '🔄', title: 'Easy Follow-ups', desc: 'Track progress with regular online follow-ups. Adjust treatment without clinic visits.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Reports to Bring */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Reports to Bring for Online Consultation</h2>
            <p className="text-gray-600">Have these ready before your video consultation for a thorough evaluation</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Essential Reports</h3>
              <ul className="space-y-3">
                {[
                  'Kidney Function Tests (Creatinine, eGFR, BUN, Electrolytes)',
                  'Complete Blood Count (CBC)',
                  'Urine Routine & Microscopy',
                  'Blood Sugar (Fasting & Post-meal)',
                  'HbA1c (if diabetic)',
                  'Lipid Profile',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Also Bring (If Available)</h3>
              <ul className="space-y-3">
                {[
                  'Ultrasound Abdomen / KUB',
                  'Previous biopsy reports',
                  'CT scan / MRI (if done)',
                  'Current medication list',
                  'Blood pressure records',
                  'Any previous prescriptions',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Internal Links — Related Pages */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Kidney Health Resources</h2>
            <p className="text-gray-600">Educational resources to help you understand your kidney health</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Kidney Tests Guide', desc: 'Blood tests, urine tests, imaging — complete guide', href: '/tests-for-kidney-disease', icon: '🧪' },
              { title: 'Health Calculators', desc: 'BMI, eGFR, Potassium, Creatinine calculators', href: '/calculators', icon: '🔢' },
              { title: 'Medicines Guide', desc: 'Commonly prescribed kidney medicines', href: '/medicines', icon: '💊' },
              { title: 'Medical Terms', desc: 'OD, BD, SOS — prescription abbreviations explained', href: '/medical-abbreviations', icon: '📋' },
              { title: 'Kidney Diet Guide', desc: 'Diet tips for CKD patients', href: '/conditions/chronic-kidney-disease', icon: '🥗' },
              { title: 'Patient Videos', desc: 'Educational videos by Dr Rajesh Goel', href: '/videos', icon: '🎬' },
              { title: 'Medical Tourism', desc: 'International patient services', href: '/medical-tourism', icon: '✈️' },
              { title: 'About Dr Goel', desc: 'Qualifications, experience, and profile', href: '/dr-rajesh-goel', icon: '👨‍⚕️' },
            ].map((item, i) => (
              <Link key={i} href={item.href} className="block bg-white rounded-xl p-5 shadow-sm border hover:shadow-md hover:border-[#0A75BB] transition-all group text-center">
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="font-bold text-gray-900 group-hover:text-[#0A75BB] transition-colors text-sm">{item.title}</h3>
                <p className="text-gray-500 text-xs mt-1">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Symptoms */}
      <section className="py-16 bg-red-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border-2 border-red-200 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-red-700 mb-3">🚨 Emergency Symptoms — Seek Immediate Care</h2>
              <p className="text-red-600">If you experience any of these, visit the nearest emergency room or call for immediate medical help.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Severe difficulty breathing',
                'Chest pain or pressure',
                'Sudden severe swelling (face, legs)',
                'Confusion or difficulty speaking',
                'Seizures',
                'Very high blood pressure (>180/120)',
                'Sudden decrease in urine output',
                'Severe nausea/vomiting with inability to keep fluids down',
                'High potassium symptoms (muscle weakness, palpitations)',
                'Uncontrolled bleeding',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <svg className="w-5 h-5 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                  <span className="text-sm text-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <a href="tel:108" className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all">
                Call Emergency: 108
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Doctor Profile Card */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden md:flex">
            <div className="md:w-1/3">
              <img src="/images/dr-rajesh-goel.png" alt="Dr Rajesh Goel - Online Nephrologist Consultation" className="w-full h-64 md:h-full object-cover" />
            </div>
            <div className="md:w-2/3 p-8">
              <div className="text-sm text-[#0A75BB] font-semibold mb-1">Senior Nephrologist & Kidney Transplant Physician</div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Dr Rajesh Goel</h2>
              <p className="text-gray-500 mb-4">{DOCTOR_INFO.qualifications.join(' | ')}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {DOCTOR_INFO.specializations.slice(0, 6).map((spec, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-50 text-[#0A75BB] text-xs font-medium rounded-full">{spec}</span>
                ))}
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">{DOCTOR_INFO.bio}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/dr-rajesh-goel" className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#0A75BB] text-[#0A75BB] font-semibold rounded-lg hover:bg-[#0A75BB] hover:text-white transition-all">
                  View Full Profile
                </Link>
                <Link href="/book-appointment" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0A75BB] text-white font-semibold rounded-lg hover:bg-[#085a94] transition-all">
                  Book Appointment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section — 30+ FAQs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">Common questions about online nephrologist consultation, kidney diseases, and treatment</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="bg-white rounded-xl shadow-sm border group">
                <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-900 flex items-center justify-between hover:text-[#0A75BB] text-sm">
                  {faq.question}
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </summary>
                <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">{faq.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[#0A75BB] to-[#063d5c] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Book Your Online Nephrologist Consultation Today</h2>
          <p className="text-blue-100 mb-4 text-lg">Don&apos;t wait — get expert kidney care from Dr Rajesh Goel. Consultation starting at ₹1000.</p>
          <p className="text-blue-200 mb-8 text-sm">WhatsApp us at +91 9818235613 or book directly through our website.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book-appointment" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#0A75BB] font-bold rounded-xl hover:bg-gray-100 transition-all shadow-xl text-lg">
              Book Appointment
            </Link>
            <a href="https://wa.me/919818235613" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all text-lg">
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
