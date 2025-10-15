"use client";
import React from "react";
import { useMemo, useState } from "react";

import ColorPicker from "@/components/ColorPicker";
import ExportTabs from "@/components/ExportTabs/ExportTabs";
import GradientShadowGenerator from "@/components/GradientShadowGenerator";
import ScaleControls from "@/components/ScaleControls";
import SwatchGrid from "@/components/SwatchGrid";
import { useClipboard } from "@/hooks/useClipboard";
import { useDebounce } from "@/hooks/useDebounce";
import { generateScaleDetailed } from "@/lib/color/scale";
import { fromQuery, toQuery } from "@/lib/color/serializer";
import { usePaletteStore } from "@/store/usePaletteStore";

import type { PaletteState } from "@/store/usePaletteStore";
import type { JSX } from "react";

export interface ColorGeneratorProps {
  initial?: Partial<PaletteState>;
}

export default function ColorGenerator({ initial }: ColorGeneratorProps): JSX.Element {
  const computedInitial = useMemo<Partial<PaletteState> | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    const parsed = fromQuery(window.location.search);
    return {
      base: parsed.baseColor,
      inputSpace: parsed.space,
      steps: parsed.count,
      shift: parsed.shift,
      pattern: parsed.pattern,
      customNames: parsed.names.join(","),
      algorithm: parsed.algo,
      increaseChromaTowardsDark: parsed.incDark,
    } satisfies Partial<PaletteState>;
  }, []);
  const [state, update] = usePaletteStore(initial ?? computedInitial);
  const { base, steps, shift, pattern, customNames, algorithm, inputSpace, increaseChromaTowardsDark } = state;

  const isHexValid: boolean = /^#([0-9a-fA-F]{6})$/.test(base);

  // URL 하이드레이션은 서버 컴포넌트에서 초기 상태를 전달하여 처리합니다.

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
    <div className="mx-auto max-w-5xl space-y-8">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-start">
        <div className="min-w-0">
          <ColorPicker value={base} onChange={(hex) => update({ base: hex })} label="Base Color" />
        </div>
        <div className="min-w-0">
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

      <section className="flex items-center justify-between">
        <div>
          <button type="button" onClick={onShare} className="rounded-2xl border px-3 py-2 text-sm">
            Share (Copy URL)
          </button>
        </div>
        {urlToast || copied ? (
          <div role="status" aria-live="polite" className="text-xs">
            {urlToast || (copied ? "Copied" : "")}
          </div>
        ) : null}
      </section>

      <section>
        <SwatchGrid entries={entries} />
      </section>

      <section>
        <ExportTabs
          entries={entries.map((e) => ({ name: e.name ?? "", hex: e.hex }))}
          prefix="primary"
          onCopyText={write}
        />
      </section>

      <section>
        <GradientShadowGenerator palette={entries} />
      </section>
    </div>
  );
}