import type { Metadata } from 'next';
import DietDiabeticCKDContent from './DietDiabeticCKDContent';

export const metadata: Metadata = {
  title: 'Diet for Diabetic Kidney Disease | Kidney Care Diet Guide',
  description: 'Complete diet guide for patients with both diabetes and kidney disease. Blood sugar and kidney protection together. Expert advice by Dr. Rajesh Goel.',
  keywords: ['diabetic kidney disease diet', 'diabetes kidney diet', 'DKD diet plan', 'diet for diabetic nephropathy', 'blood sugar kidney diet'],
};

export default function DiabeticCKDDietPage() {
  return <DietDiabeticCKDContent />;
}
