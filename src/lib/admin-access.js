import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function requireAdminRoles(allowedRoles = ["admin", "editor"]) {
	const session = await getAdminSession();
	if (!session) {
		return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
	}

	const user = await prisma.user.findUnique({
		where: { id: session.userId },
		select: { id: true, name: true, email: true, role: true },
	});

	if (!user || !allowedRoles.includes(user.role)) {
		return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
	}

	return { session, user };
}