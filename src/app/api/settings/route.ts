import { NextRequest, NextResponse } from 'next/server';
import { getSettingsService } from '@/lib/db/services';
import { authenticateRequest, requirePermission, applyRateLimit, withAudit, apiError } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'settings', 'view'); if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const settingsService = getSettingsService();
    const clinicId = searchParams.get('clinicId') || undefined;
    const section = searchParams.get('section');

    if (section === 'clinics') return NextResponse.json(await settingsService.getClinics());
    if (clinicId && !section) { const clinic = await settingsService.getClinic(clinicId); if (!clinic) return apiError('Clinic not found', 404); return NextResponse.json(clinic); }
    if (section === 'users') return NextResponse.json(await settingsService.getUsers());
    if (section === 'doctors') return NextResponse.json(await settingsService.getDoctors(clinicId));
    if (section === 'letterheads') return NextResponse.json(await settingsService.getLetterheads(clinicId));
    const key = searchParams.get('key');
    if (key) { const value = await settingsService.getSetting(key, clinicId); return NextResponse.json({ key, value }); }
    return NextResponse.json(await settingsService.getAllSettings(clinicId));
  } catch (error) { console.error('GET /api/settings error:', error); return apiError('Internal server error', 500); }
}

export async function POST(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;

    const body = await request.json();
    const settingsService = getSettingsService();

    if (body.action === 'create_clinic') {
      const permError = requirePermission(user, 'settings', 'edit'); if (permError) return permError;
      const clinic = await settingsService.createClinic(body);
      withAudit('CREATE', 'clinic', user!.userId, clinic?.id, undefined, { name: body.name });
      return NextResponse.json(clinic, { status: 201 });
    }
    if (body.action === 'create_user') {
      const permError = requirePermission(user, 'users', 'create'); if (permError) return permError;
      const newUser = await settingsService.createUser(body);
      withAudit('CREATE', 'user', user!.userId, newUser?.id, undefined, { email: body.email, role: body.role });
      return NextResponse.json(newUser, { status: 201 });
    }
    if (body.action === 'create_letterhead') {
      const permError = requirePermission(user, 'settings', 'edit'); if (permError) return permError;
      const letterhead = await settingsService.createLetterhead(body);
      return NextResponse.json(letterhead, { status: 201 });
    }
    if (body.key !== undefined) {
      const permError = requirePermission(user, 'settings', 'edit'); if (permError) return permError;
      const success = await settingsService.setSetting(body.key, body.value, body.clinicId);
      withAudit('UPDATE', 'setting', user!.userId, body.key, undefined, { value: body.value });
      return NextResponse.json({ success });
    }
    return apiError('Invalid action', 400);
  } catch (error) { console.error('POST /api/settings error:', error); return apiError('Internal server error', 500); }
}

export async function PUT(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'settings', 'edit'); if (permError) return permError;

    const body = await request.json();
    const settingsService = getSettingsService();

    if (body.action === 'update_clinic' && body.id) { const { id, action, ...data } = body; withAudit('UPDATE', 'clinic', user!.userId, id, undefined, data); return NextResponse.json(await settingsService.updateClinic(id, data)); }
    if (body.action === 'update_user' && body.id) { const { id, action, ...data } = body; withAudit('UPDATE', 'user', user!.userId, id, undefined, data); return NextResponse.json(await settingsService.updateUser(id, data)); }
    if (body.action === 'update_letterhead' && body.id) { const { id, action, ...data } = body; return NextResponse.json(await settingsService.updateLetterhead(id, data)); }
    return apiError('Invalid action', 400);
  } catch (error) { console.error('PUT /api/settings error:', error); return apiError('Internal server error', 500); }
}

export async function DELETE(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'settings', 'edit'); if (permError) return permError;

    const { searchParams } = new URL(request.url); const id = searchParams.get('id');
    if (!id) return apiError('ID is required', 400);
    const section = searchParams.get('section');
    const settingsService = getSettingsService();
    if (section === 'letterheads') { const success = await settingsService.deleteLetterhead(id); withAudit('DELETE', 'letterhead', user!.userId, id); return NextResponse.json({ success }); }
    return apiError('Invalid section', 400);
  } catch (error) { console.error('DELETE /api/settings error:', error); return apiError('Internal server error', 500); }
}
