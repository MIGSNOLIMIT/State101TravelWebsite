"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Archive, ArrowLeft, Download, RotateCcw } from "lucide-react";
import AdminShell from "@/app/admin/components/AdminShell";
import ConfirmDialog from "@/components/ConfirmDialog";
import { formatBirthdate } from "@/lib/application-age";
import { getApplicationStatusLabel } from "@/lib/application-status";
import { archiveApplication, restoreApplication } from "@/lib/application";
import { getApplicationVisaLabel } from "@/lib/application-visa";

function formatDate(date) {
  if (!date) return "Unknown";
  return new Date(date).toLocaleString();
}

const STATUS_BADGE_CLASSES = {
  NEW: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100",
  IN_REVIEW: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-200",
  SCHEDULED: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-200",
  APPROVED: "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-200",
  PENDING: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-200",
};

function DetailField({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-800 dark:text-slate-100">{value || "-"}</p>
    </div>
  );
}

export default function ApplicationDetailClient({ initialUserName, initialRole }) {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);

  const load = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    if (id) load();
  }, [id, load]);

  const onArchiveEntry = async () => {
    try {
      const result = await archiveApplication(id);
      setItem((prev) => ({ ...prev, archivedAt: result?.item?.archivedAt || new Date().toISOString() }));
      setMsg("Application archived.");
    } catch {
      setMsg("Failed to archive");
    }
  };

  const onRestoreEntry = async () => {
    try {
      const result = await restoreApplication(id);
      setItem((prev) => ({ ...prev, ...result, archivedAt: null }));
      setMsg("Application restored.");
    } catch {
      setMsg("Failed to restore");
    }
  };

  return (
    <AdminShell title="Application Details" userName={initialUserName} role={initialRole}>
      {loading ? (
        <div className="rounded-[28px] border-2 border-[#9eb8e3] bg-white px-6 py-16 text-center text-sm text-slate-500 shadow-[0_18px_40px_rgba(15,23,42,0.14)] dark:border-[#5d7fb3] dark:bg-slate-900 dark:text-slate-300">
          Loading application details...
        </div>
      ) : !item ? (
        <div className="rounded-[28px] border-2 border-[#9eb8e3] bg-white px-6 py-16 text-center text-sm text-slate-500 shadow-[0_18px_40px_rgba(15,23,42,0.14)] dark:border-[#5d7fb3] dark:bg-slate-900 dark:text-slate-300">
          Application not found.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/applications")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#164896] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#103773]"
            >
              <ArrowLeft size={16} />
              Back to Applications
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold tracking-[0.16em]",
                  STATUS_BADGE_CLASSES[item.status] || STATUS_BADGE_CLASSES.NEW,
                ].join(" ")}
              >
                {getApplicationStatusLabel(item.status)}
              </span>
              {item.archivedAt ? (
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-white dark:bg-slate-700">
                  Archived
                </span>
              ) : null}
              <a
                href={`/api/application/${id}/zip`}
                className="inline-flex items-center gap-2 rounded-xl border border-[#cbd5e1] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-[#4d6f9f] dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                <Download size={16} />
                Download ZIP
              </a>
              {item.archivedAt ? (
                <button
                  type="button"
                  onClick={onRestoreEntry}
                  className="inline-flex items-center gap-2 rounded-xl border border-green-300 bg-white px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-50 dark:border-green-500/50 dark:bg-slate-900 dark:text-green-300 dark:hover:bg-green-950/40"
                >
                  <RotateCcw size={16} />
                  Restore Application
                </button>
              ) : item.status !== "IN_REVIEW" && item.status !== "APPROVED" ? (
                <button
                  type="button"
                  onClick={() => setArchiveConfirmOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-[#4d6f9f] dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                >
                  <Archive size={16} />
                  Archive Application
                </button>
              ) : null}
            </div>
          </div>

          {msg ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-200">
              {msg}
            </div>
          ) : null}

          <section className="overflow-hidden rounded-[28px] border-2 border-[#9eb8e3] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)] dark:border-[#5d7fb3] dark:bg-slate-900">
            <div className="border-b-2 border-[#b8cae8] bg-[#f7f9fc] px-5 py-5 dark:border-[#4d6f9f] dark:bg-slate-950 md:px-6">
              <h2 className="text-2xl font-semibold text-[#143f88] dark:text-blue-300">Applicant</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">View submitted information and uploaded files for this application.</p>
            </div>

            <div className="px-5 py-6 md:px-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#164896] px-3 py-1 text-xs font-semibold tracking-[0.16em] text-white">
                  {item.id}
                </span>
                <span className="rounded-full bg-[#eef3fa] px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                  Submitted {formatDate(item.createdAt)}
                </span>
              </div>

              <h3 className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">{item.fullName}</h3>

              <div className="mt-6 grid gap-4 text-sm md:grid-cols-2 xl:grid-cols-3">
                <DetailField label="Email" value={item.email} />
                <DetailField label="Phone Number" value={item.phone} />
                <DetailField label="Address" value={item.address} />
                <DetailField label="Visa Type" value={getApplicationVisaLabel(item.visaType)} />
                <DetailField label="Age" value={item.age === 0 || item.age ? String(item.age) : "-"} />
                <DetailField label="Birthdate" value={item.birthdate ? formatBirthdate(item.birthdate) : "-"} />
                <DetailField label="Available Day" value={item.availableDay} />
                <DetailField label="Available Time" value={item.availableTime} />
                <DetailField label="Scheduled At" value={item.scheduledAt ? formatDate(item.scheduledAt) : "Not scheduled"} />
                <DetailField label="Last Updated" value={formatDate(item.updatedAt)} />
                <DetailField label="Archived At" value={item.archivedAt ? formatDate(item.archivedAt) : "Active"} />
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[28px] border-2 border-[#9eb8e3] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)] dark:border-[#5d7fb3] dark:bg-slate-900">
            <div className="border-b-2 border-[#b8cae8] bg-[#f7f9fc] px-5 py-5 dark:border-[#4d6f9f] dark:bg-slate-950 md:px-6">
              <h2 className="text-2xl font-semibold text-[#143f88] dark:text-blue-300">Status History</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Every status move now keeps the note and timestamp from the admin action.</p>
            </div>

            <div className="px-5 py-6 md:px-6">
              {item.statusHistory?.length ? (
                <div className="space-y-3">
                  {item.statusHistory.map((entry) => (
                    <article
                      key={entry.id}
                      className="rounded-[20px] border-2 border-[#c8d7ee] bg-[#f8fafd] p-4 shadow-sm dark:border-[#4d6f9f] dark:bg-slate-950"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#eef3fa] px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                          {entry.fromStatus ? getApplicationStatusLabel(entry.fromStatus) : "Created"}
                        </span>
                        <span className="text-sm text-slate-400">to</span>
                        <span className="rounded-full bg-[#164896] px-3 py-1 text-xs font-semibold text-white">
                          {getApplicationStatusLabel(entry.toStatus)}
                        </span>
                        <span className="text-xs text-slate-500">{formatDate(entry.createdAt)}</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-200">{entry.note}</p>
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <span>By: {entry.actorName || entry.actorEmail || "Admin"}</span>
                        {entry.scheduledAt ? <span>Schedule: {formatDate(entry.scheduledAt)}</span> : null}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] border-2 border-dashed border-[#9eb8e3] bg-[#f8fafc] px-6 py-12 text-center text-sm text-slate-500 dark:border-[#5d7fb3] dark:bg-slate-950 dark:text-slate-300">
                  No status history yet.
                </div>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-[28px] border-2 border-[#9eb8e3] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)] dark:border-[#5d7fb3] dark:bg-slate-900">
            <div className="border-b-2 border-[#b8cae8] bg-[#f7f9fc] px-5 py-5 dark:border-[#4d6f9f] dark:bg-slate-950 md:px-6">
              <h2 className="text-2xl font-semibold text-[#143f88] dark:text-blue-300">Files</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Applicant uploads are view-only here. They can be opened or downloaded, but not removed.</p>
            </div>

            <div className="px-5 py-6 md:px-6">
              {item.files?.length ? (
                <ul className="grid gap-3">
                  {item.files.map((file) => (
                    <li
                      key={file.id}
                      className="flex flex-col gap-3 rounded-[20px] border-2 border-[#c8d7ee] bg-[#f8fafd] p-4 shadow-sm dark:border-[#4d6f9f] dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {file.fileType?.startsWith("image/") ? (
                          <div className="relative h-14 w-14 overflow-hidden rounded-xl">
                            <Image src={file.fileUrl} alt="Applicant file preview" fill className="object-cover" sizes="56px" />
                          </div>
                        ) : (
                          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-xs font-semibold text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                            DOC
                          </span>
                        )}

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Uploaded document</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">{file.fileType || "Unknown type"}</p>
                        </div>
                      </div>

                      <a
                        href={`/api/application/file/${file.id}/signed`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#164896] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#103773]"
                      >
                        <Download size={16} />
                        Open File
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-[24px] border-2 border-dashed border-[#9eb8e3] bg-[#f8fafc] px-6 py-12 text-center text-sm text-slate-500 dark:border-[#5d7fb3] dark:bg-slate-950 dark:text-slate-300">
                  No files uploaded.
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      <ConfirmDialog
        open={archiveConfirmOpen}
        title="Confirm Archive"
        message={`Archive ${item?.fullName || "this application"}? You can restore it later from the archive section.`}
        confirmText="Archive"
        cancelText="Cancel"
        confirmTone="danger"
        onCancel={() => setArchiveConfirmOpen(false)}
        onConfirm={async () => {
          setArchiveConfirmOpen(false);
          await onArchiveEntry();
        }}
      />
    </AdminShell>
  );
}
