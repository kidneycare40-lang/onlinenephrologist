import { NextRequest, NextResponse } from 'next/server';
import { searchMedicines, getDiagnosisBasedSuggestions } from '@/lib/ai/medicine-suggestions';
import { authenticateRequest, requirePermission, applyRateLimit, apiError } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    const rlError = applyRateLimit(request, 'ai'); if (rlError) return rlError;
    const { user, error: authError } = await authenticateRequest(request); if (authError) return authError;
    const permError = requirePermission(user, 'medicines', 'view'); if (permError) return permError;

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const diagnosesParam = searchParams.get('diagnoses') || '';
    const existingParam = searchParams.get('existing') || '';
    const diagnoses = diagnosesParam ? diagnosesParam.split(',').map(d => d.trim()).filter(Boolean) : [];
    const existing = existingParam ? existingParam.split(',').map(m => m.trim()).filter(Boolean) : [];

    if (q) return NextResponse.json({ suggestions: searchMedicines(q, diagnoses, existing), query: q });
    if (diagnoses.length > 0) return NextResponse.json({ suggestions: getDiagnosisBasedSuggestions(diagnoses, existing), diagnoses });
    return NextResponse.json({ suggestions: [], query: '' });
  } catch (error) { return NextResponse.json({ suggestions: [], error: 'Failed to fetch suggestions' }, { status: 500 }); }
}
