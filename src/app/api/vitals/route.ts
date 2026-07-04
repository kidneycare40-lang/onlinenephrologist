import { NextRequest, NextResponse } from 'next/server';
import { VitalsRepository, KidneyParameterRepository } from '@/lib/db/services';

const vitalsRepo = new VitalsRepository();
const kidneyRepo = new KidneyParameterRepository();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const type = searchParams.get('type') || 'vitals';

    if (!patientId) {
      return NextResponse.json({ error: 'patientId is required' }, { status: 400 });
    }

    if (type === 'kidney') {
      const latest = await kidneyRepo.findLatestByPatient(patientId);
      const trend = await kidneyRepo.findTrendByPatient(patientId, parseInt(searchParams.get('limit') || '20'));
      return NextResponse.json({ latest, trend });
    }

    // Default: vitals
    const latest = await vitalsRepo.findLatestByPatient(patientId);
    const history = await vitalsRepo.findByPatientHistory(patientId, parseInt(searchParams.get('limit') || '50'));
    return NextResponse.json({ latest, history });

  } catch (error) {
    console.error('GET /api/vitals error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const type = body.type || 'vitals';

    if (!body.patient_id) {
      return NextResponse.json({ error: 'patient_id is required' }, { status: 400 });
    }

    if (type === 'kidney') {
      const record = await kidneyRepo.create({
        patient_id: body.patient_id,
        consultation_id: body.consultation_id || null,
        creatinine: body.creatinine,
        blood_urea: body.blood_urea,
        gfr: body.gfr,
        potassium: body.potassium,
        sodium: body.sodium,
        phosphorus: body.phosphorus,
        calcium: body.calcium,
        uric_acid: body.uric_acid,
        hemoglobin: body.hemoglobin,
        pth: body.pth,
        bicarbonate: body.bicarbonate,
        albumin: body.albumin,
        notes: body.notes || null,
        recorded_by: body.recorded_by || null,
        recorded_at: body.recorded_at || new Date().toISOString(),
      });
      if (!record) {
        return NextResponse.json({ error: 'Failed to create kidney parameters' }, { status: 500 });
      }
      return NextResponse.json(record, { status: 201 });
    }

    // Default: vitals
    const record = await vitalsRepo.create({
      patient_id: body.patient_id,
      consultation_id: body.consultation_id || null,
      blood_pressure_systolic: body.blood_pressure_systolic,
      blood_pressure_diastolic: body.blood_pressure_diastolic,
      heart_rate: body.heart_rate,
      temperature: body.temperature,
      respiratory_rate: body.respiratory_rate,
      oxygen_saturation: body.oxygen_saturation,
      weight: body.weight,
      height: body.height,
      bmi: body.bmi,
      notes: body.notes || null,
      recorded_by: body.recorded_by || null,
      recorded_at: body.recorded_at || new Date().toISOString(),
    });

    if (!record) {
      return NextResponse.json({ error: 'Failed to create vitals' }, { status: 500 });
    }

    return NextResponse.json(record, { status: 201 });

  } catch (error) {
    console.error('POST /api/vitals error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
