import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await prisma.knowledgebaseItem.findMany({ orderBy: { updatedAt: "desc" } });
    return NextResponse.json(items);
  } catch (e) {
    console.error("knowledgebase list error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const me = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!me || me.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await req.json();
    const { title, category, content } = body;
    if (!title || !category || !content) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const created = await prisma.knowledgebaseItem.create({ data: { title, category, content } });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error("knowledgebase create error", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
