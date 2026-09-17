'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BreadcrumbSchema, WebPageSchema } from '@/components/seo/JsonLd';
import {
  Syringe, Download, AlertTriangle, Shield, Calendar, Pill, Loader2, Heart,
} from 'lucide-react';

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
      {/* Background */}
      <rect width="400" height="300" fill="#f0f7ff" rx="12" />

      {/* Shoulder outline */}
      <path d="M120,60 Q200,20 280,60 Q320,80 330,140 Q340,200 300,250 L100,250 Q60,200 70,140 Q80,80 120,60Z" fill="#fde8d0" stroke="#d4a574" strokeWidth="2" />

      {/* Deltoid muscle */}
      <path d="M140,70 Q180,50 240,70 Q270,90 280,140 Q285,180 260,210 L140,210 Q115,180 120,140 Q125,90 140,70Z" fill="#e85555" opacity="0.7" stroke="#c44" strokeWidth="1.5" />

      {/* Muscle fibers */}
      <line x1="155" y1="80" x2="150" y2="195" stroke="#c44" strokeWidth="0.5" opacity="0.5" />
      <line x1="175" y1="65" x2="170" y2="200" stroke="#c44" strokeWidth="0.5" opacity="0.5" />
      <line x1="195" y1="58" x2="190" y2="205" stroke="#c44" strokeWidth="0.5" opacity="0.5" />
      <line x1="215" y1="60" x2="210" y2="205" stroke="#c44" strokeWidth="0.5" opacity="0.5" />
      <line x1="235" y1="68" x2="230" y2="200" stroke="#c44" strokeWidth="0.5" opacity="0.5" />
      <line x1="255" y1="82" x2="250" y2="190" stroke="#c44" strokeWidth="0.5" opacity="0.5" />

      {/* Bone (humerus) */}
      <path d="M185,90 Q190,85 195,90 L195,230 Q190,235 185,230Z" fill="#f5f0e8" stroke="#d4c4a8" strokeWidth="1" />

      {/* Injection site - dotted circle */}
      <circle cx="200" cy="130" r="25" fill="none" stroke="#0A75BB" strokeWidth="2.5" strokeDasharray="5,3" />

      {/* Injection point */}
      <circle cx="200" cy="130" r="4" fill="#0A75BB" />

      {/* Syringe */}
      <g transform="translate(280, 80) rotate(35)">
        {/* Needle */}
        <rect x="45" y="8" width="30" height="2.5" fill="#888" rx="1" />
        <polygon points="75,9.25 85,9.25 75,6 75,12.5" fill="#aaa" />
        {/* Barrel */}
        <rect x="10" y="3" width="35" height="12.5" fill="#ddd" stroke="#999" strokeWidth="1" rx="2" />
        {/* Plunger */}
        <rect x="2" y="6" width="10" height="6" fill="#0A75BB" rx="1" />
        {/* Markings */}
        <line x1="18" y1="5" x2="18" y2="13" stroke="#999" strokeWidth="0.5" />
        <line x1="25" y1="5" x2="25" y2="13" stroke="#999" strokeWidth="0.5" />
        <line x1="32" y1="5" x2="32" y2="13" stroke="#999" strokeWidth="0.5" />
        <line x1="39" y1="5" x2="39" y2="13" stroke="#999" strokeWidth="0.5" />
      </g>

      {/* Arrow pointing to injection site */}
      <line x1="265" y1="95" x2="225" y2="120" stroke="#0A75BB" strokeWidth="2" markerEnd="url(#arrowhead)" />
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#0A75BB" />
        </marker>
      </defs>

      {/* Labels */}
      <text x="200" y="280" textAnchor="middle" fontFamily="Arial" fontSize="11" fontWeight="bold" fill="#333">
        Injection into the Deltoid Muscle (Upper Arm)
      </text>
      <text x="200" y="295" textAnchor="middle" fontFamily="Arial" fontSize="8.5" fill="#777">
        0.5 ml to 1.0 ml for adults  |  25-26 gauge needle  |  90° angle
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
      <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Vaccination Record', url: '/vaccination' }]} />
      <WebPageSchema title="Vaccination Record for Kidney Patients" description="Complete vaccination record and schedule for chronic kidney disease patients." url="/vaccination" />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0A75BB] to-[#063d5c] text-white py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4 text-sm">
            <Syringe className="h-4 w-4" /> Vaccination Record
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">VACCINATION RECORD</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Recommended vaccinations for chronic kidney disease patients
          </p>
          <button onClick={handleDownload} disabled={downloading} className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white text-[#0A75BB] font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-lg disabled:opacity-50">
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {downloading ? 'Generating PDF...' : 'Download PDF'}
          </button>
          {error && <p className="mt-3 text-sm text-red-200">{error}</p>}
        </div>
      </section>

      <section className="py-8 md:py-12 bg-gray-50 min-h-[60vh]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-bold mb-1">Above doses applicable in case of chronic kidney disease</p>
              <ol className="list-decimal ml-5 space-y-1 mt-2">
                <li>To check for adequate immune response - Anti HBs antibody titres every 6 months.</li>
                <li>Protective titres for kidney disease patients are {`>`}100 miu/ml.</li>
              </ol>
            </div>
          </div>

          {/* 1. Hepatitis B */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0"><Syringe className="h-4 w-4 text-red-600" /></div>
              <div><h2 className="text-lg font-bold text-gray-900">1. Hepatitis B</h2><p className="text-sm text-gray-600 font-medium">Engerix-B / Shanvac-B / Enivac B (or any brand)</p></div>
            </div>
            <div className="ml-11 space-y-3 text-sm text-gray-700">
              <p><span className="font-semibold">Route:</span> Injection into a muscle (upper arm for adults, thigh for infants)</p>
              <p><span className="font-semibold">Dose:</span> 2 ml (40 mcg) IM each time</p>
              <div className="bg-gray-50 rounded-lg p-4 mt-3">
                <p className="font-semibold text-gray-900 mb-2">Schedule:</p>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2"><span className="w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span> <strong>1st Dose, Day 0</strong></li>
                  <li className="flex items-center gap-2"><span className="w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span> <strong>2nd Dose (1st month)</strong></li>
                  <li className="flex items-center gap-2"><span className="w-6 h-6 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span> <strong>3rd Dose (2nd month)</strong></li>
                  <li className="flex items-center gap-2"><span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span> <strong>4th Dose (6th month)</strong></li>
                </ul>
              </div>
            </div>
          </div>

          {/* 2. Influenza */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0"><Syringe className="h-4 w-4 text-orange-600" /></div>
              <div><h2 className="text-lg font-bold text-gray-900">2. Influenza Vaccine Inj.</h2><p className="text-sm text-gray-600 font-medium">Influvac (or any brand)</p></div>
            </div>
            <div className="ml-11 text-sm text-gray-700"><p><span className="font-semibold">Dose:</span> 0.5 ml I/M stat (once a year) - (May/June)</p></div>
          </div>

          {/* 3. Pneumococcal */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0"><Shield className="h-4 w-4 text-purple-600" /></div>
              <div><h2 className="text-lg font-bold text-gray-900">3. Pneumococcal Vaccine</h2></div>
            </div>
            <div className="ml-11 text-sm text-gray-700">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <p><strong>A)</strong> Injection Prevenar 20 vaccine (PCV 20) IM - No need to repeat</p>
                <p><strong>B)</strong> If received 1st Inj Prevenar 13 - 0.5 ml/IM on day 0, then give injection Prevenar 20 after 1 year</p>
                <p><strong>C)</strong> If received both Prevenar 13 and injection Pneumovax 23 then no need of any pneumonia vaccine</p>
              </div>
            </div>
          </div>

          {/* 4. Varicella Zoster */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0"><Syringe className="h-4 w-4 text-green-600" /></div>
              <div><h2 className="text-lg font-bold text-gray-900">4. Varicella Zoster</h2></div>
            </div>
            <div className="ml-11 text-sm text-gray-700">
              <p><span className="font-semibold">For:</span> Healthy individuals above 50 years or adults above 18 years in high-risk patients</p>
              <p><span className="font-semibold">Vaccine:</span> Shingrix - total 2 doses each of 0.5 ml</p>
              <div className="bg-gray-50 rounded-lg p-4 mt-3">
                <p className="font-semibold text-gray-900 mb-2">Schedule:</p>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2"><span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span> <strong>First dose - Month 0</strong></li>
                  <li className="flex items-center gap-2"><span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span> <strong>Second dose 2 to 6 months after first dose</strong></li>
                </ul>
              </div>
            </div>
          </div>

          {/* 5. Anti HBs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center shrink-0"><Calendar className="h-4 w-4 text-cyan-600" /></div>
              <div><h2 className="text-lg font-bold text-gray-900">5. Anti HBs Antibody Titres</h2></div>
            </div>
            <div className="ml-11 text-sm text-gray-700">
              <p><span className="font-semibold">Purpose:</span> Check for adequate immune response against hepatitis B</p>
              <p><span className="font-semibold">Frequency:</span> Every 6 months | <span className="font-semibold">Target:</span> {`>`}100 miu/ml</p>
              <div className="mt-3 bg-gray-50 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-100"><th className="px-4 py-2 text-left font-semibold text-gray-700">Date</th><th className="px-4 py-2 text-left font-semibold text-gray-700">Value (miu/ml)</th></tr></thead>
                  <tbody>
                    <tr className="border-t border-gray-200"><td className="px-4 py-3 text-gray-400">________________</td><td className="px-4 py-3 text-gray-400">________________</td></tr>
                    <tr className="border-t border-gray-200"><td className="px-4 py-3 text-gray-400">________________</td><td className="px-4 py-3 text-gray-400">________________</td></tr>
                    <tr className="border-t border-gray-200"><td className="px-4 py-3 text-gray-400">________________</td><td className="px-4 py-3 text-gray-400">________________</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Injection Site with Diagram */}
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

          {/* Emergency Medicines */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0"><AlertTriangle className="h-4 w-4 text-red-600" /></div>
              <div><h2 className="text-lg font-bold text-gray-900">Emergency Medicine for Adults with Kidney Diseases</h2><p className="text-sm text-gray-500 font-medium">Aapatkalin gurda rogiyon ke liye (SOS dawaiyan)</p></div>
            </div>
            <div className="ml-11 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#B41E1E] text-white">
                    <th className="px-3 py-2.5 text-left rounded-tl-lg">Problem (समस्या)</th>
                    <th className="px-3 py-2.5 text-left">Medicine (दवाई)</th>
                    <th className="px-3 py-2.5 text-left">How to Take (कैसे लें)</th>
                    <th className="px-3 py-2.5 text-left rounded-tr-lg">Dose (मात्रा)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 bg-red-50/50">
                    <td className="px-3 py-2.5 font-semibold text-red-800">Fever (बुखार)</td>
                    <td className="px-3 py-2.5 font-medium">Tab Dolo 650 mg / Crocin 500mg</td>
                    <td className="px-3 py-2.5">After food (खाने के बाद)</td>
                    <td className="px-3 py-2.5">1 tab SOS</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-2.5 font-semibold text-red-800">Pain (दर्द)</td>
                    <td className="px-3 py-2.5 font-medium">Tab Ultracet 37 mg / Cap Tramazac P 37.5 mg</td>
                    <td className="px-3 py-2.5">After food (खाने के बाद)</td>
                    <td className="px-3 py-2.5">1 tab SOS</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-red-50/50">
                    <td className="px-3 py-2.5 font-semibold text-red-800">Vomiting (उल्टी)</td>
                    <td className="px-3 py-2.5 font-medium">Tab Emset 4mg / Tab Zofer MD 4mg</td>
                    <td className="px-3 py-2.5">Before food (खाने से पहले)</td>
                    <td className="px-3 py-2.5">1 tab SOS</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-2.5 font-semibold text-red-800">Renal Colic (पेट दर्द)</td>
                    <td className="px-3 py-2.5 font-medium">Tab Drotin DS 80 mg / Inj Tramadol 100 mg IM</td>
                    <td className="px-3 py-2.5">After food (खाने के बाद)</td>
                    <td className="px-3 py-2.5">1 tab / SOS</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2.5 font-semibold text-red-800 rounded-bl-lg">Swelling (सूजन)</td>
                    <td className="px-3 py-2.5 font-medium">Tab Tor 20 mg / Tab Dtor 20 mg</td>
                    <td className="px-3 py-2.5">After food (खाने के बाद)</td>
                    <td className="px-3 py-2.5 rounded-br-lg">1 tab SOS</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 ml-11 text-xs text-red-600 font-semibold">SOS = जरूरत पड़ने पर (As needed)</p>
          </div>

          {/* Other Common Medicines */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center shrink-0"><Heart className="h-4 w-4 text-teal-600" /></div>
              <div><h2 className="text-lg font-bold text-gray-900">Other Common Medicines (अन्य सामान्य दवाइयाँ)</h2><p className="text-sm text-gray-500 font-medium">Additional medicines for kidney patients - with Hindi names</p></div>
            </div>
            <div className="ml-11 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#0D9488] text-white">
                    <th className="px-3 py-2.5 text-left rounded-tl-lg">Medicine (दवाई)</th>
                    <th className="px-3 py-2.5 text-left">Use (उपयोग)</th>
                    <th className="px-3 py-2.5 text-left">How to Take (कैसे लें)</th>
                    <th className="px-3 py-2.5 text-left rounded-tr-lg">Dose (मात्रा)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <td className="px-3 py-2.5 font-medium">Pan 40 / Razo<br/><span className="text-gray-500 text-xs">पैन 40 / रेजो</span></td>
                    <td className="px-3 py-2.5">Acidity (एसिडिटी)</td>
                    <td className="px-3 py-2.5">Before breakfast (नाश्ते से पहले)</td>
                    <td className="px-3 py-2.5">1 tablet daily</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-2.5 font-medium">Telma 40 / Amlodac<br/><span className="text-gray-500 text-xs">टेल्मा 40 / एम्लोडैक</span></td>
                    <td className="px-3 py-2.5">BP (उच्च रक्तचाप)</td>
                    <td className="px-3 py-2.5">Any time (किसी भी समय)</td>
                    <td className="px-3 py-2.5">1 tablet daily</td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <td className="px-3 py-2.5 font-medium">Dynapres / Telmikind<br/><span className="text-gray-500 text-xs">डायनाप्रेस / टेल्मीकिंड</span></td>
                    <td className="px-3 py-2.5">BP (उच्च रक्तचाप)</td>
                    <td className="px-3 py-2.5">Any time (किसी भी समय)</td>
                    <td className="px-3 py-2.5">1 tablet daily</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-2.5 font-medium">Ondem / Zofer<br/><span className="text-gray-500 text-xs">ओंडेम / ज़ोफर</span></td>
                    <td className="px-3 py-2.5">Nausea (जी मिचलाना)</td>
                    <td className="px-3 py-2.5">Before food (खाने से पहले)</td>
                    <td className="px-3 py-2.5">1 tablet SOS</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2.5 font-medium rounded-bl-lg">Duphaston<br/><span className="text-gray-500 text-xs">ड्यूफास्टन</span></td>
                    <td className="px-3 py-2.5">Hormone (हार्मोन)</td>
                    <td className="px-3 py-2.5">After food (खाने के बाद)</td>
                    <td className="px-3 py-2.5 rounded-br-lg">As directed</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-gray-500 italic">SOS = जरूरत पड़ने पर (As needed) | Always take medicines under guidance of your nephrologist (हमेशा अपने डॉक्टर की सलाह से दवाई लें)</p>
          </div>

          {/* Download */}
          <div className="text-center mt-8">
            <button onClick={handleDownload} disabled={downloading} className="inline-flex items-center gap-2 px-8 py-3 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] transition-all shadow-lg disabled:opacity-50">
              {downloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
              {downloading ? 'Generating PDF...' : 'Download PDF'}
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
