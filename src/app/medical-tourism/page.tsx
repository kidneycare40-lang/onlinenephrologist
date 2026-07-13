import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';
import { FAQSchema, BreadcrumbSchema } from '@/components/seo/JsonLd';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Medical Tourism India | Kidney Specialist Online | Dr Goel',
  description:
    'Best nephrologist in India for international patients. Online kidney consultation from anywhere in the world. Dr Rajesh Goel - Senior Nephrologist & Kidney Transplant Physician with 18+ years experience. Book video consultation now.',
  keywords: [
    'medical tourism india',
    'nephrologist india',
    'kidney doctor india',
    'online nephrologist consultation',
    'kidney transplant india',
    'nephrology consultation online',
    'best nephrologist india',
    'kidney specialist online',
    'india medical tourism kidney',
    'nephrologist video consultation',
    'kidney treatment india',
    'chronic kidney disease treatment india',
    'dialysis india',
    'kidney transplant cost india',
    'nephrologist consultation fee india',
  ],
  openGraph: {
    title: 'Medical Tourism India | Best Nephrologist Online Consultation',
    description: 'Consult Dr Rajesh Goel, top nephrologist in India, from anywhere in the world. Online video consultation for kidney diseases, CKD, dialysis, and kidney transplant.',
    url: `${SITE_CONFIG.url}/medical-tourism`,
    locale: 'en_IN',
    images: [{ url: `${SITE_CONFIG.url}/images/dr-rajesh-goel.jpg`, width: 1200, height: 630, alt: 'Dr Rajesh Goel - Nephrologist India' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Medical Tourism India | Best Nephrologist Online Consultation',
    description: 'Consult Dr Rajesh Goel, top nephrologist in India, from anywhere in the world. Online video consultation for kidney diseases, CKD, dialysis, and kidney transplant.',
    images: [`${SITE_CONFIG.url}/images/dr-rajesh-goel.jpg`],
  },
  alternates: { canonical: `${SITE_CONFIG.url}/medical-tourism` },
  robots: { index: true, follow: true },
};

const tourismFaqs = [
  {
    question: 'Can I consult a nephrologist in India online?',
    answer: 'Yes, Dr Rajesh Goel offers online video consultations for international patients. You can book a consultation from anywhere in the world through our website. Consultations are available in English and Hindi.',
  },
  {
    question: 'How much does nephrologist consultation cost in India?',
    answer: 'The consultation fee with Dr Rajesh Goel is $20 USD for international patients. For patients in India, it starts from ₹500. This includes a comprehensive evaluation and personalized treatment plan.',
  },
  {
    question: 'What kidney treatments are available in India?',
    answer: 'India offers world-class kidney treatments including CKD management, dialysis (hemodialysis and peritoneal dialysis), kidney transplant, kidney biopsy, and treatment for glomerular diseases at significantly lower costs compared to Western countries.',
  },
  {
    question: 'Is kidney transplant safe in India?',
    answer: 'Yes, India has some of the best kidney transplant centers with success rates comparable to Western countries. Dr Rajesh Goel is a Fellow in Kidney Transplant Medicine with extensive experience in pre-transplant evaluation and post-transplant care.',
  },
  {
    question: 'How to book online consultation with Indian nephrologist?',
    answer: 'You can book an online consultation through our website at onlinenephrologist.com or via WhatsApp at +91 9818235613. Choose your preferred date and time, and get a video consultation link.',
  },
  {
    question: 'What documents do I need for online consultation?',
    answer: 'For online consultation, please have your recent blood reports (creatinine, eGFR, BUN), urine reports, imaging studies (ultrasound/CT if available), current medication list, and previous medical records ready.',
  },
  {
    question: 'Do you provide treatment plans for international patients?',
    answer: 'Yes, Dr Rajesh Goel provides comprehensive treatment plans including medication prescriptions, lifestyle modifications, dietary recommendations, and follow-up schedules that can be shared with your local doctor.',
  },
  {
    question: 'What time zones do you accommodate for online consultations?',
    answer: 'Online consultations are available Monday to Saturday, 9:00 AM to 7:00 PM IST (Indian Standard Time). We can accommodate patients from different time zones with advance booking.',
  },
];

export default function MedicalTourismPage() {
  return (
    <>
      <FAQSchema faqs={tourismFaqs} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MedicalBusiness',
            name: 'Online Nephrologist - Dr Rajesh Goel',
            description: 'Best nephrologist in India for international patients. Online kidney consultation from anywhere in the world.',
            url: SITE_CONFIG.url,
            telephone: SITE_CONFIG.phone,
            email: SITE_CONFIG.email,
            address: {
              '@type': 'PostalAddress',
              streetAddress: '13B, Saket Rd, Block K, Saket',
              addressLocality: 'New Delhi',
              addressRegion: 'Delhi',
              postalCode: '110017',
              addressCountry: 'IN',
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: 28.5244,
              longitude: 77.2066,
            },
            medicalSpecialty: 'Nephrology',
            availableService: [
              { '@type': 'MedicalProcedure', name: 'Online Nephrology Consultation' },
              { '@type': 'MedicalProcedure', name: 'Kidney Transplant Evaluation' },
              { '@type': 'MedicalProcedure', name: 'CKD Management' },
              { '@type': 'MedicalTherapy', name: 'Dialysis Management' },
            ],
            priceRange: '$20 USD',
            openingHoursSpecification: [
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                opens: '09:00',
                closes: '19:00',
              },
            ],
          }),
        }}
      />

      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0A75BB] to-[#063d5c] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Available for International Patients
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Best Nephrologist in India for <span className="text-blue-200">International Patients</span>
              </h1>
              <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                Consult Dr Rajesh Goel, Senior Nephrologist & Kidney Transplant Physician, from anywhere in the world. 
                18+ years experience treating kidney diseases with world-class care at affordable prices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/book-online-consultation" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#0A75BB] font-bold rounded-xl hover:bg-gray-100 transition-all shadow-xl text-lg">
                  Book Online Consultation - $20 USD
                </Link>
                <a href={`https://wa.me/${SITE_CONFIG.whatsapp}?text=Hi%2C%20I%20am%20an%20international%20patient%20seeking%20kidney%20consultation`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all text-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                <img src="/images/dr-rajesh-goel.jpg" alt="Dr Rajesh Goel - Best Nephrologist India" className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose India */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose India for Kidney Treatment?</h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">India is a global hub for medical tourism, offering world-class healthcare at fraction of costs in Western countries</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '💰', title: 'Affordable Costs', desc: 'Kidney treatment costs 60-80% less than US, UK, or Australia. Consultation fee is just $20 USD for international patients.' },
              { icon: '🏆', title: 'World-Class Doctors', desc: 'Indian nephrologists are globally trained with international certifications and decades of experience.' },
              { icon: '🏥', title: 'Modern Infrastructure', desc: 'Hospitals with latest technology, NABH/JCI accredited facilities, and international patient services.' },
              { icon: '🗣️', title: 'English Speaking', desc: 'No language barrier. All consultations and treatment plans provided in English and Hindi.' },
              { icon: '✈️', title: 'Easy Visa Process', desc: 'Medical visa available for patients. Our team assists with visa documentation and travel arrangements.' },
              { icon: '🌍', title: 'Global Patient Base', desc: 'Patients from USA, UK, Australia, Africa, Middle East, and Southeast Asia trust Indian healthcare.' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Treatments for International Patients */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Kidney Treatments We Offer</h2>
            <p className="text-gray-600 text-lg">Comprehensive nephrology care for patients from around the world</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: 'Online Video Consultation', desc: 'Get expert advice from Dr Rajesh Goel from the comfort of your home. Comprehensive evaluation, treatment plans, and follow-up guidance.', price: '$20 USD' },
              { title: 'Chronic Kidney Disease (CKD) Management', desc: 'Staging, lifestyle modification, medication management, and planning for dialysis or transplant when needed.', price: 'Customized' },
              { title: 'Kidney Transplant Evaluation', desc: 'Pre-transplant evaluation, donor matching guidance, post-transplant care, and immunosuppressive medication management.', price: 'Customized' },
              { title: 'Dialysis Management', desc: 'Hemodialysis and peritoneal dialysis guidance, access planning, and coordination with dialysis centers.', price: 'Customized' },
              { title: 'Kidney Biopsy', desc: 'Minimally invasive diagnostic procedure to determine the cause of kidney disease and guide treatment.', price: 'Customized' },
              { title: 'Second Opinion Services', desc: 'Get a second opinion from an experienced nephrologist for complex kidney cases or treatment decisions.', price: '$20 USD' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full whitespace-nowrap">{item.price}</span>
                </div>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How Online Consultation Works</h2>
            <p className="text-gray-600 text-lg">Simple 4-step process to get expert kidney care from anywhere</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Book Online', desc: 'Choose your preferred date and time. Pay consultation fee of $20 USD.' },
              { step: '2', title: 'Submit Reports', desc: 'Upload your medical reports, blood tests, and imaging studies.' },
              { step: '3', title: 'Video Consultation', desc: 'Meet Dr Rajesh Goel via secure video call from anywhere in the world.' },
              { step: '4', title: 'Get Treatment Plan', desc: 'Receive personalized treatment plan, prescriptions, and follow-up schedule.' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-[#0A75BB] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">{item.step}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost Comparison */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Treatment Cost Comparison</h2>
            <p className="text-gray-600 text-lg">Significant savings compared to Western countries</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#0A75BB] text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Treatment</th>
                    <th className="px-6 py-4 text-left font-semibold">India (Approx)</th>
                    <th className="px-6 py-4 text-left font-semibold">USA/UK (Approx)</th>
                    <th className="px-6 py-4 text-left font-semibold">Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { treatment: 'Online Consultation', india: '$20 USD', us: '$200-500', savings: '90-97%' },
                    { treatment: 'Kidney Transplant', india: '₹15-25 Lakh ($18K-30K)', us: '$300,000-500,000', savings: '90-94%' },
                    { treatment: 'Hemodialysis (per session)', india: '₹2000-3000 ($25-35)', us: '$500-1000', savings: '95-97%' },
                    { treatment: 'Kidney Biopsy', india: '₹30,000-50,000 ($360-600)', us: '$5,000-10,000', savings: '90-94%' },
                    { treatment: 'CKD Treatment (monthly)', india: '₹5000-15000 ($60-180)', us: '$1000-3000', savings: '94-98%' },
                  ].map((item, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 font-medium text-gray-900">{item.treatment}</td>
                      <td className="px-6 py-4 text-green-600 font-semibold">{item.india}</td>
                      <td className="px-6 py-4 text-red-600">{item.us}</td>
                      <td className="px-6 py-4 text-[#0A75BB] font-bold">{item.savings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Countries We Serve */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Patients From Around the World</h2>
            <p className="text-gray-600 text-lg">We serve international patients from countries across the globe</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {['United States', 'United Kingdom', 'Australia', 'Canada', 'UAE', 'Saudi Arabia', 'Africa', 'Singapore', 'Malaysia', 'Bangladesh', 'Nepal', 'Sri Lanka'].map((country) => (
              <div key={country} className="bg-gray-50 rounded-lg p-4 text-center hover:bg-blue-50 transition-colors">
                <span className="text-2xl mb-2 block">🌍</span>
                <span className="text-sm font-medium text-gray-700">{country}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {tourismFaqs.map((faq, i) => (
              <details key={i} className="bg-white rounded-xl shadow-sm group">
                <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-900 hover:text-[#0A75BB]">{faq.question}</summary>
                <div className="px-6 pb-4 text-gray-600 text-sm">{faq.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-[#0A75BB] to-[#063d5c] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Expert Kidney Care?</h2>
          <p className="text-blue-100 text-lg mb-8">Book your online consultation with Dr Rajesh Goel today. Available for patients worldwide.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book-online-consultation" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#0A75BB] font-bold rounded-xl hover:bg-gray-100 transition-all shadow-xl text-lg">
              Book Online Consultation
            </Link>
            <a href={`https://wa.me/${SITE_CONFIG.whatsapp}?text=Hi%2C%20I%20am%20an%20international%20patient`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all text-lg">
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      <BreadcrumbSchema
        items={[
          { name: 'Home', url: SITE_CONFIG.url },
          { name: 'Medical Tourism India', url: `${SITE_CONFIG.url}/medical-tourism` },
        ]}
      />
      <Footer />
    </>
  );
}
