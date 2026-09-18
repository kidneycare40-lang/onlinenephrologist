import type { Metadata } from 'next';
import DietTransplantContent from './DietTransplantContent';

export const metadata: Metadata = {
  title: 'Diet After Kidney Transplant | Kidney Care Diet Guide',
  description: 'Complete diet guide for kidney transplant patients. Nutrition for post-transplant recovery and long-term kidney health. Expert advice by Dr. Rajesh Goel.',
  keywords: ['kidney transplant diet', 'post transplant diet', 'transplant nutrition', 'anti rejection diet', 'nephrologist transplant diet'],
};

export default function TransplantDietPage() {
  return <DietTransplantContent />;
}
