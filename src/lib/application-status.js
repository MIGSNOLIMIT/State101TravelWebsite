export const APPLICATION_STATUS_ORDER = ["NEW", "IN_REVIEW", "APPROVED", "PENDING", "SCHEDULED"];

export const APPLICATION_STATUS_LABELS = {
  NEW: "Recent",
  IN_REVIEW: "In Review",
  SCHEDULED: "Scheduled",
  APPROVED: "Approved",
  PENDING: "Pending",
};

export const APPLICATION_STATUS_NAV_LABELS = { ...APPLICATION_STATUS_LABELS };

export const APPLICATION_STATUS_SUMMARY_LABELS = { ...APPLICATION_STATUS_LABELS };

export const APPLICATION_STATUS_OPTIONS = APPLICATION_STATUS_ORDER.map((value) => ({
  value,
  label: APPLICATION_STATUS_LABELS[value],
}));

export const APPLICATION_STATUS_ACTIONS = {
  NEW: [
    { status: "IN_REVIEW", label: "Move to In Review", tone: "review" },
  ],
  IN_REVIEW: [
    { status: "APPROVED", label: "Approve", tone: "approved" },
    { status: "PENDING", label: "Move to Pending", tone: "pending" },
  ],
  APPROVED: [
    { status: "SCHEDULED", label: "Move to Schedule", tone: "scheduled" },
    { status: "PENDING", label: "Move to Pending", tone: "pending" },
  ],
  PENDING: [
    { status: "SCHEDULED", label: "Move to Schedule", tone: "scheduled" },
  ],
  SCHEDULED: [
    { status: "PENDING", label: "Move to Pending", tone: "pending" },
  ],
};

export function getAllowedApplicationStatusTransitions(status) {
  const normalized = normalizeApplicationStatus(status);
  return (APPLICATION_STATUS_ACTIONS[normalized] || []).map((action) => action.status);
}

export function canTransitionApplicationStatus(fromStatus, toStatus) {
  const current = normalizeApplicationStatus(fromStatus);
  const next = normalizeApplicationStatus(toStatus);

  if (current === next) {
    return false;
  }

  return getAllowedApplicationStatusTransitions(current).includes(next);
}

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
