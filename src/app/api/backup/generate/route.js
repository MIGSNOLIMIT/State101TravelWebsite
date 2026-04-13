import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import JSZip from "jszip";
import { buildActorSnapshot, safeWriteAuditLog } from "@/lib/audit-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function todayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { start, end };
}

function filenameFromUrl(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || "file";
  } catch {
    const parts = String(url).split("/").filter(Boolean);
    return parts[parts.length - 1] || "file";
  }
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function GET(req) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const me = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!me || !["admin", "editor"].includes(me.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") || "full";

    let where = {};
    if (mode === "today") {
      const { start, end } = todayRange();
      where = { createdAt: { gte: start, lte: end } };
    }

    const entries = await prisma.applicationEntry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { files: true },
    });

    await safeWriteAuditLog(req, {
    category: "backup",
    action: "backup.export",
    status: "SUCCESS",
    summary: `${me.name || me.email} exported an applications backup ZIP.`,
    actorSnapshot: buildActorSnapshot(me),
    targetType: "backup",
    targetLabel: mode === "today" ? "Today Backup ZIP" : "Full Backup ZIP",
    details: { mode, applicationsCount: entries.length },
    });

    const zip = new JSZip();
    zip.file("entries.json", Buffer.from(JSON.stringify(entries, null, 2)));

    for (const entry of entries) {
      const baseFolder = zip.folder(`files/${entry.id}`);
      for (const f of entry.files) {
        if (!f.fileUrl) continue;
        try {
          const res = await fetch(f.fileUrl);
          if (!res.ok) continue;
          const ab = await res.arrayBuffer();
          baseFolder.file(filenameFromUrl(f.fileUrl), ab);
        } catch {}
      }
    }

    const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
    const dateStr = todayISO();
    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="Backup(${dateStr}).zip"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("backup generate error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
