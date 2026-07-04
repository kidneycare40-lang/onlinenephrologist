import { NextRequest, NextResponse } from 'next/server';
import { ComplaintTemplateService, DiagnosisTemplateService } from '@/lib/db/services/template-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'complaints';
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const ckdStage = searchParams.get('ckdStage');

    if (type === 'complaints') {
      const templates = await ComplaintTemplateService.list({
        category: category || undefined,
        search: search || undefined,
      });
      return NextResponse.json(templates);
    } else if (type === 'diagnoses') {
      const templates = await DiagnosisTemplateService.list({
        category: category || undefined,
        ckdStage: ckdStage ? parseInt(ckdStage) : undefined,
        search: search || undefined,
      });
      return NextResponse.json(templates);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Templates GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...templateData } = body;

    if (type === 'complaints') {
      const template = await ComplaintTemplateService.create(templateData);
      return NextResponse.json(template, { status: 201 });
    } else if (type === 'diagnoses') {
      const template = await DiagnosisTemplateService.create(templateData);
      return NextResponse.json(template, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Templates POST error:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, ...templateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    if (type === 'complaints') {
      const template = await ComplaintTemplateService.update(id, templateData);
      return NextResponse.json(template);
    } else if (type === 'diagnoses') {
      const template = await DiagnosisTemplateService.update(id, templateData);
      return NextResponse.json(template);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Templates PUT error:', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!id || !type) {
      return NextResponse.json({ error: 'ID and type are required' }, { status: 400 });
    }

    if (type === 'complaints') {
      await ComplaintTemplateService.delete(id);
      return NextResponse.json({ success: true });
    } else if (type === 'diagnoses') {
      await DiagnosisTemplateService.delete(id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Templates DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
