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
    <div className="rounded-2xl border shadow-sm bg-white dark:bg-neutral-900">
      <div className="border-b flex gap-2 p-2" role="tablist" aria-label="Export formats">
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
            className={`rounded-2xl border px-3 py-1.5 text-xs focus-visible:ring-2 ${tab === t.id ? "bg-black/5 dark:bg-white/10" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="p-3">
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