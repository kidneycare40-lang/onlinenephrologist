import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_CONFIG, CONSULTATION_FEE } from '@/lib/constants';
import { FAQSchema, BreadcrumbSchema } from '@/components/seo/JsonLd';
import { getAllConditions } from '@/lib/data/conditions-data';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Kidney Conditions & Treatments | Nephrologist Delhi',
  description:
    'Comprehensive guide to kidney conditions including CKD, kidney stones, dialysis, kidney transplant, diabetic nephropathy, and hypertension. Expert nephrology care by Dr Rajesh Goel, Delhi.',
  keywords: ['kidney conditions', 'CKD treatment', 'kidney stones', 'dialysis', 'kidney transplant', 'nephrology treatments delhi', 'best nephrologist Delhi', 'kidney specialist near me'],
  alternates: { canonical: `${SITE_CONFIG.url}/conditions` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Kidney Conditions & Treatments | Nephrologist Delhi',
    description:
      'Comprehensive guide to kidney conditions including CKD, kidney stones, dialysis, kidney transplant, diabetic nephropathy, and hypertension. Expert nephrology care by Dr Rajesh Goel, Delhi.',
    url: `${SITE_CONFIG.url}/conditions`,
    siteName: SITE_CONFIG.name,
    type: 'website',
    locale: 'en_US',
    images: [{ url: `${SITE_CONFIG.url}/images/dr-rajesh-goel.jpg`, width: 1200, height: 630, alt: 'Kidney Conditions and Treatments' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kidney Conditions & Treatments | Nephrologist Delhi',
    description:
      'Comprehensive guide to kidney conditions including CKD, kidney stones, dialysis, kidney transplant, diabetic nephropathy, and hypertension. Expert nephrology care by Dr Rajesh Goel, Delhi.',
    images: [`${SITE_CONFIG.url}/images/dr-rajesh-goel.jpg`],
  },
};

const conditionFaqs = [
  {
    question: 'What are the early signs of kidney disease?',
    answer: 'Early signs of kidney disease include fatigue, swelling in legs/ankles, changes in urination (foamy or bloody urine), persistent high blood pressure, and loss of appetite. Regular check-ups with a nephrologist can detect kidney issues early.',
  },
  {
    question: 'When should I see a nephrologist?',
    answer: 'You should see a nephrologist if you have diabetes, high blood pressure, family history of kidney disease, abnormal blood or urine test results, or symptoms like swelling, foamy urine, or changes in urination patterns.',
  },
  {
    question: 'Is kidney disease curable?',
    answer: 'While some causes of kidney disease can be treated and reversed (like acute kidney injury), chronic kidney disease is generally not curable. However, with proper management, progression can be slowed significantly. Dr Goel provides personalized treatment plans to manage kidney disease effectively.',
  },
  {
    question: 'What foods are good for kidney health?',
    answer: 'Kidney-friendly foods include low-sodium options, fresh fruits and vegetables, whole grains, and lean proteins. Avoid processed foods, excessive salt, and high-potassium foods if advised. Dr Goel provides personalized dietary guidance based on your kidney function.',
  },
];

const conditionStyles: Record<string, { gradient: string; icon: React.ReactNode; emoji: string }> = {
  'chronic-kidney-disease': { gradient: 'from-red-500 to-rose-600', emoji: '🫘', icon: <><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="12" r="2" fill="currentColor"/></> },
  'dialysis': { gradient: 'from-blue-500 to-indigo-600', emoji: '💉', icon: <><path d="M12 2v6m0 8v6m-4-14l-2 4m6-4l2 4M8 10l-2 4m6-4l2 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5"/></> },
  'kidney-transplant': { gradient: 'from-emerald-500 to-teal-600', emoji: '🫀', icon: <><path d="M16 8c0-2.21-1.79-4-4-4S8 5.79 8 8c0 4 4 8 4 8s4-4 4-8z" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M9 8h6M12 5v6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></> },
  'kidney-stones': { gradient: 'from-amber-500 to-orange-600', emoji: '💎', icon: <><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></> },
  'hypertension': { gradient: 'from-pink-500 to-rose-600', emoji: '🩺', icon: <><path d="M3 12h2l2-4 3 8 2-6 2 4h7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></> },
  'diabetic-kidney-disease': { gradient: 'from-violet-500 to-purple-600', emoji: '💉', icon: <><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M12 7v5l3 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M8 3h8M3 8v8M19 8v8M8 19h8" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4"/></> },
  'swelling-legs': { gradient: 'from-cyan-500 to-blue-600', emoji: '🦵', icon: <><path d="M8 2v6c0 2 1 4 3 4v10M16 2v6c0 2-1 4-3 4v10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></> },
  'foamy-urine': { gradient: 'from-yellow-500 to-amber-600', emoji: '🧪', icon: <><path d="M9 3h6v4l3 8v2a3 3 0 01-3 3H9a3 3 0 01-3-3v-2l3-8V3z" fill="none" stroke="currentColor" strokeWidth="1.5"/><circle cx="10" cy="14" r="1" fill="currentColor" opacity="0.5"/><circle cx="14" cy="12" r="0.8" fill="currentColor" opacity="0.5"/></> },
  'kidney-infection': { gradient: 'from-red-600 to-red-700', emoji: '🦠', icon: <><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></> },
  'kidney-cysts': { gradient: 'from-teal-500 to-cyan-600', emoji: '🫧', icon: <><circle cx="12" cy="10" r="5" fill="none" stroke="currentColor" strokeWidth="1.5"/><circle cx="10" cy="9" r="1.5" fill="currentColor" opacity="0.3"/><circle cx="14" cy="11" r="1" fill="currentColor" opacity="0.3"/></> },
  'kidney-cancer': { gradient: 'from-gray-700 to-gray-900', emoji: '🔬', icon: <><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M12 3v18M3 12h18" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M12 9v6M9 12h6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></> },
  'nephrotic-syndrome': { gradient: 'from-indigo-500 to-blue-600', emoji: '🧬', icon: <><path d="M12 2c-3 4-6 6-6 10a6 6 0 1012 0c0-4-3-6-6-10z" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M9 14c0 1.66 1.34 3 3 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></> },
  'polycystic-kidney-disease': { gradient: 'from-purple-500 to-violet-600', emoji: '🫧', icon: <><ellipse cx="9" cy="12" rx="5" ry="7" fill="none" stroke="currentColor" strokeWidth="1.5"/><ellipse cx="15" cy="12" rx="5" ry="7" fill="none" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="10" r="1.2" fill="currentColor" opacity="0.4"/><circle cx="11" cy="14" r="0.9" fill="currentColor" opacity="0.4"/><circle cx="14" cy="11" r="1.1" fill="currentColor" opacity="0.4"/><circle cx="16" cy="14" r="0.7" fill="currentColor" opacity="0.4"/></> },
  'gout-and-kidneys': { gradient: 'from-orange-500 to-red-600', emoji: '🦴', icon: <><path d="M12 3v4M12 17v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M3 12h4M17 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3"/></> },
  'electrolyte-imbalance': { gradient: 'from-lime-500 to-green-600', emoji: '⚡', icon: <><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></> },
};

function getConditionStyle(slug: string) {
  return conditionStyles[slug] || { gradient: 'from-blue-500 to-indigo-600', emoji: '🏥', icon: <><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M12 8v8M8 12h8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></> };
}

export default function ConditionsPage() {
  const conditions = getAllConditions();

  return (
    <>
      <FAQSchema faqs={conditionFaqs} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: SITE_CONFIG.url },
          { name: 'Kidney Conditions', url: `${SITE_CONFIG.url}/conditions` },
        ]}
      />

      <Navbar />

      <section className="bg-gradient-to-br from-[#0A75BB] to-[#063d5c] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Kidney Conditions & Treatments</h1>
          <p className="text-blue-100 text-lg">Comprehensive nephrology care by Dr Rajesh Goel for all kidney-related conditions</p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {conditions.map((condition) => {
              const style = getConditionStyle(condition.slug);
              return (
                <Link
                  key={condition.slug}
                  href={`/conditions/${condition.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl border border-gray-100 hover:border-[#0A75BB] transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  {/* Gradient Header with Icon */}
                  <div className={`bg-gradient-to-br ${style.gradient} px-6 py-5 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-6 -translate-x-6" />
                    <div className="relative flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">{style.icon}</svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white leading-tight">{condition.title}</h2>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">{condition.heroDescription}</p>

                    {/* Symptoms */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {condition.symptoms.slice(0, 3).map((s, i) => (
                        <span key={i} className="px-2.5 py-1 bg-red-50 text-red-600 text-[11px] font-medium rounded-full border border-red-100">{s}</span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#0A75BB] group-hover:underline">
                        Learn More →
                      </span>
                      <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-[#0A75BB] group-hover:text-white transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {conditionFaqs.map((faq, i) => (
              <details key={i} className="bg-white rounded-xl shadow-sm group border border-gray-100">
                <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-900 hover:text-[#0A75BB]">{faq.question}</summary>
                <div className="px-6 pb-4 text-gray-600 text-sm">{faq.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#0A75BB] text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Need Expert Kidney Care?</h2>
          <p className="mb-6 text-blue-100">Book a consultation with Dr Rajesh Goel today</p>
          <Link href="/book-appointment" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0A75BB] font-bold rounded-xl hover:bg-gray-100 transition-all text-lg shadow-xl">
            Book Appointment
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
