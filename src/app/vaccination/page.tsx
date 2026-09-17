import type { Metadata } from 'next';
import VaccinationContent from './VaccinationContent';

export const metadata: Metadata = {
  title: 'Vaccination Record for Kidney Patients | Online Nephrologist',
  description:
    'Complete vaccination record and schedule for chronic kidney disease patients. Download printable PDF with Hepatitis B, Influenza, Pneumococcal, Varicella Zoster vaccines and emergency medicines guide.',
  keywords: [
    'vaccination record kidney patient',
    'kidney disease vaccine schedule',
    'hepatitis B vaccine ckd',
    'pneumococcal vaccine kidney',
    'influenza vaccine dialysis',
    'nephrologist vaccination guide',
    'chronic kidney disease immunization',
  ],
  openGraph: {
    title: 'Vaccination Record for Kidney Patients',
    description: 'Complete vaccination schedule and downloadable PDF for CKD patients. Hepatitis B, Influenza, Pneumococcal vaccines + emergency medicines guide.',
    url: 'https://www.onlinenephrologist.com/vaccination',
    type: 'website',
  },
};

export default function VaccinationPage() {
  return <VaccinationContent />;
}
