'use client';

import { useState } from 'react';
import {
  Video, VideoOff, Mic, MicOff, Phone, PhoneOff, MonitorUp, MessageSquare,
  Users, Camera, Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClinic } from '@/lib/emr-clinic-context';

const telemedicineWaitingRoom = [
  { id: 'p1', name: 'Ramesh Kumar', waitTime: 5, type: 'Follow-up', clinicId: 'kcc-faridabad' },
  { id: 'p2', name: 'Priya Sharma', waitTime: 12, type: 'Consultation', clinicId: 'kcc-saket' },
  { id: 'p3', name: 'Amit Patel', waitTime: 0, type: 'Lab Review', clinicId: 'kcc-faridabad' },
];

export default function TelemedicinePage() {
  const { clinicId } = useClinic();
  const filteredWaitingRoom = clinicId ? telemedicineWaitingRoom.filter((p) => p.clinicId === clinicId) : telemedicineWaitingRoom;
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(filteredWaitingRoom[0]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Telemedicine</h1>
          <p className="text-sm text-gray-500 mt-1">Video consultations and virtual visits</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="h-4 w-4" />
          <span>{filteredWaitingRoom.length} in waiting room</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="bg-gray-900 rounded-2xl aspect-video flex flex-col items-center justify-center relative overflow-hidden">
            {!isCallActive ? (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
                  <Camera className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-gray-400 text-sm mb-1">No active consultation</p>
                <p className="text-gray-500 text-xs">Select a patient from the waiting room to start</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-[#0A75BB]/20 flex items-center justify-center mx-auto mb-4 border-2 border-[#0A75BB]">
                  <span className="text-2xl font-bold text-[#0A75BB]">{selectedPatient.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <p className="text-white font-medium">{selectedPatient.name}</p>
                <p className="text-gray-400 text-sm mt-1">Connected</p>
              </div>
            )}

            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="px-2.5 py-1 bg-black/50 rounded-full text-xs text-white flex items-center gap-1.5">
                <Clock className="h-3 w-3" />00:00
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setIsMuted(!isMuted)}
              className={cn('p-3 rounded-full transition-colors', isMuted ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}>
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            <button onClick={() => setIsVideoOn(!isVideoOn)}
              className={cn('p-3 rounded-full transition-colors', !isVideoOn ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}>
              {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </button>
            <button className="p-3 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
              <MonitorUp className="h-5 w-5" />
            </button>
            <button className="p-3 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
              <MessageSquare className="h-5 w-5" />
            </button>
            {!isCallActive ? (
              <button onClick={() => setIsCallActive(true)}
                className="px-6 py-3 rounded-full bg-green-600 text-white font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
                <Phone className="h-5 w-5" />Start Call
              </button>
            ) : (
              <button onClick={() => setIsCallActive(false)}
                className="px-6 py-3 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
                <PhoneOff className="h-5 w-5" />End Call
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Chat</h3>
            <div className="h-32 bg-gray-50 rounded-lg border border-gray-200 p-3 flex items-center justify-center">
              <p className="text-xs text-gray-400">Chat messages will appear here</p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input type="text" placeholder="Type a message..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20" />
              <button className="px-4 py-2 bg-[#0A75BB] text-white rounded-lg text-sm font-medium hover:bg-[#085a94] transition-colors">Send</button>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80 shrink-0 space-y-4">
          {isCallActive && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Patient Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium text-gray-900">{selectedPatient.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="text-gray-700">{selectedPatient.type}</span></div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-[#0A75BB]" />Waiting Room
            </h3>
            <div className="space-y-2">
              {filteredWaitingRoom.map((p) => (
                <button key={p.id} onClick={() => setSelectedPatient(p)}
                  className={cn('w-full text-left p-3 rounded-xl border transition-all',
                    selectedPatient.id === p.id ? 'border-[#0A75BB] bg-[#0A75BB]/5' : 'border-gray-100 hover:bg-gray-50')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0A75BB]/10 flex items-center justify-center">
                        <span className="text-xs font-semibold text-[#0A75BB]">{p.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.type}</p>
                      </div>
                    </div>
                    {p.waitTime > 0 && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />{p.waitTime}m
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
