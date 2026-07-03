'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, Video, Clock, Shield, Award, Heart, Phone, CheckCircle2, MapPin, FileText, ChevronRight, Star, Stethoscope, Building2 } from 'lucide-react';

const countries = [
  { name: 'United States', flag: '🇺🇸', timezone: 'EST/PST', fee: '$20 USD', lang: 'English' },
  { name: 'United Kingdom', flag: '🇬🇧', timezone: 'GMT', fee: '£18 GBP', lang: 'English' },
  { name: 'UAE', flag: '🇦🇪', timezone: 'GST', fee: 'AED 75', lang: 'English, Hindi, Urdu' },
  { name: 'Saudi Arabia', flag: '🇸🇦', timezone: 'AST', fee: 'SAR 75', lang: 'English, Hindi, Urdu' },
  { name: 'Australia', flag: '🇦🇺', timezone: 'AEST', fee: 'AUD 30', lang: 'English' },
  { name: 'Canada', flag: '🇨🇦', timezone: 'EST/PST', fee: 'CAD 28', lang: 'English' },
  { name: 'Singapore', flag: '🇸🇬', timezone: 'SGT', fee: 'SGD 28', lang: 'English, Hindi' },
  { name: 'Pakistan', flag: '🇵🇰', timezone: 'PKT', fee: '$20 USD', lang: 'English, Hindi, Urdu' },
  { name: 'Bangladesh', flag: '🇧🇩', timezone: 'BDT', fee: '$20 USD', lang: 'English, Hindi, Bengali' },
  { name: 'Sri Lanka', flag: '🇱🇰', timezone: 'SLST', fee: '$20 USD', lang: 'English, Hindi, Sinhala' },
  { name: 'Nepal', flag: '🇳🇵', timezone: 'NPT', fee: '$20 USD', lang: 'English, Hindi, Nepali' },
  { name: 'South Africa', flag: '🇿🇦', timezone: 'SAST', fee: 'ZAR 380', lang: 'English' },
  { name: 'Kenya', flag: '🇰🇪', timezone: 'EAT', fee: '$20 USD', lang: 'English' },
  { name: 'Nigeria', flag: '🇳🇬', timezone: 'WAT', fee: '$20 USD', lang: 'English' },
  { name: 'Germany', flag: '🇩🇪', timezone: 'CET', fee: '€18 EUR', lang: 'English' },
  { name: 'Japan', flag: '🇯🇵', timezone: 'JST', fee: '$20 USD', lang: 'English' },
];

const conditions = [
  'Chronic Kidney Disease (CKD)',
  'Kidney Transplant Evaluation',
  'Dialysis Planning & Management',
  'Diabetic Kidney Disease',
  'Kidney Stones',
  'High Creatinine / Low eGFR',
  'Polycystic Kidney Disease',
  'IgA Nephropathy',
  'Lupus Nephritis',
  'Kidney Infections',
  'Nephrotic Syndrome',
  'Hypertension-Related Kidney Disease',
];

const steps = [
  { num: 1, title: 'Book Online', desc: 'Select "International Video" on our booking page and fill in your details including country and timezone.' },
  { num: 2, title: 'Submit Reports', desc: 'Upload your kidney function tests (KFT), ultrasound, and any other relevant medical reports.' },
  { num: 3, title: 'Video Consultation', desc: 'Dr Rajesh Goel will review your reports and conduct a detailed video consultation at your preferred time.' },
  { num: 4, title: 'Treatment Plan', desc: 'Receive a comprehensive treatment plan, prescription, and follow-up schedule via WhatsApp or email.' },
];

export default function InternationalPatientsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MedicalBusiness",
          "name": "Online Nephrologist — International Patient Consultation",
          "description": "Online nephrology consultation for international patients by Dr Rajesh Goel, Senior Nephrologist & Kidney Transplant Physician.",
          "url": "https://onlinenephrologist.com",
          "telephone": "+919818235613",
          "priceRange": "$20 USD",
          "physician": {
            "@type": "Physician",
            "name": "Dr. Rajesh Goel",
            "medicalSpecialty": "Nephrology",
            "description": "Senior Nephrologist & Kidney Transplant Physician with 15+ years experience, available for international telehealth consultations"
          },
          "availableService": [
            { "@type": "MedicalProcedure", "name": "International Video Consultation", "procedureType": "https://schema.org/LeisureTimeActivity" }
          ],
          "areaServed": countries.map(c => c.name),
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "2500"
          }
        }) }}
      />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0A75BB] to-[#085D94] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Globe className="h-4 w-4" /> Available Worldwide
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Nephrology Consultation for <span className="text-yellow-300">International Patients</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8">
              Expert kidney care by <strong className="text-white">Dr Rajesh Goel</strong> — Senior Nephrologist & Kidney Transplant Physician with 15+ years of experience. Consult from anywhere in the world via secure video call.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book-appointment?type=online_intl" className="px-8 py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 text-lg">
                <Video className="h-5 w-5" /> Book International Consultation — $20 USD
              </Link>
              <a href="https://wa.me/919818235613?text=Hi%2C%20I%27m%20an%20international%20patient%20and%20would%20like%20to%20book%20a%20kidney%20consultation." target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white/15 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/25 transition-colors border border-white/30 flex items-center justify-center gap-2">
                <Phone className="h-5 w-5" /> WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Shield, label: '100% Confidential', sub: 'HIPAA-compliant data security' },
              { icon: Award, label: '15+ Years Experience', sub: '5000+ patients treated' },
              { icon: Globe, label: '20+ Countries', sub: 'Patients from worldwide' },
              { icon: Clock, label: 'Flexible Timings', sub: 'Slots for all timezones' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#0A75BB]/10 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-[#0A75BB]" />
                </div>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-500">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Why International Patients Trust Us */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Why International Patients Choose Dr Rajesh Goel</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Trusted nephrology expertise accessible from anywhere in the world, with personalized care for international patients</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Stethoscope, title: 'Expert Nephrologist', desc: 'Dr Rajesh Goel is a Senior Nephrologist & Kidney Transplant Physician with 15+ years of experience treating complex kidney conditions worldwide.', color: 'emerald' },
              { icon: Video, title: 'Secure Video Consultation', desc: 'High-definition video consultations from the comfort of your home. HIPAA-compliant platform ensuring complete privacy of your medical data.', color: 'blue' },
              { icon: FileText, title: 'Comprehensive Treatment Plans', desc: 'Detailed treatment plans including medication, diet advice, lifestyle modifications, and follow-up schedules delivered via WhatsApp or email.', color: 'purple' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  item.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                  item.color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                }`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">How International Consultation Works</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Simple 4-step process to get expert nephrology care from anywhere in the world</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="text-center relative">
                <div className="w-14 h-14 rounded-full bg-[#0A75BB] text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.num}
                </div>
                {i < steps.length - 1 && <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-0.5 bg-[#0A75BB]/20" />}
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Conditions Treated */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Kidney Conditions Treated for International Patients</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Comprehensive nephrology care for all kidney-related conditions</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {conditions.map((condition, i) => (
              <div key={i} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 hover:border-[#0A75BB]/30 hover:shadow-md transition-all">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <span className="text-sm font-medium text-slate-700">{condition}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Countries Served */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Patients from 20+ Countries</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Dr Goel regularly consults with patients from these countries</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {countries.map((country, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-[#0A75BB]/30 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{country.flag}</span>
                  <span className="font-semibold text-gray-900 text-sm">{country.name}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Timezone: {country.timezone}</p>
                  <p className="text-xs text-slate-500">Fee: {country.fee}</p>
                  <p className="text-xs text-slate-500">Languages: {country.lang}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Consultation Fee */}
        <section>
          <div className="bg-gradient-to-r from-[#0A75BB] to-[#085D94] rounded-3xl p-8 md:p-12 text-white">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">International Consultation Fee</h2>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
                <p className="text-5xl font-bold mb-2">$20 USD</p>
                <p className="text-white/70">approximately ₹1,500 INR | AED 75 | SAR 75 | £18 GBP | €18 EUR</p>
                <p className="text-sm text-white/60 mt-3">Includes: Video consultation, written treatment plan, prescription, and follow-up guidance</p>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 mb-8 text-left">
                {[
                  { icon: Video, text: '30-45 minute video consultation' },
                  { icon: FileText, text: 'Written treatment plan & prescription' },
                  { icon: Clock, text: 'Follow-up via WhatsApp for 7 days' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white/10 rounded-xl p-4">
                    <item.icon className="h-5 w-5 text-yellow-300 shrink-0 mt-0.5" />
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
              <Link href="/book-appointment?type=online_intl" className="px-10 py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 inline-flex items-center gap-2 text-lg">
                Book Now — $20 USD <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* What to Prepare */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">What to Prepare for Your Consultation</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Having these ready will help Dr Goel provide the best care</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#0A75BB]" /> Medical Reports to Upload
              </h3>
              <ul className="space-y-3">
                {[
                  'Kidney Function Test (KFT) / Renal Function Test (RFT)',
                  'Complete Blood Count (CBC)',
                  'HbA1c (if diabetic)',
                  'Lipid Profile',
                  'Urine Routine & Microscopy',
                  'Ultrasound Abdomen & Pelvis (Kidney size & structure)',
                  'Any previous biopsy reports',
                  'Current medication list',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#0A75BB]" /> Tips for a Smooth Consultation
              </h3>
              <ul className="space-y-3">
                {[
                  'Ensure stable internet connection for video call',
                  'Keep all reports ready before the consultation',
                  'Note down your symptoms and questions',
                  'List all current medications with dosages',
                  'Have a pen and paper ready for the treatment plan',
                  'Consult at your preferred timezone — flexible slots available',
                  'Interpreter available in Hindi, Urdu, Arabic, Bengali, Tamil, and more',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-[#0A75BB] shrink-0 mt-0.5" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">What International Patients Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Ahmed K.', country: 'UAE', text: 'Dr Goel provided excellent guidance for my CKD management. The video consultation was very thorough despite the distance. Highly recommended for NRIs!' },
              { name: 'Sarah M.', country: 'UK', text: 'Got a second opinion on my kidney biopsy results. Dr Goel was very knowledgeable and explained everything clearly. Saved me a trip to India.' },
              { name: 'Md Rahman', country: 'Bangladesh', text: 'My father has been on dialysis. Dr Goel helped us understand the transplant options available in India. Very compassionate and professional.' },
            ].map((t, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-1 mb-3">
                  {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0A75BB]/10 flex items-center justify-center text-sm font-bold text-[#0A75BB]">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.country}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: 'How do I book an international nephrology consultation?', a: 'Click "Book International Consultation" above, select your preferred date and time slot (adjusted to your timezone), upload your medical reports, and pay the $20 USD fee. Dr Goel will send you a video call link via WhatsApp.' },
              { q: 'What payment methods do you accept for international patients?', a: 'We accept international bank transfers, PayPal, and credit/debit cards. The consultation fee is $20 USD (approximately ₹1,500 INR). Payment details are provided after booking.' },
              { q: 'What timezones do you offer consultations for?', a: 'Dr Goel is available Mon-Sun from 7 AM to 11 PM IST. This covers most timezones: morning in the US/Canada, afternoon in UK/Europe/UAE, and evening in Australia/Singapore/Japan.' },
              { q: 'Can I get a prescription after the consultation?', a: 'Yes. After the video consultation, Dr Goel will provide a detailed treatment plan and prescription via WhatsApp or email. You can share this with your local pharmacy or doctor.' },
              { q: 'Do you offer interpreter services?', a: 'Yes. Dr Goel and his team can provide consultations in English, Hindi, Urdu, Bengali, Tamil, Telugu, Nepali, Sinhala, and Arabic. Please mention your language preference when booking.' },
              { q: 'Is my medical data secure?', a: 'Absolutely. We use HIPAA-compliant video platforms and store all medical records securely. Your data is never shared with third parties and is used only for your medical care.' },
              { q: 'Can you help with kidney transplant evaluation?', a: 'Yes. Dr Goel can conduct an initial evaluation via video consultation, review your reports, and advise on whether you are a candidate for kidney transplant. He can also coordinate with transplant centers in India if needed.' },
              { q: 'What if I need a follow-up consultation?', a: 'After your initial consultation, you get 7 days of free WhatsApp follow-up. Additional video consultations can be booked at the same $20 USD fee.' },
            ].map((faq, i) => (
              <details key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden group">
                <summary className="p-5 cursor-pointer font-semibold text-gray-900 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  {faq.q}
                  <ChevronRight className="h-5 w-5 text-slate-400 group-open:rotate-90 transition-transform shrink-0 ml-2" />
                </summary>
                <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                ...[
                  { q: 'How do I book an international nephrology consultation?', a: 'Click "Book International Consultation", select your preferred date and time slot, upload your medical reports, and pay the $20 USD fee.' },
                  { q: 'What payment methods do you accept for international patients?', a: 'We accept international bank transfers, PayPal, and credit/debit cards. The consultation fee is $20 USD.' },
                  { q: 'What timezones do you offer consultations for?', a: 'Dr Goel is available Mon-Sun 7 AM to 11 PM IST, covering most global timezones.' },
                  { q: 'Can I get a prescription after the consultation?', a: 'Yes. Dr Goel provides a detailed treatment plan and prescription via WhatsApp or email.' },
                  { q: 'Do you offer interpreter services?', a: 'Yes. Consultations available in English, Hindi, Urdu, Bengali, Tamil, Telugu, Nepali, Sinhala, and Arabic.' },
                  { q: 'Is my medical data secure?', a: 'Yes. We use HIPAA-compliant video platforms and store all medical records securely.' },
                  { q: 'Can you help with kidney transplant evaluation?', a: 'Yes. Dr Goel can conduct initial evaluation via video and coordinate with transplant centers in India.' },
                  { q: 'What if I need a follow-up consultation?', a: 'After initial consultation, you get 7 days of free WhatsApp follow-up.' },
                ].map(f => ({
                  "@type": "Question",
                  "name": f.q,
                  "acceptedAnswer": { "@type": "Answer", "text": f.a }
                }))
              ]
            }) }}
          />
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Ready to Consult Dr Rajesh Goel?</h2>
          <p className="text-slate-500 mb-8 max-w-2xl mx-auto">
            Book an international video consultation today and get expert nephrology care from the comfort of your home, wherever you are in the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book-appointment?type=online_intl" className="px-8 py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 text-lg">
              <Video className="h-5 w-5" /> Book International Consultation
            </Link>
            <a href="https://wa.me/919818235613?text=Hi%2C%20I%27m%20an%20international%20patient%20and%20would%20like%20to%20book%20a%20kidney%20consultation." target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
              <Phone className="h-5 w-5" /> WhatsApp Dr Goel
            </a>
          </div>
        </section>
      </div>

      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-sm">
        &copy; {new Date().getFullYear()} Online Nephrologist. All rights reserved.
      </footer>
    </div>
  );
}
