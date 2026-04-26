"use client";

import { useEffect, useRef, useState } from "react";
import {
  APPLICATION_FILE_ACCEPT,
  APPLICATION_FILE_NOTE,
  APPLICATION_SUCCESS_MESSAGE,
  validateApplicationUploadFile,
} from "@/lib/application-files";
import {
  APPLICATION_ADDRESS_INITIAL_VALUES,
  APPLICATION_ADDRESS_PROVINCES,
  buildApplicationAddress,
  getCitiesForProvince,
} from "@/lib/application-address";
import {
  DEFAULT_APPLICATION_AVAILABLE_DAYS,
  DEFAULT_APPLICATION_TIME_SLOTS,
  DEFAULT_APPLICATION_VISA_TYPES,
  normalizeApplicationFormSettings,
} from "@/lib/application-form-settings";
import { toApplicationVisaOptions } from "@/lib/application-visa";

export default function ApplicationFormEmbed() {
  const formRef = useRef(null);
  const sectionRef = useRef(null);
  const [requirementsText, setRequirementsText] = useState("");
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [address, setAddress] = useState(APPLICATION_ADDRESS_INITIAL_VALUES);
  const [formSettings, setFormSettings] = useState(() =>
    normalizeApplicationFormSettings({
      applicationAvailableDays: DEFAULT_APPLICATION_AVAILABLE_DAYS,
      applicationVisaTypes: DEFAULT_APPLICATION_VISA_TYPES,
      applicationTimeSlots: DEFAULT_APPLICATION_TIME_SLOTS,
    })
  );

  const cityOptions = getCitiesForProvince(address.province);
  const composedAddress = buildApplicationAddress(address);
  const visaTypeOptions = toApplicationVisaOptions(formSettings.visaTypes);

  function handleAddressChange(field, value) {
    setAddress((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "province") {
        next.city = "";
      }
      return next;
    });
  }

  function handleFileChange(event) {
    setError("");
    const files = Array.from(event.target.files || []);
    for (const file of files) {
      const fileError = validateApplicationUploadFile(file);
      if (fileError) {
        setError(`${file.name}: ${fileError}`);
        event.target.value = "";
        return;
      }
    }
  }

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoadingReqs(true);
      try {
        const res = await fetch("/api/admin/services-page", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (!ignore && json) {
            setRequirementsText(json?.requirementsText || "");
            setFormSettings(normalizeApplicationFormSettings(json));
          }
        }
      } catch {}
      setLoadingReqs(false);
    }
    load();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#application-form") return;
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    setError("");
    try {
      const fd = new FormData(formRef.current);
      fd.set("address", composedAddress);
      const res = await fetch("/api/application/submit", { method: "POST", body: fd });
      if (res.ok) {
        setSuccess(true);
        formRef.current?.reset();
        setAddress(APPLICATION_ADDRESS_INITIAL_VALUES);
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
    <section id="application-form" ref={sectionRef} className="scroll-mt-24 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6 md:p-8">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">Application Form</h2>
        {success && (
          <div className="mb-6 rounded bg-green-100 text-green-800 px-4 py-3">
            {APPLICATION_SUCCESS_MESSAGE}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded bg-red-100 text-red-800 px-4 py-3">{error}</div>
        )}
        <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
          <input type="hidden" name="address" value={composedAddress} readOnly />
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name *</label>
              <input name="fullName" required className="mt-1 w-full rounded border px-3 py-2" placeholder="Juan Dela Cruz" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email"
                name="email"
                required
                className="mt-1 w-full rounded border px-3 py-2"
                placeholder="you@example.com"
                pattern="^[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,24}$"
                title="Please enter a valid email address with a complete domain."
                autoComplete="email"
                maxLength={254}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone *</label>
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
              <label className="block text-sm font-medium text-gray-700">Building/Unit</label>
              <input
                value={address.buildingUnit}
                onChange={(event) => handleAddressChange("buildingUnit", event.target.value)}
                className="mt-1 w-full rounded border px-3 py-2"
                placeholder="Unit 12B"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Street *</label>
              <input
                required
                value={address.street}
                onChange={(event) => handleAddressChange("street", event.target.value)}
                className="mt-1 w-full rounded border px-3 py-2"
                placeholder="Street address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Barangay *</label>
              <input
                required
                value={address.barangay}
                onChange={(event) => handleAddressChange("barangay", event.target.value)}
                className="mt-1 w-full rounded border px-3 py-2"
                placeholder="Barangay"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Province *</label>
              <input
                type="text"
                list="application-province-options"
                required
                value={address.province}
                onChange={(event) => handleAddressChange("province", event.target.value)}
                className="mt-1 w-full rounded border px-3 py-2"
                placeholder="Type or select a province"
                autoComplete="off"
              />
              <datalist id="application-province-options">
                {APPLICATION_ADDRESS_PROVINCES.map((option) => (
                  <option key={option.value} value={option.value} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City *</label>
              <input
                type="text"
                list="application-city-options"
                required
                value={address.city}
                onChange={(event) => handleAddressChange("city", event.target.value)}
                className="mt-1 w-full rounded border px-3 py-2"
                placeholder={address.province ? "Type or select a city" : "Type a province first for matching city suggestions"}
                autoComplete="off"
              />
              <datalist id="application-city-options">
                {cityOptions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Visa Type *</label>
              <select name="visaType" required className="mt-1 w-full rounded border px-3 py-2">
                <option value="">Select Visa Type</option>
                {visaTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Age *</label>
              <input type="number" name="age" min={1} required className="mt-1 w-full rounded border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Available Time *</label>
              <select name="availableTime" required className="mt-1 w-full rounded border px-3 py-2">
                <option value="">Select Time</option>
                {formSettings.timeSlots.map((slot) => (
                  <option key={`${slot.start}-${slot.end}`} value={slot.label}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Available Day *</label>
              <select name="availableDay" required className="mt-1 w-full rounded border px-3 py-2">
                <option value="">Select Day</option>
                {formSettings.availableDays.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Attach File</label>
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
