import { NextRequest, NextResponse } from 'next/server';
import { AdviceTemplateService } from '@/lib/db/services/template-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const id = searchParams.get('id');

    if (id) {
      const template = await AdviceTemplateService.getById(id);
      if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      return NextResponse.json(template);
    }

    const templates = await AdviceTemplateService.list({
      category: category || undefined,
      search: search || undefined,
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Advice Templates GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch advice templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, ...templateData } = body;
    const template = await AdviceTemplateService.create(templateData, items || []);
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Advice Templates POST error:', error);
    return NextResponse.json({ error: 'Failed to create advice template' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, items, ...templateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const template = await AdviceTemplateService.update(id, templateData);
    
    if (items) {
      await AdviceTemplateService.updateItems(id, items);
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Advice Templates PUT error:', error);
    return NextResponse.json({ error: 'Failed to update advice template' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await AdviceTemplateService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Advice Templates DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete advice template' }, { status: 500 });
  }
}
