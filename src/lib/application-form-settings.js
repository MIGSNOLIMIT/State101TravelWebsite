export const DEFAULT_APPLICATION_AVAILABLE_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const DEFAULT_APPLICATION_VISA_TYPES = ["Canadian", "American"];

export const DEFAULT_APPLICATION_TIME_SLOTS = [
  { start: "09:00", end: "12:00" },
  { start: "13:00", end: "15:00" },
  { start: "16:00", end: "17:00" },
];

function dedupeCaseInsensitive(values) {
  const seen = new Set();

  return values.filter((value) => {
    const key = value.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeLabelList(values, fallback) {
  const normalized = dedupeCaseInsensitive(
    (Array.isArray(values) ? values : [])
      .map((value) => String(value || "").trim())
      .filter(Boolean)
  );

  return normalized.length ? normalized : fallback;
}

function normalizeTimeValue(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const matched = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (!matched) return "";

  const hours = Number.parseInt(matched[1], 10);
  const minutes = Number.parseInt(matched[2], 10);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return "";
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function formatTimeLabel(value) {
  const normalized = normalizeTimeValue(value);
  if (!normalized) return "";

  const [hoursText, minutes] = normalized.split(":");
  const hours = Number.parseInt(hoursText, 10);
  const meridiem = hours >= 12 ? "PM" : "AM";
  const twelveHour = hours % 12 || 12;

  return `${twelveHour}:${minutes} ${meridiem}`;
}

export function buildTimeSlotLabel(slot) {
  const startLabel = formatTimeLabel(slot?.start);
  const endLabel = formatTimeLabel(slot?.end);

  if (!startLabel || !endLabel) return "";
  return `${startLabel} - ${endLabel}`;
}

export function normalizeApplicationTimeSlots(timeSlots) {
  const source = Array.isArray(timeSlots) ? timeSlots : [];
  const normalized = [];
  const seen = new Set();

  for (const slot of source) {
    const start = normalizeTimeValue(slot?.start);
    const end = normalizeTimeValue(slot?.end);
    if (!start || !end || start >= end) continue;

    const key = `${start}-${end}`;
    if (seen.has(key)) continue;
    seen.add(key);

    normalized.push({
      start,
      end,
      label: buildTimeSlotLabel({ start, end }),
    });
  }

  if (normalized.length) return normalized;

  return DEFAULT_APPLICATION_TIME_SLOTS.map((slot) => ({
    ...slot,
    label: buildTimeSlotLabel(slot),
  }));
}

export function normalizeApplicationFormSettings(page = {}) {
  const availableDaysSource = Array.isArray(page.availableDays)
    ? page.availableDays
    : page.applicationAvailableDays;
  const visaTypesSource = Array.isArray(page.visaTypes)
    ? page.visaTypes
    : page.applicationVisaTypes;
  const timeSlotsSource = Array.isArray(page.timeSlots)
    ? page.timeSlots
    : page.applicationTimeSlots;

  const availableDays = normalizeLabelList(
    availableDaysSource,
    DEFAULT_APPLICATION_AVAILABLE_DAYS
  );
  const visaTypes = normalizeLabelList(
    Array.isArray(visaTypesSource) ? visaTypesSource : [],
    DEFAULT_APPLICATION_VISA_TYPES
  );
  const timeSlots = normalizeApplicationTimeSlots(timeSlotsSource);

  return {
    availableDays,
    visaTypes,
    timeSlots,
  };
}
