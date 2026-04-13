import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminRoles } from "@/lib/admin-access";
import { buildActorSnapshot, safeWriteAuditLog } from "@/lib/audit-log";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const about = await prisma.aboutPage.findFirst();
    return NextResponse.json({
      heroImageUrl: about?.heroImageUrl || "",
      heroDescription: about?.heroDescription || "",
      storyContent: about?.storyContent || "",
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch About page" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const gate = await requireAdminRoles(["admin", "editor"]);
    if (gate.error) return gate.error;
    const { user } = gate;
    const { heroImageUrl, heroDescription, storyContent } = await req.json();
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
      await prisma.aboutPage.create({
        data: {
          heroImageUrl: isEmpty ? null : heroImageUrl,
          heroDescription: typeof heroDescription === "string" ? heroDescription : "",
          storyContent: typeof storyContent === "string" ? storyContent : "",
        },
      });
    } else {
      await prisma.aboutPage.update({
        where: { id: about.id },
        data: {
          heroImageUrl: isEmpty ? null : heroImageUrl,
          heroDescription: typeof heroDescription === "string" ? heroDescription : "",
          storyContent: typeof storyContent === "string" ? storyContent : "",
        },
      });
    }
    await safeWriteAuditLog(req, {
    category: "content",
    action: "content.about.update",
    status: "SUCCESS",
    summary: `${user.name || user.email} updated the About page.`,
    actorSnapshot: buildActorSnapshot(user),
    targetType: "about-page",
    targetLabel: "About Page",
    details: {
      hasHeroImage: Boolean(heroImageUrl),
      heroDescriptionLength: String(heroDescription || "").length,
      storyContentLength: String(storyContent || "").length,
    },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update About page" }, { status: 500 });
  }
}
