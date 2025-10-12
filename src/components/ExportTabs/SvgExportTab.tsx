// Reason: Export tab that renders SVG swatches for vector-friendly export.
import type { JSX } from "react";

export interface SvgExportTabProps {
  colors: ReadonlyArray<string>;
  onCopy: () => void;
}

/**
 * SvgExportTab shows an inline SVG grid of swatches.
 */
export default function SvgExportTab({ colors, onCopy }: SvgExportTabProps): JSX.Element {
  const size = 24;
  const cols = 8;
  const rows = Math.ceil(colors.length / cols);
  const width = cols * size;
  const height = rows * size;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">\n${colors
    .map((c, i) => {
      const x = (i % cols) * size;
      const y = Math.floor(i / cols) * size;
      return `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${c}"/>`;
    })
    .join("\n")}\n</svg>`;
  return (
    <div className="space-y-2">
      <button type="button" onClick={onCopy} className="rounded-2xl border px-3 py-2 text-sm">
        Copy SVG
      </button>
      <pre className="rounded-2xl border p-3 text-xs overflow-x-auto">{svg}</pre>
    </div>
  );
}