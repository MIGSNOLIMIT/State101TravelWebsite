import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ success: true });

  for (const cookieName of ['admin_token', 'admin-token']) {
    res.cookies.set(cookieName, '', {
      httpOnly: true,
      path: '/',
      maxAge: 0,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }

  return res;
}
