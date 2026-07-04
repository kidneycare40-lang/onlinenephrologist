import { NextRequest, NextResponse } from 'next/server';
import { MedicineService } from '@/lib/db/services/template-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const form = searchParams.get('form');
    const isNephrotoxic = searchParams.get('nephrotoxic');
    const limit = searchParams.get('limit');

    const medicines = await MedicineService.search({
      query: query || undefined,
      category: category || undefined,
      form: form || undefined,
      isNephrotoxic: isNephrotoxic ? isNephrotoxic === 'true' : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json(medicines);
  } catch (error) {
    console.error('Medicines GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch medicines' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const medicine = await MedicineService.create(body);
    return NextResponse.json(medicine, { status: 201 });
  } catch (error) {
    console.error('Medicines POST error:', error);
    return NextResponse.json({ error: 'Failed to create medicine' }, { status: 500 });
  }
}
