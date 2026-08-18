'use client';

import { useState, useEffect } from 'react';
import { ClipboardList, Pill, TestTube, ChevronDown, ChevronUp } from 'lucide-react';

interface Prescription {
  id: string;
  prescription_number: string;
  prescription_date: string;
  status: string;
  diagnosis: string | null;
  advice: string | null;
  notes: string | null;
  follow_up_date: string | null;
  doctor_name: string;
  clinic_name: string;
  medicines: {
    medicine_name: string;
    dosage: string | null;
    dosage_pattern: string | null;
    frequency: string | null;
    duration: string | null;
    instructions: string | null;
  }[];
  investigations: {
    test_name: string;
    category: string | null;
    notes: string | null;
  }[];
}

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/patient-auth/prescriptions')
      .then(r => r.json())
      .then(d => { setPrescriptions(d.prescriptions || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 border-[#0A75BB] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Prescriptions</h1>

      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
          <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No prescriptions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                className="w-full p-5 text-left flex items-center gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                  <Pill className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{p.prescription_number}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.status === 'Active' ? 'bg-green-100 text-green-700' :
                      p.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {p.prescription_date} · {p.doctor_name} · {p.medicines.length} medicine{p.medicines.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {expandedId === p.id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </button>

              {expandedId === p.id && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                  {p.diagnosis && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Diagnosis</h4>
                      <p className="text-sm text-gray-900">{p.diagnosis}</p>
                    </div>
                  )}

                  {p.medicines.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Medicines</h4>
                      <div className="space-y-2">
                        {p.medicines.map((m, i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm font-medium text-gray-900">{m.medicine_name}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                              {m.dosage && <span>Dosage: {m.dosage}</span>}
                              {m.frequency && <span>Frequency: {m.frequency}</span>}
                              {m.duration && <span>Duration: {m.duration}</span>}
                            </div>
                            {m.instructions && <p className="text-xs text-gray-400 mt-1">{m.instructions}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {p.investigations.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Investigations</h4>
                      <div className="space-y-1">
                        {p.investigations.map((inv, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                            <TestTube className="h-3.5 w-3.5 text-gray-400" />
                            {inv.test_name}
                            {inv.notes && <span className="text-xs text-gray-400">— {inv.notes}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {p.advice && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Doctor&apos;s Advice</h4>
                      <p className="text-sm text-gray-700">{p.advice}</p>
                    </div>
                  )}

                  {p.follow_up_date && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-700">
                        Follow-up recommended: <strong>{new Date(p.follow_up_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
