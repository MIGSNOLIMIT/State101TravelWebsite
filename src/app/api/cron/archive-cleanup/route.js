import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { removeApplicationFiles } from "@/lib/application-storage";
import { ARCHIVE_RETENTION_MONTHS, getArchiveCleanupCutoff } from "@/lib/archive-retention";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cutoff = getArchiveCleanupCutoff(new Date());

    const archivedEntries = await prisma.applicationEntry.findMany({
      where: { archivedAt: { lte: cutoff } },
      select: {
        id: true,
        files: {
          select: {
            fileUrl: true,
          },
        },
      },
    });

    if (archivedEntries.length === 0) {
      return NextResponse.json({ success: true, deletedApplications: 0, deletedFiles: 0 });
    }

    const fileUrls = archivedEntries.flatMap((entry) => entry.files.map((file) => file.fileUrl));
    let deletedFiles = 0;

    try {
      const removedPaths = await removeApplicationFiles(fileUrls);
      deletedFiles = removedPaths.length;
    } catch (error) {
      console.warn("archive cleanup storage removal failed", error?.message || error);
    }

    const deletedApplications = await prisma.applicationEntry.deleteMany({
      where: {
        id: {
          in: archivedEntries.map((entry) => entry.id),
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        actorName: "Vercel Cron",
        actorRole: "system",
        category: "applications",
        action: "applications.archive.cleanup",
        status: "SUCCESS",
        summary: `System deleted ${deletedApplications.count} archived applications older than ${ARCHIVE_RETENTION_MONTHS} months.`,
        targetType: "application",
        details: {
          cutoff: cutoff.toISOString(),
          deletedApplications: deletedApplications.count,
          deletedFiles,
          retentionMonths: ARCHIVE_RETENTION_MONTHS,
        },
      },
    });

    return NextResponse.json({ success: true, deletedApplications: deletedApplications.count, deletedFiles });
  } catch (error) {
    console.error("archive cleanup failed", error);
    return NextResponse.json({ error: "Archive cleanup failed" }, { status: 500 });
  }
}