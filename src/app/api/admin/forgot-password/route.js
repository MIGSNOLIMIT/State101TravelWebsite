import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { buildActorSnapshot, safeWriteAuditLog } from '@/lib/audit-log';


const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
		  await safeWriteAuditLog(req, {
			  category: 'auth',
			  action: 'auth.password_reset.request',
			  status: 'FAILURE',
			  summary: `Password reset was requested for an unknown account: ${String(email).trim().toLowerCase()}.`,
			  actorSnapshot: { email: String(email).trim().toLowerCase() },
			  details: { reason: 'unknown_email' },
		  });
      // For security, always respond with success
      return NextResponse.json({ success: true });
    }
    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({
      where: { email },
      data: { resetToken: token },
    });
    // Send email with reset link
    // Prefer a fully-qualified public URL if provided; else fall back to Vercel URL on deploy, or localhost in dev
    const publicUrlRaw = process.env.NEXT_PUBLIC_SITE_URL; // e.g., https://state101.com
    const vercelUrlRaw = process.env.VERCEL_URL; // e.g., my-app.vercel.app
    const normalizeUrl = (u) => {
      if (!u || typeof u !== 'string') return '';
      // If missing protocol, assume https for safety
      if (u.startsWith('http://') || u.startsWith('https://')) return u.replace(/\/$/, '');
      return `https://${u.replace(/\/$/, '')}`;
    };
    const baseUrl = publicUrlRaw
      ? normalizeUrl(publicUrlRaw)
      : vercelUrlRaw
      ? normalizeUrl(vercelUrlRaw)
      : 'http://localhost:3000';
    const resetUrl = `${baseUrl}/admin/reset-password?token=${token}`;
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: true,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    await transporter.sendMail({
      from: SMTP_USER,
      to: email,
      subject: 'State101 Admin Password Reset',
      html: `<p>You requested a password reset for your State101 admin account.</p>
        <p><a href="${resetUrl}">Click here to reset your password</a></p>
        <p>If you did not request this, please ignore this email.</p>`,
    });
    await safeWriteAuditLog(req, {
    category: 'auth',
    action: 'auth.password_reset.request',
    status: 'SUCCESS',
    summary: `${user.name || user.email} requested a password reset.`,
    actorSnapshot: buildActorSnapshot(user),
    targetType: 'user',
    targetId: user.id,
    targetLabel: user.name || user.email,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
