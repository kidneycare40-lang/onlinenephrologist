import { NextRequest, NextResponse } from 'next/server';
import { getPatientService } from '@/lib/db/services';
import { logAudit, logActivity } from '@/lib/db/audit';
import type { FilterParams, PaginationParams, SortParams } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientService = getPatientService();

    // Check for specific patient by ID
    const id = searchParams.get('id');
    if (id) {
      const patient = await patientService.getById(id);
      if (!patient) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      }
      return NextResponse.json(patient);
    }

    // Check for UHID lookup
    const uhid = searchParams.get('uhid');
    if (uhid) {
      const patient = await patientService.getByUHID(uhid);
      if (!patient) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      }
      return NextResponse.json(patient);
    }

    // Check for search query
    const query = searchParams.get('q');
    if (query && query.length >= 2) {
      const results = await patientService.search(query, parseInt(searchParams.get('limit') || '20'));
      return NextResponse.json(results);
    }

    // List with pagination and filters
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const patientService = getPatientService();

    // Validate required fields
    if (!body.first_name || !body.last_name || !body.phone) {
      return NextResponse.json(
        { error: 'First name, last name, and phone are required' },
        { status: 400 }
      );
    }

    const patient = await patientService.create(body, body.created_by);
    if (!patient) {
      return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
    }

    logAudit({ userId: body.created_by, action: 'CREATE', entityType: 'patient', entityId: patient.id, newValues: { first_name: body.first_name, last_name: body.last_name, phone: body.phone } });
    logActivity({ userId: body.created_by, patientId: patient.id, action: 'patient_created', description: `New patient: ${body.first_name} ${body.last_name}` });

    return NextResponse.json(patient, { status: 201 });

  } catch (error: any) {
    console.error('POST /api/patients error:', error);

    // Handle unique constraint violations
    if (error?.code === '23505') {
      if (error?.message?.includes('phone')) {
        return NextResponse.json({ error: 'Phone number already registered' }, { status: 409 });
      }
      if (error?.message?.includes('uhid')) {
        return NextResponse.json({ error: 'UHID already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Duplicate entry' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    const patientService = getPatientService();
    const patient = await patientService.update(id, updateData, updateData.updated_by);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    logAudit({ userId: updateData.updated_by, action: 'UPDATE', entityType: 'patient', entityId: id, newValues: updateData });

    return NextResponse.json(patient);

  } catch (error) {
    console.error('PUT /api/patients error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    const patientService = getPatientService();
    const success = await patientService.delete(id);
    if (!success) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    logAudit({ action: 'DELETE', entityType: 'patient', entityId: id });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('DELETE /api/patients error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
