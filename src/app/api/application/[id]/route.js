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

function supabaseClient() {
  const url = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

async function requireEditor(reqRoleCheck = (role) => ["admin", "editor"].includes(role)) {
  const session = await getAdminSession();
  if (!session) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const me = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!me || !reqRoleCheck(me.role)) return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { me };
}

export async function GET(_req, { params }) {
  try {
    const gate = await requireEditor();
    if (gate.error) return gate.error;
    const id = params?.id;
    const entry = await prisma.applicationEntry.findUnique({ where: { id }, include: { files: true } });
    if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(entry);
  } catch (e) {
    console.error("application get error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const gate = await requireEditor();
    if (gate.error) return gate.error;
    const id = params?.id;
    const body = await req.json();
    const { status } = body || {};
    if (!status || !["NEW", "IN_REVIEW", "DECLINED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const updated = await prisma.applicationEntry.update({ where: { id }, data: { status } });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("application patch error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    const gate = await requireEditor((role) => role === "admin");
    if (gate.error) return gate.error;
    const id = params?.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const files = await prisma.applicationFile.findMany({ where: { applicationId: id } });

    await prisma.applicationEntry.delete({ where: { id } });

    const bucket = process.env.SUPABASE_APPLICATION_BUCKET;
    if (bucket && files.length) {
      try {
        const sb = supabaseClient();
        const paths = files
          .map((f) => {
            const m = f.fileUrl.match(/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
            return m ? m[1] : null;
          })
          .filter(Boolean);
        if (paths.length) {
          const { error } = await sb.storage.from(bucket).remove(paths);
          if (error) console.warn("Supabase remove error", error);
        }
      } catch (e) {
        console.warn("Storage delete skipped", e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("application delete error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

