import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

// Protects everything except auth pages, the auth API, and static assets.
// Fine-grained role checks (e.g. "only MANAGER+ can open /analytics") happen
// server-side in each route/page, since the role isn't available from the
// cookie alone — this middleware only gates "must be logged in".

const PUBLIC_PATHS = ['/login', '/register', '/api/auth'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p)) || pathname === '/') {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)'],
};
