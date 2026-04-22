import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminRoles } from "@/lib/admin-access";
import { buildActorSnapshot, safeWriteAuditLog } from "@/lib/audit-log";

// GET: Fetch header branding
export async function GET() {
  const header = await prisma.header.findFirst();
  return NextResponse.json({
    logoUrl: header?.logoUrl || "",
    websiteName: header?.websiteName || "",
  });
}

// POST: Update header branding
export async function POST(req) {
  const gate = await requireAdminRoles(["admin", "editor"]);
  if (gate.error) return gate.error;
  const { user } = gate;
  const body = await req.json();
  const logoUrl = typeof body.logoUrl === "string" ? body.logoUrl : "";
  const websiteName = typeof body.websiteName === "string" ? body.websiteName.trim() : "";
  let header = await prisma.header.findFirst();
  if (header) {
    header = await prisma.header.update({
      where: { id: header.id },
      data: { logoUrl, websiteName },
    });
  } else {
    header = await prisma.header.create({
      data: { logoUrl, websiteName },
    });
  }
  await safeWriteAuditLog(req, {
    category: "content",
    action: "content.header.update",
    status: "SUCCESS",
    summary: `${user.name || user.email} updated the website header branding.`,
    actorSnapshot: buildActorSnapshot(user),
    targetType: "header",
    targetId: header.id,
    targetLabel: "Website Header",
    details: { hasLogo: Boolean(logoUrl), websiteName },
  });
  return NextResponse.json(header);
}
