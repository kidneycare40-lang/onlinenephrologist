import type { Metadata } from 'next';
import DietDialysisContent from './DietDialysisContent';

export const metadata: Metadata = {
  title: 'Diet for CKD on Dialysis | Kidney Care Diet Guide',
  description: 'Complete diet guide for dialysis patients. Higher protein needs, potassium and phosphorus restrictions. Expert advice by Dr. Rajesh Goel.',
  keywords: ['dialysis diet', 'kidney dialysis diet plan', 'food for dialysis patients', 'renal diet dialysis', 'dietitian for dialysis'],
};

export default function DialysisDietPage() {
  return <DietDialysisContent />;
}
