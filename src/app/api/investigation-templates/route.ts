import { NextRequest, NextResponse } from 'next/server';
import { InvestigationTemplateService } from '@/lib/db/services/template-service';
import { authenticateRequest, requirePermission, applyRateLimit, withAudit, apiError } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'consultations', 'view'); if (permError) return permError;

    const { searchParams } = new URL(request.url); const category = searchParams.get('category');
    const search = searchParams.get('search'); const id = searchParams.get('id');
    if (id) { const template = await InvestigationTemplateService.getById(id); if (!template) return apiError('Template not found', 404); return NextResponse.json(template); }
    return NextResponse.json(await InvestigationTemplateService.list({ category: category || undefined, search: search || undefined }));
  } catch (error) { console.error('Investigation Templates GET error:', error); return apiError('Failed to fetch investigation templates', 500); }
}

export async function POST(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'consultations', 'edit'); if (permError) return permError;

    const body = await request.json(); const { items, ...templateData } = body;
    const template = await InvestigationTemplateService.create({ ...templateData, created_by: user!.userId }, items || []);
    withAudit('CREATE', 'investigation_template', user!.userId, template?.id);
    return NextResponse.json(template, { status: 201 });
  } catch (error) { console.error('Investigation Templates POST error:', error); return apiError('Failed to create investigation template', 500); }
}

export async function PUT(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'consultations', 'edit'); if (permError) return permError;

    const body = await request.json(); const { id, items, ...templateData } = body;
    if (!id) return apiError('ID is required', 400);
    const template = await InvestigationTemplateService.update(id, { ...templateData, updated_by: user!.userId });
    if (items) await InvestigationTemplateService.updateItems(id, items);
    withAudit('UPDATE', 'investigation_template', user!.userId, id);
    return NextResponse.json(template);
  } catch (error) { console.error('Investigation Templates PUT error:', error); return apiError('Failed to update investigation template', 500); }
}

export async function DELETE(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'consultations', 'edit'); if (permError) return permError;

    const { searchParams } = new URL(request.url); const id = searchParams.get('id');
    if (!id) return apiError('ID is required', 400);
    await InvestigationTemplateService.delete(id);
    withAudit('DELETE', 'investigation_template', user!.userId, id);
    return NextResponse.json({ success: true });
  } catch (error) { console.error('Investigation Templates DELETE error:', error); return apiError('Failed to delete investigation template', 500); }
}
