// Reason: Live UI preview components (button/badge) to visualize palette application.
"use client";
import type { JSX } from "react";

/**
 * LivePreview renders sample UI elements using CSS variables.
 */
export default function LivePreview(): JSX.Element {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        className="rounded-2xl px-4 py-2 text-sm shadow-sm focus-visible:ring-2"
        style={{
          backgroundColor: "var(--primary-500)",
          color: "var(--on-primary)",
        }}
        aria-label={t("aria_sample_button")}
      >
        {t("sample_button")}
      </button>
      <span
        className="inline-flex items-center rounded-2xl px-2.5 py-1 text-xs border"
        style={{
          backgroundColor: "var(--primary-100)",
          color: "var(--primary-700)",
          borderColor: "var(--primary-200)",
        }}
        aria-label={t("aria_sample_badge")}
      >
        {t("sample_badge")}
      </span>
    </div>
  );
}