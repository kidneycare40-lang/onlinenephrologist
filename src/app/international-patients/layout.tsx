import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';

const ogImage = {
  url: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
  width: 1200,
  height: 630,
  alt: 'International Nephrology Consultation - Dr Rajesh Goel',
};

export const metadata: Metadata = {
  title: 'International Patients | Online Kidney Consultation | Dr Goel',
  description: 'Online nephrology consultation for international patients from USA, UK, UAE, Saudi Arabia, Australia, and worldwide. Expert kidney care by Dr Rajesh Goel with video consultations in multiple languages.',
  keywords: [
    'international nephrologist', 'nephrology consultation abroad', 'kidney specialist overseas',
    'online kidney doctor international', 'nephrologist for NRI', 'kidney consultation USA UK UAE',
    'Indian nephrologist online', 'kidney doctor global', 'telehealth nephrology',
    'kidney transplant consultation international', 'CKD specialist online worldwide',
    'nephrology second opinion international', 'kidney specialist Dubai Abu Dhabi',
    'nephrologist Saudi Arabia', 'kidney doctor London', 'nephrologist New York',
    'online dialysis consultation', 'kidney disease telemedicine',
  ],
  openGraph: {
    title: 'International Nephrology Consultation — Dr Rajesh Goel',
    description: 'Expert kidney care for patients worldwide. Online video consultation with Dr Rajesh Goel, Senior Nephrologist & Kidney Transplant Physician.',
    url: `${SITE_CONFIG.url}/international-patients`,
    siteName: SITE_CONFIG.name,
    type: 'website',
    locale: 'en_IN',
    images: [ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'International Nephrology Consultation — Dr Rajesh Goel',
    description: 'Expert kidney care for patients worldwide via video consultation.',
    images: [ogImage.url],
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/international-patients`,
  },
  robots: { index: true, follow: true },
};

export default function InternationalPatientsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
