'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/constants';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BreadcrumbSchema, HowToSchema } from '@/components/seo/JsonLd';
import { loadBookingSettings } from '@/components/emr/BookingSettings';

export default function BookOnlineConsultationPage() {
  const intlSettings = useMemo(() => loadBookingSettings().international, []);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    timezone: '',
    date: '',
    time: '',
    condition: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bookingId = `intl-${Date.now()}`;
    const booking = {
      bookingId,
      firstName: formData.name.split(' ')[0] || formData.name,
      lastName: formData.name.split(' ').slice(1).join(' ') || '',
      phone: formData.phone,
      email: formData.email,
      age: '',
      gender: '',
      consultationType: 'online_intl',
      clinicId: 'online-intl',
      date: formData.date,
      time: formData.time,
      reason: formData.condition,
      message: formData.message,
      country: formData.country,
      timezone: formData.timezone,
      createdAt: new Date().toISOString(),
      status: intlSettings.autoConfirm ? 'confirmed' : 'pending',
      consultationFee: intlSettings.fee,
      paymentStatus: 'unpaid',
    };
    try {
      const existing = JSON.parse(localStorage.getItem('emr_bookings') || '[]');
      existing.push(booking);
      localStorage.setItem('emr_bookings', JSON.stringify(existing));
    } catch { /* ignore */ }

    // Also add patient to emr_added_patients so they appear in EMR Patients list
    try {
      const patientRecord = {
        id: bookingId,
        firstName: formData.name.split(' ')[0] || formData.name,
        lastName: formData.name.split(' ').slice(1).join(' ') || '',
        phone: formData.phone || '',
        email: formData.email,
        dateOfBirth: '',
        gender: '',
        clinicId: 'online-intl',
        source: 'website' as const,
        consultationType: 'online_intl' as const,
        isActive: true,
        isChronic: false,
        uhid: `ONLINE-${new Date().getFullYear()}/${String(Math.floor(Math.random() * 9000) + 1000)}`,
        lastVisit: formData.date || new Date().toISOString().split('T')[0],
        totalVisits: 1,
        createdAt: new Date().toISOString(),
      };
      const addedPatients = JSON.parse(localStorage.getItem('emr_added_patients') || '[]');
      const exists = addedPatients.some((p: any) =>
        (p.email && p.email.toLowerCase() === formData.email.toLowerCase()) ||
        (p.phone && p.phone === formData.phone)
      );
      if (!exists) {
        addedPatients.push(patientRecord);
        localStorage.setItem('emr_added_patients', JSON.stringify(addedPatients));
      }
    } catch { /* ignore */ }
    const whatsappMessage = `Hi, I want to book an online consultation.%0A%0AName: ${formData.name}%0AEmail: ${formData.email}%0APhone: ${formData.phone}%0ACountry: ${formData.country}%0ATimezone: ${formData.timezone}%0ADate: ${formData.date}%0ATime: ${formData.time}%0ACondition: ${formData.condition}%0AMessage: ${formData.message}`;
    window.open(`https://wa.me/${SITE_CONFIG.whatsapp}?text=${whatsappMessage}`, '_blank');
    setSubmitted(true);
  };

  const countries = intlSettings.countries;
  const timezones = intlSettings.timezones;
  const conditions = intlSettings.conditions;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h1>
          <p className="text-gray-600 mb-6">Your consultation request has been sent via WhatsApp. Dr Rajesh Goel will confirm your appointment shortly.</p>
          <div className="bg-green-50 rounded-xl p-4 mb-6">
            <p className="text-sm font-semibold text-gray-900 mb-2">Or call/WhatsApp directly:</p>
            <a href={`https://wa.me/${SITE_CONFIG.whatsapp}`} className="inline-flex items-center gap-2 px-5 py-3 bg-[#25D366] text-white font-bold rounded-lg hover:bg-[#1da851] transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Chat on WhatsApp
            </a>
            <p className="text-xs text-gray-500 mt-2">+91 9818235613</p>
          </div>
          <Link href="/medical-tourism" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A75BB] text-white font-semibold rounded-lg hover:bg-[#085a94]">
            Back to Medical Tourism
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <section className="bg-gradient-to-br from-[#0A75BB] to-[#063d5c] text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Book Online Consultation</h1>
          <p className="text-blue-100 text-lg">Consult Dr Rajesh Goel from anywhere in the world via video call</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2">
            <span className="text-2xl font-bold">{intlSettings.currency === 'INR' ? '₹' : intlSettings.currency === 'EUR' ? '€' : intlSettings.currency === 'GBP' ? '£' : '$'}{intlSettings.fee}</span>
            <span className="text-blue-200">{intlSettings.currency}</span>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Patient Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent" placeholder="Enter your full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent" placeholder="+1 234 567 8900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                <select required value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent">
                  <option value="">Select country</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone *</label>
                <select required value={formData.timezone} onChange={(e) => setFormData({...formData, timezone: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent">
                  <option value="">Select timezone</option>
                  {timezones.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medical Condition *</label>
                <select required value={formData.condition} onChange={(e) => setFormData({...formData, condition: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent">
                  <option value="">Select condition</option>
                  {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date *</label>
                <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time (IST) *</label>
                <select required value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent">
                  <option value="">Select time</option>
                  {['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Message</label>
              <textarea rows={4} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A75BB] focus:border-transparent" placeholder="Describe your medical condition, attach reports later via WhatsApp..."></textarea>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">📋 What to Have Ready:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Recent blood reports (Creatinine, eGFR, BUN)</li>
                <li>• Urine reports</li>
                <li>• Imaging studies (Ultrasound/CT if available)</li>
                <li>• Current medication list</li>
                <li>• Previous medical records</li>
              </ul>
            </div>

            <button type="submit" className="w-full py-4 bg-[#0A75BB] text-white font-bold rounded-xl hover:bg-[#085a94] transition-colors text-lg flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Submit via WhatsApp
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              You will be redirected to WhatsApp to confirm your appointment. Payment details will be shared via WhatsApp.
            </p>
          </form>
        </div>
      </section>

      <BreadcrumbSchema
        items={[
          { name: 'Home', url: SITE_CONFIG.url },
          { name: 'Book Online Consultation', url: `${SITE_CONFIG.url}/book-online-consultation` },
        ]}
      />
      <HowToSchema />
      <Footer />
    </>
  );
}
