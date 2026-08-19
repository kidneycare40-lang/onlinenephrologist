import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = [
  '/',
  '/emr/login',
  '/emr/setup',
  '/emr/clinic-selection',
  '/api/auth/login',
  '/api/auth/init',
  '/api/auth/register',
  '/api/patient-auth/send-otp',
  '/api/patient-auth/verify-otp',
  '/api/patient-auth/logout',
  '/api/kv',
  '/api/youtube',
  '/_next',
  '/favicon',
  '/images',
  '/book-appointment',
  '/dr-rajesh-goel',
  '/conditions',
  '/calculators',
  '/videos',
  '/medicines',
  '/medical-tourism',
  '/medical-abbreviations',
  '/international-patients',
  '/tests-for-kidney-disease',
  '/terms',
  '/privacy-policy',
  '/whatsapp-channel',
];

const patientPublicPaths = [
  '/patient/login',
];

const emrPaths = ['/emr'];

function isInternalPath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = publicPaths.some(p => pathname === p || pathname.startsWith(p + '/'));
  if (isPublic) return NextResponse.next();

  const isPatientPublic = patientPublicPaths.some(p => pathname === p || pathname.startsWith(p + '/'));
  if (isPatientPublic) return NextResponse.next();

  const isEmrPath = emrPaths.some(p => pathname.startsWith(p));
  if (isEmrPath) {
    const token = request.cookies.get('emr_token')?.value;
    if (!token) {
      const loginUrl = new URL('/emr/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { jwtVerify } = await import('jose');
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return NextResponse.redirect(new URL('/emr/login', request.url));
      }
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
      const response = NextResponse.next();
      response.headers.set('X-EMR-User', (payload as any).userId as string);
      response.headers.set('X-EMR-Role', (payload as any).role as string);
      return response;
    } catch {
      const loginUrl = new URL('/emr/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set('emr_token', '', { maxAge: 0, path: '/' });
      response.cookies.set('emr_refresh_token', '', { maxAge: 0, path: '/' });
      return response;
    }
  }

  const isPatientPath = pathname.startsWith('/patient') && !pathname.startsWith('/patient/login');
  if (isPatientPath) {
    const token = request.cookies.get('patient_token')?.value;
    if (!token) {
      const loginUrl = new URL('/patient/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { jwtVerify } = await import('jose');
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return NextResponse.redirect(new URL('/patient/login', request.url));
      }
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
      if ((payload as any).patientId === 'pending') {
        return NextResponse.redirect(new URL('/patient/login', request.url));
      }
      const response = NextResponse.next();
      response.headers.set('X-Patient-Id', (payload as any).patientId as string);
      return response;
    } catch {
      const loginUrl = new URL('/patient/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set('patient_token', '', { maxAge: 0, path: '/' });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/emr/:path*', '/patient/:path*', '/api/:path*'],
};
