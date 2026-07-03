'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SITE_CONFIG } from '@/lib/constants';
import { ChevronDown, Menu, X, Phone } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Doctor', href: '/dr-rajesh-goel' },
  {
    label: 'Services',
    children: [
      { label: 'Kidney Conditions', href: '/conditions', desc: 'CKD, Dialysis, Transplant & more' },
      { label: 'Kidney Tests', href: '/tests-for-kidney-disease', desc: 'eGFR, Creatinine, Urine tests' },
      { label: 'Medical Tourism', href: '/medical-tourism', desc: 'International patient care' },
      { label: 'International Patients', href: '/international-patients', desc: 'Video consultation worldwide' },
      { label: 'Videos', href: '/videos', desc: 'Educational kidney health content' },
      { label: 'Calculators', href: '/calculators', desc: 'BMI, eGFR, Potassium & more' },
      { label: 'Medicines', href: '/medicines', desc: 'Treatment guide for kidney patients' },
      { label: 'Medical Terms', href: '/medical-abbreviations', desc: 'OD, BD, SOS & more explained' },
    ],
  },
  { label: 'EMR', href: '/emr/login' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
    setMobileDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-200 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/favicon.png" alt="Online Nephrologist" className="h-8 w-8 sm:h-9 sm:w-9" />
            <span className="text-sm sm:text-[15px] font-bold text-[#0A75BB] leading-tight">Online<br className="hidden lg:block" /> Nephrologist</span>
          </Link>

          {/* Right side — nav + CTA */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) =>
                item.children ? (
                  <div key={item.label} className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        dropdownOpen ? 'text-[#0A75BB] bg-blue-50' : 'text-gray-700 hover:text-[#0A75BB] hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute top-full right-0 mt-1 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block px-4 py-2.5 hover:bg-blue-50 transition-colors ${
                              isActive(child.href) ? 'bg-blue-50 text-[#0A75BB]' : 'text-gray-700'
                            }`}
                          >
                            <span className="text-sm font-medium block">{child.label}</span>
                            <span className="text-xs text-gray-400 block mt-0.5">{child.desc}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'text-[#0A75BB] bg-blue-50'
                        : 'text-gray-700 hover:text-[#0A75BB] hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>

            {/* Separator */}
            <div className="hidden lg:block w-px h-6 bg-gray-200 mx-1" />

            {/* Phone — desktop only */}
            <a
              href="https://wa.me/919818235613"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#0A75BB] transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">+91 9818235613</span>
            </a>

            {/* Book Appointment — desktop */}
            <Link
              href="/book-appointment"
              className="hidden sm:inline-flex px-4 py-2 bg-[#0A75BB] text-white text-sm font-semibold rounded-lg hover:bg-[#085a94] transition-colors shadow-sm"
            >
              Book Appointment
            </Link>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden relative z-50 p-2 -mr-1 text-gray-600 hover:text-[#0A75BB] min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu — full screen overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-14 sm:top-16 z-40 bg-white overflow-y-auto" ref={mobileMenuRef}>
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <button
                    onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-semibold text-gray-900 hover:bg-gray-50 min-h-[48px]"
                  >
                    {item.label}
                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${mobileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileDropdownOpen && (
                    <div className="pl-4 pb-1 space-y-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block px-4 py-3 rounded-lg text-sm font-medium min-h-[44px] flex items-center ${
                            isActive(child.href) ? 'text-[#0A75BB] bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-3.5 rounded-xl text-base font-semibold min-h-[48px] flex items-center ${
                    isActive(item.href) ? 'text-[#0A75BB] bg-blue-50' : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}

            {/* Mobile CTA */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <Link
                href="/book-appointment"
                className="block w-full text-center px-6 py-3.5 bg-[#0A75BB] text-white font-semibold rounded-xl hover:bg-[#085a94] transition-colors min-h-[48px] flex items-center justify-center"
              >
                Book Appointment
              </Link>
              <a
                href="https://wa.me/919818235613"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 text-gray-600 hover:text-[#0A75BB] min-h-[48px]"
              >
                <Phone className="h-4 w-4" /> +91 9818235613
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
