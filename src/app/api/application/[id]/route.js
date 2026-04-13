import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { buildActorSnapshot, safeWriteAuditLog } from "@/lib/audit-log";

export const dynamic = "force-dynamic";

async function requireRole(reqRoleCheck = (role) => role === "admin") {
  const session = await getAdminSession();
  if (!session) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const me = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!me || !reqRoleCheck(me.role)) return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { me };
}

export async function GET(_req, { params }) {
  try {
    const gate = await requireRole();
    if (gate.error) return gate.error;
    const id = params?.id;
    const entry = await prisma.applicationEntry.findUnique({ where: { id }, include: { files: true } });
    if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(entry);
  } catch (e) {
    console.error("application get error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const gate = await requireRole();
    if (gate.error) return gate.error;
    const actor = gate.me;
    const id = params?.id;
    const body = await req.json();
    const { status, archived } = body || {};

    if (typeof archived === "boolean") {
      const existing = await prisma.applicationEntry.findUnique({ where: { id }, select: { id: true, fullName: true, archivedAt: true } });
      const updated = await prisma.applicationEntry.update({
        where: { id },
        data: { archivedAt: archived ? new Date() : null },
      });
      await safeWriteAuditLog(req, {
      category: "applications",
      action: archived ? "applications.archive" : "applications.restore",
      status: "SUCCESS",
      summary: `${actor.name || actor.email} ${archived ? 'archived' : 'restored'} application ${existing?.fullName || updated.id}.`,
      actorSnapshot: buildActorSnapshot(actor),
      targetType: "application",
      targetId: updated.id,
      targetLabel: existing?.fullName || updated.id,
      details: { archived },
      });
      return NextResponse.json(updated);
    }

    if (!status || !["NEW", "IN_REVIEW", "APPROVED", "DECLINED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const existing = await prisma.applicationEntry.findUnique({ where: { id }, select: { id: true, fullName: true, status: true } });
    const updated = await prisma.applicationEntry.update({ where: { id }, data: { status } });
    await safeWriteAuditLog(req, {
      category: "applications",
      action: "applications.status.update",
      status: "SUCCESS",
      summary: `${actor.name || actor.email} changed ${existing?.fullName || updated.id} to ${status}.`,
      actorSnapshot: buildActorSnapshot(actor),
      targetType: "application",
      targetId: updated.id,
      targetLabel: existing?.fullName || updated.id,
      details: { fromStatus: existing?.status || null, toStatus: status },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("application patch error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    const gate = await requireRole();
    if (gate.error) return gate.error;
    const actor = gate.me;
    const id = params?.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const existing = await prisma.applicationEntry.findUnique({ where: { id }, select: { id: true, fullName: true } });

    const updated = await prisma.applicationEntry.update({
      where: { id },
      data: { archivedAt: new Date() },
    });

    await safeWriteAuditLog(_req, {
      category: "applications",
      action: "applications.archive",
      status: "SUCCESS",
      summary: `${actor.name || actor.email} archived application ${existing?.fullName || updated.id}.`,
      actorSnapshot: buildActorSnapshot(actor),
      targetType: "application",
      targetId: updated.id,
      targetLabel: existing?.fullName || updated.id,
      details: { archivedAt: updated.archivedAt },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (e) {
    console.error("application delete error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

