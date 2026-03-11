import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export async function GET(_req, { params }) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const me = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!me || !["admin", "editor"].includes(me.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const id = params?.id;
    const file = await prisma.applicationFile.findUnique({ where: { id } });
    if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const url = file.fileUrl;
    if (!url) return NextResponse.json({ error: "No URL" }, { status: 404 });

    // Try to create a signed URL when file is in Supabase Storage
    const m = url.match(/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    if (m) {
      try {
        const bucket = m[1];
        const path = m[2];
        const sb = createClient(requiredEnv("NEXT_PUBLIC_SUPABASE_URL"), requiredEnv("SUPABASE_SERVICE_ROLE_KEY"), {
          auth: { persistSession: false },
        });
        const { data, error } = await sb.storage.from(bucket).createSignedUrl(path, 60 * 5);
        if (!error && data?.signedUrl) {
          return NextResponse.redirect(data.signedUrl);
        }
      } catch (e) {
        // Fallback to raw URL
      }
    }

    // Default: redirect to stored public URL
    return NextResponse.redirect(url);
  } catch (e) {
    console.error("signed file error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
