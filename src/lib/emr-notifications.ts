import { getDb } from '@/lib/db/client';

export type NotificationType =
  | 'booking_created'
  | 'payment_received'
  | 'booking_cancelled'
  | 'booking_updated'
  | 'consultation_completed';

interface CreateNotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  bookingId?: string;
  patientName?: string;
  patientPhone?: string;
  clinicId?: string;
  amount?: number;
  currency?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Insert an EMR notification (in-app bell icon).
 * Non-blocking — catches and logs errors so booking/payment flow is not interrupted.
 */
export async function createEmrNotification(params: CreateNotificationParams): Promise<void> {
  try {
    const db = getDb();
    const { error } = await db.from('emr_notifications').insert({
      type: params.type,
      title: params.title,
      message: params.message,
      booking_id: params.bookingId || null,
      patient_name: params.patientName || null,
      patient_phone: params.patientPhone || null,
      clinic_id: params.clinicId || null,
      amount: params.amount || null,
      currency: params.currency || 'INR',
      is_read: false,
      metadata: params.metadata || {},
    });
    if (error) {
      console.error('[createEmrNotification] insert error:', error);
    }
  } catch (err) {
    console.error('[createEmrNotification] error:', err);
  }
}

/** Convenience: booking created notification */
export async function notifyBookingCreated(booking: {
  bookingId: string;
  firstName: string;
  lastName?: string;
  phone: string;
  consultationType: string;
  clinicId: string;
  bookingDate: string;
  bookingTime: string;
  consultationFee?: number;
  consultationFeeCurrency?: string;
  isInternational?: boolean;
}): Promise<void> {
  const name = [booking.firstName, booking.lastName].filter(Boolean).join(' ');
  const typeLabel = booking.consultationType === 'online_intl'
    ? 'International Video'
    : booking.consultationType === 'online'
    ? 'Online Video'
    : booking.consultationType === 'hospital'
    ? 'Hospital Visit'
    : 'In-Clinic';
  const clinicLabel = booking.clinicId || 'Online';

  await createEmrNotification({
    type: 'booking_created',
    title: 'New Appointment Booked',
    message: `${name} booked a ${typeLabel} consultation for ${booking.bookingDate} at ${booking.bookingTime}`,
    bookingId: booking.bookingId,
    patientName: name,
    patientPhone: booking.phone,
    clinicId: booking.clinicId,
    amount: booking.consultationFee,
    currency: booking.consultationFeeCurrency || 'INR',
    metadata: {
      consultationType: booking.consultationType,
      clinicLabel,
      isInternational: booking.isInternational || false,
    },
  });
}

/** Convenience: payment received notification */
export async function notifyPaymentReceived(booking: {
  bookingId: string;
  firstName: string;
  lastName?: string;
  phone: string;
  amount: number;
  currency: string;
  paymentId?: string;
  clinicId?: string;
}): Promise<void> {
  const name = [booking.firstName, booking.lastName].filter(Boolean).join(' ');
  const amountStr = booking.currency === 'USD' ? `$${booking.amount.toFixed(2)}` : `₹${booking.amount.toFixed(0)}`;

  await createEmrNotification({
    type: 'payment_received',
    title: 'Payment Received',
    message: `${name} paid ${amountStr} for appointment ${booking.bookingId}`,
    bookingId: booking.bookingId,
    patientName: name,
    patientPhone: booking.phone,
    clinicId: booking.clinicId,
    amount: booking.amount,
    currency: booking.currency,
    metadata: {
      paymentId: booking.paymentId || null,
    },
  });
}
