import { NextResponse } from 'next/server';

function buildAccessDeniedUrl(request) {
  const url = new URL('/access-denied', request.url);
  url.searchParams.set('from', request.nextUrl.pathname);
  return url;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  // Protect all /admin routes except the secret sign-in route and password recovery pages.
  if (
    pathname.startsWith('/admin') &&
    !pathname.startsWith('/admin/portal/manage/state101signin') &&
    !pathname.startsWith('/admin/forgot-password') &&
    !pathname.startsWith('/admin/reset-password') // allow reset-password without auth
  ) {
    const token =
      request.cookies.get('admin_token')?.value ||
      request.cookies.get('admin-token')?.value;

    if (!token) {
      return NextResponse.redirect(buildAccessDeniedUrl(request));
    }

    // Keep middleware Edge-safe on platforms like Vercel.
    // The actual token validation happens in server components and API routes.
    return NextResponse.next();
  }
  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
