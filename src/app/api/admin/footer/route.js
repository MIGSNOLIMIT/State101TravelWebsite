import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

// GET: Fetch footer info
export async function GET() {
  const footer = await prisma.footer.findFirst();
  return NextResponse.json(footer || {});
}

// POST: Update footer info
export async function POST(req) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { address, phone, email, socialLinks, logoUrl = "" } = await req.json();
  let footer = await prisma.footer.findFirst();
  if (footer) {
    footer = await prisma.footer.update({
      where: { id: footer.id },
      data: { address, phone, email, socialLinks: JSON.stringify(socialLinks), logoUrl },
    });
  } else {
    footer = await prisma.footer.create({
      data: { address, phone, email, socialLinks: JSON.stringify(socialLinks), logoUrl },
    });
  }
  return NextResponse.json(footer);
}
