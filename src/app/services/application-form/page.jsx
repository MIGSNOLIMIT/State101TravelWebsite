export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

import { useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";

export default function ApplicationFormPage({ searchParams, requirements = [] }) {
  const submitted = searchParams?.submitted === "1";
  const errorParam = searchParams?.error;
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(errorParam || "");
  const formRef = useRef();

  // Supabase client for uploads
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const bucket = process.env.SUPABASE_APPLICATION_BUCKET;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/heic",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  function handleFileChange(e) {
    setError("");
    const files = Array.from(e.target.files);
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setError("Only JPG, PNG, HEIC, PDF, DOC, and DOCX files are allowed.");
        e.target.value = "";
        return;
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);
    const form = formRef.current;
    const data = new FormData(form);
    // Collect fields
    const fields = {
      fullName: data.get("fullName"),
      email: data.get("email"),
      phone: data.get("phone"),
      address: data.get("address"),
      visaType: data.get("visaType"),
      age: data.get("age"),
      availableTime: data.get("availableTime"),
      availableDay: data.get("availableDay"),
    };
    // Upload files to Supabase
    const files = data.getAll("files");
    const uploadedFiles = [];
    for (const file of files) {
      if (!file || file.size === 0) continue;
      if (!allowedTypes.includes(file.type)) {
        setError("Only JPG, PNG, HEIC, PDF, DOC, and DOCX files are allowed.");
        setSubmitting(false);
        return;
      }
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `applications/${Date.now()}_${safeName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
      if (uploadError) {
        setError("File upload failed: " + uploadError.message);
        setSubmitting(false);
        return;
      }
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
      uploadedFiles.push({ url: urlData.publicUrl, name: file.name, type: file.type });
    }
    // Submit metadata to backend
    try {
      const res = await fetch("/api/application/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, files: uploadedFiles }),
      });
      if (res.ok) {
        setSuccess(true);
        form.reset();
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err?.error || "Submission failed");
      }
    } catch {
      setError("Submission failed");
    }
    setSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-red-600 to-blue-900">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Image src="/images/logo.png" width={48} height={48} alt="Logo" />
            <h1 className="text-2xl font-bold text-blue-700">Apply Now</h1>
          </div>
          {success && (
            <div className="mb-6 rounded bg-green-100 text-green-800 px-4 py-3">
              Thank you! Your application has been submitted.
            </div>
          )}
          {error && (
            <div className="mb-6 rounded bg-red-100 text-red-800 px-4 py-3">{error}</div>
          )}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input name="fullName" required className="mt-1 w-full rounded border px-3 py-2" placeholder="Juan Dela Cruz" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" name="email" required className="mt-1 w-full rounded border px-3 py-2" placeholder="you@example.com" maxLength={254} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input name="phone" required className="mt-1 w-full rounded border px-3 py-2" placeholder="0917 123 4567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input name="address" required className="mt-1 w-full rounded border px-3 py-2" placeholder="City / Province" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Visa Type</label>
                <input name="visaType" required className="mt-1 w-full rounded border px-3 py-2" placeholder="Canadian, Australian, etc." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input type="number" name="age" min={1} required className="mt-1 w-full rounded border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Available Time</label>
                <input name="availableTime" required className="mt-1 w-full rounded border px-3 py-2" placeholder="9AM - 12PM" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Available Day</label>
                <select name="availableDay" required className="mt-1 w-full rounded border px-3 py-2">
                  <option value="">Select Day</option>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Upload Files (JPG, PNG, PDF only)</label>
              <input
                type="file"
                name="files"
                multiple
                accept=".jpg,.jpeg,.png,.heic,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-700 file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700"
              />
              <p className="text-xs text-gray-600 mt-1">Allowed formats: JPG, PNG, HEIC, PDF, DOC, DOCX. Max 50MB per file.</p>
            </div>
            <button type="submit" disabled={submitting} className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold px-6 py-2 rounded hover:from-blue-700 hover:to-red-700 disabled:opacity-60">
              {submitting ? "Submitting…" : "Submit Application"}
            </button>
          </form>
        </div>
        <section className="mt-10 bg-white/95 rounded-xl shadow p-6 md:p-8">
          <h2 className="text-xl font-bold text-blue-700 mb-4">Initial Requirements</h2>
          {requirements.length === 0 ? (
            <p className="text-gray-600">No requirements available at the moment.</p>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {requirements.map((item) => (
                <li key={item.id} className="border rounded p-4">
                  <div className="flex items-start gap-3">
                    {item.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.icon} alt="" className="h-6 w-6 mt-1" />
                    ) : (
                      <span className="h-2 w-2 mt-2 rounded-full bg-blue-600 inline-block" />
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">
                        {item.title}
                        {item.isRequired && (
                          <span className="ml-2 text-xs font-medium text-red-600">Required</span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
