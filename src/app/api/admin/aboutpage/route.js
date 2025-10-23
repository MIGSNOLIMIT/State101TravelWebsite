import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET: Fetch AboutPage content
export async function GET() {
  try {
    let aboutPage = await prisma.aboutPage.findFirst();
    if (!aboutPage) {
      aboutPage = await prisma.aboutPage.create({
        data: { heroImageUrl: '' },
      });
    }
    return NextResponse.json(aboutPage);
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST: Update AboutPage content
export async function POST(req) {
  try {
    const body = await req.json();
    let aboutPage = await prisma.aboutPage.findFirst();
    if (!aboutPage) {
      aboutPage = await prisma.aboutPage.create({ data: body });
    } else {
      aboutPage = await prisma.aboutPage.update({ where: { id: aboutPage.id }, data: body });
    }
    return NextResponse.json(aboutPage);
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
