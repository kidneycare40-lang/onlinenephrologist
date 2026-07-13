import { NextRequest, NextResponse } from 'next/server';
import { VitalsRepository, KidneyParameterRepository } from '@/lib/db/services';
import { authenticateRequest, requirePermission, applyRateLimit, apiError } from '@/lib/auth/middleware';

const vitalsRepo = new VitalsRepository();
const kidneyRepo = new KidneyParameterRepository();

export async function GET(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'consultations', 'view'); if (permError) return permError;

    const { searchParams } = new URL(request.url); const patientId = searchParams.get('patientId');
    if (!patientId) return apiError('patientId is required', 400);
    const type = searchParams.get('type') || 'vitals';
    if (type === 'kidney') {
      const latest = await kidneyRepo.findLatestByPatient(patientId);
      const trend = await kidneyRepo.findTrendByPatient(patientId, parseInt(searchParams.get('limit') || '20'));
      return NextResponse.json({ latest, trend });
    }
    const latest = await vitalsRepo.findLatestByPatient(patientId);
    const history = await vitalsRepo.findByPatientHistory(patientId, parseInt(searchParams.get('limit') || '50'));
    return NextResponse.json({ latest, history });
  } catch (error) { console.error('GET /api/vitals error:', error); return apiError('Internal server error', 500); }
}

export async function POST(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'consultations', 'edit'); if (permError) return permError;

    const body = await request.json();
    if (!body.patient_id) return apiError('patient_id is required', 400);
    const type = body.type || 'vitals';

    if (type === 'kidney') {
      const record = await kidneyRepo.create({ patient_id: body.patient_id, consultation_id: body.consultation_id || null, creatinine: body.creatinine, blood_urea: body.blood_urea, gfr: body.gfr, potassium: body.potassium, sodium: body.sodium, phosphorus: body.phosphorus, calcium: body.calcium, uric_acid: body.uric_acid, hemoglobin: body.hemoglobin, pth: body.pth, bicarbonate: body.bicarbonate, albumin: body.albumin, notes: body.notes || null, recorded_by: user!.userId, recorded_at: body.recorded_at || new Date().toISOString() });
      if (!record) return apiError('Failed to create kidney parameters', 500);
      return NextResponse.json(record, { status: 201 });
    }
    const record = await vitalsRepo.create({ patient_id: body.patient_id, consultation_id: body.consultation_id || null, blood_pressure_systolic: body.blood_pressure_systolic, blood_pressure_diastolic: body.blood_pressure_diastolic, heart_rate: body.heart_rate, temperature: body.temperature, respiratory_rate: body.respiratory_rate, oxygen_saturation: body.oxygen_saturation, weight: body.weight, height: body.height, bmi: body.bmi, notes: body.notes || null, recorded_by: user!.userId, recorded_at: body.recorded_at || new Date().toISOString() });
    if (!record) return apiError('Failed to create vitals', 500);
    return NextResponse.json(record, { status: 201 });
  } catch (error) { console.error('POST /api/vitals error:', error); return apiError('Internal server error', 500); }
}
