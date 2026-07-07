'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Phone, Mail, Edit, Printer, Stethoscope, Calendar,
  User, Shield, Heart, Users, Clock, FileText, AlertTriangle,
  ChevronDown, ChevronUp, Pill, Beaker, TrendingUp, Activity,
  Upload, Download, CalendarDays, Droplets,
  HeartPulse, Thermometer, Gauge, Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { patients, consultations, prescriptions, labOrders, timelineEvents } from '@/lib/data/emr-mock';
import { useClinic } from '@/lib/emr-clinic-context';
import { EMRPatient, EMRConsultation } from '@/types/emr';
import { deleteAddedPatient, markPatientDeleted } from '@/lib/emr-delete';

type Tab = 'overview' | 'visits' | 'prescriptions' | 'lab' | 'reports' | 'timeline';

const tabs: { label: string; value: Tab; icon: typeof User }[] = [
  { label: 'Overview', value: 'overview', icon: User },
  { label: 'Visits', value: 'visits', icon: CalendarDays },
  { label: 'Prescriptions', value: 'prescriptions', icon: Pill },
  { label: 'Lab', value: 'lab', icon: Beaker },
  { label: 'Reports', value: 'reports', icon: FileText },
  { label: 'Timeline', value: 'timeline', icon: Clock },
];

const avatarColors = [
  'bg-[#0A75BB]', 'bg-emerald-600', 'bg-violet-600',
  'bg-amber-600', 'bg-rose-600', 'bg-cyan-600',
];

function getAvatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateFull(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

const timelineIcons: Record<string, typeof User> = {
  opd_visit: Stethoscope,
  prescription: Pill,
  lab_result: Beaker,
  radiology: FileText,
  dialysis: Activity,
  procedure: HeartPulse,
  admission: CalendarDays,
  discharge: CalendarDays,
  follow_up: Calendar,
};

const timelineColors: Record<string, string> = {
  opd_visit: 'bg-[#0A75BB] text-white',
  prescription: 'bg-emerald-500 text-white',
  lab_result: 'bg-amber-500 text-white',
  radiology: 'bg-violet-500 text-white',
  dialysis: 'bg-cyan-500 text-white',
  procedure: 'bg-rose-500 text-white',
  admission: 'bg-indigo-500 text-white',
  discharge: 'bg-emerald-600 text-white',
  follow_up: 'bg-gray-500 text-white',
};

export default function PatientDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clinicId } = useClinic();
  const patientId = params.id as string;
  const initialTab = (searchParams.get('tab') as Tab) || 'overview';

  const [addedPatients, setAddedPatients] = useState<EMRPatient[]>([]);

  useEffect(() => {
    try {
      setAddedPatients(JSON.parse(localStorage.getItem('emr_added_patients') || '[]'));
    } catch { /* ignore */ }
  }, []);

  const allPatients = useMemo(() => {
    let dynamic: EMRPatient[] = [];
    try {
      dynamic = JSON.parse(localStorage.getItem('emr_added_patients') || '[]');
    } catch { /* ignore */ }
    try {
      const bookings = JSON.parse(localStorage.getItem('emr_bookings') || '[]');
      if (Array.isArray(bookings)) {
        for (const b of bookings) {
          if (b.firstName) {
            const id = 'obp-' + b.bookingId;
            if (!dynamic.some(p => p.id === id) && !patients.some(p => p.id === id)) {
              dynamic.push({
                id, firstName: b.firstName || '', lastName: b.lastName || '',
                phone: b.phone || '', email: b.email || '',
                dateOfBirth: b.age ? `${new Date().getFullYear() - parseInt(b.age)}-01-01` : '',
                gender: b.gender || 'Male',
                bloodGroup: '', uhid: 'OB-' + b.bookingId.slice(-6).toUpperCase(), clinicId: b.clinicId || '',
                abhaNumber: '', address: '', city: '', state: '', pincode: '',
                emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: '',
                allergies: [], medicalHistory: '', isChronic: false, isActive: true,
                source: 'website' as const, createdAt: b.createdAt || '', lastVisit: b.createdAt || '', totalVisits: 1, familyMembers: [],
              });
            }
          }
        }
      }
    } catch { /* ignore */ }
    return [...patients, ...dynamic];
  }, []);

  const patient = useMemo(() => {
    const found = allPatients.find((p) => p.id === patientId) || null;
    // Clinic filter: block access to patients from other clinics (allow empty clinicId)
    if (clinicId && found && found.clinicId && found.clinicId !== clinicId) return null;
    return found;
  }, [patientId, allPatients, clinicId]);

  const clinicConsultations = useMemo(() => {
    if (!patient) return [];
    const mockConsults = consultations.filter((c) => c.patientId === patient.id && (!clinicId || !c.clinicId || c.clinicId === clinicId));
    try {
      const storedConsultations = JSON.parse(localStorage.getItem('emr_consultations') || '[]') as EMRConsultation[];
      const dynamicConsults = storedConsultations.filter((c) => c.patientId === patient.id);
      const allConsults = [...dynamicConsults, ...mockConsults.filter((mc) => !dynamicConsults.some((dc) => dc.id === mc.id))];
      return allConsults.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch {
      return mockConsults;
    }
  }, [patient, clinicId]);
  const clinicPrescriptions = useMemo(() => {
    if (!patient) return [];
    const mockRx = prescriptions.filter((pr) => pr.patientId === patient.id);
    try {
      const storedConsultations = JSON.parse(localStorage.getItem('emr_consultations') || '[]') as EMRConsultation[];
      const patientConsults = storedConsultations.filter((c) => c.patientId === patient.id && c.prescriptions && c.prescriptions.length > 0);
      const dynamicRx = patientConsults
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((c) => ({
          id: c.id,
          prescriptionNumber: 'RX-' + c.id.slice(-6).toUpperCase(),
          patientId: c.patientId,
          patientName: `${patient.firstName} ${patient.lastName}`,
          patientAge: calculateAge(patient.dateOfBirth),
          patientGender: (patient.gender || 'Other') as 'Male' | 'Female' | 'Other',
          consultationId: c.id,
          date: c.date,
          doctorName: c.doctorName || 'Dr. Rajesh Goel',
          doctorQualification: 'MBBS, DNB (Nephrology)',
          diagnosis: c.diagnoses.length > 0 ? c.diagnoses.map((d) => d.name).join(', ') : c.chiefComplaint || 'General',
          medications: c.prescriptions.map((m) => ({
            name: m.name,
            dosage: m.dosage || '',
            frequency: m.frequency || '',
            duration: m.duration || '',
            instructions: m.instructions || '',
          })),
          investigations: c.investigations?.map((inv) => inv.testName) || [],
          instructions: c.advice || '',
          followUpDate: c.followUpDate || '',
          status: c.status === 'COMPLETED' ? ('Active' as const) : ('Active' as const),
          clinicId: c.clinicId || '',
        }));
      const allIds = new Set(dynamicRx.map((r) => r.id));
      return [...dynamicRx, ...mockRx.filter((r) => !allIds.has(r.id))];
    } catch {
      return mockRx;
    }
  }, [patient]);
  const clinicLabOrders = useMemo(() => {
    if (!patient) return [];
    return labOrders.filter((lo) => lo.patientId === patient.id);
  }, [patient]);
  const clinicTimeline = useMemo(() => {
    if (!patient) return [];
    const mockEvents = timelineEvents.filter((te) => te.patientId === patient.id);
    try {
      const storedConsults = JSON.parse(localStorage.getItem('emr_consultations') || '[]') as EMRConsultation[];
      const patientConsults = storedConsults.filter((c) => c.patientId === patient.id);
      const consultEvents = patientConsults.map((c) => ({
        id: `tl-${c.id}`,
        patientId: c.patientId,
        date: c.date,
        time: '',
        type: 'opd_visit' as const,
        title: `Consultation — ${c.diagnoses.length > 0 ? c.diagnoses.map((d) => d.name).join(', ') : c.chiefComplaint || 'Visit'}`,
        description: [
          c.chiefComplaint ? `Chief Complaint: ${c.chiefComplaint}` : '',
          c.prescriptions.length > 0 ? `Medicines: ${c.prescriptions.map((m) => m.name).join(', ')}` : '',
          c.advice ? `Advice: ${c.advice}` : '',
          c.investigations.length > 0 ? `Tests: ${c.investigations.map((i) => i.testName).join(', ')}` : '',
        ].filter(Boolean).join(' | ') || 'No details',
        doctorName: c.doctorName || 'Dr. Rajesh Goel',
        details: c.prescriptions.length > 0 ? c.prescriptions.map((m) => `${m.name} ${m.dosage} ${m.frequency} x ${m.duration}`).join('\n') : '',
        relatedLinks: [] as { label: string; href: string }[],
        clinicId: c.clinicId || '',
      }));
      const allIds = new Set(consultEvents.map((e) => e.id));
      const merged = [...consultEvents, ...mockEvents.filter((e) => !allIds.has(e.id))];
      return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch {
      return mockEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }, [patient]);

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [expandedConsultation, setExpandedConsultation] = useState<string | null>(null);
  const [expandedPrescription, setExpandedPrescription] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeletePatient = () => {
    if (!patient) return;
    const isAdded = addedPatients.some((p) => p.id === patient.id);
    if (isAdded) {
      deleteAddedPatient(patient.id);
    }
    markPatientDeleted(patient.id);
    router.push('/emr/patients');
  };

  const handlePrintPrescription = useCallback(async (rx: typeof clinicPrescriptions[0]) => {
    if (!patient) return;

    const consultation: EMRConsultation = {
      id: rx.consultationId,
      patientId: rx.patientId,
      clinicId: rx.clinicId,
      date: rx.date,
      doctorName: rx.doctorName,
      status: 'COMPLETED',
      chiefComplaint: rx.diagnosis,
      hpi: '',
      examination: '',
      vitals: { bloodPressure: '', pulse: '', temperature: '', spo2: '', weight: '', height: '', bmi: '' },
      diagnoses: rx.diagnosis ? [{ id: 'd1', icdCode: '', name: rx.diagnosis, isPrimary: true }] : [],
      prescriptions: (rx.medications || []).map((m, i) => ({ id: `m${i}`, name: m.name, dosage: m.dosage, frequency: m.frequency, duration: m.duration, route: 'oral', instructions: m.instructions })),
      investigations: (rx.investigations || []).map((inv, i) => ({ id: `inv${i}`, testName: inv })),
      advice: rx.instructions || '',
      notes: '',
      followUpDate: rx.followUpDate || '',
    };

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) { window.alert('Please allow popups'); return; }

    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).map((el) => el.outerHTML).join('\n');
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Prescription - ${patient.firstName}</title>${styles}<style>@media print{body{margin:0;}@page{margin:15mm;}}</style></head><body><div id="rx-root"></div></body></html>`);
    printWindow.document.close();

    const rootEl = printWindow.document.getElementById('rx-root');
    if (!rootEl) return;

    const { default: PrescriptionPrint } = await import('@/components/emr/PrescriptionPrint');
    const { createRoot } = await import('react-dom/client');
    const root = createRoot(rootEl);

    await new Promise<void>((resolve) => {
      root.render(
        <PrescriptionPrint
          patient={patient}
          consultation={consultation}
          consultationDate={new Date(rx.date + 'T00:00:00').toLocaleDateString('en-IN')}
          testRequests={rx.investigations || []}
          clinicId={rx.clinicId || undefined}
        />
      );
      setTimeout(resolve, 800);
    });

    setTimeout(() => { printWindow.print(); }, 500);
  }, [patient]);

  const patientConsultations = clinicConsultations;
  const patientPrescriptions = clinicPrescriptions;
  const patientLabs = clinicLabOrders;
  const patientTimeline = clinicTimeline;

  const latestLabResults = useMemo(() => {
    const sorted = [...patientLabs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted[0]?.results || [];
  }, [patientLabs]);

  const creatinineResult = latestLabResults.find((r) => r.testName === 'Serum Creatinine');
  const egfrResult = latestLabResults.find((r) => r.testName === 'eGFR');

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
          <Users className="h-10 w-10 text-slate-300" />
          <p className="text-slate-600 font-medium">
            Patient not found
          </p>
          <p className="text-slate-400 text-sm">
            This patient may have been deleted or the ID is incorrect.
          </p>
          <button onClick={() => window.history.back()} className="mt-2 px-4 py-2 bg-[#0A75BB] text-white text-sm rounded-lg hover:bg-[#085D94] transition-colors">
            Go to Patients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Print-only header */}
      <div className="hidden print:block print:mb-4">
        <div className="flex items-center gap-3 border-b-2 border-gray-900 pb-2 mb-4">
          <img src="/images/kidney_logo.png" alt="KCC" className="h-10 w-10" />
          <div>
            <p className="text-lg font-bold">KIDNEY CARE CENTRE</p>
            <p className="text-xs">Dr. Rajesh Goel | MBBS, DNB (Nephrology) | Reg. No. DMC/R/00734</p>
          </div>
        </div>
        <h1 className="text-xl font-bold">Patient Record</h1>
      </div>

      {/* Back link */}
      <Link href="/emr/patients" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0A75BB] transition-colors no-print">
        <ArrowLeft className="h-4 w-4" />
        Back to Patients
      </Link>

      {/* Patient Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-[#0A75BB] to-[#0D9488]" />
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0', getAvatarColor(patient.id))}>
              {`${patient.firstName[0]}${patient.lastName[0]}`}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-xl font-bold text-gray-900">{patient.firstName} {patient.lastName}</h1>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-xs font-medium">{patient.uhid}</span>
                  {patient.abhaNumber && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-medium">ABHA: {patient.abhaNumber}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                  {calculateAge(patient.dateOfBirth)} years
                </span>
                <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                  {patient.gender}
                </span>
                {patient.bloodGroup && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs font-medium">
                    <Droplets className="h-3 w-3" />
                    {patient.bloodGroup}
                  </span>
                )}
                {patient.referralDoctor && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                    Referred by: {patient.referralDoctor}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{patient.phone}</span>
                {patient.email && <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{patient.email}</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 flex-shrink-0 no-print">
              <Link
                href={`/emr/consultation/${patient.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-[#0A75BB] text-white rounded-lg text-xs font-medium hover:bg-[#085D94] transition-colors min-h-[44px]"
              >
                <Stethoscope className="h-3.5 w-3.5" />
                New Consultation
              </Link>
              <button
                onClick={() => router.push(`/book-appointment?patientId=${patient.id}`)}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors min-h-[44px]">
                <Calendar className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Book Appointment</span>
                <span className="sm:hidden">Book</span>
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors min-h-[44px]">
                <Printer className="h-3.5 w-3.5" />
                Print
              </button>
              <button
                onClick={() => router.push(`/emr/patients/add?edit=${patient.id}`)}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors min-h-[44px]">
                <Edit className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors min-h-[44px]"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-100">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                  activeTab === tab.value
                    ? 'border-[#0A75BB] text-[#0A75BB]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div className="border border-gray-100 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <User className="h-4 w-4 text-gray-400" />
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Full Name', value: `${patient.firstName} ${patient.lastName}` },
                      { label: 'Date of Birth', value: formatDateFull(patient.dateOfBirth) },
                      { label: 'Age / Gender', value: `${calculateAge(patient.dateOfBirth)} years / ${patient.gender}` },
                      { label: 'Blood Group', value: patient.bloodGroup || 'Not recorded' },
                      { label: 'Phone', value: patient.phone },
                      { label: 'Email', value: patient.email || 'Not provided' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                        <span className="text-xs text-gray-500">{item.label}</span>
                        <span className="text-sm font-medium text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medical Info */}
                <div className="border border-gray-100 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <HeartPulse className="h-4 w-4 text-gray-400" />
                    Medical Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1.5">Allergies</p>
                      {patient.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {patient.allergies.map((a) => (
                            <span key={a} className="px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-100">
                              {a}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">No known allergies</p>
                      )}
                    </div>
                    {patient.medicalHistory && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">History</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{patient.medicalHistory}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Insurance */}
                <div className="border border-gray-100 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <Shield className="h-4 w-4 text-gray-400" />
                    Insurance Information
                  </h3>
                  {patient.insuranceProvider ? (
                    <div className="space-y-3">
                      {[
                        { label: 'Provider', value: patient.insuranceProvider },
                        { label: 'Policy Number', value: patient.insuranceNumber || '—' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                          <span className="text-xs text-gray-500">{item.label}</span>
                          <span className="text-sm font-medium text-gray-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No insurance on file</p>
                  )}
                </div>

                {/* Emergency Contact */}
                <div className="border border-gray-100 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-4 w-4 text-gray-400" />
                    Emergency Contact
                  </h3>
                  {patient.emergencyContactName ? (
                    <div className="space-y-3">
                      {[
                        { label: 'Name', value: patient.emergencyContactName },
                        { label: 'Phone', value: patient.emergencyContactPhone || '—' },
                        { label: 'Relation', value: patient.emergencyContactRelation || '—' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                          <span className="text-xs text-gray-500">{item.label}</span>
                          <span className="text-sm font-medium text-gray-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No emergency contact on file</p>
                  )}
                </div>
              </div>

              {/* Family Members */}
              {patient.familyMembers.length > 0 && (
                <div className="border border-gray-100 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <Users className="h-4 w-4 text-gray-400" />
                    Family Members
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {patient.familyMembers.map((fm) => (
                      <div key={fm.id} className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-900">{fm.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{fm.relation} &middot; {fm.phone}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              {patientTimeline.length > 0 && (
                <div className="border border-gray-100 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
                    <Clock className="h-4 w-4 text-gray-400" />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {patientTimeline.slice(0, 5).map((event) => {
                      const Icon = timelineIcons[event.type] || FileText;
                      const color = timelineColors[event.type] || 'bg-gray-100 text-gray-700';
                      return (
                        <div key={event.id} className="flex items-start gap-3">
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', color)}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{event.title}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">{event.description}</p>
                          </div>
                          <span className="text-xs text-gray-400 flex-shrink-0">{formatDateShort(event.date)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Visits Tab */}
          {activeTab === 'visits' && (
            <div className="space-y-4">
              {patientConsultations.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarDays className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No consultations found</p>
                </div>
              ) : (
                patientConsultations.map((consultation) => {
                  const isExpanded = expandedConsultation === consultation.id;
                  return (
                    <div key={consultation.id} className="border border-gray-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedConsultation(isExpanded ? null : consultation.id)}
                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Stethoscope className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{consultation.chiefComplaint}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {formatDateShort(consultation.date)} &middot; {consultation.doctorName}
                              {consultation.diagnoses.length > 0 && (
                                <> &middot; {consultation.diagnoses.find((d) => d.isPrimary)?.name || consultation.diagnoses[0].name}</>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'px-2 py-0.5 rounded text-xs font-medium',
                            consultation.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                            consultation.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-600'
                          )}>
                            {consultation.status.replace('_', ' ')}
                          </span>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                          {/* Vitals */}
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-2">Vitals</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {[
                                { label: 'BP', value: consultation.vitals.bloodPressure, unit: 'mmHg', icon: Gauge },
                                { label: 'HR', value: consultation.vitals.heartRate, unit: 'bpm', icon: HeartPulse },
                                { label: 'Temp', value: consultation.vitals.temperature, unit: '°F', icon: Thermometer },
                                { label: 'Weight', value: consultation.vitals.weight, unit: 'kg', icon: Activity },
                              ].map((v) => (
                                <div key={v.label} className="bg-gray-50 rounded-lg p-3 text-center">
                                  <v.icon className="h-4 w-4 text-gray-400 mx-auto mb-1" />
                                  <p className="text-lg font-bold text-gray-900">{v.value || '—'}</p>
                                  <p className="text-[10px] text-gray-500">{v.label} ({v.unit})</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* HPI */}
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">History of Present Illness</p>
                            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3">{consultation.hpi}</p>
                          </div>

                          {/* Examination */}
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Examination Findings</p>
                            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3">{consultation.examination}</p>
                          </div>

                          {/* Diagnoses */}
                          {consultation.diagnoses.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-2">Diagnoses</p>
                              <div className="space-y-1.5">
                                {consultation.diagnoses.map((d) => (
                                  <div key={d.id} className="flex items-start gap-2 bg-primary-50 rounded-lg p-2.5">
                                    <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium mt-0.5', d.isPrimary ? 'bg-[#0A75BB] text-white' : 'bg-gray-200 text-gray-600')}>
                                      {d.isPrimary ? 'PRIMARY' : 'SECONDARY'}
                                    </span>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{d.name} <span className="text-xs text-gray-400">({d.icdCode})</span></p>
                                      {d.notes && <p className="text-xs text-gray-500 mt-0.5">{d.notes}</p>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Advice */}
                          {consultation.advice && (
                            <div className="bg-primary-50 border border-primary-100 rounded-lg p-3">
                              <p className="text-xs font-medium text-[#0A75BB] mb-1">Advice</p>
                              <p className="text-sm text-gray-700">{consultation.advice}</p>
                            </div>
                          )}

                          {consultation.followUpDate && (
                            <div className="flex items-center gap-2 text-sm text-[#0A75BB]">
                              <Calendar className="h-4 w-4" />
                              Follow-up: {formatDateShort(consultation.followUpDate)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Prescriptions Tab */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              {patientPrescriptions.length === 0 ? (
                <div className="text-center py-12">
                  <Pill className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No prescriptions found</p>
                </div>
              ) : (
                patientPrescriptions.map((rx) => {
                  const isExpanded = expandedPrescription === rx.id;
                  return (
                    <div key={rx.id} className="border border-gray-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedPrescription(isExpanded ? null : rx.id)}
                        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Pill className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{rx.prescriptionNumber} &middot; {rx.diagnosis}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {formatDateShort(rx.date)} &middot; {rx.doctorName} &middot; {rx.medications.length} medications
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'px-2 py-0.5 rounded text-xs font-medium',
                            rx.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                            rx.status === 'Completed' ? 'bg-gray-100 text-gray-600' :
                            'bg-red-100 text-red-700'
                          )}>
                            {rx.status}
                          </span>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-3">
                          {rx.medications.map((med, i) => (
                            <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                              <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Pill className="h-3.5 w-3.5 text-emerald-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{med.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {med.dosage} &middot; {med.frequency} &middot; {med.duration}
                                </p>
                                {med.instructions && (
                                  <p className="text-xs text-gray-400 mt-0.5 italic">{med.instructions}</p>
                                )}
                              </div>
                            </div>
                          ))}
                          {rx.investigations && rx.investigations.length > 0 && (
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                              <p className="text-xs font-medium text-amber-700 mb-1">Investigations Ordered</p>
                              <div className="flex flex-wrap gap-1">
                                {rx.investigations.map((inv, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-white text-amber-700 rounded text-xs border border-amber-200">{inv}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {rx.instructions && (
                            <div className="bg-primary-50 border border-primary-100 rounded-lg p-3">
                              <p className="text-xs font-medium text-[#0A75BB] mb-1">Instructions</p>
                              <p className="text-sm text-gray-700">{rx.instructions}</p>
                            </div>
                          )}
                          {rx.followUpDate && (
                            <div className="flex items-center gap-2 text-sm text-[#0A75BB]">
                              <Calendar className="h-4 w-4" />
                              Follow-up: {formatDateShort(rx.followUpDate)}
                            </div>
                          )}
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => handlePrintPrescription(rx)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A75BB] text-white rounded-lg text-xs font-medium hover:bg-[#085D94] transition-colors"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Download PDF
                            </button>
                            <button
                              onClick={() => handlePrintPrescription(rx)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                            >
                              <Printer className="h-3.5 w-3.5" />
                              Print
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Lab Tab */}
          {activeTab === 'lab' && (
            <div className="space-y-6">
              {/* Key metrics cards */}
              {(creatinineResult || egfrResult) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {creatinineResult && (
                    <div className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">Serum Creatinine</span>
                        <TrendingUp className={cn('h-4 w-4', creatinineResult.isAbnormal ? 'text-red-500' : 'text-emerald-500')} />
                      </div>
                      <p className={cn('text-2xl font-bold', creatinineResult.isAbnormal ? 'text-red-600' : 'text-gray-900')}>
                        {creatinineResult.value} <span className="text-sm font-normal text-gray-400">{creatinineResult.unit}</span>
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">Ref: {creatinineResult.referenceRange} {creatinineResult.unit}</p>
                    </div>
                  )}
                  {egfrResult && (
                    <div className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">eGFR</span>
                        <TrendingUp className={cn('h-4 w-4', egfrResult.isAbnormal ? 'text-red-500' : 'text-emerald-500')} />
                      </div>
                      <p className={cn('text-2xl font-bold', egfrResult.isAbnormal ? 'text-red-600' : 'text-gray-900')}>
                        {egfrResult.value} <span className="text-sm font-normal text-gray-400">{egfrResult.unit}</span>
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">Ref: {egfrResult.referenceRange} {egfrResult.unit}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Lab results tables */}
              {patientLabs.length === 0 ? (
                <div className="text-center py-12">
                  <Beaker className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No lab orders found</p>
                </div>
              ) : (
                patientLabs.map((lab) => (
                  <div key={lab.id} className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{lab.testName}</p>
                        <p className="text-xs text-gray-500">{formatDateShort(lab.date)} &middot; {lab.doctorName}</p>
                      </div>
                      <span className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium',
                        lab.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        lab.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      )}>
                        {lab.status}
                      </span>
                    </div>
                    {lab.results && lab.results.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="text-left px-5 py-2 text-xs font-medium text-gray-500">Test</th>
                              <th className="text-right px-5 py-2 text-xs font-medium text-gray-500">Value</th>
                              <th className="text-left px-5 py-2 text-xs font-medium text-gray-500">Unit</th>
                              <th className="text-left px-5 py-2 text-xs font-medium text-gray-500">Reference</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {lab.results.map((result, i) => (
                              <tr key={i} className={cn(result.isAbnormal && 'bg-red-50/30')}>
                                <td className="px-5 py-2.5 text-sm text-gray-900">{result.testName}</td>
                                <td className={cn('px-5 py-2.5 text-sm font-semibold text-right', result.isAbnormal ? 'text-red-600' : 'text-gray-900')}>
                                  {result.value}
                                  {result.isAbnormal && <span className="ml-1 text-[10px]">⚠</span>}
                                </td>
                                <td className="px-5 py-2.5 text-sm text-gray-500">{result.unit}</td>
                                <td className="px-5 py-2.5 text-xs text-gray-400">{result.referenceRange}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Uploaded reports and documents</p>
                <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#0A75BB] text-white rounded-lg text-xs font-medium hover:bg-[#085D94] transition-colors">
                  <Upload className="h-3.5 w-3.5" />
                  Upload Report
                </button>
              </div>
              {patientLabs.filter((l) => l.status === 'Completed').length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                  <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No reports uploaded yet</p>
                  <p className="text-xs text-gray-400 mt-1">Upload lab results, imaging, or other documents</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {patientLabs.filter((l) => l.status === 'Completed').map((lab) => (
                    <div key={lab.id} className="flex items-center gap-4 px-4 py-3 border border-gray-100 rounded-lg hover:bg-gray-50/50 transition-colors">
                      <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{lab.testName}</p>
                        <p className="text-xs text-gray-500">{formatDateShort(lab.date)}</p>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-[#0A75BB] hover:bg-primary-50 rounded-lg transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
              <div className="space-y-6">
                {patientTimeline.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No timeline events</p>
                  </div>
                ) : (
                  patientTimeline.map((event) => {
                    const Icon = timelineIcons[event.type] || FileText;
                    const color = timelineColors[event.type] || 'bg-gray-100 text-gray-700';
                    return (
                      <div key={event.id} className="relative pl-10">
                        <div className={cn('absolute left-2 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white', color)}>
                          <Icon className="h-3 w-3" />
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900">{event.title}</p>
                              <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', color)}>
                                {event.type.replace('_', ' ')}
                              </span>
                            </div>
                            <span className="text-xs text-gray-400">{formatDateShort(event.date)} {event.time || ''}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{event.description}</p>
                          {event.details && (
                            <p className="text-xs text-gray-500 mt-2 bg-white rounded p-2 border border-gray-100">{event.details}</p>
                          )}
                          {event.relatedLinks && event.relatedLinks.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {event.relatedLinks.map((link, i) => (
                                <Link key={i} href={link.href} className="text-xs font-medium text-[#0A75BB] hover:underline">
                                  {link.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && patient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Patient?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete <strong>{patient.firstName} {patient.lastName}</strong> ({patient.uhid})? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePatient}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
