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
};

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

		return {
			...point,
			applications,
		};
	});
}

function getNiceChartScale(maxValue, desiredSteps = 5) {
	if (maxValue <= 0) {
		return {
			chartMax: 1,
			chartSteps: [1, 0],
		};
	}

	const roughStep = maxValue / desiredSteps;
	if (roughStep <= 1) {
		return {
			chartMax: maxValue,
			chartSteps: Array.from({ length: maxValue + 1 }, (_, index) => maxValue - index),
		};
	}

	const magnitude = 10 ** Math.floor(Math.log10(roughStep));
	const normalizedStep = roughStep / magnitude;

	let niceStep = magnitude;
	if (normalizedStep > 5) {
		niceStep = 10 * magnitude;
	} else if (normalizedStep > 2) {
		niceStep = 5 * magnitude;
	} else if (normalizedStep > 1) {
		niceStep = 2 * magnitude;
	}

	const chartMax = Math.max(niceStep, Math.ceil(maxValue / niceStep) * niceStep);
	const stepsCount = Math.max(1, Math.ceil(chartMax / niceStep));
	const chartSteps = Array.from({ length: stepsCount + 1 }, (_, index) => Math.max(0, chartMax - niceStep * index));

	if (chartSteps[chartSteps.length - 1] !== 0) {
		chartSteps.push(0);
	}

	return { chartMax, chartSteps };
}

function getChartPointPosition(index, total, chartWidth) {
	if (total <= 1) {
		return chartWidth / 2;
	}

	return (index / (total - 1)) * chartWidth;
}

function getChartY(value, chartHeight, chartMax) {
	if (!chartMax) {
		return chartHeight;
	}

	return chartHeight - (value / chartMax) * chartHeight;
}

function buildLinePath(values, chartWidth, chartHeight, chartMax) {
	if (!values.length) return "";
	if (values.length === 1) {
		const y = getChartY(values[0], chartHeight, chartMax);
		return `M ${chartWidth / 2} ${y}`;
	}

	return values
		.map((value, index) => {
			const x = getChartPointPosition(index, values.length, chartWidth);
			const y = getChartY(value, chartHeight, chartMax);
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
	const rawChartMax = Math.max(0, ...chartData.map((point) => point.applications));
	const { chartMax, chartSteps } = useMemo(() => getNiceChartScale(rawChartMax), [rawChartMax]);
	const plotWidth = 860;
	const plotHeight = 250;
	const svgWidth = 940;
	const svgHeight = 320;
	const chartPadding = {
		top: 18,
		right: 18,
		bottom: 52,
		left: 62,
	};

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
							<div>
								<div className="relative h-[320px] rounded-[24px] bg-[#f8fafc] p-3 md:p-4">
									<svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="h-full w-full" preserveAspectRatio="none">
										<g transform={`translate(${chartPadding.left}, ${chartPadding.top})`}>
											{chartSteps.map((step) => {
												const y = getChartY(step, plotHeight, chartMax);

												return (
													<g key={step}>
														<line
															x1="0"
															y1={y}
															x2={plotWidth}
															y2={y}
															stroke="#d5deea"
															strokeWidth="1.5"
															shapeRendering="crispEdges"
														/>
														<text
															x="-14"
															y={y + 4}
															textAnchor="end"
															fontSize="12"
															fontWeight="600"
															fill="#94a3b8"
														>
															{step}
														</text>
													</g>
												);
											})}

											<path
												d={buildLinePath(chartData.map((point) => point.applications), plotWidth, plotHeight, chartMax)}
												fill="none"
												stroke={chartColors.applications}
												strokeWidth="5"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>

											{chartData.map((point, index) => {
												const x = getChartPointPosition(index, chartData.length, plotWidth);
												const y = getChartY(point.applications, plotHeight, chartMax);

												return (
													<g key={point.key}>
														<circle cx={x} cy={y} r="7" fill="white" stroke={chartColors.applications} strokeWidth="4" />
														<text
															x={x}
															y={Math.max(16, y - 14)}
															textAnchor="middle"
															fontSize="13"
															fontWeight="700"
															fill={chartColors.applications}
														>
															{point.applications}
														</text>
														<text
															x={x}
															y={plotHeight + 30}
															textAnchor="middle"
															fontSize="12"
															fontWeight="600"
															fill="#64748b"
														>
															{point.label}
														</text>
														<title>{`Applications: ${point.applications} (${point.label})`}</title>
													</g>
												);
											})}
										</g>
									</svg>
								</div>

								<div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
									<span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartColors.applications }} />Applications</span>
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