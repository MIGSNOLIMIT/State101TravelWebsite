import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

// GET: List all users (admin only)
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

// DELETE: Remove an editor (admin only)
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
  if (!toRemove || toRemove.role === "admin") {
    return NextResponse.json({ error: "Cannot remove admin" }, { status: 400 });
  }
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

// PATCH: Change user role (admin only)
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
  if (body.role && ["admin", "editor"].includes(body.role)) updateData.role = body.role;
  // Optionally add email/password update logic here
  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }
  await prisma.user.update({ where: { id }, data: updateData });
  return NextResponse.json({ success: true });
}

// POST: Create new user (admin only)
export async function POST(req) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { name, email, password, role } = await req.json();
  if (!email || !password || !role || !["admin", "editor"].includes(role)) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "Email already exists" }, { status: 400 });
  }
  const bcrypt = require("bcryptjs");
  const hashed = await bcrypt.hash(password, 10);
  const created = await prisma.user.create({
    data: { name, email, password: hashed, role },
  });
  return NextResponse.json({ id: created.id, name: created.name, email: created.email, role: created.role });
}
