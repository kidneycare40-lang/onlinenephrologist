import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { authenticateRequest, requirePermission, applyRateLimit, apiError } from '@/lib/auth/middleware';

// Admin: list booking payments (Razorpay) for the EMR dashboard
export async function GET(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api');
    if (rlError) return rlError;

    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const permError = requirePermission(user, 'billing', 'view');
    if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);

    let query = getDb()
      .from('booking_payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) query = query.eq('payment_status', status);

    const { data, error } = await query;
    if (error) return apiError('Failed to load payments', 500);
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('LIST BOOKING PAYMENTS error:', error);
    return apiError('Internal server error', 500);
  }
}