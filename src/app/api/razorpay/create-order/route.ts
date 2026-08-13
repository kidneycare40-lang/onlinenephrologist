import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getDb } from '@/lib/db/client';
import { getConsultationPricing, toRazorpayAmount } from '@/lib/pricing';
import { applyRateLimit, apiError } from '@/lib/auth/middleware';

// Server-side only — never expose the secret to the browser
function getRazorpay(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function POST(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'booking');
    if (rlError) return rlError;

    const body = await request.json();
    const { bookingId, patientName, patientPhone, patientEmail, patientCountry, consultationType } = body;

    if (!bookingId || !patientName) {
      return apiError('bookingId and patientName are required', 400);
    }

    const rzp = getRazorpay();
    if (!rzp) {
      return apiError('Razorpay is not configured. Contact the clinic.', 503);
    }

    // Never trust amount/currency from the browser — derive from consultation type server-side
    const pricing = getConsultationPricing(consultationType);
    const amountPaise = toRazorpayAmount(pricing);

    // Check for existing captured payment to prevent duplicates
    const db = getDb();
    const { data: existing } = await db
      .from('booking_payments')
      .select('*')
      .eq('booking_id', bookingId)
      .eq('payment_status', 'CAPTURED')
      .limit(1);

    if (existing && existing.length > 0) {
      return apiError('This booking has already been paid.', 409, { alreadyPaid: true });
    }

    const order = await rzp.orders.create({
      amount: amountPaise,
      currency: pricing.currency,
      receipt: bookingId,
      notes: {
        booking_id: bookingId,
        patient_name: patientName,
        consultation_type: consultationType || '',
        patient_country: patientCountry || '',
      },
    });

    // Store order record
    await db.from('booking_payments').upsert(
      {
        booking_id: bookingId,
        patient_name: patientName,
        patient_phone: patientPhone || null,
        patient_email: patientEmail || null,
        patient_country: patientCountry || null,
        consultation_type: consultationType || null,
        amount: pricing.amount,
        currency: pricing.currency,
        razorpay_order_id: order.id,
        payment_status: 'CREATED',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'booking_id' }
    );

    return NextResponse.json({
      orderId: order.id,
      amount: pricing.amount,
      currency: pricing.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      bookingId,
    });
  } catch (error) {
    console.error('CREATE ORDER error:', error);
    const detail = error instanceof Error ? error.message : String(error);
    return apiError('Failed to create payment order. If you are an international patient, please ensure your Razorpay account supports USD payments.', 500, { detail });
  }
}