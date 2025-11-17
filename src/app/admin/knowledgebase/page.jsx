"use client";
import { useEffect, useState } from "react";

export default function KnowledgebaseAdminListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [deletingId, setDeletingId] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/knowledgebase", { cache: "no-store" });
      if (res.ok) setItems(await res.json()); else setMsg("Failed to load");
    } catch { setMsg("Failed to load"); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function removeItem(id) {
    if (!confirm("Delete this item?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/knowledgebase/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (e) { setMsg(e.message); }
    setDeletingId("");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-red-600 to-blue-900 flex flex-col items-center py-10">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-blue-700">Knowledgebase Items</h1>
          <div className="flex gap-2">
            <a href="/admin/knowledgebase/create" className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700">+ New</a>
            <a href="/admin/applications" className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700">Applications</a>
          </div>
        </div>
        {msg && <div className="mb-4 text-sm text-red-600">{msg}</div>}
        {loading ? <div className="text-center py-6">Loading…</div> : (
          <table className="w-full text-sm border">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="p-2 border">Title</th>
                <th className="p-2 border">Category</th>
                <th className="p-2 border">Updated</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="hover:bg-gray-50">
                  <td className="p-2 border font-medium">{it.title}</td>
                  <td className="p-2 border text-blue-700">{it.category}</td>
                  <td className="p-2 border text-xs text-gray-600">{new Date(it.updatedAt).toLocaleString()}</td>
                  <td className="p-2 border">
                    <a href={`/admin/knowledgebase/${it.id}/edit`} className="px-2 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300 mr-2 inline-block">Edit</a>
                    <button disabled={deletingId === it.id} onClick={() => removeItem(it.id)} className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">Delete</button>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">No items yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
