import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import AdminLoginClient from "./AdminLoginClient";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
	const session = await getAdminSession();

	if (session?.userId) {
		const user = await prisma.user.findUnique({
			where: { id: session.userId },
			select: { role: true },
		});

		if (user && ["admin", "editor"].includes(user.role)) {
			redirect("/admin/dashboard");
		}
	}

	return <AdminLoginClient />;
}