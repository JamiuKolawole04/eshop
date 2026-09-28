export const productColors = {
  black: "#000000",
  white: "#ffffff",
  red: "#ff0000",
  green: "#00ff00",
  blue: "#0000ff",
  yellow: "#ffff00",
  magenta: "#ff00ff",
  cyan: "#00ffff",
} as const;

export const defaultProductColors = Object.values(productColors);

export const EXCLUDED_COLOR_KEYS = new Set(["white"]);

export const productColorOptions = (
  Object.entries(productColors) as [keyof typeof productColors, string][]
)
  .filter(([key]) => !EXCLUDED_COLOR_KEYS.has(key))
  .map(([key, code]) => ({
    name: `${key[0].toUpperCase()}${key.slice(1)}`,
    code,
  }));
