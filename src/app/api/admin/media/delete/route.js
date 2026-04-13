import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMediaUsageSummary, requireAdminEditor } from "@/lib/admin-media";
import { getStorageBucketName, getStorageClient } from "@/lib/supabase-storage";
import { buildActorSnapshot, safeWriteAuditLog } from "@/lib/audit-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(req) {
  const auth = await requireAdminEditor();
  if (auth.error) {
    return NextResponse.json({ error: auth.error.message }, { status: auth.error.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const storagePath = String(searchParams.get("storagePath") || "").trim();
    const url = String(searchParams.get("url") || "").trim();

    if (!storagePath && !url) {
      return NextResponse.json({ error: "Missing media identifier." }, { status: 400 });
    }

    const media = await prisma.media.findFirst({
      where: {
        OR: [{ storagePath: storagePath || undefined }, { url: url || undefined }],
      },
    });

    const mediaUrl = media?.url || url;
    const usages = mediaUrl ? await getMediaUsageSummary(mediaUrl) : [];

    if (usages.length) {
      return NextResponse.json({ error: "This media is currently used on the website.", usages }, { status: 409 });
    }

    const targetPath = media?.storagePath || storagePath;
    if (!targetPath) {
      return NextResponse.json({ error: "Media file path not found." }, { status: 404 });
    }

    const supabase = getStorageClient();
    const bucket = getStorageBucketName();
    const result = await supabase.storage.from(bucket).remove([targetPath]);
    if (result.error) {
      throw new Error(result.error.message);
    }

    await prisma.media.deleteMany({
      where: {
        OR: [{ storagePath: targetPath }, { url: mediaUrl || undefined }],
      },
    });

    await safeWriteAuditLog(req, {
    category: "media",
    action: "media.delete",
    status: "SUCCESS",
    summary: `${auth.user.name || auth.user.email} deleted media ${media?.name || mediaUrl || targetPath}.`,
    actorSnapshot: buildActorSnapshot(auth.user),
    targetType: "media",
    targetId: media?.id || null,
    targetLabel: media?.name || mediaUrl || targetPath,
    details: { storagePath: targetPath, url: mediaUrl || null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to delete media." }, { status: 500 });
  }
}