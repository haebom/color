// Reason: Regression tests for improved OKLCH scale generator with detailed outputs.
import { parse, oklab } from "culori";
import { describe, it, expect } from "vitest";

import { generateScaleDetailed } from "@/lib/color/scale";

function deltaEOklab(a: { l: number; a: number; b: number }, b: { l: number; a: number; b: number }): number {
  const dl = a.l - b.l;
  const da = a.a - b.a;
  const db = a.b - b.b;
  return Math.sqrt(dl * dl + da * da + db * db);
}

describe("color.scale.detailed", () => {
  it("produces 11 entries with default naming and rounding policies", () => {
    const entries = generateScaleDetailed("#4f46e5", { steps: 11 });
    expect(entries.length).toBe(11);
    // Names per 50..950
    expect(entries[0].name).toBe("50");
    expect(entries[10].name).toBe("950");
    // HEX upper-case
    expect(entries[0].hex).toMatch(/^#[0-9A-F]{6}$/);
    // HSL 1 decimal, OKLCH 3 decimals
    const hsl = entries[0].hsl;
    const ok = entries[0].oklch;
    expect(hsl.h).toBe(Number(hsl.h.toFixed(1)));
    expect(hsl.s).toBe(Number(hsl.s.toFixed(1)));
    expect(hsl.l).toBe(Number(hsl.l.toFixed(1)));
    expect(ok.l).toBe(Number(ok.l.toFixed(3)));
    expect(ok.c).toBe(Number(ok.c.toFixed(3)));
    expect(ok.h).toBe(Number(ok.h.toFixed(3)));
  });

  it("clamps L within 0..1 under extreme shift", () => {
    const entries = generateScaleDetailed("#4f46e5", { steps: 11, shift: 1 });
    for (const e of entries) {
      expect(e.oklch.l).toBeGreaterThanOrEqual(0);
      expect(e.oklch.l).toBeLessThanOrEqual(1);
    }
  });

  it("50/100 are bright and 900/950 are sufficiently dark", () => {
    const entries = generateScaleDetailed("#4f46e5", { steps: 11 });
    const l50 = entries[0].oklch.l;
    const l100 = entries[1].oklch.l;
    const l900 = entries[9].oklch.l;
    const l950 = entries[10].oklch.l;
    expect(l50).toBeGreaterThan(l900);
    expect(l100).toBeGreaterThan(l900);
    expect(l900).toBeGreaterThan(l950);
    // Visual separation threshold
    expect(l100 - l900).toBeGreaterThan(0.2);
  });

  it("round-trip HEX error is < 1 ΔE (OKLAB)", () => {
    const entries = generateScaleDetailed("#4f46e5", { steps: 11 });
    for (const e of entries) {
      const fromOK = oklab({ mode: "oklch", l: e.oklch.l, c: e.oklch.c, h: e.oklch.h });
      const fromHex = oklab(parse(e.hex) as unknown);
      expect(deltaEOklab(fromOK, fromHex)).toBeLessThan(1);
    }
  });

  it("shade count can vary up to 15 and names fallback for custom pattern", () => {
    const entries = generateScaleDetailed("#4f46e5", { steps: 15, namingPattern: "custom" });
    expect(entries.length).toBe(15);
    expect(entries[0].name).toBe("shade-1");
    expect(entries[14].name).toBe("shade-15");
  });

  it("optionally increases chroma towards dark to prevent muddiness", () => {
    const withBoost = generateScaleDetailed("#4f46e5", { steps: 11, increaseChromaTowardsDark: true });
    const cStart = withBoost[0].oklch.c;
    const cEnd = withBoost[10].oklch.c;
    expect(cEnd).toBeGreaterThanOrEqual(cStart);
  });

  it("supports gamma distribution for lightness (monotonic decreasing)", () => {
    const entries = generateScaleDetailed("#4f46e5", { steps: 11, lDistribution: { type: "gamma", gamma: 2 } });
    for (let i = 1; i < entries.length; i += 1) {
      expect(entries[i - 1].oklch.l).toBeGreaterThan(entries[i].oklch.l);
    }
  });

  it("produces distinct HEX values for #6a8d51 across steps", () => {
    const entries = generateScaleDetailed("#6a8d51", { steps: 11 });
    const uniq = new Set(entries.map((e) => e.hex.toUpperCase()));
    expect(uniq.size).toBeGreaterThan(5);
    // Ideally all distinct
    expect(uniq.size).toBe(entries.length);
  });
});