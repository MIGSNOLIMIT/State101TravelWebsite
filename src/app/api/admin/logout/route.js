import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { buildActorSnapshot, safeWriteAuditLog } from '@/lib/audit-log';

export async function POST(req) {
  const session = await getAdminSession();
  const user = session?.userId
    ? await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, name: true, email: true, role: true } })
    : null;

  if (user) {
    await safeWriteAuditLog(req, {
      category: 'auth',
      action: 'auth.logout',
      status: 'SUCCESS',
      summary: `${user.name || user.email} logged out.`,
      actorSnapshot: buildActorSnapshot(user),
    });
  }

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
