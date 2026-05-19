function pad(value) {
  return String(value).padStart(2, "0");
}

export function normalizeBirthdateInput(value) {
  return String(value || "").trim();
}

export function parseBirthdateParts(value) {
  const normalized = normalizeBirthdateInput(value);
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);

  if (!year || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  return { year, month, day };
}

export function birthdateInputToDate(value) {
  const parts = parseBirthdateParts(value);
  if (!parts) return null;

  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0));
}

export function birthdateDateToInputValue(value) {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function calculateAgeFromBirthdate(value, today = new Date()) {
  const birthdate = value instanceof Date ? birthdateDateToInputValue(value) : normalizeBirthdateInput(value);
  const birthdateParts = parseBirthdateParts(birthdate);
  if (!birthdateParts) return 0;

  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  let age = currentYear - birthdateParts.year;
  if (
    currentMonth < birthdateParts.month ||
    (currentMonth === birthdateParts.month && currentDay < birthdateParts.day)
  ) {
    age -= 1;
  }

  return Math.max(0, age);
}

export function validateBirthdate(value) {
  const normalized = normalizeBirthdateInput(value);
  if (!normalized) {
    return "Birthdate is required";
  }

  const parts = parseBirthdateParts(normalized);
  if (!parts) {
    return "Birthdate must be a valid date";
  }

  const birthdate = birthdateInputToDate(normalized);
  if (!birthdate || Number.isNaN(birthdate.getTime())) {
    return "Birthdate must be a valid date";
  }

  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  if (birthdate.getTime() > todayUtc) {
    return "Birthdate cannot be in the future";
  }

  return "";
}

export function formatBirthdate(value, locale = "en-PH") {
  if (!value) return "-";

  const inputValue = birthdateDateToInputValue(value);
  const parts = parseBirthdateParts(inputValue);
  if (!parts) return "-";

  const displayDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0));
  return displayDate.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function getDisplayAge(application) {
  const birthdateValue = birthdateDateToInputValue(application?.birthdate);
  if (birthdateValue) {
    return calculateAgeFromBirthdate(birthdateValue);
  }

  return Math.max(0, Number.parseInt(application?.age, 10) || 0);
}

export function withComputedApplicationAge(application) {
  if (!application) return application;

  return {
    ...application,
    age: getDisplayAge(application),
  };
}

export function getTodayInputDate() {
  const today = new Date();
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
}
