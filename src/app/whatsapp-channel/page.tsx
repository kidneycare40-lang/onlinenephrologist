'use client';

import { SITE_CONFIG } from '@/lib/constants';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BreadcrumbSchema, WebPageSchema } from '@/components/seo/JsonLd';

export default function WhatsAppChannelPage() {
  return (
    <>
      <Navbar />

      <section className="bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <svg className="w-20 h-20 mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Kidney Care Centre WhatsApp Channel</h1>
          <p className="text-green-100 text-lg mb-6">Stay updated with the latest kidney health tips, medical insights, and clinic updates from Dr Rajesh Goel</p>
          <a
            href={SITE_CONFIG.whatsappChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#25D366] font-bold rounded-xl hover:bg-gray-100 transition-all shadow-xl text-lg"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Follow on WhatsApp
          </a>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Latest Posts</h2>
          <p className="text-gray-500 text-center mb-8">Follow our WhatsApp channel for real-time updates</p>
          <div className="space-y-6">
            {[
              {
                date: '10/06/2026',
                title: 'CKD Diet Guide (Not on Dialysis)',
                content: 'A healthy diet plays an important role in slowing the progression of Chronic Kidney Disease (CKD) and maintaining overall health.',
                points: ['Choose kidney-friendly foods', 'Limit salt, processed foods, and soft drinks', 'Avoid high-potassium foods unless advised by your nephrologist', 'Follow your doctor\'s advice regarding water intake'],
              },
              {
                date: '06/06/2026',
                title: 'WhatsApp Appointment Available',
                content: 'Dr. Rajesh Goel, Senior Nephrologist & Kidney Transplant Physician is now available for WhatsApp appointments.',
                points: ['Book appointment via WhatsApp: +91 9818235613', 'Online consultation available', 'Sunday OPD Available'],
              },
              {
                date: '01/06/2026',
                title: 'Kidney Health Tips',
                content: 'Your kidneys work silently every day — take care of them before problems begin.',
                points: ['Drink enough water', 'Eat a healthy diet', 'Control blood pressure and diabetes', 'Get regular kidney function tests'],
              },
            ].map((post, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-[#075E54] text-white px-4 py-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  <span className="font-semibold text-sm">Kidney Care Centre</span>
                  <span className="ml-auto text-xs opacity-75">{post.date}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2">{post.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{post.content}</p>
                  <ul className="space-y-1">
                    {post.points.map((point, j) => (
                      <li key={j} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a
              href={SITE_CONFIG.whatsappChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-semibold rounded-lg hover:bg-[#128C7E] transition-colors"
            >
              View All Posts on WhatsApp →
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What You&apos;ll Get</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '💡', title: 'Kidney Health Tips', desc: 'Daily tips to keep your kidneys healthy and prevent kidney disease' },
              { icon: '📺', title: 'Video Updates', desc: 'Latest educational videos on kidney treatments and conditions' },
              { icon: '🏥', title: 'Clinic Announcements', desc: 'OPD schedules, holiday notices, and clinic updates' },
              { icon: '❓', title: 'Health Q&A', desc: 'Answers to frequently asked questions about kidney health' },
              { icon: '🩺', title: 'Dr Rajesh Goel Insights', desc: 'Expert medical advice from a senior nephrologist' },
              { icon: '📢', title: 'Health Camps', desc: 'Information about free health checkup camps and events' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About Kidney Care Centre</h2>
          <p className="text-gray-600 mb-6">Kidney Care Centre owned by Dr Rajesh Goel, Senior Consultant Nephrologist and Kidney Transplant Physician. Specialized in treatments including chronic kidney disease, dialysis, and kidney transplant.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={`tel:${SITE_CONFIG.phone}`} className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A75BB] text-white font-semibold rounded-lg hover:bg-[#085a94] transition-colors">
              📞 Call: +91 9818235613
            </a>
            <a href={`https://wa.me/${SITE_CONFIG.whatsapp}`} className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-semibold rounded-lg hover:bg-[#128C7E] transition-colors">
              💬 WhatsApp: +91 9818235613
            </a>
          </div>
        </div>
      </section>

      <BreadcrumbSchema
        items={[
          { name: 'Home', url: SITE_CONFIG.url },
          { name: 'WhatsApp Channel', url: `${SITE_CONFIG.url}/whatsapp-channel` },
        ]}
      />
      <WebPageSchema
        title="WhatsApp Channel | Kidney Health Updates | Dr Rajesh Goel"
        description="Join Dr Rajesh Goel WhatsApp channel for kidney health tips, CKD management advice, dialysis guidance, and nephrology updates."
        url={`${SITE_CONFIG.url}/whatsapp-channel`}
      />
      <Footer />
    </>
  );
}
