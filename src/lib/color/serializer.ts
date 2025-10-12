// Reason: URL <-> state serialization to support share/bookmark features.

export interface PaletteUrlState {
  /** Base color as HEX (#RRGGBB). */
  baseColor: string;
  /** Input color space (hex|rgb|hsl|oklch). */
  space: "hex" | "rgb" | "hsl" | "oklch";
  /** Algorithm (tailwind|material). */
  algo: "tailwind" | "material";
  /** Global lightness/contrast shift (-0.25..+0.25). */
  shift: number;
  /** Shade count (5..15). */
  count: number;
  /** Optional custom names when pattern=custom. */
  names: ReadonlyArray<string>;
  /** Option: increase chroma on darker shades to avoid muddiness. */
  incDark: boolean;
  /** Naming pattern (50-950|50-900|custom). */
  pattern: "50-950" | "50-900" | "custom";
}

/**
 * Serialize palette state into a URL query string.
 * Keys: baseColor, space, algo, shift, count, names, incDark, pattern
 * - names are comma-separated
 * - booleans are stored as "1"|"0"
 */
export function toQuery(state: PaletteUrlState): string {
  const sp = new URLSearchParams();
  sp.set("baseColor", state.baseColor);
  sp.set("space", state.space);
  sp.set("algo", state.algo);
  sp.set("shift", String(state.shift));
  sp.set("count", String(state.count));
  if (state.names.length > 0) sp.set("names", state.names.join(","));
  sp.set("incDark", state.incDark ? "1" : "0");
  sp.set("pattern", state.pattern);
  return sp.toString();
}

/**
 * Deserialize URL query string into palette state with sensible defaults.
 * Missing fields are restored to defaults.
 */
export function fromQuery(search: string): PaletteUrlState {
  const sp = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const baseColor = sp.get("baseColor") ?? "#6a8d51";
  const space = (sp.get("space") ?? "hex") as PaletteUrlState["space"];
  const algo = (sp.get("algo") ?? "tailwind") as PaletteUrlState["algo"];
  const shiftStr = sp.get("shift");
  const countStr = sp.get("count");
  const namesStr = sp.get("names") ?? "";
  const incDarkStr = sp.get("incDark");
  const pattern = (sp.get("pattern") ?? "50-950") as PaletteUrlState["pattern"];

  const shift = clampShift(shiftStr !== null ? Number(shiftStr) : 0);
  const count = clampCount(countStr !== null ? Number(countStr) : 11);
  const names = namesStr.trim() ? namesStr.split(",").map((s) => s.trim()).filter((s) => s.length > 0) : [];
  const incDark = incDarkStr === "1";

  return { baseColor, space, algo, shift, count, names, incDark, pattern };
}

/** Clamp allowed shift into -0.25..+0.25 */
function clampShift(v: number): number {
  if (Number.isNaN(v)) return 0;
  return Math.max(-0.25, Math.min(0.25, v));
}

/** Clamp shade count into 5..15 */
function clampCount(v: number): number {
  if (!Number.isFinite(v)) return 11;
  return Math.max(5, Math.min(15, Math.round(v)));
}

// Backwards-compatible helpers kept for older tests; will be removed once callers migrate.
export interface PaletteParams {
  base: string;
  steps: number;
  shift: number;
  pattern: "50-950" | "50-900" | "custom";
}

/** Serialize (legacy) palette state into a URL query string */
export function serializeState(state: PaletteParams): string {
  const sp = new URLSearchParams();
  sp.set("base", state.base);
  sp.set("steps", String(state.steps));
  sp.set("shift", String(state.shift));
  sp.set("pattern", state.pattern);
  return sp.toString();
}

/** Parse (legacy) palette state from a URL query string */
export function parseState(query: string): PaletteParams {
  const sp = new URLSearchParams(query);
  const base = sp.get("base") ?? "#000000";
  const steps = Number(sp.get("steps") ?? "11");
  const shift = Number(sp.get("shift") ?? "0");
  const pattern = (sp.get("pattern") ?? "50-950") as PaletteParams["pattern"];
  return { base, steps, shift, pattern };
}