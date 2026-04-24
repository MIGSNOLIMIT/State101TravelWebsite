import { createClient } from "@supabase/supabase-js";

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env ${name}`);
  }
  return value;
}

export function getApplicationStorageBucket() {
  return requiredEnv("SUPABASE_APPLICATION_BUCKET");
}

function getApplicationStorageClient() {
  return createClient(requiredEnv("NEXT_PUBLIC_SUPABASE_URL"), requiredEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false },
  });
}

export function sanitizeApplicationFilename(name = "file") {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function extractApplicationStoragePath(fileUrl, expectedBucket = getApplicationStorageBucket()) {
  if (!fileUrl) return null;

  if (fileUrl.startsWith("supabase://")) {
    const suffix = fileUrl.slice("supabase://".length);
    const [bucket, ...pathParts] = suffix.split("/");
    if (bucket !== expectedBucket) return null;
    return pathParts.join("/");
  }

  try {
    const url = new URL(fileUrl);
    const publicPath = url.pathname.split("/object/public/")[1] || "";
    const [bucket, ...pathParts] = publicPath.split("/");
    if (bucket !== expectedBucket) return null;
    return pathParts.join("/");
  } catch {
    return null;
  }
}

export async function uploadApplicationFile({ file, applicationId, prefix = "applications" }) {
  const arrayBuffer = await file.arrayBuffer();
  const body = Buffer.from(arrayBuffer);
  const bucket = getApplicationStorageBucket();
  const safeName = sanitizeApplicationFilename(file.name || "upload.bin");
  const path = `${prefix}/${applicationId}/${Date.now()}_${safeName}`;
  const supabase = getApplicationStorageClient();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, body, { contentType: file.type || "application/octet-stream", upsert: false });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return {
    path,
    url: data?.publicUrl || `supabase://${bucket}/${path}`,
  };
}

export async function removeApplicationFiles(fileUrls = []) {
  const bucket = getApplicationStorageBucket();
  const paths = Array.from(
    new Set(
      fileUrls
        .map((fileUrl) => extractApplicationStoragePath(fileUrl, bucket))
        .filter(Boolean)
    )
  );

  if (paths.length === 0) {
    return [];
  }

  const supabase = getApplicationStorageClient();
  const result = await supabase.storage.from(bucket).remove(paths);
  if (result.error) {
    throw result.error;
  }

  return paths;
}