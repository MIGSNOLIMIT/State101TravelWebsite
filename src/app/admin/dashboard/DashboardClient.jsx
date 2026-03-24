"use client";

export const dynamic = "force-dynamic";

import { Bell, BadgeCheck, MessageCircleMore, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/app/admin/components/AdminShell";
import { APPLICATION_STATUS_SUMMARY_LABELS } from "@/lib/application-status";

const RANGE_OPTIONS = [
	{ key: "week", label: "Week" },
	{ key: "month", label: "Month" },
	{ key: "year", label: "Year" },
];

const SUMMARY_CARDS = [
	{ status: "NEW", icon: Bell, tone: "slate" },
	{ status: "IN_REVIEW", icon: MessageCircleMore, tone: "amber" },
	{ status: "APPROVED", icon: BadgeCheck, tone: "green" },
	{ status: "DECLINED", icon: XCircle, tone: "red" },
];

const cardToneClasses = {
	slate: {
		icon: "bg-slate-100 text-slate-700",
		count: "text-slate-800",
		label: "text-slate-700",
		ring: "shadow-[0_12px_24px_rgba(100,116,139,0.22)]",
	},
	amber: {
		icon: "bg-amber-100 text-amber-700",
		count: "text-amber-700",
		label: "text-amber-600",
		ring: "shadow-[0_12px_24px_rgba(217,119,6,0.24)]",
	},
	green: {
		icon: "bg-green-100 text-green-700",
		count: "text-green-700",
		label: "text-green-600",
		ring: "shadow-[0_12px_24px_rgba(22,163,74,0.24)]",
	},
	red: {
		icon: "bg-red-100 text-red-700",
		count: "text-red-700",
		label: "text-red-600",
		ring: "shadow-[0_12px_24px_rgba(220,38,38,0.24)]",
	},
};

const chartColors = {
	applications: "#0f1f77",
	approved: "#1f8a33",
	rejected: "#b30c0c",
};

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const LINE_SERIES = [
	{ key: "applications", label: "Applications", color: chartColors.applications },
	{ key: "approved", label: "Approved", color: chartColors.approved },
	{ key: "rejected", label: "Rejected", color: chartColors.rejected },
];

function startOfWeek(date) {
	const value = new Date(date);
	const day = value.getDay();
	const diff = (day + 6) % 7;
	value.setHours(0, 0, 0, 0);
	value.setDate(value.getDate() - diff);
	return value;
}

function startOfDay(date) {
	const value = new Date(date);
	value.setHours(0, 0, 0, 0);
	return value;
}

function getValidDates(items) {
	return items
		.flatMap((item) => [item.createdAt, item.updatedAt])
		.map((value) => new Date(value))
		.filter((value) => !Number.isNaN(value.getTime()));
}

function buildSeries(items, mode) {
	const now = new Date();
	const points = [];

	if (mode === "week") {
		const currentWeek = startOfWeek(now);
		for (let index = 0; index < 7; index += 1) {
			const start = new Date(currentWeek);
			start.setDate(currentWeek.getDate() + index);
			const end = new Date(start);
			end.setDate(start.getDate() + 1);
			points.push({ key: start.toISOString(), label: WEEKDAY_LABELS[index], start, end });
		}
	}

	if (mode === "month") {
		for (let index = 11; index >= 0; index -= 1) {
			const start = new Date(now.getFullYear(), now.getMonth() - index, 1);
			const end = new Date(now.getFullYear(), now.getMonth() - index + 1, 1);
			points.push({
				key: start.toISOString(),
				label: start.toLocaleDateString("en-US", { month: "short" }),
				start,
				end,
			});
		}
	}

	if (mode === "year") {
		const currentYear = now.getFullYear();
		const validDates = getValidDates(items);
		const earliestDataYear = validDates.length
			? Math.min(...validDates.map((value) => value.getFullYear()))
			: currentYear - 1;
		const startYear = Math.min(earliestDataYear, currentYear - 1);

		for (let year = startYear; year <= currentYear; year += 1) {
			const start = new Date(year, 0, 1);
			const end = new Date(year + 1, 0, 1);
			points.push({ key: start.toISOString(), label: `${year}`, start, end });
		}
	}

	return points.map((point) => {
		const applications = items.filter((item) => {
			const createdAt = new Date(item.createdAt);
			return createdAt >= point.start && createdAt < point.end;
		}).length;

		const approved = items.filter((item) => {
			if (item.status !== "APPROVED") return false;
			const updatedAt = new Date(item.updatedAt || item.createdAt);
			return updatedAt >= point.start && updatedAt < point.end;
		}).length;

		const rejected = items.filter((item) => {
			if (item.status !== "DECLINED") return false;
			const updatedAt = new Date(item.updatedAt || item.createdAt);
			return updatedAt >= point.start && updatedAt < point.end;
		}).length;

		return {
			...point,
			applications,
			approved,
			rejected,
		};
	});
}

function buildLinePath(values, chartWidth, chartHeight, chartMax) {
	if (!values.length) return "";
	if (values.length === 1) {
		const y = chartHeight - (values[0] / chartMax) * chartHeight;
		return `M ${chartWidth / 2} ${y}`;
	}

	return values
		.map((value, index) => {
			const x = (index / (values.length - 1)) * chartWidth;
			const y = chartHeight - (value / chartMax) * chartHeight;
			return `${index === 0 ? "M" : "L"} ${x} ${y}`;
		})
		.join(" ");
}

function CountCard({ count, status, icon: Icon, tone, onClick, disabled = false }) {
	const palette = cardToneClasses[tone];

	return (
		<button
			type="button"
			onClick={disabled ? undefined : onClick}
			disabled={disabled}
			className={[
				"rounded-[24px] border border-[#d5dce7] bg-white px-6 py-5 text-left transition",
				disabled ? "cursor-default opacity-90" : `hover:-translate-y-0.5 hover:shadow-xl ${palette.ring}`,
			].join(" ")}
		>
			<div className="flex justify-end">
				<span className={`flex h-10 w-10 items-center justify-center rounded-full ${palette.icon}`}>
					<Icon size={18} strokeWidth={2.3} />
				</span>
			</div>
			<div className={`mt-2 text-5xl font-semibold leading-none ${palette.count}`}>{count}</div>
			<div className={`mt-3 text-lg font-medium ${palette.label}`}>{APPLICATION_STATUS_SUMMARY_LABELS[status]}</div>
		</button>
	);
}

export default function DashboardClient({ initialUserName, initialRole }) {
	const router = useRouter();
	const [applications, setApplications] = useState([]);
	const [rangeMode, setRangeMode] = useState("week");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const canManageApplications = initialRole === "admin";

	useEffect(() => {
		let ignore = false;

		async function load() {
			setLoading(true);
			try {
				const applicationsRes = await fetch("/api/application/metrics", { cache: "no-store" });

				if (!applicationsRes.ok) {
					throw new Error("Failed to load dashboard data");
				}

				const items = await applicationsRes.json();
				if (ignore) return;

				setApplications(items);
				setError("");
			} catch {
				if (!ignore) setError("Failed to load dashboard data.");
			} finally {
				if (!ignore) setLoading(false);
			}
		}

		load();
		return () => {
			ignore = true;
		};
	}, []);

	const counts = useMemo(
		() => ({
			NEW: applications.filter((item) => item.status === "NEW").length,
			IN_REVIEW: applications.filter((item) => item.status === "IN_REVIEW").length,
			APPROVED: applications.filter((item) => item.status === "APPROVED").length,
			DECLINED: applications.filter((item) => item.status === "DECLINED").length,
		}),
		[applications]
	);

	const chartData = useMemo(() => buildSeries(applications, rangeMode), [applications, rangeMode]);
	const rawChartMax = Math.max(0, ...chartData.flatMap((point) => [point.applications, point.approved, point.rejected]));
	const chartMax = Math.max(5, Math.ceil(rawChartMax / 5) * 5 || 5);
	const chartSteps = Array.from({ length: 6 }, (_, index) => chartMax - (chartMax / 5) * index);
	const chartWidth = 860;
	const chartHeight = 250;

	return (
		<AdminShell title="Dashboard" userName={initialUserName} role={initialRole}>
			<div className="space-y-6">
				{error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

				<section className="overflow-hidden rounded-[28px] border border-[#cfd7e3] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
					<div className="flex flex-col gap-4 bg-[#1d4f9d] px-5 py-5 text-white md:flex-row md:items-center md:justify-between md:px-8">
						<div>
							<h2 className="text-2xl font-semibold">Applicants overview</h2>
							<p className="text-sm text-white/70">Weekly, monthly, and yearly application activity.</p>
						</div>
						<div className="inline-flex rounded-xl bg-white/15 p-1">
							{RANGE_OPTIONS.map((option) => (
								<button
									key={option.key}
									type="button"
									onClick={() => setRangeMode(option.key)}
									className={[
										"rounded-lg px-3 py-1.5 text-sm font-medium transition",
										rangeMode === option.key ? "bg-[#0f1f77] text-white" : "text-white/70 hover:text-white",
									].join(" ")}
								>
									{option.label}
								</button>
							))}
						</div>
					</div>

					<div className="px-5 py-6 md:px-8">
						{loading ? (
							<div className="flex h-[320px] items-center justify-center text-sm text-slate-500">Loading dashboard metrics...</div>
						) : (
							<div className="grid grid-cols-[42px_1fr] gap-3 md:grid-cols-[56px_1fr] md:gap-5">
								<div className="flex h-[320px] flex-col justify-between pb-14 text-[11px] font-medium text-slate-400 md:text-xs">
									{chartSteps.map((step) => (
										<span key={step}>{Math.round(step)}</span>
									))}
								</div>

								<div>
									<div className="relative h-[320px] rounded-[24px] bg-[#f8fafc] px-4 pb-12 pt-6 md:px-6">
										<div className="pointer-events-none absolute inset-x-4 top-6 bottom-12 md:inset-x-6">
											{chartSteps.map((step) => (
												<div key={step} className="h-1/5 border-b border-[#d5deea] last:border-b-0" />
											))}
										</div>

										<div className="relative h-full">
											<svg viewBox={`0 0 ${chartWidth} ${chartHeight + 44}`} className="h-full w-full overflow-visible" preserveAspectRatio="none">
												{LINE_SERIES.map((series) => (
													<g key={series.key}>
														<path
															d={buildLinePath(chartData.map((point) => point[series.key]), chartWidth, chartHeight, chartMax)}
															fill="none"
															stroke={series.color}
															strokeWidth="4"
															strokeLinecap="round"
															strokeLinejoin="round"
														/>
														{chartData.map((point, index) => {
															const x = chartData.length === 1 ? chartWidth / 2 : (index / (chartData.length - 1)) * chartWidth;
															const y = chartHeight - (point[series.key] / chartMax) * chartHeight;

															return (
																<g key={`${series.key}-${point.key}`}>
																	<circle cx={x} cy={y} r="5" fill={series.color} />
																	<title>{`${series.label}: ${point[series.key]} (${point.label})`}</title>
																</g>
															);
														})}
													</g>
												))}

												{chartData.map((point, index) => {
													const x = chartData.length === 1 ? chartWidth / 2 : (index / (chartData.length - 1)) * chartWidth;

													return (
														<text
															key={point.key}
															x={x}
															y={chartHeight + 28}
															textAnchor="middle"
															fontSize="12"
															fill="#64748b"
														>
															{point.label}
														</text>
													);
												})}
											</svg>
										</div>
									</div>

									<div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
										{LINE_SERIES.map((series) => (
											<span key={series.key} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: series.color }} />{series.label}</span>
										))}
									</div>
								</div>
							</div>
						)}
					</div>
				</section>

				<section className="rounded-[28px] border border-[#d4dce6] bg-[#f6f7f9] p-5 shadow-[0_16px_34px_rgba(15,23,42,0.08)] md:p-6">
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
						{SUMMARY_CARDS.map((card) => (
							<CountCard
								key={card.status}
								count={counts[card.status]}
								status={card.status}
								icon={card.icon}
								tone={card.tone}
								onClick={() => router.push(`/admin/applications?status=${card.status}`)}
								disabled={!canManageApplications}
							/>
						))}
					</div>
				</section>
			</div>
		</AdminShell>
	);
}