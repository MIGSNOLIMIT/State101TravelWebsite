"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";
import MediaLibraryPicker from "@/components/MediaLibraryPicker";

export const dynamic = 'force-dynamic';

export default function EditServicesPage() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

    useEffect(() => {
      async function fetchPage() {
        setLoading(true);
        const res = await fetch("/api/admin/services-page");
        const json = await res.json();
        setPage(json);
        setLoading(false);
      }
      fetchPage();
    }, []);

    const handleChange = (field, value) => {
      setPage((prev) => ({ ...prev, [field]: value }));
    };
    const handleSectionChange = (idx, field, value) => {
      setPage((prev) => ({
        ...prev,
        sections: prev.sections.map((s, i) => i === idx ? { ...s, [field]: value } : s)
      }));
    };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/services-page", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(page),
    });
    if (res.ok) setMessage("Services page updated!");
    else setMessage("Error saving changes.");
    setSaving(false);
  };

  if (loading || !page) return <div className="p-8 text-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-red-600 to-blue-900 flex flex-col items-center py-12">
      <div className="absolute top-40 left-6 z-10">
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="px-4 py-2 rounded bg-red-600 text-white font-bold hover:bg-red-700 transition"
        >
          ← Back
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">Edit Services Page</h1>
        <form onSubmit={handleSave} className="space-y-8">
          {/* Hero Section */}
          <section className="border-b pb-6 mb-6">
            <label className="block mb-1 font-medium">Hero Image</label>
            <MediaLibraryPicker
              value={page.heroImageUrl || ""}
              onChange={url => handleChange("heroImageUrl", url)}
              accept="image/*"
            />
            {page.heroImageUrl && <Image src={page.heroImageUrl} alt="Hero" width={80} height={40} className="mb-2" />}
            <label className="block mb-1 font-medium">Hero Title</label>
            <input
              type="text"
              value={page.heroTitle || ""}
              onChange={e => handleChange("heroTitle", e.target.value)}
              className="w-full px-4 py-2 border rounded mb-3 bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-900 dark:text-white dark:placeholder-gray-300"
              placeholder="Hero Title"
            />
            <label className="block mb-1 font-medium">Hero Description</label>
            <textarea
              value={page.heroDesc || ""}
              onChange={e => {
                const words = e.target.value.trim().split(/\s+/);
                if (words.length <= 40) {
                  handleChange("heroDesc", e.target.value);
                } else {
                  handleChange("heroDesc", words.slice(0, 40).join(" "));
                }
              }}
              className="w-full px-4 py-2 border rounded bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-900 dark:text-white dark:placeholder-gray-300 min-h-[120px] resize-vertical"
              placeholder="Hero Description (max 40 words)"
              rows={5}
            />
            <div className="text-right text-sm text-gray-500">{page.heroDesc ? page.heroDesc.trim().split(/\s+/).length : 0}/40 words</div>
          </section>
          {/* Alternating Sections */}
          {page.sections?.map((section, idx) => (
            <section key={section.id || idx} className="border-b pb-6 mb-6">
              <label className="block mb-1 font-medium">Section Image URL</label>
              <input
                type="text"
                value={section.iconUrl || ""}
                onChange={e => handleSectionChange(idx, "iconUrl", e.target.value)}
                className="w-full px-4 py-2 border rounded mb-3"
                placeholder="Section Image URL"
              />
              {section.iconUrl && <Image src={section.iconUrl} alt="Section" width={80} height={40} className="mb-2" />}
              <label className="block mb-1 font-medium">Section Title</label>
              <input
                type="text"
                value={section.title || ""}
                onChange={e => handleSectionChange(idx, "title", e.target.value)}
                className="w-full px-4 py-2 border rounded mb-3"
                placeholder="Section Title"
              />
              <label className="block mb-1 font-medium">Section Description</label>
              <input
                type="text"
                value={section.description || ""}
                onChange={e => handleSectionChange(idx, "description", e.target.value)}
                className="w-full px-4 py-2 border rounded mb-3"
                placeholder="Section Description"
              />
              <label className="block mb-1 font-medium">Button Label</label>
              <input
                type="text"
                value={section.buttonLabel || ""}
                onChange={e => handleSectionChange(idx, "buttonLabel", e.target.value)}
                className="w-full px-4 py-2 border rounded mb-3"
                placeholder="Button Label"
              />
              <label className="block mb-1 font-medium">Button Link</label>
              <input
                type="text"
                value={section.buttonLink || ""}
                onChange={e => handleSectionChange(idx, "buttonLink", e.target.value)}
                className="w-full px-4 py-2 border rounded"
                placeholder="Button Link (URL)"
              />
            </section>
          ))}
          <button type="submit" disabled={saving} className="w-full py-3 rounded bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold hover:from-blue-700 hover:to-red-700 transition">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {message && <div className="mt-4 text-center text-blue-600">{message}</div>}
        </form>
      </div>
    </main>
  );
}
