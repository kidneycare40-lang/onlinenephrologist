import Link from 'next/link';
import type { Metadata } from 'next';
import { DOCTOR_INFO, SITE_CONFIG } from '@/lib/constants';
import { PhysicianSchema, FAQSchema, BreadcrumbSchema } from '@/components/seo/JsonLd';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import BookingWidget from '@/components/doctor-profile/BookingWidget';
import { MapPin, Clock, IndianRupee, Phone, ExternalLink, Star, Award, BookOpen, GraduationCap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dr Rajesh Goel - Best Nephrologist Delhi | 24+ Yrs',
  description:
    'Dr Rajesh Goel is a Senior Nephrologist & Kidney Transplant Physician in Delhi with 24+ years experience. MBBS, DNB Medicine, DNB Nephrology, Fellow Kidney Transplant. Book appointment online or at PSRI Hospital, Kidney Care Centre.',
  keywords: [
    'dr rajesh goel',
    'dr rajesh goel nephrologist',
    'dr rajesh goel delhi',
    'kidney specialist delhi',
    'nephrologist psri hospital',
    'kidney care centre faridabad',
    'kidney transplant doctor delhi',
  ],
  openGraph: {
    title: 'Dr Rajesh Goel - Best Nephrologist in Delhi',
    description: 'Senior Nephrologist & Kidney Transplant Physician with 24+ years experience. Book online or in-clinic appointment.',
    url: `${SITE_CONFIG.url}/dr-rajesh-goel`,
    siteName: SITE_CONFIG.name,
    type: 'profile',
    locale: 'en_IN',
    images: [{ url: `${SITE_CONFIG.url}/images/dr-rajesh-goel.jpg`, width: 1200, height: 630, alt: 'Dr Rajesh Goel - Best Nephrologist in Delhi' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dr Rajesh Goel - Best Nephrologist in Delhi',
    description: 'Senior Nephrologist & Kidney Transplant Physician with 24+ years experience. Book online or in-clinic appointment.',
    images: [`${SITE_CONFIG.url}/images/dr-rajesh-goel.jpg`],
  },
  alternates: { canonical: `${SITE_CONFIG.url}/dr-rajesh-goel` },
  robots: { index: true, follow: true },
};

const doctorFaqs = [
  {
    question: 'Who is the best nephrologist in Delhi?',
    answer: 'Dr Rajesh Goel is a highly experienced Senior Nephrologist and Kidney Transplant Physician in Delhi with over 24 years of experience. He holds MBBS, DNB Internal Medicine, DNB Nephrology, and Fellow Kidney Transplant Medicine qualifications and practices at PSRI Hospital and Kidney Care Centre.',
  },
  {
    question: 'What are Dr Rajesh Goel qualifications?',
    answer: 'Dr Rajesh Goel holds MBBS, DNB Internal Medicine, DNB Nephrology, and Fellow Kidney Transplant Medicine. He has over 24 years of experience treating kidney diseases and is registered with Delhi Medical Council (DMC/R/00734).',
  },
  {
    question: 'Where does Dr Rajesh Goel practice?',
    answer: 'Dr Rajesh Goel practices at three locations: Kidney Care Centre, Old Faridabad (9:00 AM - 10:30 AM); PSRI Hospital, New Delhi (1:00 PM - 7:00 PM); and Kidney Care Centre, Saket, New Delhi (9:00 PM - 11:00 PM by appointment). Online consultations are also available.',
  },
  {
    question: 'How to book appointment with Dr Rajesh Goel?',
    answer: 'You can book an appointment online at onlinenephrologist.com or call/WhatsApp +91 9818235613. Online video consultations are available for patients who cannot visit in person.',
  },
  {
    question: 'What is the consultation fee for Dr Rajesh Goel?',
    answer: 'The consultation fee starts from ₹500 for KCC Faridabad, ₹1200 for KCC Saket, ₹1000 for PSRI Hospital, and ₹500 for online consultation within India. International patients can consult for $25 USD. This covers a comprehensive evaluation, personalized treatment plan, and follow-up guidance.',
  },
  {
    question: 'What kidney conditions does Dr Rajesh Goel treat?',
    answer: 'Dr Rajesh Goel specializes in treating Chronic Kidney Disease (CKD), kidney stones, diabetic kidney disease, hypertension, glomerular diseases, electrolyte disorders, dialysis management, and kidney transplant care.',
  },
  {
    question: 'Is online consultation available with Dr Rajesh Goel?',
    answer: 'Yes, Dr Rajesh Goel offers online video consultations for kidney problems. You can book an online appointment through our website. This is ideal for follow-ups, second opinions, and initial consultations for patients who cannot visit in person.',
  },
  {
    question: 'What is the success rate of kidney transplant with Dr Rajesh Goel?',
    answer: 'Dr Rajesh Goel is a Fellow in Kidney Transplant Medicine with extensive experience in pre-transplant evaluation and post-transplant care. Success rates depend on individual patient factors. Consult directly for personalized assessment.',
  },
  {
    question: 'Does Dr Rajesh Goel treat diabetic kidney disease?',
    answer: 'Yes, Dr Rajesh Goel specializes in diabetic kidney disease (diabetic nephropathy). He provides comprehensive management including blood sugar control, blood pressure management, and slowing kidney damage progression.',
  },
  {
    question: 'What are the symptoms of kidney disease?',
    answer: 'Common symptoms of kidney disease include fatigue, swelling in legs/ankles, changes in urination (foamy or bloody urine), persistent high blood pressure, loss of appetite, muscle cramps, and nausea. If you experience these symptoms, consult Dr Rajesh Goel for evaluation.',
  },
  {
    question: 'When should I see a nephrologist?',
    answer: 'You should see a nephrologist if you have diabetes, high blood pressure, family history of kidney disease, abnormal blood or urine test results, or symptoms like swelling, foamy urine, or changes in urination patterns.',
  },
  {
    question: 'Does Dr Rajesh Goel provide dialysis management?',
    answer: 'Yes, Dr Rajesh Goel provides comprehensive dialysis management including hemodialysis and peritoneal dialysis. He helps patients choose the best option based on their lifestyle and medical needs.',
  },
  {
    question: 'What is the address of Kidney Care Centre Saket?',
    answer: 'Kidney Care Centre, Saket is located at 13 B, K-Block, Gate no. - 2, Saket, New Delhi. Consultation hours are Monday to Sunday, 9:00 PM - 11:00 PM by appointment.',
  },
  {
    question: 'What is the address of PSRI Hospital Delhi?',
    answer: 'PSRI Hospital is located at Press Enclave Marg, Shaikh Sarai - II, New Delhi - 110017. Dr Rajesh Goel consults here Monday to Saturday, 1:00 PM - 7:00 PM.',
  },
  {
    question: 'How to prevent kidney disease?',
    answer: 'To prevent kidney disease: control diabetes and blood pressure, stay hydrated, reduce salt intake, maintain healthy weight, exercise regularly, avoid smoking, limit painkillers, and get regular kidney function tests.',
  },
  {
    question: 'What foods are good for kidney health?',
    answer: 'Kidney-friendly foods include fresh fruits, vegetables, whole grains, lean proteins, and low-sodium options. Avoid processed foods, excessive salt, and high-potassium foods if advised. Dr Goel provides personalized dietary guidance.',
  },
];

const clinicDetails = [
  {
    name: 'Kidney Care Centre - Faridabad',
    address: 'Old Faridabad, 18A Main Market, Faridabad, Haryana 121002',
    fee: 500,
    timing: 'Mon to Sat · 09:00 AM - 10:30 AM',
    type: 'In-clinic · Video',
    mapsUrl: 'https://www.google.com/maps/search/Kidney+Care+Centre+Faridabad+18A+Main+Market',
  },
  {
    name: 'Kidney Care Centre - Saket',
    address: '13 B, K-Block, Gate no. 2, Saket, New Delhi 110017',
    fee: 1200,
    timing: 'Mon to Sun · 09:00 PM - 11:00 PM',
    type: 'In-clinic · Video',
    mapsUrl: 'https://www.google.com/maps/search/Kidney+Care+Centre+Saket+Delhi',
    byAppointment: true,
  },
  {
    name: 'PSRI Hospital, New Delhi',
    address: 'Press Enclave Marg, Shaikh Sarai - II, New Delhi 110017',
    fee: 1000,
    timing: 'Mon to Sat · 01:00 PM - 07:00 PM',
    type: 'In-clinic · Video',
    mapsUrl: 'https://www.google.com/maps/search/PSRI+Hospital+New+Delhi',
  },
];

export default function DoctorProfilePage() {
  return (
    <>
      <PhysicianSchema />
      <FAQSchema faqs={doctorFaqs} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: SITE_CONFIG.url },
          { name: 'Dr Rajesh Goel', url: `${SITE_CONFIG.url}/dr-rajesh-goel` },
        ]}
      />

      <Navbar />

      {/* Hero Header */}
      <section className="bg-gradient-to-br from-[#0A75BB] to-[#063d5c] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Doctor Photo + Name */}
            <div className="flex gap-5 items-start">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border-4 border-white/20 shadow-xl shrink-0">
                <img src="/images/dr-rajesh-goel.jpg" alt="Dr Rajesh Goel" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold">Dr Rajesh Goel</h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-300 rounded-full text-xs font-medium">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    Verified
                  </span>
                </div>
                <p className="text-blue-200 text-sm mb-1">Nephrology</p>
                <p className="text-blue-100/80 text-xs mb-3">{DOCTOR_INFO.qualifications.join(' · ')}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 backdrop-blur rounded-full text-xs">
                    <Award className="h-3 w-3" /> 24 yrs experience
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 backdrop-blur rounded-full text-xs">
                    <MapPin className="h-3 w-3" /> Delhi
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-xl px-5 py-3 text-center min-w-[100px]">
              <p className="text-2xl font-bold">3</p>
              <p className="text-[11px] text-blue-200">Clinics</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-5 py-3 text-center min-w-[120px]">
              <p className="text-2xl font-bold">₹500 – ₹1200</p>
              <p className="text-[11px] text-blue-200">Consult fee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content — 2 Column Layout */}
      <section className="py-10 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column — Content */}
            <div className="flex-1 min-w-0 space-y-8">
              {/* About */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#0A75BB]" /> About Dr Rajesh Goel
                </h2>
                <p className="text-gray-600 leading-relaxed text-sm mb-6">{DOCTOR_INFO.bio}</p>

                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide text-slate-500">Education</h3>
                <div className="space-y-2 mb-6">
                  {DOCTOR_INFO.education.map((edu, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <GraduationCap className="w-4 h-4 text-[#0A75BB] mt-0.5 shrink-0" />
                      <span className="text-gray-700 text-sm">{edu}</span>
                    </div>
                  ))}
                </div>

                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide text-slate-500">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {DOCTOR_INFO.specializations.map((spec, i) => (
                    <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Clinics & Timings */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100" id="clinics">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Clinics & timings</h2>
                <p className="text-xs text-slate-400 mb-5">{clinicDetails.length} locations</p>
                <div className="space-y-4">
                  {clinicDetails.map((clinic, i) => (
                    <div key={i} className="border border-slate-100 rounded-xl p-4 hover:border-slate-200 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 text-sm">{clinic.name}</h3>
                            {clinic.byAppointment && (
                              <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-medium">By Appt</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mb-2">{clinic.address}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{clinic.timing}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">In-clinic</span>
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">Video</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-gray-900 flex items-center justify-end gap-0.5">
                            <IndianRupee className="h-3 w-3" />{clinic.fee}
                          </p>
                          <p className="text-[11px] text-slate-400">consultation</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Link
                          href={`/book-appointment?type=${clinic.name.includes('Online') ? 'online' : 'offline'}`}
                          className="flex-1 text-center px-3 py-2 bg-[#0A75BB] text-white text-xs font-semibold rounded-lg hover:bg-[#085a94] transition-colors"
                        >
                          Book now
                        </Link>
                        <a
                          href={clinic.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <MapPin className="h-3 w-3" /> Get directions <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#0A75BB]" /> Credentials & experience
                </h2>
                <div className="space-y-0">
                  {[
                    { role: 'Senior Consultant — Department of Nephrology', org: 'Pushpawati Singhania Research Institute, New Delhi', period: 'Apr 2012 – Present' },
                    { role: 'Senior Registrar — Department of Nephrology', org: 'Indraprastha Apollo Hospital, New Delhi', period: 'Jan 2012 – Feb 2012' },
                    { role: 'Senior Transplant Fellow — Department of Nephrology', org: 'Medanta the Medicity, Gurgaon', period: 'Jan 2011 – Dec 2011' },
                    { role: 'DNB Resident — Department of Nephrology', org: 'Pushpawati Singhania Research Institute, New Delhi', period: 'Jul 2007 – Jul 2010' },
                    { role: 'Senior Resident — Department of Medicine', org: 'Holy Family Hospital, New Delhi', period: 'Dec 2006 – Jul 2007' },
                    { role: 'Junior Resident — Department of Medicine', org: 'Holy Family Hospital, New Delhi', period: 'Jun 2006 – Dec 2006' },
                    { role: 'DNB Resident — Department of Medicine', org: 'Holy Family Hospital, New Delhi', period: 'Jun 2003 – Jun 2006' },
                    { role: 'Junior Resident', org: 'Guru Tegh Bahadur Hospital, Delhi', period: 'Jul 2002 – Jun 2003' },
                  ].map((exp, i) => (
                    <div key={i} className="flex gap-4 py-3 border-b border-slate-50 last:border-0">
                      <div className="w-1 rounded-full bg-[#0A75BB]/20 shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{exp.role}</p>
                        <p className="text-xs text-slate-500">{exp.org}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{exp.period}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className="text-sm font-bold text-gray-900 mt-6 mb-3 uppercase tracking-wide text-slate-500">Registrations & certifications</h3>
                <div className="space-y-2">
                  {['Indian Society of Nephrology (ISN)', 'Medical Council of India', 'Delhi Medical Council', 'Delhi Nephrology Society'].map((reg, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-[#0A75BB] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                      {reg}
                    </div>
                  ))}
                </div>
              </div>

              {/* Research Work */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-gray-900 mb-5">Research Work</h2>
                <div className="space-y-3">
                  {[
                    { title: 'Gender Bias in Kidney Donation in India: Has It Changed Over the Past 2 Decades?', journal: 'Transplantation Proceedings 2020', doi: '10.1016/j.transproceed.2019.12.056' },
                    { title: 'Early recurrence of C3 glomerulopathy postrenal transplant manifesting as rapid progressive glomerulonephritis', journal: 'Indian Journal of Transplantation 2020', doi: '10.4103/ijot.ijot_44_19' },
                    { title: 'A rare experience with Rhupus: effect of rituximab', journal: 'Kidney International Reports 2020', doi: '10.1016/j.ekir.2020.02.941' },
                    { title: 'Increasing antibiotic resistance among renal transplant recipients with UTI - A developing world scenario', journal: 'Kidney International Reports 2019', doi: '10.1016/j.ekir.2019.05.515' },
                    { title: 'Increasing Proportion of Extensively Drug Resistant Gram Negative Uropathogens among Renal Transplant Recipients in North India', journal: 'Indian Journal of Nephrology', doi: '10.4103/ijn.IJN_155_20' },
                  ].map((paper, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">{paper.title}</h3>
                      <p className="text-xs text-gray-600">{paper.journal}</p>
                      <p className="text-xs text-[#0A75BB] mt-1">DOI: {paper.doi}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Patient Reviews */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Patient reviews</h2>
                <div className="text-center py-8 text-slate-400">
                  <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No reviews yet — be the first to review Dr Rajesh Goel after your visit.</p>
                </div>
              </div>

              {/* FAQ */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-gray-900 mb-5">Frequently asked questions</h2>
                <div className="space-y-3">
                  {doctorFaqs.map((faq, i) => (
                    <details key={i} className="group border border-slate-100 rounded-xl">
                      <summary className="px-5 py-3 cursor-pointer font-semibold text-gray-900 text-sm hover:text-[#0A75BB] list-none flex items-center justify-between">
                        {faq.question}
                        <svg className="h-4 w-4 text-slate-400 group-open:rotate-180 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </summary>
                      <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed">{faq.answer}</div>
                    </details>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column — Booking Widget (Sticky) */}
            <div className="w-full lg:w-[380px] shrink-0">
              <div className="lg:sticky lg:top-24">
                <BookingWidget />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-[#0A75BB] text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Consult Dr Rajesh Goel?</h2>
          <p className="mb-6 text-blue-100">Book your appointment now for expert kidney care</p>
          <Link href="/book-appointment" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0A75BB] font-bold rounded-xl hover:bg-gray-100 transition-all text-lg shadow-xl">
            Book Appointment
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
