// Reason: Tests for color conversion utilities covering basic roundtrips.
import { describe, it, expect } from "vitest";

import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, hexToOklch, oklchToHex } from "@/lib/color/convert";

describe("color.convert", () => {
  it("hex <-> rgb roundtrip", () => {
    const rgb = hexToRgb("#336699");
    const hex = rgbToHex(rgb);
    expect(hex.toLowerCase()).toBe("#336699");
  });

  it("rgb <-> hsl roundtrip preserves range", () => {
    const hsl = rgbToHsl({ r: 51, g: 102, b: 153 });
    const rgb = hslToRgb(hsl);
    expect(rgb.r).toBeGreaterThanOrEqual(0);
    expect(rgb.r).toBeLessThanOrEqual(255);
    expect(hsl.h).toBeGreaterThanOrEqual(0);
    expect(hsl.h).toBeLessThanOrEqual(360);
  });

  it("oklch conversions produce hex", () => {
    const ok = hexToOklch("#336699");
    const hex = oklchToHex(ok);
    expect(hex).toMatch(/^#[0-9a-f]{6}$/i);
  });
});