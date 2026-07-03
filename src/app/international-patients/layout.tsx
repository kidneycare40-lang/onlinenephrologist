import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'International Patients — Online Nephrology Consultation | Dr Rajesh Goel',
  description: 'Online nephrology consultation for international patients from USA, UK, UAE, Saudi Arabia, Australia, and worldwide. Expert kidney care by Dr Rajesh Goel with video consultations in multiple languages.',
  keywords: [
    'international nephrologist', 'nephrology consultation abroad', 'kidney specialist overseas',
    'online kidney doctor international', 'nephrologist for NRI', 'kidney consultation USA UK UAE',
    'Indian nephrologist online', 'kidney doctor global', 'telehealth nephrology',
    'kidney transplant consultation international', 'CKD specialist online worldwide',
    'nephrology second opinion international', 'kidney specialist Dubai Abu Dhabi',
    'nephrologist Saudi Arabia', 'kidney doctor London', 'nephrologist New York',
    'online dialysis consultation', 'kidney disease telemedicine',
  ],
  openGraph: {
    title: 'International Nephrology Consultation — Dr Rajesh Goel',
    description: 'Expert kidney care for patients worldwide. Online video consultation with Dr Rajesh Goel, Senior Nephrologist & Kidney Transplant Physician.',
    url: 'https://onlinenephrologist.com/international-patients',
    siteName: 'Online Nephrologist',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'International Nephrology Consultation — Dr Rajesh Goel',
    description: 'Expert kidney care for patients worldwide via video consultation.',
  },
  alternates: {
    canonical: 'https://onlinenephrologist.com/international-patients',
  },
  robots: { index: true, follow: true },
};

export default function InternationalPatientsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
