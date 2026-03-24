import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthBucket(label, month) {
  return {
    label,
    month,
    websiteViews: 0,
    uniqueVisitors: 0,
    applications: 0,
    approved: 0,
    declined: 0,
    inReview: 0,
  };
}

export async function GET(req) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const me = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!me || me.role !== "admin") {
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
        where: { createdAt: { gte: start, lt: end } },
        select: { createdAt: true, updatedAt: true, status: true, visaType: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.websiteView.findMany({
        where: { createdAt: { gte: start, lt: end } },
        select: { path: true, visitorId: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.applicationEntry.findMany({ select: { createdAt: true } }),
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
      topPages.set(view.path, (topPages.get(view.path) || 0) + 1);
    }

    for (const entry of applications) {
      const createdMonth = new Date(entry.createdAt).getMonth();
      monthly[createdMonth].applications += 1;

      if (entry.status === "IN_REVIEW") {
        monthly[createdMonth].inReview += 1;
      }

      if (entry.status === "APPROVED") {
        const approvedMonth = new Date(entry.updatedAt || entry.createdAt).getMonth();
        monthly[approvedMonth].approved += 1;
      }

      if (entry.status === "DECLINED") {
        const declinedMonth = new Date(entry.updatedAt || entry.createdAt).getMonth();
        monthly[declinedMonth].declined += 1;
      }
    }

    monthly.forEach((bucket, index) => {
      bucket.uniqueVisitors = visitorSets[index].size;
      bucket.approvalRate = bucket.applications ? Math.round((bucket.approved / bucket.applications) * 100) : 0;
    });

    const activeMonthIndex = [...monthly]
      .reverse()
      .findIndex((bucket) => bucket.websiteViews || bucket.applications || bucket.approved || bucket.declined || bucket.inReview);
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
        approved: monthly.reduce((sum, bucket) => sum + bucket.approved, 0),
        declined: monthly.reduce((sum, bucket) => sum + bucket.declined, 0),
        inReview: monthly.reduce((sum, bucket) => sum + bucket.inReview, 0),
      },
      currentMonth: selectedMonth,
      topPages: [...topPages.entries()]
        .map(([path, views]) => ({ path, views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 6),
      funnel: {
        new: monthly.reduce((sum, bucket) => sum + bucket.applications, 0),
        inReview: monthly.reduce((sum, bucket) => sum + bucket.inReview, 0),
        approved: monthly.reduce((sum, bucket) => sum + bucket.approved, 0),
        declined: monthly.reduce((sum, bucket) => sum + bucket.declined, 0),
      },
    });
  } catch (error) {
    console.error("monthly reports error", error);
    return NextResponse.json({ error: "Failed to load reports" }, { status: 500 });
  }
}