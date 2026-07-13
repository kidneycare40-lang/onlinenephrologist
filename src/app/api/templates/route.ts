import { NextRequest, NextResponse } from 'next/server';
import { ComplaintTemplateService, DiagnosisTemplateService } from '@/lib/db/services/template-service';
import { authenticateRequest, requirePermission, applyRateLimit, withAudit, apiError } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'consultations', 'view'); if (permError) return permError;

    const { searchParams } = new URL(request.url); const type = searchParams.get('type') || 'complaints';
    const category = searchParams.get('category'); const search = searchParams.get('search');
    const ckdStage = searchParams.get('ckdStage');
    if (type === 'complaints') return NextResponse.json(await ComplaintTemplateService.list({ category: category || undefined, search: search || undefined }));
    if (type === 'diagnoses') return NextResponse.json(await DiagnosisTemplateService.list({ category: category || undefined, ckdStage: ckdStage ? parseInt(ckdStage) : undefined, search: search || undefined }));
    return apiError('Invalid type', 400);
  } catch (error) { console.error('Templates GET error:', error); return apiError('Failed to fetch templates', 500); }
}

export async function POST(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'consultations', 'edit'); if (permError) return permError;

    const body = await request.json(); const { type, ...templateData } = body;
    if (type === 'complaints') { const template = await ComplaintTemplateService.create({ ...templateData, created_by: user!.userId }); withAudit('CREATE', 'complaint_template', user!.userId, template?.id); return NextResponse.json(template, { status: 201 }); }
    if (type === 'diagnoses') { const template = await DiagnosisTemplateService.create({ ...templateData, created_by: user!.userId }); withAudit('CREATE', 'diagnosis_template', user!.userId, template?.id); return NextResponse.json(template, { status: 201 }); }
    return apiError('Invalid type', 400);
  } catch (error) { console.error('Templates POST error:', error); return apiError('Failed to create template', 500); }
}

export async function PUT(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'consultations', 'edit'); if (permError) return permError;

    const body = await request.json(); const { type, id, ...templateData } = body;
    if (!id) return apiError('ID is required', 400);
    if (type === 'complaints') { const template = await ComplaintTemplateService.update(id, { ...templateData, updated_by: user!.userId }); withAudit('UPDATE', 'complaint_template', user!.userId, id); return NextResponse.json(template); }
    if (type === 'diagnoses') { const template = await DiagnosisTemplateService.update(id, { ...templateData, updated_by: user!.userId }); withAudit('UPDATE', 'diagnosis_template', user!.userId, id); return NextResponse.json(template); }
    return apiError('Invalid type', 400);
  } catch (error) { console.error('Templates PUT error:', error); return apiError('Failed to update template', 500); }
}

export async function DELETE(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'consultations', 'edit'); if (permError) return permError;

    const { searchParams } = new URL(request.url); const type = searchParams.get('type'); const id = searchParams.get('id');
    if (!id || !type) return apiError('ID and type are required', 400);
    if (type === 'complaints') { await ComplaintTemplateService.delete(id); withAudit('DELETE', 'complaint_template', user!.userId, id); return NextResponse.json({ success: true }); }
    if (type === 'diagnoses') { await DiagnosisTemplateService.delete(id); withAudit('DELETE', 'diagnosis_template', user!.userId, id); return NextResponse.json({ success: true }); }
    return apiError('Invalid type', 400);
  } catch (error) { console.error('Templates DELETE error:', error); return apiError('Failed to delete template', 500); }
}
