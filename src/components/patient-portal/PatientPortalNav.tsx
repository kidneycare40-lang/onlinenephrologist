'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Calendar, FileText, ClipboardList,
  Receipt, User, LogOut, Stethoscope, MessageSquare,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/patient/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/patient/appointments', label: 'Appointments', icon: Calendar },
  { href: '/patient/messages', label: 'Messages', icon: MessageSquare },
  { href: '/patient/consultations', label: 'Consultations', icon: Stethoscope },
  { href: '/patient/prescriptions', label: 'Prescriptions', icon: ClipboardList },
  { href: '/patient/reports', label: 'Reports', icon: FileText },
  { href: '/patient/billing', label: 'Billing', icon: Receipt },
  { href: '/patient/profile', label: 'Profile', icon: User },
];

export function PatientPortalNav() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/patient-auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/patient/dashboard" className="font-bold text-[#0A75BB] text-lg">
            KCC Patient Portal
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    active
                      ? 'bg-[#0A75BB] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 text-xs font-medium rounded-lg hover:bg-gray-100 transition-all"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export function PatientPortalMobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex items-center justify-around py-1">
        {NAV_ITEMS.slice(0, 5).map(item => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all min-w-0',
                active ? 'text-[#0A75BB]' : 'text-gray-400'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
