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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
      <label className="flex flex-col gap-2 min-w-0">
        <span className="text-sm">Algorithm</span>
        <select
          value={algorithm}
          onChange={(e) => onAlgorithmChange(e.target.value as Algorithm)}
          aria-label="Scale algorithm"
          className="h-10 w-full rounded-2xl border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/60 dark:focus-visible:ring-white/60"
        >
          <option value="tailwind">Tailwind CSS</option>
          <option value="material">Material-like (placeholder)</option>
        </select>
      </label>

      <div className="flex flex-col gap-2 min-w-0">
        <span className="text-sm">Contrast (L*) Shift</span>
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
            onKeyDown={onShiftKeyDown}
            aria-label="Global lightness shift input"
            className="h-10 w-24 rounded-2xl border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/60 dark:focus-visible:ring-white/60"
          />
        </div>
      </div>

      <label className="flex flex-col gap-2 min-w-0">
        <span className="text-sm">Shade Count</span>
        <select
          value={shadeCount}
          onChange={(e) => onShadeCountChange(Number(e.target.value))}
          aria-label="Shade count"
          className="h-10 w-full rounded-2xl border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/60 dark:focus-visible:ring-white/60"
        >
          {counts.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-2 min-w-0">
        <span className="text-sm">Naming</span>
        <select
          value={pattern}
          onChange={(e) => onPatternChange(e.target.value as NamingPattern)}
          aria-label="Naming pattern"
          className="h-10 w-full rounded-2xl border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/60 dark:focus-visible:ring-white/60"
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
            className="h-10 w-full rounded-2xl border px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/60 dark:focus-visible:ring-white/60"
          />
        ) : null}
      </div>

      <div className="sm:col-span-4">
        <label className="inline-flex items-center gap-2 text-sm focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-black/60 dark:focus-within:ring-white/60 rounded-2xl px-2 py-1">
          <input
            type="checkbox"
            checked={increaseChromaTowardsDark}
            onChange={(e) => onIncreaseChromaTowardsDarkChange?.(e.target.checked)}
            aria-label="Boost chroma toward dark shades"
          />
          Boost chroma toward dark shades
        </label>
      </div>
    </div>
  );
}