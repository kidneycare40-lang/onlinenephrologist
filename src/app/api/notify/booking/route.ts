import { NextRequest, NextResponse } from 'next/server';
import { sendBookingNotifications } from '@/lib/notifications';
import { applyRateLimit } from '@/lib/auth/middleware';

export async function POST(req: NextRequest) {
  try {
    const rlError = applyRateLimit(req, 'notify');
    if (rlError) return rlError;

    const body = await req.json();
    const result = await sendBookingNotifications({
      bookingId: body.bookingId || '',
      clinicName: body.clinicName || '',
      patientName: body.patientName || '',
      patientPhone: body.patientPhone || '',
      patientEmail: body.patientEmail || undefined,
      ageGender: body.ageGender || '',
      date: body.date || '',
      time: body.time || '',
      consultationType: body.consultationType || '',
      reason: body.reason || '',
      fee: body.fee || '',
      paymentId: body.paymentId || undefined,
      country: body.country || undefined,
      timezone: body.timezone || undefined,
      complaints: body.complaints || undefined,
      medicines: body.medicines || undefined,
      notes: body.notes || undefined,
      localTimeDisplay: body.localTimeDisplay || undefined,
    });

    return NextResponse.json({ ok: true, result });
  } catch (e) {
    console.error('[notify/booking] Error:', e);
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}
