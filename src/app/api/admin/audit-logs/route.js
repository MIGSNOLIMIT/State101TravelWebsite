import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminRoles } from "@/lib/admin-access";

function parseLocalDateRange(dateValue, tzOffsetMinutes = 0) {
	if (!dateValue || !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
		return null;
	}

	const [year, month, day] = dateValue.split("-").map((value) => Number.parseInt(value, 10));
	const startUtcMs = Date.UTC(year, month - 1, day) + tzOffsetMinutes * 60 * 1000;
	const endUtcMs = startUtcMs + 24 * 60 * 60 * 1000 - 1;

	return {
		gte: new Date(startUtcMs),
		lte: new Date(endUtcMs),
	};
}

function buildCreatedAtFilter({ date, dateFrom, dateTo, tzOffsetMinutes }) {
	if (date) {
		return parseLocalDateRange(date, tzOffsetMinutes);
	}

	const range = {};
	const fromRange = parseLocalDateRange(dateFrom, tzOffsetMinutes);
	const toRange = parseLocalDateRange(dateTo, tzOffsetMinutes);

	if (fromRange?.gte) {
		range.gte = fromRange.gte;
	}

	if (toRange?.lte) {
		range.lte = toRange.lte;
	}

	return Object.keys(range).length ? range : undefined;
}

function buildSearchWhere(search) {
	if (!search) {
		return undefined;
	}

	return {
		OR: [
			{ summary: { contains: search, mode: "insensitive" } },
			{ actorName: { contains: search, mode: "insensitive" } },
			{ actorEmail: { contains: search, mode: "insensitive" } },
			{ action: { contains: search, mode: "insensitive" } },
			{ targetLabel: { contains: search, mode: "insensitive" } },
			{ targetType: { contains: search, mode: "insensitive" } },
		],
	};
}

export async function GET(req) {
	const gate = await requireAdminRoles(["admin"]);
	if (gate.error) return gate.error;

	const { searchParams } = new URL(req.url);
	const search = String(searchParams.get("q") || "").trim();
	const category = String(searchParams.get("category") || "all").trim();
	const action = String(searchParams.get("action") || "all").trim();
	const actorRole = String(searchParams.get("actorRole") || "all").trim();
	const status = String(searchParams.get("status") || "all").trim();
	const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
	const pageSize = Math.min(100, Math.max(10, Number.parseInt(searchParams.get("pageSize") || "20", 10) || 20));
	const skip = (page - 1) * pageSize;
	const date = String(searchParams.get("date") || "").trim();
	const dateFrom = searchParams.get("dateFrom");
	const dateTo = searchParams.get("dateTo");
	const tzOffsetMinutes = Number.parseInt(searchParams.get("tzOffset") || "0", 10) || 0;
	const createdAtFilter = buildCreatedAtFilter({ date, dateFrom, dateTo, tzOffsetMinutes });

	const where = {
		...(category !== "all" ? { category } : {}),
		...(action !== "all" ? { action } : {}),
		...(actorRole !== "all" ? { actorRole } : {}),
		...(status !== "all" ? { status } : {}),
		...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
		...buildSearchWhere(search),
	};

	const [items, total, totalToday, loginCount, failureCount] = await Promise.all([
		prisma.auditLog.findMany({
			where,
			orderBy: { createdAt: "desc" },
			skip,
			take: pageSize,
		}),
		prisma.auditLog.count({ where }),
		prisma.auditLog.count({
			where: {
				createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
			},
		}),
		prisma.auditLog.count({
			where: {
				action: "auth.login",
				status: "SUCCESS",
				createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
			},
		}),
		prisma.auditLog.count({
			where: {
				status: "FAILURE",
				createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
			},
		}),
	]);

	return NextResponse.json({
		items,
		filters: {
			date: date || null,
			dateFrom: dateFrom || null,
			dateTo: dateTo || null,
		},
		pagination: {
			page,
			pageSize,
			total,
			totalPages: Math.max(1, Math.ceil(total / pageSize)),
		},
		summary: {
			totalToday,
			loginCount,
			failureCount,
		},
	});
}