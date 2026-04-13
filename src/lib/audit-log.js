import { prisma } from "@/lib/prisma";

function getClientIp(request) {
	if (!request?.headers) return null;
	const forwardedFor = request.headers.get("x-forwarded-for");
	if (forwardedFor) {
		return forwardedFor.split(",")[0].trim();
	}
	return request.headers.get("x-real-ip") || null;
}

function normalizeSnapshot(actorSnapshot = {}) {
	return {
		actorUserId: actorSnapshot.userId ?? null,
		actorName: actorSnapshot.name ?? null,
		actorEmail: actorSnapshot.email ?? null,
		actorRole: actorSnapshot.role ?? null,
	};
}

export async function writeAuditLog(request, event) {
	const actor = normalizeSnapshot(event.actorSnapshot);
	return prisma.auditLog.create({
		data: {
			...actor,
			category: event.category,
			action: event.action,
			status: event.status || "SUCCESS",
			summary: event.summary,
			targetType: event.targetType || null,
			targetId: event.targetId ? String(event.targetId) : null,
			targetLabel: event.targetLabel || null,
			details: event.details || null,
			ipAddress: getClientIp(request),
			userAgent: request?.headers?.get("user-agent") || null,
		},
	});
}

export async function safeWriteAuditLog(request, event) {
	try {
		await writeAuditLog(request, event);
	} catch (error) {
		console.error("audit log write failed", error);
	}
}

export function buildActorSnapshot(user) {
	if (!user) {
		return null;
	}

	return {
		userId: user.id,
		name: user.name || null,
		email: user.email || null,
		role: user.role || null,
	};
}