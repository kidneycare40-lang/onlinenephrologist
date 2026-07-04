import { NextRequest, NextResponse } from 'next/server';
import { getConsultationService } from '@/lib/db/services';
import { logAudit, logActivity } from '@/lib/db/audit';
import type { FilterParams, PaginationParams } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const consultationService = getConsultationService();

    const id = searchParams.get('id');
    if (id) {
      const consultation = await consultationService.getById(id);
      if (!consultation) {
        return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
      }
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

    return NextResponse.json({ error: 'Query parameter required: id, patientId, or doctorId+date' }, { status: 400 });

  } catch (error) {
    console.error('GET /api/consultations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const consultationService = getConsultationService();

    if (!body.patient_id || !body.doctor_id || !body.clinic_id) {
      return NextResponse.json(
        { error: 'Patient, doctor, and clinic are required' },
        { status: 400 }
      );
    }

    const consultation = await consultationService.create(body);

    logAudit({ action: 'CREATE', entityType: 'consultation', entityId: consultation?.id, newValues: { patient_id: body.patient_id, doctor_id: body.doctor_id } });
    logActivity({ patientId: body.patient_id, action: 'consultation_created', description: 'New consultation' });

    return NextResponse.json(consultation, { status: 201 });

  } catch (error) {
    console.error('POST /api/consultations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Consultation ID is required' }, { status: 400 });
    }

    const consultationService = getConsultationService();

    if (action === 'complete') {
      const consultation = await consultationService.complete(id);
      logAudit({ action: 'UPDATE', entityType: 'consultation', entityId: id, newValues: { status: 'COMPLETED' } });
      return NextResponse.json(consultation);
    }

    const consultation = await consultationService.update(id, updateData);
    logAudit({ action: 'UPDATE', entityType: 'consultation', entityId: id, newValues: updateData });
    return NextResponse.json(consultation);

  } catch (error) {
    console.error('PUT /api/consultations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Consultation ID is required' }, { status: 400 });
    }

    const consultationService = getConsultationService();
    const success = await consultationService.delete(id);
    if (!success) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }

    logAudit({ action: 'DELETE', entityType: 'consultation', entityId: id });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('DELETE /api/consultations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
