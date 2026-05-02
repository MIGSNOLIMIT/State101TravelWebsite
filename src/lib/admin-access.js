import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { canAccessAdminRoles, withEffectiveAdminRole } from "@/lib/admin-role";

export async function requireAdminRoles(allowedRoles = ["admin", "editor"]) {
	const session = await getAdminSession();
	if (!session) {
		return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
	}

	const user = await prisma.user.findUnique({
		where: { id: session.userId },
		select: { id: true, name: true, email: true, role: true },
	});
	const effectiveUser = withEffectiveAdminRole(user);

	if (!effectiveUser || !canAccessAdminRoles(effectiveUser, allowedRoles)) {
		return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
	}

	return { session, user: effectiveUser };
}
