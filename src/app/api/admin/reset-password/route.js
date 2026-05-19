import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { buildActorSnapshot, safeWriteAuditLog } from '@/lib/audit-log';
import { validatePassword } from '@/lib/account-validation';


export async function POST(req) {
  try {
    const { token, password } = await req.json();
    if (!token) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
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
    await safeWriteAuditLog(req, {
    category: 'auth',
    action: 'auth.password_reset.complete',
    status: 'SUCCESS',
    summary: `${user.name || user.email} completed a password reset.`,
    actorSnapshot: buildActorSnapshot(user),
    targetType: 'user',
    targetId: user.id,
    targetLabel: user.name || user.email,
    details: { method: 'reset_token' },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
