'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Calendar, ChevronLeft, ChevronRight, Phone, Stethoscope,
  Bell, Trash2, RefreshCw, Users, Activity, Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClinic } from '@/lib/emr-clinic-context';
import { patientsApi, ApiError } from '@/lib/api-client';

function calculateAge(dob: string): number {
  if (!dob) return 0;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatDateShort(dateStr: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const ITEMS_PER_PAGE = 15;

export default function PatientListPage() {
  const router = useRouter();
  const { clinicId } = useClinic();
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [clinicFilter, setClinicFilter] = useState<string>(clinicId || 'all');

  // API state
  const [allPatients, setAllPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchDebounced, setSearchDebounced] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (clinicId) setClinicFilter(clinicId);
  }, [clinicId]);

  // Fetch patients from API
  const refreshPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (clinicFilter && clinicFilter !== 'all') params.clinicId = clinicFilter;
      if (searchDebounced) params.search = searchDebounced;
      if (fromDate) params.dateFrom = fromDate;
      if (toDate) params.dateTo = toDate;

      const result = await patientsApi.list(params);
      setAllPatients(result.data || []);
    } catch (err: any) {
      setError(err.message);
      // Fallback: try loading from localStorage
      try {
        const dynamicPatients: any[] = [];
        const added = JSON.parse(localStorage.getItem('emr_added_patients') || '[]');
        if (Array.isArray(added)) {
          const filtered = clinicFilter && clinicFilter !== 'all'
            ? added.filter((p: any) => !p.clinicId || p.clinicId === clinicFilter)
            : added;
          dynamicPatients.push(...filtered);
        }
        const consultations = JSON.parse(localStorage.getItem('emr_consultations') || '[]');
        if (Array.isArray(consultations)) {
          for (const c of consultations) {
            if (clinicFilter && clinicFilter !== 'all' && c.clinicId && c.clinicId !== clinicFilter) continue;
            if (c.patient && c.patient.id && !dynamicPatients.some((p: any) => p.id === c.patient.id)) {
              dynamicPatients.push(c.patient);
            }
          }
        }
        setAllPatients(dynamicPatients);
      } catch {
        setAllPatients([]);
      }
    } finally {
      setLoading(false);
    }
  }, [clinicFilter, searchDebounced, fromDate, toDate]);

  useEffect(() => { refreshPatients(); }, [refreshPatients]);

  const filtered = useMemo(() => {
    let result = [...allPatients];

    // Client-side date filtering (API may not filter dates yet)
    if (fromDate) {
      result = result.filter((p: any) => {
        const visitDate = p.last_visit_date || p.lastVisit;
        return visitDate && visitDate >= fromDate;
      });
    }
    if (toDate) {
      result = result.filter((p: any) => {
        const visitDate = p.last_visit_date || p.lastVisit;
        return visitDate && visitDate <= toDate;
      });
    }

    result.sort((a: any, b: any) => {
      const aDate = a.last_visit_date || a.lastVisit || '';
      const bDate = b.last_visit_date || b.lastVisit || '';
      if (!aDate) return 1;
      if (!bDate) return -1;
      return bDate.localeCompare(aDate);
    });

    return result;
  }, [allPatients, fromDate, toDate]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const stats = useMemo(() => ({
    total: allPatients.length,
    chronic: allPatients.filter((p: any) => p.is_chronic || p.isChronic).length,
    active: allPatients.filter((p: any) => p.is_active !== false).length,
    thisMonth: allPatients.filter((p: any) => {
      const d = p.last_visit_date || p.lastVisit;
      if (!d) return false;
      const date = new Date(d);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
  }), [allPatients]);

  const boardUpdates = useMemo(() => {
    const updates: { id: number; text: string; time: string }[] = [];
    const now = new Date();
    const recent = allPatients.filter((p: any) => {
      const d = p.last_visit_date || p.lastVisit;
      if (!d) return false;
      const diff = now.getTime() - new Date(d).getTime();
      return diff < 7 * 24 * 60 * 60 * 1000;
    });
    if (recent.length > 0) {
      updates.push({ id: 1, text: `${recent.length} patients visited this week`, time: 'This week' });
    }
    const chronicCount = allPatients.filter((p: any) => p.is_chronic || p.isChronic).length;
    if (chronicCount > 0) {
      updates.push({ id: 2, text: `${chronicCount} chronic patients under follow-up`, time: 'Active' });
    }
    updates.push({ id: 3, text: `Total ${allPatients.length} patients registered`, time: 'All time' });
    return updates;
  }, [allPatients]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await patientsApi.delete(deleteTarget.id);
      setAllPatients((prev) => prev.filter((p: any) => p.id !== deleteTarget.id));
    } catch {
      // Fallback: mark in localStorage
      try {
        const deleted = JSON.parse(localStorage.getItem('emr_deleted_patients') || '[]');
        deleted.push(deleteTarget.id);
        localStorage.setItem('emr_deleted_patients', JSON.stringify(deleted));
        setAllPatients((prev) => prev.filter((p: any) => p.id !== deleteTarget.id));
      } catch {}
    }
    setDeleteTarget(null);
  };

  const handleClinicFilterChange = (val: string) => {
    setClinicFilter(val);
    setCurrentPage(1);
  };

  const getPatientName = (p: any) => `${p.first_name || p.firstName || ''} ${p.last_name || p.lastName || ''}`.trim();
  const getPatientAge = (p: any) => {
    const dob = p.date_of_birth || p.dateOfBirth;
    return dob ? calculateAge(dob) : '?';
  };
  const getPatientGender = (p: any) => (p.gender || '?')[0];
  const getPatientPhone = (p: any) => p.phone || '';
  const getPatientUHID = (p: any) => p.uhid || '';
  const getPatientVisitDate = (p: any) => p.last_visit_date || p.lastVisit || '';
  const getPatientClinic = (p: any) => p.clinicId || p.primary_clinic_id || '';
  const getPatientChronic = (p: any) => p.is_chronic || p.isChronic || false;

  return (
    <div className="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Patients</h1>
          <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">{filtered.length}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Clinic Filter */}
          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm">
            <Filter className="h-3.5 w-3.5 text-gray-400" />
            <select value={clinicFilter} onChange={(e) => handleClinicFilterChange(e.target.value)}
              className="text-xs text-gray-700 focus:outline-none bg-transparent">
              <option value="all">All Clinics</option>
              <option value="kcc-faridabad">KCC Faridabad</option>
              <option value="kcc-saket">KCC Saket</option>
              <option value="psri-delhi">PSRI Hospital</option>
              <option value="online">Online</option>
            </select>
          </div>
          {/* Date Range */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
              className="text-xs text-gray-700 focus:outline-none" />
            <span className="text-gray-300">—</span>
            <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
              className="text-xs text-gray-700 focus:outline-none" />
          </div>
          <button onClick={refreshPatients}
            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Refresh">
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
        {/* Patient Table */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Search by name, phone, UHID, or email..."
                value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/20 focus:border-[#0A75BB]" />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Patient</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Phone</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Clinic</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Last Visit</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">{loading ? 'Loading patients...' : 'No patients found'}</p>
                      <p className="text-xs text-gray-400 mt-1">Add patients from consultation or booking</p>
                    </td>
                  </tr>
                ) : (
                  paginated.map((patient: any, idx: number) => (
                    <tr key={patient.id}
                      className={cn('hover:bg-gray-50/60 cursor-pointer transition-colors', idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30')}
                      onClick={() => router.push(`/emr/patients/${patient.id}`)}>
                      <td className="px-4 py-2.5 text-xs font-mono text-gray-500">{getPatientUHID(patient)}</td>
                      <td className="px-4 py-2.5">
                        <span className="text-sm font-medium text-gray-900">{getPatientName(patient)}</span>
                        <span className="text-xs text-gray-500 ml-1.5">
                          ({getPatientAge(patient)}, {getPatientGender(patient)})
                        </span>
                        {getPatientChronic(patient) && (
                          <span className="ml-1.5 px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[11px] font-medium rounded">CKD</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-600 hidden sm:table-cell">{getPatientPhone(patient)}</td>
                      <td className="px-4 py-2.5 hidden md:table-cell">
                        <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-medium',
                          getPatientClinic(patient) === 'kcc-faridabad' && 'bg-blue-50 text-blue-700',
                          getPatientClinic(patient) === 'kcc-saket' && 'bg-amber-50 text-amber-700',
                          getPatientClinic(patient) === 'psri-delhi' && 'bg-purple-50 text-purple-700',
                          getPatientClinic(patient) === 'online' && 'bg-emerald-50 text-emerald-700',
                          !getPatientClinic(patient) && 'bg-gray-50 text-gray-500',
                        )}>
                          {getPatientClinic(patient) === 'kcc-faridabad' ? 'Faridabad' :
                           getPatientClinic(patient) === 'kcc-saket' ? 'Saket' :
                           getPatientClinic(patient) === 'psri-delhi' ? 'PSRI' :
                           getPatientClinic(patient) === 'online' ? 'Online' : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-600">
                        {getPatientVisitDate(patient) ? formatDateShort(getPatientVisitDate(patient)) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => router.push(`/emr/consultation/${patient.id}`)}
                            className="text-xs font-medium text-[#0A75BB] hover:underline inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg">
                            <Stethoscope className="h-3.5 w-3.5" /> Visit Pad
                          </button>
                          <button onClick={() => setDeleteTarget(patient)}
                            className="p-2.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const start = Math.max(1, Math.min(currentPage - 3, totalPages - 6));
                  return start + i;
                }).filter(p => p <= totalPages).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={cn('w-9 h-9 rounded-lg text-xs font-medium transition-colors',
                      currentPage === page ? 'bg-[#0A75BB] text-white' : 'text-gray-600 hover:bg-gray-100')}>
                    {page}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          {/* Board */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#0A75BB]" />
                <h3 className="font-semibold text-gray-900 text-sm">KCC Board</h3>
              </div>
              <span className="w-5 h-5 rounded-full bg-[#0A75BB]/10 text-[#0A75BB] text-[11px] font-bold flex items-center justify-center">
                {boardUpdates.length}
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {boardUpdates.map(update => (
                <div key={update.id} className="px-4 py-3 hover:bg-gray-50/60 transition-colors">
                  <p className="text-sm text-gray-700">{update.text}</p>
                  <p className="text-xs text-gray-400 mt-1">{update.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Stats</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Patients</span>
                <span className="text-sm font-semibold text-gray-900">{stats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Chronic (CKD)</span>
                <span className="text-sm font-semibold text-amber-600">{stats.chronic}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active</span>
                <span className="text-sm font-semibold text-emerald-600">{stats.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="text-sm font-semibold text-primary-600">{stats.thisMonth}</span>
              </div>
            </div>
          </div>

          {/* Clinic Breakdown */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">By Clinic</p>
            <div className="space-y-2">
              {[
                { id: 'kcc-faridabad', label: 'Faridabad', color: 'bg-blue-500' },
                { id: 'kcc-saket', label: 'Saket', color: 'bg-amber-500' },
                { id: 'psri-delhi', label: 'PSRI', color: 'bg-purple-500' },
                { id: 'online', label: 'Online', color: 'bg-emerald-500' },
              ].map(cl => {
                const count = allPatients.filter((p: any) => getPatientClinic(p) === cl.id).length;
                return (
                  <button key={cl.id} onClick={() => handleClinicFilterChange(cl.id)}
                    className={cn('w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                      clinicFilter === cl.id ? 'bg-gray-100' : 'hover:bg-gray-50')}>
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2.5 h-2.5 rounded-full', cl.color)} />
                      <span className="text-gray-700">{cl.label}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Patient?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete <strong>{getPatientName(deleteTarget)}</strong> ({getPatientUHID(deleteTarget)})?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
