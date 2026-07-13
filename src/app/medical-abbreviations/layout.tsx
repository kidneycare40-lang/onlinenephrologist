import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';

const ogImage = {
  url: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
  width: 1200,
  height: 630,
  alt: 'Medical Abbreviations OD, BD, SOS Explained - Dr Rajesh Goel',
};

export const metadata: Metadata = {
  title: 'Medical Abbreviations: OD, BD, SOS Explained | Dr Goel',
  description:
    'What do OD, BD, TDS, SOS, HS, AC, PC mean on your prescription? Complete guide to medical abbreviations used in prescriptions for kidney patients.',
  keywords: [
    'OD meaning medical',
    'BD meaning medical',
    'SOS meaning medical',
    'TDS meaning medical',
    'HS meaning medical',
    'medical abbreviations prescription',
    'prescription abbreviations list',
    'OD BD TDS SOS HS meaning',
    'kidney patient prescription guide',
    'how to read prescription',
    'medical terms for patients',
    'AC PC medical meaning',
    'IV SC IM injection meaning',
    'nephrology prescription abbreviations',
    'dr rajesh goel prescription',
    'online nephrologist prescription',
    'dosage frequency abbreviations',
    'medicine timing abbreviations',
    'drug dose abbreviations',
    'what does OD mean in medicine',
  ],
  openGraph: {
    title: 'Medical Abbreviations: OD, BD, SOS Explained | Dr Goel',
    description:
      'What do OD, BD, TDS, SOS, HS, AC, PC mean on your prescription? Complete guide to medical abbreviations.',
    url: `${SITE_CONFIG.url}/medical-abbreviations`,
    siteName: SITE_CONFIG.name,
    type: 'website',
    locale: 'en_IN',
    images: [ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Medical Abbreviations: OD, BD, SOS Explained | Dr Goel',
    description:
      'What do OD, BD, TDS, SOS, HS, AC, PC mean on your prescription? Complete guide to medical abbreviations.',
    images: [ogImage.url],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/medical-abbreviations`,
  },
};

export default function MedicalAbbreviationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
