export const APPLICATION_STYLE_EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,24}$/;

export function validateApplicationStyleEmail(email) {
  const value = String(email || "").trim();

  if (!value || value.length > 254 || !APPLICATION_STYLE_EMAIL_REGEX.test(value)) {
    return "Invalid email address";
  }

  const [localPart = "", domainPart = ""] = value.split("@");
  if (!localPart || !domainPart || localPart.length > 64) {
    return "Invalid email address";
  }

  if (localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..")) {
    return "Invalid email address";
  }

  const domainLabels = domainPart.split(".");
  if (domainLabels.length < 2) {
    return "Invalid email address";
  }

  const hasInvalidDomainLabel = domainLabels.some((label, index) => {
    if (!label || label.length > 63) return true;
    if (label.startsWith("-") || label.endsWith("-")) return true;
    if (!/^[A-Za-z0-9-]+$/.test(label)) return true;
    if (index === domainLabels.length - 1 && !/^[A-Za-z]{2,24}$/.test(label)) return true;
    return false;
  });

  if (hasInvalidDomainLabel) {
    return "Invalid email address";
  }

  return "";
}