// Reason: Export tab to provide vendor-neutral JSON design tokens.
import type { JSX } from "react";

export interface JsonTokensTabProps {
  json: Record<string, unknown>;
  onCopy: () => void;
}

/**
 * JsonTokensTab presents design tokens as JSON.
 */
export default function JsonTokensTab({ json, onCopy }: JsonTokensTabProps): JSX.Element {
  return (
    <div className="space-y-2">
      <button type="button" onClick={onCopy} className="rounded-2xl border px-3 py-2 text-sm">
        Copy JSON tokens
      </button>
      <pre className="rounded-2xl border p-3 text-xs overflow-x-auto">{JSON.stringify(json, null, 2)}</pre>
    </div>
  );
}