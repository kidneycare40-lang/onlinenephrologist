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
    const { bookingId, patientName, patientPhone, patientEmail, patientCountry, consultationType, amount: clientAmount, currency: clientCurrency } = body;

    if (!bookingId || !patientName) {
      return apiError('bookingId and patientName are required', 400);
    }

    const rzp = getRazorpay();
    if (!rzp) {
      return apiError('Razorpay is not configured. Contact the clinic.', 503);
    }

    // Use the actual clinic-specific fee sent by the client (from KV store settings),
    // validated against known base pricing to prevent abuse
    const pricing = getConsultationPricing(consultationType);
    const amount = (typeof clientAmount === 'number' && clientAmount > 0 && clientAmount <= pricing.amount * 5)
      ? clientAmount
      : pricing.amount;
    const currency = clientCurrency || pricing.currency;
    const amountPaise = amount * 100;

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
      currency: currency,
      receipt: bookingId,
      notes: {
        booking_id: bookingId,
        patient_name: patientName,
        consultation_type: consultationType || '',
        patient_country: patientCountry || '',
      },
    });

    // Store order record — check for existing record first, then update or insert
    const { data: existingRecord } = await db
      .from('booking_payments')
      .select('id, payment_status')
      .eq('booking_id', bookingId)
      .limit(1);

    const paymentRow = {
      booking_id: bookingId,
      patient_name: patientName,
      patient_phone: patientPhone || null,
      patient_email: patientEmail || null,
      patient_country: patientCountry || null,
      consultation_type: consultationType || null,
      amount: amount,
      currency: currency,
      razorpay_order_id: order.id,
      payment_status: 'CREATED',
      updated_at: new Date().toISOString(),
    };

    if (existingRecord && existingRecord.length > 0) {
      await db.from('booking_payments').update(paymentRow).eq('id', existingRecord[0].id);
    } else {
      const { error: insertError } = await db.from('booking_payments').insert(paymentRow);
      if (insertError) {
        console.error('[create-order] Failed to store payment record:', insertError);
        return apiError('Failed to store payment record', 500);
      }
    }

    return NextResponse.json({
      orderId: order.id,
      amount: amount,
      currency: currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      bookingId,
    });
  } catch (error) {
    console.error('CREATE ORDER error:', error);
    const detail = error instanceof Error ? error.message : String(error);
    return apiError('Failed to create payment order. If you are an international patient, please ensure your Razorpay account supports USD payments.', 500, { detail });
  }
}