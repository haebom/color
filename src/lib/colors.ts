import { oklch, formatCss, parse } from "culori";

/**
 * Generate a scale of OKLCH colors from a base color.
 * Ensures perceptual uniformity and accessibility by adjusting lightness and chroma.
 *
 * @param baseHex - Base color in HEX (e.g. "#259b39")
 * @param steps - Number of shades to generate (default 11 -> 50..950)
 * @returns Array of HEX strings representing the scale
 */
export function generateOklchScale(baseHex: string, steps: number = 11): string[] {
  const base = parse(baseHex);
  if (!base) {
    throw new Error("Invalid base color");
  }
  const baseOklch = oklch(base);
  const results: string[] = [];
  for (let i = 0; i < steps; i += 1) {
    const t = i / (steps - 1);
    const lightness = 0.97 - t * 0.86; // 0.97..0.11
    const chroma = Math.max(0, Math.min(0.15, baseOklch.c));
    const color = oklch({ l: lightness, c: chroma, h: baseOklch.h });
    results.push(formatCss(color, "hex"));
  }
  return results;
}

/**
 * Create CSS variables from generated scale.
 * @param name - Token prefix (e.g. "malachite")
 * @param hexes - Array of colors
 */
export function toCssVariables(name: string, hexes: string[]): string {
  const tokens = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  const lines = hexes.map((hex, i) => `  --${name}-${tokens[i]}: ${hex};`);
  return [":root {", ...lines, "}"].join("\n");
}

/**
 * Create CSS variables from entries (supports custom names and counts).
 * @param prefix - Token prefix (e.g. "primary")
 * @param entries - Array of { name, hex }
 */
export function toCssVariablesFromEntries(prefix: string, entries: ReadonlyArray<{ name: string; hex: string }>): string {
  const lines = entries.map((e) => `  --${sanitizeToken(prefix)}-${sanitizeToken(e.name)}: ${e.hex};`);
  return [":root {", ...lines, "}"].join("\n");
}

/**
 * Generate Tailwind config (TypeScript) snippet with colors.extend mapping.
 * @param prefix - Color key under theme.extend.colors
 * @param entries - Array of { name, hex }
 */
export function toTailwindConfigTs(prefix: string, entries: ReadonlyArray<{ name: string; hex: string }>): string {
  const body = entries
    .map((e) => `        \"${sanitizeToken(e.name)}\": \"${e.hex}\",`)
    .join("\n");
  return [
    "export default {",
    "  theme: {",
    "    extend: {",
    "      colors: {",
    `        ${sanitizeToken(prefix)}: {`,
    body,
    "        },",
    "      },",
    "    },",
    "  },",
    "} satisfies import('tailwindcss').Config;",
  ].join("\n");
}

/**
 * Produce Tailwind v4-style tokens object (flat key:value or nested color map).
 * Nested structure: { color: { [prefix]: { name: hex } } }
 */
export function toTailwindV4Tokens(prefix: string, entries: ReadonlyArray<{ name: string; hex: string }>): Record<string, unknown> {
  const colorMap: Record<string, string> = {};
  for (const e of entries) {
    colorMap[sanitizeToken(e.name)] = e.hex;
  }
  return { color: { [sanitizeToken(prefix)]: colorMap } };
}

/**
 * Vendor-neutral JSON design tokens structure.
 * Example: { tokens: { color: { primary: { 50: { $type: 'color', $value: '#...' } } } } }
 */
export function toJsonTokens(prefix: string, entries: ReadonlyArray<{ name: string; hex: string }>): Record<string, unknown> {
  const colorMap: Record<string, Record<string, { $type: string; $value: string }>> = {};
  const key = sanitizeToken(prefix);
  colorMap[key] = {};
  for (const e of entries) {
    colorMap[key][sanitizeToken(e.name)] = { $type: "color", $value: e.hex };
  }
  return { tokens: { color: colorMap } };
}

/** Sanitize token keys: lowercase, replace spaces with '-', strip invalid chars */
function sanitizeToken(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "");
}