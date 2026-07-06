import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Book Online Kidney Consultation | Video Call | Dr Goel',
  description: 'Book online video consultation with Dr Rajesh Goel, Senior Nephrologist in Delhi. Get expert kidney care from home for CKD, dialysis, kidney stones, and transplant. ₹500.',
  keywords: ['online kidney consultation', 'nephrologist video call', 'kidney doctor online', 'online nephrologist Delhi', 'video consultation kidney', 'CKD online consultation', 'Dr Rajesh Goel online'],
  alternates: { canonical: `${SITE_CONFIG.url}/book-online-consultation` },
  openGraph: {
    title: 'Book Online Kidney Consultation | Video Call | Dr Goel',
    description: 'Book online video consultation with Dr Rajesh Goel, Senior Nephrologist in Delhi. Get expert kidney care from home for CKD, dialysis, kidney stones, and transplant. ₹500.',
    url: `${SITE_CONFIG.url}/book-online-consultation`,
    siteName: SITE_CONFIG.name,
    type: 'website',
    locale: 'en_US',
    images: [{ url: `${SITE_CONFIG.url}/images/dr-rajesh-goel.jpg`, width: 1200, height: 630, alt: 'Dr Rajesh Goel - Online Kidney Consultation' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book Online Kidney Consultation | Video Call | Dr Goel',
    description: 'Book online video consultation with Dr Rajesh Goel, Senior Nephrologist in Delhi. Get expert kidney care from home for CKD, dialysis, kidney stones, and transplant. ₹500.',
    images: [`${SITE_CONFIG.url}/images/dr-rajesh-goel.jpg`],
  },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
