import { NextResponse } from "next/server";
import { hydrateMediaRecords, listAllMediaFiles, requireAdminEditor, syncMediaRecords } from "@/lib/admin-media";
import { getMediaKind, MEDIA_PAGE_SIZE } from "@/lib/media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const auth = await requireAdminEditor();
  if (auth.error) {
    return NextResponse.json({ error: auth.error.message }, { status: auth.error.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = String(searchParams.get("q") || "").trim().toLowerCase();
    const type = String(searchParams.get("type") || "all").toLowerCase();
    const selectedUrls = String(searchParams.get("selected") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const cursor = Math.max(0, Number(searchParams.get("cursor") || "0") || 0);
    const pageSize = Math.min(60, Math.max(1, Number(searchParams.get("pageSize") || MEDIA_PAGE_SIZE) || MEDIA_PAGE_SIZE));

    const allFiles = await listAllMediaFiles();

    let filtered = allFiles.filter((item) => {
      const kind = getMediaKind(item.type);
      const matchesType = type === "all" || type === "recent" || (type === "selected" ? selectedUrls.includes(item.url) : kind === type);
      const matchesSearch = !search || [item.name, item.folder, item.altText].some((field) => String(field || "").toLowerCase().includes(search));
      const matchesSelected = type !== "selected" || selectedUrls.includes(item.url);
      return matchesType && matchesSearch && matchesSelected;
    });

    filtered = filtered.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

    const page = filtered.slice(cursor, cursor + pageSize);
    await syncMediaRecords(page);
    const items = await hydrateMediaRecords(page);
    const nextCursor = cursor + pageSize < filtered.length ? String(cursor + pageSize) : null;

    return NextResponse.json({
      items,
      nextCursor,
      total: filtered.length,
      pageSize,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Failed to load media" }, { status: 500 });
  }
}