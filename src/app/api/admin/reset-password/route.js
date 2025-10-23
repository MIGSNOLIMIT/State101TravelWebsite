import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { token, password } = await req.json();
    if (!token || !password || password.length < 6) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const user = await prisma.user.findFirst({ where: { resetToken: token } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
