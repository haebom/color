"use client";
import React from "react";
import { useTranslation } from "react-i18next";

import type { JSX } from "react";

export interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  label?: string;
}

// Helper for naive hex parsing
function safeHex(v: string): string | null {
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
  return null;
}

export default function ColorPicker({ value, onChange, label }: ColorPickerProps): JSX.Element {
  const { t } = useTranslation();
  const [space, setSpace] = React.useState<"hex" | "rgb" | "hsl" | "oklch">("hex");
  const [raw, setRaw] = React.useState<string>(value);

  // Sync internal raw state if prop changes externally
  React.useEffect(() => {
    setRaw(value);
  }, [value]);

  const parsedHex = safeHex(raw);

  const openEyeDropper = async () => {
    if (!window.EyeDropper) return;
    try {
      const ed = new window.EyeDropper();
      const result = await ed.open();
      if (result && result.sRGBHex) {
        onChange(result.sRGBHex);
        setRaw(result.sRGBHex);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col gap-2" key={value}>
      <span className="text-sm select-none">{label ?? t("base_color_label")}</span>
      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap" role="tablist" aria-label="Color input space">
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
          className="basis-full w-full sm:basis-auto sm:w-auto mt-2 sm:mt-0 rounded-2xl border px-3 py-1.5 text-xs focus-visible:ring-2 disabled:opacity-50"
        >
          {t("eyedropper")}
        </button>
      </div>

      {/* Unified inputs per space */}
      {space === "hex" ? (
        <div className="grid grid-cols-[auto_1fr] gap-2">
          <input
            aria-label={label ?? t("base_color_label")}
            className="rounded-2xl border px-3 py-2 text-sm outline-none focus-visible:ring-2"
            type="color"
            value={parsedHex ?? value}
            onChange={(e) => setRaw(e.target.value)}
          />
          <input
            type="text"
            className="rounded-2xl border px-3 py-2 text-sm font-mono outline-none focus-visible:ring-2"
            value={raw}
            onChange={(e) => {
              setRaw(e.target.value);
              const v = safeHex(e.target.value);
              if (v) onChange(v);
            }}
          />
        </div>
      ) : (
        <div className="p-4 rounded-2xl border border-dashed text-xs text-neutral-500">
          {t("coming_soon_input", { space: space.toUpperCase() })}
        </div>
      )}
    </div>
  );
}
