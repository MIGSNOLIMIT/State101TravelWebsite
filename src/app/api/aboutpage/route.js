import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const about = await prisma.aboutPage.findFirst();
    return NextResponse.json({ heroImageUrl: about?.heroImageUrl || "" });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch About page" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { heroImageUrl } = await req.json();
    // Validate heroImageUrl before saving
    const validUrl = typeof heroImageUrl === "string" &&
      (heroImageUrl.startsWith("http://") ||
       heroImageUrl.startsWith("https://") ||
       heroImageUrl.startsWith("/"));
    if (!validUrl) {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
    }
    const about = await prisma.aboutPage.findFirst();
    if (!about) {
      await prisma.aboutPage.create({ data: { heroImageUrl } });
    } else {
      await prisma.aboutPage.update({ where: { id: about.id }, data: { heroImageUrl } });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update About page" }, { status: 500 });
  }
}
