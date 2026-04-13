import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminEditor } from "@/lib/admin-media";
import { buildActorSnapshot, safeWriteAuditLog } from "@/lib/audit-log";
import {
  createPublicMediaUrl,
  inferAltText,
  inferMediaTypeFromName,
  validateFileAgainstAccept,
  validateFileDescriptor,
} from "@/lib/media";
import { getStorageBucketName, getStorageClient } from "@/lib/supabase-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const auth = await requireAdminEditor();
  if (auth.error) {
    return NextResponse.json({ error: auth.error.message }, { status: auth.error.status });
  }

  try {
    const body = await req.json();
    const uploads = Array.isArray(body?.uploads) ? body.uploads : [];
    const supabase = getStorageClient();
    const bucket = getStorageBucketName();

    if (!uploads.length) {
      return NextResponse.json({ error: "No uploads provided." }, { status: 400 });
    }

    const items = [];
    for (const upload of uploads) {
      const acceptError = validateFileAgainstAccept(upload, upload.accept || "");
      if (acceptError) {
        return NextResponse.json({ error: `${upload.name}: ${acceptError}` }, { status: 400 });
      }

      const validationError = validateFileDescriptor(upload);
      if (validationError) {
        return NextResponse.json({ error: `${upload.name}: ${validationError}` }, { status: 400 });
      }

      const url = createPublicMediaUrl(supabase, bucket, upload.storagePath);
      const record = await prisma.media.upsert({
        where: { url },
        update: {
          name: upload.name,
          description: upload.altText || inferAltText(upload.name),
          altText: upload.altText || inferAltText(upload.name),
          storagePath: upload.storagePath,
          folder: upload.folder,
          type: upload.type || inferMediaTypeFromName(upload.name),
          width: upload.width ?? null,
          height: upload.height ?? null,
        },
        create: {
          name: upload.name,
          description: upload.altText || inferAltText(upload.name),
          altText: upload.altText || inferAltText(upload.name),
          url,
          storagePath: upload.storagePath,
          folder: upload.folder,
          type: upload.type || inferMediaTypeFromName(upload.name),
          width: upload.width ?? null,
          height: upload.height ?? null,
        },
      });

      items.push({
        id: record.id,
        name: record.name,
        description: record.description,
        altText: record.altText,
        url: record.url,
        storagePath: record.storagePath,
        folder: record.folder,
        type: record.type,
        width: record.width,
        height: record.height,
        createdAt: record.createdAt,
      });
    }

    await safeWriteAuditLog(req, {
    category: "media",
    action: "media.upload",
    status: "SUCCESS",
    summary: `${auth.user.name || auth.user.email} uploaded ${items.length} media file${items.length === 1 ? '' : 's'}.`,
    actorSnapshot: buildActorSnapshot(auth.user),
    targetType: "media",
    targetLabel: items.length === 1 ? items[0].name : `${items.length} media files`,
    details: { count: items.length, items: items.map((item) => ({ name: item.name, folder: item.folder, type: item.type })) },
    });

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to finalize upload." }, { status: 500 });
  }
}