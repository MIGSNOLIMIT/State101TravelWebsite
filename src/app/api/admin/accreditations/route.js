import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

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
    const body = await req.json(); // expects array of { logoUrl, name }
    // Remove all existing accreditations
    await prisma.accreditation.deleteMany();
    // Add new accreditations
    const newAccreditations = await prisma.accreditation.createMany({
      data: body.slice(0, 3),
    });
    return NextResponse.json(newAccreditations);
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
