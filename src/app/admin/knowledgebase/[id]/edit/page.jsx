"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function KnowledgebaseEditPage() {
  const params = useParams();
  const id = params?.id;
  const [item, setItem] = useState(null);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (id) load(); }, [id]);

  async function load() {
    setLoading(true); setMsg("");
    try {
      const res = await fetch("/api/knowledgebase", { cache: "no-store" });
      if (res.ok) {
        const all = await res.json();
        const found = all.find((x) => x.id === id);
        if (!found) setMsg("Item not found"); else setItem(found);
      } else setMsg("Failed to load");
    } catch { setMsg("Failed to load"); }
    setLoading(false);
  }

  async function save(e) {
    e.preventDefault();
    if (!item) return;
    setSaving(true); setMsg("");
    try {
      const res = await fetch(`/api/knowledgebase/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: item.title, category: item.category, content: item.content }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setItem(json);
      setMsg("Saved.");
    } catch (e) { setMsg(e.message); }
    setSaving(false);
  }

  async function remove() {
    if (!confirm("Delete this item?")) return;
    setDeleting(true); setMsg("");
    try {
      const res = await fetch(`/api/knowledgebase/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      window.location.href = "/admin/knowledgebase";
    } catch (e) { setMsg(e.message); }
    setDeleting(false);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-red-600 to-blue-900 flex flex-col items-center py-10">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-blue-700">Edit Knowledgebase Item</h1>
          <div className="flex gap-2">
            <a href="/admin/knowledgebase" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">← List</a>
            <a href="/admin/applications" className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">Applications</a>
            <button onClick={remove} disabled={deleting} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">Delete</button>
          </div>
        </div>
        {loading && <div className="py-6 text-center">Loading…</div>}
        {msg && <div className="mb-4 text-sm text-red-600">{msg}</div>}
        {item && !loading && (
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Title</label>
              <input required className="border rounded w-full px-3 py-2" value={item.title} onChange={(e) => setItem({ ...item, title: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Category</label>
              <input required className="border rounded w-full px-3 py-2" value={item.category} onChange={(e) => setItem({ ...item, category: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Content</label>
              <textarea required rows={14} className="border rounded w-full px-3 py-2" value={item.content} onChange={(e) => setItem({ ...item, content: e.target.value })} />
            </div>
            <div className="flex items-center gap-4">
              <button disabled={saving} className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
              <span className="text-xs text-gray-500">Updated: {new Date(item.updatedAt).toLocaleString()}</span>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}