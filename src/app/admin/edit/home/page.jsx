"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import Image from "next/image";
import MediaLibraryPicker from "@/components/MediaLibraryPicker";
import { useRouter } from "next/navigation";

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

  const handleImageChange = (val) => {
    // Only allow images (not videos)
    const invalid = Array.isArray(val)
      ? val.some(v => v && v.match(/\.mp4$/i))
      : val && val.match(/\.mp4$/i);
    if (invalid) {
      setMessage("Error: Only image files are allowed in the Images section.");
      return;
    }
    handleChange("heroImages", val);
  };

  const handleTestimonialImagesChange = (val) => {
    const invalid = Array.isArray(val)
      ? val.some(v => v && v.match(/\.mp4$/i))
      : val && val.match(/\.mp4$/i);
    if (invalid) {
      setMessage("Error: Only image files are allowed in the Testimonials Images section.");
      return;
    }
    handleChange("testimonialsImages", val);
  };

  const handleVideoChange = (val) => {
    if (!val || !val.match(/\.mp4$/i)) {
      setMessage("Error: Only MP4 video files are allowed in the Video section.");
      return;
    }
    handleChange("testimonialsVideoUrl", val);
  };

  const router = useRouter();

  if (loading || !data) return <div className="p-8 text-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-red-600 to-blue-900 flex flex-col items-center py-12">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">Edit Homepage</h1>
        <form onSubmit={handleSave} className="space-y-8">
          {/* Hero Section */}
          <section>
            <h2 className="text-xl font-bold mb-2 text-blue-600">Hero Section</h2>
            <label className="block mb-1 font-medium text-blue-700">Hero Images</label>
            <MediaLibraryPicker
              value={data.heroImages}
              onChange={handleImageChange}
              multiple={true}
              accept="image/*"
            />
          </section>
          {/* About Section (static, not editable) */}
          <section>
            <h2 className="text-xl font-bold mb-2 text-blue-600">About Section</h2>
            <div className="text-gray-500 italic">This section uses static content.</div>
          </section>
          {/* Services Section (static, not editable) */}
          <section>
            <h2 className="text-xl font-bold mb-2 text-blue-600">Services Section</h2>
            <div className="text-gray-500 italic">This section uses static content.</div>
          </section>
          {/* Testimonials Section */}
          <section>
            <h2 className="text-xl font-bold mb-2 text-blue-600">Testimonials Section</h2>
            <label className="block mb-1 font-medium text-blue-700">Images</label>
            <MediaLibraryPicker
              value={data.testimonialsImages}
              onChange={handleTestimonialImagesChange}
              multiple={true}
              accept="image/*"
            />
            <label className="block mb-1 font-medium mt-4 text-blue-700">Video</label>
            <MediaLibraryPicker
              value={data.testimonialsVideoUrl}
              onChange={handleVideoChange}
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
      <div className="absolute top-40 left-6 z-10">
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="px-4 py-2 rounded bg-red-600 text-white font-bold hover:bg-red-700 transition"
        >
          ← Back
        </button>
      </div>
    </main>
  );
}
