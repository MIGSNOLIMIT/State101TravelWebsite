import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { canAccessAdminRoles, withEffectiveAdminRole } from "@/lib/admin-role";

export const dynamic = "force-dynamic";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const TRACKED_PAGE_LABELS = {
  "/": "Homepage",
  "/home": "Homepage",
  "/services": "Services Tab",
  "/about": "About Us",
  "/tos": "Terms of Service",
};

function normalizeTrackedPath(path) {
  const raw = String(path || "/").trim() || "/";
  const pathname = raw.split("?")[0].split("#")[0] || "/";

  if (pathname === "/home") return "/";
  if (pathname === "/terms-of-service") return "/tos";
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

function getTrackedPageLabel(path) {
  const normalized = normalizeTrackedPath(path);
  return TRACKED_PAGE_LABELS[normalized] || null;
}

function monthBucket(label, month) {
  return {
    label,
    month,
    websiteViews: 0,
    uniqueVisitors: 0,
    applications: 0,
    scheduled: 0,
    pending: 0,
    inReview: 0,
  };
}

export async function GET(req) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const me = withEffectiveAdminRole(await prisma.user.findUnique({ where: { id: session.userId } }));
  if (!me || !canAccessAdminRoles(me, ["admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const currentYear = new Date().getFullYear();
    const requestedYear = Number(searchParams.get("year")) || currentYear;
    const year = Number.isFinite(requestedYear) ? requestedYear : currentYear;

    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);

    const [applications, websiteViews, allApplications, allWebsiteViews] = await Promise.all([
      prisma.applicationEntry.findMany({
        where: { createdAt: { gte: start, lt: end }, archivedAt: null },
        select: { createdAt: true, updatedAt: true, status: true, visaType: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.websiteView.findMany({
        where: { createdAt: { gte: start, lt: end } },
        select: { path: true, visitorId: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.applicationEntry.findMany({ where: { archivedAt: null }, select: { createdAt: true } }),
      prisma.websiteView.findMany({ select: { createdAt: true } }),
    ]);

    const monthly = MONTH_LABELS.map((label, month) => monthBucket(label, month));
    const visitorSets = MONTH_LABELS.map(() => new Set());
    const yearlyVisitorSet = new Set();
    const topPages = new Map();

    for (const view of websiteViews) {
      const month = new Date(view.createdAt).getMonth();
      monthly[month].websiteViews += 1;
      visitorSets[month].add(view.visitorId);
      yearlyVisitorSet.add(view.visitorId);
      const normalizedPath = normalizeTrackedPath(view.path);
      topPages.set(normalizedPath, (topPages.get(normalizedPath) || 0) + 1);
    }

    for (const entry of applications) {
      const createdMonth = new Date(entry.createdAt).getMonth();
      monthly[createdMonth].applications += 1;

      if (entry.status === "IN_REVIEW") {
        monthly[createdMonth].inReview += 1;
      }

      if (entry.status === "SCHEDULED") {
        const scheduledMonth = new Date(entry.updatedAt || entry.createdAt).getMonth();
        monthly[scheduledMonth].scheduled += 1;
      }

      if (entry.status === "PENDING") {
        const pendingMonth = new Date(entry.updatedAt || entry.createdAt).getMonth();
        monthly[pendingMonth].pending += 1;
      }
    }

    monthly.forEach((bucket, index) => {
      bucket.uniqueVisitors = visitorSets[index].size;
      bucket.scheduledRate = bucket.applications ? Math.round((bucket.scheduled / bucket.applications) * 100) : 0;
    });

    const activeMonthIndex = [...monthly]
      .reverse()
      .findIndex((bucket) => bucket.websiteViews || bucket.applications || bucket.scheduled || bucket.pending || bucket.inReview);
    const thisMonth = new Date().getFullYear() === year ? new Date().getMonth() : -1;
    const selectedMonth = thisMonth >= 0
      ? monthly[thisMonth]
      : activeMonthIndex >= 0
        ? monthly[monthly.length - 1 - activeMonthIndex]
        : monthly[monthly.length - 1];

    const allYears = [...allApplications, ...allWebsiteViews]
      .map((item) => new Date(item.createdAt).getFullYear())
      .filter((value) => Number.isFinite(value));

    const availableYears = Array.from(new Set([year, currentYear, ...allYears])).sort((a, b) => b - a);

    return NextResponse.json({
      year,
      availableYears,
      monthly,
      summary: {
        websiteViews: monthly.reduce((sum, bucket) => sum + bucket.websiteViews, 0),
        uniqueVisitors: yearlyVisitorSet.size,
        applications: monthly.reduce((sum, bucket) => sum + bucket.applications, 0),
        scheduled: monthly.reduce((sum, bucket) => sum + bucket.scheduled, 0),
        pending: monthly.reduce((sum, bucket) => sum + bucket.pending, 0),
        inReview: monthly.reduce((sum, bucket) => sum + bucket.inReview, 0),
      },
      currentMonth: selectedMonth,
      topPages: [...topPages.entries()]
        .map(([path, views]) => ({ path, views, label: getTrackedPageLabel(path) }))
        .filter((page) => Boolean(page.label))
        .sort((a, b) => b.views - a.views)
        .slice(0, 6),
      funnel: {
        new: monthly.reduce((sum, bucket) => sum + bucket.applications, 0),
        inReview: monthly.reduce((sum, bucket) => sum + bucket.inReview, 0),
        scheduled: monthly.reduce((sum, bucket) => sum + bucket.scheduled, 0),
        pending: monthly.reduce((sum, bucket) => sum + bucket.pending, 0),
      },
    });
  } catch (error) {
    console.error("monthly reports error", error);
    return NextResponse.json({ error: "Failed to load reports" }, { status: 500 });
  }
}
