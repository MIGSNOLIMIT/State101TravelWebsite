
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { normalizeAdminEmail, withEffectiveAdminRole } from '@/lib/admin-role';
import { buildActorSnapshot, safeWriteAuditLog } from '@/lib/audit-log';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const normalizedEmail = normalizeAdminEmail(email);
    if (!email || !password) {
      await safeWriteAuditLog(req, {
        category: 'auth',
        action: 'auth.login',
        status: 'FAILURE',
        summary: 'Login failed because email or password was missing.',
        actorSnapshot: { email: normalizedEmail || null },
        details: { reason: 'missing_credentials' },
      });
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }
    const user = withEffectiveAdminRole(await prisma.user.findUnique({ where: { email: normalizedEmail } }));
    if (!user) {
      await safeWriteAuditLog(req, {
        category: 'auth',
        action: 'auth.login',
        status: 'FAILURE',
        summary: `Login failed for ${normalizedEmail}.`,
        actorSnapshot: { email: normalizedEmail },
        details: { reason: 'invalid_credentials' },
      });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    // Check if account is locked
    if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
      const minutes = Math.ceil((new Date(user.lockUntil) - new Date()) / 60000);
      await safeWriteAuditLog(req, {
        category: 'auth',
        action: 'auth.login',
        status: 'FAILURE',
        summary: `${user.name || user.email} attempted to log in while the account was locked.`,
        actorSnapshot: buildActorSnapshot(user),
        details: { reason: 'account_locked', minutesRemaining: minutes },
      });
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
      await prisma.user.update({ where: { email: normalizedEmail }, data: updates });
      await safeWriteAuditLog(req, {
        category: 'auth',
        action: 'auth.login',
        status: 'FAILURE',
        summary: `${user.name || user.email} failed to log in.`,
        actorSnapshot: buildActorSnapshot(user),
        details: {
        reason: updates.lockUntil ? 'too_many_attempts' : 'invalid_credentials',
        lockUntil: updates.lockUntil || null,
        },
      });
      if (updates.lockUntil) {
        return NextResponse.json({ error: 'Account locked for 30 minutes due to too many failed attempts.' }, { status: 403 });
      }
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    // Reset loginAttempts and lockUntil on successful login
    await prisma.user.update({ where: { email: normalizedEmail }, data: { loginAttempts: 0, lockUntil: null } });
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
    await safeWriteAuditLog(req, {
    category: 'auth',
    action: 'auth.login',
    status: 'SUCCESS',
    summary: `${user.name || user.email} logged in.`,
    actorSnapshot: buildActorSnapshot(user),
    details: { loginMethod: 'password' },
    });
    return res;
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
