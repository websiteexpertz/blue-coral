import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionCookie, getSessionCookieName } from '@/lib/admin-session';

function unauthorized(request?: NextRequest) {
  if (request) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const response = new NextResponse('Unauthorized', {
    status: 401,
  });
  response.headers.set('Location', '/login');
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === '/login' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/admin/login') ||
    pathname.startsWith('/api/admin/session')
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const cookie = request.cookies.get(getSessionCookieName())?.value;
    if (!await verifySessionCookie(cookie)) {
      return unauthorized(request);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
