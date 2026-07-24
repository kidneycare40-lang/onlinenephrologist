'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowLeft,
  MapPin,
  CheckCircle2,
  Stethoscope,
  Phone,
  Building2,
  Video,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClinic } from '@/lib/emr-clinic-context';

const clinics = [
  {
    id: 'kcc',
    name: 'Kidney Care Centre',
    color: '#0A75BB',
    locations: [
      { id: 'kcc-faridabad', name: 'Faridabad Clinic', address: 'Old Faridabad, 18A Main Market, Faridabad, Haryana' },
      { id: 'kcc-saket', name: 'Saket Clinic Delhi', address: '13 B, K-Block, Gate no. - 2, Saket, New Delhi' },
    ],
  },
  {
    id: 'psri',
    name: 'PSRI Hospital',
    color: '#c0392b',
    locations: [
      { id: 'psri-delhi', name: 'PSRI Hospital Delhi', address: 'Press Enclave Marg, Sheikh Sarai - II, New Delhi - 110017' },
    ],
  },
  {
    id: 'online',
    name: 'Online Consultation',
    color: '#16a34a',
    locations: [
      { id: 'online', name: 'Online Consultation', address: 'Virtual / Teleconsultation' },
    ],
  },
];

const features = [
  'Digital Prescriptions in 30 seconds',
  'Complete Patient EMR Management',
  'AI-Assisted Clinical Notes',
  'Drug Interaction Alerts',
  'WhatsApp Prescription Delivery',
  'Lab Trend Graphs & Analytics',
];

export default function ClinicSelectionPage() {
  const router = useRouter();
  const { setClinicId } = useClinic();
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const activeClinic = clinics.find((c) => c.id === selectedClinic);

  function handleClinicSelect(clinicId: string) {
    const clinic = clinics.find((c) => c.id === clinicId);
    if (clinic && clinic.locations.length === 1) {
      handleLocationSelect(clinic.locations[0].id);
    } else {
      setSelectedClinic(clinicId);
    }
  }

  function handleLocationSelect(locationId: string) {
    try {
      localStorage.setItem('emr-clinic-id', locationId);
    } catch {}
    window.location.replace('/emr/dashboard');
  }

  function handleBack() {
    setSelectedClinic(null);
    setHoveredItem(null);
  }

  return (
    <div className="flex min-h-screen">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between bg-gradient-to-br from-[#0A75BB] to-[#085D94] text-white p-10 xl:p-14">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center overflow-hidden">
              <img src="/favicon.png" alt="KCC" className="h-9 w-9 object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Kidney Care Centre</h1>
              <p className="text-sm text-white/70 font-medium">EMR System</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-lg">
          <h2 className="text-3xl xl:text-4xl font-bold leading-tight mb-3">
            AI-Powered Clinic Management System
          </h2>
          <p className="text-base text-white/70 mb-10">
            Streamline your nephrology practice with intelligent tools designed for modern healthcare.
          </p>

          <div className="flex items-center gap-5 mb-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0">
              <Stethoscope className="h-9 w-9 text-white/80" />
            </div>
            <div className="text-sm text-white/60 leading-relaxed">
              Trusted by <span className="text-white font-semibold">50+ nephrologists</span> across India for daily clinical practice.
            </div>
          </div>

          <div className="space-y-3">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <span className="text-sm text-white/85 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 space-y-2 pt-6 border-t border-white/10">
          <p className="text-sm text-white/60 flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Need help? Call us @98182 35613
          </p>
          <p className="text-xs text-white/40">&copy; 2026 Kidney Care Centre. All rights reserved.</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center bg-white px-6 sm:px-10 lg:px-14 xl:px-20">
        <div className="w-full max-w-[440px]">
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
              <img src="/favicon.png" alt="KCC" className="h-7 w-7 object-contain" />
            </div>
            <span className="text-sm font-bold text-gray-900">Kidney Care Centre</span>
          </div>

          {!selectedClinic ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900">Select your Clinic</h2>
              <p className="text-sm text-gray-500 mt-1.5 mb-8">
                Choose the clinic you want to manage.
              </p>

              <div className="space-y-3">
                {clinics.map((clinic) => (
                  <button
                    key={clinic.id}
                    onClick={() => handleClinicSelect(clinic.id)}
                    onMouseEnter={() => setHoveredItem(clinic.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left',
                      'hover:border-[#0A75BB]/40 hover:shadow-md hover:shadow-[#0A75BB]/5',
                      hoveredItem === clinic.id
                        ? 'border-[#0A75BB]/40 bg-[#0A75BB]/[0.03]'
                        : 'border-gray-200 bg-white'
                    )}
                  >
                    <div className={cn(
                      'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200',
                      hoveredItem === clinic.id
                        ? 'bg-[#0A75BB] text-white'
                        : 'bg-[#0A75BB]/10 text-[#0A75BB]'
                    )}>
                      {clinic.id === 'online' ? <Video className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{clinic.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{clinic.locations.length} location{clinic.locations.length > 1 ? 's' : ''}</p>
                    </div>
                    <ArrowRight className={cn(
                      'h-5 w-5 shrink-0 transition-all duration-200',
                      hoveredItem === clinic.id ? 'text-[#0A75BB] translate-x-0.5' : 'text-gray-300'
                    )} />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button onClick={handleBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium mb-4 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to clinics
              </button>

              <h2 className="text-2xl font-bold text-gray-900">{activeClinic?.name}</h2>
              <p className="text-sm text-gray-500 mt-1.5 mb-8">
                Select the location you want to access.
              </p>

              <div className="space-y-3">
                {activeClinic?.locations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSelect(location.id)}
                    onMouseEnter={() => setHoveredItem(location.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left',
                      'hover:border-[#0A75BB]/40 hover:shadow-md hover:shadow-[#0A75BB]/5',
                      hoveredItem === location.id
                        ? 'border-[#0A75BB]/40 bg-[#0A75BB]/[0.03]'
                        : 'border-gray-200 bg-white'
                    )}
                  >
                    <div className={cn(
                      'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200',
                      hoveredItem === location.id
                        ? 'bg-[#0A75BB] text-white'
                        : 'bg-[#0A75BB]/10 text-[#0A75BB]'
                    )}>
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{location.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
                        <p className="text-xs text-gray-500 truncate">{location.address}</p>
                      </div>
                    </div>
                    <ArrowRight className={cn(
                      'h-5 w-5 shrink-0 transition-all duration-200',
                      hoveredItem === location.id ? 'text-[#0A75BB] translate-x-0.5' : 'text-gray-300'
                    )} />
                  </button>
                ))}
              </div>
            </>
          )}

          <p className="text-xs text-gray-400 text-center mt-8">
            Kidney Care Centre &copy; Since 2014
          </p>
        </div>
      </div>
    </div>
  );
}
