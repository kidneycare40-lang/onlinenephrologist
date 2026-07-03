import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Kidney Health Videos | Nephrologist Delhi | Dr Rajesh Goel',
  description: 'Watch educational videos about kidney disease, CKD, dialysis, kidney transplant, and kidney health by Dr Rajesh Goel, Senior Nephrologist in Delhi.',
  keywords: ['kidney health videos', 'nephrologist videos', 'kidney disease education', 'CKD videos', 'dialysis explained', 'kidney transplant video', 'Dr Rajesh Goel videos', 'kidney care Delhi'],
  alternates: { canonical: `${SITE_CONFIG.url}/videos` },
  openGraph: {
    title: 'Kidney Health Videos | Nephrologist Delhi | Dr Rajesh Goel',
    description: 'Watch educational videos about kidney disease, CKD, dialysis, kidney transplant, and kidney health by Dr Rajesh Goel, Senior Nephrologist in Delhi.',
    url: `${SITE_CONFIG.url}/videos`,
    siteName: SITE_CONFIG.name,
    type: 'website',
    locale: 'en_US',
    images: [{ url: `${SITE_CONFIG.url}/images/dr-rajesh-goel.png`, width: 1200, height: 630, alt: 'Dr Rajesh Goel - Kidney Health Videos' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kidney Health Videos | Nephrologist Delhi | Dr Rajesh Goel',
    description: 'Watch educational videos about kidney disease, CKD, dialysis, kidney transplant, and kidney health by Dr Rajesh Goel, Senior Nephrologist in Delhi.',
    images: [`${SITE_CONFIG.url}/images/dr-rajesh-goel.png`],
  },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
