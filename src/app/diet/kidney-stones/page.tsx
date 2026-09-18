import type { Metadata } from 'next';
import DietKidneyStonesContent from './DietKidneyStonesContent';

export const metadata: Metadata = {
  title: 'Diet for Kidney Stones | Kidney Care Diet Guide',
  description: 'Prevent and manage kidney stones with the right diet. Learn which foods to eat and avoid. Expert advice by Dr. Rajesh Goel.',
  keywords: ['kidney stones diet', 'kidney stone prevention diet', 'oxalate diet kidney stones', 'renal stone diet', 'nephrologist kidney stones'],
};

export default function KidneyStonesDietPage() {
  return <DietKidneyStonesContent />;
}
