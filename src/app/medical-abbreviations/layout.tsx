import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OD, BD, SOS & Medical Abbreviations Explained | Dr Rajesh Goel',
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
    title: 'OD, BD, SOS & Medical Abbreviations Explained | Dr Rajesh Goel',
    description:
      'What do OD, BD, TDS, SOS, HS, AC, PC mean on your prescription? Complete guide to medical abbreviations.',
    url: 'https://www.onlinenephrologist.com/medical-abbreviations',
    siteName: 'Online Nephrologist',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OD, BD, SOS & Medical Abbreviations Explained | Dr Rajesh Goel',
    description:
      'What do OD, BD, TDS, SOS, HS, AC, PC mean on your prescription? Complete guide to medical abbreviations.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://www.onlinenephrologist.com/medical-abbreviations',
  },
};

export default function MedicalAbbreviationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
