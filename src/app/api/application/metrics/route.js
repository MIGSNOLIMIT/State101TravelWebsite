import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { APPLICATION_STATUS_ORDER } from "@/lib/application-status";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const me = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!me || !["admin", "editor"].includes(me.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [statusGroups, schedules, notes] = await Promise.all([
      prisma.applicationEntry.groupBy({
        by: ["status"],
        where: {
          archivedAt: null,
        },
        _count: {
          status: true,
        },
      }),
      prisma.applicationEntry.findMany({
        where: {
          archivedAt: null,
          status: "SCHEDULED",
          scheduledAt: {
            not: null,
          },
        },
        orderBy: { scheduledAt: "asc" },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          visaType: true,
          status: true,
          scheduledAt: true,
          availableDay: true,
          availableTime: true,
        },
      }),
      prisma.dashboardCalendarNote.findMany({
        orderBy: { noteDate: "asc" },
        select: {
          noteDate: true,
          note: true,
          tag: true,
          updatedAt: true,
          actorUserId: true,
          actorName: true,
          actorEmail: true,
        },
      }),
    ]);

    const counts = APPLICATION_STATUS_ORDER.reduce((accumulator, status) => {
      accumulator[status] = 0;
      return accumulator;
    }, {});

    for (const group of statusGroups) {
      if (group.status in counts) {
        counts[group.status] = group._count.status;
      }
    }

    return NextResponse.json({
      counts,
      schedules,
      notes: notes.map((note) => ({
        noteDate: note.noteDate,
        note: note.note,
        tag: note.tag,
        updatedAt: note.updatedAt,
        actorName: note.actorName,
        actorEmail: note.actorEmail,
        canEdit: me.role === "admin" && note.actorUserId === me.id,
      })),
    });
  } catch (err) {
    console.error("application metrics error", err);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}
