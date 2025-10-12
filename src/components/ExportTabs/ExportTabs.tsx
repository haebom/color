import React, { useMemo, useState } from "react";

import CssVarsTab from "@/components/ExportTabs/CssVarsTab";
import FigmaExportTab from "@/components/ExportTabs/FigmaExportTab";
import JsonTokensTab from "@/components/ExportTabs/JsonTokensTab";
import SvgExportTab from "@/components/ExportTabs/SvgExportTab";
import TailwindConfigTab from "@/components/ExportTabs/TailwindConfigTab";
import TailwindV4TokensTab from "@/components/ExportTabs/TailwindV4TokensTab";
import { toCssVariablesFromEntries, toTailwindConfigTs, toTailwindV4Tokens, toJsonTokens } from "@/lib/colors";

import type { JSX } from "react";

export interface ExportTabsProps {
  entries: ReadonlyArray<{ name: string; hex: string }>;
  prefix: string;
  onCopyText: (text: string) => Promise<void>;
}

export default function ExportTabs({ entries, prefix, onCopyText }: ExportTabsProps): JSX.Element {
  const [tab, setTab] = useState<string>("css");

  const css = useMemo(() => toCssVariablesFromEntries(prefix, entries), [prefix, entries]);
  const twConfig = useMemo(() => toTailwindConfigTs(prefix, entries), [prefix, entries]);
  const tw4Tokens = useMemo(() => toTailwindV4Tokens(prefix, entries), [prefix, entries]);
  const jsonTokens = useMemo(() => toJsonTokens(prefix, entries), [prefix, entries]);
  const svgColors = useMemo(() => entries.map((e) => e.hex), [entries]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Export formats">
        {[
          { id: "css", label: "CSS" },
          { id: "tw", label: "Tailwind" },
          { id: "tw4", label: "Tailwind 4" },
          { id: "json", label: "Tokens" },
          { id: "svg", label: "SVG" },
          { id: "figma", label: "Figma" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full border border-neutral-200 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/60 focus-visible:ring-offset-2 dark:border-neutral-700 dark:text-neutral-100 dark:focus-visible:ring-white/60 ${tab === t.id ? "bg-black text-white dark:bg-neutral-100 dark:text-neutral-900" : "bg-white dark:bg-neutral-800"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 p-4 shadow-inner dark:border-neutral-700 dark:bg-neutral-900/60">
        {tab === "css" ? (
          <CssVarsTab css={css} onCopy={() => onCopyText(css)} />
        ) : tab === "tw" ? (
          <TailwindConfigTab configTs={twConfig} onCopy={() => onCopyText(twConfig)} />
        ) : tab === "tw4" ? (
          <TailwindV4TokensTab tokens={tw4Tokens} onCopy={() => onCopyText(JSON.stringify(tw4Tokens))} />
        ) : tab === "json" ? (
          <JsonTokensTab json={jsonTokens} onCopy={() => onCopyText(JSON.stringify(jsonTokens))} />
        ) : tab === "svg" ? (
          <SvgExportTab colors={svgColors} onCopyText={(svg) => onCopyText(svg)} />
        ) : (
          <FigmaExportTab />
        )}
      </div>
    </div>
  );
}