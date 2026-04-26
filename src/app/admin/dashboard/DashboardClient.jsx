"use client";

export const dynamic = "force-dynamic";

import { CalendarClock, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/app/admin/components/AdminShell";
import { getApplicationVisaLabel } from "@/lib/application-visa";

const VIEW_OPTIONS = [
  { key: "week", label: "Weekly" },
  { key: "month", label: "Monthly" },
];

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

export default function DashboardClient({ initialUserName, initialRole }) {
  const [schedules, setSchedules] = useState([]);
  const [calendarView, setCalendarView] = useState("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [anchorDate, setAnchorDate] = useState(() => startOfDay(new Date()));

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

        setSchedules(sortSchedules(json));
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

  const weeklySchedules = useMemo(
    () =>
      weekDays.map((day) => ({
        day,
        items: schedules.filter((item) => item.scheduledAt && sameDay(item.scheduledAt, day)),
      })),
    [schedules, weekDays]
  );

  const monthlySchedules = useMemo(
    () =>
      monthGrid.map((day) => ({
        day,
        inCurrentMonth: day.getMonth() === anchorDate.getMonth(),
        items: schedules.filter((item) => item.scheduledAt && sameDay(item.scheduledAt, day)),
      })),
    [anchorDate, monthGrid, schedules]
  );

  const upcomingSchedules = useMemo(
    () =>
      schedules
        .filter((item) => item.scheduledAt && new Date(item.scheduledAt) >= new Date())
        .slice(0, 8),
    [schedules]
  );

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

  return (
    <AdminShell title="Dashboard" userName={initialUserName} role={initialRole}>
      <div className="space-y-6">
        {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <section className="overflow-hidden rounded-[28px] border border-[#cfd7e3] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
          <div className="flex flex-col gap-4 bg-[#1d4f9d] px-5 py-5 text-white md:flex-row md:items-center md:justify-between md:px-8">
            <div>
              <h2 className="text-2xl font-semibold">Schedules Calendar</h2>
              <p className="text-sm text-white/75">
                Weekly and monthly views for applications currently moved into Schedule.
              </p>
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
                {weeklySchedules.map(({ day, items }) => (
                  <div key={day.toISOString()} className="rounded-[24px] border border-[#d9e2ef] bg-[#f8fafc] p-4">
                    <div className="border-b border-[#dbe4ef] pb-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#164896]">
                        {WEEKDAY_LABELS[(day.getDay() + 6) % 7]}
                      </p>
                      <h4 className="mt-1 text-lg font-semibold text-slate-900">
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
                  {monthlySchedules.map(({ day, inCurrentMonth, items }) => (
                    <div
                      key={day.toISOString()}
                      className={[
                        "min-h-[150px] rounded-[20px] border p-3",
                        inCurrentMonth ? "border-[#d9e2ef] bg-[#f8fafc]" : "border-[#edf2f7] bg-[#fbfdff]",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${inCurrentMonth ? "text-slate-900" : "text-slate-400"}`}>
                          {day.getDate()}
                        </span>
                        {items.length ? (
                          <span className="rounded-full bg-[#164896] px-2 py-0.5 text-[11px] font-semibold text-white">
                            {items.length}
                          </span>
                        ) : null}
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
              <p className="mt-1 text-sm text-slate-500">
                Quick list of the nearest scheduled applicants and appointment times.
              </p>
            </div>
            <span className="rounded-full bg-[#eef3fa] px-3 py-1 text-sm font-semibold text-[#164896]">
              {schedules.length} total
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {loading ? null : upcomingSchedules.length ? (
              upcomingSchedules.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col gap-3 rounded-[20px] border border-[#d9e2ef] bg-[#f8fafc] px-4 py-4 md:flex-row md:items-center md:justify-between"
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
        </section>
      </div>
    </AdminShell>
  );
}
