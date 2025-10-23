"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import Image from "next/image";
import MediaLibraryPicker from "@/components/MediaLibraryPicker";

export default function EditHomePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await fetch("/api/admin/homepage");
      const json = await res.json();
      setData(json);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/homepage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) setMessage("Homepage updated!");
    else setMessage("Error saving changes.");
    setSaving(false);
  };

  if (loading || !data) return <div className="p-8 text-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-red-600 to-blue-900 flex flex-col items-center py-12">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">Edit Homepage</h1>
        <form onSubmit={handleSave} className="space-y-8">
          {/* Hero Section */}
          <section>
            <h2 className="text-xl font-bold mb-2 text-blue-600">Hero Section</h2>
            <label className="block mb-1 font-medium">Title</label>
            <input
              type="text"
              value={data.heroTitle || ""}
              onChange={e => handleChange("heroTitle", e.target.value)}
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="Hero Title"
            />
            <label className="block mb-1 font-medium">Description</label>
            <input
              type="text"
              value={data.heroDesc || ""}
              onChange={e => handleChange("heroDesc", e.target.value)}
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="Hero Description"
            />
            <label className="block mb-1 font-medium">Hero Images</label>
            <MediaLibraryPicker
              value={data.heroImages}
              onChange={val => handleChange("heroImages", val)}
              multiple={true}
              accept="image/*"
            />
          </section>
          {/* About Section */}
          <section>
            <h2 className="text-xl font-bold mb-2 text-blue-600">About Section</h2>
            <label className="block mb-1 font-medium">Title</label>
            <input
              type="text"
              value={data.aboutTitle || ""}
              onChange={e => handleChange("aboutTitle", e.target.value)}
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="About Title"
            />
            <label className="block mb-1 font-medium">Description</label>
            <input
              type="text"
              value={data.aboutDesc || ""}
              onChange={e => handleChange("aboutDesc", e.target.value)}
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="About Description"
            />
          </section>
          {/* Services Section */}
          <section>
            <h2 className="text-xl font-bold mb-2 text-blue-600">Services Section</h2>
            <label className="block mb-1 font-medium">Title</label>
            <input
              type="text"
              value={data.servicesTitle || ""}
              onChange={e => handleChange("servicesTitle", e.target.value)}
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="Services Title"
            />
          </section>
          {/* Testimonials Section */}
          <section>
            <h2 className="text-xl font-bold mb-2 text-blue-600">Testimonials Section</h2>
            <label className="block mb-1 font-medium">Title</label>
            <input
              type="text"
              value={data.testimonialsTitle || ""}
              onChange={e => handleChange("testimonialsTitle", e.target.value)}
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="Testimonials Title"
            />
            <label className="block mb-1 font-medium">Images</label>
            <MediaLibraryPicker
              value={data.testimonialsImages}
              onChange={val => handleChange("testimonialsImages", val)}
              multiple={true}
              accept="image/*"
            />
            <label className="block mb-1 font-medium mt-4">Video</label>
            <MediaLibraryPicker
              value={data.testimonialsVideoUrl}
              onChange={val => handleChange("testimonialsVideoUrl", val)}
              multiple={false}
              accept="video/*"
            />
          </section>
          <button type="submit" disabled={saving} className="w-full py-3 rounded bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold hover:from-blue-700 hover:to-red-700 transition">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {message && <div className="mt-4 text-center text-blue-600">{message}</div>}
        </form>
      </div>
    </main>
  );
}
