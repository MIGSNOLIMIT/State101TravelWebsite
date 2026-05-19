import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { canAccessAdminRoles, withEffectiveAdminRole } from "@/lib/admin-role";
import { withComputedApplicationAge } from "@/lib/application-age";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const me = withEffectiveAdminRole(await prisma.user.findUnique({ where: { id: session.userId } }));
    if (!me || !canAccessAdminRoles(me, ["admin"])) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const items = await prisma.applicationEntry.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { files: true } } },
    });

    return NextResponse.json(items.map((item) => withComputedApplicationAge(item)));
  } catch (err) {
    console.error("application list error", err);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}
