import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [tab, setTab] = useState<string>("css");

  const css = useMemo(() => toCssVariablesFromEntries(prefix, entries), [prefix, entries]);
  const twConfig = useMemo(() => toTailwindConfigTs(prefix, entries), [prefix, entries]);
  const tw4Tokens = useMemo(() => toTailwindV4Tokens(prefix, entries), [prefix, entries]);
  const jsonTokens = useMemo(() => toJsonTokens(prefix, entries), [prefix, entries]);
  const svgColors = useMemo(() => entries.map((e) => e.hex), [entries]);

  const tabs = [
    { id: "css", label: t("export.css") },
    { id: "tw", label: t("export.tailwind") },
    { id: "tw4", label: t("export.tailwind4") },
    { id: "json", label: t("export.tokens") },
    { id: "svg", label: t("export.svg") },
    { id: "figma", label: t("export.figma") },
  ];

  return (
    <div className="rounded-2xl border shadow-sm bg-white dark:bg-neutral-900">
      <div className="border-b flex gap-2 p-2 overflow-x-auto" role="tablist" aria-label="Export formats">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.id}
            type="button"
            role="tab"
            aria-selected={tab === tabItem.id}
            onClick={() => setTab(tabItem.id)}
            className={`whitespace-nowrap rounded-2xl border px-3 py-1.5 text-xs focus-visible:ring-2 ${tab === tabItem.id ? "bg-black/5 dark:bg-white/10" : ""}`}
          >
            {tabItem.label}
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
