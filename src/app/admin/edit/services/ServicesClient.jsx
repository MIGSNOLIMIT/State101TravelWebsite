"use client";

import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import AdminShell from "@/app/admin/components/AdminShell";
import { AdminEditorCard, AdminEditorLabel, AdminEditorNote, AdminEditorStrip, adminEditorInputClass, adminEditorTextareaClass } from "@/app/admin/components/AdminEditorUi";
import ConfirmDialog from "@/components/ConfirmDialog";
import Image from "next/image";
import MediaLibraryPicker from "@/components/MediaLibraryPicker";

export default function ServicesClient({ initialUserName, initialRole }) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function fetchPage() {
      setLoading(true);
      const res = await fetch("/api/admin/services-page");
      const json = await res.json();
      if (!ignore) {
        setPage(json);
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
            <MediaLibraryPicker value={page.heroImageUrl || ""} onChange={(value) => handleChange("heroImageUrl", value)} accept="image/*" folder="services" />
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