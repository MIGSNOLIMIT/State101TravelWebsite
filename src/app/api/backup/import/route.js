import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import JSZip from "jszip";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return { header: [], rows: [] };
  const header = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((l) => l.split(","));
  return { header, rows };
}

export async function POST(req) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const me = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!me || me.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const form = await req.formData();
    const file = form.get("file") || form.get("backup");
    if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Prefer JSON manifest if present; fallback to CSV
    const jsonFile = zip.file("entries.json");
    if (jsonFile) {
      const entries = JSON.parse(await jsonFile.async("string"));

      const bucket = requiredEnv("SUPABASE_APPLICATION_BUCKET");
      const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
      const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
      const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

      const idMap = new Map();
      let entriesCreated = 0;
      let entriesMatched = 0;
      let filesUploaded = 0;

      // Helper to find an existing entry (no duplicate mode)
      async function findExistingEntry(e) {
        // 1) Exact id
        if (e.id) {
          const byId = await prisma.applicationEntry.findUnique({ where: { id: e.id } });
          if (byId) return byId;
        }
        // 2) Heuristic: same email + fullName within +/- 1 day of createdAt
        if (e.email && e.fullName && e.createdAt) {
          const createdAt = new Date(e.createdAt);
          const dayBefore = new Date(createdAt.getTime() - 24 * 60 * 60 * 1000);
          const dayAfter = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
          const match = await prisma.applicationEntry.findFirst({
            where: {
              email: e.email,
              fullName: e.fullName,
              createdAt: { gte: dayBefore, lte: dayAfter },
            },
            orderBy: { createdAt: "asc" },
          });
          if (match) return match;
        }
        return null;
      }

      // Map each backup entry to an existing or newly created ApplicationEntry
      for (const e of entries) {
        const existing = await findExistingEntry(e);
        if (existing) {
          idMap.set(e.id, existing.id);
          entriesMatched++;
          continue;
        }
        const created = await prisma.applicationEntry.create({
          data: {
            fullName: e.fullName,
            email: e.email,
            phone: e.phone,
            address: e.address,
            visaType: e.visaType,
            age: e.age || 0,
            availableTime: e.availableTime,
            availableDay: e.availableDay,
            status: e.status || "NEW",
            createdAt: e.createdAt ? new Date(e.createdAt) : undefined,
          },
        });
        idMap.set(e.id, created.id);
        entriesCreated++;
      }

      // Build filename sets for each target entry to avoid duplicate files
      const existingFilesByEntry = new Map();
      for (const [oldId, newId] of idMap.entries()) {
        const files = await prisma.applicationFile.findMany({ where: { applicationId: newId } });
        const names = new Set(
          files
            .map((f) => {
              try {
                const u = new URL(f.fileUrl);
                return u.pathname.split("/").pop();
              } catch {
                const parts = String(f.fileUrl || "").split("/");
                return parts[parts.length - 1] || null;
              }
            })
            .filter(Boolean)
        );
        existingFilesByEntry.set(newId, names);
      }

      // Upload only missing files (by filename) per entry
      const allFiles = Object.values(zip.files).filter((zf) => zf.name.startsWith("files/") && !zf.dir);
      for (const zf of allFiles) {
        const parts = zf.name.split("/").filter(Boolean); // files/<oldId>/<filename>
        if (parts.length < 3) continue;
        const oldId = parts[1];
        const newId = idMap.get(oldId);
        if (!newId) continue;
        const filename = parts.slice(2).join("/");

        const existingNames = existingFilesByEntry.get(newId) || new Set();
        if (existingNames.has(filename)) continue; // skip duplicate filename

        const data = await zf.async("nodebuffer");
        const path = `applications/${newId}/${filename}`;
        const { error } = await supabase.storage.from(bucket).upload(path, data, { upsert: false });
        if (!error) {
          const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
          await prisma.applicationFile.create({
            data: {
              applicationId: newId,
              fileUrl: pub?.publicUrl || `supabase://${bucket}/${path}`,
              fileType: "application/octet-stream",
            },
          });
          existingNames.add(filename);
          existingFilesByEntry.set(newId, existingNames);
          filesUploaded++;
        }
      }

      return NextResponse.json({ success: true, entriesCreated, entriesMatched, filesUploaded });
    }

    const entriesCsvFile = zip.file("entries.csv");
    if (!entriesCsvFile) return NextResponse.json({ error: "entries.csv not found" }, { status: 400 });
    const entriesCsv = await entriesCsvFile.async("string");
    const { header, rows } = parseCsv(entriesCsv);
    const idx = (name) => header.indexOf(name);

    const bucket = requiredEnv("SUPABASE_APPLICATION_BUCKET");
    const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
    const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    let entriesCreated = 0;
    let filesUploaded = 0;

    for (const row of rows) {
      const rowId = row[idx("id")] || "";
      const data = {
        fullName: row[idx("fullName")] || "",
        email: row[idx("email")] || "",
        phone: row[idx("phone")] || "",
        address: row[idx("address")] || "",
        visaType: row[idx("visaType")] || "",
        age: parseInt(row[idx("age")] || "0", 10) || 0,
        availableTime: row[idx("availableTime")] || "",
        availableDay: row[idx("availableDay")] || "",
        status: row[idx("status")] || "NEW",
      };

      const created = await prisma.applicationEntry.create({ data });
      entriesCreated += 1;

      // import files in /files/<entryId>/
      const folder = zip.folder(`files/${rowId}`) || zip.folder(`files/${created.id}`);
      if (folder) {
        const files = Object.values(folder.files || {});
        for (const zf of files) {
          if (zf.dir) continue;
          const fileBuffer = await zf.async("nodebuffer");
          const path = `applications/${created.id}/${zf.name.split("/").pop()}`;
          const { error } = await supabase.storage
            .from(bucket)
            .upload(path, fileBuffer, { upsert: false });
          if (!error) {
            const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
            await prisma.applicationFile.create({
              data: {
                applicationId: created.id,
                fileUrl: pub?.publicUrl || `supabase://${bucket}/${path}`,
                fileType: "application/octet-stream",
              },
            });
            filesUploaded += 1;
          }
        }
      }
    }

    return NextResponse.json({ success: true, entriesCreated, filesUploaded });
  } catch (err) {
    console.error("backup import error", err);
    return NextResponse.json({ success: false, error: "Import failed" }, { status: 500 });
  }
}
