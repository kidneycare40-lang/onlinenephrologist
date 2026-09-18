import type { Metadata } from 'next';
import DietCKDContent from './DietCKDContent';

export const metadata: Metadata = {
  title: 'Diet in CKD (Not on Dialysis) | Kidney Care Diet Guide',
  description:
    'Complete diet guide for Chronic Kidney Disease patients not on dialysis. Learn what to eat, what to avoid, and follow a sample one-day diet plan. Expert advice by Dr. Rajesh Goel.',
  keywords: [
    'ckd diet', 'kidney disease diet', 'chronic kidney disease diet plan',
    'diet for ckd not on dialysis', 'kidney diet chart', 'renal diet',
    'ckd food restrictions', 'kidney friendly foods', 'low potassium diet kidney',
    'low protein diet ckd', 'nephrologist diet advice',
  ],
  openGraph: {
    title: 'Diet in CKD (Not on Dialysis) — Complete Guide',
    description: 'Expert diet guide for CKD patients. What to eat, what to avoid, and sample meal plans.',
    url: 'https://www.onlinenephrologist.com/diet/ckd',
    type: 'website',
  },
};

export default function CKDDietPage() {
  return <DietCKDContent />;
}
