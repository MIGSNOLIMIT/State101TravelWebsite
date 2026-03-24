import { NextResponse } from "next/server";
import { requireAdminEditor } from "@/lib/admin-media";
import { createStoragePath, inferAltText, normalizeFolderInput, validateFileDescriptor } from "@/lib/media";
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
    const files = Array.isArray(body?.files) ? body.files : [];
    const folder = normalizeFolderInput(body?.folder || "general");
    const supabase = getStorageClient();
    const bucket = getStorageBucketName();

    if (!files.length) {
      return NextResponse.json({ error: "No files provided." }, { status: 400 });
    }

    const uploads = [];
    for (const file of files) {
      const error = validateFileDescriptor(file);
      if (error) {
        return NextResponse.json({ error: `${file.name}: ${error}` }, { status: 400 });
      }

      const storagePath = createStoragePath(folder, file.name);
      const signed = await supabase.storage.from(bucket).createSignedUploadUrl(storagePath);
      if (signed.error) {
        throw new Error(signed.error.message);
      }

      uploads.push({
        name: file.name,
        type: file.type,
        size: file.size,
        width: file.width ?? null,
        height: file.height ?? null,
        altText: file.altText || inferAltText(file.name),
        folder,
        storagePath,
        token: signed.data.token,
      });
    }

    return NextResponse.json({ uploads });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to prepare upload." }, { status: 500 });
  }
}