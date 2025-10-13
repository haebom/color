"use client";
import React from "react";
import { useEffect, useMemo, useState } from "react";

import ColorPicker from "@/components/ColorPicker";
import ExportTabs from "@/components/ExportTabs/ExportTabs";
import ScaleControls from "@/components/ScaleControls";
import SwatchGrid from "@/components/SwatchGrid";
import { useClipboard } from "@/hooks/useClipboard";
import { useDebounce } from "@/hooks/useDebounce";
import { generateScaleDetailed } from "@/lib/color/scale";
import { fromQuery, toQuery } from "@/lib/color/serializer";
import { usePaletteStore } from "@/store/usePaletteStore";

import type { JSX } from "react";

export default function ColorGenerator(): JSX.Element {
  const [state, update] = usePaletteStore();
  const { base, steps, shift, pattern, customNames, algorithm, inputSpace, increaseChromaTowardsDark } = state;

  const isHexValid: boolean = /^#([0-9a-fA-F]{6})$/.test(base);

  // Hydrate from URL on first render (client-side only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const parsed = fromQuery(window.location.search);
    update({
      base: parsed.baseColor,
      inputSpace: parsed.space,
      steps: parsed.count,
      shift: parsed.shift,
      pattern: parsed.pattern,
      customNames: parsed.names.join(","),
      algorithm: parsed.algo,
      increaseChromaTowardsDark: parsed.incDark,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce pushState when state changes
  const [urlToast, setUrlToast] = useState<string>("");
  const { write, copied } = useClipboard();

  useDebounce(
    () => {
      if (typeof window === "undefined") return;
      const q = toQuery({
        baseColor: base,
        space: inputSpace,
        algo: algorithm,
        shift,
        count: steps,
        names: customNames.trim() ? customNames.split(",").map((s) => s.trim()).filter((s) => s.length > 0) : [],
        incDark: increaseChromaTowardsDark,
        pattern,
      });
      const nextUrl = `${window.location.pathname}?${q}`;
      window.history.pushState(null, "", nextUrl);
    },
    100,
    [base, inputSpace, algorithm, shift, steps, customNames, increaseChromaTowardsDark, pattern],
  );

  const entries = useMemo(() => {
    if (!isHexValid) {
      return Array.from({ length: steps }, (_, i) => ({ hex: "#cccccc", name: `shade-${i + 1}` }));
    }
    const detailed = generateScaleDetailed(base, {
      steps,
      shift,
      increaseChromaTowardsDark,
      namingPattern: pattern,
    });
    return detailed.map((d) => ({ hex: d.hex, name: d.name }));
  }, [base, steps, shift, isHexValid, increaseChromaTowardsDark, pattern]);

  const onShare = async (): Promise<void> => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      await write(url);
      setUrlToast("Copied");
      window.setTimeout(() => setUrlToast(""), 1600);
    } catch {
      setUrlToast("");
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <ColorPicker value={base} onChange={(hex) => update({ base: hex })} label="Base Color" />
          <ScaleControls
            shift={shift}
            shadeCount={steps}
            pattern={pattern}
            customNames={customNames}
            algorithm={algorithm}
            increaseChromaTowardsDark={increaseChromaTowardsDark}
            onShiftChange={(v) => update({ shift: v })}
            onShadeCountChange={(v) => update({ steps: v })}
            onPatternChange={(p) => update({ pattern: p })}
            onCustomNamesChange={(s) => update({ customNames: s })}
            onAlgorithmChange={(a) => update({ algorithm: a })}
            onIncreaseChromaTowardsDarkChange={(val) => update({ increaseChromaTowardsDark: val })}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Palette preview</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {algorithm === "tailwind" ? "Tailwind scale" : "Material-like scale"} · {pattern === "custom" ? "Custom naming" : `Pattern ${pattern}`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onShare}
              className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5 hover:shadow focus-visible:ring-2 focus-visible:ring-black/60 focus-visible:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 dark:focus-visible:ring-white/60"
            >
              Share palette
            </button>
            {urlToast || copied ? (
              <div role="status" aria-live="polite" className="text-xs text-neutral-500 dark:text-neutral-300">
                {urlToast || (copied ? "Copied" : "")}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-6">
          <SwatchGrid entries={entries} />
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
        <ExportTabs
          entries={entries.map((e) => ({ name: e.name ?? "", hex: e.hex }))}
          prefix="primary"
          onCopyText={write}
        />
      </section>
    </div>
  );
}