import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [footer, topbar] = await Promise.all([
      prisma.footer.findFirst(),
      prisma.topBar.findFirst(),
    ]);

    // Prefer Footer values where available, then fall back to TopBar
    const address = (footer?.address?.trim?.() || topbar?.address?.trim?.() || "");
    const phoneFooter = footer?.phone?.trim?.() || "";
    const phoneTop = topbar?.phone?.trim?.() || "";
    const phones = Array.from(new Set([phoneFooter, phoneTop].filter(Boolean)));
    const email = (footer?.email?.trim?.() || topbar?.email?.trim?.() || "");
    const hours = (footer?.hours?.trim?.() || topbar?.hours?.trim?.() || "");

    const website_url = process.env.NEXT_PUBLIC_SITE_URL || "";

    return NextResponse.json({ address, phones, email, hours, website_url });
  } catch (e) {
    console.error("facts endpoint error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
