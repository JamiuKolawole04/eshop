const NIGERIAN_MOBILE_NATIONAL = /^[789][01]\d{8}$/;

export const normalizeNigerianPhone = (input: string): string | null => {
  if (!input) return null;

  const digits = input.replace(/\D/g, "");

  let national: string;

  if (digits.length === 11 && digits.startsWith("0")) {
    national = digits.slice(1);
  } else if (digits.length === 10) {
    national = digits;
  } else if (digits.length === 13 && digits.startsWith("234")) {
    national = digits.slice(3);
  } else if (digits.length === 14 && digits.startsWith("2340")) {
    national = digits.slice(4);
  } else {
    return null;
  }

  return NIGERIAN_MOBILE_NATIONAL.test(national) ? `+234${national}` : null;
};

export const isValidNigerianPhone = (input: string): boolean =>
  normalizeNigerianPhone(input) !== null;

export const formatPhoneForDisplay = (value?: string | null): string => {
  if (!value) return "";

  const normalized = normalizeNigerianPhone(value);
  const national = normalized
    ? normalized.slice(4)
    : value.replace(/\D/g, "").slice(-10);

  if (national.length !== 10) return value;

  return `0${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
};
