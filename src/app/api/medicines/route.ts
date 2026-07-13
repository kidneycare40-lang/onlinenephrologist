import { NextRequest, NextResponse } from 'next/server';
import { MedicineService } from '@/lib/db/services/template-service';
import { authenticateRequest, requirePermission, applyRateLimit, withAudit, apiError } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'medicines', 'view'); if (permError) return permError;

    const { searchParams } = new URL(request.url);
    return NextResponse.json(await MedicineService.search({
      query: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      form: searchParams.get('form') || undefined,
      isNephrotoxic: searchParams.get('nephrotoxic') ? searchParams.get('nephrotoxic') === 'true' : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
    }));
  } catch (error) { console.error('Medicines GET error:', error); return apiError('Failed to fetch medicines', 500); }
}

export async function POST(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'api'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'medicines', 'create'); if (permError) return permError;

    const body = await request.json();
    const medicine = await MedicineService.create({ ...body, created_by: user!.userId });
    withAudit('CREATE', 'medicine', user!.userId, medicine?.id);
    return NextResponse.json(medicine, { status: 201 });
  } catch (error) { console.error('Medicines POST error:', error); return apiError('Failed to create medicine', 500); }
}
