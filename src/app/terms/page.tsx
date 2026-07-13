import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';
import { BreadcrumbSchema } from '@/components/seo/JsonLd';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Online Nephrologist',
  description: 'Terms and conditions for using Online Nephrologist. Read our policies on medical consultation, booking, and kidney care services.',
  keywords: ['terms and conditions', 'kidney care terms', 'medical consultation terms', 'Online Nephrologist terms', 'kidney transplant terms India'],
  alternates: { canonical: `${SITE_CONFIG.url}/terms` },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Terms & Conditions | Online Nephrologist',
    description: 'Terms and conditions for using Online Nephrologist. Read our policies on medical consultation, booking, and kidney care services.',
    url: `${SITE_CONFIG.url}/terms`,
    siteName: SITE_CONFIG.name,
    type: 'website',
    locale: 'en_IN',
    images: [{ url: `${SITE_CONFIG.url}/images/dr-rajesh-goel.jpg`, width: 1200, height: 630, alt: 'Online Nephrologist Terms and Conditions' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms & Conditions | Online Nephrologist',
    description: 'Terms and conditions for using Online Nephrologist. Read our policies on medical consultation, booking, and kidney care services.',
    images: [`${SITE_CONFIG.url}/images/dr-rajesh-goel.jpg`],
  },
};

export default function TermsPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: SITE_CONFIG.url },
          { name: 'Terms & Conditions', url: `${SITE_CONFIG.url}/terms` },
        ]}
      />
      <Navbar />

      <section className="bg-gradient-to-br from-[#0A75BB] to-[#063d5c] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms & Conditions</h1>
          <p className="text-blue-100">Last updated: January 2025</p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate max-w-none">

          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using the Online Nephrologist website (onlinenephrologist.com) and associated services, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>

          <h2>2. Medical Services</h2>
          <p>Online Nephrologist provides medical consultation services through Dr Rajesh Goel, a registered nephrologist. Our services include:</p>
          <ul>
            <li>Online video/phone consultations for kidney-related conditions</li>
            <li>In-clinic consultations at authorized clinic locations</li>
            <li>Medical tourism facilitation for international patients</li>
            <li>Patient education and health information</li>
          </ul>
          <p><strong>Our services are for medical consultation, diagnosis, treatment, and patient education only.</strong></p>

          <h2>3. Kidney Donation & Transplant Disclaimer</h2>
          <div className="bg-red-50 border-l-4 border-red-500 p-6 my-6 rounded-r-lg">
            <p className="font-bold text-red-800 text-lg">IMPORTANT: Prohibition on Kidney Sale or Purchase</p>
            <p className="text-red-700">Online Nephrologist / Kidney Care Centre does <strong>not buy, sell, arrange, or facilitate</strong> kidney donations or organ transplants through this website, social media platforms, WhatsApp, phone calls, or any other communication channel.</p>
            <p className="text-red-700 mt-3">The <strong>commercial sale or purchase of human organs is illegal and punishable</strong> under the applicable laws of India, including the Transplantation of Human Organs and Tissues Act (THOTA), 1994, and its amendments.</p>
            <p className="text-red-700 mt-3">Kidney transplantation is performed only at authorized transplant centres and is subject to:</p>
            <ul className="text-red-700 mt-2">
              <li>Legal approval by the competent authorities</li>
              <li>Comprehensive medical evaluation of both donor and recipient</li>
              <li>Compliance with THOTA and its applicable rules</li>
            </ul>
            <p className="text-red-700 mt-3 font-medium">If you receive or make any request regarding the purchase or sale of a kidney through our name or channels, please treat it as unauthorized.</p>
          </div>

          <h2>4. Appointment Booking</h2>
          <ul>
            <li>Appointments are subject to availability</li>
            <li>Consultation fee: ₹1000 (domestic), ₹1500 / $20 USD (international patients)</li>
            <li>Cancellation must be done at least 24 hours before the appointment</li>
            <li>No-shows may result in forfeiture of consultation fee</li>
          </ul>

          <h2>5. Online Consultation</h2>
          <ul>
            <li>Online consultations are available Mon–Sun, 7:00 AM – 11:00 PM IST</li>
            <li>A stable internet connection is required for video consultations</li>
            <li>Online consultations are not suitable for medical emergencies</li>
            <li>Prescriptions issued online are valid as per Indian medical regulations</li>
          </ul>

          <h2>6. Medical Tourism</h2>
          <p>International patients seeking kidney transplant or specialized treatment in India should contact us through our official channels. We facilitate:</p>
          <ul>
            <li>Hospital and doctor referrals</li>
            <li>Visa assistance guidance</li>
            <li>Accommodation recommendations</li>
            <li>Translation services where available</li>
          </ul>
          <p>We do not guarantee visa approval or treatment outcomes.</p>

          <h2>7. User Responsibilities</h2>
          <ul>
            <li>Provide accurate medical history and information</li>
            <li>Follow prescribed treatment plans</li>
            <li>Do not share login credentials for the EMR system</li>
            <li>Do not use our services for any illegal purpose</li>
          </ul>

          <h2>8. Intellectual Property</h2>
          <p>All content on this website, including text, images, videos, logos, and graphics, is the property of Online Nephrologist / Kidney Care Centre and is protected by copyright laws. Reproduction without written permission is prohibited.</p>

          <h2>9. Limitation of Liability</h2>
          <p>While we strive to provide accurate medical information, we are not liable for any damages arising from the use of our website or services. Medical decisions should always be made in consultation with your treating physician.</p>

          <h2>10. Governing Law</h2>
          <p>These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in New Delhi, India.</p>

          <h2>11. Contact</h2>
          <p>For questions about these terms, contact us at:</p>
          <ul>
            <li>Email: <a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a></li>
            <li>WhatsApp: <a href="https://wa.me/919818235613" target="_blank" rel="noopener noreferrer">+91 98182 35613</a></li>
          </ul>

        </div>
      </section>

      <Footer />
    </>
  );
}
