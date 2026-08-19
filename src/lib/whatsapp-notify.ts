const CALLMEBOT_API_URL = 'https://api.callmebot.com/whatsapp.php';

export const DOCTOR_PHONES = ['919818235613', '919818235688'];

export interface BookingNotification {
  bookingId: string;
  clinicName: string;
  patientName: string;
  patientPhone: string;
  ageGender: string;
  date: string;
  time: string;
  consultationType: string;
  reason: string;
  fee: string;
  paymentStatus: string;
  paymentId?: string;
  country?: string;
  timezone?: string;
  complaints?: string;
  medicines?: string;
  notes?: string;
  localTimeDisplay?: string;
}

export function buildDoctorMessage(n: BookingNotification): string {
  const typeLabel =
    n.consultationType === 'online_intl' ? 'International Online' :
    n.consultationType === 'online' ? 'Online' :
    n.consultationType === 'hospital' ? 'Hospital' : 'In-Clinic';

  return [
    `*New Booking — ${typeLabel}*`,
    ``,
    `Booking ID: ${n.bookingId}`,
    `Clinic: ${n.clinicName}`,
    `Patient: ${n.patientName}`,
    `Age/Gender: ${n.ageGender}`,
    `WhatsApp: ${n.patientPhone}`,
    `Date: ${n.date} at ${n.time} IST${n.localTimeDisplay ? ` (local: ${n.localTimeDisplay})` : ''}`,
    `Reason: ${n.reason}`,
    `Fee: ${n.fee}`,
    n.country ? `Country: ${n.country}` : '',
    n.timezone ? `Timezone: ${n.timezone}` : '',
    `Payment: ${n.paymentStatus}${n.paymentId ? ` — ${n.paymentId}` : ''}`,
    ``,
    `--- Medical ---`,
    `Complaints: ${n.complaints || 'Not provided'}`,
    `Medicines: ${n.medicines || 'Not provided'}`,
    `Notes: ${n.notes || 'None'}`,
  ].filter(Boolean).join('\n');
}
