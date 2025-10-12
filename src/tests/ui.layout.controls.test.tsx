import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";

import ColorGenerator from "@/components/ColorGenerator";
import ScaleControls from "@/components/ScaleControls";

/**
 * Layout regression tests: ensure control area prevents overlap by using min-w-0 wrappers
 * and inputs that can shrink (w-full on range/select/inputs).
 */

describe("ui.layout.controls", () => {
  it("ColorGenerator top grid children wrapped with min-w-0 to prevent overflow", () => {
    const html = renderToStaticMarkup(<ColorGenerator />);
    // Top section grid should exist
    expect(html).toContain("grid grid-cols-1 gap-4 sm:grid-cols-2");
    // There should be at least two min-w-0 wrappers for the two columns
    const count = (html.match(/min-w-0/g) ?? []).length;
    expect(count).toBeGreaterThanOrEqual(2);
  });

  it("ScaleControls ensures inputs can shrink within grid (range w-full, containers min-w-0)", () => {
    const html = renderToStaticMarkup(
      <ScaleControls
        shift={0}
        shadeCount={11}
        pattern="50-950"
        customNames=""
        algorithm="tailwind"
        increaseChromaTowardsDark={false}
        onShiftChange={() => {}}
        onShadeCountChange={() => {}}
        onPatternChange={() => {}}
        onCustomNamesChange={() => {}}
        onAlgorithmChange={() => {}}
        onIncreaseChromaTowardsDarkChange={() => {}}
      />,
    );
    // Range input should have w-full
    expect(html).toContain("type=\"range\"");
    expect(html).toMatch(/w-full/);
    // Grid wrapper for range+number should include min-w-0 to avoid overflow
    expect(html).toMatch(/grid-cols-\[1fr_auto\]/);
    expect(html).toMatch(/min-w-0/);
    // Multiple control sections use min-w-0
    const minwCount = (html.match(/min-w-0/g) ?? []).length;
    expect(minwCount).toBeGreaterThanOrEqual(3);
  });
});