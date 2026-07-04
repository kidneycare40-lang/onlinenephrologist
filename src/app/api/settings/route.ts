import { NextRequest, NextResponse } from 'next/server';
import { getSettingsService } from '@/lib/db/services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const settingsService = getSettingsService();

    const section = searchParams.get('section');
    const clinicId = searchParams.get('clinicId') || undefined;

    // Clinics
    if (section === 'clinics') {
      const clinics = await settingsService.getClinics();
      return NextResponse.json(clinics);
    }

    // Single clinic
    const clinicIdParam = searchParams.get('clinicId');
    if (clinicIdParam && !section) {
      const clinic = await settingsService.getClinic(clinicIdParam);
      if (!clinic) {
        return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
      }
      return NextResponse.json(clinic);
    }

    // Users / Doctors
    if (section === 'users') {
      const users = await settingsService.getUsers();
      return NextResponse.json(users);
    }

    if (section === 'doctors') {
      const doctors = await settingsService.getDoctors(clinicId);
      return NextResponse.json(doctors);
    }

    // Letterheads
    if (section === 'letterheads') {
      const letterheads = await settingsService.getLetterheads(clinicId);
      return NextResponse.json(letterheads);
    }

    // Specific setting
    const key = searchParams.get('key');
    if (key) {
      const value = await settingsService.getSetting(key, clinicId);
      return NextResponse.json({ key, value });
    }

    // All settings
    const allSettings = await settingsService.getAllSettings(clinicId);
    return NextResponse.json(allSettings);

  } catch (error) {
    console.error('GET /api/settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const settingsService = getSettingsService();

    // Create clinic
    if (body.action === 'create_clinic') {
      const clinic = await settingsService.createClinic(body);
      return NextResponse.json(clinic, { status: 201 });
    }

    // Create user
    if (body.action === 'create_user') {
      const user = await settingsService.createUser(body);
      return NextResponse.json(user, { status: 201 });
    }

    // Create letterhead
    if (body.action === 'create_letterhead') {
      const letterhead = await settingsService.createLetterhead(body);
      return NextResponse.json(letterhead, { status: 201 });
    }

    // Update setting
    if (body.key !== undefined) {
      const success = await settingsService.setSetting(body.key, body.value, body.clinicId);
      return NextResponse.json({ success });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('POST /api/settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const settingsService = getSettingsService();

    // Update clinic
    if (body.action === 'update_clinic' && body.id) {
      const { id, action, ...data } = body;
      const clinic = await settingsService.updateClinic(id, data);
      return NextResponse.json(clinic);
    }

    // Update user
    if (body.action === 'update_user' && body.id) {
      const { id, action, ...data } = body;
      const user = await settingsService.updateUser(id, data);
      return NextResponse.json(user);
    }

    // Update letterhead
    if (body.action === 'update_letterhead' && body.id) {
      const { id, action, ...data } = body;
      const letterhead = await settingsService.updateLetterhead(id, data);
      return NextResponse.json(letterhead);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('PUT /api/settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const section = searchParams.get('section');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const settingsService = getSettingsService();

    if (section === 'letterheads') {
      const success = await settingsService.deleteLetterhead(id);
      return NextResponse.json({ success });
    }

    return NextResponse.json({ error: 'Invalid section' }, { status: 400 });

  } catch (error) {
    console.error('DELETE /api/settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
