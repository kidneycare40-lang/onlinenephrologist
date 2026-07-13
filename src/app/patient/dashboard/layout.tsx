import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';

const ogImage = {
  url: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
  width: 1200,
  height: 630,
  alt: 'Patient Dashboard - Online Nephrologist',
};

export const metadata: Metadata = {
  title: 'Patient Dashboard | Online Nephrologist — Dr Rajesh Goel',
  description: 'View your upcoming and past appointments, manage bookings, and track your kidney health consultations with Dr Rajesh Goel.',
  keywords: ['patient dashboard', 'nephrologist dashboard', 'kidney care appointments', 'Dr Rajesh Goel dashboard', 'patient portal', 'consultation history'],
  openGraph: {
    title: 'Patient Dashboard | Online Nephrologist — Dr Rajesh Goel',
    description: 'Manage your appointments and track kidney health consultations.',
    url: `${SITE_CONFIG.url}/patient/dashboard`,
    siteName: SITE_CONFIG.name,
    type: 'website',
    locale: 'en_IN',
    images: [ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Patient Dashboard | Online Nephrologist',
    description: 'Manage your appointments and track consultations.',
    images: [ogImage.url],
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/patient/dashboard`,
  },
  robots: { index: false, follow: false },
};

export default function PatientDashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
