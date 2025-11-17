"use client";
import { useEffect, useState } from "react";

export default function RequirementsAdminPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ title: "", description: "", isRequired: true, icon: "", order: 0 });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/requirements", { cache: "no-store" });
      if (res.ok) setItems(await res.json()); else setMsg("Failed to load");
    } catch { setMsg("Failed to load"); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function createItem(e) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const payload = { ...form, order: Number(form.order) || 0, icon: form.icon || null };
      const res = await fetch("/api/requirements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setItems((prev) => [...prev, json].sort((a,b)=>a.order-b.order));
      setForm({ title: "", description: "", isRequired: true, icon: "", order: 0 });
    } catch (e) { setMsg(e.message); }
    setSaving(false);
  }

  async function updateItem(id, patch) {
    try {
      const res = await fetch(`/api/requirements/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setItems((prev) => prev.map((it) => (it.id === id ? json : it)).sort((a,b)=>a.order-b.order));
    } catch (e) { setMsg(e.message); }
  }

  async function removeItem(id) {
    if (!confirm("Delete this requirement?")) return;
    try {
      const res = await fetch(`/api/requirements/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (e) { setMsg(e.message); }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-red-600 to-blue-900 flex flex-col items-center py-10">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-blue-700">Requirements</h1>
          <a href="/admin/applications" className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700">← Applications</a>
        </div>
        {msg && <div className="mb-4 text-sm text-red-600">{msg}</div>}
        <form onSubmit={createItem} className="mb-6 grid gap-3 md:grid-cols-5">
          <input className="border rounded px-3 py-2 md:col-span-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="border rounded px-3 py-2 md:col-span-2" placeholder="Icon (optional URL)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
          <input className="border rounded px-3 py-2" type="number" placeholder="Order" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
          <textarea className="border rounded px-3 py-2 md:col-span-5" placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={form.isRequired} onChange={(e) => setForm({ ...form, isRequired: e.target.checked })} /> Required
          </label>
          <button disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 md:col-span-3">Create Requirement</button>
        </form>
        {loading ? <div className="text-center py-6">Loading…</div> : (
          <ul className="grid gap-4 md:grid-cols-2">
            {items.map((it) => (
              <li key={it.id} className="border rounded p-4 bg-white shadow">
                <div className="flex justify-between items-start mb-2">
                  <input
                    className="font-semibold text-lg flex-1 mr-2 border-b focus:outline-none"
                    value={it.title}
                    onChange={(e) => updateItem(it.id, { title: e.target.value })}
                  />
                  <button onClick={() => removeItem(it.id)} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300">🗑️</button>
                </div>
                <div className="flex gap-2 text-xs mb-2">
                  <label className="flex items-center gap-1">
                    <input type="checkbox" checked={it.isRequired} onChange={(e) => updateItem(it.id, { isRequired: e.target.checked })} /> Required
                  </label>
                  <input
                    className="border-b focus:outline-none flex-1"
                    value={it.icon || ""}
                    placeholder="Icon URL"
                    onChange={(e) => updateItem(it.id, { icon: e.target.value || null })}
                  />
                  <input
                    className="border-b w-16 focus:outline-none"
                    type="number"
                    value={it.order}
                    onChange={(e) => updateItem(it.id, { order: Number(e.target.value) || 0 })}
                  />
                </div>
                <textarea
                  className="text-sm w-full border rounded px-2 py-1 focus:outline-none"
                  rows={5}
                  value={it.description}
                  onChange={(e) => updateItem(it.id, { description: e.target.value })}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
