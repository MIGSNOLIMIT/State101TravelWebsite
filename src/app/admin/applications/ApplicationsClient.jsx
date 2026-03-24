"use client";

import { CheckCircle2, Clock3, Download, Files, Search, ShieldAlert, Trash2, XCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminShell from "@/app/admin/components/AdminShell";
import { deleteApplication } from "@/lib/application";
import {
  APPLICATION_STATUS_ACTIONS,
  APPLICATION_STATUS_ORDER,
  APPLICATION_STATUS_SUMMARY_LABELS,
  getApplicationStatusLabel,
  isApplicationStatus,
} from "@/lib/application-status";

const STATUS_CARD_META = {
  NEW: {
    icon: Clock3,
    iconClass: "bg-slate-100 text-slate-700",
    countClass: "text-slate-800",
    labelClass: "text-slate-600",
    activeClass: "border-slate-400 bg-slate-50 shadow-[0_12px_24px_rgba(100,116,139,0.18)]",
  },
  IN_REVIEW: {
    icon: Search,
    iconClass: "bg-amber-100 text-amber-700",
    countClass: "text-amber-700",
    labelClass: "text-amber-600",
    activeClass: "border-amber-300 bg-amber-50 shadow-[0_12px_24px_rgba(217,119,6,0.18)]",
  },
  APPROVED: {
    icon: CheckCircle2,
    iconClass: "bg-green-100 text-green-700",
    countClass: "text-green-700",
    labelClass: "text-green-600",
    activeClass: "border-green-300 bg-green-50 shadow-[0_12px_24px_rgba(22,163,74,0.18)]",
  },
  DECLINED: {
    icon: XCircle,
    iconClass: "bg-red-100 text-red-700",
    countClass: "text-red-700",
    labelClass: "text-red-600",
    activeClass: "border-red-300 bg-red-50 shadow-[0_12px_24px_rgba(220,38,38,0.18)]",
  },
};

const ACTION_BUTTON_STYLES = {
  neutral: "border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50",
  review: "border-amber-300 text-amber-700 hover:bg-amber-50",
  approved: "border-green-300 text-green-700 hover:bg-green-50",
  declined: "border-red-300 text-red-700 hover:bg-red-50",
};

function formatDate(date) {
  if (!date) return "Unknown";
  return new Date(date).toLocaleString();
}

export default function ApplicationsClient({ initialUserName, initialRole }) {
  const searchParams = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState(() => {
    const value = searchParams.get("status");
    return isApplicationStatus(value) ? value : "NEW";
  });
  const [statusUpdatingId, setStatusUpdatingId] = useState("");
  const router = useRouter();
  const importInputRef = useRef(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      try {
        const listRes = await fetch("/api/application/list", { cache: "no-store" });

        if (!listRes.ok) {
          throw new Error("Failed to load applications");
        }

        const json = await listRes.json();
        if (ignore) return;

        setItems(json);
        setMsg("");
      } catch {
        if (!ignore) setMsg("Failed to load applications");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const value = searchParams.get("status");
    setActiveStatus(isApplicationStatus(value) ? value : "NEW");
  }, [searchParams]);

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
    setStatusUpdatingId(id);
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
    } finally {
      setStatusUpdatingId("");
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

  const counts = useMemo(
    () => ({
      NEW: items.filter((item) => item.status === "NEW").length,
      IN_REVIEW: items.filter((item) => item.status === "IN_REVIEW").length,
      APPROVED: items.filter((item) => item.status === "APPROVED").length,
      DECLINED: items.filter((item) => item.status === "DECLINED").length,
    }),
    [items]
  );

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        const matchesSearch =
          !search ||
          item.fullName.toLowerCase().includes(search.toLowerCase()) ||
          item.email.toLowerCase().includes(search.toLowerCase()) ||
          item.visaType.toLowerCase().includes(search.toLowerCase());

        return matchesSearch && item.status === activeStatus;
      }),
    [activeStatus, items, search]
  );

  const setStatusView = (status) => {
    setActiveStatus(status);
    router.replace(`/admin/applications?status=${status}`);
  };

  return (
    <AdminShell title="Applications" userName={initialUserName} role={initialRole}>
      <div className="space-y-6">
        {msg ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-200">{msg}</div> : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {APPLICATION_STATUS_ORDER.map((status) => {
            const meta = STATUS_CARD_META[status];
            const Icon = meta.icon;
            const active = status === activeStatus;

            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusView(status)}
                className={[
                  "rounded-[24px] border-2 border-[#9eb8e3] bg-white px-6 py-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg dark:border-[#5d7fb3] dark:bg-slate-900",
                  active ? meta.activeClass : "hover:border-[#c4cede]",
                ].join(" ")}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className={`text-5xl font-semibold leading-none ${meta.countClass}`}>{counts[status]}</div>
                    <div className={`mt-3 text-lg font-medium ${meta.labelClass}`}>{APPLICATION_STATUS_SUMMARY_LABELS[status]}</div>
                  </div>
                  <span className={`flex h-11 w-11 items-center justify-center rounded-full ${meta.iconClass}`}>
                    <Icon size={20} strokeWidth={2.3} />
                  </span>
                </div>
              </button>
            );
          })}
        </section>

        <section className="overflow-hidden rounded-[28px] border-2 border-[#9eb8e3] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)] dark:border-[#5d7fb3] dark:bg-slate-900">
          <div className="border-b-2 border-[#b8cae8] bg-[#f7f9fc] px-5 py-5 dark:border-[#4d6f9f] dark:bg-slate-950 md:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-[#143f88]">{getApplicationStatusLabel(activeStatus)} Applications</h2>
                <p className="text-sm text-slate-500">Review each application and move it through the four-step admin workflow.</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                <label className="relative min-w-[260px] max-w-full">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search applicant, email, or visa type"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="w-full rounded-xl border-2 border-[#b2c6e6] bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#164896] dark:border-[#4d6f9f] dark:bg-slate-900 dark:text-slate-100"
                  />
                </label>

                <div className="flex flex-wrap gap-2">
                  <a
                    href="/api/backup/generate?mode=full"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#164896] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#103773]"
                  >
                    <Download size={16} />
                    Backup ZIP
                  </a>
                  <button
                    type="button"
                    onClick={() => importInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#1d8a43] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#176d35]"
                  >
                    <Files size={16} />
                    Import Backup
                  </button>
                  <input
                    ref={importInputRef}
                    type="file"
                    accept="application/zip"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) onImportBackup(file);
                      event.target.value = "";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-b-2 border-[#d6e1f1] px-5 py-4 dark:border-[#415e89] md:px-6">
            <div className="flex flex-wrap gap-2">
              {APPLICATION_STATUS_ORDER.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusView(status)}
                  className={[
                    "rounded-full px-4 py-2 text-sm font-medium transition",
                    status === activeStatus
                      ? "bg-[#164896] text-white"
                      : "bg-[#eef3fa] text-slate-600 hover:bg-[#dde7f6]",
                  ].join(" ")}
                >
                  {getApplicationStatusLabel(status)}
                  <span className="ml-2 rounded-full bg-white/80 px-2 py-0.5 text-xs text-slate-600">
                    {counts[status]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="px-5 py-6 md:px-6">
            {loading ? (
              <div className="flex h-48 items-center justify-center text-sm text-slate-500">Loading applications...</div>
            ) : filteredItems.length === 0 ? (
              <div className="rounded-[24px] border-2 border-dashed border-[#9eb8e3] bg-[#f8fafc] px-6 py-12 text-center dark:border-[#5d7fb3] dark:bg-slate-950">
                <ShieldAlert className="mx-auto text-slate-400" size={32} />
                <p className="mt-4 text-lg font-medium text-slate-700">No applications found in {getApplicationStatusLabel(activeStatus)}.</p>
                <p className="mt-2 text-sm text-slate-500">Try another status or adjust the search field.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item, index) => {
                  const actions = APPLICATION_STATUS_ACTIONS[item.status] || [];
                  const isBusy = statusUpdatingId === item.id;

                  return (
                    <article key={item.id} className="rounded-[24px] border-2 border-[#9eb8e3] bg-[#f8fafd] p-5 shadow-[0_10px_20px_rgba(15,23,42,0.05)] dark:border-[#5d7fb3] dark:bg-slate-950">
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-[#164896] px-3 py-1 text-xs font-semibold tracking-[0.16em] text-white">
                              Applicant {String(index + 1).padStart(2, "0")}
                            </span>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
                              {getApplicationStatusLabel(item.status)}
                            </span>
                          </div>

                          <h3 className="mt-4 text-2xl font-semibold text-slate-900">{item.fullName}</h3>
                          <div className="mt-2 grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Email</p>
                              <p className="mt-1 font-medium text-slate-800">{item.email}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Phone</p>
                              <p className="mt-1 font-medium text-slate-800">{item.phone}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Visa Type</p>
                              <p className="mt-1 font-medium text-slate-800">{item.visaType}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Address</p>
                              <p className="mt-1 font-medium text-slate-800">{item.address}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Availability</p>
                              <p className="mt-1 font-medium text-slate-800">{item.availableDay}, {item.availableTime}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Submitted</p>
                              <p className="mt-1 font-medium text-slate-800">{formatDate(item.createdAt)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="w-full xl:max-w-[360px]">
                          <div className="rounded-[20px] border-2 border-[#c8d7ee] bg-white p-4 shadow-sm dark:border-[#4d6f9f] dark:bg-slate-900">
                            <div className="flex items-center justify-between text-sm text-slate-500">
                              <span>Attached files</span>
                              <span className="font-semibold text-slate-700">{item._count?.files || 0}</span>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => router.push(`/admin/applications/${item.id}`)}
                                className="rounded-xl bg-[#164896] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#103773]"
                              >
                                View Details
                              </button>
                              <a
                                href={`/api/application/${item.id}/zip`}
                                className="rounded-xl border border-[#cbd5e1] px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                              >
                                Download ZIP
                              </a>
                              <button
                                type="button"
                                onClick={() => onDelete(item.id)}
                                className="ml-auto rounded-xl border border-red-200 px-3 py-2.5 text-red-600 transition hover:bg-red-50"
                                title="Delete application"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <div className="mt-4 border-t-2 border-[#d7e2f1] pt-4 dark:border-[#415e89]">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Workflow actions</p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {actions.map((action) => (
                                  <button
                                    key={action.status}
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() => onChangeStatus(item.id, action.status)}
                                    className={[
                                      "rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
                                      ACTION_BUTTON_STYLES[action.tone] || ACTION_BUTTON_STYLES.neutral,
                                    ].join(" ")}
                                  >
                                    {action.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}