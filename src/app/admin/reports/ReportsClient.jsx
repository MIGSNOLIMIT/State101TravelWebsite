"use client";

import { BarChart3, Eye, FileText, MousePointerClick, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import AdminShell from "@/app/admin/components/AdminShell";

const REPORT_CARDS = [
  { key: "websiteViews", label: "Website Views", icon: Eye, color: "text-[#164896]" },
  { key: "uniqueVisitors", label: "Unique Visitors", icon: Users, color: "text-[#1d8a43]" },
  { key: "applications", label: "Applications", icon: FileText, color: "text-[#0f172a]" },
  { key: "approvalRate", label: "Approval Rate", icon: TrendingUp, color: "text-[#f59e0b]", suffix: "%" },
];

function SummaryCard({ icon: Icon, label, value, color, suffix = "" }) {
  return (
    <article className="rounded-[24px] border-2 border-[#9eb8e3] bg-white px-5 py-5 shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
        <Icon size={20} className={color} />
      </div>
      <p className={`mt-5 text-4xl font-semibold leading-none ${color}`}>{value}{suffix}</p>
    </article>
  );
}

export default function ReportsClient({ initialUserName, initialRole }) {
  const [report, setReport] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/reports/monthly?year=${selectedYear}`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Failed to load reports");
        }

        const json = await res.json();
        if (ignore) return;

        setReport(json);
        setError("");
      } catch {
        if (!ignore) setError("Failed to load reports.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [selectedYear]);

  const monthly = report?.monthly || [];
  const currentMonth = report?.currentMonth;

  return (
    <AdminShell title="Reports" userName={initialUserName} role={initialRole}>
      <div className="space-y-6">
        {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <section className="overflow-hidden rounded-[28px] border-2 border-[#9eb8e3] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)] dark:border-[#5d7fb3] dark:bg-slate-900">
          <div className="flex flex-col gap-4 border-b-2 border-[#b8cae8] bg-[#f7f9fc] px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6 dark:border-[#4d6f9f] dark:bg-slate-950">
            <div>
              <h2 className="text-2xl font-semibold text-[#143f88]">Monthly Reports</h2>
              <p className="text-sm text-slate-500">Business analytics, website traffic, and application performance in one admin-only view.</p>
            </div>

            <label className="inline-flex items-center gap-3 rounded-xl border-2 border-[#b2c6e6] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 dark:border-[#4d6f9f] dark:bg-slate-900 dark:text-slate-100">
              <BarChart3 size={16} className="text-[#164896]" />
              <span>Report Year</span>
              <select
                value={selectedYear}
                onChange={(event) => setSelectedYear(Number(event.target.value))}
                className="bg-transparent font-semibold text-[#164896] outline-none dark:text-[#8fb4ea]"
              >
                {(report?.availableYears || [selectedYear]).map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="px-5 py-6 md:px-6">
            {loading ? (
              <div className="flex h-40 items-center justify-center text-sm text-slate-500">Loading monthly reports...</div>
            ) : (
              <div className="space-y-6">
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {REPORT_CARDS.map((card) => (
                    <SummaryCard
                      key={card.key}
                      icon={card.icon}
                      label={card.label}
                      color={card.color}
                      value={card.key === "approvalRate"
                        ? currentMonth?.applications
                          ? Math.round(((currentMonth?.approved || 0) / currentMonth.applications) * 100)
                          : 0
                        : currentMonth?.[card.key] || 0}
                      suffix={card.suffix}
                    />
                  ))}
                </section>

                <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                  <article className="rounded-[24px] border-2 border-[#9eb8e3] bg-[#fbfcfe] p-5 shadow-[0_10px_20px_rgba(15,23,42,0.05)] dark:border-[#5d7fb3] dark:bg-slate-950">
                    <div className="flex items-center gap-2">
                      <MousePointerClick size={18} className="text-[#164896]" />
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Top Viewed Pages</h3>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">Public website pages with the highest tracked view counts this year.</p>

                    <div className="mt-5 space-y-3">
                      {(report?.topPages || []).length === 0 ? (
                        <div className="rounded-[20px] border-2 border-dashed border-[#9eb8e3] bg-white px-4 py-8 text-center text-sm text-slate-500 dark:border-[#5d7fb3] dark:bg-slate-900">No website views tracked yet.</div>
                      ) : (
                        report.topPages.map((page) => (
                          <div key={page.path} className="flex items-center justify-between rounded-[18px] border-2 border-[#9eb8e3] bg-white px-4 py-3 dark:border-[#5d7fb3] dark:bg-slate-900">
                            <div>
                              <p className="font-medium text-slate-900 dark:text-slate-100">{page.label || page.path}</p>
                              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Tracked public page</p>
                            </div>
                            <span className="text-lg font-semibold text-[#164896]">{page.views}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </article>

                  <article className="rounded-[24px] border-2 border-[#9eb8e3] bg-[#fbfcfe] p-5 shadow-[0_10px_20px_rgba(15,23,42,0.05)] dark:border-[#5d7fb3] dark:bg-slate-950">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Monthly Report Table</h3>
                    <p className="mt-1 text-sm text-slate-500">A compact monthly summary for reporting and export-ready review.</p>

                    <div className="mt-5 overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead>
                          <tr className="border-b-2 border-[#b8cae8] text-slate-500 dark:border-[#4d6f9f]">
                            <th className="py-2 pr-4 font-semibold">Month</th>
                            <th className="py-2 pr-4 font-semibold">Views</th>
                            <th className="py-2 pr-4 font-semibold">Applications</th>
                            <th className="py-2 pr-4 font-semibold">Approved</th>
                            <th className="py-2 font-semibold">Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthly.map((item) => (
                            <tr key={item.label} className="border-b border-[#d6e1f1] last:border-b-0 dark:border-[#415e89]">
                              <td className="py-2 pr-4 font-medium text-slate-800 dark:text-slate-100">{item.label}</td>
                              <td className="py-2 pr-4 text-slate-600 dark:text-slate-300">{item.websiteViews}</td>
                              <td className="py-2 pr-4 text-slate-600 dark:text-slate-300">{item.applications}</td>
                              <td className="py-2 pr-4 text-slate-600 dark:text-slate-300">{item.approved}</td>
                              <td className="py-2 font-semibold text-[#164896]">{item.approvalRate || 0}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </article>
                </section>
              </div>
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}