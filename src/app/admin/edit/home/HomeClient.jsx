"use client";

import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import AdminShell from "@/app/admin/components/AdminShell";
import {
  AdminEditorCard,
  AdminEditorLabel,
  AdminEditorNote,
  AdminEditorStrip,
  adminEditorInputClass,
  adminEditorTextareaClass,
} from "@/app/admin/components/AdminEditorUi";
import ConfirmDialog from "@/components/ConfirmDialog";
import MediaLibraryPicker from "@/components/MediaLibraryPicker";

export default function HomeClient({ initialUserName, initialRole }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [mediaWarnings, setMediaWarnings] = useState({});
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

  const setMediaWarning = (sectionLabel, warning) => {
    setMediaWarnings((prev) => ({
      ...prev,
      [sectionLabel]: warning ? `There is an invalid media file in the "${sectionLabel}" section. Changes will not be saved.` : "",
    }));
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
    const blockingWarnings = Object.values(mediaWarnings).filter(Boolean);
    if (blockingWarnings.length) {
      setMessage(blockingWarnings[0]);
      setSaving(false);
      return;
    }
    const anyEmpty =
      !Array.isArray(data.heroImages) ||
      data.heroImages.length === 0 ||
      !Array.isArray(data.testimonialsImages) ||
      data.testimonialsImages.length === 0 ||
      !data.testimonialsVideoUrl;
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

  const handleAboutLogoChange = (value) => {
    if (!value) {
      handleChange("aboutLogoUrl", "");
      return;
    }
    if (Array.isArray(value) || value.match(/\.mp4$/i)) {
      setMessage("Error: Only image files are allowed in the Who Are We section.");
      return;
    }
    handleChange("aboutLogoUrl", value);
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
      <AdminEditorCard title="Edit here" contentClassName="px-0 py-0">
        {loading || !data ? (
          <div className="flex h-40 items-center justify-center px-5 py-6 text-sm text-slate-500 md:px-6">Loading homepage data...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-0">
            <AdminEditorStrip title="Hero Section" />
            <div className="px-5 py-6 md:px-6">
              <div>
                <AdminEditorLabel>Select Multiple Images</AdminEditorLabel>
                <div className="mt-3 rounded-[18px] border-2 border-[#9eb8e3] p-3 dark:border-[#5d7fb3]">
                  <MediaLibraryPicker
                    value={data.heroImages}
                    onChange={handleImageChange}
                    onValidationStateChange={(warning) => setMediaWarning("Home Page Images", warning)}
                    multiple={true}
                    accept="image/*"
                    folder="home/hero"
                  />
                </div>
              </div>
            </div>

            <AdminEditorStrip title="Who Are We Section" />
            <div className="space-y-6 px-5 py-6 md:px-6">
              <div>
                <AdminEditorLabel>Section Title</AdminEditorLabel>
                <input
                  type="text"
                  value={data.aboutTitle || ""}
                  onChange={(event) => handleChange("aboutTitle", event.target.value)}
                  className={adminEditorInputClass}
                  placeholder="Who Are We?"
                />
              </div>

              <div>
                <AdminEditorLabel>Section Logo</AdminEditorLabel>
                <AdminEditorNote>Upload the logo shown in the Who Are We section.</AdminEditorNote>
                <div className="mt-3 rounded-[18px] border-2 border-[#9eb8e3] p-3 dark:border-[#5d7fb3]">
                  <MediaLibraryPicker
                    value={data.aboutLogoUrl || ""}
                    onChange={handleAboutLogoChange}
                    onValidationStateChange={(warning) => setMediaWarning("Who Are We Section", warning)}
                    multiple={false}
                    accept="image/*"
                    folder="home/about"
                  />
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-[18px] border-2 border-[#9eb8e3] p-5 dark:border-[#5d7fb3]">
                  <AdminEditorLabel>Mission Title</AdminEditorLabel>
                  <input
                    type="text"
                    value={data.aboutMissionTitle || ""}
                    onChange={(event) => handleChange("aboutMissionTitle", event.target.value)}
                    className={adminEditorInputClass}
                    placeholder="Our Mission"
                  />

                  <div className="mt-4">
                    <AdminEditorLabel>Mission Description</AdminEditorLabel>
                    <textarea
                      rows={6}
                      value={data.aboutMissionDescription || ""}
                      onChange={(event) => handleChange("aboutMissionDescription", event.target.value)}
                      className={adminEditorTextareaClass}
                      placeholder="Enter the mission text."
                    />
                  </div>
                </div>

                <div className="rounded-[18px] border-2 border-[#9eb8e3] p-5 dark:border-[#5d7fb3]">
                  <AdminEditorLabel>Vision Title</AdminEditorLabel>
                  <input
                    type="text"
                    value={data.aboutVisionTitle || ""}
                    onChange={(event) => handleChange("aboutVisionTitle", event.target.value)}
                    className={adminEditorInputClass}
                    placeholder="Our Vision"
                  />

                  <div className="mt-4">
                    <AdminEditorLabel>Vision Description</AdminEditorLabel>
                    <textarea
                      rows={6}
                      value={data.aboutVisionDescription || ""}
                      onChange={(event) => handleChange("aboutVisionDescription", event.target.value)}
                      className={adminEditorTextareaClass}
                      placeholder="Enter the vision text."
                    />
                  </div>
                </div>
              </div>
            </div>

            <AdminEditorStrip title="Homepage Services Section" />
            <div className="space-y-6 px-5 py-6 md:px-6">
              <div>
                <AdminEditorLabel>Section Title</AdminEditorLabel>
                <input
                  type="text"
                  value={data.servicesTitle || ""}
                  onChange={(event) => handleChange("servicesTitle", event.target.value)}
                  className={adminEditorInputClass}
                  placeholder="Our Services"
                />
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-[18px] border-2 border-[#9eb8e3] p-5 dark:border-[#5d7fb3]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <AdminEditorLabel className="mb-2">Canada Card</AdminEditorLabel>
                      <AdminEditorNote>Fixed homepage slot for Canada. Turn it off to hide the card.</AdminEditorNote>
                    </div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={Boolean(data.canadaServiceEnabled)}
                        onChange={(event) => handleChange("canadaServiceEnabled", event.target.checked)}
                        className="h-4 w-4 accent-[#1f57a4]"
                      />
                      Show card
                    </label>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div>
                      <AdminEditorLabel>Title</AdminEditorLabel>
                      <input
                        type="text"
                        value={data.canadaServiceTitle || ""}
                        onChange={(event) => handleChange("canadaServiceTitle", event.target.value)}
                        className={adminEditorInputClass}
                        placeholder="Canada"
                      />
                    </div>
                    <div>
                      <AdminEditorLabel>Description</AdminEditorLabel>
                      <AdminEditorNote>Use line breaks if you want the front end to show multiple lines.</AdminEditorNote>
                      <textarea
                        rows={6}
                        value={data.canadaServiceDescription || ""}
                        onChange={(event) => handleChange("canadaServiceDescription", event.target.value)}
                        className={adminEditorTextareaClass}
                        placeholder="Describe the Canada service offering."
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-[18px] border-2 border-[#9eb8e3] p-5 dark:border-[#5d7fb3]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <AdminEditorLabel className="mb-2">United States Card</AdminEditorLabel>
                      <AdminEditorNote>Fixed homepage slot for the U.S. Turn it off to hide the card.</AdminEditorNote>
                    </div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={Boolean(data.unitedStatesServiceEnabled)}
                        onChange={(event) => handleChange("unitedStatesServiceEnabled", event.target.checked)}
                        className="h-4 w-4 accent-[#1f57a4]"
                      />
                      Show card
                    </label>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div>
                      <AdminEditorLabel>Title</AdminEditorLabel>
                      <input
                        type="text"
                        value={data.unitedStatesServiceTitle || ""}
                        onChange={(event) => handleChange("unitedStatesServiceTitle", event.target.value)}
                        className={adminEditorInputClass}
                        placeholder="United States"
                      />
                    </div>
                    <div>
                      <AdminEditorLabel>Description</AdminEditorLabel>
                      <AdminEditorNote>Use line breaks if you want the front end to show multiple lines.</AdminEditorNote>
                      <textarea
                        rows={6}
                        value={data.unitedStatesServiceDescription || ""}
                        onChange={(event) => handleChange("unitedStatesServiceDescription", event.target.value)}
                        className={adminEditorTextareaClass}
                        placeholder="Describe the United States service offering."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <AdminEditorStrip title="Our Successful Clients Section" />
            <div className="px-5 py-6 md:px-6">
              <div>
                <AdminEditorLabel>Select Multiple Images</AdminEditorLabel>
                <div className="mt-3 rounded-[18px] border-2 border-[#9eb8e3] p-3 dark:border-[#5d7fb3]">
                  <MediaLibraryPicker
                    value={data.testimonialsImages}
                    onChange={handleTestimonialImagesChange}
                    onValidationStateChange={(warning) => setMediaWarning("Our Successful Clients Images", warning)}
                    multiple={true}
                    accept="image/*"
                    folder="home/testimonials"
                  />
                </div>
              </div>
            </div>

            <AdminEditorStrip title="Our Successful Clients Video" />
            <div className="px-5 py-6 md:px-6">
              <div>
                <AdminEditorLabel>Select a Video</AdminEditorLabel>
                <div className="mt-3 rounded-[18px] border-2 border-[#9eb8e3] p-3 dark:border-[#5d7fb3]">
                  <MediaLibraryPicker
                    value={data.testimonialsVideoUrl}
                    onChange={handleVideoChange}
                    onValidationStateChange={(warning) => setMediaWarning("Select a Video", warning)}
                    multiple={false}
                    accept="video/*"
                    folder="home/testimonials-video"
                  />
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
