import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

const publicPaths = [
  '/emr/login',
  '/api/auth/login',
  '/api/auth/register',
  '/_next',
  '/favicon',
  '/images',
  '/api/youtube',
];

const emrPaths = ['/emr'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = publicPaths.some(p => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  const isEmrPath = emrPaths.some(p => pathname.startsWith(p));
  if (!isEmrPath) return NextResponse.next();

  const token = request.cookies.get('emr_token')?.value;
  if (!token) {
    const loginUrl = new URL('/emr/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const payload = await verifyToken(token);
  if (!payload) {
    const loginUrl = new URL('/emr/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set('emr_token', '', { maxAge: 0, path: '/' });
    response.cookies.set('emr_refresh_token', '', { maxAge: 0, path: '/' });
    return response;
  }

  const response = NextResponse.next();
  response.headers.set('X-EMR-User', payload.userId);
  response.headers.set('X-EMR-Role', payload.role);
  return response;
}

export const config = {
  matcher: ['/emr/:path*', '/api/:path*'],
};
