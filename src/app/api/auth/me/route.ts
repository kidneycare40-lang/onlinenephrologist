import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { getDb } from '@/lib/db/client';
import { getPermissionsForRole } from '@/lib/auth/permissions';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : request.cookies.get('emr_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const db = getDb();
    const { data: user } = await db
      .from('users')
      .select('id, email, first_name, last_name, role, qualification, registration_number, specialization, experience_years, profile_photo_url, is_active, last_login_at')
      .eq('id', payload.userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const permissions = getPermissionsForRole(user.role);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        qualification: user.qualification,
        registrationNumber: user.registration_number,
        specialization: user.specialization,
        experienceYears: user.experience_years,
        profilePhoto: user.profile_photo_url,
        isActive: user.is_active,
        lastLogin: user.last_login_at,
      },
      permissions,
    });
  } catch (error) {
    console.error('ME error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
