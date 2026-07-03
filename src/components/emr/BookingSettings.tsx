'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle, Settings, Megaphone, Globe, Plus, Trash2, Save, ChevronDown, ChevronRight, CreditCard, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type BookingSettings, type ClinicSchedule, type Holiday, defaultClinicSchedules, defaultSettings, loadBookingSettings, saveBookingSettings } from '@/lib/booking-settings';

export type { BookingSettings };
export { loadBookingSettings, saveBookingSettings };

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function Toggle({ enabled, onChange, label, description }: { enabled: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button type="button" onClick={() => onChange(!enabled)}
        className={cn('relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200', enabled ? 'bg-[#0A75BB]' : 'bg-gray-200')}>
        <span className={cn('pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition duration-200', enabled ? 'translate-x-5' : 'translate-x-0')} />
      </button>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder, min, max, ...props }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; min?: string; max?: string } & Record<string, unknown>) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 mb-1.5 block">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} min={min} max={max}
        className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30" {...props} />
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 mb-1.5 block">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function ListManager({ title, items, onAdd, onRemove }: { title: string; items: string[]; onAdd: (v: string) => void; onRemove: (i: number) => void }) {
  const [newItem, setNewItem] = useState('');
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-600 block">{title}</label>
      <div className="flex gap-2">
        <input type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { onAdd(newItem); setNewItem(''); } }}
          placeholder={`Add ${title.toLowerCase()}...`}
          className="flex-1 h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30" />
        <button onClick={() => { onAdd(newItem); setNewItem(''); }} disabled={!newItem.trim()}
          className="h-9 px-3 bg-[#0A75BB] text-white rounded-lg text-xs font-medium hover:bg-[#085a94] transition-colors disabled:opacity-50">
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, idx) => (
          <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
            {item}
            <button onClick={() => onRemove(idx)} className="text-gray-400 hover:text-red-500 ml-0.5">
              <Trash2 className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function BookingSettingsComponent() {
  const [settings, setSettings] = useState<BookingSettings>(defaultSettings);
  const [expandedSection, setExpandedSection] = useState<string | null>('schedule');
  const [saved, setSaved] = useState(false);
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayTitle, setNewHolidayTitle] = useState('');
  const [newHolidayFullDay, setNewHolidayFullDay] = useState(true);
  const [newHolidayStart, setNewHolidayStart] = useState('09:00');
  const [newHolidayEnd, setNewHolidayEnd] = useState('18:00');

  useEffect(() => {
    setSettings(loadBookingSettings());
  }, []);

  function handleSave() {
    saveBookingSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function updateSchedule(index: number, field: keyof ClinicSchedule, value: unknown) {
    const updated = [...settings.schedules];
    updated[index] = { ...updated[index], [field]: value };
    setSettings({ ...settings, schedules: updated });
  }

  function toggleWorkingDay(scheduleIndex: number, day: number) {
    const schedule = settings.schedules[scheduleIndex];
    const days = schedule.workingDays.includes(day)
      ? schedule.workingDays.filter(d => d !== day)
      : [...schedule.workingDays, day].sort();
    updateSchedule(scheduleIndex, 'workingDays', days);
  }

  function addHoliday() {
    if (!newHolidayDate || !newHolidayTitle.trim()) return;
    const holiday: Holiday = {
      id: `h-${Date.now()}`,
      date: newHolidayDate,
      title: newHolidayTitle.trim(),
      isFullDay: newHolidayFullDay,
      startTime: newHolidayStart,
      endTime: newHolidayEnd,
    };
    setSettings({ ...settings, holidays: [...settings.holidays, holiday] });
    setNewHolidayDate('');
    setNewHolidayTitle('');
  }

  function removeHoliday(id: string) {
    setSettings({ ...settings, holidays: settings.holidays.filter(h => h.id !== id) });
  }

  function updateRule(field: keyof BookingSettings['rules'], value: unknown) {
    setSettings({ ...settings, rules: { ...settings.rules, [field]: value } });
  }

  function updateOnline(field: keyof BookingSettings['onlineBooking'], value: unknown) {
    setSettings({ ...settings, onlineBooking: { ...settings.onlineBooking, [field]: value } });
  }

  function updateNotice(field: keyof BookingSettings['noticeBoard'], value: unknown) {
    setSettings({ ...settings, noticeBoard: { ...settings.noticeBoard, [field]: value } });
  }

  function updatePaymentGateway(field: keyof BookingSettings['paymentGateway'], value: unknown) {
    setSettings({ ...settings, paymentGateway: { ...settings.paymentGateway, [field]: value } });
  }

  function updateInternational(field: keyof BookingSettings['international'], value: unknown) {
    setSettings({ ...settings, international: { ...settings.international, [field]: value } });
  }

  function addInternationalListItem(field: 'countries' | 'timezones' | 'conditions' | 'allowedLanguages', value: string) {
    if (!value.trim()) return;
    const list = settings.international[field];
    if (list.includes(value.trim())) return;
    updateInternational(field, [...list, value.trim()]);
  }

  function removeInternationalListItem(field: 'countries' | 'timezones' | 'conditions' | 'allowedLanguages', index: number) {
    const list = [...settings.international[field]];
    list.splice(index, 1);
    updateInternational(field, list);
  }

  const sections = [
    { id: 'schedule', label: 'Doctor Schedule', icon: <Calendar className="h-4 w-4" />, desc: 'Working days, hours, slots & fees per service' },
    { id: 'holidays', label: 'Holidays & Leave', icon: <AlertTriangle className="h-4 w-4" />, desc: 'Block dates when doctor is on leave' },
    { id: 'rules', label: 'Booking Rules', icon: <Settings className="h-4 w-4" />, desc: 'Advance booking, cancellation, auto-confirm' },
    { id: 'online', label: 'Online Booking', icon: <Globe className="h-4 w-4" />, desc: 'Enable/disable online booking on website' },
    { id: 'payment', label: 'Payment Gateway', icon: <CreditCard className="h-4 w-4" />, desc: 'UPI, Razorpay, and payment collection settings' },
    { id: 'notice', label: 'Notice Board', icon: <Megaphone className="h-4 w-4" />, desc: 'Show messages to patients on booking page' },
    { id: 'international', label: 'International Booking', icon: <Globe className="h-4 w-4" />, desc: 'Countries, timezones, fee & conditions for international patients' },
  ];

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <button onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0A75BB]/10 rounded-lg text-[#0A75BB]">{section.icon}</div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">{section.label}</p>
                <p className="text-xs text-gray-500">{section.desc}</p>
              </div>
            </div>
            {expandedSection === section.id ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
          </button>

          {expandedSection === section.id && (
            <div className="px-6 pb-6 border-t border-gray-100 pt-4">

              {/* DOCTOR SCHEDULE */}
              {section.id === 'schedule' && (
                <div className="space-y-6">
                  {settings.schedules.map((schedule, idx) => (
                    <div key={schedule.clinicId} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-gray-900">{schedule.clinicName}</h4>
                          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full',
                            schedule.consultationType === 'online' ? 'bg-emerald-100 text-emerald-700' :
                            schedule.consultationType === 'online-intl' ? 'bg-purple-100 text-purple-700' :
                            schedule.consultationType === 'hospital' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          )}>
                            {schedule.consultationType === 'in-clinic' ? 'In-Clinic' :
                             schedule.consultationType === 'online' ? 'Online (India)' :
                             schedule.consultationType === 'online-intl' ? 'International' : 'Hospital'}
                          </span>
                        </div>
                        <Toggle enabled={schedule.enabled} onChange={(v) => updateSchedule(idx, 'enabled', v)} label="" />
                      </div>
                      {schedule.enabled && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <Input label="Fee" type="number" value={String(schedule.fee)} onChange={(v) => updateSchedule(idx, 'fee', parseInt(v) || 0)} placeholder="0" />
                            <Select label="Currency" value={schedule.currency} onChange={(v) => updateSchedule(idx, 'currency', v)} options={['INR', 'USD', 'EUR', 'GBP']} />
                            <Select label="Consultation Type" value={schedule.consultationType} onChange={(v) => updateSchedule(idx, 'consultationType', v)} options={['in-clinic', 'online', 'online-intl', 'hospital']} />
                            <div>
                              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Fee Label</label>
                              <p className="h-10 px-3 border border-gray-200 rounded-lg text-sm flex items-center bg-gray-50">
                                {schedule.currency === 'USD' ? `$${schedule.fee}` : `₹${schedule.fee}`}
                              </p>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Description</label>
                            <input type="text" value={schedule.description} onChange={(e) => updateSchedule(idx, 'description', e.target.value)}
                              placeholder="Description shown to patients"
                              className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 mb-2 block">Working Days</label>
                            <div className="flex gap-1.5">
                              {[0,1,2,3,4,5,6].map(day => (
                                <button key={day} onClick={() => toggleWorkingDay(idx, day)}
                                  className={cn('w-10 h-10 rounded-lg text-xs font-medium transition-colors',
                                    schedule.workingDays.includes(day) ? 'bg-[#0A75BB] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
                                  {dayNames[day]}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <Input label="Start Time" type="time" value={schedule.startTime} onChange={(v) => updateSchedule(idx, 'startTime', v)} />
                            <Input label="End Time" type="time" value={schedule.endTime} onChange={(v) => updateSchedule(idx, 'endTime', v)} />
                            <Input label="Slot Interval (min)" type="number" value={String(schedule.slotInterval)} onChange={(v) => updateSchedule(idx, 'slotInterval', parseInt(v) || 10)} placeholder="10" />
                            <Input label="Max Patients/Day" type="number" value={String(schedule.maxPatientsPerDay)} onChange={(v) => updateSchedule(idx, 'maxPatientsPerDay', parseInt(v) || 20)} placeholder="20" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <Input label="Break Start (optional)" type="time" value={schedule.breakStart} onChange={(v) => updateSchedule(idx, 'breakStart', v)} />
                            <Input label="Break End (optional)" type="time" value={schedule.breakEnd} onChange={(v) => updateSchedule(idx, 'breakEnd', v)} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* HOLIDAYS & LEAVE */}
              {section.id === 'holidays' && (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <h4 className="font-semibold text-amber-800 mb-2">Add Holiday / Leave</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <Input label="Date" type="date" value={newHolidayDate} onChange={setNewHolidayDate} />
                      <Input label="Title" value={newHolidayTitle} onChange={setNewHolidayTitle} placeholder="e.g. Doctor on leave" />
                      <div className="flex items-end gap-3">
                        <Toggle enabled={newHolidayFullDay} onChange={setNewHolidayFullDay} label="Full Day" />
                      </div>
                      <div className="flex items-end">
                        <button onClick={addHoliday} disabled={!newHolidayDate || !newHolidayTitle.trim()}
                          className="w-full h-10 bg-[#0A75BB] text-white rounded-lg text-sm font-medium hover:bg-[#085a94] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                          <Plus className="h-4 w-4" /> Add
                        </button>
                      </div>
                    </div>
                    {!newHolidayFullDay && (
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <Input label="Start Time" type="time" value={newHolidayStart} onChange={setNewHolidayStart} />
                        <Input label="End Time" type="time" value={newHolidayEnd} onChange={setNewHolidayEnd} />
                      </div>
                    )}
                  </div>

                  {settings.holidays.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Upcoming Holidays & Leave</h4>
                      {settings.holidays.sort((a, b) => a.date.localeCompare(b.date)).map(holiday => (
                        <div key={holiday.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{holiday.title}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(holiday.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                              {!holiday.isFullDay && ` (${holiday.startTime} - ${holiday.endTime})`}
                            </p>
                          </div>
                          <button onClick={() => removeHoliday(holiday.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">No holidays or leave dates added yet</p>
                  )}
                </div>
              )}

              {/* BOOKING RULES */}
              {section.id === 'rules' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Max Advance Booking (days)" type="number" value={String(settings.rules.maxAdvanceBookingDays)} onChange={(v) => updateRule('maxAdvanceBookingDays', parseInt(v) || 30)} />
                    <Input label="Min Advance Booking (hours)" type="number" value={String(settings.rules.minAdvanceBookingHours)} onChange={(v) => updateRule('minAdvanceBookingHours', parseInt(v) || 2)} />
                    <Input label="Cancellation Allowed Before (hours)" type="number" value={String(settings.rules.cancellationHoursBefore)} onChange={(v) => updateRule('cancellationHoursBefore', parseInt(v) || 4)} />
                  </div>
                  <div className="border-t border-gray-100 pt-3">
                    <Toggle enabled={settings.rules.allowSameDayBooking} onChange={(v) => updateRule('allowSameDayBooking', v)} label="Allow Same-Day Booking" description="Patients can book appointments for today" />
                    <Toggle enabled={settings.rules.cancellationAllowed} onChange={(v) => updateRule('cancellationAllowed', v)} label="Allow Cancellation" description="Patients can cancel their booking before the cutoff time" />
                    <Toggle enabled={settings.rules.autoConfirmBookings} onChange={(v) => updateRule('autoConfirmBookings', v)} label="Auto-Confirm Bookings" description="Automatically confirm new bookings without manual approval" />
                    <Toggle enabled={settings.rules.requirePaymentUpfront} onChange={(v) => updateRule('requirePaymentUpfront', v)} label="Require Payment Upfront" description="Patients must pay before booking is confirmed" />
                  </div>
                </div>
              )}

              {/* ONLINE BOOKING */}
              {section.id === 'online' && (
                <div className="space-y-4">
                  <Toggle enabled={settings.onlineBooking.enabled} onChange={(v) => updateOnline('enabled', v)} label="Enable Online Booking" description="Allow patients to book appointments through the website" />
                  <Toggle enabled={settings.onlineBooking.showOnWebsite} onChange={(v) => updateOnline('showOnWebsite', v)} label="Show Booking Widget on Website" description="Display the booking form on the public website" />
                  <div className="border-t border-gray-100 pt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Required Fields</h4>
                    <Toggle enabled={settings.onlineBooking.requirePhone} onChange={(v) => updateOnline('requirePhone', v)} label="Require Phone Number" />
                    <Toggle enabled={settings.onlineBooking.requireEmail} onChange={(v) => updateOnline('requireEmail', v)} label="Require Email Address" />
                  </div>
                  <div className="border-t border-gray-100 pt-3">
                    <Toggle enabled={settings.onlineBooking.allowFileUpload} onChange={(v) => updateOnline('allowFileUpload', v)} label="Allow File Upload" description="Patients can upload medical reports during booking" />
                    {settings.onlineBooking.allowFileUpload && (
                      <div className="mt-2">
                        <Input label="Max File Size (MB)" type="number" value={String(settings.onlineBooking.maxFileSize)} onChange={(v) => updateOnline('maxFileSize', parseInt(v) || 10)} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PAYMENT GATEWAY */}
              {section.id === 'payment' && (
                <div className="space-y-4">
                  <Toggle enabled={settings.paymentGateway.enabled} onChange={(v) => updatePaymentGateway('enabled', v)} label="Enable Payment Gateway" description="Accept online payments during booking" />

                  {settings.paymentGateway.enabled && (
                    <>
                      <div className="border-t border-gray-100 pt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Provider</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            { id: 'razorpay', label: 'Razorpay', desc: 'UPI, Cards, Netbanking, Wallets' },
                            { id: 'upi-only', label: 'UPI QR Only', desc: 'QR code + UPI ID (manual verify)' },
                            { id: 'manual', label: 'Manual', desc: 'No online payment, pay at clinic' },
                          ].map((opt) => (
                            <button key={opt.id} onClick={() => updatePaymentGateway('provider', opt.id)}
                              className={cn(
                                'text-left border-2 rounded-xl p-4 transition-all',
                                settings.paymentGateway.provider === opt.id
                                  ? 'border-[#0A75BB] bg-[#0A75BB]/5'
                                  : 'border-gray-200 hover:border-gray-300'
                              )}>
                              <p className="text-sm font-semibold text-gray-900">{opt.label}</p>
                              <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {settings.paymentGateway.provider === 'razorpay' && (
                        <div className="border-t border-gray-100 pt-3 space-y-3">
                          <h4 className="text-sm font-medium text-gray-700">Razorpay Credentials</h4>
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                            Get your API keys from <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" className="underline font-medium">Razorpay Dashboard</a>. Use test keys for development.
                          </div>
                          <Input label="Razorpay Key ID" value={settings.paymentGateway.razorpayKeyId} onChange={(v) => updatePaymentGateway('razorpayKeyId', v)} placeholder="rzp_test_xxxxxxxxxxxxx" />
                          <Input label="Razorpay Key Secret" value={settings.paymentGateway.razorpayKeySecret} onChange={(v) => updatePaymentGateway('razorpayKeySecret', v)} placeholder="xxxxxxxxxxxxxxxxxxxx" />
                        </div>
                      )}

                      {(settings.paymentGateway.provider === 'razorpay' || settings.paymentGateway.provider === 'upi-only') && (
                        <div className="border-t border-gray-100 pt-3 space-y-3">
                          <h4 className="text-sm font-medium text-gray-700">UPI Settings</h4>
                          <Input label="UPI ID" value={settings.paymentGateway.upiId} onChange={(v) => updatePaymentGateway('upiId', v)} placeholder="9818235688@pthdfc" />
                          <Input label="Default Currency" value={settings.paymentGateway.currency} onChange={(v) => updatePaymentGateway('currency', v)} placeholder="INR" />
                        </div>
                      )}

                      <div className="border-t border-gray-100 pt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Requirements</h4>
                        <Toggle enabled={settings.paymentGateway.requirePaymentForOnline} onChange={(v) => updatePaymentGateway('requirePaymentForOnline', v)} label="Require Payment for Online Consultation" description="Patient must pay before video slot is confirmed" />
                        <Toggle enabled={settings.paymentGateway.requirePaymentForClinic} onChange={(v) => updatePaymentGateway('requirePaymentForClinic', v)} label="Require Payment for In-Clinic Visit" description="Patient must pay online before clinic slot is confirmed" />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* NOTICE BOARD */}
              {section.id === 'notice' && (
                <div className="space-y-4">
                  <Toggle enabled={settings.noticeBoard.enabled} onChange={(v) => updateNotice('enabled', v)} label="Enable Notice Board" description="Show an important notice to patients on the booking page" />
                  {settings.noticeBoard.enabled && (
                    <>
                      <Select label="Notice Type" value={settings.noticeBoard.type} onChange={(v) => updateNotice('type', v)} options={['info', 'warning', 'maintenance']} />
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1.5 block">Notice Message</label>
                        <textarea value={settings.noticeBoard.message} onChange={(e) => updateNotice('message', e.target.value)} rows={3} placeholder="e.g. Dr. is on leave tomorrow. Bookings temporarily unavailable."
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A75BB]/30" />
                      </div>
                      <div className={cn('rounded-lg p-3 text-sm',
                        settings.noticeBoard.type === 'info' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                        settings.noticeBoard.type === 'warning' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                        'bg-red-50 text-red-800 border border-red-200'
                      )}>
                        Preview: {settings.noticeBoard.message || 'Your notice message will appear here'}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* INTERNATIONAL BOOKING */}
              {section.id === 'international' && (
                <div className="space-y-6">
                  <Toggle enabled={settings.international.enabled} onChange={(v) => updateInternational('enabled', v)} label="Enable International Booking" description="Allow international patients to book video consultations" />

                  {settings.international.enabled && (
                    <>
                      <div className="border-t border-gray-100 pt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Fee & Currency</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <Input label="Consultation Fee" type="number" value={String(settings.international.fee)} onChange={(v) => updateInternational('fee', parseInt(v) || 0)} placeholder="25" />
                          <Select label="Currency" value={settings.international.currency} onChange={(v) => updateInternational('currency', v)} options={['USD', 'EUR', 'GBP', 'INR', 'AED', 'SGD']} />
                          <Input label="Max Advance Booking (days)" type="number" value={String(settings.international.maxAdvanceBookingDays)} onChange={(v) => updateInternational('maxAdvanceBookingDays', parseInt(v) || 30)} />
                          <div className="flex items-end">
                            <p className="h-10 px-3 border border-gray-200 rounded-lg text-sm flex items-center bg-gray-50">
                              {settings.international.currency === 'INR' ? `₹${settings.international.fee}` : `${settings.international.currency === 'EUR' ? '€' : settings.international.currency === 'GBP' ? '£' : '$'}${settings.international.fee}`}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Form Requirements</h4>
                        <Toggle enabled={settings.international.requireCountry} onChange={(v) => updateInternational('requireCountry', v)} label="Require Country" description="Patient must select their country" />
                        <Toggle enabled={settings.international.requireTimezone} onChange={(v) => updateInternational('requireTimezone', v)} label="Require Timezone" description="Patient must select their timezone" />
                        <Toggle enabled={settings.international.requireMessage} onChange={(v) => updateInternational('requireMessage', v)} label="Require Message" description="Patient must describe their condition" />
                        <Toggle enabled={settings.international.autoConfirm} onChange={(v) => updateInternational('autoConfirm', v)} label="Auto-Confirm Bookings" description="Automatically confirm international bookings without manual approval" />
                      </div>

                      <div className="border-t border-gray-100 pt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Countries</h4>
                        <ListManager title="Available Countries" items={settings.international.countries} onAdd={(v) => addInternationalListItem('countries', v)} onRemove={(i) => removeInternationalListItem('countries', i)} />
                      </div>

                      <div className="border-t border-gray-100 pt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Timezones</h4>
                        <ListManager title="Available Timezones" items={settings.international.timezones} onAdd={(v) => addInternationalListItem('timezones', v)} onRemove={(i) => removeInternationalListItem('timezones', i)} />
                      </div>

                      <div className="border-t border-gray-100 pt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Medical Conditions</h4>
                        <ListManager title="Conditions List" items={settings.international.conditions} onAdd={(v) => addInternationalListItem('conditions', v)} onRemove={(i) => removeInternationalListItem('conditions', i)} />
                      </div>

                      <div className="border-t border-gray-100 pt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Languages</h4>
                        <ListManager title="Supported Languages" items={settings.international.allowedLanguages} onAdd={(v) => addInternationalListItem('allowedLanguages', v)} onRemove={(i) => removeInternationalListItem('allowedLanguages', i)} />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <div className="flex justify-end">
        <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-[#0A75BB] text-white rounded-xl text-sm font-medium hover:bg-[#085a94] transition-colors shadow-sm">
          <Save className="h-4 w-4" /> {saved ? 'Saved!' : 'Save Booking Settings'}
        </button>
      </div>
    </div>
  );
}
