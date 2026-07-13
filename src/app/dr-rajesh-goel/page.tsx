import Link from 'next/link';
import type { Metadata } from 'next';
import { DOCTOR_INFO, SITE_CONFIG, CONSULTATION_FEE } from '@/lib/constants';
import { PhysicianSchema, FAQSchema, BreadcrumbSchema } from '@/components/seo/JsonLd';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Dr Rajesh Goel - Best Nephrologist Delhi | 18+ Yrs',
  description:
    'Dr Rajesh Goel is a Senior Nephrologist & Kidney Transplant Physician in Delhi with 18+ years experience. MBBS, DNB Medicine, DNB Nephrology, Fellow Kidney Transplant. Book appointment online or at PSRI Hospital, Kidney Care Centre.',
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
    description: 'Senior Nephrologist & Kidney Transplant Physician with 18+ years experience. Book online or in-clinic appointment.',
    url: `${SITE_CONFIG.url}/dr-rajesh-goel`,
    siteName: SITE_CONFIG.name,
    type: 'profile',
    locale: 'en_IN',
    images: [{ url: `${SITE_CONFIG.url}/images/dr-rajesh-goel.jpg`, width: 1200, height: 630, alt: 'Dr Rajesh Goel - Best Nephrologist in Delhi' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dr Rajesh Goel - Best Nephrologist in Delhi',
    description: 'Senior Nephrologist & Kidney Transplant Physician with 18+ years experience. Book online or in-clinic appointment.',
    images: [`${SITE_CONFIG.url}/images/dr-rajesh-goel.jpg`],
  },
  alternates: { canonical: `${SITE_CONFIG.url}/dr-rajesh-goel` },
  robots: { index: true, follow: true },
};

const doctorFaqs = [
  {
    question: 'Who is the best nephrologist in Delhi?',
    answer: 'Dr Rajesh Goel is a highly experienced Senior Nephrologist and Kidney Transplant Physician in Delhi with over 18 years of experience. He holds MBBS, DNB Internal Medicine, DNB Nephrology, and Fellow Kidney Transplant Medicine qualifications and practices at PSRI Hospital and Kidney Care Centre.',
  },
  {
    question: 'What are Dr Rajesh Goel qualifications?',
    answer: 'Dr Rajesh Goel holds MBBS, DNB Internal Medicine, DNB Nephrology, and Fellow Kidney Transplant Medicine. He has over 18 years of experience treating kidney diseases and is registered with Delhi Medical Council (DMC/R/00734).',
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
    answer: 'The consultation fee starts from ₹500 for KCC Faridabad, ₹1200 for KCC Saket, ₹1000 for PSRI Hospital, and ₹500 for online consultation within India. International patients can consult for $20 USD. This covers a comprehensive evaluation, personalized treatment plan, and follow-up guidance.',
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

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0A75BB] to-[#063d5c] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-3 gap-10 items-center">
            <div className="md:col-span-1">
              <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                <img src="/images/dr-rajesh-goel.jpg" alt="Dr Rajesh Goel - Best Nephrologist in Delhi" className="w-full h-auto" />
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="text-blue-200 text-sm font-semibold mb-2">Senior Nephrologist & Kidney Transplant Physician</div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Dr Rajesh Goel</h1>
              <p className="text-blue-100 mb-4">{DOCTOR_INFO.qualifications.join(' | ')}</p>
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
                  18+ Years Experience
                </span>
                <span className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-sm flex items-center gap-1">
                  Reg. No. {DOCTOR_INFO.regNo}
                </span>
                <span className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-sm">{DOCTOR_INFO.languages.join(', ')}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/book-appointment" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#0A75BB] font-bold rounded-xl hover:bg-gray-100 transition-all shadow-xl text-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  Book Appointment
                </Link>
                <a href={`tel:${SITE_CONFIG.emergencyPhone}`} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-xl shadow-red-200 text-lg animate-pulse">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  Emergency: +91 9818235688
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">About Dr Rajesh Goel</h2>
          <p className="text-gray-600 leading-relaxed text-lg mb-8">{DOCTOR_INFO.bio}</p>

          <h3 className="text-xl font-bold text-gray-900 mb-4">Education & Qualifications</h3>
          <div className="space-y-3 mb-8">
            {DOCTOR_INFO.education.map((edu, i) => (
              <div key={i} className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#0A75BB] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z"/></svg>
                <span className="text-gray-700">{edu}</span>
              </div>
            ))}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-4">Specializations</h3>
          <div className="grid sm:grid-cols-2 gap-3 mb-8">
            {DOCTOR_INFO.specializations.map((spec, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <svg className="w-5 h-5 text-[#0A75BB]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                <span className="text-gray-700 font-medium">{spec}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Experience</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#0A75BB] text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold">Employer Name & Details</th>
                  <th className="px-4 py-3 font-semibold">From</th>
                  <th className="px-4 py-3 font-semibold">To</th>
                  <th className="px-4 py-3 font-semibold">Position Held</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="bg-white">
                  <td className="px-4 py-3 text-gray-700">Department of Nephrology, Pushpawati Singhania Research Institute, New Delhi</td>
                  <td className="px-4 py-3 text-gray-600">21.04.2012</td>
                  <td className="px-4 py-3 text-gray-600">Till date</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">Senior Consultant</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">Department of Nephrology, Indraprastha Apollo Hospital, New Delhi</td>
                  <td className="px-4 py-3 text-gray-600">03.01.2012</td>
                  <td className="px-4 py-3 text-gray-600">29.02.2012</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">Senior Registrar</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-4 py-3 text-gray-700">Department of Nephrology, Medanta the Medicity, Gurgaon</td>
                  <td className="px-4 py-3 text-gray-600">01.01.2011</td>
                  <td className="px-4 py-3 text-gray-600">31.12.2011</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">Senior Transplant Fellow</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">Department of Nephrology, Pushpawati Singhania Research Institute, New Delhi</td>
                  <td className="px-4 py-3 text-gray-600">16.07.2007</td>
                  <td className="px-4 py-3 text-gray-600">15.07.10</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">DNB Resident</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-4 py-3 text-gray-700">Department of Medicine, Holy Family Hospital, New Delhi</td>
                  <td className="px-4 py-3 text-gray-600">15.12.2006</td>
                  <td className="px-4 py-3 text-gray-600">14.07.07</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">Senior Resident</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">Department of Medicine, Holy Family Hospital, New Delhi</td>
                  <td className="px-4 py-3 text-gray-600">12.06.2006</td>
                  <td className="px-4 py-3 text-gray-600">14.12.06</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">Junior Resident</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-4 py-3 text-gray-700">Department of Medicine, Holy Family Hospital, New Delhi</td>
                  <td className="px-4 py-3 text-gray-600">12.06.2003</td>
                  <td className="px-4 py-3 text-gray-600">11.06.2006</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">DNB Resident</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">Guru Tegh Bahadur Hospital, Delhi</td>
                  <td className="px-4 py-3 text-gray-600">02.07.2002</td>
                  <td className="px-4 py-3 text-gray-600">10.06.2003</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">Junior Resident</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Research Work */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Research Work</h2>
          <div className="space-y-4">
            {[
              { title: 'Gender Bias in Kidney Donation in India: Has It Changed Over the Past 2 Decades?', journal: 'Transplantation Proceedings 2020', doi: '10.1016/j.transproceed.2019.12.056' },
              { title: 'Early recurrence of C3 glomerulopathy postrenal transplant manifesting as rapid progressive glomerulonephritis', journal: 'Indian Journal of Transplantation 2020', doi: '10.4103/ijot.ijot_44_19' },
              { title: 'A rare experience with Rhupus: effect of rituximab', journal: 'Kidney International Reports 2020', doi: '10.1016/j.ekir.2020.02.941' },
              { title: 'Increasing antibiotic resistance among renal transplant recipients with UTI - A developing world scenario', journal: 'Kidney International Reports 2019', doi: '10.1016/j.ekir.2019.05.515' },
              { title: 'Increasing Proportion of Extensively Drug Resistant Gram Negative Uropathogens among Renal Transplant Recipients in North India', journal: 'Indian Journal of Nephrology', doi: '10.4103/ijn.IJN_155_20' },
              { title: 'Increasing Incidence Of Extensive Drug-Resistant Gram-Negative Uropathogens Among Renal-Transplant Recipients in North India', journal: 'Indian Journal of Nephrology 2019 Nov, 29(Suppl 1)', doi: 'S39-S124' },
              { title: 'Post-Operative Bilateral Renal Sub capsular Hematoma, Successfully Treated with Laparoscopic Drainage - A Case Presentation', journal: 'J. Surgical Case Reports and Images 4(2)', doi: '10.31579/2690-1897/063' },
            ].map((paper, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-1">{paper.title}</h3>
                <p className="text-sm text-gray-600">{paper.journal}</p>
                <p className="text-xs text-[#0A75BB] mt-1">DOI: {paper.doi}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Poster Presentations */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Poster Presentations</h2>
          <div className="space-y-3">
            {[
              'A rare experience with Rhupus: effect of Rituximab at the World Conference of Nephrology Conference 2020 (Dubai)',
              'Increasing antibiotic resistance among renal transplant recipients with UTI – A developing world scenario at the World Conference of Nephrology 2019 (Melbourne)',
              'Early recurrence of C3 Glomerulopathy post Renal Transplant manifesting as Rapid Progressive Glomerulonephritis at International Update on Renal & Transplantation Pathology Conference 2019 (New Delhi)',
              'Necrotising Toxoplasma Encephalitis in Renal transplant recipient at Indian Society of Renal and Transplant Pathology Conference 2019 (Lucknow)',
              'Increasing incidence of extensive drug resistant Gram Negative uropathogens among renal transplant recipients in North India at the Indian Society of Nephrology Conference 2019 (Chandigarh)',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <svg className="w-5 h-5 text-[#0A75BB] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                <span className="text-gray-700 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clinic Locations */}
      <section className="py-16 bg-gray-50" id="clinics">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Clinic Locations</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {DOCTOR_INFO.clinics.map((clinic, i) => (
              <div key={i} className={`bg-white rounded-xl p-6 shadow-sm border-2 ${clinic.type === 'online' ? 'border-green-200' : 'border-gray-100'}`}>
                <div className="flex items-start gap-3 mb-3">
                  {clinic.type === 'online' ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">ONLINE</span>
                  ) : (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">IN-CLINIC</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{clinic.name}</h3>
                <div className="flex items-start gap-2 text-gray-600 text-sm mb-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                  {clinic.address}
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
                  {clinic.timing}
                </div>
                {clinic.byAppointment && (
                  <p className="text-xs text-orange-600 font-medium">By Appointment Only</p>
                )}
                {clinic.type === 'online' && (
                  <Link href="/book-appointment?type=online" className="inline-block mt-2 px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600">
                    Book Online
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {doctorFaqs.map((faq, i) => (
              <details key={i} className="bg-gray-50 rounded-xl group">
                <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-900 hover:text-[#0A75BB]">{faq.question}</summary>
                <div className="px-6 pb-4 text-gray-600 text-sm">{faq.answer}</div>
              </details>
            ))}
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
