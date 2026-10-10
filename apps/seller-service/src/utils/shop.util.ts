export const cleanString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export const countWords = (text: string) =>
  text.split(/\s+/).filter(Boolean).length;

export const parseHttpUrl = (value: string): URL | null => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
};

export const hostMatches = (hostname: string, allowed: readonly string[]) =>
  allowed.some((h) => hostname === h || hostname.endsWith(`.${h}`));
