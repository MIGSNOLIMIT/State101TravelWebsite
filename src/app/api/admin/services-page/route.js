import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminRoles } from '@/lib/admin-access';
import { buildActorSnapshot, safeWriteAuditLog } from '@/lib/audit-log';

// GET: fetch services page (hero + sections)
export async function GET() {
  try {
    const page = await prisma.servicesPage.findFirst();
    // If no page, return null
    if (!page) return NextResponse.json(null);
    // Fetch sections (Service model)
    const sections = await prisma.service.findMany({ orderBy: { updatedAt: 'desc' } });
    return NextResponse.json({ ...page, sections });
  } catch (e) {
    console.error('ServicesPage API error:', e);
    return NextResponse.json(null, { status: 500 });
  }
}

// PUT: update services page (hero + sections)
export async function PUT(req) {
  try {
    const gate = await requireAdminRoles(['admin', 'editor']);
    if (gate.error) return gate.error;
    const { user } = gate;
    const body = await req.json();
    // Update hero
    await prisma.servicesPage.upsert({
      where: { id: body.id || 1 },
      update: {
        heroImageUrl: body.heroImageUrl,
        heroTitle: body.heroTitle,
        heroDesc: body.heroDesc,
        sectionTitle: body.sectionTitle,
        sectionDesc: body.sectionDesc,
        requirementsText: body.requirementsText ?? null,
      },
      create: {
        heroImageUrl: body.heroImageUrl,
        heroTitle: body.heroTitle,
        heroDesc: body.heroDesc,
        sectionTitle: body.sectionTitle,
        sectionDesc: body.sectionDesc,
        requirementsText: body.requirementsText ?? null,
      },
    });
    // Update sections (replace all)
    if (Array.isArray(body.sections)) {
      // Delete all existing
      await prisma.service.deleteMany();
      // Create new
      for (const section of body.sections) {
        await prisma.service.create({
          data: {
            title: section.title,
            description: section.description,
            iconUrl: section.iconUrl,
            country: section.country,
            buttonLabel: section.buttonLabel,
            buttonLink: section.buttonLink,
          },
        });
      }
    }
    await safeWriteAuditLog(req, {
    category: 'content',
    action: 'content.services.update',
    status: 'SUCCESS',
    summary: `${user.name || user.email} updated the services page.`,
    actorSnapshot: buildActorSnapshot(user),
    targetType: 'services-page',
    targetId: body.id || 1,
    targetLabel: 'Services Page',
    details: {
      heroTitle: body.heroTitle || '',
      sectionsCount: Array.isArray(body.sections) ? body.sections.length : 0,
      hasRequirementsText: Boolean(body.requirementsText),
    },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('ServicesPage PUT error:', e);
    return NextResponse.json({ error: 'Failed to update services page' }, { status: 500 });
  }
}
