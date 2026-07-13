import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'WhatsApp Channel | Kidney Health Updates | Dr Rajesh Goel',
  description: 'Join Dr Rajesh Goel WhatsApp channel for kidney health tips, CKD management advice, dialysis guidance, and nephrology updates. Free educational content.',
  keywords: ['kidney health WhatsApp', 'nephrologist WhatsApp channel', 'kidney disease updates', 'CKD tips WhatsApp', 'Dr Rajesh Goel channel'],
  alternates: { canonical: `${SITE_CONFIG.url}/whatsapp-channel` },
  openGraph: {
    title: 'WhatsApp Channel | Kidney Health Updates | Dr Rajesh Goel',
    description: 'Join Dr Rajesh Goel WhatsApp channel for kidney health tips, CKD management advice, dialysis guidance, and nephrology updates. Free educational content.',
    url: `${SITE_CONFIG.url}/whatsapp-channel`,
    siteName: SITE_CONFIG.name,
    type: 'website',
    locale: 'en_IN',
    images: [{ url: `${SITE_CONFIG.url}/images/dr-rajesh-goel.jpg`, width: 1200, height: 630, alt: 'Dr Rajesh Goel - WhatsApp Channel' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WhatsApp Channel | Kidney Health Updates | Dr Rajesh Goel',
    description: 'Join Dr Rajesh Goel WhatsApp channel for kidney health tips, CKD management advice, dialysis guidance, and nephrology updates. Free educational content.',
    images: [`${SITE_CONFIG.url}/images/dr-rajesh-goel.jpg`],
  },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
