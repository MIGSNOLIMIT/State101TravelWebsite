import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdminRoles } from '@/lib/admin-access';
import { buildActorSnapshot, safeWriteAuditLog } from '@/lib/audit-log';
import { buildHomepageCmsData, DEFAULT_HOMEPAGE_DATA } from '@/lib/homepage-defaults';

export async function GET() {
  try {
    let homepage = await prisma.homepage.findFirst();

    if (!homepage) {
      homepage = await prisma.homepage.create({
        data: DEFAULT_HOMEPAGE_DATA,
      });
    }

    return NextResponse.json(buildHomepageCmsData(homepage));
  } catch (err) {
    console.error('âŒ Error fetching homepage CMS:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const gate = await requireAdminRoles(['admin', 'editor']);
    if (gate.error) return gate.error;
    const { user } = gate;
    const body = await req.json();
    const existingHomepage = await prisma.homepage.findFirst();
    const normalizedData = buildHomepageCmsData({
      ...DEFAULT_HOMEPAGE_DATA,
      ...existingHomepage,
      ...body,
    });
    const { id, updatedAt, ...updateData } = normalizedData;

    let homepage = existingHomepage;
    if (!homepage) {
      homepage = await prisma.homepage.create({ data: updateData });
    } else {
      homepage = await prisma.homepage.update({
        where: { id: homepage.id },
        data: updateData,
      });
    }

    await safeWriteAuditLog(req, {
      category: 'content',
      action: 'content.homepage.update',
      status: 'SUCCESS',
      summary: `${user.name || user.email} updated homepage content.`,
      actorSnapshot: buildActorSnapshot(user),
      targetType: 'homepage',
      targetId: homepage.id,
      targetLabel: 'Homepage',
      details: {
        heroImagesCount: updateData.heroImages.length,
        servicesEnabledCount: Number(updateData.canadaServiceEnabled) + Number(updateData.unitedStatesServiceEnabled),
        testimonialsImagesCount: updateData.testimonialsImages.length,
        hasVideo: Boolean(updateData.testimonialsVideoUrl),
      },
    });

    return NextResponse.json(buildHomepageCmsData(homepage));
  } catch (err) {
    console.error('âŒ Error updating homepage CMS:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
