"use client";
export const dynamic = "force-dynamic";
import Image from "next/image";

import { useState, useRef } from "react";
import {
  APPLICATION_FILE_ACCEPT,
  APPLICATION_FILE_NOTE,
  APPLICATION_SUCCESS_MESSAGE,
  validateApplicationUploadFile,
} from "@/lib/application-files";
import { APPLICATION_VISA_TYPES } from "@/lib/application-visa";


export default function ApplicationFormPage({ searchParams }) {
  const errorParam = searchParams?.error;
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(errorParam || "");
  const formRef = useRef();

  function handleFileChange(e) {
    setError("");
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      const fileError = validateApplicationUploadFile(file);
      if (fileError) {
        setError(`${file.name}: ${fileError}`);
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
    const formData = new FormData(form);
    const files = formData.getAll("files");
    for (const file of files) {
      if (!file || typeof file.size !== "number" || file.size === 0) continue;
      const fileError = validateApplicationUploadFile(file);
      if (fileError) {
        setError(`${file.name}: ${fileError}`);
        setSubmitting(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/application/submit", {
        method: "POST",
        body: formData,
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
              {APPLICATION_SUCCESS_MESSAGE}
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
                <input
                  type="email"
                  name="email"
                  required
                  className="mt-1 w-full rounded border px-3 py-2"
                  placeholder="you@example.com"
                  pattern="^[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,24}$"
                  title="Please enter a valid email address with a complete domain."
                  maxLength={254}
                />
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
                <select name="visaType" required className="mt-1 w-full rounded border px-3 py-2">
                  <option value="">Select Visa Type</option>
                  {APPLICATION_VISA_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
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
                accept={APPLICATION_FILE_ACCEPT}
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-700 file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700"
              />
              <p className="mt-1 text-xs text-gray-600">{APPLICATION_FILE_NOTE}</p>
            </div>
            <button type="submit" disabled={submitting} className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold px-6 py-2 rounded hover:from-blue-700 hover:to-red-700 disabled:opacity-60">
              {submitting ? "Submitting…" : "Submit Application"}
            </button>
          </form>
        </div>
        <section className="mt-10 bg-white/95 rounded-xl shadow p-6 md:p-8">
          <h2 className="text-xl font-bold text-blue-700 mb-4">Initial Requirements</h2>
          <ul className="grid gap-4 md:grid-cols-2">
            <li className="border rounded p-4">Valid passport (Photocopy)</li>
            <li className="border rounded p-4">2x2 photo (white background)</li>
            <li className="border rounded p-4">Training Certificate (if available)</li>
            <li className="border rounded p-4">Diploma (Photocopy if available)</li>
            <li className="border rounded p-4">Updated Resume</li>
            <li className="border rounded p-4">Other supporting documents may be discussed during your assessment.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
