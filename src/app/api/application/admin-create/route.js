import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { canAccessAdminRoles, withEffectiveAdminRole } from "@/lib/admin-role";
import { buildActorSnapshot, safeWriteAuditLog } from "@/lib/audit-log";
import { uploadApplicationFile } from "@/lib/application-storage";
import { validateApplicationUploadFile } from "@/lib/application-files";
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

		const me = withEffectiveAdminRole(await prisma.user.findUnique({ where: { id: session.userId } }));
		if (!me || !canAccessAdminRoles(me, ["admin"])) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const contentType = req.headers.get("content-type") || "";
		let input = {};
		let files = [];

		if (contentType.startsWith("multipart/form-data")) {
			const form = await req.formData();
			input = {
				fullName: String(form.get("fullName") || "").trim(),
				email: String(form.get("email") || "").trim(),
				phone: String(form.get("phone") || "").trim(),
				address: String(form.get("address") || "").trim(),
				visaType: String(form.get("visaType") || "").trim(),
				birthdate: String(form.get("birthdate") || "").trim(),
				availableTime: String(form.get("availableTime") || "").trim(),
				availableDay: String(form.get("availableDay") || "").trim(),
			};
			files = form
				.getAll("files")
				.filter((file) => file && typeof file.arrayBuffer === "function" && typeof file.size === "number" && file.size > 0);
		} else {
			input = await req.json();
		}

		const fields = normalizeApplicationFields(input);
		const validationError = validateApplicationFields(fields);
		if (validationError) {
			return NextResponse.json({ error: validationError }, { status: 400 });
		}

		for (const file of files) {
			const fileError = validateApplicationUploadFile(file);
			if (fileError) {
				return NextResponse.json({ error: `${file.name}: ${fileError}` }, { status: 400 });
			}
		}

		const existing = await findDuplicateApplication(fields);
		if (existing) {
			return NextResponse.json(
				{ error: "An application already exists for this email or phone number.", existing },
				{ status: 409 }
			);
		}

		const created = await createApplicationEntry(fields);
		if (files.length > 0) {
			for (const file of files) {
				const { url } = await uploadApplicationFile({ file, applicationId: created.id });
				await prisma.applicationFile.create({
					data: {
						applicationId: created.id,
						fileUrl: url,
						fileType: file.type || "application/octet-stream",
					},
				});
			}
		}

		const createdWithCounts = await prisma.applicationEntry.findUnique({
			where: { id: created.id },
			include: {
				_count: {
					select: {
						files: true,
					},
				},
			},
		});

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
				filesUploaded: files.length,
			},
		});
		return NextResponse.json(createdWithCounts || created, { status: 201 });
	} catch (error) {
		console.error("admin create application error", error);
		return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
	}
}
