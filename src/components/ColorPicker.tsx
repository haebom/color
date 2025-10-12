"use client";
import React from "react";
import { useMemo, useRef, useState } from "react";

import { useDebounce } from "@/hooks/useDebounce";
import { ensureHex6Upper } from "@/lib/color/convert";

import type { JSX } from "react";

export type PickerSpace = "rgb" | "hsl" | "oklch" | "hex";

export interface ColorPickerProps {
  /** Current color value as string (e.g. #RRGGBB). */
  value: string;
  /** Handler when color changes. */
  onChange: (next: string) => void;
  /** Optional label for accessibility. */
  label?: string;
}

/**
 * ColorPicker renders an accessible color input with:
 * - Input space switcher (RGB/HSL/OKLCH) + HEX
 * - Eyedropper support (if browser supports)
 * - Debounced updates (16~32ms) to parent store
 */
export default function ColorPicker({ value, onChange, label }: ColorPickerProps): JSX.Element {
  const [space, setSpace] = useState<PickerSpace>("hex");
  const [raw, setRaw] = useState<string>(value);
  const [toastMsg, setToastMsg] = useState<string>("");
  const lastParsed = useRef<string>(value);

  const parsedHex: string | null = useMemo(() => {
    try {
      return ensureHex6Upper(raw);
    } catch {
      return null;
    }
  }, [raw]);

  // Debounce emitting changes
  useDebounce(
    () => {
      if (parsedHex && parsedHex !== lastParsed.current) {
        lastParsed.current = parsedHex;
        onChange(parsedHex);
      }
    },
    24,
    [parsedHex],
  );

  const eyedropperSupported: boolean = typeof window !== "undefined" && "EyeDropper" in window;

  const openEyeDropper = async (): Promise<void> => {
    if (!eyedropperSupported) return;
    const dropperCtor = (window as unknown as { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper;
    if (!dropperCtor) return;
    const dropper = new dropperCtor();
    try {
      const result = await dropper.open();
      setRaw(result.sRGBHex.toUpperCase());
      setSpace("hex");
      setToastMsg("Picked color from screen");
      window.setTimeout(() => setToastMsg(""), 2000);
    } catch {
      // silently ignore cancellation
    }
  };

  const showHexWarning = space === "hex" && parsedHex === null;

  return (
    <div className="flex h-full flex-col gap-5" key={value}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {label ?? "Base Color"}
          </span>
          <p className="text-2xl font-semibold">{parsedHex ?? raw}</p>
        </div>
        <button
          type="button"
          onClick={openEyeDropper}
          disabled={!eyedropperSupported}
          aria-label="Open eyedropper"
          className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 px-3 py-1.5 text-xs font-medium transition hover:-translate-y-0.5 hover:shadow disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-black/60 focus-visible:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 dark:focus-visible:ring-white/60"
        >
          Eyedropper
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 shadow-inner dark:border-neutral-700 dark:bg-neutral-800/60">
        <div className="relative h-36">
          <div className="absolute inset-0 transition" style={{ backgroundColor: parsedHex ?? value }} />
          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between text-white">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-white/80">Preview</span>
              <span className="text-lg font-semibold drop-shadow-sm">{parsedHex ?? value}</span>
            </div>
            <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium text-neutral-900 shadow-sm">
              {space.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Color input space">
        {(["hex", "rgb", "hsl", "oklch"] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={space === k}
            onClick={() => setSpace(k)}
            className={`rounded-2xl border border-neutral-200 px-3 py-1.5 text-xs font-medium transition focus-visible:ring-2 focus-visible:ring-black/60 focus-visible:ring-offset-2 dark:border-neutral-700 dark:text-neutral-100 dark:focus-visible:ring-white/60 ${space === k ? "bg-black text-white dark:bg-neutral-200 dark:text-neutral-900" : "bg-white dark:bg-neutral-800"}`}
          >
            {k.toUpperCase()}
          </button>
        ))}
      </div>

      {space === "hex" ? (
        <div className="grid grid-cols-[auto_1fr] gap-3">
          <input
            aria-label={label ?? "Base Color"}
            className="h-12 rounded-2xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-black/60 focus-visible:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus-visible:ring-white/60"
            type="color"
            value={parsedHex ?? value}
            onChange={(e) => setRaw(e.target.value)}
          />
          <input
            type="text"
            inputMode="text"
            placeholder="#RRGGBB"
            aria-label="HEX input"
            className="h-12 rounded-2xl border border-neutral-200 bg-white px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-black/60 focus-visible:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus-visible:ring-white/60"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-neutral-200 p-4 text-xs text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          {space.toUpperCase()} 입력은 곧 지원될 예정입니다.
        </div>
      )}

      {showHexWarning ? (
        <div role="status" aria-live="polite" className="text-xs text-red-600">
          올바른 HEX 값을 입력해주세요.
        </div>
      ) : null}

      {toastMsg ? (
        <div role="status" aria-live="polite" className="text-xs text-neutral-500 dark:text-neutral-300">
          {toastMsg}
        </div>
      ) : null}
    </div>
  );
}