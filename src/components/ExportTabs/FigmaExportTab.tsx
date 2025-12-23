// Reason: Placeholder tab for future Figma plugin/export integration.
import type { JSX } from "react";
import { useTranslation } from "react-i18next";

/**
 * FigmaExportTab is a placeholder until actual Figma integration is ready.
 */
export default function FigmaExportTab(): JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border p-3 text-sm">
      {t("figma_coming_soon")}
    </div>
  );
}