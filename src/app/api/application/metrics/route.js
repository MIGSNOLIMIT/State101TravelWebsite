import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const me = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!me || !["admin", "editor"].includes(me.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const items = await prisma.applicationEntry.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        status: true,
      },
    });

    return NextResponse.json(items);
  } catch (err) {
    console.error("application metrics error", err);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}