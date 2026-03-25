import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { validateApplicationStyleEmail } from "@/lib/email-validation";

// GET: Fetch footer info
export async function GET() {
  const footer = await prisma.footer.findFirst();
  return NextResponse.json(footer || {});
}

// POST: Update footer info
export async function POST(req) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  return NextResponse.json(footer);
}
