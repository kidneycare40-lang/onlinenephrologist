'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, ChevronDown, User, LogOut, Building2, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TopBarProps {
  onMenuClick: () => void;
}

const organizations = [
  { id: '1', name: 'Kidney Care Centre', role: 'Admin' },
  { id: '2', name: 'KCC Dialysis Unit', role: 'Staff' },
];

export default function TopBar({ onMenuClick }: TopBarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [orgOpen, setOrgOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(organizations[0]);
  const searchRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const orgRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (orgRef.current && !orgRef.current.contains(e.target as Node)) {
        setOrgOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shrink-0 z-20">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Organization selector */}
        <div ref={orgRef} className="relative hidden sm:block">
          <button
            onClick={() => setOrgOpen(!orgOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
          >
            <Building2 className="h-4 w-4 text-gray-400" />
            <span className="font-medium truncate max-w-[180px]">{selectedOrg.name}</span>
            <ChevronDown className={cn('h-3.5 w-3.5 text-gray-400 transition-transform', orgOpen && 'rotate-180')} />
          </button>

          {orgOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
              <p className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Organization</p>
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => { setSelectedOrg(org); setOrgOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{org.name}</p>
                    <p className="text-xs text-gray-500">{org.role}</p>
                  </div>
                  {selectedOrg.id === org.id && <Check className="h-4 w-4 text-primary-600 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center - branding on large screens */}
      <div className="hidden lg:flex items-center gap-2 text-gray-400">
        <span className="text-xs">EMR v1.0</span>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1">
        {/* Search */}
        {searchOpen ? (
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200 transition-all">
            <Search className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients, prescriptions..."
              className="bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none w-48 lg:w-64"
            />
            <button
              onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>
        )}

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Profile dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 ml-1 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-700">
              RG
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900 leading-tight">Dr. Rajesh Goel</p>
              <p className="text-[11px] text-gray-500 leading-tight">Nephrologist</p>
            </div>
            <ChevronDown className={cn('hidden md:block h-3.5 w-3.5 text-gray-400 transition-transform', profileOpen && 'rotate-180')} />
          </button>

          {profileOpen && (
            <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-3 py-2.5 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">Dr. Rajesh Goel</p>
                <p className="text-xs text-gray-500">rajesh@kidneycarecentre.in</p>
              </div>
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <User className="h-4 w-4 text-gray-400" />
                My Profile
              </button>
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <Building2 className="h-4 w-4 text-gray-400" />
                Organization
              </button>
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
