"use client";

import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import AdminShell from "@/app/admin/components/AdminShell";
import { AdminEditorCard, AdminEditorLabel, adminEditorTextareaClass } from "@/app/admin/components/AdminEditorUi";
import ConfirmDialog from "@/components/ConfirmDialog";
import Image from "next/image";
import MediaLibraryPicker from "@/components/MediaLibraryPicker";

export default function AboutClient({ initialUserName, initialRole }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [mediaWarning, setMediaWarning] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);

  useEffect(() => {
    let didCancel = false;

    async function fetchData() {
      setLoading(true);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const url = process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/aboutpage` : "/api/aboutpage";
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        if (!didCancel && res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        if (!didCancel) setMessage("Error loading data");
      } finally {
        if (!didCancel) setLoading(false);
      }
    }

    fetchData();
    return () => {
      didCancel = true;
    };
  }, []);

  const doSave = async () => {
    setPendingSave(true);
    try {
      const url = process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/aboutpage` : "/api/aboutpage";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setMessage(res.ok ? "About page updated!" : "Error saving changes.");
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
    if (!data?.heroImageUrl) {
      setConfirmOpen(true);
      return;
    }
    await doSave();
  };

  return (
    <AdminShell title="About Us Page" userName={initialUserName} role={initialRole}>
      <form onSubmit={handleSave} className="space-y-6">
        <AdminEditorCard title="About Page Banner">
          {loading || !data ? (
            <div className="flex h-40 items-center justify-center text-sm text-slate-500">Loading about page data...</div>
          ) : (
            <>
              <AdminEditorLabel>Select an Image</AdminEditorLabel>
              <div className="mt-3 rounded-[18px] border-2 border-[#9eb8e3] p-3 dark:border-[#5d7fb3]">
                <MediaLibraryPicker
                  value={data.heroImageUrl || ""}
                  onValidationStateChange={(warning) => setMediaWarning(warning ? 'There is an invalid media file in the "About Page Banner" section. Changes will not be saved.' : "")}
                  onChange={(value) => {
                    const selected = Array.isArray(value) ? value[0] || "" : value || "";
                    setData((prev) => ({ ...prev, heroImageUrl: selected }));
                  }}
                  multiple={false}
                  accept="image/*"
                  folder="about"
                />
              </div>
              {data.heroImageUrl && /https?:\/\//.test(data.heroImageUrl) ? (
                <div className="mt-4">
                  <Image src={data.heroImageUrl} alt="About page banner" width={280} height={120} className="rounded-md border border-[#c7d5eb] object-contain" />
                </div>
              ) : null}

              <div className="mt-6">
                <AdminEditorLabel>Banner Description</AdminEditorLabel>
                <textarea
                  value={data.heroDescription || ""}
                  onChange={(event) => setData((prev) => ({ ...prev, heroDescription: event.target.value }))}
                  className={`${adminEditorTextareaClass} min-h-[120px] resize-y`}
                  placeholder="Enter the About page banner description"
                />
              </div>
            </>
          )}
        </AdminEditorCard>

        <AdminEditorCard title="Our Story Content">
          {loading || !data ? (
            <div className="flex h-40 items-center justify-center text-sm text-slate-500">Loading story content...</div>
          ) : (
            <div>
              <AdminEditorLabel>Our Story Text</AdminEditorLabel>
              <textarea
                value={data.storyContent || ""}
                onChange={(event) => setData((prev) => ({ ...prev, storyContent: event.target.value }))}
                className={`${adminEditorTextareaClass} min-h-[220px] resize-y`}
                placeholder="Enter the About page story text"
              />
            </div>
          )}
        </AdminEditorCard>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-h-6 text-sm font-medium text-[#1f57a4]">{message}</div>
          <button
            type="submit"
            disabled={saving || loading}
            className="inline-flex items-center justify-center gap-3 rounded-md bg-[#2c7a10] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24640d] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>

        <ConfirmDialog
          open={confirmOpen}
          title="Save with empty hero image?"
          message="The About page hero image is empty. Are you sure you want to save with no hero image?"
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