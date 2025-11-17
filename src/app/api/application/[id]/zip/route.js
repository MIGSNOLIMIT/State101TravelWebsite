import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import JSZip from "jszip";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

function sanitizeName(name) {
  return String(name || "").trim().replace(/[^a-zA-Z0-9._\- ]+/g, "_").replace(/\s+/g, " ");
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function GET(_req, { params }) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const me = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!me || !["admin", "editor"].includes(me.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const id = params?.id;
    const entry = await prisma.applicationEntry.findUnique({ where: { id }, include: { files: true } });
    if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const fullName = sanitizeName(entry.fullName || "Applicant");
    const dateStr = todayISO();
    const base = `${fullName} ${dateStr}`.trim();
    const zip = new JSZip();
    const folder = zip.folder(base);

    const infoLines = [
      `Full Name: ${entry.fullName}`,
      `Email: ${entry.email}`,
      `Phone: ${entry.phone}`,
      `Address: ${entry.address}`,
      `Visa Type: ${entry.visaType}`,
      `Age: ${entry.age}`,
      `Available Time: ${entry.availableTime}`,
      `Available Day: ${entry.availableDay}`,
      `Status: ${entry.status}`,
      `Submitted At: ${entry.createdAt?.toISOString?.() || String(entry.createdAt)}`,
      `Entry ID: ${entry.id}`,
    ].join("\n");
    folder.file("application.txt", infoLines);
    for (const f of entry.files || []) {
      if (!f.fileUrl) continue;
      try {
        const res = await fetch(f.fileUrl);
        if (!res.ok) continue;
        const ab = await res.arrayBuffer();
        const name = filenameFromUrl(f.fileUrl);
        folder.file(name, ab);
      } catch {}
    }

    const buf = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${base}.zip"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("zip error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
