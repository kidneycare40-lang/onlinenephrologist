'use client';

import React from 'react';
import { cn } from '@/lib/utils';

import type { Vitals } from '@/types/emr';

interface VitalsSectionProps {
  vitals: Vitals;
  onChange: (field: keyof Vitals, value: string) => void;
}

const vitalFields = [
  { label: 'BP', field: 'bloodPressure' as const, unit: 'mmHg', placeholder: '__/__' },
  { label: 'Pulse', field: 'heartRate' as const, unit: 'bpm', placeholder: '0' },
  { label: 'Height', field: 'height' as const, unit: 'cm', placeholder: '0' },
  { label: 'Weight', field: 'weight' as const, unit: 'kg', placeholder: '0' },
  { label: 'Temperature', field: 'temperature' as const, unit: 'F', placeholder: '0.0' },
  { label: 'BMI', field: 'bmi' as const, unit: 'Kg/m2', placeholder: '0.0', readOnly: true },
  { label: 'SpO2', field: 'spo2' as const, unit: '%', placeholder: '0' },
  { label: 'Sugar', field: 'bloodSugar' as const, unit: 'mg/dL', placeholder: '0' },
];

export default function VitalsSection({ vitals, onChange }: VitalsSectionProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg" id="section-vitals">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700">Vitals</h3>

      </div>
      <div className="p-3">
        <div className="flex flex-wrap gap-x-4 gap-y-3">
          {vitalFields.map(({ label, field, unit, placeholder, readOnly }) => (
            <div key={field} className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{label}:</span>
              <input
                type="text"
                value={vitals[field] || ''}
                onChange={(e) => onChange(field, e.target.value)}
                readOnly={readOnly}
                className={cn(
                  'w-20 px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#0A75BB] focus:border-[#0A75BB] text-center',
                  readOnly && 'bg-slate-50 text-slate-600'
                )}
                placeholder={placeholder}
              />
              <span className="text-[10px] text-slate-400 whitespace-nowrap">{unit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
