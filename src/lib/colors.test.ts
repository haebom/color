import { describe, it, expect } from "vitest";

import { generateOklchScale, toCssVariables } from "@/lib/colors";

/**
 * Basic tests for color scale generation.
 */
describe("colors", () => {
  it("generates 11 shades", () => {
    const scale = generateOklchScale("#259b39");
    expect(scale.length).toBe(11);
  });

  it("produces CSS variables with tokens 50..950", () => {
    const scale = generateOklchScale("#259b39");
    const css = toCssVariables("malachite", scale);
    expect(css).toContain(":root {");
    expect(css).toContain("--malachite-50:");
    expect(css).toContain("--malachite-950:");
  });
});