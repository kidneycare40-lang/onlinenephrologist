import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { hashPassword } from '@/lib/auth/password';
import { authenticateRequest, requirePermission } from '@/lib/auth/middleware';
import { logAudit } from '@/lib/db/audit';

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const permError = requirePermission(user, 'users', 'create');
    if (permError) return permError;

    const body = await request.json();
    const { email, password, firstName, lastName, role, qualification, registrationNumber, specialization, experienceYears, consultationFee } = body;

    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json({ error: 'Email, password, name, and role are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const validRoles = ['admin', 'doctor', 'receptionist', 'billing', 'lab', 'nurse', 'readonly'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }, { status: 400 });
    }

    const db = getDb();

    const { data: existing } = await db.from('users').select('id').eq('email', email.toLowerCase().trim()).limit(1);
    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const { data: newUser, error: createError } = await db.from('users').insert({
      email: email.toLowerCase().trim(),
      first_name: firstName,
      last_name: lastName,
      role,
      password_hash: passwordHash,
      qualification: qualification || null,
      registration_number: registrationNumber || null,
      specialization: specialization || null,
      experience_years: experienceYears || null,
      consultation_fee: consultationFee || null,
      is_active: true,
    }).select().single();

    if (createError || !newUser) {
      console.error('CREATE USER error:', createError);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    logAudit({
      userId: user!.userId,
      action: 'CREATE',
      entityType: 'user',
      entityId: newUser.id,
      newValues: { email: newUser.email, role: newUser.role, name: `${firstName} ${lastName}` },
    });

    return NextResponse.json({
      id: newUser.id,
      email: newUser.email,
      name: `${newUser.first_name} ${newUser.last_name}`,
      role: newUser.role,
    }, { status: 201 });

  } catch (error) {
    console.error('REGISTER error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await authenticateRequest(request);
    if (authError) return authError;

    const permError = requirePermission(user, 'users', 'view');
    if (permError) return permError;

    const db = getDb();
    const { data: users, error } = await db
      .from('users')
      .select('id, email, first_name, last_name, role, qualification, specialization, is_active, last_login_at, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json(users || []);
  } catch (error) {
    console.error('LIST USERS error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
