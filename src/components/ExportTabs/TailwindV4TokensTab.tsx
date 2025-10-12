// Reason: Export tab for Tailwind v4 tokens preview & copy.
import type { JSX } from "react";

export interface TailwindV4TokensTabProps {
  tokens: Record<string, string>;
  onCopy: () => void;
}

/**
 * TailwindV4TokensTab shows v4 design tokens in JSON-ish form.
 */
export default function TailwindV4TokensTab({ tokens, onCopy }: TailwindV4TokensTabProps): JSX.Element {
  return (
    <div className="space-y-2">
      <button type="button" onClick={onCopy} className="rounded-2xl border px-3 py-2 text-sm">
        Copy Tailwind v4 tokens
      </button>
      <pre className="rounded-2xl border p-3 text-xs overflow-x-auto">{JSON.stringify(tokens, null, 2)}</pre>
    </div>
  );
}