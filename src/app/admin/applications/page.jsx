"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteApplication } from "@/lib/application";

const STATUS_OPTIONS = [
  { value: "NEW", label: "New", color: "bg-green-500" },
  { value: "IN_REVIEW", label: "In Review", color: "bg-orange-500" },
  { value: "DECLINED", label: "Declined", color: "bg-red-600" },
];

function statusClasses(status) {
  switch (status) {
    case "NEW":
      return { dot: "bg-green-500", badge: "text-green-700", button: "bg-blue-600" };
    case "IN_REVIEW":
      return { dot: "bg-orange-500", badge: "text-orange-700", button: "bg-blue-600" };
    case "DECLINED":
      return { dot: "bg-red-600", badge: "text-red-700", button: "bg-gray-500" };
    default:
      return { dot: "bg-gray-400", badge: "text-gray-700", button: "bg-blue-600" };
  }
}

export default function ApplicationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const router = useRouter();
  const importInputRef = useRef(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/application/list", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (!ignore) setItems(json);
        } else {
          setMsg("Failed to load applications");
        }
      } catch (e) {
        setMsg("Failed to load applications");
      }
      setLoading(false);
    }
    load();
    return () => { ignore = true; };
  }, []);

  const onImportBackup = async (file) => {
    if (!file) return;
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/backup/import", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.success) {
        setMsg(`Imported ${json.entriesCreated ?? 0} created, ${json.entriesMatched ?? 0} matched, ${json.filesUploaded ?? 0} files.`);
        // Reload list after import
        const list = await fetch("/api/application/list", { cache: "no-store" });
        if (list.ok) setItems(await list.json());
      } else {
        setMsg(json?.error || "Import failed");
      }
    } catch {
      setMsg("Import failed");
    }
  };

  const onChangeStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/application/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status } : it)));
      } else {
        const err = await res.json().catch(() => ({}));
        setMsg(err?.error || "Failed to update status");
      }
    } catch {
      setMsg("Failed to update status");
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this application? This cannot be undone.")) return;
    try {
      await deleteApplication(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (e) {
      setMsg(e.message);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-red-600 to-blue-900 flex flex-col items-center py-10">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-blue-700">Applications</h1>
          {msg && <div className="text-sm text-red-600">{msg}</div>}
        </div>
        <div className="flex justify-end mb-4 gap-3">
          <a
            href="/api/backup/generate?mode=full"
            className="px-4 py-2 rounded bg-purple-600 text-white font-semibold hover:bg-purple-700"
            title="Download full backup"
          >
            Backup (ZIP)
          </a>
          <button
            onClick={() => importInputRef.current?.click()}
            className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700"
            title="Import a backup ZIP"
          >
            Import Backup
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/zip"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImportBackup(f);
              e.target.value = "";
            }}
          />
          <a href="/admin/backups" className="px-4 py-2 rounded bg-gray-100 text-gray-800 hover:bg-gray-200" title="Open backups page">More…</a>
        </div>
        {loading ? (
          <div className="p-6 text-center">Loading…</div>
        ) : (
          <div className="overflow-y-auto" style={{ maxHeight: "85vh" }}>
            <div className="grid gap-6 md:grid-cols-2">
              {items.map((it, idx) => {
                const cls = statusClasses(it.status);
                const num = String(idx + 1).padStart(2, "0");
                const hasFiles = (it._count?.files || 0) > 0;
                return (
                  <div key={it.id} className="rounded-lg border shadow bg-white">
                    <div className="bg-blue-700 text-white px-4 py-2 rounded-t-lg flex items-center justify-between">
                      <span>Applicant {num}</span>
                      <span className={`h-3 w-3 rounded-full ${cls.dot}`} />
                    </div>
                    <div className="p-4 text-sm">
                      <div className="text-lg font-bold mb-1">{it.fullName}</div>
                      <div className="mb-1">Email: <span className="font-semibold">{it.email}</span></div>
                      <div className="mb-1">Phone Number: <span className="font-semibold">{it.phone}</span></div>
                      <div className="mb-3">Address: <span className="font-semibold">{it.address}</span></div>
                      <div className="flex justify-between mb-1">
                        <div>Visa Type: <span className="font-semibold">{it.visaType}</span></div>
                        <div>Age: <span className="font-semibold">{it.age}</span></div>
                      </div>
                      <div className="flex justify-between mb-4">
                        <div>Available Time: <span className="font-semibold">{it.availableTime}</span></div>
                        <div>Available Day: <span className="font-semibold">{it.availableDay}</span></div>
                      </div>

                      <div className="flex items-center gap-3">
                        {hasFiles ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => router.push(`/admin/applications/${it.id}`)}
                              className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
                            >
                              View / Manage
                            </button>
                            <a
                              href={`/api/application/${it.id}/zip`}
                              className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                            >
                              ZIP
                            </a>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button className="px-4 py-2 rounded bg-red-600 text-white font-semibold" disabled>
                              No Files Available
                            </button>
                            <a
                              href={`/api/application/${it.id}/zip`}
                              className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                              title="Download application info as ZIP"
                            >
                              ZIP
                            </a>
                          </div>
                        )}
                        <div className="ml-auto flex items-center gap-2">
                          <select
                            value={it.status}
                            onChange={(e) => onChangeStatus(it.id, e.target.value)}
                            className="border rounded px-3 py-2"
                          >
                            {STATUS_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => onDelete(it.id)}
                            className="px-3 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
