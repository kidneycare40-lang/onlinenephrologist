import { api } from '@/lib/api-client';

export interface BookingRecord {
  bookingId: string;
  firstName: string;
  lastName: string;
  phone: string;
  clinicId: string;
  date: string;
  time: string;
  status: string;
  doctorName: string;
  consultationFee: number;
  consultationFeeCurrency: string;
  paymentStatus: string;
  consultationType: string;
  reason: string;
  complaints: string;
  currentMedications: string;
  notes: string;
  createdAt: string;
  email: string;
  age: string;
  gender: string;
}

export async function fetchBookings(params?: { clinicId?: string; date?: string; limit?: number }): Promise<BookingRecord[]> {
  try {
    const qs = new URLSearchParams();
    if (params?.clinicId) qs.set('clinicId', params.clinicId);
    if (params?.date) qs.set('date', params.date);
    if (params?.limit) qs.set('limit', String(params.limit));
    const q = qs.toString();
    const data = await api.get<any[]>(`/api/bookings${q ? '?' + q : ''}`);
    return (Array.isArray(data) ? data : []).map((row: any) => ({
      bookingId: row.bookingId || row.booking_id || '',
      firstName: row.firstName || row.first_name || '',
      lastName: row.lastName || row.last_name || '',
      phone: row.phone || '',
      clinicId: row.clinicId || row.clinic_id || '',
      date: row.date || row.booking_date || '',
      time: row.time || row.booking_time || '',
      status: row.status || 'pending',
      doctorName: row.doctorName || row.doctor_name || 'Dr. Rajesh Goel',
      consultationFee: row.consultationFee || row.consultation_fee || 0,
      consultationFeeCurrency: row.consultationFeeCurrency || row.consultation_fee_currency || 'INR',
      paymentStatus: row.paymentStatus || row.payment_status || 'unpaid',
      consultationType: row.consultationType || row.consultation_type || '',
      reason: row.reason || '',
      complaints: row.complaints || '',
      currentMedications: row.currentMedications || row.current_medications || '',
      notes: row.notes || '',
      createdAt: row.createdAt || row.created_at || '',
      email: row.email || '',
      age: row.age || '',
      gender: row.gender || '',
    }));
  } catch {
    return [];
  }
}
