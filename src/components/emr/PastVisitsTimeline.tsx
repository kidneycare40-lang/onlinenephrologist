'use client';

import React from 'react';
import { ArrowUp, Printer, Mail } from 'lucide-react';
import type { EMRConsultation } from '@/types/emr';

interface PastVisitsTimelineProps {
  currentConsultationId: string;
  consultations: EMRConsultation[];
}

const referenceRanges: Record<string, { min: number; max: number; unit: string }> = {
  'Serum Creatinine': { min: 0.6, max: 1.2, unit: 'mg/dL' },
  'Haemoglobin': { min: 12, max: 17, unit: 'g/dL' },
  'Serum Potassium': { min: 3.5, max: 5.0, unit: 'mEq/L' },
  'Blood Urea': { min: 7, max: 20, unit: 'mg/dL' },
  'Serum Sodium': { min: 136, max: 145, unit: 'mEq/L' },
  'Uric Acid': { min: 3.5, max: 7.2, unit: 'mg/dL' },
  'Calcium': { min: 8.5, max: 10.5, unit: 'mg/dL' },
  'Phosphorus': { min: 2.5, max: 4.5, unit: 'mg/dL' },
  'HbA1c': { min: 4.0, max: 5.6, unit: '%' },
  'Fasting Sugar': { min: 70, max: 100, unit: 'mg/dL' },
  'Post Prandial Sugar': { min: 70, max: 140, unit: 'mg/dL' },
  'Albumin': { min: 3.5, max: 5.0, unit: 'g/dL' },
  'Protein Total': { min: 6.0, max: 8.3, unit: 'g/dL' },
  'Cholesterol': { min: 0, max: 200, unit: 'mg/dL' },
  'Triglycerides': { min: 0, max: 150, unit: 'mg/dL' },
  'HDL': { min: 40, max: 60, unit: 'mg/dL' },
  'LDL': { min: 0, max: 100, unit: 'mg/dL' },
  'Spot Albumin Creatinine Ratio': { min: 0, max: 30, unit: 'mg/g' },
  'eGFR': { min: 60, max: 120, unit: 'mL/min' },
};

function isAbnormal(testName: string, value: string): boolean {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  const range = referenceRanges[testName];
  if (!range) return false;
  return num < range.min || num > range.max;
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

  const collectInvestigationDates = (consult: EMRConsultation): string[] => {
    const dates = new Set<string>();
    consult.investigations.forEach((inv) => {
      if (inv.date) dates.add(inv.date);
    });
    return Array.from(dates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  };

  const getInvestigationValues = (consult: EMRConsultation, testName: string, dates: string[]) => {
    return dates.map((date) => {
      const inv = consult.investigations.find(
        (i) => i.testName === testName && i.date === date
      );
      return inv?.result || '';
    });
  };

  const getInvestigationUnit = (consult: EMRConsultation, testName: string): string => {
    const inv = consult.investigations.find((i) => i.testName === testName);
    return inv?.unit || referenceRanges[testName]?.unit || '';
  };

  const uniqueTestNames = (consult: EMRConsultation): string[] => {
    return Array.from(new Set(consult.investigations.map((i) => i.testName)));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg" id="section-past-visits">
      <div className="px-3 py-2 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700">Past Visits</h3>
      </div>
      <div className="p-3">
        <div className="relative">
          <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-slate-200" />

          <div className="relative flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center z-10 flex-shrink-0">
              <ArrowUp className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 pt-1">
              <span className="text-xs font-bold text-emerald-600">Today</span>
            </div>
          </div>

          {pastConsultations.map((consult) => {
            const invDates = collectInvestigationDates(consult);
            const testNames = uniqueTestNames(consult);

            return (
              <div key={consult.id} className="relative flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center z-10 flex-shrink-0">
                  <span className="text-[10px] font-bold text-slate-600">
                    {formatShortDate(consult.date)}
                  </span>
                </div>

                <div className="flex-1 border border-slate-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-semibold text-slate-700">
                        {formatDate(consult.date)}
                      </span>
                      <span className="text-xs text-slate-500 ml-2">By: {consult.doctorName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors" title="Print">
                        <Printer className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors" title="Email">
                        <Mail className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 space-y-3">
                    {consult.chiefComplaint && (
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Chief Complaint: </span>
                        <span className="text-xs text-slate-700">{consult.chiefComplaint}</span>
                      </div>
                    )}

                    {consult.diagnoses.length > 0 && (
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">Diagnosis:</span>
                        <table className="w-full text-[10px] border border-slate-200 rounded overflow-hidden">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500">
                              <th className="text-left font-medium px-2 py-1">#</th>
                              <th className="text-left font-medium px-2 py-1">Diagnosis</th>
                              <th className="text-left font-medium px-2 py-1">Duration</th>
                            </tr>
                          </thead>
                          <tbody>
                            {consult.diagnoses.map((d, i) => (
                              <tr key={d.id} className="border-t border-slate-100 text-slate-700">
                                <td className="px-2 py-1">{i + 1}</td>
                                <td className="px-2 py-1 font-medium">
                                  {d.name}
                                  {d.isPrimary && <span className="ml-1 text-[8px] bg-blue-100 text-blue-700 px-1 rounded font-bold">P</span>}
                                </td>
                                <td className="px-2 py-1 text-slate-500">{d.duration || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {consult.prescriptions.length > 0 && (
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">Rx:</span>
                        <table className="w-full text-[10px] border border-slate-200 rounded overflow-hidden">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500">
                              <th className="text-left font-medium px-2 py-1">#</th>
                              <th className="text-left font-medium px-2 py-1">Medicine</th>
                              <th className="text-left font-medium px-2 py-1">Dosage</th>
                              <th className="text-left font-medium px-2 py-1">When</th>
                              <th className="text-left font-medium px-2 py-1">Frequency</th>
                              <th className="text-left font-medium px-2 py-1">Duration</th>
                              <th className="text-left font-medium px-2 py-1">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {consult.prescriptions.map((med, i) => (
                              <tr key={med.id} className="border-t border-slate-100 text-slate-700">
                                <td className="px-2 py-1">{i + 1}</td>
                                <td className="px-2 py-1 font-medium">
                                  {med.name}
                                  {med.strength && <span className="block text-[9px] text-slate-400">{med.strength}</span>}
                                </td>
                                <td className="px-2 py-1">{med.dosage}</td>
                                <td className="px-2 py-1">{med.when || '-'}</td>
                                <td className="px-2 py-1">{med.frequency}</td>
                                <td className="px-2 py-1">{med.duration}</td>
                                <td className="px-2 py-1 text-slate-500">{med.instructions || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {consult.advice && (
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">Advice:</span>
                        <div className="text-xs text-slate-700 whitespace-pre-line bg-slate-50 rounded p-2 border border-slate-100">
                          {consult.advice}
                        </div>
                      </div>
                    )}

                    {testNames.length > 0 && invDates.length > 0 && (
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">Investigations:</span>
                        <div className="overflow-x-auto">
                          <table className="w-full text-[10px] border border-slate-200 rounded overflow-hidden">
                            <thead>
                              <tr className="bg-slate-50 text-slate-500">
                                <th className="text-left font-medium px-2 py-1">#</th>
                                <th className="text-left font-medium px-2 py-1">Tests/Investigations</th>
                                <th className="text-left font-medium px-2 py-1">Units</th>
                                {invDates.map((date) => (
                                  <th key={date} className="text-right font-medium px-2 py-1">
                                    {new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {testNames.map((testName, idx) => {
                                const values = getInvestigationValues(consult, testName, invDates);
                                const unit = getInvestigationUnit(consult, testName);
                                return (
                                  <tr key={testName} className="border-t border-slate-100 text-slate-700">
                                    <td className="px-2 py-1">{idx + 1}</td>
                                    <td className="px-2 py-1 font-medium">{testName}</td>
                                    <td className="px-2 py-1 text-slate-500">{unit}</td>
                                    {values.map((val, vi) => (
                                      <td key={vi} className={`px-2 py-1 text-right font-medium ${val && isAbnormal(testName, val) ? 'bg-red-50 text-red-700 font-bold' : ''}`}>
                                        {val || '-'}
                                      </td>
                                    ))}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {testNames.length > 0 && invDates.length === 0 && (
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">Investigations: </span>
                        <span className="text-xs text-slate-600">
                          {testNames.join(', ')}
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
