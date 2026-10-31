const NG_PREFIX = "+234";

export const formatNigerianPhone = (raw: string): string => {
  if (NG_PREFIX.startsWith(raw)) return NG_PREFIX;

  let digits: string;

  if (raw.startsWith(NG_PREFIX)) {
    digits = raw.slice(NG_PREFIX.length).replace(/\D/g, "");
  } else {
    digits = raw.replace(/\D/g, "");
    if (digits.startsWith("234")) digits = digits.slice(3);
    else if (digits.startsWith("0")) digits = digits.slice(1);
  }

  if (digits.startsWith("0")) digits = digits.slice(1);

  return NG_PREFIX + digits.slice(0, 10);
};
