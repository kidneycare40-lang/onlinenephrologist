import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getDb } from '@/lib/db/client';
import { applyRateLimit, apiError } from '@/lib/auth/middleware';

// Server-side only — never expose the secret to the browser
function getRazorpay(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

// Map consultationType (from booking form) to booking_services.slug
function consultationTypeToSlug(consultationType?: string | null, clinicId?: string | null): string | null {
  if (clinicId) {
    // clinic_id is already stored as the slug by the booking form
    return clinicId;
  }
  if (consultationType === 'online') return 'online';
  if (consultationType === 'online_intl') return 'online-intl';
  if (consultationType === 'hospital') return 'psri-delhi';
  if (consultationType === 'offline') return 'kcc-faridabad';
  return null;
}

// Read authoritative fee + currency from booking_services table.
// NEVER trust the client-supplied amount.
async function getServerPricing(slug: string): Promise<{ fee: number; currency: string } | null> {
  const db = getDb();
  const { data } = await db
    .from('booking_services')
    .select('fee, currency')
    .eq('slug', slug)
    .eq('enabled', true)
    .limit(1);
  if (data && data.length > 0) {
    return { fee: Number(data[0].fee), currency: data[0].currency };
  }
  return null;
}

export async function POST(request: NextRequest) {
  let consultationType: string | undefined;
  try {
    const rlError = applyRateLimit(request, 'booking');
    if (rlError) return rlError;

    const body = await request.json();
    const { bookingId, patientName, patientPhone, patientEmail, patientCountry, consultationType: ct, clinicId } = body;
    consultationType = ct;

    if (!bookingId || !patientName) {
      return apiError('bookingId and patientName are required', 400);
    }

    const rzp = getRazorpay();
    if (!rzp) {
      return apiError('Razorpay is not configured. Contact the clinic.', 503);
    }

    // Server-side authoritative pricing: read from booking_services table
    const slug = consultationTypeToSlug(consultationType, clinicId);
    let pricing: { fee: number; currency: string };

    if (slug) {
      const dbPricing = await getServerPricing(slug);
      if (dbPricing) {
        pricing = dbPricing;
      } else {
        // Fallback: service not found or disabled — reject
        return apiError('This consultation type is not currently available.', 400);
      }
    } else {
      // Unknown consultation type — reject
      return apiError('Invalid consultation type.', 400);
    }

    // Amount ALWAYS comes from DB — client-supplied amount is IGNORED
    const amount = pricing.fee;
    const currency = pricing.currency;
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
    const e = error as any;
    console.error('Razorpay create-order error:', {
      message: e?.message,
      code: e?.code,
      description: e?.description,
      field: e?.field,
      source: e?.source,
      step: e?.step,
      reason: e?.reason,
      metadata: e?.metadata,
      error: e?.error,
    });
    const isIntl = consultationType === 'online_intl';
    if (isIntl) {
      return apiError('International payment is temporarily unavailable. Please try again later or contact us for assistance.', 503);
    }
    return apiError('Payment could not be started. Please try again. If the problem continues, contact support.', 500);
  }
}
