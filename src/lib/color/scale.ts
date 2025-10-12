// Reason: Core OKLCH-based scale generation used by the UI and worker.
// Reason: Add local type for OKLCH CSS formatting to satisfy TS.
// Reason: Simplify generation: format OKLCH directly to hex and avoid double parsing.
import { oklch as toOKLCH, parse, oklab as toOKLAB } from "culori";

import { hexToRgb, rgbToHsl, oklchToHex } from "./convert";

import type { Rgb, Hsl, Oklch } from "./convert";

/** A single scale entry with multiple color space representations and name */
export interface ScaleEntry {
  hex: string;
  rgb: Rgb;
  hsl: Hsl;
  oklch: Oklch;
  name: string;
}

/** Options to control OKLCH scale generation */
export interface ScaleOptions {
  /** Number of shades to generate (default 11, up to 15) */
  steps: number;
  /** Global lightness shift added to each L (will be clamped to 0..1) */
  shift: number;
  /** Clamp for chroma, stable region near 0.37 */
  chromaMax: number;
  /** Toggle: increase chroma slightly toward dark steps to reduce muddiness */
  increaseChromaTowardsDark: boolean;
  /** Naming pattern for tokens */
  namingPattern: "50-950" | "50-900" | "custom";
  /** Lightness distribution control */
  lDistribution:
    | { type: "preset" }
    | { type: "gamma"; gamma: number };
}

const STANDARD_TOKENS_50_950: ReadonlyArray<number> = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
];

const STANDARD_TOKENS_50_900: ReadonlyArray<number> = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900,
];

/** Default non-linear lightness steps (11 entries) */
const DEFAULT_LIGHT_STEPS_11: ReadonlyArray<number> = [
  0.97, 0.884, 0.8, 0.712, 0.626, 0.54, 0.454, 0.368, 0.281, 0.195, 0.11,
];

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

function round(v: number, digits: number): number {
  return Number(v.toFixed(digits));
}

function sampleLightness(steps: number, distribution: ScaleOptions["lDistribution"]): number[] {
  if (distribution.type === "preset") {
    // Sample/lerp across the preset to fit desired step count
    const src = DEFAULT_LIGHT_STEPS_11;
    const out: number[] = [];
    const nSrc = src.length;
    for (let i = 0; i < steps; i += 1) {
      const pos = (i * (nSrc - 1)) / Math.max(steps - 1, 1);
      const i0 = Math.floor(pos);
      const i1 = Math.min(nSrc - 1, i0 + 1);
      const f = pos - i0;
      out.push(src[i0] * (1 - f) + src[i1] * f);
    }
    return out;
  }
  // Gamma-based non-linear curve between 0.97..0.11
  const lStart = 0.97;
  const lEnd = 0.11;
  const span = lStart - lEnd;
  const out: number[] = [];
  for (let i = 0; i < steps; i += 1) {
    const t = i / Math.max(steps - 1, 1);
    const tg = Math.pow(t, distribution.gamma);
    out.push(lStart - span * tg);
  }
  return out;
}

function tokensForPattern(pattern: ScaleOptions["namingPattern"], steps: number): string[] {
  if (pattern === "50-950" && steps === 11) {
    return STANDARD_TOKENS_50_950.map((t) => String(t));
  }
  if (pattern === "50-900" && steps === 10) {
    return STANDARD_TOKENS_50_900.map((t) => String(t));
  }
  // Fallback generic names for custom counts/patterns
  return Array.from({ length: steps }, (_, i) => `shade-${i + 1}`);
}

/** Compute ΔE in OKLAB between two colors */
function deltaEOklab(a: { l: number; a: number; b: number }, b: { l: number; a: number; b: number }): number {
  const dl = a.l - b.l;
  const da = a.a - b.a;
  const db = a.b - b.b;
  return Math.sqrt(dl * dl + da * da + db * db);
}

/**
 * Generate an OKLCH scale with detailed per-step outputs.
 * Internal calculations use OKLCH; lightness distribution is preset or gamma.
 *
 * Options:
 * - steps: 1..15 (default 11)
 * - shift: global L offset, clamped 0..1
 * - chromaMax: clamp for C, default 0.37
 * - increaseChromaTowardsDark: boost C toward dark steps
 * - namingPattern: "50-950" | "50-900" | "custom"
 * - lDistribution: { type: "preset" } | { type: "gamma"; gamma: number }
 *
 * Returns an array of { hex, rgb, hsl, oklch, name }
 * Rounding: HEX uppercase, HSL 1 decimal, OKLCH 3 decimals
 *
 * @param baseHex - Base color in HEX (#RRGGBB)
 * @param opts - Partial options to override defaults
 * @returns Array of scale entries
 */
export function generateScaleDetailed(baseHex: string, opts?: Partial<ScaleOptions>): ScaleEntry[] {
  const options: ScaleOptions = {
    steps: 11,
    shift: 0,
    chromaMax: 0.37,
    increaseChromaTowardsDark: false,
    namingPattern: "50-950",
    lDistribution: { type: "preset" },
    ...opts,
  };

  if (options.steps < 1 || options.steps > 15) {
    throw new Error("steps must be between 1 and 15");
  }

  const parsed = parse(baseHex);
  if (!parsed) throw new Error("Invalid base color");
  const base = toOKLCH(parsed);

  const lightnesses = sampleLightness(options.steps, options.lDistribution).map((l) => clamp01(l + options.shift));

  const names = tokensForPattern(options.namingPattern, options.steps);

  const entries: ScaleEntry[] = [];

  for (let i = 0; i < options.steps; i += 1) {
    const t = i / Math.max(options.steps - 1, 1); // 0 (light) .. 1 (dark)
    const l = clamp01(lightnesses[i]);
    const baseC = base.c;
    const boostFactor = options.increaseChromaTowardsDark ? 0.2 : 0; // small boost up to +20%
    const cBoosted = baseC * (1 + boostFactor * t);
    const cClamped = Math.min(options.chromaMax, Math.max(0, cBoosted));
    const h = base.h;

    const okColor: Oklch = { l: round(l, 3), c: round(cClamped, 3), h: round(h, 3) };

    // Use robust converter-based path to HEX
    const hex: string = oklchToHex({ l: okColor.l, c: okColor.c, h: okColor.h });
    
    // Convert to RGB/HSL from the produced HEX
    const parsedForRgb = parse(hex);
    const rgb: Rgb = parsedForRgb ? toRgb255FromParsed(parsedForRgb) : hexToRgb(hex);
    const hslRaw = rgbToHsl(rgb);
    const hsl: Hsl = { h: round(hslRaw.h, 1), s: round(hslRaw.s, 1), l: round(hslRaw.l, 1) };

    // Validate round-trip ΔE < 1 in OKLAB; perform bounded tweak on chroma if needed
    let finalHex = hex;
    let finalRgb = rgb;
    let finalHsl = hsl;
    let finalOk = okColor;

    const targetLab = toOKLAB({ mode: "oklch", l: okColor.l, c: okColor.c, h: okColor.h });
    const roundTripLab = toOKLAB(parse(finalHex)!);
    let de = deltaEOklab(targetLab, roundTripLab);

    if (de >= 1.0) {
      // attempt subtle chroma reduction to reduce error while respecting clamp and rounding policy
      let cAdj = okColor.c;
      for (let j = 0; j < 8 && de >= 1.0; j += 1) {
        cAdj = clamp01(cAdj - 0.002);
        const hexAdj = oklchToHex({ l: okColor.l, c: cAdj, h: okColor.h });
        const labAdj = toOKLAB(parse(hexAdj)!);

        const deAdj = deltaEOklab(targetLab, labAdj);
        if (deAdj < de) {
          de = deAdj;
          finalHex = hexAdj;
          const parsedForRgbAdj = parse(finalHex);
          finalRgb = isCuloriRgb(parsedForRgbAdj) ? toRgb255FromParsed(parsedForRgbAdj) : hexToRgb(finalHex);

          const hslAdjRaw = rgbToHsl(finalRgb);
          finalHsl = { h: round(hslAdjRaw.h, 1), s: round(hslAdjRaw.s, 1), l: round(hslAdjRaw.l, 1) };
          finalOk = { l: okColor.l, c: round(cAdj, 3), h: okColor.h };
        } else {
          break;
        }
      }
    }

    entries.push({ hex: finalHex, rgb: finalRgb, hsl: finalHsl, oklch: finalOk, name: names[i] });
  }

  return entries;
}

/**
 * Backwards-compatible API returning HEX list, used by worker/tests.
 * Accepts optional lightness shift.
 *
 * @param baseHex - Base color in HEX (#RRGGBB)
 * @param steps - Number of shades (default 11)
 * @param shift - Global lightness shift applied to all steps
 * @returns Array of HEX colors (uppercase)
 */
export function generateScale(baseHex: string, steps: number = 11, shift: number = 0): string[] {
  return generateScaleDetailed(baseHex, { steps, shift }).map((e) => e.hex);
}

// Reason: Add helper to read culori parsed rgb (0..1) into 0..255 without relying on ensureHex6Upper.
function isCuloriRgb(v: unknown): v is { r: number; g: number; b: number } {
  if (v && typeof v === "object") {
    const rec = v as Record<string, unknown>;
    return typeof rec.r === "number" && typeof rec.g === "number" && typeof rec.b === "number";
  }
  return false;
}

function toRgb255FromParsed(p: unknown): Rgb {
  if (isCuloriRgb(p)) {
    const clamp = (vv: number): number => Math.min(255, Math.max(0, Math.round(vv * 255)));
    return { r: clamp(p.r), g: clamp(p.g), b: clamp(p.b) };
  }
  throw new Error("Invalid parsed RGB");
}