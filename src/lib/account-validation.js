export const USERNAME_MIN_LENGTH = 5;
export const USERNAME_MAX_LENGTH = 16;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 16;

export const USERNAME_PATTERN = "^[A-Za-z0-9]{5,16}$";
export const PASSWORD_PATTERN = "^[A-Za-z0-9]{8,16}$";

export const USERNAME_HELPER_TEXT =
  "Username must be 5 to 16 characters and can only contain letters and numbers.";

export const PASSWORD_HELPER_TEXT =
  "Password must be 8 to 16 characters and can only contain letters and numbers.";

const alphaNumericRegex = /^[A-Za-z0-9]+$/;

export function validateUsername(value) {
  const normalizedValue = String(value || "").trim();

  if (!normalizedValue) {
    return "Username is required.";
  }

  if (normalizedValue.length < USERNAME_MIN_LENGTH || normalizedValue.length > USERNAME_MAX_LENGTH) {
    return USERNAME_HELPER_TEXT;
  }

  if (!alphaNumericRegex.test(normalizedValue)) {
    return USERNAME_HELPER_TEXT;
  }

  return "";
}

export function validatePassword(value) {
  const normalizedValue = String(value || "");

  if (!normalizedValue) {
    return "Password is required.";
  }

  if (normalizedValue.length < PASSWORD_MIN_LENGTH || normalizedValue.length > PASSWORD_MAX_LENGTH) {
    return PASSWORD_HELPER_TEXT;
  }

  if (!alphaNumericRegex.test(normalizedValue)) {
    return PASSWORD_HELPER_TEXT;
  }

  return "";
}

export function generateRandomPassword(length = 12) {
  const targetLength = Math.min(Math.max(length, PASSWORD_MIN_LENGTH), PASSWORD_MAX_LENGTH);
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues = new Uint32Array(targetLength);
  globalThis.crypto.getRandomValues(randomValues);

  let password = "";
  for (const value of randomValues) {
    password += characters[value % characters.length];
  }

  return password;
}
