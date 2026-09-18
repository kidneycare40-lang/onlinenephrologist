import type { Metadata } from 'next';
import VaccinationContent from './VaccinationContent';

export const metadata: Metadata = {
  title: 'Vaccination for Kidney Patients: CKD, Dialysis & Transplant | Online Nephrologist',
  description:
    'Learn about important vaccines for kidney disease, CKD and dialysis patients, including hepatitis B, influenza, pneumococcal, COVID-19 and shingles vaccines, plus vaccination guidance before kidney transplant.',
  keywords: [
    'vaccination for kidney patients',
    'vaccines for ckd patients',
    'vaccination in chronic kidney disease',
    'vaccines for dialysis patients',
    'hepatitis b vaccine for dialysis patients',
    'pneumococcal vaccine kidney disease',
    'flu vaccine kidney patients',
    'vaccines before kidney transplant',
    'vaccination after kidney transplant',
    'kidney transplant vaccination',
    'covid vaccine kidney disease',
    'shingles vaccine kidney patients',
  ],
  openGraph: {
    title: 'Vaccination for Kidney Patients: CKD, Dialysis & Transplant',
    description: 'Essential vaccines for people with CKD, dialysis and kidney transplantation. Hepatitis B, Influenza, Pneumococcal, COVID-19, Shingles and more.',
    url: 'https://www.onlinenephrologist.com/vaccination',
    type: 'website',
  },
};

export default function VaccinationPage() {
  return <VaccinationContent />;
}
