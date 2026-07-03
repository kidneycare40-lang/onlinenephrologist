import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';
import { BreadcrumbSchema } from '@/components/seo/JsonLd';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy | Online Nephrologist',
  description: 'Privacy policy for Online Nephrologist. Learn how we collect, use, and protect your personal and medical information.',
  keywords: ['privacy policy', 'kidney care privacy', 'medical data protection', 'Online Nephrologist privacy', 'patient privacy India'],
  alternates: { canonical: `${SITE_CONFIG.url}/privacy-policy` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Privacy Policy | Online Nephrologist',
    description: 'Privacy policy for Online Nephrologist. Learn how we collect, use, and protect your personal and medical information.',
    url: `${SITE_CONFIG.url}/privacy-policy`,
    siteName: SITE_CONFIG.name,
    type: 'website',
    locale: 'en_US',
    images: [{ url: `${SITE_CONFIG.url}/images/dr-rajesh-goel.png`, width: 1200, height: 630, alt: 'Online Nephrologist Privacy Policy' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | Online Nephrologist',
    description: 'Privacy policy for Online Nephrologist. Learn how we collect, use, and protect your personal and medical information.',
    images: [`${SITE_CONFIG.url}/images/dr-rajesh-goel.png`],
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: SITE_CONFIG.url },
          { name: 'Privacy Policy', url: `${SITE_CONFIG.url}/privacy-policy` },
        ]}
      />
      <Navbar />

      <section className="bg-gradient-to-br from-[#0A75BB] to-[#063d5c] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-blue-100">Last updated: January 2025</p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate max-w-none">

          <h2>1. Introduction</h2>
          <p>Online Nephrologist (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website (onlinenephrologist.com) and use our services, including online consultations, appointment booking, and our EMR (Electronic Medical Records) system.</p>

          <h2>2. Information We Collect</h2>
          <h3>2.1 Personal Information</h3>
          <ul>
            <li>Full name, age, gender, date of birth</li>
            <li>Contact details (phone number, email address, WhatsApp number)</li>
            <li>Address and location information</li>
            <li>Payment information (processed securely, not stored on our servers)</li>
          </ul>

          <h3>2.2 Medical Information</h3>
          <ul>
            <li>Medical history and current health conditions</li>
            <li>Lab reports, prescriptions, and test results</li>
            <li>Kidney function data (eGFR, creatinine levels, etc.)</li>
            <li>Consultation notes and treatment plans</li>
            <li>Medication history</li>
          </ul>

          <h3>2.3 Technical Information</h3>
          <ul>
            <li>Browser type and version</li>
            <li>IP address and device information</li>
            <li>Pages visited and time spent on our website</li>
            <li>Referring website or source</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <ul>
            <li><strong>Medical Consultation:</strong> To provide accurate diagnosis, treatment, and follow-up care</li>
            <li><strong>Appointment Management:</strong> To schedule, confirm, and manage your appointments</li>
            <li><strong>Patient Communication:</strong> To send appointment reminders, health tips, and follow-up instructions via WhatsApp, SMS, or email</li>
            <li><strong>EMR System:</strong> To maintain accurate electronic medical records for continuity of care</li>
            <li><strong>Medical Tourism:</strong> To assist international patients with hospital referrals and treatment facilitation</li>
            <li><strong>Website Improvement:</strong> To analyze website usage and improve our services</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>We implement industry-standard security measures to protect your data:</p>
          <ul>
            <li>SSL/TLS encryption for all data transmission</li>
            <li>Encrypted storage for medical records</li>
            <li>Access controls — only authorized medical staff can access patient data</li>
            <li>Regular security audits and updates</li>
            <li>Compliance with Indian IT Act, 2000 and applicable data protection rules</li>
          </ul>

          <h2>5. Data Sharing</h2>
          <p><strong>We do not sell, trade, or rent your personal or medical information to any third party.</strong></p>
          <p>We may share your information only in the following cases:</p>
          <ul>
            <li><strong>With your explicit consent</strong> — e.g., sharing reports with another doctor you specify</li>
            <li><strong>Hospital referrals</strong> — when you request admission or surgery at a partner hospital</li>
            <li><strong>Legal requirements</strong> — if required by law, court order, or government authority</li>
            <li><strong>Medical emergencies</strong> — to protect your vital interests</li>
          </ul>

          <h2>6. WhatsApp & Communication</h2>
          <p>When you communicate with us via WhatsApp (+91 98182 35613):</p>
          <ul>
            <li>Messages are end-to-end encrypted by WhatsApp</li>
            <li>We may retain chat records as part of your medical file</li>
            <li>You can request deletion of chat records at any time</li>
            <li>We will never share your WhatsApp conversations with third parties</li>
          </ul>

          <h2>7. EMR System</h2>
          <p>Our EMR system stores your medical data locally on your device/browser using localStorage. This data:</p>
          <ul>
            <li>Is stored on your device, not on external servers</li>
            <li>Can be cleared by you at any time through browser settings</li>
            <li>Is used to maintain consultation history and prescriptions</li>
            <li>Is backed up only if you explicitly export it</li>
          </ul>

          <h2>8. Cookies</h2>
          <p>We use essential cookies to ensure proper website functionality. We do not use tracking cookies or share cookie data with advertisers. You can disable cookies in your browser settings, though some features may not work properly.</p>

          <h2>9. Children&apos;s Privacy</h2>
          <p>Our services are available to patients of all ages. For patients under 18, a parent or legal guardian must provide consent and manage the account on their behalf.</p>

          <h2>10. Your Rights</h2>
          <ul>
            <li><strong>Access:</strong> Request a copy of all data we hold about you</li>
            <li><strong>Correction:</strong> Request correction of any inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal retention requirements for medical records)</li>
            <li><strong>Portability:</strong> Request your data in a machine-readable format</li>
            <li><strong>Opt-out:</strong> Unsubscribe from non-essential communications at any time</li>
          </ul>

          <h2>11. Kidney Sale/Purchase — No Data for Illegal Purposes</h2>
          <div className="bg-red-50 border-l-4 border-red-500 p-6 my-6 rounded-r-lg">
            <p className="font-bold text-red-800">Strict Prohibition</p>
            <p className="text-red-700 mt-2">We do not collect, store, or process any data related to the commercial sale, purchase, or trafficking of human organs. Any such use of our platform is strictly prohibited and will be reported to law enforcement authorities immediately.</p>
            <p className="text-red-700 mt-2">Kidney transplantation is facilitated only through legally authorized transplant centres under the Transplantation of Human Organs and Tissues Act (THOTA), 1994.</p>
          </div>

          <h2>12. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date. Continued use of our services after changes constitutes acceptance of the updated policy.</p>

          <h2>13. Contact Us</h2>
          <p>For any privacy-related questions or requests, contact us:</p>
          <ul>
            <li>Email: <a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a></li>
            <li>WhatsApp: <a href="https://wa.me/919818235613" target="_blank" rel="noopener noreferrer">+91 98182 35613</a></li>
            <li>Address: 13B, Saket Rd, Block K, Saket, New Delhi 110017, India</li>
          </ul>

        </div>
      </section>

      <Footer />
    </>
  );
}
