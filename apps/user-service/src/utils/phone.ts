// Nigerian mobile numbers only. National significant number starts with
// 7, 8 or 9 followed by 0 or 1 (070/080/081/090/091 prefixes).
const NIGERIAN_MOBILE_NATIONAL = /^[789][01]\d{8}$/;

/**
 * Normalizes a Nigerian mobile number to E.164 (`+2348012345678`).
 * Accepts `08012345678`, `8012345678`, `+2348012345678`,
 * `2348012345678` and `+234 (0) 801 234 5678`, with spaces or dashes.
 * Returns `null` when the input is not a valid Nigerian mobile number.
 */
export const normalizeNigerianPhone = (input: string): string | null => {
  if (!input) return null;

  const digits = String(input).replace(/\D/g, "");

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
