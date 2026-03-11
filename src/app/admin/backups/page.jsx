"use client";

import { useState } from "react";

export default function BackupsPage() {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function onImport(e) {
    e.preventDefault();
    const file = e.target.elements.file.files[0];
    if (!file) return setMsg("Please choose a backup ZIP file.");
    setBusy(true);
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/backup/import", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.success) {
        setMsg(`Imported ${json.entriesCreated} entries and ${json.filesUploaded} files.`);
      } else {
        setMsg(json?.error || "Import failed");
      }
    } catch {
      setMsg("Import failed");
    }
    setBusy(false);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-red-600 to-blue-900 flex flex-col items-center py-10">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Backups</h1>
        {msg && <div className="mb-4 text-sm text-blue-700">{msg}</div>}

        <div className="space-y-3 mb-8">
          <a
            className="block w-full text-center px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
            href="/api/backup/generate?mode=full"
          >
            Download Full Backup (ZIP)
          </a>
          <a
            className="block w-full text-center px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
            href="/api/backup/generate?mode=today"
          >
            Download Today's Backup (ZIP)
          </a>
        </div>

        <form onSubmit={onImport} className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Import Backup (ZIP)</label>
          <input type="file" name="file" accept="application/zip" className="block w-full" />
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60"
          >
            {busy ? "Importing…" : "Import Backup"}
          </button>
        </form>
      </div>
    </main>
  );
}
