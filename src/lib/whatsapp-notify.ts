const CALLMEBOT_API_URL = 'https://api.callmebot.com/whatsapp.php';

export const DOCTOR_PHONES = ['919818235613', '919818235688'];

export interface BookingNotification {
  bookingId: string;
  clinicName: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  ageGender: string;
  age?: string;
  gender?: string;
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
  relationship?: string;
  bookedByPatientName?: string;
  doctorName?: string;
  reportsUploaded?: boolean;
  ultrasoundUploaded?: boolean;
}

export function buildDoctorMessage(n: BookingNotification): string {
  const typeLabel =
    n.consultationType === 'online_intl' ? 'International Online Video Consultation' :
    n.consultationType === 'online' ? 'Online Video Consultation' :
    n.consultationType === 'hospital' ? 'Hospital Visit' : 'In-Clinic Consultation';

  const isFamily = n.relationship && n.relationship !== 'self';
  const doctor = n.doctorName || 'Dr. Rajesh Goel';

  const lines = [
    `*NEW APPOINTMENT — PAYMENT CONFIRMED*`,
    ``,
    `Booking ID: ${n.bookingId}`,
    ``,
    `Patient: ${n.patientName}`,
    `Age/Gender: ${n.ageGender}`,
    `Phone: ${n.patientPhone}`,
  ];

  if (isFamily) {
    lines.push(`Relationship: ${n.relationship}`);
    lines.push(`Booked By: ${n.bookedByPatientName || 'Account holder'}`);
  }

  lines.push(
    ``,
    `Doctor: ${doctor}`,
    `Speciality: Nephrology`,
    `Type: ${typeLabel}`,
    ``,
    `Date: ${n.date}`,
    `Time: ${n.time} IST${n.localTimeDisplay ? ` (local: ${n.localTimeDisplay})` : ''}`,
  );

  if (n.clinicName) {
    lines.push(`Location: ${n.clinicName}`);
  }

  lines.push(
    ``,
    `Fee: ${n.fee}`,
    `Payment: CAPTURED`,
  );

  if (n.paymentId) {
    lines.push(`Payment ID: ${n.paymentId}`);
  }

  const hasReports = n.complaints || n.medicines || n.notes;
  lines.push(`Reports: ${n.reportsUploaded ? 'Uploaded' : 'Not uploaded'}`);

  if (n.patientEmail) {
    lines.push(`Patient Email: ${n.patientEmail}`);
  }

  if (n.country) {
    lines.push(`Country: ${n.country}`);
  }

  lines.push(
    ``,
    `Please check the appointment in EMR.`,
  );

  return lines.join('\n');
}
