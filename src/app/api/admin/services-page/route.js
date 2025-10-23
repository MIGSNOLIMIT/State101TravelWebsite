import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
      },
      create: {
        heroImageUrl: body.heroImageUrl,
        heroTitle: body.heroTitle,
        heroDesc: body.heroDesc,
        sectionTitle: body.sectionTitle,
        sectionDesc: body.sectionDesc,
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
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('ServicesPage PUT error:', e);
    return NextResponse.json({ error: 'Failed to update services page' }, { status: 500 });
  }
}
