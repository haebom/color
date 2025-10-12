// Reason: Export tab to preview and copy CSS variables.
import type { JSX } from "react";

export interface CssVarsTabProps {
  css: string;
  onCopy: () => void;
}

/**
 * CssVarsTab shows CSS variables and a copy action.
 */
export default function CssVarsTab({ css, onCopy }: CssVarsTabProps): JSX.Element {
  return (
    <div className="space-y-2">
      <button type="button" onClick={onCopy} className="rounded-2xl border px-3 py-2 text-sm">
        Copy CSS Variables
      </button>
      <pre className="rounded-2xl border p-3 text-xs overflow-x-auto">{css}</pre>
    </div>
  );
}