export const APPLICATION_STYLE_EMAIL_REGEX = /^(?=.{1,64}@)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export function validateApplicationStyleEmail(email) {
  const value = String(email || "").trim();
  if (!APPLICATION_STYLE_EMAIL_REGEX.test(value)) {
    return "Invalid email address";
  }
  return "";
}