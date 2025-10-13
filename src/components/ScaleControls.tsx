"use client";
import React from "react";
import { useMemo, useState } from "react";

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
  const [parsedShift, setParsedShift] = useState<number>(shift);
  const commitShift = (v: number): void => {
    const clamped = clampShift(v);
    setParsedShift(clamped);
    onShiftChange(clamped);
  };
  const onShiftKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      const n = Number((e.target as HTMLInputElement).value);
      commitShift(Number.isFinite(n) ? n : parsedShift);
    }
  };

  const counts = useMemo(() => Array.from({ length: 11 }, (_, i) => 5 + i), []);

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Algorithm</span>
          <select
            value={algorithm}
            onChange={(e) => onAlgorithmChange(e.target.value as Algorithm)}
            aria-label="Scale algorithm"
            className="h-12 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-black/60 focus-visible:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus-visible:ring-white/60"
          >
            <option value="tailwind">Tailwind CSS</option>
            <option value="material">Material-like (placeholder)</option>
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Shade Count</span>
          <select
            value={shadeCount}
            onChange={(e) => onShadeCountChange(Number(e.target.value))}
            aria-label="Shade count"
            className="h-12 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-black/60 focus-visible:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus-visible:ring-white/60"
          >
            {counts.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_120px]">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Contrast (L*) Shift</span>
          <input
            type="range"
            min={-0.25}
            max={0.25}
            step={0.01}
            value={parsedShift}
            onChange={(e) => commitShift(Number(e.target.value))}
            aria-label="Global lightness shift"
            className="h-12 w-full rounded-2xl border border-transparent bg-neutral-100 accent-neutral-900 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/60 focus-visible:ring-offset-2 dark:bg-neutral-800 dark:accent-neutral-100 dark:focus-visible:ring-white/60"
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Shift Value</span>
          <input
            type="number"
            min={-0.25}
            max={0.25}
            step={0.01}
            value={parsedShift}
            onChange={(e) => commitShift(Number(e.target.value))}
            onKeyDown={onShiftKeyDown}
            aria-label="Global lightness shift input"
            className="h-12 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-black/60 focus-visible:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus-visible:ring-white/60"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Naming pattern</span>
        <div className="grid gap-3 lg:grid-cols-2">
          <select
            value={pattern}
            onChange={(e) => onPatternChange(e.target.value as NamingPattern)}
            aria-label="Naming pattern"
            className="h-12 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-black/60 focus-visible:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus-visible:ring-white/60"
          >
            <option value="50-950">50…950</option>
            <option value="50-900">50…900</option>
            <option value="custom">Custom</option>
          </select>
          {pattern === "custom" ? (
            <input
              type="text"
              value={customNames ?? ""}
              onChange={(e) => onCustomNamesChange?.(e.target.value)}
              aria-label="Custom names"
              placeholder="e.g. Dawn, Noon, Dusk, Night"
              className="h-12 w-full rounded-2xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-black/60 focus-visible:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus-visible:ring-white/60"
            />
          ) : (
            <div className="hidden lg:block" aria-hidden="true" />
          )}
        </div>
      </div>

      <label className="inline-flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium transition focus-within:ring-2 focus-within:ring-black/60 focus-within:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus-within:ring-white/60">
        <input
          type="checkbox"
          checked={increaseChromaTowardsDark}
          onChange={(e) => onIncreaseChromaTowardsDarkChange?.(e.target.checked)}
          aria-label="Boost chroma toward dark shades"
          className="h-4 w-4"
        />
        Boost chroma toward dark shades
      </label>
    </div>
  );
}