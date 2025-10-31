import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';


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
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";
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
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
