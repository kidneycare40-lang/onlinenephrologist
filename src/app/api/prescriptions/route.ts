import { NextRequest, NextResponse } from 'next/server';
import { PrescriptionRepository } from '@/lib/db/services';

const prescriptionRepo = new PrescriptionRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const id = searchParams.get('id');
    if (id) {
      const prescription = await prescriptionRepo.findByIdWithRelations(id);
      if (!prescription) {
        return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
      }
      return NextResponse.json(prescription);
    }

    const patientId = searchParams.get('patientId');
    if (patientId) {
      const limit = parseInt(searchParams.get('limit') || '20');
      const prescriptions = await prescriptionRepo.findByPatientId(patientId, limit);
      return NextResponse.json(prescriptions);
    }

    const templates = searchParams.get('templates');
    if (templates === 'true') {
      const prescriptions = await prescriptionRepo.findTemplates();
      return NextResponse.json(prescriptions);
    }

    // List all prescriptions (with optional filters)
    const status = searchParams.get('status');
    const allPrescriptions = await prescriptionRepo.findAllWithRelations(status || undefined);
    return NextResponse.json(allPrescriptions);

  } catch (error) {
    console.error('GET /api/prescriptions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patient_id, doctor_id, clinic_id, consultation_id, prescription_date, notes, is_template, template_name, medicines, investigations, follow_up_date, status } = body;

    if (!patient_id || !doctor_id || !clinic_id) {
      return NextResponse.json(
        { error: 'Patient, doctor, and clinic are required' },
        { status: 400 }
      );
    }

    const prescription = await prescriptionRepo.createWithMedicines(
      {
        patient_id,
        doctor_id,
        clinic_id,
        consultation_id: consultation_id || null,
        prescription_date: prescription_date || new Date().toISOString().split('T')[0],
        notes: notes || null,
        diagnosis: body.diagnosis || null,
        advice: body.advice || null,
        follow_up_date: follow_up_date || null,
        is_template: is_template || false,
        template_name: template_name || null,
        template_category: body.template_category || null,
        status: status || 'Active',
      },
      medicines || [],
      investigations
    );

    if (!prescription) {
      return NextResponse.json({ error: 'Failed to create prescription' }, { status: 500 });
    }

    return NextResponse.json(prescription, { status: 201 });

  } catch (error) {
    console.error('POST /api/prescriptions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Prescription ID is required' }, { status: 400 });
    }

    const prescription = await prescriptionRepo.update(id, {
      ...updateData,
      updated_at: new Date().toISOString(),
    });

    if (!prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
    }

    return NextResponse.json(prescription);

  } catch (error) {
    console.error('PUT /api/prescriptions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Prescription ID is required' }, { status: 400 });
    }

    const success = await prescriptionRepo.softDelete(id);
    if (!success) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('DELETE /api/prescriptions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
