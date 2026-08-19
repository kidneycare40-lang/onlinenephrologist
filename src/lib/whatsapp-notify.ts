const CALLMEBOT_API_URL = 'https://api.callmebot.com/whatsapp.php';

const DOCTOR_PHONES = ['919818235613', '919818235688'];

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

function buildDoctorMessage(n: BookingNotification): string {
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

export async function sendBookingWhatsApp(n: BookingNotification): Promise<void> {
  const apiKey = process.env.CALLMEBOT_API_KEY;
  if (!apiKey) {
    console.warn('[whatsapp-notify] CALLMEBOT_API_KEY not set — skipping WhatsApp notification');
    return;
  }

  const message = buildDoctorMessage(n);

  const results = await Promise.allSettled(
    DOCTOR_PHONES.map(async (phone) => {
      const params = new URLSearchParams({
        phone,
        text: message,
        apikey: apiKey,
      });
      const res = await fetch(`${CALLMEBOT_API_URL}?${params.toString()}`);
      const body = await res.text();
      if (!res.ok) {
        console.error(`[whatsapp-notify] Failed to send to ${phone}: ${res.status} ${body}`);
        throw new Error(`WhatsApp send failed for ${phone}: ${res.status}`);
      }
      console.log(`[whatsapp-notify] Sent to ${phone}: ${body}`);
      return body;
    })
  );

  const failures = results.filter(r => r.status === 'rejected');
  if (failures.length === DOCTOR_PHONES.length) {
    throw new Error('All WhatsApp sends failed');
  } else if (failures.length > 0) {
    throw new Error(`${failures.length}/${DOCTOR_PHONES.length} WhatsApp sends failed`);
  }
}
