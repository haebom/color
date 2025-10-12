// Reason: Helpers to map contrast ratios to WCAG grades and badges.
import { wcagContrast } from "@/lib/color/contrast";

/** Return WCAG rating label (AAA/AA/Fail) for given ratio */
export function getWcagRating(ratio: number): "AAA" | "AA" | "Fail" {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  return "Fail";
}

/** Convenience wrapper to compute and return ratio */
export function contrastBadge(foreground: string, background: string): number {
  return wcagContrast(foreground, background);
}