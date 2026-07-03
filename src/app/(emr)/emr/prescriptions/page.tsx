'use client';

import { useState, useMemo } from 'react';
import {
  Search, Eye, Printer, MessageCircle, Download, X, Filter,
  FileText, Stethoscope, Pill, Calendar, ChevronDown, Mail,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { prescriptions, doctors } from '@/lib/data/emr-mock';
import type { EMRPrescription } from '@/types/emr';

export default function PrescriptionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [doctorFilter, setDoctorFilter] = useState<string>('All');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedRx, setSelectedRx] = useState<EMRPrescription | null>(null);

  const filtered = useMemo(() => {
    return prescriptions.filter((p) => {
      const matchSearch =
        searchQuery === '' ||
        p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.prescriptionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchDoctor = doctorFilter === 'All' || p.doctorName === doctorFilter;
      const matchDate =
        (!dateRange.from || p.date >= dateRange.from) &&
        (!dateRange.to || p.date <= dateRange.to);
      return matchSearch && matchStatus && matchDoctor && matchDate;
    });
  }, [searchQuery, statusFilter, doctorFilter, dateRange]);

  const statusStyles: Record<string, string> = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Completed: 'bg-gray-100 text-gray-600 border-gray-200',
    Cancelled: 'bg-red-50 text-red-600 border-red-200',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filtered.length} prescription{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#0A75BB] hover:bg-[#085a94] transition-colors">
          <FileText className="h-4 w-4" />
          New Prescription
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient, Rx number, diagnosis..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange((r) => ({ ...r, from: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20"
            />
            <span className="text-gray-400 text-sm">to</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange((r) => ({ ...r, to: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20"
            />
          </div>
          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20"
          >
            <option value="All">All Doctors</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rx #</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Doctor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Diagnosis</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Meds</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((rx) => (
                <tr key={rx.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-mono font-medium text-[#0A75BB]">{rx.prescriptionNumber}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-medium text-gray-900">{rx.patientName}</span>
                    <p className="text-xs text-gray-500">{rx.patientAge}y, {rx.patientGender}</p>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-sm text-gray-600">{rx.doctorName}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className="text-sm text-gray-600">{formatDate(rx.date)}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className="text-sm text-gray-700">{rx.diagnosis}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#0A75BB]/10 text-[#0A75BB] text-xs font-semibold">
                      {rx.medications.length}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border', statusStyles[rx.status])}>
                      {rx.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setSelectedRx(rx)} className="p-1.5 rounded-lg hover:bg-[#0A75BB]/10 text-[#0A75BB] transition-colors" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Print">
                        <Printer className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors" title="WhatsApp">
                        <MessageCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <FileText className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm font-medium">No prescriptions found</p>
          </div>
        )}
      </div>

      {selectedRx && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedRx(null)} />
          <div className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
              <h2 className="text-lg font-semibold text-gray-900">Prescription</h2>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors" title="Print"><Printer className="h-4 w-4" /></button>
                <button className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors" title="WhatsApp"><MessageCircle className="h-4 w-4" /></button>
                <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors" title="Email"><Mail className="h-4 w-4" /></button>
                <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors" title="Download PDF"><Download className="h-4 w-4" /></button>
                <button onClick={() => setSelectedRx(null)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"><X className="h-4 w-4" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="border border-gray-200 rounded-lg">
                <div className="bg-[#0A75BB] text-white p-6 rounded-t-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                      <Stethoscope className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold">Kidney Care Centre</h1>
                      <p className="text-sm text-blue-100">Department of Nephrology</p>
                      <p className="text-xs text-blue-200 mt-0.5">45 Medical Plaza, New Delhi - 110001 &middot; +91 11 4567 8900</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-dashed border-gray-200">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Prescribed By</p>
                      <p className="font-semibold text-gray-900">{selectedRx.doctorName}</p>
                      <p className="text-sm text-gray-500">{selectedRx.doctorQualification}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Prescription No.</p>
                      <p className="font-mono font-semibold text-[#0A75BB]">{selectedRx.prescriptionNumber}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{formatDate(selectedRx.date)}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Patient Details</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Name:</span>
                        <p className="font-medium text-gray-900">{selectedRx.patientName}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Age/Gender:</span>
                        <p className="font-medium text-gray-900">{selectedRx.patientAge}y / {selectedRx.patientGender}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <p className="font-medium text-gray-900">{formatDate(selectedRx.date)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Rx No:</span>
                        <p className="font-medium font-mono text-[#0A75BB]">{selectedRx.prescriptionNumber}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Diagnosis</h3>
                    <p className="text-gray-900 font-medium bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">{selectedRx.diagnosis}</p>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Medications</h3>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-600">#</th>
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-600">Medicine</th>
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-600">Dosage</th>
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-600">When</th>
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-600">Frequency</th>
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-600">Duration</th>
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-600">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedRx.medications.map((med, idx) => (
                            <tr key={idx} className={cn('border-b last:border-b-0', idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50')}>
                              <td className="px-4 py-3 text-gray-400 font-medium">{idx + 1}</td>
                              <td className="px-4 py-3 font-medium text-gray-900">{med.name}</td>
                              <td className="px-4 py-3 text-gray-700">{med.dosage}</td>
                              <td className="px-4 py-3 text-gray-700">{med.frequency.includes('morning') ? 'Morning' : med.frequency.includes('night') || med.frequency.includes('dinner') ? 'Night' : med.frequency.includes('bedtime') ? 'Night' : 'Any'}</td>
                              <td className="px-4 py-3 text-gray-700">{med.frequency}</td>
                              <td className="px-4 py-3 text-gray-700">{med.duration}</td>
                              <td className="px-4 py-3 text-gray-700 text-xs">{med.instructions || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {selectedRx.investigations && selectedRx.investigations.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Investigation Advice</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedRx.investigations.map((inv, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-purple-50 text-purple-700 text-sm rounded-lg border border-purple-200">{inv}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedRx.followUpDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-[#0A75BB]" />
                      <span>Follow-up: <strong>{formatDate(selectedRx.followUpDate)}</strong></span>
                    </div>
                  )}

                  <div className="flex items-end justify-between pt-6 border-t border-gray-200">
                    <div className="w-48">
                      <div className="h-16 border-b border-gray-400 mb-1" />
                      <p className="text-sm font-semibold text-gray-900">{selectedRx.doctorName}</p>
                      <p className="text-xs text-gray-500">{selectedRx.doctorQualification}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Reg. No. MCI-XXXXX</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
