
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
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
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
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
