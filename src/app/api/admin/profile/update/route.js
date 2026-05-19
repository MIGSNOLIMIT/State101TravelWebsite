import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { isAdminRole, isSuperAdminEmail, withEffectiveAdminRole } from '@/lib/admin-role';
import bcrypt from 'bcryptjs';
import { validateApplicationStyleEmail } from '@/lib/email-validation';
import { buildActorSnapshot, safeWriteAuditLog } from '@/lib/audit-log';
import { validatePassword, validateUsername } from '@/lib/account-validation';

export async function PUT(req) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, email, password, currentPassword, profileImageUrl } = await req.json();
    const user = withEffectiveAdminRole(await prisma.user.findUnique({ where: { id: session.userId } }));
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const updateData = {};

    if (name !== undefined) {
      const usernameError = validateUsername(name);
      if (usernameError) {
        return NextResponse.json({ error: usernameError }, { status: 400 });
      }

      updateData.name = String(name).trim();
    }

    if (email !== undefined) {
      if (!isAdminRole(user.role)) {
        return NextResponse.json({ error: 'Only admins can edit email.' }, { status: 403 });
      }
      if (isSuperAdminEmail(user.email)) {
        return NextResponse.json({ error: 'The super admin email cannot be changed.' }, { status: 403 });
      }

      const normalizedEmail = String(email).trim().toLowerCase();
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
      const passwordError = validatePassword(password);
      if (passwordError) {
        return NextResponse.json({ error: passwordError }, { status: 400 });
      }

      const validPassword = await bcrypt.compare(currentPassword || '', user.password);
      if (!validPassword) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      updateData.password = await bcrypt.hash(password, 10);
    }

    if (profileImageUrl !== undefined) {
      const normalizedProfileImageUrl = String(profileImageUrl || '').trim();
      updateData.profileImageUrl = normalizedProfileImageUrl || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
    });

    await safeWriteAuditLog(req, {
    category: 'profile',
    action: 'profile.update',
    status: 'SUCCESS',
    summary: `${user.name || user.email} updated their profile.`,
    actorSnapshot: buildActorSnapshot(user),
    targetType: 'user',
    targetId: user.id,
    targetLabel: user.name || user.email,
    details: {
      changedFields: Object.keys(updateData).filter((field) => field !== 'password'),
      passwordChanged: Boolean(updateData.password),
      emailChanged: updateData.email !== undefined,
      nameChanged: updateData.name !== undefined,
      profileImageChanged: updateData.profileImageUrl !== undefined,
    },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
