
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    // Check if account is locked
    if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
      const minutes = Math.ceil((new Date(user.lockUntil) - new Date()) / 60000);
      return NextResponse.json({ error: `Account locked. Try again in ${minutes} minutes.` }, { status: 403 });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      // Increment loginAttempts
      let updates = { loginAttempts: (user.loginAttempts || 0) + 1 };
      // Lock account if 10 failed attempts
      if (updates.loginAttempts >= 10) {
        updates.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        updates.loginAttempts = 0; // reset after lock
      }
      await prisma.user.update({ where: { email }, data: updates });
      if (updates.lockUntil) {
        return NextResponse.json({ error: 'Account locked for 30 minutes due to too many failed attempts.' }, { status: 403 });
      }
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    // Reset loginAttempts and lockUntil on successful login
    await prisma.user.update({ where: { email }, data: { loginAttempts: 0, lockUntil: null } });
    // Issue JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '2h' });
    const res = NextResponse.json({ success: true });
    res.cookies.set('admin_token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 2 * 60 * 60, // 2 hours
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    return res;
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
