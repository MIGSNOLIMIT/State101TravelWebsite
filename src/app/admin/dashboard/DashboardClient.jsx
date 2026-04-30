"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { CalendarClock, CheckCircle2, ChevronLeft, ChevronRight, Clock3, FileText, Pin, Save, Search, ShieldAlert, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/app/admin/components/AdminShell";
import { APPLICATION_STATUS_ORDER, getApplicationStatusLabel } from "@/lib/application-status";
import { getApplicationVisaLabel } from "@/lib/application-visa";

const VIEW_OPTIONS = [
  { key: "week", label: "Weekly" },
  { key: "month", label: "Monthly" },
];
const UPCOMING_SCHEDULES_STEP = 5;

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const NOTE_MAX_LENGTH = 500;
const NOTE_TAG_OPTIONS = [
  { value: "IMPORTANT", label: "Important" },
  { value: "FOLLOW_UP", label: "Follow-Up" },
  { value: "REMINDER", label: "Reminder" },
];
const NOTE_TAG_STYLES = {
  IMPORTANT: "border-rose-200 bg-rose-50 text-rose-700",
  FOLLOW_UP: "border-blue-200 bg-blue-50 text-blue-700",
  REMINDER: "border-amber-200 bg-amber-50 text-amber-700",
};

const DASHBOARD_STATUS_CARD_META = {
  NEW: {
    icon: Clock3,
    accentClass: "border-slate-200 bg-slate-50 text-slate-700",
    valueClass: "text-slate-900",
  },
  IN_REVIEW: {
    icon: Search,
    accentClass: "border-amber-200 bg-amber-50 text-amber-700",
    valueClass: "text-amber-700",
  },
  APPROVED: {
    icon: CheckCircle2,
    accentClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    valueClass: "text-emerald-700",
  },
  PENDING: {
    icon: ShieldAlert,
    accentClass: "border-rose-200 bg-rose-50 text-rose-700",
    valueClass: "text-rose-700",
  },
  SCHEDULED: {
    icon: CalendarClock,
    accentClass: "border-blue-200 bg-blue-50 text-blue-700",
    valueClass: "text-[#164896]",
  },
};

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function startOfWeek(date) {
  const value = startOfDay(date);
  const day = value.getDay();
  const diff = (day + 6) % 7;
  value.setDate(value.getDate() - diff);
  return value;
}

function addDays(date, days) {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

function sameDay(left, right) {
  return startOfDay(left).getTime() === startOfDay(right).getTime();
}

function formatDate(date, options) {
  return new Date(date).toLocaleDateString("en-US", options);
}

function formatDateTime(date) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatNoteMeta(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatNoteDateTime(date) {
  if (!date) return "";
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildWeekDays(anchorDate) {
  const weekStart = startOfWeek(anchorDate);
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}

function buildMonthGrid(anchorDate) {
  const monthStart = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const gridStart = startOfWeek(monthStart);

  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

function sortSchedules(items) {
  return [...items].sort((left, right) => new Date(left.scheduledAt) - new Date(right.scheduledAt));
}

function formatDateKey(date) {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getNoteTagLabel(tag) {
  return NOTE_TAG_OPTIONS.find((option) => option.value === tag)?.label || "Reminder";
}

function getNoteTagClass(tag) {
  return NOTE_TAG_STYLES[tag] || NOTE_TAG_STYLES.REMINDER;
}

function buildNotesMap(items = []) {
  return items.reduce((accumulator, item) => {
    if (item?.noteDate) {
      accumulator[item.noteDate] = {
        note: item.note || "",
        tag: item.tag || "REMINDER",
        updatedAt: item.updatedAt || null,
        authorName: item.actorName || item.actorEmail || "Admin",
        canEdit: Boolean(item.canEdit),
        history: Array.isArray(item.history) ? item.history : [],
      };
    }
    return accumulator;
  }, {});
}

export default function DashboardClient({ initialUserName, initialRole }) {
  const isAdmin = initialRole === "admin";
  const [schedules, setSchedules] = useState([]);
  const [calendarNotes, setCalendarNotes] = useState({});
  const [statusCounts, setStatusCounts] = useState({
    NEW: 0,
    IN_REVIEW: 0,
    SCHEDULED: 0,
    APPROVED: 0,
    PENDING: 0,
  });
  const [calendarView, setCalendarView] = useState("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [anchorDate, setAnchorDate] = useState(() => startOfDay(new Date()));
  const [noteDialogDate, setNoteDialogDate] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [noteTag, setNoteTag] = useState("REMINDER");
  const [noteHistory, setNoteHistory] = useState([]);
  const [savingNote, setSavingNote] = useState(false);
  const [loadingNoteDetails, setLoadingNoteDetails] = useState(false);
  const [visibleUpcomingCount, setVisibleUpcomingCount] = useState(UPCOMING_SCHEDULES_STEP);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      try {
        const response = await fetch("/api/application/metrics", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load dashboard schedules");
        }

        const json = await response.json();
        if (ignore) return;

        const sortedSchedules = sortSchedules(json.schedules || []);
        setSchedules(sortedSchedules);
        if (sortedSchedules.length) {
          const now = new Date();
          const nextScheduledItem = sortedSchedules.find((item) => item?.scheduledAt && new Date(item.scheduledAt) >= now) || sortedSchedules[0];
          if (nextScheduledItem?.scheduledAt) {
            setAnchorDate(startOfDay(new Date(nextScheduledItem.scheduledAt)));
          }
        }
        setCalendarNotes(buildNotesMap(json.notes || []));
        setStatusCounts((current) => ({
          ...current,
          ...(json.counts || {}),
        }));
        setError("");
      } catch {
        if (!ignore) setError("Failed to load dashboard schedules.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  const weekDays = useMemo(() => buildWeekDays(anchorDate), [anchorDate]);
  const monthGrid = useMemo(() => buildMonthGrid(anchorDate), [anchorDate]);
  const todayKey = useMemo(() => formatDateKey(new Date()), []);

  const weeklySchedules = useMemo(
    () =>
      weekDays.map((day) => ({
        day,
        noteKey: formatDateKey(day),
        items: schedules.filter((item) => item.scheduledAt && sameDay(item.scheduledAt, day)),
      })),
    [schedules, weekDays]
  );

  const monthlySchedules = useMemo(
    () =>
      monthGrid.map((day) => ({
        day,
        noteKey: formatDateKey(day),
        inCurrentMonth: day.getMonth() === anchorDate.getMonth(),
        items: schedules.filter((item) => item.scheduledAt && sameDay(item.scheduledAt, day)),
      })),
    [anchorDate, monthGrid, schedules]
  );

  const upcomingSchedules = useMemo(
    () =>
      schedules
        .filter((item) => item.scheduledAt && new Date(item.scheduledAt) >= new Date()),
    [schedules]
  );

  const visibleUpcomingSchedules = useMemo(
    () => upcomingSchedules.slice(0, visibleUpcomingCount),
    [upcomingSchedules, visibleUpcomingCount]
  );

  useEffect(() => {
    setVisibleUpcomingCount((current) => Math.min(Math.max(UPCOMING_SCHEDULES_STEP, current), Math.max(upcomingSchedules.length, UPCOMING_SCHEDULES_STEP)));
  }, [upcomingSchedules.length]);

  const title =
    calendarView === "week"
      ? `${formatDate(weekDays[0], { month: "short", day: "numeric" })} - ${formatDate(weekDays[6], {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`
      : formatDate(anchorDate, { month: "long", year: "numeric" });

  const moveCalendar = (direction) => {
    setAnchorDate((current) => {
      const next = new Date(current);
      if (calendarView === "week") {
        next.setDate(current.getDate() + direction * 7);
      } else {
        next.setMonth(current.getMonth() + direction);
      }
      return startOfDay(next);
    });
  };

  const canEditNote = (noteKey) => isAdmin && (!calendarNotes[noteKey] || calendarNotes[noteKey]?.canEdit);

  const openNoteDialog = async (noteKey) => {
    setNoteDialogDate(noteKey);
    setNoteDraft(calendarNotes[noteKey]?.note || "");
    setNoteTag(calendarNotes[noteKey]?.tag || "REMINDER");
    setNoteHistory(calendarNotes[noteKey]?.history || []);
    setLoadingNoteDetails(true);

    try {
      const response = await fetch(`/api/admin/dashboard-notes?noteDate=${noteKey}`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to load note details");
      }

      const json = await response.json();
      setNoteDraft(json.note || "");
      setNoteTag(json.tag || "REMINDER");
      setNoteHistory(Array.isArray(json.history) ? json.history : []);
      setCalendarNotes((current) => ({
        ...current,
        [noteKey]: {
          note: json.note || "",
          tag: json.tag || "REMINDER",
          updatedAt: json.updatedAt || null,
          authorName: json.actorName || json.actorEmail || "Admin",
          canEdit: Boolean(json.canEdit),
          history: Array.isArray(json.history) ? json.history : [],
        },
      }));
    } catch {
      setError("Failed to load calendar note.");
    } finally {
      setLoadingNoteDetails(false);
    }
  };

  const closeNoteDialog = () => {
    if (savingNote) return;
    setNoteDialogDate("");
    setNoteDraft("");
    setNoteTag("REMINDER");
    setNoteHistory([]);
  };

  const saveCalendarNote = async () => {
    if (!noteDialogDate) return;

    setSavingNote(true);
    try {
      const response = await fetch("/api/admin/dashboard-notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noteDate: noteDialogDate,
          note: noteDraft,
          tag: noteTag,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save calendar note");
      }

      const json = await response.json();
      setCalendarNotes((current) => {
        const next = { ...current };
        if (json.note) {
          next[noteDialogDate] = {
            note: json.note,
            tag: json.tag || "REMINDER",
            updatedAt: json.updatedAt || null,
            authorName: json.actorName || json.actorEmail || "Admin",
            canEdit: Boolean(json.canEdit),
            history: Array.isArray(json.history) ? json.history : [],
          };
        } else {
          delete next[noteDialogDate];
        }
        return next;
      });
      closeNoteDialog();
    } catch {
      setError("Failed to save calendar note.");
    } finally {
      setSavingNote(false);
    }
  };

  const renderCalendarNote = (noteKey, compact = false) => {
    const currentNote = calendarNotes[noteKey]?.note || "";
    const noteMeta = calendarNotes[noteKey];
    const canEdit = canEditNote(noteKey);

    if (!currentNote && !isAdmin) {
      return null;
    }

    return (
      <div className={`mt-3 ${compact ? "space-y-2" : "space-y-2.5"}`}>
        {currentNote ? (
          <button
            type="button"
            onClick={() => openNoteDialog(noteKey)}
            className={[
              "w-full rounded-[16px] border border-[#e0d2a4] bg-[#fff9e8] text-left text-slate-700 transition hover:border-[#c8b06b] hover:bg-[#fff5d7]",
              compact ? "px-2.5 py-2 text-[11px] leading-5" : "px-3 py-3 text-xs leading-5",
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-semibold uppercase tracking-[0.16em] text-[#8b6a16]">
                <FileText size={compact ? 12 : 13} />
                Note
              </div>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getNoteTagClass(noteMeta?.tag)}`}>
                {getNoteTagLabel(noteMeta?.tag)}
              </span>
            </div>
            {noteMeta?.authorName || noteMeta?.updatedAt ? (
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9a7b28]">
                {`Note: ${noteMeta?.authorName || "Admin"}${noteMeta?.updatedAt ? `. ${formatNoteMeta(noteMeta.updatedAt)}` : ""}`}
              </p>
            ) : null}
            <p className={`mt-1 whitespace-pre-wrap break-words ${compact ? "line-clamp-3" : ""}`}>{currentNote}</p>
          </button>
        ) : null}

        {canEdit ? (
          <button
            type="button"
            onClick={() => openNoteDialog(noteKey)}
            className={[
              "inline-flex items-center gap-2 rounded-full border border-[#d4dce6] bg-white font-semibold text-[#164896] transition hover:border-[#164896] hover:bg-[#f7fbff]",
              compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
            ].join(" ")}
          >
            <FileText size={compact ? 12 : 14} />
            {currentNote ? "Edit Note" : "Add Note"}
          </button>
        ) : null}
      </div>
    );
  };

  return (
    <AdminShell title="Dashboard" userName={initialUserName} role={initialRole}>
      <div className="space-y-6">
        {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <section className="rounded-[28px] border-2 border-[#c2cfdf] bg-[linear-gradient(180deg,rgba(247,250,252,0.95),rgba(255,255,255,1))] p-5 shadow-[0_16px_34px_rgba(15,23,42,0.08)] md:p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#164896]">Application Overview</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Application Status Summary</h2>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {APPLICATION_STATUS_ORDER.map((status) => {
              const card = DASHBOARD_STATUS_CARD_META[status];
              const Icon = card.icon;
              const sharedClassName = [
                "group flex h-full flex-col justify-between rounded-[24px] border-2 px-5 py-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_10px_24px_rgba(15,23,42,0.08)] transition",
                isAdmin
                  ? "border-[#c8d5e4] bg-[linear-gradient(180deg,#ffffff,#f8fbff)] hover:-translate-y-0.5 hover:border-[#9db3cf] hover:shadow-[0_16px_28px_rgba(15,23,42,0.12)]"
                  : "border-[#ced8e5] bg-[linear-gradient(180deg,#fbfcfe,#f4f7fb)]",
              ].join(" ");

              const content = (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <span className={`inline-flex h-12 w-12 items-center justify-center rounded-full border ${card.accentClass}`}>
                      <Icon size={22} strokeWidth={2.2} />
                    </span>
                    <span className={`text-4xl font-semibold leading-none ${card.valueClass}`}>
                      {loading ? "-" : statusCounts[status] || 0}
                    </span>
                  </div>
                  <div className="mt-8 border-t border-[#e6edf5] pt-4">
                    <h3 className="text-lg font-semibold text-slate-900">{getApplicationStatusLabel(status)} Applications</h3>
                  </div>
                </>
              );

              if (!isAdmin) {
                return (
                  <div key={status} className={sharedClassName} aria-disabled="true">
                    {content}
                  </div>
                );
              }

              return (
                <Link
                  key={status}
                  href={`/admin/applications?status=${status}`}
                  className={sharedClassName}
                >
                  {content}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-[#cfd7e3] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
          <div className="flex flex-col gap-4 bg-[#1d4f9d] px-5 py-5 text-white md:flex-row md:items-center md:justify-between md:px-8">
            <div>
              <h2 className="text-2xl font-semibold">Scheduled Calendar</h2>
            </div>
            <div className="inline-flex rounded-xl bg-white/15 p-1">
              {VIEW_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setCalendarView(option.key)}
                  className={[
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                    calendarView === option.key ? "bg-[#0f1f77] text-white" : "text-white/70 hover:text-white",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-b border-[#e2e8f0] px-5 py-4 md:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#164896]">Current View</p>
                <h3 className="mt-1 text-2xl font-semibold text-slate-900">{title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => moveCalendar(-1)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#cbd5e1] text-slate-600 transition hover:bg-slate-50"
                  aria-label="Previous range"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setAnchorDate(startOfDay(new Date()))}
                  className="rounded-full bg-[#164896] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#103773]"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => moveCalendar(1)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#cbd5e1] text-slate-600 transition hover:bg-slate-50"
                  aria-label="Next range"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="px-5 py-6 md:px-8">
            {loading ? (
              <div className="flex h-[420px] items-center justify-center text-sm text-slate-500">Loading schedules...</div>
            ) : calendarView === "week" ? (
              <div className="grid gap-4 xl:grid-cols-7">
                {weeklySchedules.map(({ day, noteKey, items }) => (
                  <div
                    key={day.toISOString()}
                    className={[
                      "rounded-[24px] border border-black bg-[#f8fafc] p-4",
                      noteKey === todayKey
                        ? "bg-[#fff5f5] shadow-[0_0_0_3px_rgba(220,38,38,0.18)]"
                        : "",
                    ].join(" ")}
                  >
                    <div className="border-b border-[#dbe4ef] pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#164896]">
                          {WEEKDAY_LABELS[(day.getDay() + 6) % 7]}
                        </p>
                        {noteKey === todayKey ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                            <Pin size={10} />
                            Today
                          </span>
                        ) : null}
                      </div>
                      <h4 className={`mt-1 text-lg font-semibold ${noteKey === todayKey ? "font-bold text-red-600" : "text-slate-900"}`}>
                        {formatDate(day, { month: "short", day: "numeric" })}
                      </h4>
                    </div>
                    <div className="mt-4 space-y-3">
                      {items.length ? (
                        items.map((item) => (
                          <article
                            key={item.id}
                            className="rounded-[18px] border border-[#c9d8ee] bg-white p-3 shadow-sm"
                          >
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#164896]">
                              <CalendarClock size={14} />
                              {formatTime(item.scheduledAt)}
                            </div>
                            <p className="mt-2 text-sm font-semibold text-slate-900">{item.fullName}</p>
                            <p className="mt-1 text-xs text-slate-500">{getApplicationVisaLabel(item.visaType)}</p>
                          </article>
                        ))
                      ) : (
                        <div className="rounded-[18px] border border-dashed border-[#c9d8ee] px-3 py-6 text-center text-sm text-slate-400">
                          No schedules
                        </div>
                      )}
                    </div>
                    {renderCalendarNote(noteKey)}
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="mb-3 grid grid-cols-7 gap-3">
                  {WEEKDAY_LABELS.map((label) => (
                    <div key={label} className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      {label}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-3">
                  {monthlySchedules.map(({ day, noteKey, inCurrentMonth, items }) => (
                    <div
                      key={day.toISOString()}
                      className={[
                        "min-h-[190px] rounded-[20px] border p-3",
                        noteKey === todayKey
                          ? "border-black bg-[#fff5f5] shadow-[0_0_0_3px_rgba(220,38,38,0.18)]"
                          : inCurrentMonth
                            ? "border-black bg-[#f8fafc]"
                            : "border-black bg-[#fbfdff]",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${noteKey === todayKey ? "font-bold text-red-600" : inCurrentMonth ? "text-slate-900" : "text-slate-400"}`}>
                          {day.getDate()}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {noteKey === todayKey ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                              <Pin size={10} />
                              Today
                            </span>
                          ) : null}
                          {items.length ? (
                            <span className="rounded-full bg-[#164896] px-2 py-0.5 text-[11px] font-semibold text-white">
                              {items.length}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        {items.slice(0, 3).map((item) => (
                          <article
                            key={item.id}
                            className="rounded-[16px] border border-[#c9d8ee] bg-white px-2.5 py-2 text-left shadow-sm"
                          >
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#164896]">
                              {formatTime(item.scheduledAt)}
                            </p>
                            <p className="mt-1 line-clamp-2 text-xs font-medium text-slate-700">{item.fullName}</p>
                          </article>
                        ))}
                        {items.length > 3 ? (
                          <p className="text-xs font-medium text-slate-500">+{items.length - 3} more</p>
                        ) : null}
                        {renderCalendarNote(noteKey, true)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-[#d4dce6] bg-white p-5 shadow-[0_16px_34px_rgba(15,23,42,0.08)] md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Upcoming Scheduled Applications</h3>
            </div>
            <span className="rounded-full bg-[#eef3fa] px-3 py-1 text-sm font-semibold text-[#164896]">
              {upcomingSchedules.length} total
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {loading ? null : upcomingSchedules.length ? (
              visibleUpcomingSchedules.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col gap-3 rounded-[20px] border-2 border-black bg-[#f8fafc] px-4 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{item.fullName}</p>
                    <p className="mt-1 text-sm text-slate-500">{getApplicationVisaLabel(item.visaType)}</p>
                  </div>
                  <div className="text-sm font-medium text-slate-700">
                    {formatDateTime(item.scheduledAt)}
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[22px] border border-dashed border-[#c9d8ee] px-4 py-10 text-center text-sm text-slate-500">
                No scheduled applications yet.
              </div>
            )}
          </div>

          {!loading && upcomingSchedules.length > UPCOMING_SCHEDULES_STEP ? (
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {visibleUpcomingCount < upcomingSchedules.length ? (
                <button
                  type="button"
                  onClick={() =>
                    setVisibleUpcomingCount((current) => Math.min(current + UPCOMING_SCHEDULES_STEP, upcomingSchedules.length))
                  }
                  className="rounded-full bg-[#164896] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#103773]"
                >
                  Show More Scheduled
                </button>
              ) : null}

              {visibleUpcomingCount > UPCOMING_SCHEDULES_STEP ? (
                <button
                  type="button"
                  onClick={() =>
                    setVisibleUpcomingCount((current) => Math.max(UPCOMING_SCHEDULES_STEP, current - UPCOMING_SCHEDULES_STEP))
                  }
                  className="rounded-full border border-[#cbd5e1] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Show Less Scheduled
                </button>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>

      {noteDialogDate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/32 p-4">
          <div className="w-full max-w-2xl rounded-[28px] border border-[#d8e1ec] bg-white p-6 shadow-[0_24px_64px_rgba(15,23,42,0.24)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#164896]">Calendar Note</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900">{noteDialogDate}</h3>
              </div>
              <button
                type="button"
                onClick={closeNoteDialog}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d8e1ec] text-slate-500 transition hover:bg-slate-50"
                aria-label="Close note dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getNoteTagClass(noteTag)}`}>
                    {getNoteTagLabel(noteTag)}
                  </span>
                  {canEditNote(noteDialogDate) ? (
                    <span className="text-xs font-semibold text-slate-500">{noteDraft.length}/{NOTE_MAX_LENGTH}</span>
                  ) : null}
                </div>

                {canEditNote(noteDialogDate) ? (
                  <>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {NOTE_TAG_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setNoteTag(option.value)}
                          className={[
                            "rounded-full border px-3 py-1 text-xs font-semibold transition",
                            noteTag === option.value
                              ? getNoteTagClass(option.value)
                              : "border-[#d4dce6] bg-white text-slate-600 hover:bg-slate-50",
                          ].join(" ")}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={noteDraft}
                      onChange={(event) => setNoteDraft(event.target.value)}
                      rows={8}
                      maxLength={NOTE_MAX_LENGTH}
                      className="w-full rounded-[20px] border border-[#cfd7e3] bg-[#fbfdff] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#164896] focus:ring-2 focus:ring-[#164896]/15"
                    />
                  </>
                ) : (
                  <div className="rounded-[20px] border border-[#e0d2a4] bg-[#fff9e8] px-4 py-4 text-sm leading-6 text-slate-700">
                    {loadingNoteDetails ? "Loading..." : noteDraft || "No note."}
                  </div>
                )}
              </div>

              <div className="rounded-[22px] border border-[#d8e1ec] bg-[#f8fafc] p-4">
                <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#164896]">History</h4>
                <div className="mt-3 space-y-3">
                  {loadingNoteDetails ? (
                    <div className="text-sm text-slate-500">Loading...</div>
                  ) : noteHistory.length ? (
                    noteHistory.map((entry) => (
                      <div key={entry.id} className="rounded-[18px] border border-[#dbe4ef] bg-white px-3 py-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getNoteTagClass(entry.tag)}`}>
                            {getNoteTagLabel(entry.tag)}
                          </span>
                          <span className="text-[10px] font-medium text-slate-500">{formatNoteDateTime(entry.createdAt)}</span>
                        </div>
                        <p className="mt-2 text-xs font-semibold text-slate-700">{entry.actorName || entry.actorEmail || "Admin"}</p>
                        <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-600">{entry.note}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-slate-500">No history yet.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeNoteDialog}
                className="rounded-full border border-[#d4dce6] px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Close
              </button>
              {canEditNote(noteDialogDate) ? (
                <button
                  type="button"
                  onClick={saveCalendarNote}
                  disabled={savingNote || loadingNoteDetails}
                  className="inline-flex items-center gap-2 rounded-full bg-[#164896] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#103773] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Save size={16} />
                  {savingNote ? "Saving" : "Save"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
