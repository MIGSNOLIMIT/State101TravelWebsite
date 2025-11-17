"use client";
import { useState } from "react";

export default function KnowledgebaseCreatePage() {
  const [form, setForm] = useState({ title: "", category: "", content: "" });
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSaving(true); setMsg("");
    try {
      const res = await fetch("/api/knowledgebase", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      window.location.href = `/admin/knowledgebase/${json.id}/edit`;
    } catch (e) { setMsg(e.message); }
    setSaving(false);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-red-600 to-blue-900 flex flex-col items-center py-10">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-blue-700">Create Knowledgebase Item</h1>
          <div className="flex gap-2">
            <a href="/admin/knowledgebase" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">← List</a>
            <a href="/admin/applications" className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Applications</a>
          </div>
        </div>
        {msg && <div className="mb-4 text-sm text-red-600">{msg}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Title</label>
            <input required className="border rounded w-full px-3 py-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Category</label>
            <input required className="border rounded w-full px-3 py-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Content</label>
            <textarea required rows={10} className="border rounded w-full px-3 py-2" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>
          <button disabled={saving} className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50">{saving ? "Saving..." : "Create"}</button>
        </form>
      </div>
    </main>
  );
}