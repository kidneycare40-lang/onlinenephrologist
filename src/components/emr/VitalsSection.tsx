'use client';

import React from 'react';
import { cn } from '@/lib/utils';

import type { Vitals } from '@/types/emr';

interface VitalsSectionProps {
  vitals: Vitals;
  onChange: (field: keyof Vitals, value: string) => void;
  patientAge?: number;
  patientGender?: string;
}

function calculateEGFR(creatinine: string, age: number, gender: string): string {
  const scr = parseFloat(creatinine);
  if (!scr || scr <= 0 || !age || age <= 0) return '';

  const isFemale = gender?.toLowerCase() === 'female';
  const kappa = isFemale ? 0.7 : 0.9;
  const alpha = isFemale ? -0.241 : -0.302;
  const sexFactor = isFemale ? 0.963 : 1.0;

  const scrOverKappa = scr / kappa;
  const minVal = Math.min(scrOverKappa, 1);
  const maxVal = Math.max(scrOverKappa, 1);

  const egfr = 142 * Math.pow(minVal, alpha) * Math.pow(maxVal, -1.200) * Math.pow(sexFactor, age) * Math.pow(0.9938, age);

  if (egfr >= 90) return Math.round(egfr).toString();
  if (egfr >= 10) return egfr.toFixed(1);
  return egfr.toFixed(1);
}

const basicFields = [
  { label: 'BP', field: 'bloodPressure' as const, unit: 'mmHg', placeholder: '__/__' },
  { label: 'Pulse', field: 'heartRate' as const, unit: 'bpm', placeholder: '0' },
  { label: 'Height', field: 'height' as const, unit: 'cm', placeholder: '0' },
  { label: 'Weight', field: 'weight' as const, unit: 'kg', placeholder: '0' },
  { label: 'Temperature', field: 'temperature' as const, unit: 'F', placeholder: '0.0' },
  { label: 'BMI', field: 'bmi' as const, unit: 'Kg/m2', placeholder: '0.0', readOnly: true },
  { label: 'SpO2', field: 'spo2' as const, unit: '%', placeholder: '0' },
  { label: 'Sugar', field: 'bloodSugar' as const, unit: 'mg/dL', placeholder: '0' },
];

export default function VitalsSection({ vitals, onChange, patientAge, patientGender }: VitalsSectionProps) {
  const egfrValue = calculateEGFR(vitals.creatinine || '', patientAge || 0, patientGender || '');

  return (
    <div className="bg-white border border-slate-200 rounded-lg" id="section-vitals">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700">Vitals</h3>
      </div>
      <div className="p-3">
        <div className="flex flex-wrap gap-x-4 gap-y-3">
          {basicFields.map(({ label, field, unit, placeholder, readOnly }) => (
            <div key={field} className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{label}:</span>
              <input
                type="text"
                value={vitals[field] || ''}
                onChange={(e) => onChange(field, e.target.value)}
                readOnly={readOnly}
                className={cn(
                  'w-24 px-2 h-11 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#0A75BB] focus:border-[#0A75BB] text-center',
                  readOnly && 'bg-slate-50 text-slate-600'
                )}
                placeholder={placeholder}
              />
              <span className="text-[11px] text-slate-400 whitespace-nowrap">{unit}</span>
            </div>
          ))}

          {/* Creatinine input */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Creatinine:</span>
            <input
              type="text"
              value={vitals.creatinine || ''}
              onChange={(e) => {
                const val = e.target.value;
                const egfr = calculateEGFR(val, patientAge || 0, patientGender || '');
                onChange('creatinine', val);
                onChange('egfr', egfr);
              }}
              className="w-24 px-2 h-11 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#0A75BB] focus:border-[#0A75BB] text-center"
              placeholder="0.0"
            />
            <span className="text-[11px] text-slate-400 whitespace-nowrap">mg/dL</span>
          </div>

          {/* eGFR auto-calculated */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">eGFR:</span>
            <input
              type="text"
              value={egfrValue || vitals.egfr || ''}
              readOnly
              className={cn(
                'w-24 px-2 h-11 text-sm border border-slate-200 rounded text-center',
                egfrValue ? 'bg-slate-50 text-slate-700 font-semibold' : 'bg-slate-50 text-slate-400'
              )}
              placeholder="Auto"
            />
            <span className="text-[11px] text-slate-400 whitespace-nowrap">mL/min</span>
          </div>
        </div>
      </div>
    </div>
  );
}
