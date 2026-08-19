'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Receipt,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/emr-auth-context';
import { useEMRUnreadCount } from '@/hooks/useEMRUnreadCount';

const NAV_ITEMS = [
  { href: '/emr/dashboard', icon: LayoutDashboard, label: 'Home', permission: 'dashboard' as const },
  { href: '/emr/appointments', icon: Calendar, label: 'Appts', permission: 'appointments' as const },
  { href: '/emr/patients', icon: Users, label: 'Patients', permission: 'patients' as const },
  { href: '/emr/messages', icon: MessageSquare, label: 'Messages', permission: 'patients' as const },
  { href: '/emr/consultation', icon: FileText, label: 'Rx', permission: 'consultations' as const },
  { href: '/emr/billing', icon: Receipt, label: 'Billing', permission: 'billing' as const },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { can } = useAuth();
  const unreadCount = useEMRUnreadCount();

  const filteredItems = NAV_ITEMS.filter((item) => can(item.permission as any, 'view'));

  const isActive = (href: string) => {
    if (href === '/emr/dashboard') return pathname === '/emr/dashboard' || pathname === '/emr';
    return pathname.startsWith(href);
  };

  if (pathname.startsWith('/emr/consultation/')) return null;

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-gray-200 safe-area-bottom"
      style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {filteredItems.map((item) => {
          const active = isActive(item.href);
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors min-h-[48px]',
                active ? 'text-[#0A75BB]' : 'text-gray-400 active:text-gray-600'
              )}
            >
              <item.icon className={cn('h-6 w-6', active && 'stroke-[2.5]')} />
              {item.href === '/emr/messages' && unreadCount > 0 && (
                <span className="absolute top-1 right-1/4 min-w-[16px] h-4 flex items-center justify-center px-1 text-[9px] font-bold bg-red-500 text-white rounded-full leading-none">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
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
