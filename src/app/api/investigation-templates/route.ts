import { NextRequest, NextResponse } from 'next/server';
import { InvestigationTemplateService } from '@/lib/db/services/template-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const id = searchParams.get('id');

    if (id) {
      const template = await InvestigationTemplateService.getById(id);
      if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      return NextResponse.json(template);
    }

    const templates = await InvestigationTemplateService.list({
      category: category || undefined,
      search: search || undefined,
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Investigation Templates GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch investigation templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, ...templateData } = body;
    const template = await InvestigationTemplateService.create(templateData, items || []);
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Investigation Templates POST error:', error);
    return NextResponse.json({ error: 'Failed to create investigation template' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, items, ...templateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const template = await InvestigationTemplateService.update(id, templateData);
    
    if (items) {
      await InvestigationTemplateService.updateItems(id, items);
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Investigation Templates PUT error:', error);
    return NextResponse.json({ error: 'Failed to update investigation template' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await InvestigationTemplateService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Investigation Templates DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete investigation template' }, { status: 500 });
  }
}
