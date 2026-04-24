import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import {
  ARCHIVE_RETENTION_MONTHS,
  addArchiveRetentionMonths,
  getArchiveCleanupCutoff,
  getNextArchiveCleanupRun,
  getNextPermanentDeleteRunAt,
} from "@/lib/archive-retention";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const me = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!me || !["admin", "editor"].includes(me.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const nextCleanupRunAt = getNextArchiveCleanupRun();
    const nextCleanupCutoffAt = getArchiveCleanupCutoff(nextCleanupRunAt);

    const [archivedCount, dueOnNextRunCount, oldestArchivedItem] = await Promise.all([
      prisma.applicationEntry.count({ where: { NOT: { archivedAt: null } } }),
      prisma.applicationEntry.count({ where: { archivedAt: { lte: nextCleanupCutoffAt } } }),
      prisma.applicationEntry.findFirst({
        where: { NOT: { archivedAt: null } },
        orderBy: { archivedAt: "asc" },
        select: { archivedAt: true },
      }),
    ]);

    const oldestArchivedAt = oldestArchivedItem?.archivedAt || null;

    return NextResponse.json({
      retentionMonths: ARCHIVE_RETENTION_MONTHS,
      archivedCount,
      dueOnNextRunCount,
      nextCleanupRunAt: nextCleanupRunAt.toISOString(),
      nextCleanupCutoffAt: nextCleanupCutoffAt.toISOString(),
      nextPermanentDeleteRunAt: oldestArchivedAt ? getNextPermanentDeleteRunAt(oldestArchivedAt).toISOString() : null,
      nextEligibleDeleteAt: oldestArchivedAt ? addArchiveRetentionMonths(oldestArchivedAt).toISOString() : null,
    });
  } catch (error) {
    console.error("archive notice error", error);
    return NextResponse.json({ error: "Failed to load archive notice" }, { status: 500 });
  }
}