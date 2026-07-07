'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search, Bell, Menu, X, UserPlus, LayoutDashboard, Calendar, Users,
  Stethoscope, Video, Receipt, TrendingUp, Settings, Sparkles, Grid3X3,
  ChevronDown, ChevronLeft, LogOut, Phone, MapPin, Hash, Building2, Check, AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClinic } from '@/lib/emr-clinic-context';
import { useAuth } from '@/lib/emr-auth-context';
import { patientsApi } from '@/lib/api-client';

const clinicOptions = [
  { id: 'kcc-faridabad', name: 'Kidney Care Centre - Faridabad', parent: 'Kidney Care Centre', address: 'Sector 15, Faridabad' },
  { id: 'kcc-saket', name: 'Kidney Care Centre - Saket', parent: 'Kidney Care Centre', address: 'Saket, New Delhi' },
  { id: 'psri-delhi', name: 'PSRI Hospital Delhi', parent: 'PSRI Hospital', address: 'Press Enclave Marg, Delhi' },
  { id: 'online', name: 'Online Consultation', parent: 'Online', address: 'Video / Phone' },
];

const navLinks = [
  { label: 'Dashboard', href: '/emr/dashboard', icon: LayoutDashboard },
  { label: 'Appointments', href: '/emr/appointments', icon: Calendar },
  { label: 'Patients', href: '/emr/patients', icon: Users },
  { label: 'Consultation', href: '/emr/consultation', icon: Stethoscope },
  { label: 'Telemedicine', href: '/emr/telemedicine', icon: Video },
  { label: 'Billing', href: '/emr/billing', icon: Receipt },
  { label: 'Kidney Charts', href: '/emr/kidney-charts', icon: TrendingUp },
  { label: 'Reports', href: '/emr/reports', icon: TrendingUp },
  { label: 'Settings', href: '/emr/settings', icon: Settings },
];

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { clinic, clinicId, setClinicId, clearClinic } = useClinic();
  const { user, logout, can } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [clinicSwitchOpen, setClinicSwitchOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; phone: string; uhid: string }[]>([]);

  const [showAddPatient, setShowAddPatient] = useState(false);
  const [patientPrefix, setPatientPrefix] = useState('Mr');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientGender, setPatientGender] = useState('MALE');
  const [patientAge, setPatientAge] = useState('');
  const [patientDob, setPatientDob] = useState('');
  const [patientLanguage, setPatientLanguage] = useState('English');
  const [patientCity, setPatientCity] = useState('');
  const [patientAddress, setPatientAddress] = useState('');
  const [patientPin, setPatientPin] = useState('');
  const [showMoreFields, setShowMoreFields] = useState(false);
  const [patientEmail, setPatientEmail] = useState('');
  const [patientBloodGroup, setPatientBloodGroup] = useState('');
  const [patientAllergies, setPatientAllergies] = useState('');
  const [patientHistory, setPatientHistory] = useState('');
  const [patientInsurance, setPatientInsurance] = useState('');
  const [patientAbha, setPatientAbha] = useState('');
  const [patientReferral, setPatientReferral] = useState('');
  const [patientUhid, setPatientUhid] = useState('');
  const [addingPatient, setAddingPatient] = useState(false);

  // Duplicate detection
  const [duplicatePatient, setDuplicatePatient] = useState<any>(null);

  // Auto UHID preview
  const autoUhid = useMemo(() => {
    const now = new Date();
    if (clinicId === 'online' || clinicId === 'online-intl') {
      return `ONLINE-${now.getFullYear()}/${String(Math.floor(Math.random() * 9000) + 1000)}`;
    }
    const prefix = clinicId === 'psri-delhi' ? 'PSRI' : 'KCC';
    return `${prefix}-${now.getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000).slice(0, 3)}`;
  }, [clinicId, showAddPatient]);

  // Detect duplicates as user types phone or name
  useEffect(() => {
    if (!showAddPatient) { setDuplicatePatient(null); return; }
    const query = (patientPhone || patientName).trim().toLowerCase();
    if (query.length < 3) { setDuplicatePatient(null); return; }

    const allStored: any[] = [];
    try { allStored.push(...JSON.parse(localStorage.getItem('emr_added_patients') || '[]')); } catch {}
    try {
      const bookings = JSON.parse(localStorage.getItem('emr_bookings') || '[]');
      if (Array.isArray(bookings)) {
        for (const b of bookings) {
          if (b.firstName) {
            const id = 'obp-' + b.bookingId;
            if (!allStored.some((p: any) => p.id === id)) {
              allStored.push({
                id, firstName: b.firstName, lastName: b.lastName || '',
                phone: b.phone || '', clinicId: b.clinicId || '',
                uhid: 'OB-' + b.bookingId.slice(-6).toUpperCase(), dateOfBirth: b.age ? `${new Date().getFullYear() - parseInt(b.age)}-01-01` : '',
                gender: b.gender || 'Male',
              });
            }
          }
        }
      }
    } catch {}
    // Also check mock patients
    try {
      const { patients: mockPatients } = require('@/lib/data/emr-mock');
      allStored.push(...mockPatients);
    } catch {}

    const match = allStored.find((p: any) => {
      const fullName = `${p.firstName || ''} ${p.lastName || ''}`.toLowerCase().trim();
      const phone = (p.phone || '').replace(/\D/g, '');
      const searchPhone = patientPhone.replace(/\D/g, '');
      return (patientPhone && searchPhone.length >= 5 && phone.includes(searchPhone)) ||
             (patientName && fullName.includes(query));
    });
    setDuplicatePatient(match || null);
  }, [patientPhone, patientName, showAddPatient, clinicId]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
        setClinicSwitchOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) { setSearchResults([]); return; }

    let cancelled = false;

    async function searchPatients() {
      try {
        const params = new URLSearchParams({ q });
        if (clinicId) params.set('clinicId', clinicId);
        const res = await fetch(`/api/patients?${params.toString()}`);
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        const patients = data.data || data.patients || data || [];
        if (!cancelled && Array.isArray(patients)) {
          setSearchResults(patients.slice(0, 8).map((p: any) => ({
            id: p.id,
            name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
            phone: p.phone || '',
            uhid: p.uhid || '',
          })));
        }
      } catch {
        // Fallback to localStorage search
        if (cancelled) return;
        const allPatients: { id: string; name: string; phone: string; uhid: string }[] = [];
        try {
          const stored = JSON.parse(localStorage.getItem('emr_added_patients') || '[]');
          if (Array.isArray(stored)) {
            for (const p of stored) {
              if (clinicId && p.clinicId && p.clinicId !== clinicId) continue;
              allPatients.push({ id: p.id, name: `${p.firstName || ''} ${p.lastName || ''}`.trim(), phone: p.phone || '', uhid: p.uhid || '' });
            }
          }
        } catch {}
        try {
          const bookings = JSON.parse(localStorage.getItem('emr_bookings') || '[]');
          if (Array.isArray(bookings)) {
            for (const b of bookings) {
              if (clinicId && b.clinicId !== clinicId) continue;
              if (b.patientData?.firstName) {
                const id = b.patientId || 'obp-' + b.bookingId;
                if (!allPatients.some((p) => p.id === id)) {
                  allPatients.push({ id, name: `${b.patientData.firstName || ''} ${b.patientData.lastName || ''}`.trim(), phone: b.patientData.phone || '', uhid: 'OB-' + id.slice(4) });
                }
              }
            }
          }
        } catch {}

        const ql = q.toLowerCase();
        const matched = allPatients.filter((p) => {
          const searchPhone = ql.replace(/\D/g, '');
          const phone = (p.phone || '').replace(/\D/g, '');
          return p.name.toLowerCase().includes(ql) || (searchPhone.length >= 3 && phone.includes(searchPhone)) || (p.uhid && p.uhid.toLowerCase().includes(ql));
        }).slice(0, 8);
        if (!cancelled) setSearchResults(matched);
      }
    }

    searchPatients();
    return () => { cancelled = true; };
  }, [searchQuery]);

  function resetPatientForm() {
    setPatientPrefix('Mr');
    setPatientName('');
    setPatientPhone('');
    setPatientGender('MALE');
    setPatientAge('');
    setPatientDob('');
    setPatientLanguage('English');
    setPatientCity('');
    setPatientAddress('');
    setPatientPin('');
    setShowMoreFields(false);
    setPatientEmail('');
    setPatientBloodGroup('');
    setPatientAllergies('');
    setPatientHistory('');
    setPatientInsurance('');
    setPatientAbha('');
    setPatientReferral('');
    setPatientUhid('');
  }

  function handleAddPatient() {
    if (!patientName.trim() || !patientPhone.trim()) return;
    setAddingPatient(true);

    const now = new Date();
    const uhid = clinicId === 'psri-delhi'
      ? (patientUhid.trim() || `PSRI-${now.getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000).slice(0, 3)}`)
      : (clinicId === 'online' || clinicId === 'online-intl')
        ? (patientUhid.trim() || `ONLINE-${now.getFullYear()}/${String(Math.floor(Math.random() * 9000) + 1000)}`)
        : (patientUhid.trim() || `KCC-${now.getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000).slice(0, 3)}`);
    const dob = patientDob || (patientAge ? `${now.getFullYear() - parseInt(patientAge || '0')}-01-01` : '');

    const nameParts = patientName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const newPatient = {
      id: `p-${Date.now()}`,
      firstName,
      lastName,
      phone: patientPhone.trim(),
      email: patientEmail.trim(),
      dateOfBirth: dob,
      gender: patientGender === 'FEMALE' ? 'Female' as const : patientGender === 'OTHER' ? 'Other' as const : 'Male' as const,
      bloodGroup: patientBloodGroup || undefined,
      uhid,
      clinicId: clinicId || 'kcc-faridabad',
      abhaNumber: patientAbha || undefined,
      address: patientAddress || undefined,
      city: patientCity || undefined,
      state: undefined,
      pincode: patientPin || undefined,
      emergencyContactName: undefined,
      emergencyContactPhone: undefined,
      emergencyContactRelation: undefined,
      allergies: patientAllergies ? patientAllergies.split(',').map((a: string) => a.trim()).filter(Boolean) : [],
      medicalHistory: patientHistory || undefined,
      insuranceProvider: patientInsurance || undefined,
      insuranceNumber: undefined,
      familyMembers: [],
      isActive: true,
      isChronic: false,
      source: 'emr',
      referralDoctor: patientReferral || undefined,
      createdAt: now.toISOString().split('T')[0],
      lastVisit: now.toISOString().split('T')[0],
      totalVisits: 1,
    };

    const existing = JSON.parse(localStorage.getItem('emr_added_patients') || '[]');
    existing.push(newPatient);
    localStorage.setItem('emr_added_patients', JSON.stringify(existing));

    // Also save to API for cross-browser persistence
    patientsApi.create({
      first_name: firstName,
      last_name: lastName,
      phone: patientPhone.trim(),
      email: patientEmail.trim() || undefined,
      date_of_birth: dob || undefined,
      gender: patientGender === 'FEMALE' ? 'female' : patientGender === 'OTHER' ? 'other' : 'male',
      blood_group: patientBloodGroup || undefined,
      abha_number: patientAbha || undefined,
      medical_history: patientHistory || undefined,
      insurance_provider: patientInsurance || undefined,
    }).catch(() => {});

    setTimeout(() => {
      setAddingPatient(false);
      setShowAddPatient(false);
      resetPatientForm();
      router.push(`/emr/consultation/${newPatient.id}`);
    }, 800);
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-[#095187] text-white flex items-center justify-between px-3 lg:px-5 shrink-0 no-print safe-area-top">
        <div className="flex items-center gap-1">
          <Link href="/emr/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center" style={{ background: '#fff', padding: '2px' }}>
              <img src="/favicon.png" alt="KCC" className="h-7 w-7 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
            <span className="text-sm font-bold tracking-tight hidden sm:inline">KCC</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5 ml-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative flex flex-col items-center gap-0 px-3 py-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-150 min-w-[56px]',
                    isActive && 'bg-white/15 text-white'
                  )}
                >
                  {isActive && <div className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-5 h-[3px] bg-white rounded-t-full" />}
                  <link.icon className="h-4 w-4" />
                  <span className="text-[10px] font-medium leading-tight mt-0.5">{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden md:flex items-center">
          {clinic && (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mr-2"
              style={{
                backgroundColor: clinicId === 'online' ? '#ecfdf5' : '#facc15',
                color: clinicId === 'online' ? '#065f46' : '#1e293b',
                boxShadow: clinicId === 'online' ? '0 4px 12px rgba(16,185,129,0.3)' : '0 4px 12px rgba(250,204,21,0.4)',
                border: clinicId === 'online' ? '2px solid rgba(52,211,153,0.5)' : '2px solid rgba(253,224,71,0.6)',
              }}
            >
              {clinicId === 'online' ? <Video className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
              <span>{clinic.parentName}</span>
              {clinic.name.includes(' - ') && (
                <>
                  <span style={{ color: clinicId === 'online' ? '#047857' : '#854d0e' }}>|</span>
                  <span>{clinic.name.split(' - ')[1]}</span>
                </>
              )}
            </div>
          )}
          <Link href="/emr/ai" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Assistant</span>
            <span className="px-1 py-0.5 bg-emerald-500 text-[8px] font-bold text-white rounded-full leading-none">AI</span>
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={() => setShowAddPatient(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs font-medium touch-target">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">New</span>
          </button>

          <div ref={searchRef} className={cn('relative flex items-center transition-all duration-200', searchFocused ? 'w-52 lg:w-64' : 'w-10 lg:w-44')}>
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/50 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder="Search Patient"
              className="w-full h-11 pl-8 pr-2 rounded-lg bg-white/10 text-xs text-white placeholder:text-white/40 focus:outline-none focus:bg-white/15 focus:ring-1 focus:ring-white/20 transition-all duration-200"
              aria-label="Search patients"
            />
            {searchFocused && searchResults.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-[55] max-h-80 overflow-y-auto">
                {searchResults.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { setSearchQuery(''); setSearchFocused(false); router.push(`/emr/consultation/${r.id}`); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#0A75BB]/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-[#0A75BB]">{r.name.charAt(0) || '?'}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{r.name}</p>
                      <p className="text-[11px] text-gray-500">{r.phone || r.uhid || 'No phone'}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchFocused && searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-4 px-3 z-50">
                <p className="text-xs text-gray-400 text-center">No patients found</p>
              </div>
            )}
          </div>

          <button className="relative p-2.5 rounded-lg hover:bg-white/10 transition-colors" aria-label="Notifications">
            <Bell className="h-4.5 w-4.5 text-white/70" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-[1.5px] ring-[#095187]" />
          </button>

          <button className="hidden sm:flex p-2.5 rounded-lg hover:bg-white/10 transition-colors" aria-label="Apps">
            <Grid3X3 className="h-4.5 w-4.5 text-white/70" />
          </button>

          <div ref={profileRef} className="relative">
            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
                {user?.name?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'U'}
              </div>
              <ChevronDown className={cn('hidden sm:block h-3.5 w-3.5 text-white/50 transition-transform', profileOpen && 'rotate-180')} />
            </button>
            {profileOpen && (
              <div className="absolute top-full right-0 mt-1.5 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50 overflow-hidden">
                {!clinicSwitchOpen ? (
                  <>
                    <div className="px-3 py-2.5 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                      <p className="text-[11px] text-gray-500 capitalize">{user?.role || 'role'}</p>
                      {clinic && (
                        <div
                          className="flex items-center gap-1.5 mt-1.5 px-2 py-1 rounded-full"
                          style={{ backgroundColor: '#fef9c3', border: '1px solid #fde047' }}
                        >
                          <Building2 className="h-3 w-3" style={{ color: '#a16207' }} />
                          <p className="text-[11px] font-bold" style={{ color: '#854d0e' }}>{clinic.name}</p>
                        </div>
                      )}
                    </div>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Users className="h-4 w-4 text-gray-400" /> My Profile
                    </button>
                    <button onClick={() => setClinicSwitchOpen(true)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Building2 className="h-4 w-4 text-gray-400" /> Switch Clinic
                      <ChevronDown className="h-3 w-3 text-gray-400 ml-auto -rotate-90" />
                    </button>
                    {can('settings') && (
                      <button onClick={() => { setProfileOpen(false); router.push('/emr/settings'); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Settings className="h-4 w-4 text-gray-400" /> Settings
                      </button>
                    )}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={() => { logout(); clearClinic(); router.push('/emr/login'); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-3 py-2.5 border-b border-gray-100 flex items-center gap-2">
                      <button onClick={() => setClinicSwitchOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Go back">
                        <ChevronLeft className="h-4 w-4 text-gray-500" />
                      </button>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Switch Clinic</p>
                        <p className="text-xs text-gray-500">Select a clinic location</p>
                      </div>
                    </div>
                    <div className="py-1">
                      {clinicOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => { setClinicId(opt.id); setClinicSwitchOpen(false); setProfileOpen(false); if (pathname.includes('/emr/consultation/') || pathname.includes('/emr/patients/')) router.push('/emr/consultation'); }}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                            clinicId === opt.id ? 'bg-[#0A75BB]/5' : 'hover:bg-gray-50'
                          )}
                        >
                          <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                            clinicId === opt.id ? 'bg-[#0A75BB]' : 'bg-gray-100'
                          )}>
                            <Building2 className={cn('h-4 w-4', clinicId === opt.id ? 'text-white' : 'text-gray-500')} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-sm font-medium truncate', clinicId === opt.id ? 'text-[#0A75BB]' : 'text-gray-900')}>
                              {opt.parent}
                            </p>
                            <p className="text-[10px] text-gray-500 truncate">{opt.address}</p>
                          </div>
                          {clinicId === opt.id && <Check className="h-4 w-4 text-[#0A75BB] shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile menu removed — bottom nav handles navigation on mobile */}

      {showAddPatient && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddPatient(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Add New Patient</h2>
              <button onClick={() => setShowAddPatient(false)} className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Close">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-[80px_1fr_1fr] gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Prefix</label>
                  <select value={patientPrefix} onChange={(e) => setPatientPrefix(e.target.value)} className="w-full h-11 px-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30">
                    <option>Mr</option><option>Mrs</option><option>Ms</option><option>Master</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Patient Name *</label>
                  <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Enter Name"
                    className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Phone Number *</label>
                  <input type="tel" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} placeholder="Enter Number" maxLength={10}
                    className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30" />
                </div>
              </div>

              {/* Duplicate Detection Warning */}
              {duplicatePatient && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <p className="text-sm font-semibold text-amber-800">Patient Already Registered</p>
                  </div>
                  <div className="text-sm text-amber-700 space-y-1">
                    <p><strong>Name:</strong> {duplicatePatient.firstName} {duplicatePatient.lastName}</p>
                    <p><strong>Phone:</strong> {duplicatePatient.phone}</p>
                    <p><strong>UHID:</strong> {duplicatePatient.uhid}</p>
                    <p><strong>Clinic:</strong> {
                      duplicatePatient.clinicId === 'kcc-faridabad' ? 'KCC Faridabad' :
                      duplicatePatient.clinicId === 'kcc-saket' ? 'KCC Saket' :
                      duplicatePatient.clinicId === 'psri-delhi' ? 'PSRI Hospital' :
                      duplicatePatient.clinicId === 'online' ? 'Online' :
                      duplicatePatient.clinicId || 'Unknown'
                    }</p>
                  </div>
                  <button
                    onClick={() => { setShowAddPatient(false); router.push(`/emr/consultation/${duplicatePatient.id}`); }}
                    className="text-xs font-medium text-amber-800 underline hover:text-amber-900"
                  >
                    Open existing consultation →
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Gender *</label>
                  <div className="flex gap-1">
                    {['MALE', 'FEMALE', 'OTHER'].map((g) => (
                      <button key={g} onClick={() => setPatientGender(g)}
                        className={cn('flex-1 h-11 rounded-lg text-xs font-medium border transition-colors',
                          patientGender === g ? 'bg-[#0A75BB] text-white border-[#0A75BB]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#0A75BB]')}>
                        {g === 'MALE' ? 'M' : g === 'FEMALE' ? 'F' : 'Other'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Age</label>
                  <input type="number" value={patientAge} onChange={(e) => setPatientAge(e.target.value)} placeholder="Age"
                    className="w-full h-11 px-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">DOB</label>
                  <input type="date" value={patientDob} onChange={(e) => setPatientDob(e.target.value)}
                    className="w-full h-11 px-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">City</label>
                  <input type="text" value={patientCity} onChange={(e) => setPatientCity(e.target.value)} placeholder="Enter City"
                    className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Address</label>
                  <input type="text" value={patientAddress} onChange={(e) => setPatientAddress(e.target.value)} placeholder="Enter Address"
                    className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Pin Code</label>
                  <input type="text" value={patientPin} onChange={(e) => setPatientPin(e.target.value)} placeholder="Pin" maxLength={6}
                    className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30" />
                </div>
              </div>

              {!showMoreFields && (
                <button onClick={() => setShowMoreFields(true)} className="text-sm text-[#0A75BB] hover:text-[#085D94] font-medium transition-colors">
                  If you want to add more details, Click Here
                </button>
              )}

              {showMoreFields && (
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                        {clinicId === 'psri-delhi' ? 'PSRI Registration No. *' : 'UHID (auto-generated)'}
                      </label>
                      {clinicId === 'psri-delhi' ? (
                        <input type="text" value={patientUhid} onChange={(e) => setPatientUhid(e.target.value)}
                          placeholder="e.g. PSRI-48091"
                          className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30" />
                      ) : (
                        <div className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm bg-gray-50 flex items-center text-gray-500">
                          {autoUhid}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">Email</label>
                      <input type="email" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} placeholder="email@example.com"
                        className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30" />
                    </div>
                  </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">Blood Group</label>
                      <select value={patientBloodGroup} onChange={(e) => setPatientBloodGroup(e.target.value)}
                        className="w-full h-11 px-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30">
                        <option value="">Select</option>
                        <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                      </select>
                    </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">ABHA Number</label>
                      <input type="text" value={patientAbha} onChange={(e) => setPatientAbha(e.target.value)} placeholder="14-digit ABHA" maxLength={14}
                        className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1.5 block">Insurance</label>
                      <input type="text" value={patientInsurance} onChange={(e) => setPatientInsurance(e.target.value)} placeholder="Provider & Number"
                        className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Referred By (Doctor Name)</label>
                    <input type="text" value={patientReferral} onChange={(e) => setPatientReferral(e.target.value)} placeholder="Dr. name (if referred)"
                      className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Allergies</label>
                    <input type="text" value={patientAllergies} onChange={(e) => setPatientAllergies(e.target.value)} placeholder="e.g. Penicillin, Sulfa"
                      className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1.5 block">Medical History</label>
                    <textarea value={patientHistory} onChange={(e) => setPatientHistory(e.target.value)} placeholder="CKD, Diabetes, Hypertension..." rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30" />
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 space-y-3">
              <button onClick={handleAddPatient} disabled={!patientName.trim() || !patientPhone.trim() || addingPatient}
                className={cn('w-full h-11 rounded-xl text-sm font-semibold text-white transition-all bg-gradient-to-r from-[#0A75BB] to-[#085D94] hover:from-[#085D94] hover:to-[#074D7A] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#0A75BB]/25')}>
                {addingPatient ? 'Adding...' : 'Add & Create Rx'}
              </button>
              <div className="flex gap-3">
                <button onClick={handleAddPatient} disabled={!patientName.trim() || !patientPhone.trim()}
                  className="flex-1 h-11 rounded-xl text-xs font-semibold text-[#0A75BB] border-2 border-[#0A75BB] hover:bg-[#0A75BB]/5 transition-colors disabled:opacity-50">
                  Add & Create Bill
                </button>
                <button onClick={handleAddPatient} disabled={!patientName.trim() || !patientPhone.trim()}
                  className="flex-1 h-11 rounded-xl text-xs font-semibold text-[#0A75BB] border-2 border-[#0A75BB] hover:bg-[#0A75BB]/5 transition-colors disabled:opacity-50">
                  Add & Create Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
