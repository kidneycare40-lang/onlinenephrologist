'use client';

import { useState } from 'react';
import { Shield, Stethoscope, UserCog, Plus, Trash2, Save, X, Eye, EyeOff, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, type EMRRole, type EMRUser } from '@/lib/emr-auth-context';

const roleLabels: Record<EMRRole, { label: string; icon: typeof Shield; color: string; bg: string }> = {
  admin: { label: 'Admin', icon: Shield, color: 'text-purple-700', bg: 'bg-purple-50' },
  doctor: { label: 'Doctor', icon: Stethoscope, color: 'text-[#0A75BB]', bg: 'bg-blue-50' },
  receptionist: { label: 'Receptionist', icon: UserCog, color: 'text-emerald-700', bg: 'bg-emerald-50' },
};

const roleDescriptions: Record<EMRRole, string[]> = {
  admin: ['Full access to all features', 'Manage users and roles', 'Settings and billing', 'Delete data and export'],
  doctor: ['Patients, consultations, prescriptions', 'View reports and analytics', 'Clinical notes and AI tools'],
  receptionist: ['Appointments and patient management', 'Billing and payments', 'View-only dashboard'],
};

export default function UsersRolesSettings() {
  const { users, addUser, updateUser, deleteUser, user: currentUser } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showPin, setShowPin] = useState<string | null>(null);
  const [form, setForm] = useState<{ name: string; email: string; role: EMRRole; pin: string }>({ name: '', email: '', role: 'receptionist', pin: '' });

  function handleAdd() {
    if (!form.name || !form.email || !form.pin) return;
    addUser({ name: form.name, email: form.email, role: form.role, pin: form.pin });
    setForm({ name: '', email: '', role: 'receptionist', pin: '' });
    setShowAdd(false);
  }

  function handleUpdate(id: string) {
    if (!form.name || !form.email) return;
    const updates: Partial<EMRUser> = { name: form.name, email: form.email, role: form.role };
    if (form.pin) updates.pin = form.pin;
    updateUser(id, updates);
    setEditingId(null);
    setForm({ name: '', email: '', role: 'receptionist', pin: '' });
  }

  function startEdit(user: EMRUser) {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, role: user.role, pin: '' });
    setShowAdd(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setShowAdd(false);
    setForm({ name: '', email: '', role: 'receptionist', pin: '' });
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Users & Roles</h2>
            <p className="text-xs text-gray-500 mt-0.5">Manage who can access the EMR and what they can do</p>
          </div>
          <button
            onClick={() => { setShowAdd(true); setEditingId(null); setForm({ name: '', email: '', role: 'receptionist', pin: '' }); }}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#0A75BB] text-white rounded-lg text-sm font-medium hover:bg-[#085a94] transition-colors"
          >
            <Plus className="h-4 w-4" /> Add User
          </button>
        </div>

        {/* Role cards */}
        <div className="px-6 pt-4 pb-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(Object.keys(roleLabels) as EMRRole[]).map((role) => {
              const info = roleLabels[role];
              const Icon = info.icon;
              const count = users.filter((u) => u.role === role).length;
              return (
                <div key={role} className={cn('rounded-xl border p-3', info.bg, 'border-gray-200')}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={cn('h-5 w-5', info.color)} />
                    <span className={cn('text-sm font-bold', info.color)}>{info.label}</span>
                    <span className="ml-auto text-xs text-gray-400">{count} user{count !== 1 ? 's' : ''}</span>
                  </div>
                  <ul className="space-y-0.5">
                    {roleDescriptions[role].map((desc, i) => (
                      <li key={i} className="text-[11px] text-gray-500 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                        {desc}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* User list */}
        <div className="px-6 pb-4">
          <div className="mt-4 divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
            {users.map((u) => {
              const info = roleLabels[u.role];
              const Icon = info.icon;
              const isEditing = editingId === u.id;
              const isSelf = currentUser?.id === u.id;

              return (
                <div key={u.id} className={cn('flex items-center gap-3 px-4 py-3 bg-white', isEditing && 'bg-gray-50')}>
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', info.bg)}>
                    <Icon className={cn('h-4 w-4', info.color)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#0A75BB]/20" />
                        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#0A75BB]/20" />
                        <div className="flex gap-2">
                          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as EMRRole })} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#0A75BB]/20">
                            <option value="admin">Admin</option>
                            <option value="doctor">Doctor</option>
                            <option value="receptionist">Receptionist</option>
                          </select>
                          <input type="password" inputMode="numeric" value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder="New PIN (optional)" className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#0A75BB]/20" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-900 truncate">{u.name}{isSelf && <span className="ml-1.5 text-[10px] text-[#0A75BB] font-normal">(you)</span>}</p>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      </>
                    )}
                  </div>

                  {!isEditing && (
                    <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', info.bg, info.color)}>
                      {info.label}
                    </span>
                  )}

                  <div className="flex items-center gap-1 shrink-0">
                    {isEditing ? (
                      <>
                        <button onClick={() => handleUpdate(u.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Save">
                          <Save className="h-4 w-4" />
                        </button>
                        <button onClick={cancelEdit} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors" title="Cancel">
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(u)} className="p-1.5 text-gray-400 hover:text-[#0A75BB] hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        {!isSelf && (
                          <button
                            onClick={() => { if (confirm(`Delete ${u.name}?`)) deleteUser(u.id); }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add user modal */}
      {showAdd && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Add New User</h3>
              <button onClick={cancelEdit} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dr. Smith" className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0A75BB]/30 focus:border-[#0A75BB]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@kcc.in" className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0A75BB]/30 focus:border-[#0A75BB]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(roleLabels) as EMRRole[]).map((role) => {
                    const info = roleLabels[role];
                    const Icon = info.icon;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setForm({ ...form, role })}
                        className={cn(
                          'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all',
                          form.role === role ? 'border-[#0A75BB] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <Icon className={cn('h-5 w-5', form.role === role ? 'text-[#0A75BB]' : 'text-gray-400')} />
                        <span className={cn('text-xs font-medium', form.role === role ? 'text-[#0A75BB]' : 'text-gray-600')}>{info.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Login PIN</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input type="password" inputMode="numeric" maxLength={6} value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder="4-6 digit PIN" className="w-full h-10 pl-9 pr-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0A75BB]/30 focus:border-[#0A75BB] tracking-widest text-center font-mono" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={cancelEdit} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
              <button
                onClick={handleAdd}
                disabled={!form.name || !form.email || !form.pin}
                className="px-4 py-2 bg-[#0A75BB] text-white text-sm font-medium rounded-lg hover:bg-[#085a94] transition-colors disabled:opacity-50"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
