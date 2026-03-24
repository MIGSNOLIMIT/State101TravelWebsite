export const APPLICATION_STATUS_ORDER = ["NEW", "IN_REVIEW", "APPROVED", "DECLINED"];

export const APPLICATION_STATUS_LABELS = {
  NEW: "Recent",
  IN_REVIEW: "In-Review",
  APPROVED: "Approved",
  DECLINED: "Declined",
};

export const APPLICATION_STATUS_NAV_LABELS = {
  ...APPLICATION_STATUS_LABELS,
  DECLINED: "Rejected",
};

export const APPLICATION_STATUS_SUMMARY_LABELS = {
  ...APPLICATION_STATUS_LABELS,
  DECLINED: "Rejected",
};

export const APPLICATION_STATUS_OPTIONS = APPLICATION_STATUS_ORDER.map((value) => ({
  value,
  label: APPLICATION_STATUS_LABELS[value],
}));

export const APPLICATION_STATUS_ACTIONS = {
  NEW: [
    { status: "IN_REVIEW", label: "Move to In-Review", tone: "review" },
    { status: "APPROVED", label: "Approve", tone: "approved" },
    { status: "DECLINED", label: "Decline", tone: "declined" },
  ],
  IN_REVIEW: [
    { status: "APPROVED", label: "Approve", tone: "approved" },
    { status: "DECLINED", label: "Decline", tone: "declined" },
  ],
  APPROVED: [
    { status: "IN_REVIEW", label: "Move to In-Review", tone: "review" },
    { status: "DECLINED", label: "Decline", tone: "declined" },
  ],
  DECLINED: [
    { status: "IN_REVIEW", label: "Move to In-Review", tone: "review" },
    { status: "APPROVED", label: "Approve", tone: "approved" },
  ],
};

export function isApplicationStatus(value) {
  return APPLICATION_STATUS_ORDER.includes(value);
}

export function getApplicationStatusLabel(status, variant = "default") {
  if (variant === "nav") return APPLICATION_STATUS_NAV_LABELS[status] || status;
  if (variant === "summary") return APPLICATION_STATUS_SUMMARY_LABELS[status] || status;
  return APPLICATION_STATUS_LABELS[status] || status;
}
