import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { buildActorSnapshot, safeWriteAuditLog } from "@/lib/audit-log";

export const dynamic = "force-dynamic";

const NOTE_TAGS = ["IMPORTANT", "FOLLOW_UP", "REMINDER"];

async function getCurrentUser() {
  const session = await getAdminSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user || !["admin", "editor"].includes(user.role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user };
}

function isValidNoteDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function normalizeTag(value) {
  const normalized = String(value || "").trim().toUpperCase();
  return NOTE_TAGS.includes(normalized) ? normalized : "REMINDER";
}

export async function GET(req) {
  try {
    const gate = await getCurrentUser();
    if (gate.error) return gate.error;

    const noteDate = req.nextUrl.searchParams.get("noteDate");

    if (noteDate) {
      if (!isValidNoteDate(noteDate)) {
        return NextResponse.json({ error: "Invalid date" }, { status: 400 });
      }

      const note = await prisma.dashboardCalendarNote.findUnique({
        where: { noteDate },
        select: {
          noteDate: true,
          note: true,
          tag: true,
          updatedAt: true,
          actorUserId: true,
          actorName: true,
          actorEmail: true,
          history: {
            orderBy: { createdAt: "desc" },
            take: 8,
            select: {
              id: true,
              note: true,
              tag: true,
              actorName: true,
              actorEmail: true,
              createdAt: true,
            },
          },
        },
      });

      if (!note) {
        return NextResponse.json({
          noteDate,
          note: "",
          tag: "REMINDER",
          updatedAt: null,
          actorName: null,
          actorEmail: null,
          canEdit: gate.user.role === "admin",
          history: [],
        });
      }

      return NextResponse.json({
        noteDate: note.noteDate,
        note: note.note,
        tag: note.tag,
        updatedAt: note.updatedAt,
        actorName: note.actorName,
        actorEmail: note.actorEmail,
        canEdit: gate.user.role === "admin" && note.actorUserId === gate.user.id,
        history: note.history,
      });
    }

    const notes = await prisma.dashboardCalendarNote.findMany({
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
    });

    return NextResponse.json(
      notes.map((note) => ({
        noteDate: note.noteDate,
        note: note.note,
        tag: note.tag,
        updatedAt: note.updatedAt,
        actorName: note.actorName,
        actorEmail: note.actorEmail,
        canEdit: gate.user.role === "admin" && note.actorUserId === gate.user.id,
      }))
    );
  } catch (error) {
    console.error("dashboard notes get error", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const gate = await getCurrentUser();
    if (gate.error) return gate.error;
    if (gate.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const noteDate = String(body?.noteDate || "").trim();
    const note = String(body?.note || "").trim();
    const tag = normalizeTag(body?.tag);

    if (!isValidNoteDate(noteDate)) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    if (note.length > 500) {
      return NextResponse.json({ error: "Note is too long" }, { status: 400 });
    }

    const existing = await prisma.dashboardCalendarNote.findUnique({
      where: { noteDate },
      select: {
        actorUserId: true,
      },
    });

    if (existing && existing.actorUserId !== gate.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!note) {
      await prisma.dashboardCalendarNote.deleteMany({
        where: { noteDate },
      });

      await safeWriteAuditLog(req, {
        category: "dashboard",
        action: "dashboard.calendar.note.delete",
        status: "SUCCESS",
        summary: `${gate.user.name || gate.user.email} removed a dashboard calendar note for ${noteDate}.`,
        actorSnapshot: buildActorSnapshot(gate.user),
        targetType: "dashboard_calendar_note",
        targetId: noteDate,
        targetLabel: noteDate,
        details: { noteDate },
      });

      return NextResponse.json({ noteDate, note: null, updatedAt: null, canEdit: false });
    }

    const saved = await prisma.dashboardCalendarNote.upsert({
      where: { noteDate },
      update: {
        note,
        tag,
        actorUserId: gate.user.id,
        actorName: gate.user.name || null,
        actorEmail: gate.user.email || null,
      },
      create: {
        noteDate,
        note,
        tag,
        actorUserId: gate.user.id,
        actorName: gate.user.name || null,
        actorEmail: gate.user.email || null,
      },
      select: {
        id: true,
        noteDate: true,
        note: true,
        tag: true,
        updatedAt: true,
        actorName: true,
        actorEmail: true,
      },
    });

    await prisma.dashboardCalendarNoteHistory.create({
      data: {
        noteId: saved.id,
        noteDate: saved.noteDate,
        note: saved.note,
        tag: saved.tag,
        actorUserId: gate.user.id,
        actorName: gate.user.name || null,
        actorEmail: gate.user.email || null,
      },
    });

    await safeWriteAuditLog(req, {
      category: "dashboard",
      action: "dashboard.calendar.note.save",
      status: "SUCCESS",
      summary: `${gate.user.name || gate.user.email} saved a dashboard calendar note for ${noteDate}.`,
      actorSnapshot: buildActorSnapshot(gate.user),
      targetType: "dashboard_calendar_note",
      targetId: noteDate,
      targetLabel: noteDate,
      details: { noteDate, tag },
    });

    const history = await prisma.dashboardCalendarNoteHistory.findMany({
      where: { noteId: saved.id },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        note: true,
        tag: true,
        actorName: true,
        actorEmail: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ...saved, canEdit: true, history });
  } catch (error) {
    console.error("dashboard notes put error", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
