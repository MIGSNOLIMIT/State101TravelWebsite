import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { visitorId, path } = await req.json();

    const normalizedPath = String(path || "").trim();
    const normalizedVisitorId = String(visitorId || "").trim();

    if (!normalizedVisitorId || !normalizedPath) {
      return NextResponse.json({ error: "Missing tracking payload" }, { status: 400 });
    }

    if (normalizedPath.startsWith("/admin") || normalizedPath === "/access-denied") {
      return NextResponse.json({ success: true });
    }

    await prisma.websiteView.create({
      data: {
        visitorId: normalizedVisitorId.slice(0, 100),
        path: normalizedPath.slice(0, 255),
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Tracking failed" }, { status: 500 });
  }
}