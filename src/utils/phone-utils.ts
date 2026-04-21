export function normalizeGhanaPhoneNumber(raw: string): string {
  if (!raw) return "";

  let value = String(raw).trim();
  if (!value) return "";

  value = value.replace(/[^\d+]/g, "").replace(/\s+/g, "");

  if (value.startsWith("+")) {
    value = value.slice(1);
  }

  if (value.startsWith("00")) {
    value = value.slice(2);
  }

  if (value.startsWith("233")) {
    return value;
  }

  if (value.startsWith("0")) {
    return `233${value.slice(1)}`;
  }

  if (value.length === 9) {
    return `233${value}`;
  }

  return value;
}

export function isValidGhanaPhoneNumber(value: string): boolean {
  const normalized = normalizeGhanaPhoneNumber(value);
  return /^233\d{9}$/.test(normalized);
}
