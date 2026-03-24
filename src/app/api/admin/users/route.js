import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { validateApplicationStyleEmail } from "@/lib/email-validation";

// Only admins can access user management
export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(users);
}

export async function DELETE(req) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  const toRemove = await prisma.user.findUnique({ where: { id } });
  if (!toRemove) {
    return NextResponse.json({ error: "User not found" }, { status: 400 });
  }
  // Prevent deleting the last admin
  if (toRemove.role === "admin") {
    const adminCount = await prisma.user.count({ where: { role: "admin" } });
    if (adminCount <= 1) {
      return NextResponse.json({ error: "Cannot delete the last admin" }, { status: 400 });
    }
  }
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PATCH(req) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  const body = await req.json();
  const updateData = {};
  if (body.name !== undefined) updateData.name = body.name;
  // Allow email update with uniqueness check
  if (body.email !== undefined) {
    const email = String(body.email).trim();
    const emailError = validateApplicationStyleEmail(email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
    updateData.email = email;
  }
  // Role change (admin/editor) with last-admin protection
  if (body.role !== undefined) {
    const role = String(body.role);
    if (!["admin", "editor"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (target.role === "admin" && role === "editor") {
      const adminCount = await prisma.user.count({ where: { role: "admin" } });
      if (adminCount <= 1) {
        return NextResponse.json({ error: "Cannot demote the last admin" }, { status: 400 });
      }
    }
    updateData.role = role;
  }
  // Remove role change for editors (intentionally disabled)
  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }
  const updated = await prisma.user.update({ where: { id }, data: updateData });
  return NextResponse.json({ id: updated.id, name: updated.name, email: updated.email, role: updated.role });
}

export async function POST(req) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { name, email, password, role } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const emailError = validateApplicationStyleEmail(email);
  if (emailError) {
    return NextResponse.json({ error: emailError }, { status: 400 });
  }
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "Email already exists" }, { status: 400 });
  }
  const bcrypt = require("bcryptjs");
  const hashed = await bcrypt.hash(password, 10);
  const created = await prisma.user.create({
    data: { name, email, password: hashed, role: ["admin", "editor"].includes(role) ? role : "editor" },
  });
  return NextResponse.json({ id: created.id, name: created.name, email: created.email, role: created.role });
}
