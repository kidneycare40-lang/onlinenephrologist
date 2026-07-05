import { NextRequest, NextResponse } from 'next/server';
import { searchMedicines, getDiagnosisBasedSuggestions } from '@/lib/ai/medicine-suggestions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const diagnosesParam = searchParams.get('diagnoses') || '';
    const existingParam = searchParams.get('existing') || '';

    const diagnoses = diagnosesParam ? diagnosesParam.split(',').map(d => d.trim()).filter(Boolean) : [];
    const existing = existingParam ? existingParam.split(',').map(m => m.trim()).filter(Boolean) : [];

    if (q) {
      const suggestions = searchMedicines(q, diagnoses, existing);
      return NextResponse.json({ suggestions, query: q });
    }

    if (diagnoses.length > 0) {
      const suggestions = getDiagnosisBasedSuggestions(diagnoses, existing);
      return NextResponse.json({ suggestions, diagnoses });
    }

    return NextResponse.json({ suggestions: [], query: '' });
  } catch (error) {
    return NextResponse.json({ suggestions: [], error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}
