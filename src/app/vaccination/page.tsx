'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BreadcrumbSchema, WebPageSchema } from '@/components/seo/JsonLd';
import {
  Syringe, Download, AlertTriangle, Shield, Calendar, Pill,
} from 'lucide-react';

function handlePrint() {
  window.print();
}

export default function VaccinationPage() {
  return (
    <>
      <Navbar />
      <BreadcrumbSchema items={[{ name: 'Home', url: '/' }, { name: 'Vaccination Record', url: '/vaccination' }]} />
      <WebPageSchema title="Vaccination Record for Kidney Patients" description="Complete vaccination record and schedule for chronic kidney disease patients including Hepatitis B, Influenza, Pneumococcal, Varicella Zoster and Anti HBs antibody titres." url="/vaccination" />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0A75BB] to-[#063d5c] text-white py-10 md:py-14 print:hidden">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-4 text-sm">
            <Syringe className="h-4 w-4" /> Vaccination Record
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">VACCINATION RECORD</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Recommended vaccinations for chronic kidney disease patients
          </p>
          <button onClick={handlePrint} className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white text-[#0A75BB] font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-lg">
            <Download className="h-4 w-4" /> Download PDF
          </button>
        </div>
      </section>

      {/* Screen-only content */}
      <section className="py-8 md:py-12 bg-gray-50 min-h-[60vh] print:hidden">
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
            <button onClick={handlePrint} className="inline-flex items-center gap-2 px-8 py-3 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] transition-all shadow-lg">
              <Download className="h-5 w-5" /> Download PDF
            </button>
          </div>
        </div>
      </section>

      {/* ========== PRINT-ONLY CONTENT (visible only in print) ========== */}
      <div className="hidden print:block">
        {/* PDF Header */}
        <div style={{ borderBottom: '3px solid #0A75BB', paddingBottom: '12px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', background: '#0A75BB', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>K</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#0A75BB', fontFamily: 'Arial, sans-serif' }}>Online Nephrologist / Kidney Care Centre</h1>
            <p style={{ margin: '1px 0 0', fontSize: '10px', color: '#555', fontFamily: 'Arial, sans-serif' }}>Dr Rajesh Goel | MBBS, DNB Internal Medicine, DNB Nephrology, Fellow Kidney Transplant Medicine</p>
            <p style={{ margin: '1px 0 0', fontSize: '9.5px', color: '#777', fontFamily: 'Arial, sans-serif' }}>Reg. No: DMC/R/734 | 20+ Years Experience | www.onlinenephrologist.com</p>
          </div>
        </div>

        {/* Title */}
        <div style={{ background: '#0A75BB', color: '#fff', padding: '8px 16px', borderRadius: '4px', marginBottom: '12px', textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px', fontFamily: 'Arial, sans-serif' }}>VACCINATION RECORD</h2>
          <p style={{ margin: '2px 0 0', fontSize: '9px', opacity: 0.9, fontFamily: 'Arial, sans-serif' }}>Recommended vaccinations for chronic kidney disease patients</p>
        </div>

        {/* Note */}
        <div style={{ background: '#FFF8E1', border: '1px solid #F9A825', borderRadius: '4px', padding: '6px 10px', marginBottom: '12px', fontFamily: 'Arial, sans-serif' }}>
          <p style={{ margin: 0, fontSize: '9px', fontWeight: 'bold', color: '#E65100' }}>Above doses applicable in case of chronic kidney disease</p>
          <ol style={{ margin: '2px 0 0', paddingLeft: '14px', fontSize: '8.5px', color: '#5D4037' }}>
            <li>Anti HBs antibody titres to be done every 6 months.</li>
            <li>Protective titres for kidney disease patients are &gt;100 miu/ml.</li>
          </ol>
        </div>

        {/* 1. Hepatitis B */}
        <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '8px 10px', marginBottom: '8px', fontFamily: 'Arial, sans-serif' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 'bold' }}>1. Hepatitis B (Engerix-B / Shanvac-B / Enivac B or any brand)</h3>
          <p style={{ margin: '1px 0', fontSize: '9px' }}><strong>Route:</strong> IM (upper arm for adults, thigh for infants) | <strong>Dose:</strong> 2 ml (40 mcg) IM each time</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '4px' }}>
            <thead><tr style={{ background: '#f5f5f5' }}><th style={{ padding: '2px 6px', textAlign: 'left', fontSize: '8.5px', fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>Dose</th><th style={{ padding: '2px 6px', textAlign: 'left', fontSize: '8.5px', fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>Schedule</th><th style={{ padding: '2px 6px', textAlign: 'left', fontSize: '8.5px', fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>Date Given</th></tr></thead>
            <tbody>
              <tr><td style={{ padding: '2px 6px', fontSize: '8.5px', borderBottom: '1px solid #eee' }}>1st Dose</td><td style={{ padding: '2px 6px', fontSize: '8.5px', borderBottom: '1px solid #eee' }}>Day 0</td><td style={{ padding: '2px 6px', fontSize: '8.5px', borderBottom: '1px solid #eee', color: '#aaa' }}>____/____/____</td></tr>
              <tr><td style={{ padding: '2px 6px', fontSize: '8.5px', borderBottom: '1px solid #eee' }}>2nd Dose</td><td style={{ padding: '2px 6px', fontSize: '8.5px', borderBottom: '1px solid #eee' }}>1st month</td><td style={{ padding: '2px 6px', fontSize: '8.5px', borderBottom: '1px solid #eee', color: '#aaa' }}>____/____/____</td></tr>
              <tr><td style={{ padding: '2px 6px', fontSize: '8.5px', borderBottom: '1px solid #eee' }}>3rd Dose</td><td style={{ padding: '2px 6px', fontSize: '8.5px', borderBottom: '1px solid #eee' }}>2nd month</td><td style={{ padding: '2px 6px', fontSize: '8.5px', borderBottom: '1px solid #eee', color: '#aaa' }}>____/____/____</td></tr>
              <tr><td style={{ padding: '2px 6px', fontSize: '8.5px' }}>4th Dose</td><td style={{ padding: '2px 6px', fontSize: '8.5px' }}>6th month</td><td style={{ padding: '2px 6px', fontSize: '8.5px', color: '#aaa' }}>____/____/____</td></tr>
            </tbody>
          </table>
        </div>

        {/* 2. Influenza */}
        <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '8px 10px', marginBottom: '8px', fontFamily: 'Arial, sans-serif' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 'bold' }}>2. Influenza Vaccine Inj. (Influvac or any brand)</h3>
          <p style={{ margin: '1px 0', fontSize: '9px' }}><strong>Dose:</strong> 0.5 ml I/M stat (once a year) - May/June</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '4px' }}>
            <thead><tr style={{ background: '#f5f5f5' }}><th style={{ padding: '2px 6px', textAlign: 'left', fontSize: '8.5px', fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>Dose</th><th style={{ padding: '2px 6px', textAlign: 'left', fontSize: '8.5px', fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>Schedule</th><th style={{ padding: '2px 6px', textAlign: 'left', fontSize: '8.5px', fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>Date Given</th></tr></thead>
            <tbody><tr><td style={{ padding: '2px 6px', fontSize: '8.5px' }}>Annual</td><td style={{ padding: '2px 6px', fontSize: '8.5px' }}>Once a year (May/June)</td><td style={{ padding: '2px 6px', fontSize: '8.5px', color: '#aaa' }}>____/____/____</td></tr></tbody>
          </table>
        </div>

        {/* 3. Pneumococcal */}
        <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '8px 10px', marginBottom: '8px', fontFamily: 'Arial, sans-serif' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 'bold' }}>3. Pneumococcal Vaccine</h3>
          <div style={{ fontSize: '9px', background: '#f9f9f9', borderRadius: '3px', padding: '4px 8px', marginBottom: '4px' }}>
            <p style={{ margin: '1px 0' }}><strong>A)</strong> Injection Prevenar 20 (PCV 20) IM - No need to repeat</p>
            <p style={{ margin: '1px 0' }}><strong>B)</strong> If received Prevenar 13 on day 0, give Prevenar 20 after 1 year</p>
            <p style={{ margin: '1px 0' }}><strong>C)</strong> If received both Prevenar 13 + Pneumovax 23, no further vaccine needed</p>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#f5f5f5' }}><th style={{ padding: '2px 6px', textAlign: 'left', fontSize: '8.5px', fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>Vaccine Given</th><th style={{ padding: '2px 6px', textAlign: 'left', fontSize: '8.5px', fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>Date Given</th></tr></thead>
            <tbody><tr><td style={{ padding: '2px 6px', fontSize: '8.5px', color: '#aaa' }}>____________________</td><td style={{ padding: '2px 6px', fontSize: '8.5px', color: '#aaa' }}>____/____/____</td></tr></tbody>
          </table>
        </div>

        {/* 4. Varicella Zoster */}
        <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '8px 10px', marginBottom: '8px', fontFamily: 'Arial, sans-serif' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 'bold' }}>4. Varicella Zoster (Shingrix - 2 doses of 0.5 ml)</h3>
          <p style={{ margin: '1px 0', fontSize: '9px' }}><strong>For:</strong> Adults above 50 years or above 18 in high-risk patients</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '4px' }}>
            <thead><tr style={{ background: '#f5f5f5' }}><th style={{ padding: '2px 6px', textAlign: 'left', fontSize: '8.5px', fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>Dose</th><th style={{ padding: '2px 6px', textAlign: 'left', fontSize: '8.5px', fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>Schedule</th><th style={{ padding: '2px 6px', textAlign: 'left', fontSize: '8.5px', fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>Date Given</th></tr></thead>
            <tbody>
              <tr><td style={{ padding: '2px 6px', fontSize: '8.5px', borderBottom: '1px solid #eee' }}>1st Dose</td><td style={{ padding: '2px 6px', fontSize: '8.5px', borderBottom: '1px solid #eee' }}>Month 0</td><td style={{ padding: '2px 6px', fontSize: '8.5px', borderBottom: '1px solid #eee', color: '#aaa' }}>____/____/____</td></tr>
              <tr><td style={{ padding: '2px 6px', fontSize: '8.5px' }}>2nd Dose</td><td style={{ padding: '2px 6px', fontSize: '8.5px' }}>2-6 months after 1st</td><td style={{ padding: '2px 6px', fontSize: '8.5px', color: '#aaa' }}>____/____/____</td></tr>
            </tbody>
          </table>
        </div>

        {/* 5. Anti HBs */}
        <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '8px 10px', marginBottom: '8px', fontFamily: 'Arial, sans-serif' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 'bold' }}>5. Anti HBs Antibody Titres</h3>
          <p style={{ margin: '1px 0', fontSize: '9px' }}><strong>Purpose:</strong> Check immune response to Hep B vaccine | <strong>Frequency:</strong> Every 6 months | <strong>Target:</strong> &gt;100 miu/ml</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '4px' }}>
            <thead><tr style={{ background: '#f5f5f5' }}><th style={{ padding: '2px 6px', textAlign: 'left', fontSize: '8.5px', fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>Date</th><th style={{ padding: '2px 6px', textAlign: 'left', fontSize: '8.5px', fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>Value (miu/ml)</th></tr></thead>
            <tbody>
              <tr><td style={{ padding: '2px 6px', fontSize: '8.5px', borderBottom: '1px solid #eee', color: '#aaa' }}>____/____/____</td><td style={{ padding: '2px 6px', fontSize: '8.5px', borderBottom: '1px solid #eee', color: '#aaa' }}>____________</td></tr>
              <tr><td style={{ padding: '2px 6px', fontSize: '8.5px', borderBottom: '1px solid #eee', color: '#aaa' }}>____/____/____</td><td style={{ padding: '2px 6px', fontSize: '8.5px', borderBottom: '1px solid #eee', color: '#aaa' }}>____________</td></tr>
              <tr><td style={{ padding: '2px 6px', fontSize: '8.5px', color: '#aaa' }}>____/____/____</td><td style={{ padding: '2px 6px', fontSize: '8.5px', color: '#aaa' }}>____________</td></tr>
            </tbody>
          </table>
        </div>

        {/* Injection Site */}
        <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '8px 10px', marginBottom: '8px', fontFamily: 'Arial, sans-serif' }}>
          <h3 style={{ margin: '0 0 3px', fontSize: '11px', fontWeight: 'bold' }}>Injection Site</h3>
          <p style={{ margin: 0, fontSize: '9px' }}><strong>Route:</strong> Deltoid muscle (upper arm) | 0.5 to 1.0 ml for adults | Inject into muscle, not subcutaneous</p>
        </div>

        {/* Emergency Medicines */}
        <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '8px 10px', marginBottom: '10px', fontFamily: 'Arial, sans-serif' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 'bold', color: '#C62828' }}>Emergency Medicine for Adults with Kidney Diseases</h3>
          <div style={{ fontSize: '9px' }}>
            <div style={{ background: '#f9f9f9', borderRadius: '3px', padding: '3px 6px', marginBottom: '2px' }}><strong>1. FEVER</strong> - Tab. Dolo 650 mg / Tab Crocin 500mg SOS</div>
            <div style={{ background: '#f9f9f9', borderRadius: '3px', padding: '3px 6px', marginBottom: '2px' }}><strong>2. PAIN</strong> - Tab. Ultracet 37 mg / Tab. Dolo 650 mg / Cap Tramazac P 37.5 mg SOS</div>
            <div style={{ background: '#f9f9f9', borderRadius: '3px', padding: '3px 6px', marginBottom: '2px' }}><strong>3. VOMITING</strong> - Tab. Emset 4mg / Tab Zofer MD 4mg / Tab. Vomikind 4 mg SOS</div>
            <div style={{ background: '#f9f9f9', borderRadius: '3px', padding: '3px 6px', marginBottom: '2px' }}><strong>4. RENAL COLIC</strong> - Tab. Drotin DS/ Drotinkind 80 mg / DVN Plus sos, Inj. Tramadol 100 mg IMI SOS</div>
            <div style={{ background: '#f9f9f9', borderRadius: '3px', padding: '3px 6px' }}><strong>5. SWELLING</strong> - Tab. Tor 20 mg/ Tab. Dtor 20 mg / Tab. Torget 20 mg SOS</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '2px solid #0A75BB', paddingTop: '8px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontFamily: 'Arial, sans-serif' }}>
          <div style={{ fontSize: '9px', color: '#555' }}>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#0A75BB' }}>Dr Rajesh Goel</p>
            <p style={{ margin: '1px 0 0' }}>Senior Nephrologist &amp; Kidney Transplant Physician</p>
            <p style={{ margin: '1px 0 0' }}>MBBS, DNB Internal Medicine, DNB Nephrology, Fellow Kidney Transplant Medicine</p>
          </div>
          <div style={{ fontSize: '9px', color: '#555', textAlign: 'right' }}>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#0A75BB' }}>Online Nephrologist</p>
            <p style={{ margin: '1px 0 0' }}>info@onlinenephrologist.com | +91 9818235613</p>
            <p style={{ margin: '1px 0 0' }}>www.onlinenephrologist.com</p>
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: '7.5px', color: '#999', marginTop: '6px', fontFamily: 'Arial, sans-serif' }}>
          This document is for informational purposes only. Always consult your treating nephrologist before starting any vaccination.
        </p>
      </div>

      {/* Print CSS */}
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
        }
      `}</style>

      <Footer />
    </>
  );
}
