import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdminRoles } from '@/lib/admin-access';
import { buildActorSnapshot, safeWriteAuditLog } from '@/lib/audit-log';


// GET: Fetch all accreditations (max 3)
export async function GET() {
  try {
    const accreditations = await prisma.accreditation.findMany({
      orderBy: { id: 'asc' },
      take: 3,
    });
    return NextResponse.json(accreditations);
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST: Replace all accreditations (up to 3)
export async function POST(req) {
  try {
    const gate = await requireAdminRoles(['admin', 'editor']);
    if (gate.error) return gate.error;
    const { user } = gate;
    const body = await req.json(); // expects array of { logoUrl, name }
    // Remove all existing accreditations
    await prisma.accreditation.deleteMany();
    // Add new accreditations
    const newAccreditations = await prisma.accreditation.createMany({
      data: body.slice(0, 3),
    });
    await safeWriteAuditLog(req, {
    category: 'content',
    action: 'content.accreditations.update',
    status: 'SUCCESS',
    summary: `${user.name || user.email} updated accreditation logos.`,
    actorSnapshot: buildActorSnapshot(user),
    targetType: 'accreditations',
    targetLabel: 'Accreditation Logos',
    details: { accreditationCount: Array.isArray(body) ? Math.min(body.length, 3) : 0 },
    });
    return NextResponse.json(newAccreditations);
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
