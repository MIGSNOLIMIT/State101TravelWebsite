"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";

export default function EditHeaderLogo() {
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await fetch("/api/admin/header");
      if (res.ok) {
        const json = await res.json();
        setLogoUrl(json.logoUrl || "");
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/header", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoUrl }),
    });
    if (res.ok) setMessage("Header logo updated!");
    else setMessage("Error saving changes.");
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-red-600 to-blue-900 flex flex-col items-center py-12">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl">
        <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">Edit Header Logo</h1>
        <form onSubmit={handleSave} className="space-y-8">
          <section>
            <label className="block mb-1 font-medium">Logo URL</label>
            <input
              type="text"
              value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
              className="w-full px-4 py-2 border rounded mb-3"
              placeholder="Paste logo URL here"
            />
            {logoUrl && (
              <div className="mt-4 flex justify-center">
                <img src={logoUrl} alt="Header Logo" className="h-24 w-24 object-contain rounded-full border" />
              </div>
            )}
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
