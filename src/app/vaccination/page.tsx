'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BreadcrumbSchema, WebPageSchema } from '@/components/seo/JsonLd';
import {
  Syringe, Download, AlertTriangle, Shield, Calendar, Pill, Loader2,
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

export default function VaccinationPage() {
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

      {/* Content */}
      <section className="py-8 md:py-12 bg-gray-50 min-h-[60vh]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-bold mb-1">Above doses applicable in case of chronic kidney disease</p>
              <ol className="list-decimal ml-5 space-y-1 mt-2">
                <li>To check for adequate immune (protective against hepatitis B) response of vaccine - Anti HBs antibody titres to be done every 6 monthly.</li>
                <li>Protective titres for kidney disease patients are {`>`}100 miu/ml.</li>
              </ol>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0"><Syringe className="h-4 w-4 text-red-600" /></div>
              <div><h2 className="text-lg font-bold text-gray-900">1. Hepatitis B</h2><p className="text-sm text-gray-600 font-medium">Engerix-B / Shanvac-B / Enivac B (or any brand)</p></div>
            </div>
            <div className="ml-11 space-y-3 text-sm text-gray-700">
              <p><span className="font-semibold">Route:</span> Injection into a muscle (usually upper arm for adults, thigh for infants)</p>
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

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0"><Syringe className="h-4 w-4 text-orange-600" /></div>
              <div><h2 className="text-lg font-bold text-gray-900">2. Influenza Vaccine Inj.</h2><p className="text-sm text-gray-600 font-medium">Influvac (or any brand)</p></div>
            </div>
            <div className="ml-11 text-sm text-gray-700"><p><span className="font-semibold">Dose:</span> 0.5 ml I/M stat (once a year) - (May/June)</p></div>
          </div>

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

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0"><Pill className="h-4 w-4 text-blue-600" /></div>
              <div><h2 className="text-lg font-bold text-gray-900">Injection Site</h2></div>
            </div>
            <div className="ml-11 text-sm text-gray-700">
              <p><span className="font-semibold">Route:</span> Injection into the deltoid muscle (upper arm)</p>
              <ul className="list-disc ml-5 mt-2 space-y-1"><li>0.5 ml to 1.0 ml for adults</li><li>Inject into the muscle, not subcutaneous</li></ul>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0"><AlertTriangle className="h-4 w-4 text-red-600" /></div>
              <div><h2 className="text-lg font-bold text-gray-900">Emergency Medicine for Adults with Kidney Diseases</h2><p className="text-sm text-gray-500 font-medium">Aapatkalin gurda rogiyon ke liye</p></div>
            </div>
            <div className="ml-11 space-y-3 text-sm text-gray-700">
              <div className="bg-gray-50 rounded-lg p-3"><p className="font-bold text-gray-900">1. FEVER (Bukhar)</p><p>Tab. Dolo 650 mg / Tab Crocin 500mg SOS</p></div>
              <div className="bg-gray-50 rounded-lg p-3"><p className="font-bold text-gray-900">2. PAIN (Dard)</p><p>Tab. Ultracet 37 mg / Tab. Dolo 650 mg / Cap Tramazac P 37.5 mg SOS</p></div>
              <div className="bg-gray-50 rounded-lg p-3"><p className="font-bold text-gray-900">3. VOMITING (Ulti)</p><p>Tab. Emset 4mg / Tab Zofer MD 4mg / Tab. Vomikind 4 mg SOS</p></div>
              <div className="bg-gray-50 rounded-lg p-3"><p className="font-bold text-gray-900">4. STOMACH ACHE / RENAL COLIC</p><p>Tab. Drotin DS/ Drotinkind 80 mg / DVN Plus sos, Inj. Tramadol 100 mg IMI SOS</p></div>
              <div className="bg-gray-50 rounded-lg p-3"><p className="font-bold text-gray-900">5. SWELLING (Soojan)</p><p>Tab. Tor 20 mg/ Tab. Dtor 20 mg / Tab. Torget 20 mg SOS</p></div>
            </div>
          </div>

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
