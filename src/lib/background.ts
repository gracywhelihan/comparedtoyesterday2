/**
 * The page color says how today compares to yesterday.
 *
 * t = the difference in °F, clamped to ±10°, as −1…1. We mix from "same" (yellow)
 * toward "cold" (blue) or "warm" (orange) by |t|, so 10° or more is the full color.
 * The mix happens in OKLCH so the in-between colors stay vivid instead of muddy.
 * It always uses °F, so the same day gets the same color in either unit.
 */
export function backgroundFor(deltaF: number): string {
  const t = Math.max(-1, Math.min(1, deltaF / 10));
  const target = t < 0 ? "var(--cold)" : "var(--warm)";
  const amount = Math.round(Math.abs(t) * 100);
  return `color-mix(in oklch, var(--same), ${target} ${amount}%)`;
}
