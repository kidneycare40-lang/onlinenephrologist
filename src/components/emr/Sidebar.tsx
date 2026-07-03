'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Calendar, Stethoscope,
  Activity, FlaskConical, Receipt, Bot, Video, Settings, LogOut,
  ChevronLeft, ChevronRight,
  ClipboardList, Clock, Pill, TrendingUp, UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClinic } from '@/lib/emr-clinic-context';

export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const sidebarSections = [
  {
    label: 'MAIN',
    items: [
      { label: 'Dashboard', href: '/emr/dashboard', icon: LayoutDashboard },
      { label: 'Appointments', href: '/emr/appointments', icon: Calendar },
      { label: 'Waiting Room', href: '/emr/waiting-room', icon: Clock },
      { label: 'Consultation', href: '/emr/consultation', icon: Stethoscope },
    ],
  },
  {
    label: 'CLINICAL',
    items: [
      { label: 'Patients', href: '/emr/patients', icon: Users },
      { label: 'Prescriptions', href: '/emr/prescriptions', icon: ClipboardList },
      { label: 'EMR Timeline', href: '/emr/timeline', icon: Activity },
      { label: 'Lab', href: '/emr/lab', icon: FlaskConical },
    ],
  },
  {
    label: 'BUSINESS',
    items: [
      { label: 'Billing', href: '/emr/billing', icon: Receipt },
      { label: 'Pharmacy', href: '/emr/pharmacy', icon: Pill },
    ],
  },
  {
    label: 'COMMUNICATION',
    items: [
      { label: 'Telemedicine', href: '/emr/telemedicine', icon: Video },
      { label: 'AI Assistant', href: '/emr/ai', icon: Bot },
    ],
  },
  {
    label: 'ADMIN',
    items: [
      { label: 'Doctors', href: '/emr/doctors', icon: UserCog },
      { label: 'Reports', href: '/emr/reports', icon: TrendingUp },
      { label: 'Settings', href: '/emr/settings', icon: Settings },
    ],
  },
];

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const { clinic } = useClinic();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 border-b border-gray-800 shrink-0',
        collapsed ? 'justify-center px-2' : 'px-5 gap-3'
      )}>
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
          <img src="/favicon.png" alt="KCC" className="h-7 w-7 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white leading-tight truncate">Kidney Care</p>
            <p className="text-[10px] text-gray-400 leading-tight">EMR System</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-transparent">
        {sidebarSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group relative flex items-center rounded-lg text-sm font-medium transition-all duration-200',
                      collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
                      isActive
                        ? 'bg-primary-600/15 text-primary-400'
                        : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary-500 rounded-r-full" />
                    )}
                    <item.icon className={cn('h-[18px] w-[18px] shrink-0', isActive && 'text-primary-400')} />
                    {!collapsed && <span className="truncate">{item.label}</span>}

                    {/* Tooltip for collapsed mode */}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50 pointer-events-none border border-gray-700">
                        {item.label}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800" />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-gray-800 space-y-1">
        {clinic && !collapsed && (
          <div
            className="px-3 py-2 mb-1 rounded-lg"
            style={{ backgroundColor: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#facc15' }}>Current Clinic</p>
            <p className="text-xs font-bold truncate" style={{ color: '#fde047' }}>{clinic.name}</p>
          </div>
        )}
        <Link
          href="/emr/clinic-selection"
          className={cn(
            'flex items-center rounded-lg text-sm text-gray-400 hover:bg-gray-800/60 hover:text-gray-200 transition-colors',
            collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
          )}
        >
          <Activity className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Switch Clinic</span>}
        </Link>
        <Link
          href="/"
          className={cn(
            'flex items-center rounded-lg text-sm text-gray-400 hover:bg-gray-800/60 hover:text-gray-200 transition-colors',
            collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
          )}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Back to Website</span>}
          {collapsed && (
            <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50 pointer-events-none border border-gray-700">
              Back to Website
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { clinic } = useClinic();
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex lg:flex-col fixed inset-y-0 left-0 bg-gray-900 z-30 no-print',
          'transition-all duration-300 ease-in-out',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarContent collapsed={collapsed} />

        {/* Collapse toggle button */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 w-6 h-6 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors z-40"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </aside>
    </>
  );
}
