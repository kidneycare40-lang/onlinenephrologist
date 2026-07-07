'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowUp } from 'lucide-react';
import type { EMRConsultation } from '@/types/emr';

interface PastVisitsTimelineProps {
  currentConsultationId: string;
  consultations: EMRConsultation[];
}

export default function PastVisitsTimeline({
  currentConsultationId,
  consultations,
}: PastVisitsTimelineProps) {
  const pastConsultations = consultations
    .filter((c) => c.id !== currentConsultationId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatShortDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg" id="section-past-visits">
      <div className="px-3 py-2 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700">Past Visits</h3>
      </div>
      <div className="p-3">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-slate-200" />

          {/* Today marker */}
          <div className="relative flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center z-10 flex-shrink-0">
              <ArrowUp className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 pt-1">
              <span className="text-xs font-bold text-emerald-600">Today</span>
            </div>
          </div>

          {pastConsultations.map((consult) => {
            return (
              <div key={consult.id} className="relative flex items-start gap-3 mb-4">
                {/* Timeline dot */}
                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center z-10 flex-shrink-0">
                  <span className="text-[10px] font-bold text-slate-600">
                    {formatShortDate(consult.date)}
                  </span>
                </div>

                {/* Visit content */}
                <div className="flex-1 border border-slate-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-semibold text-slate-700">
                        {formatDate(consult.date)}
                      </span>
                      <span className="text-xs text-slate-500 ml-2">By: {consult.doctorName}</span>
                    </div>

                  </div>

                  <div className="p-3 space-y-2">
                    {/* Chief Complaint */}
                    {consult.chiefComplaint && (
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Chief Complaint: </span>
                        <span className="text-xs text-slate-700">{consult.chiefComplaint}</span>
                      </div>
                    )}

                    {/* Diagnosis */}
                    <div>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">Diagnosis: </span>
                      <span className="text-xs text-slate-700">
                        {consult.diagnoses.map((d) => d.name).join(', ') || 'N/A'}
                      </span>
                    </div>

                    {/* Rx - from consultation.prescriptions (inline) */}
                    {consult.prescriptions.length > 0 && (
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Rx: </span>
                        <div className="mt-1">
                          <table className="w-full text-[10px]">
                            <thead>
                              <tr className="text-slate-500">
                                <th className="text-left font-medium py-0.5">Medicine</th>
                                <th className="text-left font-medium py-0.5">Dosage</th>
                                <th className="text-left font-medium py-0.5">Freq</th>
                                <th className="text-left font-medium py-0.5">Duration</th>
                              </tr>
                            </thead>
                            <tbody>
                              {consult.prescriptions.map((med, i) => (
                                <tr key={i} className="text-slate-600">
                                  <td className="py-0.5">{med.name}</td>
                                  <td className="py-0.5">{med.dosage}</td>
                                  <td className="py-0.5">{med.frequency}</td>
                                  <td className="py-0.5">{med.duration}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Advice */}
                    {consult.advice && (
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Advice: </span>
                        <span className="text-xs text-slate-700">{consult.advice}</span>
                      </div>
                    )}

                    {/* Investigations */}
                    {consult.investigations.length > 0 && (
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Investigations: </span>
                        <span className="text-xs text-slate-600">
                          {consult.investigations.map((i) => i.testName).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {pastConsultations.length === 0 && (
            <p className="text-xs text-slate-400 italic ml-12">No past visits</p>
          )}
        </div>
      </div>
    </div>
  );
}
