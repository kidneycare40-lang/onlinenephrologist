'use client';

import { useState, useEffect } from 'react';
import { Stethoscope, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface Consultation {
  id: string;
  consultation_date: string;
  status: string;
  chief_complaint: string | null;
  hpi: string | null;
  examination: string | null;
  notes: string | null;
  follow_up_date: string | null;
  follow_up_instructions: string | null;
  doctor_name: string;
  clinic_name: string;
  diagnoses: { diagnosis: string; type: string | null }[];
}

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/patient-auth/consultations')
      .then(r => r.json())
      .then(d => { setConsultations(d.consultations || []); setLoading(false); })
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
      <h1 className="text-2xl font-bold text-gray-900">My Consultations</h1>

      {consultations.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
          <Stethoscope className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No consultations recorded yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {consultations.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                className="w-full p-5 text-left flex items-center gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Stethoscope className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{c.clinic_name || 'Consultation'}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {c.consultation_date}
                    </span>
                    <span>{c.doctor_name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      c.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      c.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                </div>
                {expandedId === c.id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </button>

              {expandedId === c.id && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                  {c.chief_complaint && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Chief Complaint</h4>
                      <p className="text-sm text-gray-900">{c.chief_complaint}</p>
                    </div>
                  )}
                  {c.diagnoses.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Diagnosis</h4>
                      <div className="space-y-1">
                        {c.diagnoses.map((d, i) => (
                          <span key={i} className="inline-block text-sm text-gray-700 bg-gray-50 rounded px-2 py-1 mr-1 mb-1">
                            {d.diagnosis}
                            {d.type && <span className="text-xs text-gray-400 ml-1">({d.type})</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {c.examination && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Examination</h4>
                      <p className="text-sm text-gray-700">{c.examination}</p>
                    </div>
                  )}
                  {c.notes && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Clinical Notes</h4>
                      <p className="text-sm text-gray-700">{c.notes}</p>
                    </div>
                  )}
                  {c.follow_up_date && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-blue-700">
                        Follow-up: <strong>{new Date(c.follow_up_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                      </p>
                      {c.follow_up_instructions && (
                        <p className="text-xs text-blue-600 mt-1">{c.follow_up_instructions}</p>
                      )}
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
