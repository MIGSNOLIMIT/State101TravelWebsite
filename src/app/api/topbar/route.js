import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const { address, phone, email } = await req.json();
    let topbar = await prisma.topBar.findFirst();
    if (topbar) {
      topbar = await prisma.topBar.update({
        where: { id: topbar.id },
        data: { address, phone, email },
      });
    } else {
      topbar = await prisma.topBar.create({
        data: { address, phone, email },
      });
    }
    return NextResponse.json(topbar);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update TopBar.' }, { status: 500 });
  }
}
