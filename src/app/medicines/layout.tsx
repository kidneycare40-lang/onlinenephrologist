import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kidney Medicines & Treatment Guide | Dr Rajesh Goel',
  description:
    'Complete guide to commonly prescribed medicines for kidney and dialysis patients. Includes dosage, frequency, warnings, and precautions. Always consult your nephrologist.',
  keywords: [
    'kidney medicines',
    'dialysis medicines',
    'nephrology treatment guide',
    'kidney patient medications',
    'phosphate binders',
    'erythropoietin',
    'kidney diet medicines',
    'potassium binder',
    'iron therapy kidney',
    'blood pressure kidney',
    'febuxostat',
    'sevelamer',
    'telma amlodipine',
    'dr rajesh goel medicines',
    'online nephrologist medicines',
    'kidney infection treatment',
    'nephrotic syndrome medicines',
    'dialysis catheter infection',
    'kidney acidosis treatment',
    'phosphate binder sevelamer',
  ],
  openGraph: {
    title: 'Kidney Medicines & Treatment Guide | Dr Rajesh Goel',
    description:
      'Complete guide to commonly prescribed medicines for kidney and dialysis patients with dosage, frequency, and precautions.',
    url: 'https://www.onlinenephrologist.com/medicines',
    siteName: 'Online Nephrologist',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kidney Medicines & Treatment Guide | Dr Rajesh Goel',
    description:
      'Complete guide to commonly prescribed medicines for kidney and dialysis patients with dosage, frequency, and precautions.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://www.onlinenephrologist.com/medicines',
  },
};

export default function MedicinesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
