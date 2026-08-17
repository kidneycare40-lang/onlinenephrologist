import { NextRequest, NextResponse } from 'next/server';
import { autoCreateBookingInvoice } from '@/lib/auto-invoice';
import { applyRateLimit, apiError } from '@/lib/auth/middleware';

/**
 * POST /api/bookings/auto-invoice
 * Creates a PENDING invoice for offline/in-clinic bookings.
 * Online payments are auto-invoiced via the Razorpay verify/webhook routes.
 */
export async function POST(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'booking');
    if (rlError) return rlError;

    const body = await request.json();
    const { bookingId, patientName, patientPhone, clinicId, consultationType, consultationFee, currency, date, reason, paymentMethod } = body;

    if (!bookingId || !patientName || !patientPhone) {
      return apiError('bookingId, patientName, and patientPhone are required', 400);
    }

    const invoiceId = await autoCreateBookingInvoice({
      bookingId,
      patientName,
      patientPhone,
      clinicId: clinicId || 'kcc-faridabad',
      consultationType: consultationType || 'offline',
      consultationFee: consultationFee || 0,
      currency: currency || 'INR',
      date,
      reason,
      paymentMethod: paymentMethod || 'CASH',
      paymentStatus: 'PENDING',
    });

    return NextResponse.json({ success: true, invoiceId });
  } catch (error) {
    console.error('[auto-invoice API] Error:', error);
    return apiError('Failed to create invoice', 500);
  }
}
