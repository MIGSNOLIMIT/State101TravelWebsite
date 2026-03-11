import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ success: true });
  // Clear the admin_token cookie
  res.cookies.set('admin_token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0, // Expire immediately
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}
