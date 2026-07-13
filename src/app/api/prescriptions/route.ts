import { NextRequest, NextResponse } from 'next/server';
import { PrescriptionRepository } from '@/lib/db/services';
import { authenticateRequest, requirePermission, applyRateLimit, withAudit, apiError } from '@/lib/auth/middleware';

const prescriptionRepo = new PrescriptionRepository();

export async function GET(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'prescriptions', 'view'); if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) { const p = await prescriptionRepo.findByIdWithRelations(id); if (!p) return apiError('Prescription not found', 404); return NextResponse.json(p); }
    const patientId = searchParams.get('patientId');
    if (patientId) { const limit = parseInt(searchParams.get('limit') || '20'); return NextResponse.json(await prescriptionRepo.findByPatientId(patientId, limit)); }
    if (searchParams.get('templates') === 'true') { return NextResponse.json(await prescriptionRepo.findTemplates()); }
    return NextResponse.json(await prescriptionRepo.findAllWithRelations(searchParams.get('status') || undefined));
  } catch (error) { console.error('GET /api/prescriptions error:', error); return apiError('Internal server error', 500); }
}

export async function POST(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'prescriptions', 'create'); if (permError) return permError;

    const body = await request.json();
    if (!body.patient_id || !body.doctor_id || !body.clinic_id) return apiError('Patient, doctor, and clinic are required', 400);

    const prescription = await prescriptionRepo.createWithMedicines({
      patient_id: body.patient_id, doctor_id: body.doctor_id, clinic_id: body.clinic_id,
      consultation_id: body.consultation_id || null, prescription_date: body.prescription_date || new Date().toISOString().split('T')[0],
      notes: body.notes || null, diagnosis: body.diagnosis || null, advice: body.advice || null,
      follow_up_date: body.follow_up_date || null, is_template: body.is_template || false,
      template_name: body.template_name || null, template_category: body.template_category || null,
      status: body.status || 'Active', created_by: user!.userId,
    }, body.medicines || [], body.investigations);
    if (!prescription) return apiError('Failed to create prescription', 500);
    withAudit('CREATE', 'prescription', user!.userId, prescription?.id, undefined, { patient_id: body.patient_id });
    return NextResponse.json(prescription, { status: 201 });
  } catch (error) { console.error('POST /api/prescriptions error:', error); return apiError('Internal server error', 500); }
}

export async function PUT(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'prescriptions', 'edit'); if (permError) return permError;

    const body = await request.json(); const { id, ...updateData } = body;
    if (!id) return apiError('Prescription ID is required', 400);
    const prescription = await prescriptionRepo.update(id, { ...updateData, updated_by: user!.userId, updated_at: new Date().toISOString() });
    if (!prescription) return apiError('Prescription not found', 404);
    withAudit('UPDATE', 'prescription', user!.userId, id, undefined, updateData);
    return NextResponse.json(prescription);
  } catch (error) { console.error('PUT /api/prescriptions error:', error); return apiError('Internal server error', 500); }
}

export async function DELETE(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'prescriptions', 'delete'); if (permError) return permError;

    const { searchParams } = new URL(request.url); const id = searchParams.get('id');
    if (!id) return apiError('Prescription ID is required', 400);
    const success = await prescriptionRepo.softDelete(id);
    if (!success) return apiError('Prescription not found', 404);
    withAudit('DELETE', 'prescription', user!.userId, id);
    return NextResponse.json({ success: true });
  } catch (error) { console.error('DELETE /api/prescriptions error:', error); return apiError('Internal server error', 500); }
}
