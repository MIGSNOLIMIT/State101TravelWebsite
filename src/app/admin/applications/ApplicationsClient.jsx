"use client";

import { Archive, CalendarClock, CheckCircle2, Clock3, Download, Files, Loader2, Plus, RotateCcw, Search, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminShell from "@/app/admin/components/AdminShell";
import PrivacyAgreement from "@/components/PrivacyAgreement";
import ConfirmDialog from "@/components/ConfirmDialog";
import { archiveApplication, restoreApplication } from "@/lib/application";
import {
  APPLICATION_ADDRESS_INITIAL_VALUES,
  APPLICATION_ADDRESS_PROVINCES,
  buildApplicationAddress,
  getCitiesForProvince,
} from "@/lib/application-address";
import {
  APPLICATION_FILE_ACCEPT,
  APPLICATION_FILE_NOTE,
  validateApplicationUploadFile,
} from "@/lib/application-files";
import {
  DEFAULT_APPLICATION_AVAILABLE_DAYS,
  DEFAULT_APPLICATION_TIME_SLOTS,
  DEFAULT_APPLICATION_VISA_TYPES,
  normalizeApplicationFormSettings,
} from "@/lib/application-form-settings";
import { getTodayInputDate } from "@/lib/application-age";
import { getApplicationVisaLabel, toApplicationVisaOptions } from "@/lib/application-visa";
import {
  APPLICATION_STATUS_ACTIONS,
  APPLICATION_STATUS_ORDER,
  APPLICATION_STATUS_SUMMARY_LABELS,
  getApplicationStatusLabel,
  isApplicationStatus,
  normalizeApplicationStatus,
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
  SCHEDULED: {
    icon: CalendarClock,
    iconClass: "bg-blue-100 text-blue-700",
    countClass: "text-blue-700",
    labelClass: "text-blue-600",
    activeClass: "border-blue-300 bg-blue-50 shadow-[0_12px_24px_rgba(37,99,235,0.18)]",
  },
  APPROVED: {
    icon: CheckCircle2,
    iconClass: "bg-green-100 text-green-700",
    countClass: "text-green-700",
    labelClass: "text-green-600",
    activeClass: "border-green-300 bg-green-50 shadow-[0_12px_24px_rgba(22,163,74,0.18)]",
  },
  PENDING: {
    icon: ShieldAlert,
    iconClass: "bg-red-100 text-red-700",
    countClass: "text-red-700",
    labelClass: "text-red-600",
    activeClass: "border-red-300 bg-red-50 shadow-[0_12px_24px_rgba(220,38,38,0.18)]",
  },
};

const ACTION_BUTTON_STYLES = {
  neutral: "border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50",
  review: "border-amber-300 text-amber-700 hover:bg-amber-50",
  scheduled: "border-blue-300 text-blue-700 hover:bg-blue-50",
  approved: "border-green-300 text-green-700 hover:bg-green-50",
  pending: "border-red-300 text-red-700 hover:bg-red-50",
};

function formatDate(date) {
  if (!date) return "Unknown";
  return new Date(date).toLocaleString();
}

function formatTimeOnly(date) {
  if (!date) return "";
  return new Date(date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function toDateTimeLocalValue(date) {
  if (!date) return "";
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";

  const timezoneOffset = value.getTimezoneOffset() * 60 * 1000;
  return new Date(value.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function getDatePartFromDateTimeLocal(value) {
  return String(value || "").slice(0, 10);
}

function buildScheduleConflictMessage(item) {
  if (!item) {
    return "That schedule time is already occupied. Please choose another time.";
  }

  return `${formatDate(item.scheduledAt)} is already assigned to ${item.fullName}. Please choose another time.`;
}

const INITIAL_WALK_IN_FORM = {
  fullName: "",
  email: "",
  phone: "",
  ...APPLICATION_ADDRESS_INITIAL_VALUES,
  visaType: "",
  birthdate: "",
  availableTime: "",
  availableDay: "",
};

export default function ApplicationsClient({ initialUserName, initialRole }) {
  const searchParams = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [msgTone, setMsgTone] = useState("error");
  const [search, setSearch] = useState("");
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [walkInSubmitting, setWalkInSubmitting] = useState(false);
  const [walkInForm, setWalkInForm] = useState(INITIAL_WALK_IN_FORM);
  const [walkInFiles, setWalkInFiles] = useState([]);
  const [walkInPrivacyAccepted, setWalkInPrivacyAccepted] = useState(false);
  const [walkInPrivacyResetKey, setWalkInPrivacyResetKey] = useState(0);
  const [formSettings, setFormSettings] = useState(() =>
    normalizeApplicationFormSettings({
      applicationAvailableDays: DEFAULT_APPLICATION_AVAILABLE_DAYS,
      applicationVisaTypes: DEFAULT_APPLICATION_VISA_TYPES,
      applicationTimeSlots: DEFAULT_APPLICATION_TIME_SLOTS,
    })
  );
  const [activeSection, setActiveSection] = useState(() => (searchParams.get("view") === "archived" ? "archived" : "active"));
  const [backupLoading, setBackupLoading] = useState(false);
  const [statusDialog, setStatusDialog] = useState(null);
  const [archiveDialog, setArchiveDialog] = useState(null);
  const [activeStatus, setActiveStatus] = useState(() => {
    const value = normalizeApplicationStatus(searchParams.get("status"));
    return isApplicationStatus(value) ? value : "NEW";
  });
  const [statusUpdatingId, setStatusUpdatingId] = useState("");
  const router = useRouter();
  const importInputRef = useRef(null);
  const walkInFileInputRef = useRef(null);
  const walkInCityOptions = getCitiesForProvince(walkInForm.province);
  const walkInAddress = buildApplicationAddress(walkInForm);
  const visaTypeOptions = useMemo(() => toApplicationVisaOptions(formSettings.visaTypes), [formSettings.visaTypes]);
  const maxBirthdate = getTodayInputDate();

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      try {
        const [listRes, settingsRes] = await Promise.all([
          fetch("/api/application/list", { cache: "no-store" }),
          fetch("/api/admin/services-page", { cache: "no-store" }),
        ]);

        if (!listRes.ok) {
          throw new Error("Failed to load applications");
        }

        const [json, settingsJson] = await Promise.all([
          listRes.json(),
          settingsRes.ok ? settingsRes.json() : Promise.resolve(null),
        ]);
        if (ignore) return;

        setItems(json);
        if (settingsJson) {
          setFormSettings(normalizeApplicationFormSettings(settingsJson));
        }
        setMsg("");
        setMsgTone("error");
      } catch {
        if (!ignore) {
          setMsg("Failed to load applications");
          setMsgTone("error");
        }
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
    const value = normalizeApplicationStatus(searchParams.get("status"));
    setActiveStatus(isApplicationStatus(value) ? value : "NEW");
    setActiveSection(searchParams.get("view") === "archived" ? "archived" : "active");
  }, [searchParams]);

  const onImportBackup = async (file) => {
    if (!file) return;
    setMsg("");
    setMsgTone("error");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/backup/import", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.success) {
        setMsg(`Imported ${json.entriesCreated ?? 0} created, ${json.entriesMatched ?? 0} matched, ${json.filesUploaded ?? 0} files.`);
        setMsgTone("success");
        const list = await fetch("/api/application/list", { cache: "no-store" });
        if (list.ok) setItems(await list.json());
      } else {
        setMsg(json?.error || "Import failed");
        setMsgTone("error");
      }
    } catch {
      setMsg("Import failed");
      setMsgTone("error");
    }
  };

  const doChangeStatus = async ({ id, status, note, scheduledAt }) => {
    setStatusUpdatingId(id);
    try {
      const res = await fetch(`/api/application/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note, scheduledAt }),
      });
      if (res.ok) {
        const updated = await res.json();
        setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...updated } : it)));
        setMsg(`Application moved to ${getApplicationStatusLabel(updated.status)}.`);
        setMsgTone("success");
        return true;
      } else {
        const err = await res.json().catch(() => ({}));
        if (err?.code === "SCHEDULED_SLOT_TAKEN") {
          setStatusDialog((prev) => (prev && prev.id === id ? { ...prev, error: err.error || "That schedule time is already occupied." } : prev));
          if (typeof window !== "undefined") {
            window.alert(err?.error || "That schedule time is already occupied. Please choose another time.");
          }
        }
        setMsg(err?.error || "Failed to update status");
        setMsgTone("error");
        return false;
      }
    } catch {
      setMsg("Failed to update status");
      setMsgTone("error");
      return false;
    } finally {
      setStatusUpdatingId("");
    }
  };

  const onChangeStatus = (item, status) => {
    setStatusDialog({
      id: item.id,
      fullName: item.fullName,
      fromStatus: item.status,
      toStatus: status,
      note: "",
      scheduledAt: status === "SCHEDULED" ? toDateTimeLocalValue(item.scheduledAt) : "",
      error: "",
    });
  };

  const onArchive = async (id) => {
    try {
      const result = await archiveApplication(id);
      const archivedAt = result?.item?.archivedAt || new Date().toISOString();
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, archivedAt } : it)));
      setMsg("Application archived.");
      setMsgTone("success");
    } catch (e) {
      setMsg(e.message);
      setMsgTone("error");
    }
  };

  const onRestore = async (id) => {
    try {
      const restored = await restoreApplication(id);
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...restored, archivedAt: null } : it)));
      setMsg("Application restored.");
      setMsgTone("success");
      setSectionView("active", restored.status || activeStatus);
    } catch (e) {
      setMsg(e.message);
      setMsgTone("error");
    }
  };

  const onWalkInFieldChange = (field, value) => {
    setWalkInForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "province") {
        next.city = "";
      }
      return next;
    });
  };

  const onWalkInFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    for (const file of files) {
      const fileError = validateApplicationUploadFile(file);
      if (fileError) {
        setMsg(`${file.name}: ${fileError}`);
        setMsgTone("error");
        event.target.value = "";
        setWalkInFiles([]);
        return;
      }
    }

    setMsg("");
    setWalkInFiles(files);
  };

  const onCreateWalkIn = async (event) => {
    event.preventDefault();
    if (!walkInPrivacyAccepted) {
      setMsg("Please scroll through the Privacy Agreement and select I Agree before saving.");
      setMsgTone("error");
      return;
    }

    setWalkInSubmitting(true);
    setMsg("");

    try {
      const formData = new FormData();
      formData.set("fullName", walkInForm.fullName);
      formData.set("email", walkInForm.email);
      formData.set("phone", walkInForm.phone);
      formData.set("address", walkInAddress);
      formData.set("visaType", walkInForm.visaType);
      formData.set("birthdate", walkInForm.birthdate);
      formData.set("availableTime", walkInForm.availableTime);
      formData.set("availableDay", walkInForm.availableDay);
      for (const file of walkInFiles) {
        formData.append("files", file);
      }

      const res = await fetch("/api/application/admin-create", {
        method: "POST",
        body: formData,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(json?.error || "Failed to create application");
        setMsgTone("error");
        return;
      }

      setItems((prev) => [json, ...prev]);
      setWalkInForm(INITIAL_WALK_IN_FORM);
      setWalkInFiles([]);
      setWalkInPrivacyAccepted(false);
      setWalkInPrivacyResetKey((prev) => prev + 1);
      if (walkInFileInputRef.current) {
        walkInFileInputRef.current.value = "";
      }
      setWalkInOpen(false);
      setMsg("Walk-in application added successfully.");
      setMsgTone("success");
      setStatusView("NEW");
    } catch {
      setMsg("Failed to create application");
      setMsgTone("error");
    } finally {
      setWalkInSubmitting(false);
    }
  };

  const onDownloadBackup = async () => {
    setBackupLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/backup/generate?mode=full");
      if (!res.ok) {
        throw new Error("Failed to create backup ZIP");
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `applications-backup-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      setMsg("Backup ZIP is ready.");
      setMsgTone("success");
    } catch (error) {
      setMsg(error.message || "Failed to create backup ZIP");
      setMsgTone("error");
    } finally {
      setBackupLoading(false);
    }
  };

  const activeItems = useMemo(() => items.filter((item) => !item.archivedAt), [items]);
  const archivedItems = useMemo(() => items.filter((item) => Boolean(item.archivedAt)), [items]);
  const statusDialogId = statusDialog?.id || "";
  const statusDialogToStatus = statusDialog?.toStatus || "";
  const statusDialogScheduledAt = statusDialog?.scheduledAt || "";

  const counts = useMemo(
    () => ({
      NEW: activeItems.filter((item) => normalizeApplicationStatus(item.status) === "NEW").length,
      IN_REVIEW: activeItems.filter((item) => normalizeApplicationStatus(item.status) === "IN_REVIEW").length,
      SCHEDULED: activeItems.filter((item) => normalizeApplicationStatus(item.status) === "SCHEDULED").length,
      APPROVED: activeItems.filter((item) => normalizeApplicationStatus(item.status) === "APPROVED").length,
      PENDING: activeItems.filter((item) => normalizeApplicationStatus(item.status) === "PENDING").length,
    }),
    [activeItems]
  );

  const filteredActiveItems = useMemo(
    () =>
      activeItems.filter((item) => {
        const matchesSearch =
          !search ||
          item.fullName.toLowerCase().includes(search.toLowerCase()) ||
          item.email.toLowerCase().includes(search.toLowerCase()) ||
          item.visaType.toLowerCase().includes(search.toLowerCase());

        return matchesSearch && normalizeApplicationStatus(item.status) === activeStatus;
      }),
    [activeItems, activeStatus, search]
  );

  const filteredArchivedItems = useMemo(
    () =>
      archivedItems.filter((item) => {
        const matchesSearch =
          !search ||
          item.fullName.toLowerCase().includes(search.toLowerCase()) ||
          item.email.toLowerCase().includes(search.toLowerCase()) ||
          item.visaType.toLowerCase().includes(search.toLowerCase());

        return matchesSearch;
      }),
    [archivedItems, search]
  );

  const occupiedScheduledSlots = useMemo(
    () =>
      activeItems
        .filter(
          (item) =>
            normalizeApplicationStatus(item.status) === "SCHEDULED" &&
            item.scheduledAt &&
            item.id !== statusDialogId
        )
        .map((item) => ({
          id: item.id,
          fullName: item.fullName,
          scheduledAt: item.scheduledAt,
          localDateTime: toDateTimeLocalValue(item.scheduledAt),
        })),
    [activeItems, statusDialogId]
  );

  const occupiedSlotsForSelectedDay = useMemo(() => {
    if (statusDialogToStatus !== "SCHEDULED" || !statusDialogScheduledAt) {
      return [];
    }

    const selectedDay = getDatePartFromDateTimeLocal(statusDialogScheduledAt);
    return occupiedScheduledSlots
      .filter((item) => getDatePartFromDateTimeLocal(item.localDateTime) === selectedDay)
      .sort((left, right) => left.localDateTime.localeCompare(right.localDateTime));
  }, [occupiedScheduledSlots, statusDialogScheduledAt, statusDialogToStatus]);

  const conflictingScheduledItem = useMemo(() => {
    if (statusDialogToStatus !== "SCHEDULED" || !statusDialogScheduledAt) {
      return null;
    }

    return occupiedScheduledSlots.find((item) => item.localDateTime === statusDialogScheduledAt) || null;
  }, [occupiedScheduledSlots, statusDialogScheduledAt, statusDialogToStatus]);

  const setStatusView = (status) => {
    const nextStatus = normalizeApplicationStatus(status);
    setActiveSection("active");
    setActiveStatus(nextStatus);
    router.replace(`/admin/applications?status=${nextStatus}`);
  };

  const setSectionView = (section, status = activeStatus) => {
    setActiveSection(section);
    if (section === "archived") {
      router.replace("/admin/applications?view=archived");
      return;
    }

    const nextStatus = isApplicationStatus(status) ? normalizeApplicationStatus(status) : "NEW";
    setActiveStatus(nextStatus);
    router.replace(`/admin/applications?status=${nextStatus}`);
  };

  return (
    <AdminShell title="Applications" userName={initialUserName} role={initialRole}>
      <div className="space-y-6">
        {msg ? (
          <div
            className={[
              "rounded-2xl border px-4 py-3 text-sm",
              msgTone === "success"
                ? "border-green-200 bg-green-50 text-green-700 dark:border-green-500/40 dark:bg-green-950/40 dark:text-green-200"
                : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-200",
            ].join(" ")}
          >
            {msg}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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
                <h2 className="text-2xl font-semibold text-[#143f88]">
                  {activeSection === "archived" ? "Archived Applications" : `${getApplicationStatusLabel(activeStatus)} Applications`}
                </h2>
                <p className="text-sm text-slate-500">
                  {activeSection === "archived"
                    ? "Archived applications stay in the system and can be restored whenever needed."
                    : "Review each application, add required notes for status changes, and schedule applicants when needed."}
                </p>
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
                  <button
                    type="button"
                    onClick={() => setWalkInOpen((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0f1f77] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b1758]"
                  >
                    <Plus size={16} />
                    {walkInOpen ? "Close Walk-in Form" : "Add Walk-in Application"}
                  </button>
                  <button
                    type="button"
                    onClick={onDownloadBackup}
                    disabled={backupLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#164896] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#103773] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {backupLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    {backupLoading ? "Creating Backup..." : "Backup ZIP"}
                  </button>
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

          {walkInOpen ? (
            <div className="border-b-2 border-[#d6e1f1] bg-[#fbfdff] px-5 py-5 dark:border-[#415e89] dark:bg-slate-950/60 md:px-6">
              <form onSubmit={onCreateWalkIn} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Add Walk-in Application</h3>
                  <p className="text-sm text-slate-500">Create an application for visitors who applied directly in person. It will be saved under Recent.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Full Name *
                    <input
                      type="text"
                      required
                      value={walkInForm.fullName}
                      onChange={(event) => onWalkInFieldChange("fullName", event.target.value)}
                      className="mt-1 w-full rounded-xl border-2 border-[#b2c6e6] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#164896] dark:border-[#4d6f9f] dark:bg-slate-900"
                      placeholder="Juan Dela Cruz"
                      pattern="^[^0-9]+$"
                      title="Full name cannot contain numbers."
                      autoComplete="name"
                      maxLength={120}
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Email *
                    <input
                      type="email"
                      required
                      value={walkInForm.email}
                      onChange={(event) => onWalkInFieldChange("email", event.target.value)}
                      className="mt-1 w-full rounded-xl border-2 border-[#b2c6e6] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#164896] dark:border-[#4d6f9f] dark:bg-slate-900"
                      placeholder="you@example.com"
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Phone *
                    <input
                      type="text"
                      required
                      value={walkInForm.phone}
                      onChange={(event) => onWalkInFieldChange("phone", event.target.value)}
                      className="mt-1 w-full rounded-xl border-2 border-[#b2c6e6] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#164896] dark:border-[#4d6f9f] dark:bg-slate-900"
                      placeholder="09171234567 or +639171234567"
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Building/Unit
                    <input
                      type="text"
                      value={walkInForm.buildingUnit}
                      onChange={(event) => onWalkInFieldChange("buildingUnit", event.target.value)}
                      className="mt-1 w-full rounded-xl border-2 border-[#b2c6e6] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#164896] dark:border-[#4d6f9f] dark:bg-slate-900"
                      placeholder="Unit 12B"
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Street *
                    <input
                      type="text"
                      required
                      value={walkInForm.street}
                      onChange={(event) => onWalkInFieldChange("street", event.target.value)}
                      className="mt-1 w-full rounded-xl border-2 border-[#b2c6e6] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#164896] dark:border-[#4d6f9f] dark:bg-slate-900"
                      placeholder="Street address"
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Barangay *
                    <input
                      type="text"
                      required
                      value={walkInForm.barangay}
                      onChange={(event) => onWalkInFieldChange("barangay", event.target.value)}
                      className="mt-1 w-full rounded-xl border-2 border-[#b2c6e6] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#164896] dark:border-[#4d6f9f] dark:bg-slate-900"
                      placeholder="Barangay"
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Province *
                    <input
                      type="text"
                      list="walkin-province-options"
                      required
                      value={walkInForm.province}
                      onChange={(event) => onWalkInFieldChange("province", event.target.value)}
                      className="mt-1 w-full rounded-xl border-2 border-[#b2c6e6] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#164896] dark:border-[#4d6f9f] dark:bg-slate-900"
                      placeholder="Type or select a province"
                      autoComplete="off"
                    />
                    <datalist id="walkin-province-options">
                      {APPLICATION_ADDRESS_PROVINCES.map((option) => (
                        <option key={option.value} value={option.value} />
                      ))}
                    </datalist>
                  </label>

                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    City *
                    <input
                      type="text"
                      list="walkin-city-options"
                      required
                      value={walkInForm.city}
                      onChange={(event) => onWalkInFieldChange("city", event.target.value)}
                      className="mt-1 w-full rounded-xl border-2 border-[#b2c6e6] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#164896] dark:border-[#4d6f9f] dark:bg-slate-900"
                      placeholder={walkInForm.province ? "Type or select a city" : "Type a province first for matching city suggestions"}
                      autoComplete="off"
                    />
                    <datalist id="walkin-city-options">
                      {walkInCityOptions.map((option) => (
                        <option key={option} value={option} />
                      ))}
                    </datalist>
                  </label>

                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Visa Type *
                    <select
                      required
                      value={walkInForm.visaType}
                      onChange={(event) => onWalkInFieldChange("visaType", event.target.value)}
                      className="mt-1 w-full rounded-xl border-2 border-[#b2c6e6] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#164896] dark:border-[#4d6f9f] dark:bg-slate-900"
                    >
                      <option value="">Select Visa Type</option>
                      {visaTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Birthdate *
                    <input
                      type="date"
                      max={maxBirthdate}
                      required
                      value={walkInForm.birthdate}
                      onChange={(event) => onWalkInFieldChange("birthdate", event.target.value)}
                      className="mt-1 w-full rounded-xl border-2 border-[#b2c6e6] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#164896] dark:border-[#4d6f9f] dark:bg-slate-900"
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Available Time *
                    <select
                      required
                      value={walkInForm.availableTime}
                      onChange={(event) => onWalkInFieldChange("availableTime", event.target.value)}
                      className="mt-1 w-full rounded-xl border-2 border-[#b2c6e6] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#164896] dark:border-[#4d6f9f] dark:bg-slate-900"
                    >
                      <option value="">Select Time</option>
                      {formSettings.timeSlots.map((slot) => (
                        <option key={`${slot.start}-${slot.end}`} value={slot.label}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Available Day *
                    <select
                      required
                      value={walkInForm.availableDay}
                      onChange={(event) => onWalkInFieldChange("availableDay", event.target.value)}
                      className="mt-1 w-full rounded-xl border-2 border-[#b2c6e6] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#164896] dark:border-[#4d6f9f] dark:bg-slate-900"
                    >
                      <option value="">Select Day</option>
                      {formSettings.availableDays.map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 md:col-span-2 xl:col-span-4">
                    Attach File
                    <input
                      ref={walkInFileInputRef}
                      type="file"
                      name="files"
                      multiple
                      accept={APPLICATION_FILE_ACCEPT}
                      onChange={onWalkInFileChange}
                      className="mt-1 block w-full text-sm text-slate-700 file:mr-3 file:rounded file:border-0 file:bg-[#164896] file:px-4 file:py-2 file:text-white hover:file:bg-[#103773]"
                    />
                    <p className="mt-1 text-xs text-slate-500">{APPLICATION_FILE_NOTE}</p>
                  </label>
                </div>

                <PrivacyAgreement
                  checked={walkInPrivacyAccepted}
                  onCheckedChange={setWalkInPrivacyAccepted}
                  resetKey={walkInPrivacyResetKey}
                />

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={walkInSubmitting || !walkInPrivacyAccepted}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#164896] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#103773] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Plus size={16} />
                    {walkInSubmitting ? "Saving..." : "Save Walk-in Application"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWalkInForm(INITIAL_WALK_IN_FORM);
                      setWalkInFiles([]);
                      setWalkInPrivacyAccepted(false);
                      setWalkInPrivacyResetKey((prev) => prev + 1);
                      if (walkInFileInputRef.current) {
                        walkInFileInputRef.current.value = "";
                      }
                      setWalkInOpen(false);
                    }}
                    className="rounded-xl border border-[#cbd5e1] px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : null}

          <div className="border-b-2 border-[#d6e1f1] px-5 py-4 dark:border-[#415e89] md:px-6">
            <div className="flex flex-wrap items-center gap-2">
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

              <button
                type="button"
                onClick={() => setSectionView("archived")}
                className={[
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  activeSection === "archived"
                    ? "bg-slate-900 text-white dark:bg-slate-700"
                    : "bg-[#f3f4f6] text-slate-600 hover:bg-[#e5e7eb] dark:bg-slate-800 dark:text-slate-200",
                ].join(" ")}
              >
                Archive
                <span className="ml-2 rounded-full bg-white/80 px-2 py-0.5 text-xs text-slate-600">
                  {archivedItems.length}
                </span>
              </button>
            </div>
          </div>

          <div className="px-5 py-6 md:px-6">
            {loading ? (
              <div className="flex h-48 items-center justify-center text-sm text-slate-500">Loading applications...</div>
            ) : activeSection === "archived" ? (
              filteredArchivedItems.length === 0 ? (
                <div className="rounded-[24px] border-2 border-dashed border-[#9eb8e3] bg-[#f8fafc] px-6 py-12 text-center dark:border-[#5d7fb3] dark:bg-slate-950">
                  <Archive className="mx-auto text-slate-400" size={32} />
                  <p className="mt-4 text-lg font-medium text-slate-700 dark:text-slate-100">No archived applications found.</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Archive items from the active workflow to keep them here for later review.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredArchivedItems.map((item) => (
                    <article key={item.id} className="rounded-[24px] border-2 border-[#9eb8e3] bg-[#f8fafd] p-5 shadow-[0_10px_20px_rgba(15,23,42,0.05)] dark:border-[#5d7fb3] dark:bg-slate-950">
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold tracking-[0.16em] text-white dark:bg-slate-700">
                              Archived
                            </span>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-200">
                              {getApplicationStatusLabel(item.status)}
                            </span>
                          </div>

                          <h3 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-slate-100">{item.fullName}</h3>
                          <div className="mt-2 grid gap-3 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2 xl:grid-cols-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Email</p>
                              <p className="mt-1 font-medium text-slate-800 dark:text-slate-100">{item.email}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Phone</p>
                              <p className="mt-1 font-medium text-slate-800 dark:text-slate-100">{item.phone}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Visa Type</p>
                              <p className="mt-1 font-medium text-slate-800 dark:text-slate-100">{getApplicationVisaLabel(item.visaType)}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Submitted</p>
                              <p className="mt-1 font-medium text-slate-800 dark:text-slate-100">{formatDate(item.createdAt)}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Archived</p>
                              <p className="mt-1 font-medium text-slate-800 dark:text-slate-100">{formatDate(item.archivedAt)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="w-full xl:max-w-[360px]">
                          <div className="rounded-[20px] border-2 border-[#c8d7ee] bg-white p-4 shadow-sm dark:border-[#4d6f9f] dark:bg-slate-900">
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
                              <span>Attached files</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-100">{item._count?.files || 0}</span>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => router.push(`/admin/applications/${item.id}`)}
                                className="rounded-xl bg-[#164896] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#103773]"
                              >
                                View Details
                              </button>
                              <button
                                type="button"
                                onClick={() => onRestore(item.id)}
                                className="inline-flex items-center gap-2 rounded-xl border border-green-300 px-4 py-2.5 text-sm font-semibold text-green-700 transition hover:bg-green-50 dark:border-green-500/50 dark:text-green-300 dark:hover:bg-green-950/40"
                              >
                                <RotateCcw size={15} />
                                Restore
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )
            ) : filteredActiveItems.length === 0 ? (
              <div className="rounded-[24px] border-2 border-dashed border-[#9eb8e3] bg-[#f8fafc] px-6 py-12 text-center dark:border-[#5d7fb3] dark:bg-slate-950">
                <ShieldAlert className="mx-auto text-slate-400" size={32} />
                <p className="mt-4 text-lg font-medium text-slate-700 dark:text-slate-100">No applications found in {getApplicationStatusLabel(activeStatus)}.</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try another status or adjust the search field.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActiveItems.map((item, index) => {
                  const normalizedItemStatus = normalizeApplicationStatus(item.status);
                  const actions = APPLICATION_STATUS_ACTIONS[normalizedItemStatus] || [];
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

                          <h3 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-slate-100">{item.fullName}</h3>
                          <div className="mt-2 grid gap-3 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2 xl:grid-cols-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Email</p>
                              <p className="mt-1 font-medium text-slate-800 dark:text-slate-100">{item.email}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Phone</p>
                              <p className="mt-1 font-medium text-slate-800 dark:text-slate-100">{item.phone}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Visa Type</p>
                              <p className="mt-1 font-medium text-slate-800 dark:text-slate-100">{getApplicationVisaLabel(item.visaType)}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Address</p>
                              <p className="mt-1 font-medium text-slate-800 dark:text-slate-100">{item.address}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Availability</p>
                              <p className="mt-1 font-medium text-slate-800 dark:text-slate-100">{item.availableDay}, {item.availableTime}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Schedule</p>
                              <p className="mt-1 font-medium text-slate-800 dark:text-slate-100">
                                {item.scheduledAt ? formatDate(item.scheduledAt) : "Not scheduled"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Submitted</p>
                              <p className="mt-1 font-medium text-slate-800 dark:text-slate-100">{formatDate(item.createdAt)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="w-full xl:max-w-[360px]">
                          <div className="rounded-[20px] border-2 border-[#c8d7ee] bg-white p-4 shadow-sm dark:border-[#4d6f9f] dark:bg-slate-900">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <span>Attached files</span>
                              <span className="font-semibold text-slate-700">{item._count?.files || 0}</span>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => router.push(`/admin/applications/${item.id}`)}
                                className="inline-flex items-center justify-center rounded-xl bg-[#164896] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#103773]"
                              >
                                View Details
                              </button>
                              <a
                                href={`/api/application/${item.id}/zip`}
                                className="inline-flex items-center justify-center rounded-xl border border-[#cbd5e1] px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-[#4d6f9f] dark:text-slate-100 dark:hover:bg-slate-800"
                              >
                                Download ZIP
                              </a>
                              {normalizedItemStatus !== "IN_REVIEW" && normalizedItemStatus !== "APPROVED" ? (
                                <button
                                  type="button"
                                  onClick={() => setArchiveDialog({ id: item.id, fullName: item.fullName })}
                                  className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-[#4d6f9f] dark:text-slate-200 dark:hover:bg-slate-800"
                                  title="Archive application"
                                >
                                  <Archive size={16} />
                                  Archive
                                </button>
                              ) : null}
                            </div>

                            <div className="mt-4 border-t-2 border-[#d7e2f1] pt-4 dark:border-[#415e89]">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Workflow actions</p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {actions.map((action) => (
                                  <button
                                    key={action.status}
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() => onChangeStatus(item, action.status)}
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

      {statusDialog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-950/60"
            aria-hidden="true"
            onClick={() => setStatusDialog(null)}
          />
          <div className="relative z-10 w-full max-w-xl rounded-[28px] border border-[#d9e3f1] bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.28)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#164896]">Status Update</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                Move {statusDialog.fullName} to {getApplicationStatusLabel(statusDialog.toStatus)}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                A note is required for every status change. Scheduled applications also need a date and time.
              </p>
            </div>

            <div className="mt-5 grid gap-4">
              {statusDialog.error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {statusDialog.error}
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Current Status
                  <input
                    type="text"
                    value={getApplicationStatusLabel(statusDialog.fromStatus)}
                    readOnly
                    className="mt-1 w-full rounded-xl border border-[#cbd5e1] bg-slate-50 px-3 py-2.5 text-sm text-slate-600"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  New Status
                  <input
                    type="text"
                    value={getApplicationStatusLabel(statusDialog.toStatus)}
                    readOnly
                    className="mt-1 w-full rounded-xl border border-[#cbd5e1] bg-slate-50 px-3 py-2.5 text-sm text-slate-600"
                  />
                </label>
              </div>

              {statusDialog.toStatus === "SCHEDULED" ? (
                <label className="block text-sm font-medium text-slate-700">
                  Schedule Date And Time *
                  <input
                    type="datetime-local"
                    value={statusDialog.scheduledAt}
                    onChange={(event) =>
                      setStatusDialog((prev) => (prev ? { ...prev, scheduledAt: event.target.value, error: "" } : prev))
                    }
                    className="mt-1 w-full rounded-xl border-2 border-[#b2c6e6] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#164896]"
                  />
                  {occupiedSlotsForSelectedDay.length ? (
                    <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-800">
                      <p className="font-semibold uppercase tracking-[0.14em]">Occupied times on this day</p>
                      <p className="mt-1">
                        {occupiedSlotsForSelectedDay.map((item) => `${formatTimeOnly(item.scheduledAt)} - ${item.fullName}`).join(", ")}
                      </p>
                    </div>
                  ) : null}
                  {conflictingScheduledItem ? (
                    <p className="mt-2 text-sm font-medium text-red-600">
                      {buildScheduleConflictMessage(conflictingScheduledItem)}
                    </p>
                  ) : null}
                </label>
              ) : null}

              <label className="block text-sm font-medium text-slate-700">
                Note *
                <textarea
                  value={statusDialog.note}
                  onChange={(event) =>
                    setStatusDialog((prev) => (prev ? { ...prev, note: event.target.value } : prev))
                  }
                  className="mt-1 min-h-[140px] w-full rounded-xl border-2 border-[#b2c6e6] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#164896]"
                  placeholder="Explain why this application is being moved to the selected status."
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setStatusDialog(null)}
                className="rounded-xl border border-[#cbd5e1] px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={statusUpdatingId === statusDialog.id}
                onClick={async () => {
                  const pending = statusDialog;
                  if (pending.toStatus === "SCHEDULED" && conflictingScheduledItem) {
                    const conflictMessage = buildScheduleConflictMessage(conflictingScheduledItem);
                    setStatusDialog((prev) => (prev ? { ...prev, error: conflictMessage } : prev));
                    if (typeof window !== "undefined") {
                      window.alert(conflictMessage);
                    }
                    return;
                  }

                  const success = await doChangeStatus({
                    id: pending.id,
                    status: pending.toStatus,
                    note: pending.note,
                    scheduledAt: pending.toStatus === "SCHEDULED" ? pending.scheduledAt : null,
                  });
                  if (success) {
                    setStatusDialog(null);
                  }
                }}
                className="rounded-xl bg-[#164896] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#103773] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {statusUpdatingId === statusDialog.id ? "Saving..." : "Save Status Change"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(archiveDialog)}
        title="Confirm Archive"
        message={
          archiveDialog
            ? `Archive ${archiveDialog.fullName}? You can restore this application later from the archive section.`
            : "Archive this application?"
        }
        confirmText="Archive"
        cancelText="Cancel"
        confirmTone="danger"
        onCancel={() => setArchiveDialog(null)}
        onConfirm={async () => {
          const pendingArchive = archiveDialog;
          if (!pendingArchive) return;
          setArchiveDialog(null);
          await onArchive(pendingArchive.id);
        }}
      />
    </AdminShell>
  );
}
