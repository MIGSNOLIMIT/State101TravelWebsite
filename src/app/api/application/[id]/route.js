import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { canAccessAdminRoles, withEffectiveAdminRole } from "@/lib/admin-role";
import { buildActorSnapshot, safeWriteAuditLog } from "@/lib/audit-log";
import {
  canTransitionApplicationStatus,
  getAllowedApplicationStatusTransitions,
  getApplicationStatusLabel,
  isApplicationStatus,
  normalizeApplicationStatus,
} from "@/lib/application-status";

export const dynamic = "force-dynamic";

function formatScheduleSlot(date) {
  if (!date) return "the selected time";

  return new Date(date).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildScheduleConflictPayload(conflict) {
  return {
    code: "SCHEDULED_SLOT_TAKEN",
    error: conflict?.fullName
      ? `${formatScheduleSlot(conflict.scheduledAt)} is already assigned to ${conflict.fullName}. Please choose another time.`
      : `${formatScheduleSlot(conflict?.scheduledAt)} is already occupied. Please choose another time.`,
    conflict: conflict
      ? {
          id: conflict.id,
          fullName: conflict.fullName,
          scheduledAt: conflict.scheduledAt,
        }
      : null,
  };
}

async function requireRole(reqRoleCheck = (role) => role === "admin") {
  const session = await getAdminSession();
  if (!session) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const me = withEffectiveAdminRole(await prisma.user.findUnique({ where: { id: session.userId } }));
  if (!me || !reqRoleCheck(me.role) || !canAccessAdminRoles(me, ["admin"])) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { me };
}

export async function GET(_req, { params }) {
  try {
    const gate = await requireRole();
    if (gate.error) return gate.error;
    const id = params?.id;
    const entry = await prisma.applicationEntry.findUnique({
      where: { id },
      include: {
        files: true,
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(entry);
  } catch (e) {
    console.error("application get error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  let requestedScheduleAt = null;
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

    const normalizedStatus = normalizeApplicationStatus(status);
    const note = String(body?.note || "").trim();
    const scheduledAtValue = body?.scheduledAt ? new Date(body.scheduledAt) : null;
    const hasValidScheduledAt = scheduledAtValue && !Number.isNaN(scheduledAtValue.getTime());

    if (!status || !isApplicationStatus(normalizedStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (!note) {
      return NextResponse.json({ error: "A note is required before moving an application." }, { status: 400 });
    }

    if (normalizedStatus === "SCHEDULED" && !hasValidScheduledAt) {
      return NextResponse.json({ error: "A schedule date and time is required for scheduled applications." }, { status: 400 });
    }

    const existing = await prisma.applicationEntry.findUnique({
      where: { id },
      select: { id: true, fullName: true, status: true, scheduledAt: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const currentStatus = normalizeApplicationStatus(existing.status);
    const nextScheduledAt =
      normalizedStatus === "SCHEDULED"
        ? scheduledAtValue
        : currentStatus === "SCHEDULED" && normalizedStatus === "APPROVED"
          ? existing.scheduledAt
          : null;
    requestedScheduleAt = normalizedStatus === "SCHEDULED" ? nextScheduledAt : null;

    if (!canTransitionApplicationStatus(currentStatus, normalizedStatus)) {
      const allowedTransitions = getAllowedApplicationStatusTransitions(currentStatus)
        .map((value) => getApplicationStatusLabel(value))
        .join(", ");

      return NextResponse.json(
        {
          error: allowedTransitions
            ? `${getApplicationStatusLabel(currentStatus)} applications can only move to ${allowedTransitions}.`
            : `${getApplicationStatusLabel(existing.status)} applications cannot be moved to ${getApplicationStatusLabel(normalizedStatus)}.`,
        },
        { status: 400 }
      );
    }

    if (normalizedStatus === "SCHEDULED" && nextScheduledAt) {
      const conflictingEntry = await prisma.applicationEntry.findFirst({
        where: {
          id: { not: existing.id },
          archivedAt: null,
          status: "SCHEDULED",
          scheduledAt: nextScheduledAt,
        },
        select: {
          id: true,
          fullName: true,
          scheduledAt: true,
        },
      });

      if (conflictingEntry) {
        return NextResponse.json(buildScheduleConflictPayload(conflictingEntry), { status: 409 });
      }
    }

    const updated = await prisma.applicationEntry.update({
      where: { id },
      data: {
        status: normalizedStatus,
        scheduledAt: nextScheduledAt,
        statusHistory: {
          create: {
            fromStatus: existing.status,
            toStatus: normalizedStatus,
            note,
            scheduledAt: nextScheduledAt,
            actorUserId: actor.id,
            actorName: actor.name || null,
            actorEmail: actor.email || null,
          },
        },
      },
      include: {
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    await safeWriteAuditLog(req, {
      category: "applications",
      action: "applications.status.update",
      status: "SUCCESS",
      summary: `${actor.name || actor.email} changed ${existing?.fullName || updated.id} to ${getApplicationStatusLabel(normalizedStatus)}.`,
      actorSnapshot: buildActorSnapshot(actor),
      targetType: "application",
      targetId: updated.id,
      targetLabel: existing?.fullName || updated.id,
      details: {
        fromStatus: existing?.status || null,
        toStatus: normalizedStatus,
        note,
        scheduledAt: nextScheduledAt,
      },
    });
    return NextResponse.json(updated);
  } catch (e) {
    if (e?.code === "P2002" && requestedScheduleAt) {
      return NextResponse.json(
        buildScheduleConflictPayload({ id: null, fullName: null, scheduledAt: requestedScheduleAt }),
        { status: 409 }
      );
    }
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
