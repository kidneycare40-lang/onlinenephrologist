'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Video, Building2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClinicInfo {
  id: string;
  name: string;
  shortName: string;
  address: string;
  city: string;
  fee: number;
  type: 'offline' | 'online';
  workingDays: number[];
  startTime: string;
  endTime: string;
  slotInterval: number;
  breakStart: string;
  breakEnd: string;
}

const CLINICS: ClinicInfo[] = [
  {
    id: 'kcc-faridabad',
    name: 'Kidney Care Centre - Faridabad',
    shortName: 'Kidney Care Center',
    address: 'Old Faridabad, 18A Main Market, Faridabad, Haryana',
    city: 'Faridabad',
    fee: 500,
    type: 'offline',
    workingDays: [1, 2, 3, 4, 5, 6],
    startTime: '09:00',
    endTime: '10:30',
    slotInterval: 5,
    breakStart: '',
    breakEnd: '',
  },
  {
    id: 'kcc-saket',
    name: 'Kidney Care Centre - Saket',
    shortName: 'Kidney Care Centre',
    address: '13 B, K-Block, Gate no. - 2, Saket, New Delhi',
    city: 'New Delhi',
    fee: 1200,
    type: 'offline',
    workingDays: [0, 1, 2, 3, 4, 5, 6],
    startTime: '21:00',
    endTime: '23:00',
    slotInterval: 10,
    breakStart: '',
    breakEnd: '',
  },
  {
    id: 'psri-delhi',
    name: 'PSRI Hospital, New Delhi',
    shortName: 'Pushpawati Singhania Research Institute',
    address: 'Press Enclave Marg, Shaikh Sarai - II, New Delhi - 110017',
    city: 'New Delhi',
    fee: 1000,
    type: 'offline',
    workingDays: [1, 2, 3, 4, 5, 6],
    startTime: '13:00',
    endTime: '18:30',
    slotInterval: 10,
    breakStart: '15:00',
    breakEnd: '15:30',
  },
  {
    id: 'online',
    name: 'Online Consultation',
    shortName: 'Online',
    address: 'Video/Phone Consultation from anywhere',
    city: '',
    fee: 500,
    type: 'online',
    workingDays: [0, 1, 2, 3, 4, 5, 6],
    startTime: '07:00',
    endTime: '23:00',
    slotInterval: 15,
    breakStart: '',
    breakEnd: '',
  },
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function generateSlots(clinic: ClinicInfo): string[] {
  const slots: string[] = [];
  const [startH, startM] = clinic.startTime.split(':').map(Number);
  const [endH, endM] = clinic.endTime.split(':').map(Number);
  const startMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;
  let t = startMin;
  while (t < endMin) {
    if (clinic.breakStart && clinic.breakEnd) {
      const [bsh, bsm] = clinic.breakStart.split(':').map(Number);
      const [beh, bem] = clinic.breakEnd.split(':').map(Number);
      const breakS = bsh * 60 + bsm;
      const breakE = beh * 60 + bem;
      if (t >= breakS && t < breakE) { t = breakE; continue; }
    }
    const h24 = Math.floor(t / 60);
    const m = t % 60;
    const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
    const ampm = h24 >= 12 ? 'pm' : 'am';
    slots.push(`${h12}:${m.toString().padStart(2, '0')} ${ampm}`);
    t += clinic.slotInterval;
  }
  return slots;
}

function getNextDays(count: number) {
  const days: { date: Date; dayName: string; dayNum: number; month: string; dayOfWeek: number; isToday: boolean }[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      date: d,
      dayName: DAY_NAMES[d.getDay()],
      dayNum: d.getDate(),
      month: MONTH_NAMES[d.getMonth()],
      dayOfWeek: d.getDay(),
      isToday: i === 0,
    });
  }
  return days;
}

export default function BookingWidget() {
  const [selectedClinicId, setSelectedClinicId] = useState('kcc-faridabad');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [showClinicDropdown, setShowClinicDropdown] = useState(false);
  const [consultMode, setConsultMode] = useState<'in-clinic' | 'video'>('in-clinic');
  const [dayOffset, setDayOffset] = useState(0);

  const selectedClinic = useMemo(() => CLINICS.find(c => c.id === selectedClinicId)!, [selectedClinicId]);
  const days = useMemo(() => getNextDays(14), []);
  const visibleDays = days.slice(dayOffset, dayOffset + 7);

  const slots = useMemo(() => {
    if (selectedClinic.type === 'online' || consultMode === 'video') {
      const onlineClinic = CLINICS.find(c => c.id === 'online')!;
      return generateSlots(onlineClinic);
    }
    return generateSlots(selectedClinic);
  }, [selectedClinic, consultMode]);

  const isWorkingDay = selectedClinic.workingDays.includes(selectedDate.getDay());
  const slotsForDay = isWorkingDay ? slots : [];

  const morningSlots = slotsForDay.filter(s => s.includes('am'));
  const afternoonSlots = slotsForDay.filter(s => {
    if (s.includes('pm')) {
      const hour = parseInt(s.split(':')[0]);
      return hour < 5;
    }
    return false;
  });
  const eveningSlots = slotsForDay.filter(s => {
    if (s.includes('pm')) {
      const hour = parseInt(s.split(':')[0]);
      return hour >= 5;
    }
    return false;
  });

  const activeClinic = consultMode === 'video'
    ? CLINICS.find(c => c.id === 'online')!
    : selectedClinic;

  const getBookingUrl = (slot: string) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const type = consultMode === 'video' ? 'online' : selectedClinic.type === 'online' ? 'online' : 'offline';
    const clinicIdParam = selectedClinic.id === 'online' ? '' : `&clinicId=${selectedClinic.id}`;
    return `/book-appointment?date=${dateStr}&time=${encodeURIComponent(slot)}&type=${type}${clinicIdParam}`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0A75BB] to-[#085a94] text-white px-5 py-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <h3 className="font-bold text-lg">Pick a time slot</h3>
        </div>
      </div>

      {/* Clinic Selector */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">{activeClinic.shortName}</p>
            <p className="text-xs text-slate-500 truncate">{activeClinic.address}</p>
          </div>
          <div className="text-right ml-3">
            <p className="font-bold text-gray-900">₹{activeClinic.fee}</p>
            <p className="text-[11px] text-slate-400">fee</p>
          </div>
        </div>
        <button
          onClick={() => setShowClinicDropdown(!showClinicDropdown)}
          className="mt-2 text-xs font-medium text-[#0A75BB] hover:underline flex items-center gap-1"
        >
          Change clinic {showClinicDropdown ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
        {showClinicDropdown && (
          <div className="mt-2 space-y-1">
            {CLINICS.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedClinicId(c.id);
                  setConsultMode(c.type === 'online' ? 'video' : 'in-clinic');
                  setShowClinicDropdown(false);
                  setSelectedSlot('');
                }}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-xs transition-all',
                  selectedClinicId === c.id ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-slate-50 text-slate-700'
                )}
              >
                <span className="font-medium">{c.name}</span>
                <span className="text-slate-400 ml-1">— ₹{c.fee}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Consultation Mode */}
      <div className="px-5 py-3 border-b border-slate-100">
        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide mb-2">Consultation Mode</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { setConsultMode('in-clinic'); setSelectedSlot(''); }}
            className={cn(
              'flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border',
              consultMode === 'in-clinic'
                ? 'bg-[#0A75BB] text-white border-[#0A75BB]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            )}
          >
            <Building2 className="h-4 w-4" /> In-clinic
          </button>
          <button
            onClick={() => { setConsultMode('video'); setSelectedSlot(''); }}
            className={cn(
              'flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border',
              consultMode === 'video'
                ? 'bg-[#0A75BB] text-white border-[#0A75BB]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            )}
          >
            <Video className="h-4 w-4" /> Video
          </button>
        </div>
      </div>

      {/* Date Picker */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setDayOffset(Math.max(0, dayOffset - 1))}
            disabled={dayOffset === 0}
            className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </button>
          <div className="flex gap-2 flex-1 justify-center">
            {visibleDays.map((day, i) => {
              const isSelected = day.date.toDateString() === selectedDate.toDateString();
              const dayClinic = consultMode === 'video' ? CLINICS.find(c => c.id === 'online')! : selectedClinic;
              const hasSlots = dayClinic.workingDays.includes(day.dayOfWeek);
              return (
                <button
                  key={i}
                  onClick={() => { setSelectedDate(day.date); setSelectedSlot(''); }}
                  className={cn(
                    'flex flex-col items-center px-2 py-2 rounded-xl text-xs transition-all min-w-[48px]',
                    isSelected
                      ? 'bg-[#0A75BB] text-white shadow-md'
                      : 'hover:bg-slate-50 text-slate-600'
                  )}
                >
                  <span className={cn('text-[10px] font-medium', isSelected ? 'text-blue-100' : 'text-slate-400')}>
                    {day.isToday ? 'TODAY' : day.dayName}
                  </span>
                  <span className="text-lg font-bold leading-tight">{day.dayNum}</span>
                  <span className={cn(
                    'text-[10px] font-medium',
                    isSelected ? 'text-blue-100' : hasSlots ? 'text-emerald-500' : 'text-red-400'
                  )}>
                    {hasSlots ? 'Available' : 'No slots'}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setDayOffset(Math.min(days.length - 7, dayOffset + 1))}
            disabled={dayOffset >= days.length - 7}
            className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Time Slots */}
      <div className="px-5 py-4 max-h-[360px] overflow-y-auto">
        {!isWorkingDay && consultMode !== 'video' ? (
          <div className="text-center py-8 text-slate-400">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No slots available on {DAY_NAMES[selectedDate.getDay()]}</p>
            <p className="text-xs mt-1">Select a different day</p>
          </div>
        ) : slotsForDay.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No slots available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {morningSlots.length > 0 && (
              <div>
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide mb-2">Morning</p>
                <div className="grid grid-cols-3 gap-2">
                  {morningSlots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={cn(
                        'px-2 py-2 rounded-lg text-xs font-medium transition-all border',
                        selectedSlot === slot
                          ? 'bg-[#0A75BB] text-white border-[#0A75BB]'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-[#0A75BB] hover:text-[#0A75BB]'
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {afternoonSlots.length > 0 && (
              <div>
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide mb-2">Afternoon</p>
                <div className="grid grid-cols-3 gap-2">
                  {afternoonSlots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={cn(
                        'px-2 py-2 rounded-lg text-xs font-medium transition-all border',
                        selectedSlot === slot
                          ? 'bg-[#0A75BB] text-white border-[#0A75BB]'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-[#0A75BB] hover:text-[#0A75BB]'
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {eveningSlots.length > 0 && (
              <div>
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide mb-2">Evening</p>
                <div className="grid grid-cols-3 gap-2">
                  {eveningSlots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={cn(
                        'px-2 py-2 rounded-lg text-xs font-medium transition-all border',
                        selectedSlot === slot
                          ? 'bg-[#0A75BB] text-white border-[#0A75BB]'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-[#0A75BB] hover:text-[#0A75BB]'
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Book Button */}
      {selectedSlot && (
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50">
          <Link
            href={getBookingUrl(selectedSlot)}
            className="block w-full text-center px-6 py-3 bg-[#0A75BB] text-white font-bold rounded-xl hover:bg-[#085a94] transition-colors text-sm"
          >
            Book {selectedSlot} — ₹{activeClinic.fee}
          </Link>
        </div>
      )}

      {/* At a Glance */}
      <div className="px-5 py-4 border-t border-slate-100">
        <h4 className="text-sm font-bold text-gray-900 mb-3">At a glance</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Experience</span>
            <span className="font-medium text-gray-900">24 years</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Consult modes</span>
            <span className="font-medium text-gray-900">In-clinic · Video</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">Consultation fee</span>
            <span className="font-medium text-gray-900">₹500 – ₹1200</span>
          </div>
        </div>
      </div>
    </div>
  );
}
