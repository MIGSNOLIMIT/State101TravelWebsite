"use client";

import { Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import AdminShell from "@/app/admin/components/AdminShell";
import { AdminEditorCard, AdminEditorLabel, AdminEditorNote, AdminEditorStrip, adminEditorInputClass, adminEditorTextareaClass } from "@/app/admin/components/AdminEditorUi";
import ConfirmDialog from "@/components/ConfirmDialog";
import Image from "next/image";
import MediaLibraryPicker from "@/components/MediaLibraryPicker";
import {
  buildTimeSlotLabel,
  DEFAULT_APPLICATION_AVAILABLE_DAYS,
  DEFAULT_APPLICATION_TIME_SLOTS,
  DEFAULT_APPLICATION_VISA_TYPES,
  normalizeApplicationFormSettings,
} from "@/lib/application-form-settings";

function buildDefaultPage() {
  const formSettings = normalizeApplicationFormSettings({
    applicationAvailableDays: DEFAULT_APPLICATION_AVAILABLE_DAYS,
    applicationVisaTypes: DEFAULT_APPLICATION_VISA_TYPES,
    applicationTimeSlots: DEFAULT_APPLICATION_TIME_SLOTS,
  });

  return {
    heroImageUrl: "",
    heroTitle: "",
    heroDesc: "",
    sectionTitle: "",
    sectionDesc: "",
    requirementsText: "",
    sections: [],
    ...formSettings,
  };
}

export default function ServicesClient({ initialUserName, initialRole }) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [mediaWarning, setMediaWarning] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);
  const [dayDraft, setDayDraft] = useState("");
  const [visaDraft, setVisaDraft] = useState("");
  const [timeDraft, setTimeDraft] = useState({ start: "", end: "" });

  useEffect(() => {
    let ignore = false;

    async function fetchPage() {
      setLoading(true);
      const res = await fetch("/api/admin/services-page");
      const json = await res.json();
      if (!ignore) {
        setPage(json ? { ...json, ...normalizeApplicationFormSettings(json) } : buildDefaultPage());
        setLoading(false);
      }
    }

    fetchPage();
    return () => {
      ignore = true;
    };
  }, []);

  const handleChange = (field, value) => {
    setPage((prev) => ({ ...prev, [field]: value }));
  };

  const handleSectionChange = (index, field, value) => {
    setPage((prev) => ({
      ...prev,
      sections: prev.sections.map((section, sectionIndex) => (sectionIndex === index ? { ...section, [field]: value } : section)),
    }));
  };

  const handleApplicationListChange = (field, index, value) => {
    setPage((prev) => ({
      ...prev,
      [field]: prev[field].map((item, itemIndex) => (itemIndex === index ? value : item)),
    }));
  };

  const removeApplicationListItem = (field, index) => {
    setPage((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleTimeSlotChange = (index, field, value) => {
    setPage((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.map((slot, slotIndex) => {
        if (slotIndex !== index) return slot;
        const next = { ...slot, [field]: value };
        return { ...next, label: buildTimeSlotLabel(next) };
      }),
    }));
  };

  const removeTimeSlot = (index) => {
    setPage((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, slotIndex) => slotIndex !== index),
    }));
  };

  const addAvailableDay = () => {
    const value = dayDraft.trim();
    if (!value) return;
    setPage((prev) => ({ ...prev, availableDays: [...prev.availableDays, value] }));
    setDayDraft("");
  };

  const addVisaType = () => {
    const value = visaDraft.trim();
    if (!value) return;
    setPage((prev) => ({ ...prev, visaTypes: [...prev.visaTypes, value] }));
    setVisaDraft("");
  };

  const addTimeSlot = () => {
    if (!timeDraft.start || !timeDraft.end) return;
    const nextSlot = {
      start: timeDraft.start,
      end: timeDraft.end,
      label: buildTimeSlotLabel(timeDraft),
    };
    setPage((prev) => ({ ...prev, timeSlots: [...prev.timeSlots, nextSlot] }));
    setTimeDraft({ start: "", end: "" });
  };

  const doSave = async () => {
    setPendingSave(true);
    try {
      const res = await fetch("/api/admin/services-page", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page),
      });
      setMessage(res.ok ? "Services page updated!" : "Error saving changes.");
    } finally {
      setPendingSave(false);
      setSaving(false);
      setConfirmOpen(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
		if (mediaWarning) {
			setMessage(mediaWarning);
			setSaving(false);
			return;
		}
    const heroEmpty = !page?.heroImageUrl && (!page?.heroTitle || !page?.heroDesc);
    const anySectionEmpty = Array.isArray(page?.sections) && page.sections.some((section) => !section.title?.trim() || !section.description?.trim() || !section.buttonLabel?.trim() || !section.buttonLink?.trim());
    if (heroEmpty || anySectionEmpty) {
      setConfirmOpen(true);
      return;
    }
    await doSave();
  };

  if (loading || !page) {
    return (
      <AdminShell title="Services Page" userName={initialUserName} role={initialRole}>
        <div className="p-8 text-center text-sm text-slate-500">Loading services page...</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Services Page" userName={initialUserName} role={initialRole}>
      <form onSubmit={handleSave} className="space-y-6">
        <AdminEditorCard title="Services Page Image">
          <AdminEditorLabel>Select an Image</AdminEditorLabel>
          <div className="mt-3 rounded-[18px] border-2 border-[#9eb8e3] p-3 dark:border-[#5d7fb3]">
            <MediaLibraryPicker value={page.heroImageUrl || ""} onChange={(value) => handleChange("heroImageUrl", value)} onValidationStateChange={(warning) => setMediaWarning(warning ? 'There is an invalid media file in the "Services Page Image" section. Changes will not be saved.' : "")} accept="image/*" folder="services" />
          </div>
          {page.heroImageUrl ? <Image src={page.heroImageUrl} alt="Services page hero" width={120} height={80} className="mt-3 rounded-md border border-[#c7d5eb] object-contain" /> : null}
        </AdminEditorCard>

        <AdminEditorCard title="Services Page Info">
          <div className="space-y-5">
            <div>
              <AdminEditorLabel>Page Title</AdminEditorLabel>
              <input type="text" value={page.heroTitle || ""} onChange={(event) => handleChange("heroTitle", event.target.value)} className={adminEditorInputClass} placeholder="Page title" />
            </div>
            <div>
              <AdminEditorLabel>Page Description</AdminEditorLabel>
              <textarea
                value={page.heroDesc || ""}
                onChange={(event) => {
                  const words = event.target.value.trim().split(/\s+/);
                  handleChange("heroDesc", words.length <= 40 ? event.target.value : words.slice(0, 40).join(" "));
                }}
                className={`${adminEditorTextareaClass} min-h-[130px] resize-y`}
                placeholder="Hero description"
                rows={5}
              />
              <div className="mt-1 text-right text-sm text-slate-500">{page.heroDesc ? page.heroDesc.trim().split(/\s+/).length : 0}/40 words</div>
            </div>
          </div>
        </AdminEditorCard>

        <AdminEditorCard title="Initial Requirements">
          <AdminEditorLabel>Edit Initial Requirements</AdminEditorLabel>
          <AdminEditorNote className="mt-2">Leave empty to hide on the Services page. Use new lines for each item.</AdminEditorNote>
          <textarea
            value={page.requirementsText || ""}
            onChange={(event) => handleChange("requirementsText", event.target.value)}
            className={`${adminEditorTextareaClass} min-h-[180px] resize-y`}
            placeholder={"Valid passport (Photocopy)\n2x2 photo (white background)\nTraining Certificate (if available)\nDiploma (Photocopy if available)\nUpdated Resume\nOther supporting documents may be discussed during your assessment."}
          />
        </AdminEditorCard>

        <AdminEditorCard title="Application Form Dropdowns">
          <div className="space-y-8">
            <div>
              <AdminEditorLabel>Available Day</AdminEditorLabel>
              <AdminEditorNote className="mt-2">Add or edit the day choices shown in the public application forms.</AdminEditorNote>
              <div className="mt-4 flex flex-col gap-3 md:flex-row">
                <input
                  type="text"
                  value={dayDraft}
                  onChange={(event) => setDayDraft(event.target.value)}
                  className={adminEditorInputClass}
                  placeholder="Add a day option"
                />
                <button
                  type="button"
                  onClick={addAvailableDay}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#164896] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#103773]"
                >
                  <Plus size={16} />
                  Add Day
                </button>
              </div>
              <div className="mt-4 overflow-hidden rounded-[18px] border border-[#d9e3f1]">
                <table className="min-w-full divide-y divide-[#d9e3f1] text-sm">
                  <thead className="bg-[#f7f9fc] text-left text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Current Day</th>
                      <th className="px-4 py-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef3fa] bg-white">
                    {page.availableDays.map((day, index) => (
                      <tr key={`${day}-${index}`}>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={day}
                            onChange={(event) => handleApplicationListChange("availableDays", index, event.target.value)}
                            className={adminEditorInputClass}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => removeApplicationListItem("availableDays", index)}
                            className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            <Trash2 size={15} />
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <AdminEditorLabel>Available Time</AdminEditorLabel>
              <AdminEditorNote className="mt-2">Set each time range with a start time and end time, then review the live table below.</AdminEditorNote>
              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <input
                  type="time"
                  value={timeDraft.start}
                  onChange={(event) => setTimeDraft((prev) => ({ ...prev, start: event.target.value }))}
                  className={adminEditorInputClass}
                />
                <input
                  type="time"
                  value={timeDraft.end}
                  onChange={(event) => setTimeDraft((prev) => ({ ...prev, end: event.target.value }))}
                  className={adminEditorInputClass}
                />
                <button
                  type="button"
                  onClick={addTimeSlot}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#164896] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#103773]"
                >
                  <Plus size={16} />
                  Add Time
                </button>
              </div>
              <div className="mt-4 overflow-hidden rounded-[18px] border border-[#d9e3f1]">
                <table className="min-w-full divide-y divide-[#d9e3f1] text-sm">
                  <thead className="bg-[#f7f9fc] text-left text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Start</th>
                      <th className="px-4 py-3 font-semibold">End</th>
                      <th className="px-4 py-3 font-semibold">Current Set</th>
                      <th className="px-4 py-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef3fa] bg-white">
                    {page.timeSlots.map((slot, index) => (
                      <tr key={`${slot.start}-${slot.end}-${index}`}>
                        <td className="px-4 py-3">
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(event) => handleTimeSlotChange(index, "start", event.target.value)}
                            className={adminEditorInputClass}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(event) => handleTimeSlotChange(index, "end", event.target.value)}
                            className={adminEditorInputClass}
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700">{buildTimeSlotLabel(slot) || "Incomplete time range"}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => removeTimeSlot(index)}
                            className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            <Trash2 size={15} />
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <AdminEditorLabel>Visa Type</AdminEditorLabel>
              <AdminEditorNote className="mt-2">Manage the visa type choices used by both the website form and the admin walk-in form.</AdminEditorNote>
              <div className="mt-4 flex flex-col gap-3 md:flex-row">
                <input
                  type="text"
                  value={visaDraft}
                  onChange={(event) => setVisaDraft(event.target.value)}
                  className={adminEditorInputClass}
                  placeholder="Add a visa type"
                />
                <button
                  type="button"
                  onClick={addVisaType}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#164896] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#103773]"
                >
                  <Plus size={16} />
                  Add Visa Type
                </button>
              </div>
              <div className="mt-4 overflow-hidden rounded-[18px] border border-[#d9e3f1]">
                <table className="min-w-full divide-y divide-[#d9e3f1] text-sm">
                  <thead className="bg-[#f7f9fc] text-left text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Current Visa Type</th>
                      <th className="px-4 py-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef3fa] bg-white">
                    {page.visaTypes.map((visaType, index) => (
                      <tr key={`${visaType}-${index}`}>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={visaType}
                            onChange={(event) => handleApplicationListChange("visaTypes", index, event.target.value)}
                            className={adminEditorInputClass}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => removeApplicationListItem("visaTypes", index)}
                            className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            <Trash2 size={15} />
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </AdminEditorCard>

        {page.sections?.length ? (
          <AdminEditorCard title="Service Sections" contentClassName="px-0 py-0">
            {page.sections.map((section, index) => (
              <div key={section.id || index}>
                <AdminEditorStrip title={`Service Section ${index + 1}`} className={index === 0 ? "border-t-0" : ""} />
                <div className="space-y-5 px-5 py-6 md:px-6">
                  <div>
                    <AdminEditorLabel>Section Image URL</AdminEditorLabel>
                    <input type="text" value={section.iconUrl || ""} onChange={(event) => handleSectionChange(index, "iconUrl", event.target.value)} className={adminEditorInputClass} placeholder="Section image URL" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <AdminEditorLabel>Section Title</AdminEditorLabel>
                      <input type="text" value={section.title || ""} onChange={(event) => handleSectionChange(index, "title", event.target.value)} className={adminEditorInputClass} placeholder="Section title" />
                    </div>
                    <div>
                      <AdminEditorLabel>Section Description</AdminEditorLabel>
                      <input type="text" value={section.description || ""} onChange={(event) => handleSectionChange(index, "description", event.target.value)} className={adminEditorInputClass} placeholder="Section description" />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <AdminEditorLabel>Button Label</AdminEditorLabel>
                      <input type="text" value={section.buttonLabel || ""} onChange={(event) => handleSectionChange(index, "buttonLabel", event.target.value)} className={adminEditorInputClass} placeholder="Button label" />
                    </div>
                    <div>
                      <AdminEditorLabel>Button Link</AdminEditorLabel>
                      <input type="text" value={section.buttonLink || ""} onChange={(event) => handleSectionChange(index, "buttonLink", event.target.value)} className={adminEditorInputClass} placeholder="Button link" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </AdminEditorCard>
        ) : null}

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-h-6 text-sm font-medium text-[#1f57a4]">{message}</div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-3 rounded-md bg-[#2c7a10] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24640d] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>

        <ConfirmDialog
          open={confirmOpen}
          title="Save services page with empty fields?"
          message="Some services page fields are empty. Are you sure you want to save with empty values?"
          confirmText={pendingSave ? "Saving..." : "Save anyway"}
          cancelText="Cancel"
          onCancel={() => {
            setConfirmOpen(false);
            setSaving(false);
          }}
          onConfirm={doSave}
        />
      </form>
    </AdminShell>
  );
}
