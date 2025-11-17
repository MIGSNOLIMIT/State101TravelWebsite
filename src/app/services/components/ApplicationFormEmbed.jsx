"use client";

import { useEffect, useRef, useState } from "react";

export default function ApplicationFormEmbed() {
  const formRef = useRef(null);
  const [requirementsText, setRequirementsText] = useState("");
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoadingReqs(true);
      try {
        const res = await fetch("/api/admin/services-page", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (!ignore) setRequirementsText(json?.requirementsText || "");
        }
      } catch {}
      setLoadingReqs(false);
    }
    load();
    return () => { ignore = true; };
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    setError("");
    try {
      const fd = new FormData(formRef.current);
      const res = await fetch("/api/application/submit", { method: "POST", body: fd });
      if (res.ok) {
        setSuccess(true);
        formRef.current?.reset();
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
    <section className="py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6 md:p-8">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">Application Form</h2>
        {success && (
          <div className="mb-6 rounded bg-green-100 text-green-800 px-4 py-3">
            Thank you! Your application has been submitted.
          </div>
        )}
        {error && (
          <div className="mb-6 rounded bg-red-100 text-red-800 px-4 py-3">{error}</div>
        )}
        <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
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
                pattern="^(?=.{1,64}@)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"
                title="Please enter a valid email address."
                autoComplete="email"
                maxLength={254}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                name="phone"
                required
                className="mt-1 w-full rounded border px-3 py-2"
                placeholder="09171234567 or +639171234567"
                pattern="^(09\d{9}|\+639\d{9})$"
                title="Please enter a valid Philippine mobile number (e.g. 09171234567 or +639171234567)."
                autoComplete="tel"
                maxLength={13}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input name="address" required className="mt-1 w-full rounded border px-3 py-2" placeholder="City / Province" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Visa Type</label>
              <select name="visaType" required className="mt-1 w-full rounded border px-3 py-2">
                <option value="">Select Visa Type</option>
                <option value="CANADIAN">Canadian</option>
                <option value="AMERICAN">American</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input type="number" name="age" min={1} required className="mt-1 w-full rounded border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Available Time</label>
              <select name="availableTime" required className="mt-1 w-full rounded border px-3 py-2">
                <option value="">Select Time</option>
                <option value="9AM-12PM">9AM-12PM</option>
                <option value="1PM-3PM">1PM-3PM</option>
                <option value="4PM-5PM">4PM-5PM</option>
              </select>
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
                <option value="Sunday">Sunday</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Files: Valid Passport, Resume, etc.</label>
            <input type="file" name="files" multiple className="mt-1 block w-full text-sm text-gray-700 file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700" />
          </div>

          <button type="submit" disabled={submitting} className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold px-6 py-2 rounded hover:from-blue-700 hover:to-red-700 disabled:opacity-60">
            {submitting ? "Submitting…" : "Submit Application"}
          </button>
        </form>

        {loadingReqs ? null : (requirementsText && requirementsText.trim().length > 0) ? (
          <div className="mt-10">
            <h3 className="text-xl font-bold text-blue-700 mb-3">Initial Requirements</h3>
            <pre className="whitespace-pre-wrap text-gray-800 bg-gray-50 border rounded p-4">{requirementsText}</pre>
          </div>
        ) : null}
      </div>
    </section>
  );
}
