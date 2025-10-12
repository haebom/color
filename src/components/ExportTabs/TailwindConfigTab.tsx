// Reason: Export tab that renders a Tailwind config preview for users to copy.
import type { JSX } from "react";

export interface TailwindConfigTabProps {
  configTs: string;
  onCopy: () => void;
}

/**
 * TailwindConfigTab exposes the generated tailwind.config.ts content.
 */
export default function TailwindConfigTab({ configTs, onCopy }: TailwindConfigTabProps): JSX.Element {
  return (
    <div className="space-y-2">
      <button type="button" onClick={onCopy} className="rounded-2xl border px-3 py-2 text-sm">
        Copy tailwind.config.ts
      </button>
      <pre className="rounded-2xl border p-3 text-xs overflow-x-auto">{configTs}</pre>
    </div>
  );
}