import { NextRequest, NextResponse } from 'next/server';
import { sendBookingWhatsApp, type BookingNotification } from '@/lib/whatsapp-notify';
import { applyRateLimit } from '@/lib/auth/middleware';

export async function POST(req: NextRequest) {
  try {
    const rlError = applyRateLimit(req, 'notify');
    if (rlError) return rlError;

    const body = await req.json();
    const notification: BookingNotification = {
      bookingId: body.bookingId || '',
      clinicName: body.clinicName || '',
      patientName: body.patientName || '',
      patientPhone: body.patientPhone || '',
      ageGender: body.ageGender || '',
      date: body.date || '',
      time: body.time || '',
      consultationType: body.consultationType || '',
      reason: body.reason || '',
      fee: body.fee || '',
      paymentStatus: body.paymentStatus || 'UNPAID',
      paymentId: body.paymentId || undefined,
      country: body.country || undefined,
      timezone: body.timezone || undefined,
      complaints: body.complaints || undefined,
      medicines: body.medicines || undefined,
      notes: body.notes || undefined,
      localTimeDisplay: body.localTimeDisplay || undefined,
    };

    await sendBookingWhatsApp(notification);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[notify/booking] Error:', e);
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}
