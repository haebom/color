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

  return (
    <div className="flex flex-col gap-2" key={value}>
      <span className="text-sm">{label ?? "Base Color"}</span>
      <div className="flex items-center gap-2" role="tablist" aria-label="Color input space">
        {(["hex", "rgb", "hsl", "oklch"] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={space === k}
            onClick={() => setSpace(k)}
            className={`rounded-2xl border px-3 py-1.5 text-xs focus-visible:ring-2 ${space === k ? "bg-black/5 dark:bg-white/10" : ""}`}
          >
            {k.toUpperCase()}
          </button>
        ))}
        <button
          type="button"
          onClick={openEyeDropper}
          disabled={false}
          aria-label="Open eyedropper"
          className="ml-auto rounded-2xl border px-3 py-1.5 text-xs focus-visible:ring-2 disabled:opacity-50"
        >
          Eyedropper
        </button>
      </div>

      {/* Unified inputs per space */}
      {space === "hex" ? (
        <div className="grid grid-cols-[auto_1fr] gap-2">
          <input
            aria-label={label ?? "Base Color"}
            className="rounded-2xl border px-3 py-2 text-sm outline-none focus-visible:ring-2"
            type="color"
            value={parsedHex ?? value}
            onChange={(e) => setRaw(e.target.value)}
          />
          <input
            type="text"
            inputMode="text"
            placeholder="#RRGGBB"
            aria-label="HEX input"
            className="rounded-2xl border px-3 py-2 text-sm outline-none focus-visible:ring-2"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
          />
        </div>
      ) : null}

      {toastMsg ? (
        <div role="status" aria-live="polite" className="text-xs">
          {toastMsg}
        </div>
      ) : null}
    </div>
  );
}