import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateApplicationStyleEmail } from '@/lib/email-validation';
import { requireAdminRoles } from '@/lib/admin-access';
import { buildActorSnapshot, safeWriteAuditLog } from '@/lib/audit-log';

export async function GET() {
  try {
    // Fetch TopBar data from custom CMS (Prisma/Postgres)
    const topbar = await prisma.topBar.findFirst();
    return NextResponse.json({
      address: topbar?.address || '',
      phone: topbar?.phone || '',
      email: topbar?.email || '',
    });
  } catch (err) {
    return NextResponse.json({ address: '', phone: '', email: '' }, { status: 500 });
  }
}

// POST: Update TopBar info
export async function POST(req) {
  try {
    const gate = await requireAdminRoles(['admin', 'editor']);
    if (gate.error) return gate.error;
    const { user } = gate;
    const { address, phone, email } = await req.json();
    const normalizedEmail = typeof email === 'string' ? email.trim() : '';
    if (normalizedEmail) {
      const emailError = validateApplicationStyleEmail(normalizedEmail);
      if (emailError) {
        return NextResponse.json({ error: emailError }, { status: 400 });
      }
    }
    let topbar = await prisma.topBar.findFirst();
    if (topbar) {
      topbar = await prisma.topBar.update({
        where: { id: topbar.id },
        data: { address, phone, email: normalizedEmail },
      });
    } else {
      topbar = await prisma.topBar.create({
        data: { address, phone, email: normalizedEmail },
      });
    }
    await safeWriteAuditLog(req, {
    category: 'content',
    action: 'content.topbar.update',
    status: 'SUCCESS',
    summary: `${user.name || user.email} updated the website top bar.`,
    actorSnapshot: buildActorSnapshot(user),
    targetType: 'topbar',
    targetId: topbar.id,
    targetLabel: 'Top Bar',
    details: { address, phone, email: normalizedEmail },
    });
    return NextResponse.json(topbar);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update TopBar.' }, { status: 500 });
  }
}
