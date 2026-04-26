function normalizeServiceKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z]+/g, " ");
}

export function getServicesSectionAnchor(value) {
  const normalized = normalizeServiceKey(value);

  if (normalized.includes("canada")) {
    return "for-canada";
  }

  if (
    normalized.includes("united states") ||
    normalized === "us" ||
    normalized === "usa" ||
    normalized.includes("america")
  ) {
    return "for-united-states";
  }

  return "";
}

export function getReadMoreLink(service = {}) {
  const anchor = getServicesSectionAnchor(service.country || service.title);
  return anchor ? `/services#${anchor}` : service.link || service.ctaLink || "/services";
}
