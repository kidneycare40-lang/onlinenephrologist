import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Patient Login | Online Nephrologist — Dr Rajesh Goel',
  description: 'Sign in to your patient account at Online Nephrologist. Access your appointments, medical records, and consultation history with Dr Rajesh Goel.',
  keywords: ['patient login', 'nephrologist login', 'kidney doctor login', 'Dr Rajesh Goel login', 'patient portal kidney care', 'online nephrology login'],
  openGraph: {
    title: 'Patient Login | Online Nephrologist — Dr Rajesh Goel',
    description: 'Sign in to your patient account. Access appointments, medical records, and consultation history.',
    url: 'https://onlinenephrologist.com/patient/login',
    siteName: 'Online Nephrologist',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Patient Login | Online Nephrologist',
    description: 'Sign in to access your appointments and medical records.',
  },
  alternates: {
    canonical: 'https://onlinenephrologist.com/patient/login',
  },
  robots: { index: true, follow: true },
};

export default function PatientLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
