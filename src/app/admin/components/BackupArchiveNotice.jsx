"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Archive, Download, X } from "lucide-react";

const NOTICE_STORAGE_PREFIX = "state101-backup-notice-dismissed";

function getMonthNoticeKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${NOTICE_STORAGE_PREFIX}-${year}-${month}`;
}

function formatNoticeDate(value, options) {
  if (!value) return null;

  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    ...options,
  }).format(new Date(value));
}

export default function BackupArchiveNotice() {
  const [dismissed, setDismissed] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(getMonthNoticeKey()) === "true");
    } catch {}
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadNotice() {
      try {
        const res = await fetch("/api/admin/archive-notice", { cache: "no-store" });
        if (!res.ok) return;

        const json = await res.json();
        if (!ignore) {
          setNotice(json);
        }
      } catch {}
    }

    loadNotice();

    return () => {
      ignore = true;
    };
  }, []);

  const summary = useMemo(() => {
    const archivedCount = Number(notice?.archivedCount || 0);
    const dueOnNextRunCount = Number(notice?.dueOnNextRunCount || 0);

    if (!notice) {
      return {
        backupText: "Please download a backup this month so you still have a saved copy of your records.",
        archiveText: "Archived applications are cleared automatically after their storage period, so keeping a backup is recommended.",
      };
    }

    const nextCleanupRunText = formatNoticeDate(notice.nextCleanupRunAt, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const nextCutoffText = formatNoticeDate(notice.nextCleanupCutoffAt, {
      dateStyle: "long",
    });
    const nextDeleteRunText = formatNoticeDate(notice.nextPermanentDeleteRunAt, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const nextEligibleText = formatNoticeDate(notice.nextEligibleDeleteAt, {
      dateStyle: "long",
    });

    const backupText = `Please download a backup this month. Archived applications are permanently removed after ${notice.retentionMonths} months.`;

    if (!archivedCount) {
      return {
        backupText,
        archiveText: `There are no archived applications scheduled for permanent removal right now. The next archive check is on ${nextCleanupRunText}.`,
      };
    }

    if (dueOnNextRunCount > 0) {
      return {
        backupText,
        archiveText: `${dueOnNextRunCount} archived application${dueOnNextRunCount === 1 ? " will" : "s will"} be permanently removed on ${nextDeleteRunText}. This includes records archived on or before ${nextCutoffText}.`,
      };
    }

    return {
      backupText,
      archiveText: `The next archive check is on ${nextCleanupRunText}. The next archived record is expected to be ready for permanent removal on ${nextEligibleText}.`,
    };
  }, [notice]);

  if (dismissed) {
    return null;
  }

  const dismissForMonth = () => {
    try {
      window.localStorage.setItem(getMonthNoticeKey(), "true");
    } catch {}
    setDismissed(true);
  };

  return (
    <section className="mb-5 rounded-[24px] border border-[#b7d2f5] bg-[linear-gradient(135deg,#eef6ff_0%,#fff9ef_100%)] p-4 shadow-[0_12px_28px_rgba(15,23,42,0.08)] md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1f57a4] text-white shadow-[0_10px_22px_rgba(31,87,164,0.22)]">
            <Archive size={20} strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#1f57a4]">Monthly Backup Notice</p>
            <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-slate-900">Please save a backup this month</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">{summary.backupText}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{summary.archiveText}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <a
            href="/api/backup/generate?mode=full"
            className="inline-flex items-center gap-2 rounded-full bg-[#1f57a4] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#194885]"
          >
            <Download size={16} strokeWidth={2.2} />
            <span>Back Up Now</span>
          </a>
          <Link
            href="/admin/applications"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          >
            <span>Open Archive</span>
          </Link>
          <button
            type="button"
            onClick={dismissForMonth}
            className="inline-flex items-center gap-2 rounded-full border border-transparent px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-white/70 hover:text-slate-700"
          >
            <X size={16} strokeWidth={2.2} />
            <span>Hide This Month</span>
          </button>
        </div>
      </div>
    </section>
  );
}