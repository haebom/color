// Reason: WCAG contrast calculations shared by grid and badges.
import { hexToRgb } from "./convert";

/** Compute relative luminance for sRGB */
function luminanceFromHex(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const srgb = [r, g, b].map((v) => v / 255);
  const toLinear = (c: number): number => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const [R, G, B] = srgb.map(toLinear);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/** Compute WCAG contrast ratio between two HEX colors */
export function wcagContrast(foreground: string, background: string): number {
  const L1 = luminanceFromHex(foreground);
  const L2 = luminanceFromHex(background);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}