import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import {
  canAccessAdminRoles,
  canManageAdminUsers,
  canManageEditorUsers,
  isProtectedSuperAdminUser,
  isSuperAdminEmail,
  withEffectiveAdminRole,
} from "@/lib/admin-role";
import { validateApplicationStyleEmail } from "@/lib/email-validation";
import { buildActorSnapshot, safeWriteAuditLog } from "@/lib/audit-log";
import { generateRandomPassword, validatePassword, validateUsername } from "@/lib/account-validation";
import bcrypt from "bcryptjs";

// Only admins can access user management
export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = withEffectiveAdminRole(await prisma.user.findUnique({ where: { id: session.userId } }));
  if (!user || !canAccessAdminRoles(user, ["admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    orderBy: { id: "asc" },
    select: { id: true, name: true, email: true, role: true },
  });
  return NextResponse.json(users.filter((item) => !isProtectedSuperAdminUser(item)));
}

export async function DELETE(req) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = withEffectiveAdminRole(await prisma.user.findUnique({ where: { id: session.userId } }));
  if (!user || !canAccessAdminRoles(user, ["admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  const toRemove = await prisma.user.findUnique({ where: { id } });
  if (!toRemove) {
    return NextResponse.json({ error: "User not found" }, { status: 400 });
  }
  if (isProtectedSuperAdminUser(toRemove)) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (toRemove.role === "admin" && !canManageAdminUsers(user)) {
    return NextResponse.json({ error: "Only the super admin can remove admin accounts" }, { status: 403 });
  }
  if (toRemove.role !== "admin" && !canManageEditorUsers(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // Prevent deleting the last admin
  if (toRemove.role === "admin" && !canManageAdminUsers(user)) {
    const adminCount = await prisma.user.count({ where: { role: "admin" } });
    if (adminCount <= 1) {
      return NextResponse.json({ error: "Cannot delete the last admin" }, { status: 400 });
    }
  }
  await prisma.user.delete({ where: { id } });
  await safeWriteAuditLog(req, {
    category: "users",
    action: "users.delete",
    status: "SUCCESS",
    summary: `${user.name || user.email} deleted user ${toRemove.name || toRemove.email}.`,
    actorSnapshot: buildActorSnapshot(user),
    targetType: "user",
    targetId: toRemove.id,
    targetLabel: toRemove.name || toRemove.email,
    details: { deletedUserEmail: toRemove.email, deletedUserRole: toRemove.role },
  });
  return NextResponse.json({ success: true });
}

export async function PATCH(req) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = withEffectiveAdminRole(await prisma.user.findUnique({ where: { id: session.userId } }));
  if (!user || !canAccessAdminRoles(user, ["admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (isProtectedSuperAdminUser(target)) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (target.role === "admin" && !canManageAdminUsers(user)) {
    return NextResponse.json({ error: "Only the super admin can edit admin accounts" }, { status: 403 });
  }
  const body = await req.json();
  const updateData = {};
  if (body.name !== undefined) {
    const usernameError = validateUsername(body.name);
    if (usernameError) {
      return NextResponse.json({ error: usernameError }, { status: 400 });
    }
    updateData.name = String(body.name).trim();
  }
  // Allow email update with uniqueness check
  if (body.email !== undefined) {
    const email = String(body.email).trim().toLowerCase();
    const emailError = validateApplicationStyleEmail(email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
    if (isSuperAdminEmail(email)) {
      return NextResponse.json({ error: "That email is reserved" }, { status: 403 });
    }
    updateData.email = email;
  }
  // Role change (admin/editor) with last-admin protection
  if (body.role !== undefined) {
    const role = String(body.role);
    if (!["admin", "editor"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (role === "admin" && !canManageAdminUsers(user)) {
      return NextResponse.json({ error: "Only the super admin can assign admin accounts" }, { status: 403 });
    }
    if (target.role === "admin" && role === "editor") {
      if (!canManageAdminUsers(user)) {
        return NextResponse.json({ error: "Only the super admin can change admin roles" }, { status: 403 });
      }
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
  const existingUser = target;
  const updated = await prisma.user.update({ where: { id }, data: updateData });
  await safeWriteAuditLog(req, {
    category: "users",
    action: "users.update",
    status: "SUCCESS",
    summary: `${user.name || user.email} updated user ${updated.name || updated.email}.`,
    actorSnapshot: buildActorSnapshot(user),
    targetType: "user",
    targetId: updated.id,
    targetLabel: updated.name || updated.email,
    details: {
      changedFields: Object.keys(updateData),
      before: existingUser ? { name: existingUser.name, email: existingUser.email, role: existingUser.role } : null,
      after: { name: updated.name, email: updated.email, role: updated.role },
    },
  });
  return NextResponse.json({ id: updated.id, name: updated.name, email: updated.email, role: updated.role });
}

export async function POST(req) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = withEffectiveAdminRole(await prisma.user.findUnique({ where: { id: session.userId } }));
  if (!user || !canAccessAdminRoles(user, ["admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { name, email, password, role } = await req.json();
  if (!email || !name) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const usernameError = validateUsername(name);
  if (usernameError) {
    return NextResponse.json({ error: usernameError }, { status: 400 });
  }
  const emailError = validateApplicationStyleEmail(email);
  if (emailError) {
    return NextResponse.json({ error: emailError }, { status: 400 });
  }
  const resolvedPassword = password || generateRandomPassword();
  const passwordError = validatePassword(resolvedPassword);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  if (isSuperAdminEmail(normalizedEmail)) {
    return NextResponse.json({ error: "That email is reserved" }, { status: 403 });
  }
  const exists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (exists) {
    return NextResponse.json({ error: "Email already exists" }, { status: 400 });
  }
  const nextRole = ["admin", "editor"].includes(role) ? role : "editor";
  if (nextRole === "admin" && !canManageAdminUsers(user)) {
    return NextResponse.json({ error: "Only the super admin can create admin accounts" }, { status: 403 });
  }
  const hashed = await bcrypt.hash(resolvedPassword, 10);
  const created = await prisma.user.create({
    data: { name: String(name).trim(), email: normalizedEmail, password: hashed, role: nextRole },
  });
  await safeWriteAuditLog(req, {
    category: "users",
    action: "users.create",
    status: "SUCCESS",
    summary: `${user.name || user.email} created user ${created.name || created.email}.`,
    actorSnapshot: buildActorSnapshot(user),
    targetType: "user",
    targetId: created.id,
    targetLabel: created.name || created.email,
    details: { createdUserEmail: created.email, createdUserRole: created.role },
  });
  return NextResponse.json({ id: created.id, name: created.name, email: created.email, role: created.role });
}
