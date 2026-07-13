import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/layout/Providers';
import { KidneyDisclaimer } from '@/components/layout/KidneyDisclaimer';
import { SITE_CONFIG } from '@/lib/constants';
import { WebSiteSchema } from '@/components/seo/JsonLd';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#111827',
};

const ogImage = {
  url: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
  width: 1200,
  height: 630,
  alt: 'Online Nephrologist - Dr Rajesh Goel',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.title,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: ['nephrologist', 'kidney doctor', 'online consultation', 'CKD', 'kidney specialist', 'Delhi', 'dialysis', 'kidney transplant', 'kidney stones', 'online nephrologist', 'kidney care'],
  authors: [{ name: SITE_CONFIG.author }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [ogImage.url],
    creator: '@kidneycarecentre',
    site: '@kidneycarecentre',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_CONFIG.url,
    languages: {
      'en': SITE_CONFIG.url,
      'en-IN': SITE_CONFIG.url,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="preload" href="/images/dr-rajesh-goel.jpg" as="image" />
        <link rel="preload" href="/images/kidney_logo.png" as="image" />
        <WebSiteSchema />
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        <Providers>
          <KidneyDisclaimer />
          {children}
        </Providers>
      </body>
    </html>
  );
}
