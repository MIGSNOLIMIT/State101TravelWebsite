"use client";

import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import AdminShell from "@/app/admin/components/AdminShell";
import { AdminEditorCard, AdminEditorLabel, AdminEditorStrip } from "@/app/admin/components/AdminEditorUi";
import ConfirmDialog from "@/components/ConfirmDialog";
import MediaLibraryPicker from "@/components/MediaLibraryPicker";

export default function HomeClient({ initialUserName, initialRole }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/homepage");
        const json = await res.json();
        if (!ignore) setData(json);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchData();
    return () => {
      ignore = true;
    };
  }, []);

  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const doSave = async () => {
    setPendingSave(true);
    try {
      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setMessage(res.ok ? "Homepage updated!" : "Error saving changes.");
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
    const anyEmpty = !Array.isArray(data.heroImages) || data.heroImages.length === 0 || !Array.isArray(data.testimonialsImages) || data.testimonialsImages.length === 0 || !data.testimonialsVideoUrl;
    if (anyEmpty) {
      setConfirmOpen(true);
      return;
    }
    await doSave();
  };

  const handleImageChange = (value) => {
    const invalid = Array.isArray(value) ? value.some((item) => item && item.match(/\.mp4$/i)) : value && value.match(/\.mp4$/i);
    if (invalid) {
      setMessage("Error: Only image files are allowed in the Images section.");
      return;
    }
    handleChange("heroImages", value);
  };

  const handleTestimonialImagesChange = (value) => {
    if (!value) {
      handleChange("testimonialsImages", []);
      return;
    }
    const invalid = Array.isArray(value) ? value.some((item) => item && item.match(/\.mp4$/i)) : value && value.match(/\.mp4$/i);
    if (invalid) {
      setMessage("Error: Only image files are allowed in the Testimonials Images section.");
      return;
    }
    handleChange("testimonialsImages", Array.isArray(value) ? value : [value]);
  };

  const handleVideoChange = (value) => {
    if (!value) {
      handleChange("testimonialsVideoUrl", "");
      return;
    }
    if (!value.match(/\.mp4$/i)) {
      setMessage("Error: Only MP4 files are allowed in the Video section.");
      return;
    }
    handleChange("testimonialsVideoUrl", value);
  };

  return (
    <AdminShell title="Home Page" userName={initialUserName} role={initialRole}>
      <AdminEditorCard title="Home Page Media" contentClassName="px-0 py-0">
        {loading || !data ? (
          <div className="flex h-40 items-center justify-center px-5 py-6 text-sm text-slate-500 md:px-6">Loading homepage data...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-0">
            <AdminEditorStrip title="Home Page Images" />
            <div className="px-5 py-6 md:px-6">
              <div>
                <AdminEditorLabel>Select Multiple Images</AdminEditorLabel>
                <div className="mt-3 rounded-[18px] border-2 border-[#9eb8e3] p-3 dark:border-[#5d7fb3]">
                  <MediaLibraryPicker value={data.heroImages} onChange={handleImageChange} multiple={true} accept="image/*" folder="home/hero" />
                </div>
              </div>
            </div>

            <AdminEditorStrip title="Our Successful Clients Images" />
            <div className="px-5 py-6 md:px-6">
              <div>
                <AdminEditorLabel>Select Multiple Images</AdminEditorLabel>
                <div className="mt-3 rounded-[18px] border-2 border-[#9eb8e3] p-3 dark:border-[#5d7fb3]">
                  <MediaLibraryPicker value={data.testimonialsImages} onChange={handleTestimonialImagesChange} multiple={true} accept="image/*" folder="home/testimonials" />
                </div>
              </div>
            </div>

            <AdminEditorStrip title="Our Successful Clients Video" />
            <div className="px-5 py-6 md:px-6">
              <div>
                <AdminEditorLabel>Select a Video</AdminEditorLabel>
                <div className="mt-3 rounded-[18px] border-2 border-[#9eb8e3] p-3 dark:border-[#5d7fb3]">
                  <MediaLibraryPicker value={data.testimonialsVideoUrl} onChange={handleVideoChange} multiple={false} accept="video/*" folder="home/testimonials-video" />
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
            </div>
          </form>
        )}

        <ConfirmDialog
          open={confirmOpen}
          title="Save homepage with empty fields?"
          message="Some homepage fields are empty. Are you sure you want to save with empty values?"
          confirmText={pendingSave ? "Saving..." : "Save anyway"}
          cancelText="Cancel"
          onCancel={() => {
            setConfirmOpen(false);
            setSaving(false);
          }}
          onConfirm={doSave}
        />
      </AdminEditorCard>
    </AdminShell>
  );
}