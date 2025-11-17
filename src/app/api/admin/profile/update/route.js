import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PUT(req) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, password, currentPassword } = await req.json();

    // Verify current password if trying to change password
    if (password) {
      const user = await prisma.user.findUnique({ where: { id: session.userId } });
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      const validPassword = await bcrypt.compare(currentPassword || '', user.password);
      if (!validPassword) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: session.userId },
        data: { name: name || user.name, password: hashedPassword }
      });
    } else if (name) {
      await prisma.user.update({
        where: { id: session.userId },
        data: { name }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
