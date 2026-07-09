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
              <img src="/favicon.png" alt="Online Nephrologist" className="h-8 w-8" />
              <span className="text-white font-bold text-sm">Online Nephrologist</span>
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              Expert kidney care by Dr Rajesh Goel. Online and in-clinic consultations for all kidney conditions.
            </p>
            <div className="space-y-2 text-sm">
              <a href="https://wa.me/919818235613" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors py-1.5">
                <Phone className="h-3.5 w-3.5" /> +91 9818235613
              </a>
              <a href={`mailto:${SITE_CONFIG.email}`} className="flex items-center gap-2 hover:text-white transition-colors py-1.5">
                <Mail className="h-3.5 w-3.5" /> {SITE_CONFIG.email}
              </a>
              <div className="flex items-center gap-2 py-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>13B, Saket Rd, Block K, Saket, New Delhi 110017</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Services</h4>
            <ul className="space-y-1">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors inline-block py-1.5">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Doctor */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Doctor</h4>
            <ul className="space-y-1">
              {footerLinks.doctor.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors inline-block py-1.5">{link.label}</Link>
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
            <div className="flex items-center gap-3 mt-5">
              <a href="https://www.youtube.com/kidneycarecentre" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all" aria-label="YouTube">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="https://x.com/kidney_centre" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all" aria-label="X (Twitter)">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://www.linkedin.com/in/kidney-care-8b2633190/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all" aria-label="LinkedIn">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://www.instagram.com/kidneycarecentre/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all" aria-label="Instagram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 safe-area-bottom">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Online Nephrologist. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-white transition-colors py-1.5">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors py-1.5">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
