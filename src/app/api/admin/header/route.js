import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminRoles } from "@/lib/admin-access";
import { buildActorSnapshot, safeWriteAuditLog } from "@/lib/audit-log";

// GET: Fetch header logo
export async function GET() {
  const header = await prisma.header.findFirst();
  return NextResponse.json(header || {});
}

// POST: Update header logo
export async function POST(req) {
  const gate = await requireAdminRoles(["admin", "editor"]);
  if (gate.error) return gate.error;
  const { user } = gate;
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
  await safeWriteAuditLog(req, {
    category: "content",
    action: "content.header.update",
    status: "SUCCESS",
    summary: `${user.name || user.email} updated the website header logo.`,
    actorSnapshot: buildActorSnapshot(user),
    targetType: "header",
    targetId: header.id,
    targetLabel: "Website Header",
    details: { hasLogo: Boolean(logoUrl) },
  });
  return NextResponse.json(header);
}
