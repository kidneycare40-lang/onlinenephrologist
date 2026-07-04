import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Book Nephrologist Appointment Delhi | Dr Goel',
  description: 'Book appointment with Dr Rajesh Goel, best nephrologist in Delhi. Online video consultation and in-clinic visits at PSRI Hospital, Saket, Faridabad. Call +91 9818235613.',
  keywords: ['book nephrologist appointment', 'kidney specialist Delhi', 'nephrologist near me', 'kidney doctor appointment', 'Dr Rajesh Goel appointment', 'best nephrologist Delhi', 'kidney specialist PSRI'],
  alternates: { canonical: `${SITE_CONFIG.url}/book-appointment` },
  openGraph: {
    title: 'Book Nephrologist Appointment Delhi | Dr Goel',
    description: 'Book appointment with Dr Rajesh Goel, best nephrologist in Delhi. Online video consultation and in-clinic visits at PSRI Hospital, Saket, Faridabad. Call +91 9818235613.',
    url: `${SITE_CONFIG.url}/book-appointment`,
    siteName: SITE_CONFIG.name,
    type: 'website',
    locale: 'en_US',
    images: [{ url: `${SITE_CONFIG.url}/images/dr-rajesh-goel.jpg`, width: 1200, height: 630, alt: 'Dr Rajesh Goel - Book Kidney Specialist Appointment' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book Kidney Specialist Appointment | Nephrologist Delhi | Dr Rajesh Goel',
    description: 'Book appointment with Dr Rajesh Goel, best nephrologist in Delhi. Online video consultation and in-clinic visits at PSRI Hospital, Saket, Faridabad. Call +91 9818235613.',
    images: [`${SITE_CONFIG.url}/images/dr-rajesh-goel.jpg`],
  },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
