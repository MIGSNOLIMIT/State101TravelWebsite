"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";

export default function EditTopBar() {
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let didCancel = false;
    async function fetchData() {
      setLoading(true);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const res = await fetch("/api/admin/topbar", { signal: controller.signal });
        clearTimeout(timeout);
        if (!didCancel && res.ok) {
          const json = await res.json();
          setAddress(json.address || "");
          setPhone(json.phone || "");
          setEmail(json.email || "");
        }
      } catch (err) {
        if (!didCancel) setMessage("Error loading data");
      }
      setLoading(false);
    }
    fetchData();
    return () => { didCancel = true; };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/topbar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, phone, email }),
    });
    if (res.ok) setMessage("Top bar updated!");
    else setMessage("Error saving changes.");
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-red-600 to-blue-900 flex flex-col items-center py-12">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl">
        <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">Edit Top Bar</h1>
        <form onSubmit={handleSave} className="space-y-8">
          <section>
            <label className="block mb-1 font-medium text-blue-700">Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-4 py-2 border rounded mb-3 bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-900 dark:text-white dark:placeholder-gray-300"
              placeholder="Enter address"
            />
          </section>
          <section>
            <label className="block mb-1 font-medium text-blue-700">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-2 border rounded mb-3 bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-900 dark:text-white dark:placeholder-gray-300"
              placeholder="Enter phone number"
            />
          </section>
          <section>
            <label className="block mb-1 font-medium text-blue-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded mb-3 bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-900 dark:text-white dark:placeholder-gray-300"
              placeholder="Enter email address"
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
