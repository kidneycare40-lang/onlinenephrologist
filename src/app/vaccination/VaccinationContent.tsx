'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BreadcrumbSchema, WebPageSchema } from '@/components/seo/JsonLd';
import {
  Syringe, Download, AlertTriangle, Shield, Calendar, Pill, Loader2,
  Heart, CheckCircle, AlertCircle, ArrowRight, Stethoscope, Clock,
} from 'lucide-react';
import Link from 'next/link';

async function downloadPDF() {
  const res = await fetch('/api/vaccination/pdf');
  if (!res.ok) throw new Error('Failed to generate PDF');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Vaccination-Record-Kidney-Patient.pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function InjectionDiagram() {
  return (
    <svg viewBox="0 0 400 300" className="w-full max-w-md mx-auto" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#f0f7ff" rx="12" />
      <path d="M120,60 Q200,20 280,60 Q320,80 330,140 Q340,200 300,250 L100,250 Q60,200 70,140 Q80,80 120,60Z" fill="#fde8d0" stroke="#d4a574" strokeWidth="2" />
      <path d="M140,70 Q180,50 240,70 Q270,90 280,140 Q285,180 260,210 L140,210 Q115,180 120,140 Q125,90 140,70Z" fill="#e85555" opacity="0.7" stroke="#c44" strokeWidth="1.5" />
      <line x1="155" y1="80" x2="150" y2="195" stroke="#c44" strokeWidth="0.5" opacity="0.5" />
      <line x1="175" y1="65" x2="170" y2="200" stroke="#c44" strokeWidth="0.5" opacity="0.5" />
      <line x1="195" y1="58" x2="190" y2="205" stroke="#c44" strokeWidth="0.5" opacity="0.5" />
      <line x1="215" y1="60" x2="210" y2="205" stroke="#c44" strokeWidth="0.5" opacity="0.5" />
      <line x1="235" y1="68" x2="230" y2="200" stroke="#c44" strokeWidth="0.5" opacity="0.5" />
      <line x1="255" y1="82" x2="250" y2="190" stroke="#c44" strokeWidth="0.5" opacity="0.5" />
      <path d="M185,90 Q190,85 195,90 L195,230 Q190,235 185,230Z" fill="#f5f0e8" stroke="#d4c4a8" strokeWidth="1" />
      <circle cx="200" cy="130" r="25" fill="none" stroke="#0A75BB" strokeWidth="2.5" strokeDasharray="5,3" />
      <circle cx="200" cy="130" r="4" fill="#0A75BB" />
      <g transform="translate(280, 80) rotate(35)">
        <rect x="45" y="8" width="30" height="2.5" fill="#888" rx="1" />
        <polygon points="75,9.25 85,9.25 75,6 75,12.5" fill="#aaa" />
        <rect x="10" y="3" width="35" height="12.5" fill="#ddd" stroke="#999" strokeWidth="1" rx="2" />
        <rect x="2" y="6" width="10" height="6" fill="#0A75BB" rx="1" />
      </g>
      <line x1="265" y1="95" x2="225" y2="120" stroke="#0A75BB" strokeWidth="2" markerEnd="url(#arrowhead)" />
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#0A75BB" />
        </marker>
      </defs>
      <text x="200" y="280" textAnchor="middle" fontFamily="Arial" fontSize="11" fontWeight="bold" fill="#333">
        Injection into the Deltoid Muscle (Upper Arm)
      </text>
      <text x="200" y="295" textAnchor="middle" fontFamily="Arial" fontSize="8.5" fill="#777">
        0.5 ml to 1.0 ml for adults  |  25-26 gauge needle  |  90 degrees angle
      </text>
    </svg>
  );
}

export default function VaccinationContent() {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    setDownloading(true);
    setError('');
    try {
      await downloadPDF();
    } catch {
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <Navbar />
      <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Vaccination for Kidney Patients', url: '/vaccination' }]} />
      <WebPageSchema title="Vaccination for Kidney Patients: CKD, Dialysis & Transplant" description="Essential vaccines for people with CKD, dialysis and kidney transplantation." url="/vaccination" />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0A75BB] to-[#063d5c] text-white py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4 text-sm">
            <Syringe className="h-4 w-4" /> Vaccination for Kidney Patients
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">VACCINATION FOR KIDNEY PATIENTS</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-4">
            Essential vaccines for people with CKD, dialysis and kidney transplantation
          </p>
          <p className="text-blue-200 text-sm max-w-2xl mx-auto mb-6">
            Kidney disease and dialysis can increase the risk of certain infections. Vaccination is an important part of preventive kidney care. The vaccines you need may depend on your age, kidney function, dialysis status and whether you have had a kidney transplant.
          </p>
          <button onClick={handleDownload} disabled={downloading} className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#0A75BB] font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-lg disabled:opacity-50">
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {downloading ? 'Generating PDF...' : 'Download Vaccination Record PDF'}
          </button>
          {error && <p className="mt-3 text-sm text-red-200">{error}</p>}
        </div>
      </section>

      <section className="py-8 md:py-12 bg-gray-50 min-h-[60vh]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Why vaccination matters */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-bold mb-1">Why is vaccination important in kidney disease?</p>
                <p>People with chronic kidney disease (CKD), those on dialysis and kidney transplant recipients are at increased risk of infections due to altered immunity. Vaccination helps protect against serious and potentially life-threatening infections. Vaccination should ideally be reviewed and completed before dialysis or kidney transplantation whenever possible.</p>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 1. HEPATITIS B */}
          {/* ============================================================ */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0"><Syringe className="h-4 w-4 text-red-600" /></div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">1. Hepatitis B Vaccine</h2>
                <p className="text-sm text-gray-500 font-medium">Engerix-B / Shanvac-B / Enivac B (or any approved brand)</p>
              </div>
            </div>
            <div className="ml-11 space-y-3 text-sm text-gray-700">
              <p><span className="font-semibold">Why important:</span> Hepatitis B infection is a serious risk for patients with advanced CKD, patients approaching dialysis and especially haemodialysis patients. Vaccination is a key part of pre-dialysis care.</p>
              <p><span className="font-semibold">Route:</span> Injection into a muscle (upper arm for adults, thigh for infants)</p>
              <p><span className="font-semibold">Dose:</span> 2 ml (40 mcg) IM each time</p>
              <div className="bg-gray-50 rounded-lg p-4 mt-3">
                <p className="font-semibold text-gray-900 mb-2">Schedule (confirm with your nephrologist):</p>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2"><span className="w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span> <strong>1st Dose — Day 0</strong></li>
                  <li className="flex items-center gap-2"><span className="w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span> <strong>2nd Dose — 1st month</strong></li>
                  <li className="flex items-center gap-2"><span className="w-6 h-6 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span> <strong>3rd Dose — 2nd month</strong></li>
                  <li className="flex items-center gap-2"><span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span> <strong>4th Dose — 6th month</strong></li>
                </ul>
              </div>
              <p className="text-xs text-gray-500 italic">Note: Vaccine response may be lower in advanced CKD. Completing the full series is important.</p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-3">
                <p className="font-bold text-amber-900 mb-1">Anti-HBs Antibody Monitoring</p>
                <p className="text-amber-800">After completing the vaccination series, your nephrologist may check Anti-HBs antibody levels. In dialysis patients, an Anti-HBs level of <strong className="text-amber-900">{'≥'}10 mIU/mL</strong> is generally considered protective. Periodic antibody monitoring and booster/revaccination may be required when immunity declines, as advised by your treating nephrologist.</p>
              </div>

              <p className="text-xs text-gray-500 italic">Vaccination should ideally be completed before dialysis or kidney transplantation whenever possible.</p>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 2. INFLUENZA */}
          {/* ============================================================ */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0"><Syringe className="h-4 w-4 text-orange-600" /></div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">2. Influenza Vaccine</h2>
                <p className="text-sm text-gray-500 font-medium">Seasonal flu vaccine (Influvac or any approved brand)</p>
              </div>
            </div>
            <div className="ml-11 space-y-3 text-sm text-gray-700">
              <p><span className="font-semibold">Why important:</span> Kidney patients can be at increased risk of complications from influenza. Annual vaccination helps reduce this risk.</p>
              <p><span className="font-semibold">Dose:</span> 0.5 ml IM — once every year</p>
              <p><span className="font-semibold">When:</span> Take the seasonal influenza vaccine every year at the recommended time for your region. The ideal timing depends on the influenza season and current local recommendations.</p>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 3. PNEUMOCOCCAL */}
          {/* ============================================================ */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0"><Shield className="h-4 w-4 text-purple-600" /></div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">3. Pneumococcal Vaccine</h2>
                <p className="text-sm text-gray-500 font-medium">Protects against serious pneumococcal infection</p>
              </div>
            </div>
            <div className="ml-11 space-y-3 text-sm text-gray-700">
              <p><span className="font-semibold">Why important:</span> People with CKD, nephrotic syndrome and kidney failure have an increased risk of serious pneumococcal infection.</p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="font-bold text-amber-900 mb-1">Important — Your vaccination history matters</p>
                <p className="text-amber-800">The appropriate pneumococcal vaccine and interval depend on your <strong>age, CKD stage, dialysis status, immune status</strong> and <strong>previous pneumococcal vaccination</strong>. Currently available options include PCV20, PCV21, PCV15 and PPSV23.</p>
                <p className="text-amber-800 mt-2">If you have previously received PCV13, PPSV23, PCV15, PCV20 or another pneumococcal vaccine, your next dose may be different. <strong>Do not assume that you need another dose without reviewing your vaccination record with your nephrologist.</strong></p>
              </div>

              <p>Ask your nephrologist to review your previous vaccination record before receiving any pneumococcal vaccine.</p>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 4. SHINGLES / SHINGRIX */}
          {/* ============================================================ */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0"><Syringe className="h-4 w-4 text-green-600" /></div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">4. Shingles Vaccine (Shingrix)</h2>
                <p className="text-sm text-gray-500 font-medium">Recombinant zoster vaccine — 2 doses</p>
              </div>
            </div>
            <div className="ml-11 space-y-3 text-sm text-gray-700">
              <p><span className="font-semibold">Recommended for:</span></p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Adults <strong>50 years and older</strong></li>
                <li>Adults <strong>19 years and older</strong> who are immunocompromised or at increased risk, according to current recommendations</li>
              </ul>
              <p><span className="font-semibold">Schedule:</span> Usually given as 2 doses. The interval may vary depending on the patient&apos;s immune status. Confirm timing with your nephrologist.</p>
              <p className="text-xs text-gray-500 italic">Note: Shingrix is a non-live recombinant vaccine. The live shingles vaccine (Zostavax) is generally not recommended for immunocompromised patients.</p>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 5. COVID-19 */}
          {/* ============================================================ */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center shrink-0"><Shield className="h-4 w-4 text-cyan-600" /></div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">5. COVID-19 Vaccine</h2>
                <p className="text-sm text-gray-500 font-medium">As per current national recommendations</p>
              </div>
            </div>
            <div className="ml-11 space-y-3 text-sm text-gray-700">
              <p><span className="font-semibold">Why important:</span> People with advanced CKD, dialysis patients and transplant recipients may be at increased risk of severe COVID-19.</p>
              <p>Keep COVID-19 vaccination <strong>up to date</strong> according to the current age- and risk-based recommendations in your region.</p>
              <p><span className="font-semibold">Kidney transplant patients:</span> Should follow their transplant team&apos;s vaccination schedule, as timing may need to be coordinated with immunosuppressive therapy.</p>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 6. Tdap / Td */}
          {/* ============================================================ */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center shrink-0"><Pill className="h-4 w-4 text-teal-600" /></div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">6. Tetanus, Diphtheria & Pertussis (Tdap/Td)</h2>
                <p className="text-sm text-gray-500 font-medium">Routine adult vaccination</p>
              </div>
            </div>
            <div className="ml-11 space-y-3 text-sm text-gray-700">
              <p>Kidney patients should also remain up to date with routine adult vaccinations, including Tdap/Td according to the applicable adult immunization schedule.</p>
              <p><span className="font-semibold">What it protects against:</span> Tetanus (lockjaw), diphtheria and pertussis (whooping cough).</p>
              <p>Your nephrologist can advise on the correct booster schedule for your situation.</p>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 7. OTHER VACCINES */}
          {/* ============================================================ */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0"><Calendar className="h-4 w-4 text-indigo-600" /></div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">7. Other Vaccines — Depending on Age and Medical Condition</h2>
                <p className="text-sm text-gray-500 font-medium">Your nephrologist may recommend additional vaccines</p>
              </div>
            </div>
            <div className="ml-11 space-y-3 text-sm text-gray-700">
              <p>Your nephrologist may recommend additional vaccines depending on your age, kidney disease, immune status, travel plans and whether you are preparing for kidney transplantation.</p>
              <p>These may include:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {['Hepatitis A', 'MMR (Measles, Mumps, Rubella)', 'Varicella', 'HPV (Human Papillomavirus)', 'RSV Vaccine', 'Meningococcal Vaccine', 'Travel-related vaccines'].map((v) => (
                  <div key={v} className="bg-gray-50 rounded-lg px-3 py-2 text-sm font-medium text-gray-700">{v}</div>
                ))}
              </div>
              <p className="text-xs text-gray-500 italic">This list is not exhaustive. Do not assume you need every vaccine listed — your doctor will guide you based on your individual situation.</p>
            </div>
          </div>

          {/* ============================================================ */}
          {/* TRANSPLANT WARNING */}
          {/* ============================================================ */}
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-lg font-bold text-red-900">Kidney Transplant Patients — Important</h2>
              </div>
            </div>
            <div className="ml-9 space-y-3 text-sm text-red-800">
              <ul className="list-disc ml-5 space-y-2">
                <li><strong>Vaccination planning should ideally be completed before kidney transplantation</strong> whenever possible.</li>
                <li>After transplantation, patients take <strong>immunosuppressive medicines</strong> which can affect vaccine responses.</li>
                <li><strong className="text-red-900">Do not receive a live vaccine after kidney transplantation unless specifically advised by your transplant team.</strong> This includes MMR, Varicella and live shingles vaccines.</li>
                <li>Vaccination status should be reviewed during transplant evaluation.</li>
              </ul>
            </div>
          </div>

          {/* ============================================================ */}
          {/* VACCINES BEFORE TRANSPLANT */}
          {/* ============================================================ */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0"><Clock className="h-4 w-4 text-orange-600" /></div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Vaccines Before Kidney Transplant</h2>
                <p className="text-sm text-gray-500 font-medium">Plan early — some vaccines need time before surgery</p>
              </div>
            </div>
            <div className="ml-11 space-y-3 text-sm text-gray-700">
              <p>Transplant candidates should have their vaccination status reviewed <strong>early</strong> during the evaluation process because:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Some vaccines require multiple doses over several months</li>
                <li>Live vaccines (e.g., MMR, Varicella) must be given <strong>at least 4 weeks before</strong> transplantation and after that may be unsafe</li>
                <li>Vaccine responses may be better before transplantation than after</li>
              </ul>
              <p className="text-xs text-gray-500 italic">Your transplant team will guide you on the correct timing. Do not self-schedule vaccinations without transplant team approval.</p>
            </div>
          </div>

          {/* ============================================================ */}
          {/* INJECTION SITE DIAGRAM */}
          {/* ============================================================ */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0"><Pill className="h-4 w-4 text-blue-600" /></div>
              <div><h2 className="text-lg font-bold text-gray-900">How to Take Injection (Deltoid Muscle)</h2></div>
            </div>
            <div className="ml-11">
              <InjectionDiagram />
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="font-bold text-blue-900">Site</p>
                  <p className="text-blue-700">Deltoid muscle (upper arm, 2-3 finger widths below shoulder)</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="font-bold text-blue-900">Needle</p>
                  <p className="text-blue-700">25-26 gauge, 1 inch (25mm) for adults</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="font-bold text-blue-900">Angle</p>
                  <p className="text-blue-700">90 degrees perpendicular to skin</p>
                </div>
              </div>
              <div className="mt-3 bg-amber-50 rounded-lg p-3 text-sm">
                <p className="font-bold text-amber-900">Important Tips:</p>
                <ul className="text-amber-800 mt-1 space-y-1 list-disc ml-4">
                  <li>Use the opposite arm of fistula/AV access (for dialysis patients)</li>
                  <li>Rotate injection sites if giving multiple vaccines</li>
                  <li>0.5 ml to 1.0 ml volume for adults</li>
                  <li>Inject into the muscle, NOT subcutaneous (under skin)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* EMERGENCY MEDICINES FOR VACCINATION REACTIONS */}
          {/* ============================================================ */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0"><AlertTriangle className="h-4 w-4 text-red-600" /></div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Emergency Medicines for Vaccination Reactions</h2>
                <p className="text-sm text-gray-500 font-medium">Common medicines for mild-to-moderate side effects after vaccination</p>
              </div>
            </div>
            <div className="ml-11 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#B41E1E] text-white">
                    <th className="px-3 py-2.5 text-left rounded-tl-lg">Reaction (प्रतिक्रिया)</th>
                    <th className="px-3 py-2.5 text-left">Medicine (दवाई)</th>
                    <th className="px-3 py-2.5 text-left">How to Take (कैसे लें)</th>
                    <th className="px-3 py-2.5 text-left rounded-tr-lg">Dose (मात्रा)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 bg-red-50/50">
                    <td className="px-3 py-2.5 font-semibold text-red-800">Fever (बुखार)</td>
                    <td className="px-3 py-2.5 font-medium">Tab Dolo 650 / Crocin 500 mg</td>
                    <td className="px-3 py-2.5">After food (खाने के बाद)</td>
                    <td className="px-3 py-2.5">1 tab SOS</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-2.5 font-semibold text-red-800">Body pain / Headache<br/><span className="text-xs font-normal text-red-600">(शरीर दर्द / सिरदर्द)</span></td>
                    <td className="px-3 py-2.5 font-medium">Tab Paracetamol 500 mg / Crocin</td>
                    <td className="px-3 py-2.5">After food (खाने के बाद)</td>
                    <td className="px-3 py-2.5">1 tab SOS</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-red-50/50">
                    <td className="px-3 py-2.5 font-semibold text-red-800">Pain / Swelling at injection site<br/><span className="text-xs font-normal text-red-600">(टीके की जगह दर्द / सूजन)</span></td>
                    <td className="px-3 py-2.5 font-medium">Tab Ibuprofen 400 mg / Combiflam</td>
                    <td className="px-3 py-2.5">After food (खाने के बाद)</td>
                    <td className="px-3 py-2.5">1 tab SOS</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-2.5 font-semibold text-red-800">Allergic rash / Itching<br/><span className="text-xs font-normal text-red-600">(एलर्जी की खुजली)</span></td>
                    <td className="px-3 py-2.5 font-medium">Tab Cetirizine 10 mg / Levocetirizine</td>
                    <td className="px-3 py-2.5">After food (खाने के बाद)</td>
                    <td className="px-3 py-2.5">1 tab SOS</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2.5 font-semibold text-red-800 rounded-bl-lg">Vomiting / Nausea<br/><span className="text-xs font-normal text-red-600">(उल्टी / जी मिचलाना)</span></td>
                    <td className="px-3 py-2.5 font-medium">Tab Emset 4mg / Ondem</td>
                    <td className="px-3 py-2.5">Before food (खाने से पहले)</td>
                    <td className="px-3 py-2.5 rounded-br-lg">1 tab SOS</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 ml-11 text-xs text-gray-500 italic">SOS = जरूरत पड़ने पर (As needed). These medicines are for mild-to-moderate reactions only.</p>

            <div className="mt-4 ml-11 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-bold text-red-900 text-sm mb-1">Seek immediate medical attention if you experience:</p>
              <ul className="text-red-800 text-sm space-y-1 list-disc ml-4">
                <li>Difficulty breathing or wheezing</li>
                <li>Swelling of face, lips, tongue or throat</li>
                <li>Severe dizziness or fainting</li>
                <li>Rapid heartbeat</li>
                <li>High fever ({'>'}102°F / 39°C) not responding to medicines</li>
                <li>Severe allergic reaction (anaphylaxis)</li>
              </ul>
              <p className="mt-2 text-red-700 text-xs font-semibold">Call emergency services or go to the nearest hospital immediately. Do not wait.</p>
            </div>

            <div className="mt-4 ml-11 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
              <p className="font-bold text-amber-900">Kidney patients: Always check with your nephrologist before taking any medicine, even over-the-counter drugs. Some pain medicines (e.g., NSAIDs like Ibuprofen) may not be suitable for advanced CKD or dialysis patients.</p>
            </div>
          </div>

          {/* ============================================================ */}
          {/* WHEN TO DISCUSS VACCINATION */}
          {/* ============================================================ */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0"><Stethoscope className="h-4 w-4 text-green-600" /></div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">When Should Kidney Patients Discuss Vaccination?</h2>
              </div>
            </div>
            <div className="ml-11">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'At CKD diagnosis',
                  'Before starting dialysis',
                  'During dialysis',
                  'During transplant evaluation',
                  'Before kidney transplantation',
                  'After kidney transplantation',
                  'Before starting immunosuppressive treatment',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-600 shrink-0" /> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* VACCINATION RECORD TABLE */}
          {/* ============================================================ */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-[#0A75BB]/10 rounded-lg flex items-center justify-center shrink-0"><Calendar className="h-4 w-4 text-[#0A75BB]" /></div>
              <div><h2 className="text-lg font-bold text-gray-900">Vaccination Record</h2><p className="text-sm text-gray-500 font-medium">Use this table to track your vaccines</p></div>
            </div>
            <div className="ml-11 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#0A75BB] text-white">
                    <th className="px-3 py-2.5 text-left rounded-tl-lg">Vaccine</th>
                    <th className="px-3 py-2.5 text-left">Dose / Date</th>
                    <th className="px-3 py-2.5 text-left">Next Due</th>
                    <th className="px-3 py-2.5 text-left rounded-tr-lg">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {['Hepatitis B', 'Influenza', 'Pneumococcal', 'COVID-19', 'Shingrix (Shingles)', 'Tdap / Td', 'Other: ________'].map((v, i) => (
                    <tr key={v} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-gray-50' : ''}`}>
                      <td className="px-3 py-3 font-medium">{v}</td>
                      <td className="px-3 py-3 text-gray-400">___/___/______</td>
                      <td className="px-3 py-3 text-gray-400">___/___/______</td>
                      <td className="px-3 py-3 text-gray-400">______________</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ============================================================ */}
          {/* IMPORTANT THINGS TO REMEMBER */}
          {/* ============================================================ */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0"><AlertCircle className="h-4 w-4 text-amber-600" /></div>
              <div><h2 className="text-lg font-bold text-gray-900">Important Things to Remember</h2></div>
            </div>
            <div className="ml-11">
              <ul className="space-y-2 text-sm text-gray-700">
                {[
                  'Do not wait until dialysis starts to review your vaccination status.',
                  'Keep a record of all vaccines you have received.',
                  'Previous vaccination history matters — always share it with your doctor.',
                  'Vaccine schedules can differ between patients based on age, kidney function and immune status.',
                  'Kidney transplant patients require special consideration.',
                  'Some live vaccines may not be appropriate after transplantation.',
                  'Always tell your doctor about your kidney disease and current medicines before vaccination.',
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[#0A75BB] shrink-0 mt-0.5" /> {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ============================================================ */}
          {/* DOWNLOAD CTA */}
          {/* ============================================================ */}
          <div className="text-center my-8">
            <button onClick={handleDownload} disabled={downloading} className="inline-flex items-center gap-2 px-8 py-3 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] transition-all shadow-lg disabled:opacity-50">
              {downloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
              {downloading ? 'Generating PDF...' : 'Download Vaccination Record PDF'}
            </button>
          </div>

          {/* ============================================================ */}
          {/* CONSULT CTA */}
          {/* ============================================================ */}
          <div className="bg-gradient-to-r from-[#0A75BB] to-[#063d5c] rounded-xl p-6 mb-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold mb-1">Need help understanding which vaccines you need?</h3>
                <p className="text-blue-100 text-sm">Consult a nephrologist for personalised vaccination advice based on your kidney disease, dialysis status and transplant plans.</p>
              </div>
              <Link href="/book-appointment" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#0A75BB] font-semibold rounded-xl hover:bg-blue-50 transition-all shrink-0">
                Consult a Nephrologist <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* ============================================================ */}
          {/* MEDICAL DISCLAIMER */}
          {/* ============================================================ */}
          <div className="bg-gray-100 border border-gray-200 rounded-xl p-5 mb-6">
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>Medical Disclaimer:</strong> This page provides general educational information and does not replace individual medical advice. Vaccination recommendations may vary depending on age, CKD stage, dialysis status, transplant status, immune status, previous vaccination and local guidelines. Please consult your nephrologist or transplant team before receiving vaccines. Vaccination schedules presented here are general guides and may not be appropriate for every patient.
            </p>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}
