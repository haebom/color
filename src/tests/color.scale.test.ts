// Reason: Tests for scale generation boundaries and count.
import { describe, it, expect } from "vitest";

import { generateScale } from "@/lib/color/scale";

describe("color.scale", () => {
  it("generates requested number of shades", () => {
    const shades = generateScale("#4f46e5", 11);
    expect(shades.length).toBe(11);
  });

  it("applies shift within 0..1 bounds", () => {
    const shades = generateScale("#4f46e5", 5, 0.1);
    expect(shades[0]).toMatch(/^#/);
    expect(shades[4]).toMatch(/^#/);
  });
});