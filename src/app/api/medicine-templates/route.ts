import { NextRequest, NextResponse } from 'next/server';
import { MedicineTemplateService } from '@/lib/db/services/template-service';
import { authenticateRequest, requirePermission, applyRateLimit, withAudit, apiError } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'consultations', 'view'); if (permError) return permError;

    const { searchParams } = new URL(request.url); const category = searchParams.get('category');
    const search = searchParams.get('search'); const id = searchParams.get('id');
    if (id) { const template = await MedicineTemplateService.getById(id); if (!template) return apiError('Template not found', 404); return NextResponse.json(template); }
    return NextResponse.json(await MedicineTemplateService.list({ category: category || undefined, search: search || undefined }));
  } catch (error) { console.error('Medicine Templates GET error:', error); return apiError('Failed to fetch medicine templates', 500); }
}

export async function POST(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'consultations', 'edit'); if (permError) return permError;

    const body = await request.json(); const { items, ...templateData } = body;
    const template = await MedicineTemplateService.create({ ...templateData, created_by: user!.userId }, items || []);
    withAudit('CREATE', 'medicine_template', user!.userId, template?.id);
    return NextResponse.json(template, { status: 201 });
  } catch (error) { console.error('Medicine Templates POST error:', error); return apiError('Failed to create medicine template', 500); }
}

export async function PUT(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'consultations', 'edit'); if (permError) return permError;

    const body = await request.json(); const { id, items, ...templateData } = body;
    if (!id) return apiError('ID is required', 400);
    const template = await MedicineTemplateService.update(id, { ...templateData, updated_by: user!.userId });
    if (items) await MedicineTemplateService.updateItems(id, items);
    withAudit('UPDATE', 'medicine_template', user!.userId, id);
    return NextResponse.json(template);
  } catch (error) { console.error('Medicine Templates PUT error:', error); return apiError('Failed to update medicine template', 500); }
}

export async function DELETE(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'consultations', 'edit'); if (permError) return permError;

    const { searchParams } = new URL(request.url); const id = searchParams.get('id');
    if (!id) return apiError('ID is required', 400);
    await MedicineTemplateService.delete(id);
    withAudit('DELETE', 'medicine_template', user!.userId, id);
    return NextResponse.json({ success: true });
  } catch (error) { console.error('Medicine Templates DELETE error:', error); return apiError('Failed to delete medicine template', 500); }
}
