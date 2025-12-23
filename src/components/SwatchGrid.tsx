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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
      {entries.map((e, i) => {
        const ratio = contrastBadge(foreground, e.hex);
        const rating = getWcagRating(ratio);
        const nameLabel = e.name ?? `shade-${i + 1}`;
        return (
          <div
            key={`${e.hex}-${i}`}
            className="group rounded-2xl overflow-hidden border bg-white shadow-sm dark:bg-neutral-900 dark:border-neutral-800 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-black/60 dark:focus-within:ring-white/60"
            tabIndex={0}
            role="button"
            aria-label={`${nameLabel} ${e.hex} with WCAG ${rating}`}
          >
            <div className="relative h-20">
              <div className="absolute inset-0" style={{ backgroundColor: e.hex }} />
              {/* name badge */}
              <span className="absolute left-2 top-2 rounded-full bg-white/85 text-gray-900 dark:bg-white/80 px-2 py-0.5 text-[11px] font-medium shadow-sm ring-1 ring-black/5">
                {nameLabel}
              </span>
              {/* WCAG badge */}
              <span className="absolute right-2 top-2 rounded-full bg-black/70 text-white px-2 py-0.5 text-[11px] font-semibold">
                {rating}
              </span>
            </div>
            <div className="p-2 text-[11px] grid grid-cols-1">
              <span className="font-mono text-gray-900 dark:text-gray-100">{e.hex}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}