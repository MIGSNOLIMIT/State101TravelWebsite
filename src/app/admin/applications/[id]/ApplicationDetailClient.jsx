"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { APPLICATION_STATUS_OPTIONS } from "@/lib/application-status";

export default function ApplicationDetailClient() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/application/${id}`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setItem(json);
      } else {
        const err = await res.json().catch(() => ({}));
        setMsg(err?.error || "Failed to load");
      }
    } catch {
      setMsg("Failed to load");
    }
    setLoading(false);
  }

  useEffect(() => {
    if (id) load();
  }, [id]);

  const onChangeStatus = async (status) => {
    try {
      const res = await fetch(`/api/application/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setItem((prev) => ({ ...prev, status }));
      } else {
        const err = await res.json().catch(() => ({}));
        setMsg(err?.error || "Failed to update status");
      }
    } catch {
      setMsg("Failed to update status");
    }
  };

  const onDeleteEntry = async () => {
    if (!confirm("Delete this application? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/application/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin/applications");
      } else {
        const err = await res.json().catch(() => ({}));
        setMsg(err?.error || "Failed to delete");
      }
    } catch {
      setMsg("Failed to delete");
    }
  };

  const onDeleteFile = async (fileId) => {
    if (!confirm("Remove this file?")) return;
    try {
      const res = await fetch(`/api/application/file?id=${fileId}`, { method: "DELETE" });
      if (res.ok) {
        setItem((prev) => ({ ...prev, files: prev.files.filter((f) => f.id !== fileId) }));
      } else {
        const err = await res.json().catch(() => ({}));
        setMsg(err?.error || "Failed to delete file");
      }
    } catch {
      setMsg("Failed to delete file");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!item) return <div className="p-8 text-center">Not found</div>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-red-600 to-blue-900 flex flex-col items-center py-10">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-blue-700">Application Details</h1>
          <button
            onClick={() => router.push("/admin/applications")}
            className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700"
          >
            ← Back
          </button>
        </div>
        {msg && <div className="mb-4 text-red-600">{msg}</div>}

        <div className="rounded-lg border shadow bg-white">
          <div className="bg-blue-700 text-white px-4 py-2 rounded-t-lg">Applicant</div>
          <div className="p-4 text-sm">
            <div className="text-lg font-bold mb-1">{item.fullName}</div>
            <div className="mb-1">Email: <span className="font-semibold">{item.email}</span></div>
            <div className="mb-1">Phone Number: <span className="font-semibold">{item.phone}</span></div>
            <div className="mb-3">Address: <span className="font-semibold">{item.address}</span></div>
            <div className="flex justify-between mb-1">
              <div>Visa Type: <span className="font-semibold">{item.visaType}</span></div>
              <div>Age: <span className="font-semibold">{item.age}</span></div>
            </div>
            <div className="flex justify-between mb-4">
              <div>Available Time: <span className="font-semibold">{item.availableTime}</span></div>
              <div>Available Day: <span className="font-semibold">{item.availableDay}</span></div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={item.status}
                onChange={(e) => onChangeStatus(e.target.value)}
                className="border rounded px-3 py-2"
              >
                {APPLICATION_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <button onClick={onDeleteEntry} className="ml-auto px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Delete</button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold text-blue-700 mb-3">Files</h2>
          {item.files?.length ? (
            <ul className="grid gap-3">
              {item.files.map((f) => (
                <li key={f.id} className="flex items-center justify-between border rounded p-3">
                  <div className="flex items-center gap-3">
                    {f.fileType?.startsWith("image/") ? (
                      <img src={f.fileUrl} alt="file" className="h-12 w-12 object-cover rounded" />
                    ) : (
                      <span className="h-12 w-12 flex items-center justify-center bg-gray-100 rounded">DOC</span>
                    )}
                    <a href={`/api/application/file/${f.id}/signed`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Download</a>
                  </div>
                  <button onClick={() => onDeleteFile(f.id)} className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300">Delete</button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-600">No files uploaded.</div>
          )}
        </div>
        <div className="mt-6 flex">
          <a href={`/api/application/${id}/zip`} className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Download ZIP</a>
        </div>
      </div>
    </main>
  );
}