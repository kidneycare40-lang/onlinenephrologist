import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';
import { getConditionBySlug, getAllConditions } from '@/lib/data/conditions-data';
import { FAQSchema, BreadcrumbSchema } from '@/components/seo/JsonLd';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  return getAllConditions().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const condition = getConditionBySlug(params.slug);
  if (!condition) return {};
  return {
    title: condition.metaTitle,
    description: condition.metaDescription,
    keywords: condition.keywords,
    alternates: { canonical: `${SITE_CONFIG.url}/conditions/${condition.slug}` },
    openGraph: {
      title: condition.metaTitle,
      description: condition.metaDescription,
      url: `${SITE_CONFIG.url}/conditions/${condition.slug}`,
      type: 'article',
      siteName: SITE_CONFIG.name,
      locale: 'en_US',
      images: [{ url: `${SITE_CONFIG.url}/images/dr-rajesh-goel.jpg`, width: 1200, height: 630, alt: condition.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: condition.metaTitle,
      description: condition.metaDescription,
      images: [`${SITE_CONFIG.url}/images/dr-rajesh-goel.jpg`],
    },
    robots: { index: true, follow: true },
  };
}

export default function ConditionPage({ params }: Props) {
  const condition = getConditionBySlug(params.slug);
  if (!condition) notFound();

  const allConditions = getAllConditions();
  const related = allConditions.filter((c) => c.slug !== condition.slug).slice(0, 4);

  return (
    <>
      <FAQSchema faqs={condition.faqs} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: SITE_CONFIG.url },
          { name: 'Kidney Conditions', url: `${SITE_CONFIG.url}/conditions` },
          { name: condition.title, url: `${SITE_CONFIG.url}/conditions/${condition.slug}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MedicalCondition',
            name: condition.title,
            description: condition.overview.substring(0, 500),
            url: `${SITE_CONFIG.url}/conditions/${condition.slug}`,
            provider: {
              '@type': 'Physician',
              name: 'Dr. Rajesh Goel',
              url: `${SITE_CONFIG.url}/dr-rajesh-goel`,
              medicalSpecialty: 'Nephrology',
            },
            possibleTreatment: condition.treatments.map((t) => ({
              '@type': 'MedicalTherapy',
              name: t.name,
              description: t.description,
            })),
            signOrSymptom: condition.symptoms.map((s) => ({
              '@type': 'MedicalSymptom',
              name: s,
            })),
          }),
        }}
      />

      <Navbar />

      <nav className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-3 text-sm text-gray-500">
          <Link href="/" className="hover:text-[#0A75BB]">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/conditions" className="hover:text-[#0A75BB]">Kidney Conditions</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{condition.title}</span>
        </div>
      </nav>

      <article>
        <section className="bg-gradient-to-br from-[#0A75BB] to-[#063d5c] text-white py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{condition.title}</h1>
            <p className="text-blue-100 text-lg max-w-3xl">{condition.heroDescription}</p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link href="/book-appointment" className="px-6 py-3 bg-white text-[#0A75BB] font-bold rounded-lg hover:bg-gray-100 transition-colors text-sm">
                Book Consultation
              </Link>
              <a href="tel:+919818235613" className="px-6 py-3 border border-white/40 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors text-sm">
                Call +91 98182 35613
              </a>
            </div>
          </div>
        </section>

        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
              <div className="text-gray-600 leading-relaxed whitespace-pre-line">{condition.overview}</div>
            </div>
          </div>
        </section>

        {condition.causes.length > 0 && (
          <section className="py-12 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Causes</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {condition.causes.map((cause, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-sm text-gray-700">{cause}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {condition.symptoms.length > 0 && (
          <section className="py-12 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Symptoms to Watch For</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {condition.symptoms.map((symptom, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                    <span className="text-red-500 text-lg">⚠</span>
                    <span className="text-sm font-medium text-red-800">{symptom}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {condition.riskFactors.length > 0 && (
          <section className="py-12 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Risk Factors</h2>
              <ul className="space-y-3">
                {condition.riskFactors.map((rf, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <span className="text-[#0A75BB] mt-1">●</span>
                    <span>{rf}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {condition.diagnosis.length > 0 && (
          <section className="py-12 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Diagnosis</h2>
              <div className="space-y-3">
                {condition.diagnosis.map((d, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-[#0A75BB] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-sm text-gray-700">{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {condition.treatments.length > 0 && (
          <section className="py-12 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Treatment Options</h2>
              <div className="space-y-4">
                {condition.treatments.map((t, i) => (
                  <div key={i} className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-2">{t.name}</h3>
                    <p className="text-sm text-gray-600">{t.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {condition.prevention.length > 0 && (
          <section className="py-12 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Prevention & Lifestyle Tips</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {condition.prevention.map((p, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <span className="text-emerald-500 text-lg">✓</span>
                    <span className="text-sm text-emerald-800">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {condition.diet.length > 0 && (
          <section className="py-12 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Dietary Recommendations</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {condition.diet.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                    <span className="text-amber-500">🥗</span>
                    <span className="text-sm text-gray-700">{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2">When to See a Nephrologist?</h2>
              <p className="text-gray-700 mb-4">{condition.whenToSeeDoctor}</p>
              <Link href="/book-appointment" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A75BB] text-white font-semibold rounded-lg hover:bg-[#085a94] transition-colors text-sm">
                Consult Dr Rajesh Goel →
              </Link>
            </div>
          </div>
        </section>

        {condition.faqs.length > 0 && (
          <section className="py-12 bg-gray-50">
            <div className="max-w-3xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {condition.faqs.map((faq, i) => (
                  <details key={i} className="bg-white rounded-xl shadow-sm group">
                    <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-900 hover:text-[#0A75BB]">{faq.question}</summary>
                    <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">{faq.answer}</div>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Conditions</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((rc) => (
                <Link
                  key={rc.slug}
                  href={`/conditions/${rc.slug}`}
                  className="p-4 bg-white rounded-xl border border-gray-100 hover:border-[#0A75BB] hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{rc.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{rc.heroDescription}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-[#0A75BB] text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Expert {condition.title} Treatment</h2>
            <p className="mb-6 text-blue-100">Get personalized treatment from Dr Rajesh Goel — Senior Nephrologist with 18+ years experience</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/book-appointment" className="px-8 py-4 bg-white text-[#0A75BB] font-bold rounded-xl hover:bg-gray-100 transition-all text-lg shadow-xl">
                Book Appointment
              </Link>
              <a href="tel:+919818235613" className="px-8 py-4 border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition-all text-lg">
                Call Now
              </a>
            </div>
          </div>
        </section>
      </article>

      <Footer />
    </>
  );
}
