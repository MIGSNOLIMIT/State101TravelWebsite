import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminRoles } from "@/lib/admin-access";
import { validateApplicationStyleEmail } from "@/lib/email-validation";
import { buildActorSnapshot, safeWriteAuditLog } from "@/lib/audit-log";

// GET: Fetch footer info
export async function GET() {
  const footer = await prisma.footer.findFirst();
  return NextResponse.json(footer || {});
}

// POST: Update footer info
export async function POST(req) {
  const gate = await requireAdminRoles(["admin", "editor"]);
  if (gate.error) return gate.error;
  const { user } = gate;
  const body = await req.json();
  // Allow empty strings/arrays for all fields
  const address = typeof body.address === 'string' ? body.address : '';
  const phone = typeof body.phone === 'string' ? body.phone : '';
  const email = typeof body.email === 'string' ? body.email : '';
  const hours = typeof body.hours === 'string' ? body.hours : '';
  const logoUrl = typeof body.logoUrl === 'string' ? body.logoUrl : '';
  if (email.trim()) {
    const emailError = validateApplicationStyleEmail(email.trim());
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }
  }
  const rawLinks = Array.isArray(body.socialLinks) ? body.socialLinks : [];
  const socialLinks = JSON.stringify(rawLinks);
  let footer = await prisma.footer.findFirst();
  if (footer) {
    footer = await prisma.footer.update({
      where: { id: footer.id },
      data: { address, phone, email: email.trim(), hours, socialLinks, logoUrl },
    });
  } else {
    footer = await prisma.footer.create({
      data: { address, phone, email: email.trim(), hours, socialLinks, logoUrl },
    });
  }
  await safeWriteAuditLog(req, {
    category: "content",
    action: "content.footer.update",
    status: "SUCCESS",
    summary: `${user.name || user.email} updated the website footer.`,
    actorSnapshot: buildActorSnapshot(user),
    targetType: "footer",
    targetId: footer.id,
    targetLabel: "Website Footer",
    details: { address, phone, email: email.trim(), hours, hasLogo: Boolean(logoUrl), socialLinksCount: rawLinks.length },
  });
  return NextResponse.json(footer);
}
