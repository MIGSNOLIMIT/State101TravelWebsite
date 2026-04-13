import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { buildActorSnapshot, safeWriteAuditLog } from "@/lib/audit-log";
import {
	createApplicationEntry,
	findDuplicateApplication,
	normalizeApplicationFields,
	validateApplicationFields,
} from "@/lib/application-submission";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req) {
	try {
		const session = await getAdminSession();
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const me = await prisma.user.findUnique({ where: { id: session.userId } });
		if (!me || me.role !== "admin") {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const body = await req.json();
		const fields = normalizeApplicationFields(body);
		const validationError = validateApplicationFields(fields);
		if (validationError) {
			return NextResponse.json({ error: validationError }, { status: 400 });
		}

		const existing = await findDuplicateApplication(fields);
		if (existing) {
			return NextResponse.json(
				{ error: "An application already exists for this email or phone number.", existing },
				{ status: 409 }
			);
		}

		const created = await createApplicationEntry(fields);
		await safeWriteAuditLog(req, {
			category: "applications",
			action: "applications.create",
			status: "SUCCESS",
			summary: `${me.name || me.email} created a walk-in application for ${created.fullName}.`,
			actorSnapshot: buildActorSnapshot(me),
			targetType: "application",
			targetId: created.id,
			targetLabel: created.fullName,
			details: {
				email: created.email,
				visaType: created.visaType,
				status: created.status,
			},
		});
		return NextResponse.json(created, { status: 201 });
	} catch (error) {
		console.error("admin create application error", error);
		return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
	}
}