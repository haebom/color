// Reason: Tests for URL state serialization and parsing (new API).
import { describe, it, expect } from "vitest";

import { toQuery, fromQuery } from "@/lib/color/serializer";

describe("url.serialize", () => {
  it("roundtrip preserves fields", () => {
    const q = toQuery({
      baseColor: "#123456",
      space: "oklch",
      algo: "tailwind",
      shift: 0.2,
      count: 15,
      names: ["50", "100"],
      incDark: true,
      pattern: "custom",
    });
    const parsed = fromQuery(q);
    expect(parsed.baseColor.toLowerCase()).toBe("#123456");
    expect(parsed.space).toBe("oklch");
    expect(parsed.algo).toBe("tailwind");
    expect(parsed.shift).toBeCloseTo(0.2);
    expect(parsed.count).toBe(15);
    expect(parsed.names).toEqual(["50", "100"]);
    expect(parsed.incDark).toBe(true);
    expect(parsed.pattern).toBe("custom");
  });

  it("defaults restored when fields missing", () => {
    const parsed = fromQuery("?");
    expect(parsed.baseColor).toMatch(/^#/);
    expect(parsed.space).toBe("hex");
    expect(parsed.algo).toBe("tailwind");
    expect(parsed.shift).toBe(0);
    expect(parsed.count).toBe(11);
    expect(parsed.names).toEqual([]);
    expect(parsed.incDark).toBe(false);
    expect(parsed.pattern).toBe("50-950");
  });
});