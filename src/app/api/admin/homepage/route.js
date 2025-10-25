import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

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

    return NextResponse.json(homepage);
  } catch (err) {
    console.error('❌ Error updating homepage CMS:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
