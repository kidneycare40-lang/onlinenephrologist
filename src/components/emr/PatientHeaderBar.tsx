'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { User, Phone, Plus, Tag, X, AlertTriangle, Pencil } from 'lucide-react';

interface PatientHeaderBarProps {
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  uhid: string;
  phone: string;
  allergies?: string[];
  patientId?: string;
}

export default function PatientHeaderBar({
  firstName,
  lastName,
  age,
  gender,
  uhid,
  phone,
  allergies = [],
  patientId,
}: PatientHeaderBarProps) {
  const router = useRouter();
  const [showAlerts, setShowAlerts] = useState(false);
  const [showTag, setShowTag] = useState(false);
  const [patientTags, setPatientTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag.trim() && !patientTags.includes(newTag.trim())) {
      setPatientTags([...patientTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setPatientTags(patientTags.filter((t) => t !== tag));
  };

  return (
    <div className="bg-white border-b border-slate-200 px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between sticky top-14 lg:top-0 z-30 no-print">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-[#0A75BB] flex items-center justify-center text-white flex-shrink-0">
          <User className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 truncate">{firstName} {lastName}</h2>
            <span className="text-[10px] sm:text-xs text-slate-500 shrink-0">({age}, {gender})</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-slate-500">
            <span className="truncate">{uhid}</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">{phone}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Alerts button */}
        {allergies.length > 0 && (
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="flex items-center gap-1 px-2 py-1.5 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors touch-target"
          >
            <AlertTriangle className="h-3 w-3 text-red-500" />
            <span className="text-[10px] sm:text-[11px] font-semibold text-red-600 hidden sm:inline">
              {allergies.length} Alert{allergies.length > 1 ? 's' : ''}
            </span>
            <span className="text-[10px] font-semibold text-red-600 sm:hidden">
              {allergies.length}
            </span>
          </button>
        )}

        {/* Tag button */}
        <div className="relative">
          <button
            onClick={() => setShowTag(!showTag)}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors touch-target"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tag</span>
          </button>

          {showTag && (
            <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-[55] overflow-hidden">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-600">Patient Tags</p>
                <button onClick={() => setShowTag(false)} className="p-1.5 hover:bg-slate-100 rounded-lg" aria-label="Close tags">
                  <X className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </div>
              <div className="p-2">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addTag(); }}
                    placeholder="Add tag..."
                    className="flex-1 px-2.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0A75BB]"
                  />
                  <button onClick={addTag} disabled={!newTag.trim()}
                    className="px-3 py-2 text-xs font-medium text-white bg-[#0A75BB] rounded-lg hover:bg-[#085a94] disabled:opacity-50">
                    Add
                  </button>
                </div>
                {patientTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {patientTags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="p-0.5 hover:text-red-500 rounded" aria-label={`Remove tag ${tag}`}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {patientTags.length === 0 && (
                  <p className="text-[10px] text-slate-400 text-center mt-2">No tags added yet</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Call button */}
        <a
          href={`tel:${phone}`}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-[#0A75BB]/10 text-[#0A75BB] rounded-lg text-xs font-medium hover:bg-[#0A75BB]/20 transition-colors touch-target"
        >
          <Phone className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Call</span>
        </a>

        {/* Edit patient button */}
        {patientId && (
          <button
            onClick={() => router.push(`/emr/patients/${patientId}`)}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors touch-target"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>
        )}
      </div>

      {/* Alerts popup */}
      {showAlerts && allergies.length > 0 && (
        <div className="fixed top-20 right-4 z-[55] w-[calc(100vw-32px)] sm:w-72 bg-white border border-red-200 rounded-xl shadow-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-red-100 bg-red-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <p className="text-xs font-semibold text-red-700">Patient Alerts</p>
            </div>
            <button onClick={() => setShowAlerts(false)} className="p-1.5 hover:bg-red-100 rounded-lg" aria-label="Close alerts">
              <X className="h-3.5 w-3.5 text-red-400" />
            </button>
          </div>
          <div className="p-3 space-y-1.5">
            {allergies.map((a, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5 bg-red-50 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span className="text-xs font-medium text-red-700">{a}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
