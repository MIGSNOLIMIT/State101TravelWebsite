import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  // Protect all /admin routes except /admin/login and /admin/forgot-password
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') && !pathname.startsWith('/admin/forgot-password')) {
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    try {
      jwt.verify(token, JWT_SECRET);
      // Token is valid, allow access
      return NextResponse.next();
    } catch {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
