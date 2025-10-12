// Reason: Color space conversion utilities used across generator and tests.
import { oklch, parse, formatCss, type OklchColor, converter } from "culori";

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export interface Hsl {
  h: number;
  s: number;
  l: number;
}

export interface Oklch {
  l: number;
  c: number;
  h: number;
}

/** Ensure HEX is 6-digit uppercase; supports #RGB, #RGBA, #RRGGBB, #RRGGBBAA and rgb(...), and other CSS colors via culori.parse */
export function ensureHex6Upper(input: string): string {
  const s = input.trim();
  // rgb(...) fallback
  if (/^rgb\(/i.test(s)) {
    const rgb = parseCssRgb(s);
    return rgbToHex(rgb).toUpperCase();
  }
  // Normalize HEX forms
  if (/^#/.test(s)) {
    const h = s.toUpperCase();
    // #RGB
    const m3 = /^#([0-9A-F]{3})$/.exec(h);
    if (m3) {
      const r = m3[1][0];
      const g = m3[1][1];
      const b = m3[1][2];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    // #RGBA (4-digit) -> expand and drop alpha
    const m4 = /^#([0-9A-F]{4})$/.exec(h);
    if (m4) {
      const r = m4[1][0];
      const g = m4[1][1];
      const b = m4[1][2];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    // #RRGGBBAA -> drop AA
    const m8 = /^#([0-9A-F]{8})$/.exec(h);
    if (m8) {
      return `#${m8[1].slice(0, 6)}`;
    }
    // #RRGGBB
    const m6 = /^#([0-9A-F]{6})$/.exec(h);
    if (m6) return h;
  }
  // Try culori parsing for other CSS color syntaxes (e.g., oklch(...), hsl(...))
  const parsed = parse(s);
  if (parsed) {
    const hexCss = formatCss(parsed, "hex");
    if (typeof hexCss === "string") {
      const formatted = hexCss.toUpperCase();
      const m8f = /^#([0-9A-F]{8})$/.exec(formatted);
      if (m8f) return `#${m8f[1].slice(0, 6)}`;
      const m6f = /^#([0-9A-F]{6})$/.exec(formatted);
      if (m6f) return formatted;
      const m3f = /^#([0-9A-F]{3})$/.exec(formatted);
      if (m3f) {
        const r = m3f[1][0];
        const g = m3f[1][1];
        const b = m3f[1][2];
        return `#${r}${r}${g}${g}${b}${b}`;
      }
    }
    const rgbCss = formatCss(parsed, "rgb");
    if (typeof rgbCss === "string" && /^rgb\(/i.test(rgbCss)) {
      const rgb = parseCssRgb(rgbCss);
      return rgbToHex(rgb).toUpperCase();
    }
  }
  throw new Error("Invalid HEX");
}

/** Convert HEX (#RRGGBB) to RGB; also accepts rgb(...) via ensureHex6Upper */
export function hexToRgb(hex: string): Rgb {
  const normalized = ensureHex6Upper(hex);
  const m = /^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/.exec(normalized);
  if (!m) throw new Error("Invalid HEX");
  return {
    r: Number.parseInt(m[1], 16),
    g: Number.parseInt(m[2], 16),
    b: Number.parseInt(m[3], 16),
  };
}

/** Convert RGB to HEX */
export function rgbToHex({ r, g, b }: Rgb): string {
  const clamp = (v: number): number => Math.min(255, Math.max(0, Math.round(v)));
  return `#${clamp(r).toString(16).padStart(2, "0")}${clamp(g)
    .toString(16)
    .padStart(2, "0")}${clamp(b).toString(16).padStart(2, "0")}`.toUpperCase();
}

/** Convert RGB to HSL */
export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case rn:
        h = ((gn - bn) / d) % 6;
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
}

/** Convert HSL to RGB */
export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const pick = (r1: number, g1: number, b1: number): Rgb => ({
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  });
  if (h < 60) return pick(c, x, 0);
  if (h < 120) return pick(x, c, 0);
  if (h < 180) return pick(0, c, x);
  if (h < 240) return pick(0, x, c);
  if (h < 300) return pick(x, 0, c);
  return pick(c, 0, x);
}

/** Convert HEX to OKLCH using culori */
export function hexToOklch(hex: string): Oklch {
  const p = parse(ensureHex6Upper(hex));
  if (!p) throw new Error("Invalid HEX");
  const ok = oklch(p);
  return { l: ok.l, c: ok.c, h: ok.h };
}

/** Convert OKLCH to HEX using culori via rgb(...) formatting */
export function oklchToHex(color: Oklch): string {
  const okCss: OklchColor = { mode: "oklch", l: color.l, c: color.c, h: color.h };
  const toRgb = converter("rgb");
  const rgbParsed = toRgb(okCss) as { r: number; g: number; b: number } | null;
  if (rgbParsed && typeof rgbParsed.r === "number") {
    const clamp255 = (vv: number): number => Math.min(255, Math.max(0, Math.round(vv * 255)));
    return rgbToHex({ r: clamp255(rgbParsed.r), g: clamp255(rgbParsed.g), b: clamp255(rgbParsed.b) }).toUpperCase();
  }
  // Fallback: format to rgb(...) and parse
  const rgbCss = formatCss(okCss, "rgb");
  const parsedRgb = parse(String(rgbCss));
  if (isCuloriRgb(parsedRgb)) {
    const rgb255 = toRgb255FromParsed(parsedRgb);
    return rgbToHex(rgb255).toUpperCase();
  }
  const rgb = parseCssRgb(String(rgbCss));
  return rgbToHex(rgb).toUpperCase();
}

// Helper: type guard for culori parsed rgb
function isCuloriRgb(v: unknown): v is { r: number; g: number; b: number } {
  if (v && typeof v === "object") {
    const rec = v as Record<string, unknown>;
    return typeof rec.r === "number" && typeof rec.g === "number" && typeof rec.b === "number";
  }
  return false;
}

// Helper: convert culori parsed rgb (0..1) to 0..255
function toRgb255FromParsed(p: unknown): Rgb {
  if (isCuloriRgb(p)) {
    const clamp = (vv: number): number => Math.min(255, Math.max(0, Math.round(vv * 255)));
    return { r: clamp(p.r), g: clamp(p.g), b: clamp(p.b) };
  }
  throw new Error("Invalid parsed RGB");
}

/** Parse CSS rgb(...) string into Rgb */
export function parseCssRgb(input: string): Rgb {
  const s = input.trim();
  const re = /^rgb\(\s*([0-9]+(?:\.[0-9]+)?|\.[0-9]+)(%?)\s*(?:,|\s)\s*([0-9]+(?:\.[0-9]+)?|\.[0-9]+)(%?)\s*(?:,|\s)\s*([0-9]+(?:\.[0-9]+)?|\.[0-9]+)(%?)(?:\s*\/\s*([0-9]+(?:\.[0-9]+)?|\.[0-9]+)(%?))?\s*\)$/i;
  const m = re.exec(s);
  if (!m) throw new Error("Invalid CSS RGB");
  const to255 = (valueStr: string, isPercent: boolean): number => {
    const v = Number(valueStr);
    if (Number.isNaN(v)) return 0;
    let scaled = v;
    if (isPercent) {
      scaled = (v / 100) * 255;
    } else if (v <= 1) {
      // Interpret 0..1 floats as normalized channels
      scaled = v * 255;
    }
    const clamp = (vv: number): number => Math.min(255, Math.max(0, Math.round(vv)));
    return clamp(scaled);
  };
  return {
    r: to255(m[1], m[2] === "%"),
    g: to255(m[3], m[4] === "%"),
    b: to255(m[5], m[6] === "%"),
  };
}