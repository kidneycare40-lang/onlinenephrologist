'use client';

import { useState, useEffect } from 'react';
import { Shield, Stethoscope, UserCog, Plus, Trash2, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/emr-auth-context';
import { authApi } from '@/lib/api-client';

const roleInfo: Record<string, { label: string; icon: typeof Shield; color: string; bg: string }> = {
  super_admin: { label: 'Super Admin', icon: Shield, color: 'text-purple-700', bg: 'bg-purple-50' },
  doctor: { label: 'Doctor', icon: Stethoscope, color: 'text-[#0A75BB]', bg: 'bg-blue-50' },
  receptionist: { label: 'Receptionist', icon: UserCog, color: 'text-emerald-700', bg: 'bg-emerald-50' },
  billing: { label: 'Billing', icon: Shield, color: 'text-orange-700', bg: 'bg-orange-50' },
  lab: { label: 'Lab', icon: Shield, color: 'text-cyan-700', bg: 'bg-cyan-50' },
  nurse: { label: 'Nurse', icon: Shield, color: 'text-pink-700', bg: 'bg-pink-50' },
  readonly: { label: 'Read-only', icon: Shield, color: 'text-gray-700', bg: 'bg-gray-50' },
};

const roleDescriptions: Record<string, string[]> = {
  super_admin: ['Full access to all features', 'Manage users and roles', 'Settings and billing', 'Delete data and export'],
  doctor: ['Patients, consultations, prescriptions', 'View reports and analytics', 'Clinical notes and AI tools'],
  receptionist: ['Appointments and patient management', 'Billing and payments', 'View-only dashboard'],
  billing: ['Invoice management and payments', 'View patients and appointments'],
  lab: ['Lab reports and investigations', 'View patient lab data'],
  nurse: ['Vitals and patient care', 'View consultations and prescriptions'],
  readonly: ['View-only access', 'Cannot create or edit data'],
};

interface UserItem { id: string; name?: string; email?: string; role: string; }

export default function UsersRolesSettings() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'receptionist', pin: '', password: '' });

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    try { setLoading(true); const data: any = await authApi.listUsers(); setUsers(Array.isArray(data) ? data : data?.users || []); }
    catch { setUsers([]); }
    finally { setLoading(false); }
  }

  async function handleAdd() {
    if (!form.name || !form.email || (!form.pin && !form.password)) return;
    const nameParts = form.name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;
    try { await authApi.createUser({ firstName, lastName, email: form.email, role: form.role, pin: form.pin || undefined, password: form.password || 'changeme123' }); await loadUsers(); }
    catch (e: any) { alert(e?.message || 'Failed to create user'); }
    setForm({ name: '', email: '', role: 'receptionist', pin: '', password: '' });
    setShowAdd(false);
  }

  function cancelEdit() { setEditingId(null); setShowAdd(false); setForm({ name: '', email: '', role: 'receptionist', pin: '', password: '' }); }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Users & Roles</h2>
            <p className="text-xs text-gray-500 mt-0.5">Manage who can access the EMR and what they can do</p>
          </div>
          <button onClick={() => { setShowAdd(true); setEditingId(null); setForm({ name: '', email: '', role: 'receptionist', pin: '', password: '' }); }}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#0A75BB] text-white rounded-lg text-sm font-medium hover:bg-[#085a94] transition-colors"
          ><Plus className="h-4 w-4" /> Add User</button>
        </div>

        <div className="px-6 pt-4 pb-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.keys(roleInfo).map((role) => {
              const info = roleInfo[role];
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
                    {roleDescriptions[role]?.map((desc, i) => (
                      <li key={i} className="text-[11px] text-gray-500 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0" />{desc}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 pb-4">
          {loading ? (
            <div className="text-center py-8 text-sm text-gray-400">Loading users...</div>
          ) : (
            <div className="mt-4 divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
              {users.map((u) => {
                const info = roleInfo[u.role] || roleInfo['super_admin'];
                const Icon = info.icon;
                const isSelf = currentUser?.id === u.id;

                return (
                  <div key={u.id} className="flex items-center gap-3 px-4 py-3 bg-white">
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', info.bg)}>
                      <Icon className={cn('h-4 w-4', info.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{u.name || u.email}{isSelf && <span className="ml-1.5 text-[10px] text-[#0A75BB] font-normal">(you)</span>}</p>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    </div>
                    <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', info.bg, info.color)}>{info.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Add New User</h3>
              <button onClick={cancelEdit} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><X className="h-5 w-5" /></button>
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
                  {Object.keys(roleInfo).map((role) => {
                    const info = roleInfo[role];
                    const Icon = info.icon;
                    return (
                      <button key={role} type="button" onClick={() => setForm({ ...form, role })}
                        className={cn('flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all', form.role === role ? 'border-[#0A75BB] bg-blue-50' : 'border-gray-200 hover:border-gray-300')}
                      >
                        <Icon className={cn('h-5 w-5', form.role === role ? 'text-[#0A75BB]' : 'text-gray-400')} />
                        <span className={cn('text-xs font-medium', form.role === role ? 'text-[#0A75BB]' : 'text-gray-600')}>{info.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PIN (4-6 digits)</label>
                <input type="password" inputMode="numeric" maxLength={6} value={form.pin}
                  onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  placeholder="Login PIN" className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0A75BB]/30 focus:border-[#0A75BB] tracking-widest text-center font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password (optional)</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Leave blank for auto-generated" className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0A75BB]/30 focus:border-[#0A75BB]" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={cancelEdit} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleAdd} disabled={!form.name || !form.email || (!form.pin && !form.password)}
                className="px-4 py-2 bg-[#0A75BB] text-white text-sm font-medium rounded-lg hover:bg-[#085a94] transition-colors disabled:opacity-50">Add User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
