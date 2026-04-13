import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAdminRoles } from '@/lib/admin-access';
import { buildActorSnapshot, safeWriteAuditLog } from '@/lib/audit-log';

// GET: Fetch only image/video CMS fields
export async function GET() {
  try {
    let homepage = await prisma.homepage.findFirst({
      select: {
        id: true,
        heroImages: true,
        testimonialsImages: true,
        testimonialsVideoUrl: true,
        updatedAt: true,
      },
    });

    if (!homepage) {
      homepage = await prisma.homepage.create({
        data: {
          heroImages: [],
          testimonialsImages: [],
          testimonialsVideoUrl: '',
        },
        select: {
          id: true,
          heroImages: true,
          testimonialsImages: true,
          testimonialsVideoUrl: true,
          updatedAt: true,
        },
      });
    }

    return NextResponse.json(homepage);
  } catch (err) {
    console.error('❌ Error fetching homepage CMS:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST: Update image/video CMS fields
export async function POST(req) {
  try {
    const gate = await requireAdminRoles(['admin', 'editor']);
    if (gate.error) return gate.error;
    const { user } = gate;
    const body = await req.json();

    const updateData = {
      heroImages: body.heroImages || [],
      testimonialsImages: body.testimonialsImages || [],
      testimonialsVideoUrl: body.testimonialsVideoUrl || '',
    };

    let homepage = await prisma.homepage.findFirst();
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
    summary: `${user.name || user.email} updated homepage media content.`,
    actorSnapshot: buildActorSnapshot(user),
    targetType: 'homepage',
    targetId: homepage.id,
    targetLabel: 'Homepage',
    details: {
      heroImagesCount: updateData.heroImages.length,
      testimonialsImagesCount: updateData.testimonialsImages.length,
      hasVideo: Boolean(updateData.testimonialsVideoUrl),
    },
    });

    return NextResponse.json(homepage);
  } catch (err) {
    console.error('❌ Error updating homepage CMS:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
