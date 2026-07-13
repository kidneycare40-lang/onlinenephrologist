import { NextRequest, NextResponse } from 'next/server';
import { getConsultationService } from '@/lib/db/services';
import { authenticateRequest, requirePermission, applyRateLimit, withAudit, apiError } from '@/lib/auth/middleware';
import type { FilterParams, PaginationParams } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api');
    if (rlError) return rlError;

    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const permError = requirePermission(user, 'consultations', 'view');
    if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const consultationService = getConsultationService();

    const id = searchParams.get('id');
    if (id) {
      const consultation = await consultationService.getById(id);
      if (!consultation) return apiError('Consultation not found', 404);
      return NextResponse.json(consultation);
    }

    const patientId = searchParams.get('patientId');
    if (patientId) {
      const limit = parseInt(searchParams.get('limit') || '20');
      const consultations = await consultationService.getByPatient(patientId, limit);
      return NextResponse.json(consultations);
    }

    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');
    if (doctorId && date) {
      const consultations = await consultationService.getByDoctorAndDate(doctorId, date);
      return NextResponse.json(consultations);
    }

    return apiError('Query parameter required: id, patientId, or doctorId+date', 400);
  } catch (error) {
    console.error('GET /api/consultations error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api');
    if (rlError) return rlError;

    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const permError = requirePermission(user, 'consultations', 'create');
    if (permError) return permError;

    const body = await request.json();
    const consultationService = getConsultationService();

    if (!body.patient_id || !body.doctor_id || !body.clinic_id) {
      return apiError('Patient, doctor, and clinic are required', 400);
    }

    const consultation = await consultationService.create({ ...body, created_by: user!.userId });
    withAudit('CREATE', 'consultation', user!.userId, consultation?.id, undefined, { patient_id: body.patient_id, doctor_id: body.doctor_id });
    return NextResponse.json(consultation, { status: 201 });
  } catch (error) {
    console.error('POST /api/consultations error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api');
    if (rlError) return rlError;

    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const body = await request.json();
    const { id, action, ...updateData } = body;
    if (!id) return apiError('Consultation ID is required', 400);

    const consultationService = getConsultationService();

    if (action === 'complete') {
      const permError = requirePermission(user, 'consultations', 'complete');
      if (permError) return permError;

      const consultation = await consultationService.complete(id);
      withAudit('UPDATE', 'consultation', user!.userId, id, undefined, { status: 'COMPLETED' });
      return NextResponse.json(consultation);
    }

    const editPerm = requirePermission(user, 'consultations', 'edit');
    if (editPerm) return editPerm;

    const consultation = await consultationService.update(id, { ...updateData, updated_by: user!.userId });
    withAudit('UPDATE', 'consultation', user!.userId, id, undefined, updateData);
    return NextResponse.json(consultation);
  } catch (error) {
    console.error('PUT /api/consultations error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api');
    if (rlError) return rlError;

    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const permError = requirePermission(user, 'consultations', 'delete');
    if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return apiError('Consultation ID is required', 400);

    const consultationService = getConsultationService();
    const success = await consultationService.delete(id);
    if (!success) return apiError('Consultation not found', 404);

    withAudit('DELETE', 'consultation', user!.userId, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/consultations error:', error);
    return apiError('Internal server error', 500);
  }
}
