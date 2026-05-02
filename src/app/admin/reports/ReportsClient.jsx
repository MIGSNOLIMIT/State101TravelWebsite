"use client";

import { BarChart3, Download, Eye, FileText, MousePointerClick, Printer, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import AdminShell from "@/app/admin/components/AdminShell";

const REPORT_CARDS = [
  { key: "websiteViews", label: "Website Views", icon: Eye, color: "text-[#164896]" },
  { key: "uniqueVisitors", label: "Unique Visitors", icon: Users, color: "text-[#1d8a43]" },
  { key: "applications", label: "Applications", icon: FileText, color: "text-[#0f172a]" },
  { key: "scheduledRate", label: "Scheduled Rate", icon: TrendingUp, color: "text-[#f59e0b]", suffix: "%" },
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

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapePdfText(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function buildMonthlyReportPdf(rows, year) {
  const encoder = new TextEncoder();
  const pageWidth = 595;
  const pageHeight = 842;
  const tableLeft = 48;
  const tableTop = 690;
  const rowHeight = 28;
  const columns = [
    { label: "Month", key: "month", width: 120 },
    { label: "Views", key: "views", width: 80 },
    { label: "Applications", key: "applications", width: 110 },
    { label: "Scheduled", key: "scheduled", width: 90 },
    { label: "Scheduled Rate", key: "scheduledRate", width: 100 },
  ];
  const tableWidth = columns.reduce((sum, column) => sum + column.width, 0);
  const totalRows = rows.length + 1;
  const tableBottom = tableTop - totalRows * rowHeight;
  const commands = [
    "0 0 0 rg",
    `BT /F1 20 Tf 1 0 0 1 48 ${pageHeight - 56} Tm (${escapePdfText("Monthly Report Table")}) Tj ET`,
    `BT /F1 11 Tf 1 0 0 1 48 ${pageHeight - 78} Tm (${escapePdfText(`Report Year: ${year}`)}) Tj ET`,
    "0.93 0.96 1 rg",
    `${tableLeft} ${tableTop - rowHeight} ${tableWidth} ${rowHeight} re f`,
    "0.78 0.84 0.91 RG",
    "0.8 w",
  ];

  for (let rowIndex = 0; rowIndex <= totalRows; rowIndex += 1) {
    const y = tableTop - rowIndex * rowHeight;
    commands.push(`${tableLeft} ${y} m ${tableLeft + tableWidth} ${y} l S`);
  }

  let x = tableLeft;
  commands.push(`${tableLeft} ${tableBottom} m ${tableLeft} ${tableTop} l S`);
  for (const column of columns) {
    x += column.width;
    commands.push(`${x} ${tableBottom} m ${x} ${tableTop} l S`);
  }

  commands.push("0 0 0 rg");

  let textX = tableLeft + 8;
  for (const column of columns) {
    commands.push(`BT /F1 10 Tf 1 0 0 1 ${textX} ${tableTop - 18} Tm (${escapePdfText(column.label)}) Tj ET`);
    textX += column.width;
  }

  rows.forEach((row, index) => {
    const baseY = tableTop - rowHeight * (index + 1) - 18;
    let rowX = tableLeft + 8;

    for (const column of columns) {
      commands.push(`BT /F1 10 Tf 1 0 0 1 ${rowX} ${baseY} Tm (${escapePdfText(row[column.key])}) Tj ET`);
      rowX += column.width;
    }
  });

  const content = commands.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>`,
    `<< /Length ${encoder.encode(content).length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(encoder.encode(pdf).length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = encoder.encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return encoder.encode(pdf);
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
  const monthlyRows = monthly.map((item) => ({
    month: item.label,
    views: item.websiteViews,
    applications: item.applications,
    scheduled: item.scheduled,
    scheduledRate: `${item.scheduledRate || 0}%`,
  }));

  const handleExportExcel = () => {
    const headers = ["Month", "Views", "Applications", "Scheduled", "Scheduled Rate"];
    const rows = monthlyRows.map((row) => [
      row.month,
      row.views,
      row.applications,
      row.scheduled,
      row.scheduledRate,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    downloadFile(`monthly-report-${selectedYear}.csv`, csv, "text/csv;charset=utf-8;");
  };

  const handlePrintTable = () => {
    const tableRows = monthlyRows
      .map(
        (row) => `
          <tr>
            <td>${row.month}</td>
            <td>${row.views}</td>
            <td>${row.applications}</td>
            <td>${row.scheduled}</td>
            <td>${row.scheduledRate}</td>
          </tr>
        `
      )
      .join("");

    const printWindow = window.open("", "_blank", "width=960,height=700");
    if (!printWindow) return;

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Monthly Report ${selectedYear}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            h1 { margin: 0 0 8px; }
            p { margin: 0 0 20px; color: #475569; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; }
            th { background: #eff6ff; }
          </style>
        </head>
        <body>
          <h1>Monthly Report Table</h1>
          <p>Report Year: ${selectedYear}</p>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Views</th>
                <th>Applications</th>
                <th>Scheduled</th>
                <th>Scheduled Rate</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleExportPdf = () => {
    const pdfBytes = buildMonthlyReportPdf(monthlyRows, selectedYear);
    downloadFile(`monthly-report-${selectedYear}.pdf`, pdfBytes, "application/pdf");
  };

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
                      value={card.key === "scheduledRate"
                        ? currentMonth?.applications
                          ? Math.round(((currentMonth?.scheduled || 0) / currentMonth.applications) * 100)
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
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Monthly Report Table</h3>
                        <p className="mt-1 text-sm text-slate-500">A compact monthly summary for reporting, printing, and export.</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={handlePrintTable}
                          className="inline-flex items-center gap-2 rounded-xl border border-[#cbd5e1] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          <Printer size={16} />
                          Print
                        </button>
                        <button
                          type="button"
                          onClick={handleExportExcel}
                          className="inline-flex items-center gap-2 rounded-xl border border-[#1d8a43] bg-[#1d8a43] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#176c35]"
                        >
                          <Download size={16} />
                          Export Excel
                        </button>
                        <button
                          type="button"
                          onClick={handleExportPdf}
                          className="inline-flex items-center gap-2 rounded-xl border border-[#164896] bg-[#164896] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#103773]"
                        >
                          <Download size={16} />
                          Export PDF
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead>
                          <tr className="border-b-2 border-[#b8cae8] text-slate-500 dark:border-[#4d6f9f]">
                            <th className="py-2 pr-4 font-semibold">Month</th>
                            <th className="py-2 pr-4 font-semibold">Views</th>
                            <th className="py-2 pr-4 font-semibold">Applications</th>
                            <th className="py-2 pr-4 font-semibold">Scheduled</th>
                            <th className="py-2 font-semibold">Scheduled Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthly.map((item) => (
                            <tr key={item.label} className="border-b border-[#d6e1f1] last:border-b-0 dark:border-[#415e89]">
                              <td className="py-2 pr-4 font-medium text-slate-800 dark:text-slate-100">{item.label}</td>
                              <td className="py-2 pr-4 text-slate-600 dark:text-slate-300">{item.websiteViews}</td>
                              <td className="py-2 pr-4 text-slate-600 dark:text-slate-300">{item.applications}</td>
                              <td className="py-2 pr-4 text-slate-600 dark:text-slate-300">{item.scheduled}</td>
                              <td className="py-2 font-semibold text-[#164896]">{item.scheduledRate || 0}%</td>
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
