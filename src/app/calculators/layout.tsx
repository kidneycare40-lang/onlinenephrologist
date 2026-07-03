import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kidney Health Calculators | BMI, eGFR, Potassium & More | Dr Rajesh Goel',
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
    url: 'https://www.onlinenephrologist.com/calculators',
    siteName: 'Online Nephrologist',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kidney Health Calculators | Dr Rajesh Goel',
    description:
      'Free BMI, eGFR, potassium, creatinine, BSA and uACR calculators for kidney health assessment.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://www.onlinenephrologist.com/calculators',
  },
};

export default function CalculatorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
