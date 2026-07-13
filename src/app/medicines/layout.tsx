import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/constants';

const ogImage = {
  url: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
  width: 1200,
  height: 630,
  alt: 'Kidney Medicines and Treatment Guide - Dr Rajesh Goel',
};

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
    url: `${SITE_CONFIG.url}/medicines`,
    siteName: SITE_CONFIG.name,
    type: 'website',
    locale: 'en_IN',
    images: [ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kidney Medicines & Treatment Guide | Dr Rajesh Goel',
    description:
      'Complete guide to commonly prescribed medicines for kidney and dialysis patients with dosage, frequency, and precautions.',
    images: [ogImage.url],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/medicines`,
  },
};

export default function MedicinesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
