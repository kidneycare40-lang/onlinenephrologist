import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Patient Dashboard | Online Nephrologist — Dr Rajesh Goel',
  description: 'View your upcoming and past appointments, manage bookings, and track your kidney health consultations with Dr Rajesh Goel.',
  keywords: ['patient dashboard', 'nephrologist dashboard', 'kidney care appointments', 'Dr Rajesh Goel dashboard', 'patient portal', 'consultation history'],
  openGraph: {
    title: 'Patient Dashboard | Online Nephrologist — Dr Rajesh Goel',
    description: 'Manage your appointments and track kidney health consultations.',
    url: 'https://onlinenephrologist.com/patient/dashboard',
    siteName: 'Online Nephrologist',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Patient Dashboard | Online Nephrologist',
    description: 'Manage your appointments and track consultations.',
  },
  alternates: {
    canonical: 'https://onlinenephrologist.com/patient/dashboard',
  },
  robots: { index: false, follow: false },
};

export default function PatientDashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
