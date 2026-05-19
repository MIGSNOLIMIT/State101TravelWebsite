import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import JSZip from "jszip";
import { createClient } from "@supabase/supabase-js";
import { buildActorSnapshot, safeWriteAuditLog } from "@/lib/audit-log";
import { normalizeApplicationStatus } from "@/lib/application-status";
import { birthdateInputToDate, birthdateDateToInputValue, calculateAgeFromBirthdate } from "@/lib/application-age";

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

async function findExistingEntry(entry) {
  if (entry.id) {
    const byId = await prisma.applicationEntry.findUnique({ where: { id: entry.id } });
    if (byId) return byId;
  }

  if (entry.email && entry.fullName && entry.createdAt) {
    const createdAt = new Date(entry.createdAt);
    const dayBefore = new Date(createdAt.getTime() - 24 * 60 * 60 * 1000);
    const dayAfter = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
    const match = await prisma.applicationEntry.findFirst({
      where: {
        email: entry.email,
        fullName: entry.fullName,
        createdAt: { gte: dayBefore, lte: dayAfter },
      },
      orderBy: { createdAt: "asc" },
    });
    if (match) return match;
  }

  return null;
}

function getClearNoChangeMessage(entriesMatched) {
  return entriesMatched > 0
    ? "This backup already exists in the system. No new applications or files were imported."
    : "The backup file did not contain any new application data to import.";
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
            age: e.birthdate ? calculateAgeFromBirthdate(birthdateDateToInputValue(e.birthdate)) : e.age || 0,
            birthdate: e.birthdate ? new Date(e.birthdate) : null,
            availableTime: e.availableTime,
            availableDay: e.availableDay,
            status: normalizeApplicationStatus(e.status),
            scheduledAt: e.scheduledAt ? new Date(e.scheduledAt) : null,
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

			if (entriesCreated === 0 && filesUploaded === 0) {
        await safeWriteAuditLog(req, {
          category: "backup",
          action: "backup.import",
          status: "FAILURE",
          summary: `${me.name || me.email} attempted to import a backup but no new records were available.`,
          actorSnapshot: buildActorSnapshot(me),
          targetType: "backup",
          targetLabel: String(file.name || "Backup ZIP"),
          details: { entriesMatched, entriesCreated, filesUploaded },
        });
				return NextResponse.json({ success: false, error: getClearNoChangeMessage(entriesMatched) }, { status: 409 });
			}

      await safeWriteAuditLog(req, {
        category: "backup",
        action: "backup.import",
        status: "SUCCESS",
        summary: `${me.name || me.email} imported a backup ZIP.`,
        actorSnapshot: buildActorSnapshot(me),
        targetType: "backup",
        targetLabel: String(file.name || "Backup ZIP"),
        details: { entriesMatched, entriesCreated, filesUploaded, format: "json" },
      });

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

    const idMap = new Map();
    let entriesCreated = 0;
    let entriesMatched = 0;
    let filesUploaded = 0;

    for (const row of rows) {
      const rowId = row[idx("id")] || "";
      const data = {
			id: rowId,
        fullName: row[idx("fullName")] || "",
        email: row[idx("email")] || "",
        phone: row[idx("phone")] || "",
        address: row[idx("address")] || "",
        visaType: row[idx("visaType")] || "",
        birthdate: row[idx("birthdate")] || "",
        age: parseInt(row[idx("age")] || "0", 10) || 0,
        availableTime: row[idx("availableTime")] || "",
        availableDay: row[idx("availableDay")] || "",
        status: row[idx("status")] || "NEW",
        scheduledAt: row[idx("scheduledAt")] || undefined,
			createdAt: row[idx("createdAt")] || undefined,
      };

      const existing = await findExistingEntry(data);
      let targetId = existing?.id;
      if (existing) {
			entriesMatched += 1;
      } else {
			const created = await prisma.applicationEntry.create({
				data: {
					fullName: data.fullName,
					email: data.email,
					phone: data.phone,
					address: data.address,
					visaType: data.visaType,
					age: data.birthdate ? calculateAgeFromBirthdate(data.birthdate) : data.age,
					birthdate: data.birthdate ? birthdateInputToDate(data.birthdate) : null,
					availableTime: data.availableTime,
					availableDay: data.availableDay,
					status: normalizeApplicationStatus(data.status),
					scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
					createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
				},
			});
			targetId = created.id;
			entriesCreated += 1;
      }
		idMap.set(rowId, targetId);

      // import files in /files/<entryId>/
      const folder = zip.folder(`files/${rowId}`) || zip.folder(`files/${targetId}`);
      if (folder) {
        const files = Object.values(folder.files || {});
			const existingFiles = await prisma.applicationFile.findMany({ where: { applicationId: targetId } });
			const existingNames = new Set(existingFiles.map((file) => String(file.fileUrl || "").split("/").pop()).filter(Boolean));
        for (const zf of files) {
          if (zf.dir) continue;
			const filename = zf.name.split("/").pop();
			if (existingNames.has(filename)) continue;
          const fileBuffer = await zf.async("nodebuffer");
          const path = `applications/${targetId}/${filename}`;
          const { error } = await supabase.storage
            .from(bucket)
            .upload(path, fileBuffer, { upsert: false });
          if (!error) {
            const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
            await prisma.applicationFile.create({
              data: {
                applicationId: targetId,
                fileUrl: pub?.publicUrl || `supabase://${bucket}/${path}`,
                fileType: "application/octet-stream",
              },
            });
				existingNames.add(filename);
            filesUploaded += 1;
          }
        }
      }
    }

		if (entriesCreated === 0 && filesUploaded === 0) {
      await safeWriteAuditLog(req, {
        category: "backup",
        action: "backup.import",
        status: "FAILURE",
        summary: `${me.name || me.email} attempted to import a backup but no new records were available.`,
        actorSnapshot: buildActorSnapshot(me),
        targetType: "backup",
        targetLabel: String(file.name || "Backup ZIP"),
        details: { entriesMatched, entriesCreated, filesUploaded, format: "csv" },
      });
			return NextResponse.json({ success: false, error: getClearNoChangeMessage(entriesMatched) }, { status: 409 });
		}

    await safeWriteAuditLog(req, {
      category: "backup",
      action: "backup.import",
      status: "SUCCESS",
      summary: `${me.name || me.email} imported a backup ZIP.`,
      actorSnapshot: buildActorSnapshot(me),
      targetType: "backup",
      targetLabel: String(file.name || "Backup ZIP"),
      details: { entriesMatched, entriesCreated, filesUploaded, format: "csv" },
    });

    return NextResponse.json({ success: true, entriesCreated, entriesMatched, filesUploaded });
  } catch (err) {
    console.error("backup import error", err);
		const message = err?.message || "Import failed";
		const duplicateMessage = message.includes("already exists")
			? "This backup could not be imported because the same application records already exist."
			: message;
    return NextResponse.json({ success: false, error: duplicateMessage }, { status: 500 });
  }
}
