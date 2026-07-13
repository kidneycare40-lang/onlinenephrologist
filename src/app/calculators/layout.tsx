import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';

const ogImage = {
  url: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
  width: 1200,
  height: 630,
  alt: 'Kidney Health Calculators - Dr Rajesh Goel',
};

export const metadata: Metadata = {
  title: 'Kidney Calculators: eGFR, BMI, Potassium | Dr Goel',
  description:
    'Free online kidney health calculators — BMI, eGFR (CKD-EPI 2021), potassium risk, creatinine clearance (Cockcroft-Gault), BSA, and uACR. For educational purposes only.',
  keywords: [
    'kidney calculator',
    'eGFR calculator',
    'BMI calculator',
    'potassium calculator',
    'creatinine clearance calculator',
    'uACR calculator',
    'BSA calculator',
    'kidney function test',
    'CKD calculator',
    'kidney health tool',
    'online nephrology calculator',
    'nephrologist calculator',
  ],
  openGraph: {
    title: 'Kidney Health Calculators | Dr Rajesh Goel',
    description:
      'Free BMI, eGFR, potassium, creatinine, BSA and uACR calculators for kidney health assessment.',
    url: `${SITE_CONFIG.url}/calculators`,
    siteName: SITE_CONFIG.name,
    type: 'website',
    locale: 'en_IN',
    images: [ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kidney Health Calculators | Dr Rajesh Goel',
    description:
      'Free BMI, eGFR, potassium, creatinine, BSA and uACR calculators for kidney health assessment.',
    images: [ogImage.url],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/calculators`,
  },
};

export default function CalculatorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
