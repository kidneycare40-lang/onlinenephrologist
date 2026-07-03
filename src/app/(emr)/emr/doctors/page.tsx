'use client';

import { useState, useMemo } from 'react';
import {
  UserCog, Plus, Search, Edit2, Calendar, Mail, Phone,
  Award, Clock, ChevronDown, X, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  qualifications: string;
  specialization: string;
  registrationNumber: string;
  experience: number;
  consultationFee: number;
  availableDays: string[];
  availableTimes: string;
  bio: string;
  isActive: boolean;
}

const mockDoctors: Doctor[] = [
  {
    id: 'D-001', firstName: 'Rajesh', lastName: 'Goel', email: 'rajesh@kidneycarecentre.in', phone: '+91 98765 43210',
    gender: 'Male', dateOfBirth: '1980-05-15', qualifications: 'MBBS, MD Medicine, DM Nephrology',
    specialization: 'Nephrology', registrationNumber: 'MCI-12345', experience: 18,
    consultationFee: 1500, availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    availableTimes: '9:00 AM - 5:00 PM', bio: 'Senior Nephrologist with expertise in CKD management, dialysis, and kidney transplantation.', isActive: true,
  },
  {
    id: 'D-002', firstName: 'Priya', lastName: 'Sharma', email: 'priya@kidneycarecentre.in', phone: '+91 98765 43211',
    gender: 'Female', dateOfBirth: '1985-08-22', qualifications: 'MBBS, MS Urology, MCh Urology',
    specialization: 'Urology', registrationNumber: 'MCI-23456', experience: 12,
    consultationFee: 1200, availableDays: ['Mon', 'Wed', 'Fri'],
    availableTimes: '10:00 AM - 4:00 PM', bio: 'Urologist specializing in minimally invasive urological surgeries and kidney stone management.', isActive: true,
  },
  {
    id: 'D-003', firstName: 'Anil', lastName: 'Kumar', email: 'anil@kidneycarecentre.in', phone: '+91 98765 43212',
    gender: 'Male', dateOfBirth: '1978-12-03', qualifications: 'MBBS, MD Nephrology, Fellowship Transplant',
    specialization: 'Transplant Nephrology', registrationNumber: 'MCI-34567', experience: 20,
    consultationFee: 2000, availableDays: ['Tue', 'Thu', 'Sat'],
    availableTimes: '9:00 AM - 2:00 PM', bio: 'Transplant nephrologist with extensive experience in post-transplant care and immunosuppression management.', isActive: true,
  },
  {
    id: 'D-004', firstName: 'Meera', lastName: 'Patel', email: 'meera@kidneycarecentre.in', phone: '+91 98765 43213',
    gender: 'Female', dateOfBirth: '1990-03-18', qualifications: 'MBBS, MD Nephrology',
    specialization: 'Nephrology', registrationNumber: 'MCI-45678', experience: 8,
    consultationFee: 1200, availableDays: ['Mon', 'Tue', 'Thu', 'Fri'],
    availableTimes: '11:00 AM - 6:00 PM', bio: 'Nephrologist with focus on diabetic kidney disease and electrolyte disorders.', isActive: true,
  },
  {
    id: 'D-005', firstName: 'Vikram', lastName: 'Singh', email: 'vikram@kidneycarecentre.in', phone: '+91 98765 43214',
    gender: 'Male', dateOfBirth: '1982-11-28', qualifications: 'MBBS, DNB Nephrology',
    specialization: 'Dialysis Medicine', registrationNumber: 'MCI-56789', experience: 14,
    consultationFee: 1000, availableDays: ['Mon', 'Wed', 'Fri'],
    availableTimes: '6:00 AM - 12:00 PM', bio: 'Dialysis specialist managing the hemodialysis unit with focus on dialysis adequacy and vascular access.', isActive: false,
  },
];

const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function DoctorCard({ doctor, onEdit }: { doctor: Doctor; onEdit: (d: Doctor) => void }) {
  const initials = `${doctor.firstName[0]}${doctor.lastName[0]}`;
  return (
    <div className={cn(
      'bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow',
      !doctor.isActive && 'opacity-60'
    )}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center text-lg font-bold text-primary-700 shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Dr. {doctor.firstName} {doctor.lastName}</h3>
                <p className="text-xs text-primary-600 font-medium mt-0.5">{doctor.specialization}</p>
              </div>
              <span className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0',
                doctor.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
              )}>
                {doctor.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{doctor.qualifications}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Award className="h-3 w-3" /> {doctor.experience} yrs</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {doctor.availableTimes}</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {allDays.map((day) => (
                <span
                  key={day}
                  className={cn(
                    'px-1.5 py-0.5 rounded text-[9px] font-medium',
                    doctor.availableDays.includes(day) ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'bg-gray-50 text-gray-400 border border-gray-100'
                  )}
                >
                  {day}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {doctor.email}</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors">
            <Calendar className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(doctor)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DoctorsPage() {
  const [search, setSearch] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  const specializations = ['All', ...new Set(mockDoctors.map(d => d.specialization))];

  const filtered = useMemo(() => {
    return mockDoctors.filter((d) => {
      const name = `Dr. ${d.firstName} ${d.lastName}`.toLowerCase();
      const matchesSearch = !search || name.includes(search.toLowerCase()) || d.specialization.toLowerCase().includes(search.toLowerCase());
      const matchesSpec = specializationFilter === 'All' || d.specialization === specializationFilter;
      return matchesSearch && matchesSpec;
    });
  }, [search, specializationFilter]);

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingDoctor(null);
    setShowModal(true);
  };

  return (
    <div className="space-y-5 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-primary-50 rounded-xl">
              <UserCog className="h-6 w-6 text-primary-600" />
            </div>
            Doctors
          </h1>
          <p className="text-sm text-gray-500 mt-1">{mockDoctors.length} doctors in your practice</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Doctor
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search doctors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {specializations.map((spec) => (
            <button
              key={spec}
              onClick={() => setSpecializationFilter(spec)}
              className={cn(
                'px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors border',
                specializationFilter === spec
                  ? 'bg-primary-50 text-primary-700 border-primary-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              )}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} onEdit={handleEdit} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <UserCog className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No doctors found</p>
        </div>
      )}

      {/* Add/Edit Doctor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingDoctor ? `Edit Dr. ${editingDoctor.firstName} ${editingDoctor.lastName}` : 'Add New Doctor'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Personal */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">First Name</label>
                    <input type="text" defaultValue={editingDoctor?.firstName} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Last Name</label>
                    <input type="text" defaultValue={editingDoctor?.lastName} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
                    <input type="email" defaultValue={editingDoctor?.email} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Phone</label>
                    <input type="tel" defaultValue={editingDoctor?.phone} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Gender</label>
                    <select defaultValue={editingDoctor?.gender} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Date of Birth</label>
                    <input type="date" defaultValue={editingDoctor?.dateOfBirth} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                  </div>
                </div>
              </div>

              {/* Professional */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Professional Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Qualifications</label>
                    <input type="text" defaultValue={editingDoctor?.qualifications} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="MBBS, MD, DM..." />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Specialization</label>
                    <select defaultValue={editingDoctor?.specialization} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                      <option>Nephrology</option>
                      <option>Urology</option>
                      <option>Transplant Nephrology</option>
                      <option>Dialysis Medicine</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Registration #</label>
                    <input type="text" defaultValue={editingDoctor?.registrationNumber} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Experience (years)</label>
                    <input type="number" defaultValue={editingDoctor?.experience} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Consultation Fee (₹)</label>
                    <input type="number" defaultValue={editingDoctor?.consultationFee} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Availability</h3>
                <div className="mb-3">
                  <label className="text-xs font-medium text-gray-600 mb-2 block">Available Days</label>
                  <div className="flex gap-2">
                    {allDays.map((day) => (
                      <button
                        key={day}
                        className={cn(
                          'w-10 h-10 rounded-xl text-xs font-medium border transition-colors',
                          editingDoctor?.availableDays.includes(day)
                            ? 'bg-primary-50 text-primary-700 border-primary-200'
                            : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                        )}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Available Times</label>
                  <input type="text" defaultValue={editingDoctor?.availableTimes} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" placeholder="9:00 AM - 5:00 PM" />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Bio</label>
                <textarea
                  defaultValue={editingDoctor?.bio}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  rows={3}
                  placeholder="Brief description about the doctor..."
                />
              </div>

              {/* Status */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked={editingDoctor?.isActive ?? true} className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                  <span className="text-sm font-medium text-gray-900">Active</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors">
                <Check className="h-4 w-4" />
                {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
