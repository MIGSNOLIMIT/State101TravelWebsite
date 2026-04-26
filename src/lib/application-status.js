export const APPLICATION_STATUS_ORDER = ["NEW", "IN_REVIEW", "SCHEDULED", "APPROVED", "PENDING"];

export const APPLICATION_STATUS_LABELS = {
  NEW: "Recent",
  IN_REVIEW: "In-Review",
  SCHEDULED: "Scheduled",
  APPROVED: "Approved",
  PENDING: "Pending",
};

export const APPLICATION_STATUS_NAV_LABELS = {
  ...APPLICATION_STATUS_LABELS,
  SCHEDULED: "Schedules",
};

export const APPLICATION_STATUS_SUMMARY_LABELS = {
  ...APPLICATION_STATUS_LABELS,
  SCHEDULED: "Schedules",
};

export const APPLICATION_STATUS_OPTIONS = APPLICATION_STATUS_ORDER.map((value) => ({
  value,
  label: APPLICATION_STATUS_LABELS[value],
}));

export const APPLICATION_STATUS_ACTIONS = {
  NEW: [
    { status: "IN_REVIEW", label: "Move to In-Review", tone: "review" },
    { status: "SCHEDULED", label: "Move to Schedule", tone: "scheduled" },
    { status: "APPROVED", label: "Approve", tone: "approved" },
    { status: "PENDING", label: "Move to Pending", tone: "pending" },
  ],
  IN_REVIEW: [
    { status: "SCHEDULED", label: "Move to Schedule", tone: "scheduled" },
    { status: "APPROVED", label: "Approve", tone: "approved" },
    { status: "PENDING", label: "Move to Pending", tone: "pending" },
  ],
  SCHEDULED: [
    { status: "IN_REVIEW", label: "Move to In-Review", tone: "review" },
    { status: "APPROVED", label: "Approve", tone: "approved" },
    { status: "PENDING", label: "Move to Pending", tone: "pending" },
  ],
  APPROVED: [
    { status: "SCHEDULED", label: "Move to Schedule", tone: "scheduled" },
    { status: "IN_REVIEW", label: "Move to In-Review", tone: "review" },
    { status: "PENDING", label: "Move to Pending", tone: "pending" },
  ],
  PENDING: [
    { status: "SCHEDULED", label: "Move to Schedule", tone: "scheduled" },
    { status: "IN_REVIEW", label: "Move to In-Review", tone: "review" },
    { status: "APPROVED", label: "Approve", tone: "approved" },
  ],
};

export function normalizeApplicationStatus(value) {
  const normalized = String(value || "").trim().toUpperCase();

  if (normalized === "DECLINED" || normalized === "REJECTED") {
    return "PENDING";
  }

  if (normalized === "SCHEDULE" || normalized === "SCHEDULES") {
    return "SCHEDULED";
  }

  return APPLICATION_STATUS_ORDER.includes(normalized) ? normalized : "NEW";
}

export function isApplicationStatus(value) {
  return APPLICATION_STATUS_ORDER.includes(normalizeApplicationStatus(value));
}

export function getApplicationStatusLabel(status, variant = "default") {
  const normalized = normalizeApplicationStatus(status);
  if (variant === "nav") return APPLICATION_STATUS_NAV_LABELS[normalized] || normalized;
  if (variant === "summary") return APPLICATION_STATUS_SUMMARY_LABELS[normalized] || normalized;
  return APPLICATION_STATUS_LABELS[normalized] || normalized;
}
