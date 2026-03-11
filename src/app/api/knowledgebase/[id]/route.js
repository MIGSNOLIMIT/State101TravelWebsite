import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const me = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!me || me.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const id = params?.id;
    const body = await req.json();
    const data = {};
    ["title","category","content"].forEach((k) => { if (body[k] !== undefined) data[k] = body[k]; });
    if (!Object.keys(data).length) return NextResponse.json({ error: "No fields" }, { status: 400 });
    const updated = await prisma.knowledgebaseItem.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("knowledgebase update error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const me = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!me || me.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const id = params?.id;
    await prisma.knowledgebaseItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("knowledgebase delete error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
