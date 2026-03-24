import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { validateApplicationStyleEmail } from '@/lib/email-validation';

export async function PUT(req) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, email, password, currentPassword } = await req.json();
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const updateData = {};

    if (name !== undefined) {
      updateData.name = name;
    }

    if (email !== undefined) {
      if (user.role !== 'admin') {
        return NextResponse.json({ error: 'Only admins can edit email.' }, { status: 403 });
      }

      const normalizedEmail = String(email).trim();
      const emailError = validateApplicationStyleEmail(normalizedEmail);
      if (emailError) {
        return NextResponse.json({ error: emailError }, { status: 400 });
      }

      const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existing && existing.id !== user.id) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
      }

      updateData.email = normalizedEmail;
    }

    // Verify current password if trying to change password
    if (password) {
      const validPassword = await bcrypt.compare(currentPassword || '', user.password);
      if (!validPassword) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      updateData.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
