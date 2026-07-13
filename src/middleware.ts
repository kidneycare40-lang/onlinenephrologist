import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

export const config = {
  matcher: ['/emr/:path*', '/api/:path*'],
};
