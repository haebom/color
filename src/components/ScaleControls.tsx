"use client";
import React from "react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { JSX } from "react";

export type NamingPattern = "50-950" | "50-900" | "custom";
export type Algorithm = "tailwind" | "material";

export interface ScaleControlsProps {
  /** Global lightness (contrast) shift (-0.25..+0.25). */
  shift: number;
  /** Set the desired shade count (5..15). */
  shadeCount: number;
  /** Naming style for tokens. */
  pattern: NamingPattern;
  /** Optional custom comma-separated names (when pattern=custom). */
  customNames?: string;
  /** Algorithm for distribution. */
  algorithm: Algorithm;
  /** Boost chroma slightly towards darker shades to reduce muddiness. */
  increaseChromaTowardsDark?: boolean;
  onShiftChange: (v: number) => void;
  onShadeCountChange: (v: number) => void;
  onPatternChange: (p: NamingPattern) => void;
  onCustomNamesChange?: (s: string) => void;
  onAlgorithmChange: (a: Algorithm) => void;
  onIncreaseChromaTowardsDarkChange?: (v: boolean) => void;
}

/** Helper to keep shift in bounds and avoid jitter when typing */
function clampShift(v: number): number {
  return Math.max(-0.25, Math.min(0.25, v));
}

export default function ScaleControls({
  shift,
  shadeCount,
  pattern,
  customNames,
  algorithm,
  increaseChromaTowardsDark = false,
  onShiftChange,
  onShadeCountChange,
  onPatternChange,
  onCustomNamesChange,
  onAlgorithmChange,
  onIncreaseChromaTowardsDarkChange,
}: ScaleControlsProps): JSX.Element {
  const { t } = useTranslation();
  const [parsedShift, setParsedShift] = useState<number>(shift);
  const commitShift = (v: number): void => {
    const clamped = clampShift(v);
    setParsedShift(clamped);
    onShiftChange(clamped);
  };

  const counts = useMemo(() => Array.from({ length: 11 }, (_, i) => 5 + i), []);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 items-start">
      <label className="flex flex-col gap-2 min-w-0 select-none">
        <span className="text-sm">{t("algorithm")}</span>
        <select
          value={algorithm}
          onChange={(e) => onAlgorithmChange(e.target.value as Algorithm)}
          aria-label="Scale algorithm"
          className="h-10 w-full rounded-2xl border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/60 dark:focus-visible:ring-white/60"
        >
          <option value="tailwind">{t("options.tailwind")}</option>
          <option value="material">{t("options.material")}</option>
        </select>
      </label>

      <div className="flex flex-col gap-2 min-w-0">
        <span className="text-sm">{t("contrast_shift")}</span>
        <div className="grid grid-cols-[1fr_auto] gap-2 min-w-0">
          <input
            type="range"
            min={-0.25}
            max={0.25}
            step={0.01}
            value={parsedShift}
            onChange={(e) => commitShift(Number(e.target.value))}
            aria-label="Global lightness shift"
            className="h-10 w-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/60 dark:focus-visible:ring-white/60"
          />
          <input
            type="number"
            min={-0.25}
            max={0.25}
            step={0.01}
            value={parsedShift}
            onChange={(e) => commitShift(Number(e.target.value))}
            aria-label="Global lightness shift value"
            className="h-10 w-20 rounded-2xl border px-2 text-center text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/60 dark:focus-visible:ring-white/60"
          />
        </div>
      </div>

      <label className="flex flex-col gap-2 min-w-0 select-none">
        <span className="text-sm">{t("shade_count")}</span>
        <select
          value={shadeCount}
          onChange={(e) => onShadeCountChange(Number(e.target.value))}
          aria-label="Shade count"
          className="h-10 w-full rounded-2xl border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/60 dark:focus-visible:ring-white/60"
        >
          {counts.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-2 min-w-0">
        <span className="text-sm select-none">{t("naming")}</span>
        <div className="flex flex-col gap-2">
          <select
            value={pattern}
            onChange={(e) => onPatternChange(e.target.value as NamingPattern)}
            aria-label="Naming pattern"
            className="h-10 w-full rounded-2xl border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/60 dark:focus-visible:ring-white/60"
          >
            <option value="50-950">50..950 (Tailwind Default)</option>
            <option value="50-900">50..900 (Material)</option>
            <option value="custom">Custom (Comma separated)</option>
          </select>
          {pattern === "custom" && (
            <input
              type="text"
              placeholder="e.g. 50,100,200..."
              value={customNames ?? ""}
              onChange={(e) => onCustomNamesChange?.(e.target.value)}
              className="h-10 w-full rounded-2xl border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/60 dark:focus-visible:ring-white/60"
            />
          )}
        </div>
      </div>

      <div className="col-span-1 sm:col-span-2 xl:col-span-4 mt-2">
        <label className="flex items-center gap-2 select-none cursor-pointer">
          <input
            type="checkbox"
            checked={increaseChromaTowardsDark}
            onChange={(e) => onIncreaseChromaTowardsDarkChange?.(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            {t("boost_chroma")}
          </span>
        </label>
      </div>
    </div>
  );
}
