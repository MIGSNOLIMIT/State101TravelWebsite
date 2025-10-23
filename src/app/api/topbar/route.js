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
