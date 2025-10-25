import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';


// GET: Fetch homepage content
export async function GET() {
  try {
    let homepage = await prisma.homepage.findFirst();
    if (!homepage) {
      // Create default homepage if not exists
      homepage = await prisma.homepage.create({
        data: {
          heroTitle: "Trusted Visa Experts since 2017 - Your Path to the U.S. and Canada",
          heroDesc: "Expert in Visa Assistance Canada and America Immigration Consultancy Specialist",
          heroImages: [],
          aboutTitle: "Who we are?",
          aboutDesc: "Our Mission: To provide reliable and transparent assistance...\nOur Vision: To be the most trusted partner...",
          servicesTitle: "Our Services",
          testimonialsTitle: "Our successful clients",
          testimonialsImages: [],
          testimonialsVideoUrl: "", // Default empty video URL
        },
      });
    }
    // Fetch all services from Service table
    const services = await prisma.service.findMany();
    // Attach services array to homepage response
    return NextResponse.json({
      ...homepage,
      services,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST: Update homepage content
export async function POST(req) {
  try {
    const body = await req.json();
    // Only allow valid homepage fields
    const allowedFields = [
      'heroTitle', 'heroDesc', 'heroImages', 'aboutTitle', 'aboutDesc',
      'servicesTitle', 'testimonialsTitle', 'testimonialsImages', 'testimonialsVideoUrl'
    ];
    const homepageFields = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) homepageFields[key] = body[key];
    }
    let homepage = await prisma.homepage.findFirst();
    if (!homepage) {
      homepage = await prisma.homepage.create({ data: homepageFields });
    } else {
      homepage = await prisma.homepage.update({ where: { id: homepage.id }, data: homepageFields });
    }
    // Always return homepage with attached services array
    const services = await prisma.service.findMany();
    return NextResponse.json({
      ...homepage,
      services,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
