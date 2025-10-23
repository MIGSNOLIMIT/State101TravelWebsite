import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

// GET: Fetch header logo
export async function GET() {
  const header = await prisma.header.findFirst();
  return NextResponse.json(header || {});
}

// POST: Update header logo
export async function POST(req) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { logoUrl } = await req.json();
  let header = await prisma.header.findFirst();
  if (header) {
    header = await prisma.header.update({
      where: { id: header.id },
      data: { logoUrl },
    });
  } else {
    header = await prisma.header.create({
      data: { logoUrl },
    });
  }
  return NextResponse.json(header);
}
