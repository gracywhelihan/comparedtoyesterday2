export type Unit = "F" | "C";

/**
 * Open-Meteo is always asked for °F; we convert on the device so switching units is instant.
 * A temperature converts with C = (F − 32) × 5/9.
 */
export const toUnit = (f: number, unit: Unit): number => (unit === "C" ? ((f - 32) * 5) / 9 : f);

export const deg = (n: number): string => `${Math.round(n)}°`;

/** "+4°", "−3°" (a real minus sign, not a hyphen), or "±0°". Pass an already-rounded difference. */
export const signed = (n: number): string =>
  n === 0 ? "±0°" : `${n > 0 ? "+" : "−"}${Math.abs(n)}°`;

/** 0 → "12 AM", 15 → "3 PM" */
export const fmtHour = (h: number): string => `${h % 12 || 12} ${h < 12 ? "AM" : "PM"}`;

/** 0 → "12a", 15 → "3p" (chart axis) */
export const fmtShort = (h: number): string => `${h % 12 || 12}${h < 12 ? "a" : "p"}`;

/** Gusts of 25 mph+ count as "windy" (Beaufort "strong breeze"). */
export const WINDY_MPH = 25;

/** Shown in mph with °F, km/h with °C. */
export const fmtWind = (mph: number, unit: Unit): string =>
  unit === "C" ? `${Math.round(mph * 1.609344)} km/h` : `${Math.round(mph)} mph`;
