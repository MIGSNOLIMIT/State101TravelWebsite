import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import { buildActorSnapshot, safeWriteAuditLog } from "@/lib/audit-log";

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

function extractPathFromPublicUrl(url, expectedBucket) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/object/public/")[1]?.split("/") || [];
    const bucket = parts.shift();
    const path = parts.join("/");
    if (!bucket || bucket !== expectedBucket) return null;
    return path;
  } catch {
    return null;
  }
}

export async function DELETE(req) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const me = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!me || me.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const file = await prisma.applicationFile.findUnique({ where: { id } });
    if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });
		const application = await prisma.applicationEntry.findUnique({ where: { id: file.applicationId }, select: { fullName: true } });

    // Try delete from Supabase Storage
    try {
      const bucket = requiredEnv("SUPABASE_APPLICATION_BUCKET");
      const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
      const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
      const path = extractPathFromPublicUrl(file.fileUrl, bucket);
      if (path) {
        const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
        await supabase.storage.from(bucket).remove([path]);
      }
    } catch (err) {
      console.warn("storage remove failed", err?.message || err);
    }

    await prisma.applicationFile.delete({ where: { id } });
    await safeWriteAuditLog(req, {
      category: "applications",
      action: "applications.file.delete",
      status: "SUCCESS",
      summary: `${me.name || me.email} deleted an uploaded file from ${application?.fullName || file.applicationId}.`,
      actorSnapshot: buildActorSnapshot(me),
      targetType: "application-file",
      targetId: file.id,
      targetLabel: application?.fullName || file.applicationId,
      details: { fileType: file.fileType, fileUrl: file.fileUrl },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("file delete error", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
