declare module "culori" {
  export interface OklchColor {
    mode?: "oklch";
    l: number;
    c: number;
    h: number;
  }

  export interface OklabColor {
    mode?: "oklab";
    l: number;
    a: number;
    b: number;
  }

  /** Convert input color to OKLCH representation */
  export function oklch(color: unknown): OklchColor;

  /** Convert input color to OKLAB representation */
  export function oklab(color: unknown): OklabColor;

  /** Parse CSS color string to an internal color representation */
  export function parse(color: string): unknown | null;

  /** Format color to CSS string (e.g., hex, rgb) */
  export function formatCss(color: unknown, format?: "hex" | "rgb" | "hsl"): string;

  /** Create a converter to the given color space (e.g., 'rgb'). */
  export function converter(space: "rgb" | "oklch" | "oklab"): (color: unknown) => unknown;
}