export const CURRENCY_CODE = "NGN";
export const CURRENCY_SYMBOL = "\u20A6"; // ₦

type FormatCurrencyOptions = {
  decimals?: boolean;
};

export const formatCurrency = (
  amount: number | string | null | undefined,
  { decimals = true }: FormatCurrencyOptions = {},
): string => {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return `${CURRENCY_SYMBOL}${decimals ? "0.00" : "0"}`;
  }

  const formatted = value.toLocaleString("en-NG", {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  });

  return `${CURRENCY_SYMBOL}${formatted}`;
};
