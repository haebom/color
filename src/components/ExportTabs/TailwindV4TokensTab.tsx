// Reason: Export tab for Tailwind v4 tokens preview & copy.
import { useTranslation } from "react-i18next";

import type { JSX } from "react";

export interface TailwindV4TokensTabProps {
  tokens: Record<string, unknown>;
  onCopy: () => void;
}

/**
 * TailwindV4TokensTab shows v4 design tokens in JSON-ish form.
 */
export default function TailwindV4TokensTab({ tokens, onCopy }: TailwindV4TokensTabProps): JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <button type="button" onClick={onCopy} className="rounded-2xl border px-3 py-2 text-sm">
        {t("copy_tailwind_v4")}
      </button>
      <pre className="rounded-2xl border p-3 text-xs overflow-x-auto">{JSON.stringify(tokens, null, 2)}</pre>
    </div>
  );
}