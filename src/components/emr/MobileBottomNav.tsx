'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Settings,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/emr/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/emr/appointments', icon: Calendar, label: 'Appts' },
  { href: '/emr/patients', icon: Users, label: 'Patients' },
  { href: '/emr/consultation', icon: FileText, label: 'Rx' },
  { href: '/emr/settings', icon: Settings, label: 'More' },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/emr/dashboard') return pathname === '/emr/dashboard' || pathname === '/emr';
    return pathname.startsWith(href);
  };

  if (pathname.startsWith('/emr/consultation/')) return null;

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom"
      style={{ touchAction: 'manipulation' }}
    >
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors',
                active ? 'text-[#0A75BB]' : 'text-gray-400 active:text-gray-600'
              )}
            >
              <item.icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
              <span className={cn('text-[10px] leading-tight', active ? 'font-semibold' : 'font-medium')}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
