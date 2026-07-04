'use client';

import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';
import { Phone, Mail, MapPin } from 'lucide-react';

const footerLinks = {
  services: [
    { label: 'Online Consultation', href: '/book-appointment?type=online' },
    { label: 'In-Clinic Visit', href: '/book-appointment?type=offline' },
    { label: 'Kidney Conditions', href: '/conditions' },
    { label: 'Kidney Tests', href: '/tests-for-kidney-disease' },
    { label: 'Medical Tourism', href: '/medical-tourism' },
    { label: 'International Patients', href: '/international-patients' },
    { label: 'Medicines & Treatment Guide', href: '/medicines' },
    { label: 'Medical Abbreviations', href: '/medical-abbreviations' },
    { label: 'Health Calculators', href: '/calculators' },
  ],
  doctor: [
    { label: 'Dr Rajesh Goel', href: '/dr-rajesh-goel' },
    { label: 'Book Appointment', href: '/book-appointment' },
    { label: 'Videos', href: '/videos' },
    { label: 'EMR Login', href: '/emr/login' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <img src="/favicon.png" alt="Online Nephrologist" className="h-8 w-8" width="32" height="32" />
              <span className="text-white font-bold text-sm">Online Nephrologist</span>
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              Expert kidney care by Dr Rajesh Goel. Online and in-clinic consultations for all kidney conditions.
            </p>
            <div className="space-y-2 text-sm">
              <a href="https://wa.me/919818235613" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="h-3.5 w-3.5" /> +91 9818235613
              </a>
              <a href={`mailto:${SITE_CONFIG.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="h-3.5 w-3.5" /> {SITE_CONFIG.email}
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>13B, Saket Rd, Block K, Saket, New Delhi 110017</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Services</h4>
            <ul className="space-y-2.5">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Doctor */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Doctor</h4>
            <ul className="space-y-2.5">
              {footerLinks.doctor.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Clinic Hours */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Clinic Hours</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-white font-medium">Old Faridabad</span>
                <br />Mon–Sat, 9:00 – 10:30 AM
              </li>
              <li>
                <span className="text-white font-medium">PSRI Hospital</span>
                <br />Mon–Sat, 1:00 – 7:00 PM
              </li>
              <li>
                <span className="text-white font-medium">Saket</span>
                <br />Mon–Sun, 9:00 – 11:00 PM
              </li>
              <li>
                <span className="text-white font-medium">Online Consultation</span>
                <br />Mon–Sun, 7:00 AM – 11:00 PM
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Online Nephrologist. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
