// Reason: Tests for WCAG rating thresholds.
import { describe, it, expect } from "vitest";

import { getWcagRating } from "@/lib/a11y/wcag";
import { wcagContrast } from "@/lib/color/contrast";

describe("wcag", () => {
  it("black on white meets AAA", () => {
    const ratio = wcagContrast("#000000", "#ffffff");
    expect(ratio).toBeGreaterThanOrEqual(7);
    expect(getWcagRating(ratio)).toBe("AAA");
  });
  it("low contrast fails", () => {
    const ratio = wcagContrast("#777777", "#808080");
    expect(getWcagRating(ratio)).toBe("Fail");
  });
});