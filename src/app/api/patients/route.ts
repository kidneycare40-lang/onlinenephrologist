import { NextRequest, NextResponse } from 'next/server';
import { getPatientService } from '@/lib/db/services';
import { authenticateRequest, requirePermission, applyRateLimit, withAudit } from '@/lib/auth/middleware';
import { apiError } from '@/lib/auth/middleware';
import type { FilterParams, PaginationParams, SortParams } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api');
    if (rlError) return rlError;

    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const permError = requirePermission(user, 'patients', 'view');
    if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const patientService = getPatientService();

    const id = searchParams.get('id');
    if (id) {
      const patient = await patientService.getById(id);
      if (!patient) return apiError('Patient not found', 404);
      return NextResponse.json(patient);
    }

    const uhid = searchParams.get('uhid');
    if (uhid) {
      const patient = await patientService.getByUHID(uhid);
      if (!patient) return apiError('Patient not found', 404);
      return NextResponse.json(patient);
    }

    const query = searchParams.get('q');
    if (query && query.length >= 2) {
      const results = await patientService.search(query, parseInt(searchParams.get('limit') || '20'));
      return NextResponse.json(results);
    }

    const filters: FilterParams = {};
    const pagination: PaginationParams = {};
    const sort: SortParams = {};

    if (searchParams.get('search')) filters.search = searchParams.get('search')!;
    if (searchParams.get('clinicId')) filters.clinicId = searchParams.get('clinicId')!;
    if (searchParams.get('isActive')) filters.isActive = searchParams.get('isActive') === 'true';
    if (searchParams.get('page')) pagination.page = parseInt(searchParams.get('page')!);
    if (searchParams.get('limit')) pagination.limit = parseInt(searchParams.get('limit')!);
    if (searchParams.get('sortBy')) sort.sortBy = searchParams.get('sortBy')!;
    if (searchParams.get('sortOrder')) sort.sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc';

    const result = await patientService.list({ filters, pagination, sort });
    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/patients error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api');
    if (rlError) return rlError;

    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const permError = requirePermission(user, 'patients', 'create');
    if (permError) return permError;

    const body = await request.json();
    const patientService = getPatientService();

    if (!body.first_name || !body.last_name || !body.phone) {
      return apiError('First name, last name, and phone are required', 400);
    }

    const patient = await patientService.create(body, user!.userId);
    if (!patient) return apiError('Failed to create patient', 500);

    withAudit('CREATE', 'patient', user!.userId, patient.id, undefined, {
      first_name: body.first_name, last_name: body.last_name, phone: body.phone
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/patients error:', error);
    if (error?.code === '23505') {
      if (error?.message?.includes('phone')) return apiError('Phone number already registered', 409);
      if (error?.message?.includes('uhid')) return apiError('UHID already exists', 409);
      return apiError('Duplicate entry', 409);
    }
    return apiError('Internal server error', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api');
    if (rlError) return rlError;

    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const permError = requirePermission(user, 'patients', 'edit');
    if (permError) return permError;

    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) return apiError('Patient ID is required', 400);

    const patientService = getPatientService();
    const patient = await patientService.update(id, updateData, user!.userId);
    if (!patient) return apiError('Patient not found', 404);

    withAudit('UPDATE', 'patient', user!.userId, id, undefined, updateData);
    return NextResponse.json(patient);
  } catch (error) {
    console.error('PUT /api/patients error:', error);
    return apiError('Internal server error', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api');
    if (rlError) return rlError;

    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const permError = requirePermission(user, 'patients', 'delete');
    if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return apiError('Patient ID is required', 400);

    const patientService = getPatientService();
    const success = await patientService.delete(id);
    if (!success) return apiError('Patient not found', 404);

    withAudit('DELETE', 'patient', user!.userId, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/patients error:', error);
    return apiError('Internal server error', 500);
  }
}
