"use client";

import { Activity, AlertTriangle, Filter, Search, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import AdminShell from "@/app/admin/components/AdminShell";
import { AUDIT_LOG_ACTION_OPTIONS, AUDIT_LOG_CATEGORIES, AUDIT_LOG_STATUSES, getAuditLabel } from "@/lib/audit-log-config";

function formatDateTime(value) {
	if (!value) return "Unknown";
	return new Date(value).toLocaleString();
}

function SummaryCard({ icon: Icon, label, value, tone = "blue" }) {
	const tones = {
		blue: "text-[#164896] bg-[#eaf1fb]",
		green: "text-[#1d8a43] bg-[#eaf8ef]",
		amber: "text-[#b45309] bg-[#fff7ed]",
	};

	return (
		<article className="rounded-[24px] border-2 border-[#9eb8e3] bg-white px-5 py-5 shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
			<div className="flex items-center justify-between">
				<p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
				<span className={`flex h-10 w-10 items-center justify-center rounded-full ${tones[tone]}`}>
					<Icon size={18} />
				</span>
			</div>
			<p className="mt-5 text-4xl font-semibold leading-none text-slate-900">{value}</p>
		</article>
	);
}

function DetailValue({ label, value }) {
	return (
		<div>
			<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
			<p className="mt-1 break-words text-sm text-slate-700">{value || "-"}</p>
		</div>
	);
}

export default function LogsClient({ initialUserName, initialRole }) {
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState("all");
	const [action, setAction] = useState("all");
	const [actorRole, setActorRole] = useState("all");
	const [status, setStatus] = useState("all");
	const [dateTo, setDateTo] = useState("");
	const [page, setPage] = useState(1);
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [selectedItem, setSelectedItem] = useState(null);

	useEffect(() => {
		let ignore = false;

		async function load() {
			setLoading(true);
			const params = new URLSearchParams({
				q: search,
				category,
				action,
				actorRole,
				status,
				page: String(page),
				tzOffset: String(new Date().getTimezoneOffset()),
			});

			if (dateTo) params.set("dateTo", dateTo);

			try {
				const res = await fetch(`/api/admin/audit-logs?${params.toString()}`, { cache: "no-store" });
				if (!res.ok) {
					throw new Error("Failed to load audit logs");
				}

				const json = await res.json();
				if (ignore) return;

				setData(json);
				setError("");
			} catch {
				if (!ignore) setError("Failed to load audit logs.");
			} finally {
				if (!ignore) setLoading(false);
			}
		}

		load();
		return () => {
			ignore = true;
		};
	}, [search, category, action, actorRole, status, dateTo, page]);

	return (
		<AdminShell title="Audit Logs" userName={initialUserName} role={initialRole}>
			<div className="space-y-6">
				{error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

				<section className="grid gap-4 md:grid-cols-3">
					<SummaryCard icon={Activity} label="Events Today" value={data?.summary?.totalToday || 0} tone="blue" />
					<SummaryCard icon={UserCheck} label="Successful Logins Today" value={data?.summary?.loginCount || 0} tone="green" />
					<SummaryCard icon={AlertTriangle} label="Failures In 7 Days" value={data?.summary?.failureCount || 0} tone="amber" />
				</section>

				<section className="overflow-hidden rounded-[28px] border-2 border-[#9eb8e3] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
					<div className="border-b-2 border-[#b8cae8] bg-[#f7f9fc] px-5 py-5 md:px-6">
						<div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
							<div>
								<h2 className="text-2xl font-semibold text-[#143f88]">Admin Activity Stream</h2>
								<p className="mt-1 text-sm text-slate-500">Search and Filter logs.</p>
							</div>
						</div>

						<div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
							<label className="relative md:col-span-2 xl:col-span-2">
								<Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
								<input
									type="text"
									value={search}
									onChange={(event) => {
										setSearch(event.target.value);
										setPage(1);
									}}
									placeholder="Search actor, action, target, or summary"
									className="w-full rounded-xl border-2 border-[#b2c6e6] bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#164896]"
								/>
							</label>

							<select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} className="rounded-xl border-2 border-[#b2c6e6] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#164896]">
								{AUDIT_LOG_CATEGORIES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
							</select>

							<select value={action} onChange={(event) => { setAction(event.target.value); setPage(1); }} className="rounded-xl border-2 border-[#b2c6e6] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#164896]">
								{AUDIT_LOG_ACTION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
							</select>

							<select value={actorRole} onChange={(event) => { setActorRole(event.target.value); setPage(1); }} className="rounded-xl border-2 border-[#b2c6e6] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#164896]">
								<option value="all">All Roles</option>
								<option value="admin">Admin</option>
								<option value="editor">Editor</option>
							</select>

							<select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="rounded-xl border-2 border-[#b2c6e6] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#164896]">
								{AUDIT_LOG_STATUSES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
							</select>

							<label className="flex items-center gap-2 rounded-xl border-2 border-[#b2c6e6] bg-white px-3 py-2.5 text-sm text-slate-600">
								<Filter size={15} />
								<input type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPage(1); }} className="w-full bg-transparent outline-none" />
							</label>
						</div>
					</div>

					<div className="px-5 py-6 md:px-6">
						{loading ? (
							<div className="flex h-40 items-center justify-center text-sm text-slate-500">Loading audit logs...</div>
						) : !(data?.items || []).length ? (
							<div className="rounded-[24px] border-2 border-dashed border-[#9eb8e3] bg-[#f8fafc] px-6 py-12 text-center text-sm text-slate-500">No audit events found for the current filters.</div>
						) : (
							<div className="space-y-4">
								{data.items.map((item) => (
									<button
										key={item.id}
										type="button"
										onClick={() => setSelectedItem(item)}
										className="w-full rounded-[24px] border-2 border-[#d7e2f1] bg-[#fbfcfe] p-5 text-left shadow-[0_10px_20px_rgba(15,23,42,0.05)] transition hover:border-[#9eb8e3]"
									>
										<div className="min-w-0">
											<div className="flex flex-wrap items-center gap-2">
												<span className={`rounded-full px-3 py-1 text-xs font-semibold tracking-[0.16em] ${item.status === "FAILURE" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
													{item.status}
												</span>
												<span className="rounded-full bg-[#eef3fa] px-3 py-1 text-xs font-semibold text-slate-600">{getAuditLabel(AUDIT_LOG_CATEGORIES, item.category, item.category)}</span>
												<span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">{getAuditLabel(AUDIT_LOG_ACTION_OPTIONS, item.action, item.action)}</span>
											</div>
											<p className="mt-4 text-lg font-semibold text-slate-900">{item.summary}</p>
											<div className="mt-3 grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
												<DetailValue label="Actor" value={item.actorName || item.actorEmail || "Unknown user"} />
												<DetailValue label="Role" value={item.actorRole || "Unknown"} />
												<DetailValue label="Target" value={item.targetLabel || item.targetType || "-"} />
												<DetailValue label="Time" value={formatDateTime(item.createdAt)} />
											</div>
										</div>
									</button>
								))}

								<div className="flex flex-wrap items-center justify-between gap-3 pt-2">
									<p className="text-sm text-slate-500">Page {data?.pagination?.page || 1} of {data?.pagination?.totalPages || 1}</p>
									<div className="flex gap-2">
										<button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={(data?.pagination?.page || 1) <= 1} className="rounded-xl border border-[#cbd5e1] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
											Previous
										</button>
										<button type="button" onClick={() => setPage((value) => Math.min(data?.pagination?.totalPages || value, value + 1))} disabled={(data?.pagination?.page || 1) >= (data?.pagination?.totalPages || 1)} className="rounded-xl border border-[#164896] bg-[#164896] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#103773] disabled:cursor-not-allowed disabled:opacity-50">
											Next
										</button>
									</div>
								</div>
							</div>
						)}
					</div>
				</section>

				{selectedItem ? (
					<div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4">
						<div className="w-full max-w-3xl rounded-[28px] border border-[#dbe3ef] bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.28)]">
							<div className="flex items-start justify-between gap-4">
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#164896]">Audit Event Details</p>
									<h2 className="mt-2 text-2xl font-semibold text-slate-900">{selectedItem.summary}</h2>
								</div>
								<button type="button" onClick={() => setSelectedItem(null)} className="rounded-full border border-[#d6deea] px-3 py-1 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">Close</button>
							</div>

							<div className="mt-6 grid gap-4 md:grid-cols-2">
								<DetailValue label="Actor" value={selectedItem.actorName || selectedItem.actorEmail || "Unknown user"} />
								<DetailValue label="Actor Email" value={selectedItem.actorEmail || "-"} />
								<DetailValue label="Role" value={selectedItem.actorRole || "-"} />
								<DetailValue label="Action" value={getAuditLabel(AUDIT_LOG_ACTION_OPTIONS, selectedItem.action, selectedItem.action)} />
								<DetailValue label="Category" value={getAuditLabel(AUDIT_LOG_CATEGORIES, selectedItem.category, selectedItem.category)} />
								<DetailValue label="Status" value={selectedItem.status} />
								<DetailValue label="Target Type" value={selectedItem.targetType || "-"} />
								<DetailValue label="Target Label" value={selectedItem.targetLabel || "-"} />
								<DetailValue label="Timestamp" value={formatDateTime(selectedItem.createdAt)} />
							</div>

						</div>
					</div>
				) : null}
			</div>
		</AdminShell>
	);
}
