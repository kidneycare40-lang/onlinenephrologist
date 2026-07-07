'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Video, Phone, PhoneOff, Users, Clock, Send, ExternalLink, Copy, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClinic } from '@/lib/emr-clinic-context';
import { patients as mockPatients } from '@/lib/data/emr-mock';
import type { EMRPatient } from '@/types/emr';

interface WaitingPatient {
  id: string;
  name: string;
  phone: string;
  type: string;
  clinicId: string;
  uhid?: string;
}

function generateRoomId(): string {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const rand = Math.random().toString(36).substring(2, 8);
  return `kcc-tele-${date}-${rand}`;
}

export default function TelemedicinePage() {
  const { clinicId } = useClinic();
  const [waitingRoom, setWaitingRoom] = useState<WaitingPatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<WaitingPatient | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [meetingRoomId, setMeetingRoomId] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load waiting room from today's online bookings + appointments
  useEffect(() => {
    const patients: WaitingPatient[] = [];

    // Online bookings
    try {
      const bookings = JSON.parse(localStorage.getItem('emr_bookings') || '[]');
      const today = new Date().toISOString().split('T')[0];
      for (const b of bookings) {
        if (b.date === today && b.status !== 'cancelled') {
          patients.push({
            id: b.bookingId || b.id,
            name: `${b.firstName} ${b.lastName}`,
            phone: b.phone || '',
            type: 'Online Consultation',
            clinicId: b.clinicId || 'online',
            uhid: b.uhid || '',
          });
        }
      }
    } catch { /* */ }

    // EMR-added patients with online consultation type
    try {
      const addedPatients = JSON.parse(localStorage.getItem('emr_added_patients') || '[]') as EMRPatient[];
      for (const p of addedPatients) {
        if (p.clinicId === 'online' || p.clinicId === 'online-intl') {
          patients.push({
            id: p.id,
            name: `${p.firstName} ${p.lastName}`,
            phone: p.phone || '',
            type: 'Virtual Visit',
            clinicId: p.clinicId,
            uhid: p.uhid,
          });
        }
      }
    } catch { /* */ }

    // Mock patients for demo
    for (const p of mockPatients) {
      if (!patients.some((wp) => wp.id === p.id)) {
        patients.push({
          id: p.id,
          name: `${p.firstName} ${p.lastName}`,
          phone: p.phone || '',
          type: 'Consultation',
          clinicId: p.clinicId || 'kcc-faridabad',
          uhid: p.uhid,
        });
      }
    }

    const filtered = clinicId ? patients.filter((p) => !p.clinicId || p.clinicId === clinicId || p.clinicId === 'online' || p.clinicId === 'online-intl') : patients;
    setWaitingRoom(filtered);
  }, [clinicId]);

  // Call timer
  useEffect(() => {
    if (isCallActive) {
      setCallDuration(0);
      timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isCallActive]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const startCall = () => {
    const roomId = generateRoomId();
    const link = `https://meet.jit.si/${roomId}`;
    setMeetingRoomId(roomId);
    setMeetingLink(link);
    setIsCallActive(true);
  };

  const endCall = () => {
    setIsCallActive(false);
    setMeetingRoomId('');
    setMeetingLink('');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* */ }
  };

  const sendLinkWhatsApp = () => {
    if (!selectedPatient?.phone || !meetingLink) return;
    const msg = encodeURIComponent(
      `Hello ${selectedPatient.name},\n\nYou have a video consultation with Dr. Rajesh Goel (Kidney Care Centre).\n\nJoin here: ${meetingLink}\n\nPlease join 2 minutes before your scheduled time.`
    );
    window.open(`https://wa.me/91${selectedPatient.phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Telemedicine</h1>
          <p className="text-sm text-gray-500 mt-1">Video consultations and virtual visits</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="h-4 w-4" />
          <span>{waitingRoom.length} patients available</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Left: Video Area */}
        <div className="flex-1 space-y-4">
          <div className="bg-gray-900 rounded-2xl aspect-video flex flex-col items-center justify-center relative overflow-hidden">
            {isCallActive && meetingRoomId ? (
              <iframe
                src={`https://meet.jit.si/${meetingRoomId}#userInfo.displayName=Dr.RajeshGoel&config.prejoinPageEnabled=false&config.toolbarButtons=["microphone","camera","fullscreen","hangup","chat"]`}
                className="w-full h-full border-0 absolute inset-0"
                allow="camera; microphone; fullscreen; display-capture"
                title="Video Consultation"
              />
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
                  <Video className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-gray-400 text-sm mb-1">No active consultation</p>
                <p className="text-gray-500 text-xs">
                  {selectedPatient ? `Click "Start Video Call" for ${selectedPatient.name}` : 'Select a patient below to start'}
                </p>
              </div>
            )}

            {isCallActive && (
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <span className="px-2.5 py-1 bg-red-600 rounded-full text-xs text-white flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 bg-white rounded-full" />
                  {formatDuration(callDuration)}
                </span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            {!isCallActive ? (
              <button
                onClick={startCall}
                disabled={!selectedPatient}
                className={cn(
                  'px-6 py-3 rounded-full font-medium flex items-center gap-2 transition-colors',
                  selectedPatient ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                <Phone className="h-5 w-5" />Start Video Call
              </button>
            ) : (
              <button onClick={endCall}
                className="px-6 py-3 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
                <PhoneOff className="h-5 w-5" />End Call
              </button>
            )}
          </div>

          {/* Meeting Link Bar */}
          {isCallActive && meetingLink && (
            <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">Meeting Link (share with patient):</p>
                <p className="text-sm text-[#0A75BB] font-medium truncate">{meetingLink}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={copyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors">
                  {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={sendLinkWhatsApp}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 rounded-lg text-xs font-medium text-white hover:bg-green-700 transition-colors">
                  <Send className="h-3.5 w-3.5" />WhatsApp
                </button>
                <a href={meetingLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A75BB] rounded-lg text-xs font-medium text-white hover:bg-[#085a94] transition-colors">
                  <ExternalLink className="h-3.5 w-3.5" />Open
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right: Waiting Room */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-[#0A75BB]" />Waiting Room ({waitingRoom.length})
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {waitingRoom.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No patients in waiting room</p>
              ) : (
                waitingRoom.map((p) => (
                  <button key={p.id} onClick={() => setSelectedPatient(p)}
                    className={cn('w-full text-left p-3 rounded-xl border transition-all',
                      selectedPatient?.id === p.id ? 'border-[#0A75BB] bg-[#0A75BB]/5' : 'border-gray-100 hover:bg-gray-50')}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0A75BB]/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-[#0A75BB]">{p.name.split(' ').map((n) => n[0]).join('')}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.type}</p>
                        {p.uhid && <p className="text-[10px] text-gray-400">{p.uhid}</p>}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
