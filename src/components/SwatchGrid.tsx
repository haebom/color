"use client";
import React from "react";

import { getWcagRating, contrastBadge } from "@/lib/a11y/wcag";

import type { JSX } from "react";

export interface SwatchGridEntry {
  /** HEX color (#RRGGBB) */
  hex: string;
  /** Optional display name token (e.g., 50, 100, 200...) */
  name?: string;
}

export interface SwatchGridProps {
  /** Entries with HEX and optional token name */
  entries: ReadonlyArray<SwatchGridEntry>;
  /** Text color to compare against for WCAG rating */
  foreground?: string;
}

/**
 * SwatchGrid renders color chips styled like kigen's palette: name badge and WCAG badge overlay.
 * Cards are rounded-2xl with border, subtle shadow, and keyboard-focus ring.
 */
export default function SwatchGrid({ entries, foreground = "#000000" }: SwatchGridProps): JSX.Element {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid grid-flow-col auto-cols-[minmax(140px,1fr)] gap-4">
        {entries.map((e, i) => {
          const ratio = contrastBadge(foreground, e.hex);
          const rating = getWcagRating(ratio);
          const nameLabel = e.name ?? `shade-${i + 1}`;
          return (
            <button
              key={`${e.hex}-${i}`}
              type="button"
              className="group relative flex h-48 flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/60 focus-visible:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:focus-visible:ring-white/60"
              aria-label={`${nameLabel} ${e.hex} with WCAG ${rating}`}
            >
              <div className="relative flex-1">
                <div className="absolute inset-0 transition" style={{ backgroundColor: e.hex }} />
                <div className="absolute inset-x-4 top-4 flex items-center justify-between text-[11px] font-semibold text-neutral-900">
                  <span className="rounded-full bg-white/85 px-3 py-1 shadow-sm ring-1 ring-black/5 dark:bg-white/80">
                    {nameLabel}
                  </span>
                  <span className="rounded-full bg-black/75 px-3 py-1 text-white shadow-sm">
                    {rating}
                  </span>
                </div>
                <div className="absolute inset-x-4 bottom-4 flex items-end justify-between text-[11px] font-medium text-white drop-shadow-sm">
                  <span className="font-mono tracking-wide">{e.hex}</span>
                  <span>{ratio.toFixed(2)}:1</span>
                </div>
              </div>
              <div className="border-t border-neutral-100 px-4 py-3 text-[11px] uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                대비 기준 {foreground.toUpperCase()}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}