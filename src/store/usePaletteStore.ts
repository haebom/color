// Reason: Centralized palette state for the Configurator; replace with Zustand later without API changes.
import { useState } from "react";

export type InputSpace = "hex" | "rgb" | "hsl" | "oklch";
export type NamingPattern = "50-950" | "50-900" | "custom";
export type Algorithm = "tailwind" | "material";

export interface PaletteState {
  base: string;
  inputSpace: InputSpace;
  steps: number; // 5..15
  shift: number; // -0.25..+0.25
  pattern: NamingPattern;
  customNames: string; // comma-separated when pattern=custom
  algorithm: Algorithm;
  /** Increase chroma slightly towards dark to avoid muddiness */
  increaseChromaTowardsDark: boolean;
}

/** Minimal hook-based store; can be swapped to Zustand with same shape later. */
export function usePaletteStore(initial?: Partial<PaletteState>): [PaletteState, (next: Partial<PaletteState>) => void] {
  const [state, setState] = useState<PaletteState>({
    base: initial?.base ?? "#6a8d51",
    inputSpace: initial?.inputSpace ?? "hex",
    steps: Math.min(15, Math.max(5, initial?.steps ?? 11)),
    shift: Math.max(-0.25, Math.min(0.25, initial?.shift ?? 0)),
    pattern: initial?.pattern ?? "50-950",
    customNames: initial?.customNames ?? "",
    algorithm: initial?.algorithm ?? "tailwind",
    increaseChromaTowardsDark: initial?.increaseChromaTowardsDark ?? false,
  });
  const update = (next: Partial<PaletteState>): void => {
    setState((prev) => ({
      ...prev,
      ...next,
      steps: next.steps !== undefined ? Math.min(15, Math.max(5, next.steps)) : prev.steps,
      shift: next.shift !== undefined ? Math.max(-0.25, Math.min(0.25, next.shift)) : prev.shift,
      increaseChromaTowardsDark:
        next.increaseChromaTowardsDark !== undefined ? next.increaseChromaTowardsDark : prev.increaseChromaTowardsDark,
    }));
  };
  return [state, update];
}