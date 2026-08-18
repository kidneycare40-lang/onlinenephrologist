'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink, Calendar, User } from 'lucide-react';

interface Report {
  id: string;
  title: string;
  category: string | null;
  file_url: string;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  report_date: string | null;
  notes: string | null;
  uploaded_by_name: string | null;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/patient-auth/reports')
      .then(r => r.json())
      .then(d => { setReports(d.reports || []); setLoading(false); })
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
      <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>

      {reports.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No reports uploaded yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {reports.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{r.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                    {r.report_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {r.report_date}
                      </span>
                    )}
                    {r.category && (
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-medium">{r.category}</span>
                    )}
                  </div>
                  {r.uploaded_by_name && (
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <User className="h-3 w-3" /> {r.uploaded_by_name}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <a
                    href={r.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0A75BB] transition-colors"
                    title="Open"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <a
                    href={r.file_url}
                    download={r.file_name || r.title}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0A75BB] transition-colors"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </div>
              {r.notes && <p className="text-xs text-gray-400 mt-2 ml-13">{r.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
