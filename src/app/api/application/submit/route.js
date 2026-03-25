import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { validateApplicationUploadFile } from "@/lib/application-files";
import {
  createApplicationEntry,
  findDuplicateApplication,
  normalizeApplicationFields,
  PUBLIC_DUPLICATE_APPLICATION_MESSAGE,
  validateApplicationFields,
} from "@/lib/application-submission";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

function sanitizeFilename(name = "file") {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function uploadToSupabase({ file, bucket, prefix = "applications" }) {
  const arrayBuffer = await file.arrayBuffer();
  const body = Buffer.from(arrayBuffer);
  const safeName = sanitizeFilename(file.name || "upload.bin");
  const path = `${prefix}/${Date.now()}_${safeName}`;

  const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, body, { contentType: file.type || "application/octet-stream", upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  const url = data?.publicUrl || `supabase://${bucket}/${path}`;
  return { path, url };
}

export async function POST(req) {
  try {
    // Accept either application/json or multipart/form-data
    const contentType = req.headers.get("content-type") || "";

    let fields = {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      visaType: "",
      age: 0,
      availableTime: "",
      availableDay: "",
    };
    let files = [];

    if (contentType.startsWith("application/json")) {
      const json = await req.json();
      fields = {
        fullName: String(json.fullName || "").trim(),
        email: String(json.email || "").trim(),
        phone: String(json.phone || "").trim(),
        address: String(json.address || "").trim(),
        visaType: String(json.visaType || "").trim(),
        age: Number.parseInt(json.age, 10) || 0,
        availableTime: String(json.availableTime || "").trim(),
        availableDay: String(json.availableDay || "").trim(),
      };
      files = [];
    } else {
      const form = await req.formData();
      const payload = form.get("payload");
      if (payload) {
        const json = JSON.parse(String(payload));
        fields = {
          fullName: String(json.fullName || "").trim(),
          email: String(json.email || "").trim(),
          phone: String(json.phone || "").trim(),
          address: String(json.address || "").trim(),
          visaType: String(json.visaType || "").trim(),
          age: Number.parseInt(json.age, 10) || 0,
          availableTime: String(json.availableTime || "").trim(),
          availableDay: String(json.availableDay || "").trim(),
        };
      } else {
        fields = {
          fullName: String(form.get("fullName") || "").trim(),
          email: String(form.get("email") || "").trim(),
          phone: String(form.get("phone") || "").trim(),
          address: String(form.get("address") || "").trim(),
          visaType: String(form.get("visaType") || "").trim(),
          age: Number.parseInt(String(form.get("age") || "0"), 10) || 0,
          availableTime: String(form.get("availableTime") || "").trim(),
          availableDay: String(form.get("availableDay") || "").trim(),
        };
      }
      files = form
        .getAll("files")
        .filter((f) => f && typeof f.arrayBuffer === "function" && typeof f.size === "number" && f.size > 0);
    }

    const normalizedFields = normalizeApplicationFields(fields);
    const validationError = validateApplicationFields(normalizedFields);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    for (const file of files) {
      const fileError = validateApplicationUploadFile(file);
      if (fileError) {
        return NextResponse.json({ success: false, error: `${file.name}: ${fileError}` }, { status: 400 });
      }
    }

    const existing = await findDuplicateApplication(normalizedFields);
    if (existing) {
      return NextResponse.json(
        { success: false, error: PUBLIC_DUPLICATE_APPLICATION_MESSAGE, duplicate: true },
        { status: 409 }
      );
    }

    // Create DB entry
    const entry = await createApplicationEntry(normalizedFields);

    const uploaded = [];
    if (files.length > 0) {
      const bucket = requiredEnv("SUPABASE_APPLICATION_BUCKET");
      for (const file of files) {
        const { url, path } = await uploadToSupabase({ file, bucket, prefix: `applications/${entry.id}` });
        const rec = await prisma.applicationFile.create({
          data: {
            applicationId: entry.id,
            fileUrl: url,
            fileType: file.type || "application/octet-stream",
          },
        });
        uploaded.push({ path, url, id: rec.id });
      }
    }

    const accept = req.headers.get("accept") || "";
    if (accept.includes("text/html")) {
      return NextResponse.redirect(new URL("/services/application-form?submitted=1", req.url));
    }
    return NextResponse.json({ success: true, id: entry.id, files: uploaded });
  } catch (err) {
    console.error("Application submit error:", err);
    const accept = req.headers.get("accept") || "";
    if (accept.includes("text/html")) {
      return NextResponse.redirect(new URL("/services/application-form?error=Submission+failed", req.url));
    }
    return NextResponse.json({ success: false, error: "Submission failed" }, { status: 500 });
  }
}
