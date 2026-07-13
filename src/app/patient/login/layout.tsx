import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';

const ogImage = {
  url: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
  width: 1200,
  height: 630,
  alt: 'Patient Login - Online Nephrologist',
};

export const metadata: Metadata = {
  title: 'Patient Login | Online Nephrologist — Dr Rajesh Goel',
  description: 'Sign in to your patient account at Online Nephrologist. Access your appointments, medical records, and consultation history with Dr Rajesh Goel.',
  keywords: ['patient login', 'nephrologist login', 'kidney doctor login', 'Dr Rajesh Goel login', 'patient portal kidney care', 'online nephrology login'],
  openGraph: {
    title: 'Patient Login | Online Nephrologist — Dr Rajesh Goel',
    description: 'Sign in to your patient account. Access appointments, medical records, and consultation history.',
    url: `${SITE_CONFIG.url}/patient/login`,
    siteName: SITE_CONFIG.name,
    type: 'website',
    locale: 'en_IN',
    images: [ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Patient Login | Online Nephrologist',
    description: 'Sign in to access your appointments and medical records.',
    images: [ogImage.url],
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/patient/login`,
  },
  robots: { index: true, follow: true },
};

export default function PatientLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
