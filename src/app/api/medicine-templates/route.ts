import { NextRequest, NextResponse } from 'next/server';
import { MedicineTemplateService } from '@/lib/db/services/template-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const id = searchParams.get('id');

    if (id) {
      const template = await MedicineTemplateService.getById(id);
      if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      return NextResponse.json(template);
    }

    const templates = await MedicineTemplateService.list({
      category: category || undefined,
      search: search || undefined,
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Medicine Templates GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch medicine templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, ...templateData } = body;
    const template = await MedicineTemplateService.create(templateData, items || []);
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Medicine Templates POST error:', error);
    return NextResponse.json({ error: 'Failed to create medicine template' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, items, ...templateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const template = await MedicineTemplateService.update(id, templateData);
    
    if (items) {
      await MedicineTemplateService.updateItems(id, items);
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Medicine Templates PUT error:', error);
    return NextResponse.json({ error: 'Failed to update medicine template' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await MedicineTemplateService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Medicine Templates DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete medicine template' }, { status: 500 });
  }
}
