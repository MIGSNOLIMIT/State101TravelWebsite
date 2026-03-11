"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MediaLibraryPicker from "@/components/MediaLibraryPicker";
import ConfirmDialog from "@/components/ConfirmDialog";

export const dynamic = 'force-dynamic';

export default function EditAboutPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let didCancel = false;
    async function fetchData() {
      setLoading(true);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const url = process.env.NEXT_PUBLIC_SITE_URL
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/aboutpage`
          : '/api/aboutpage';
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        if (!didCancel && res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        if (!didCancel) setMessage("Error loading data");
      }
      setLoading(false);
    }
    fetchData();
    return () => { didCancel = true; };
  }, []);

  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const doSave = async () => {
    setPendingSave(true);
    const url = process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/aboutpage`
      : '/api/aboutpage';
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) setMessage("About page updated!");
    else setMessage("Error saving changes.");
    setPendingSave(false);
    setSaving(false);
    setConfirmOpen(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const emptyHero = !data?.heroImageUrl;
    if (emptyHero) {
      setConfirmOpen(true);
      return;
    }
    await doSave();
  };

  if (loading || !data) return <div className="p-8 text-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-red-600 to-blue-900 flex flex-col items-center py-12">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">Edit About Page  Image Banner</h1>
        <form onSubmit={handleSave} className="space-y-8">
          <section>
            <label className="block mb-1 font-medium">Header Banner Image</label>
            <MediaLibraryPicker
              value={data.heroImageUrl || ""}
              onChange={val => {
                const selected = Array.isArray(val) ? val[0] || "" : val || "";
                handleChange("heroImageUrl", selected);
              }}
              multiple={false}
              accept="image/*"
            />
            {data.heroImageUrl && (
              <div className="mt-2">
                {/* Only render if heroImageUrl is a valid URL */}
                {/https?:\/\//.test(data.heroImageUrl) ? (
                  <Image src={data.heroImageUrl} alt="Hero Banner" width={300} height={120} className="rounded" />
                ) : (
                  <div className="text-gray-500 italic">No valid image selected</div>
                )}
              </div>
            )}
          </section>
          <button type="submit" disabled={saving} className="w-full py-3 rounded bg-gradient-to-r from-blue-600 to-red-600 text-white font-bold hover:from-blue-700 hover:to-red-700 transition">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {message && <div className="mt-4 text-center text-blue-600">{message}</div>}
        </form>
        <ConfirmDialog
          open={confirmOpen}
          title="Save with empty hero image?"
          message="The About page hero image is empty. Are you sure you want to save with no hero image?"
          confirmText={pendingSave ? "Saving..." : "Save anyway"}
          cancelText="Cancel"
          onCancel={() => { setConfirmOpen(false); setSaving(false); }}
          onConfirm={doSave}
        />
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
