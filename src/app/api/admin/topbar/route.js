import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

// GET: Fetch top bar info
export async function GET() {
  const topBar = await prisma.topBar.findFirst();
  return NextResponse.json(topBar || {});
}

// POST: Update top bar info
export async function POST(req) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { address, phone, email } = await req.json();
  let topBar = await prisma.topBar.findFirst();
  if (topBar) {
    topBar = await prisma.topBar.update({
      where: { id: topBar.id },
      data: { address, phone, email },
    });
  } else {
    topBar = await prisma.topBar.create({
      data: { address, phone, email },
    });
  }
  return NextResponse.json(topBar);
}
