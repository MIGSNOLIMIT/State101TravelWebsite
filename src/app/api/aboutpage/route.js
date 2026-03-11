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
    // Allow clearing the hero image (null/empty string)
    const isEmpty = heroImageUrl === null || heroImageUrl === undefined || heroImageUrl === "";
    // Validate only when a non-empty value is provided
    const validUrl = isEmpty || (typeof heroImageUrl === "string" &&
      (heroImageUrl.startsWith("http://") ||
       heroImageUrl.startsWith("https://") ||
       heroImageUrl.startsWith("/")));
    if (!validUrl) {
      return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
    }
    const about = await prisma.aboutPage.findFirst();
    if (!about) {
      await prisma.aboutPage.create({ data: { heroImageUrl: isEmpty ? null : heroImageUrl } });
    } else {
      await prisma.aboutPage.update({ where: { id: about.id }, data: { heroImageUrl: isEmpty ? null : heroImageUrl } });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update About page" }, { status: 500 });
  }
}
