"use client";
import React, { useEffect, useMemo, useState } from "react";

import { hexToRgb } from "@/lib/color/convert";
import { useClipboard } from "@/hooks/useClipboard";

import type { JSX } from "react";

export interface GradientShadowGeneratorProps {
  /** Palette colors to use as quick picks */
  palette: ReadonlyArray<{ hex: string; name?: string }>;
}

interface Stop {
  color: string;
  position: number; // 0..100
}

export default function GradientShadowGenerator({ palette }: GradientShadowGeneratorProps): JSX.Element {
  const { write, copied } = useClipboard();

  const [gradType, setGradType] = useState<"linear" | "radial">("linear");
  const [angle, setAngle] = useState<number>(90);
  const [stops, setStops] = useState<Stop[]>(() => {
    const first = palette[0]?.hex ?? "#4f46e5";
    const last = palette[palette.length - 1]?.hex ?? "#1f2937";
    return [
      { color: first, position: 0 },
      { color: last, position: 100 },
    ];
  });
  const [activeStop, setActiveStop] = useState<number>(0);

  useEffect(() => {
    // When palette changes, refresh defaults for a 2-stop gradient
    setStops((prev) => {
      if (prev.length === 2 && prev[0].position === 0 && prev[1].position === 100) {
        const first = palette[0]?.hex ?? prev[0].color;
        const last = palette[palette.length - 1]?.hex ?? prev[1].color;
        return [
          { color: first, position: 0 },
          { color: last, position: 100 },
        ];
      }
      return prev;
    });
  }, [palette]);

  const gradientCss = useMemo(() => {
    const parts = stops.map((s) => `${s.color} ${Math.max(0, Math.min(100, Math.round(s.position)))}%`).join(", ");
    return gradType === "linear" ? `linear-gradient(${Math.round(angle)}deg, ${parts})` : `radial-gradient(circle, ${parts})`;
  }, [gradType, angle, stops]);

  // Box shadow state
  const [shOffsetX, setShOffsetX] = useState<number>(12);
  const [shOffsetY, setShOffsetY] = useState<number>(18);
  const [shBlur, setShBlur] = useState<number>(32);
  const [shSpread, setShSpread] = useState<number>(0);
  const [shOpacity, setShOpacity] = useState<number>(0.25);
  const [shColor, setShColor] = useState<string>(palette[Math.floor(palette.length / 2)]?.hex ?? "#000000");

  const rgbaColor = useMemo(() => {
    try {
      const { r, g, b } = hexToRgb(shColor);
      return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, shOpacity))})`;
    } catch {
      return `rgba(0, 0, 0, ${Math.max(0, Math.min(1, shOpacity))})`;
    }
  }, [shColor, shOpacity]);

  const boxShadowCss = useMemo(() => {
    return `${Math.round(shOffsetX)}px ${Math.round(shOffsetY)}px ${Math.round(shBlur)}px ${Math.round(shSpread)}px ${rgbaColor}`;
  }, [shOffsetX, shOffsetY, shBlur, shSpread, rgbaColor]);

  const onAddStop = (): void => {
    const midPos = Math.round(((stops.map((s) => s.position).reduce((a, b) => a + b, 0)) / stops.length) || 50);
    const pick = palette[Math.floor(palette.length / 2)]?.hex ?? stops[0]?.color ?? "#808080";
    const next: Stop = { color: pick, position: Math.max(0, Math.min(100, midPos)) };
    setStops((prev) => [...prev, next]);
    setActiveStop(stops.length);
  };

  const onRemoveStop = (index: number): void => {
    setStops((prev) => {
      if (prev.length <= 2) return prev; // keep minimum 2 stops
      const next = [...prev.slice(0, index), ...prev.slice(index + 1)];
      return next;
    });
    setActiveStop((prev) => Math.max(0, Math.min(stops.length - 2, prev)));
  };

  const copyGradient = async (): Promise<void> => {
    const css = `background-image: ${gradientCss};`;
    await write(css);
  };

  const copyShadow = async (): Promise<void> => {
    const css = `box-shadow: ${boxShadowCss};`;
    await write(css);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border shadow-sm bg-white dark:bg-neutral-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">CSS Gradient + Shadow Generator</h2>
          {copied ? <span className="text-xs">Copied</span> : null}
        </div>

        {/* Gradient Controls */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-start">
          <div className="min-w-0 space-y-3">
            <div className="flex items-center gap-2" role="tablist" aria-label="Gradient type">
              {[{ id: "linear", label: "Linear" }, { id: "radial", label: "Radial" }].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={gradType === t.id}
                  onClick={() => setGradType(t.id as "linear" | "radial")}
                  className={`rounded-2xl border px-3 py-1.5 text-xs focus-visible:ring-2 ${gradType === t.id ? "bg-black/5 dark:bg-white/10" : ""}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {gradType === "linear" ? (
              <div className="space-y-2">
                <label className="text-sm">Angle: {Math.round(angle)}°</label>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={angle}
                  onChange={(e) => setAngle(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            ) : null}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Stops</span>
                <div className="flex gap-2">
                  <button type="button" onClick={onAddStop} className="rounded-2xl border px-3 py-1.5 text-xs">Add stop</button>
                  <button
                    type="button"
                    onClick={() => onRemoveStop(activeStop)}
                    disabled={stops.length <= 2}
                    className="rounded-2xl border px-3 py-1.5 text-xs disabled:opacity-50"
                  >
                    Remove active
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {stops.map((s, i) => (
                  <div key={`${i}-${s.color}`} className={`grid grid-cols-[auto_1fr_auto] gap-2 items-center ${activeStop === i ? "bg-black/5 dark:bg-white/5 rounded-xl p-2" : ""}`}>
                    <input
                      type="color"
                      aria-label={`Stop ${i + 1} color`}
                      value={s.color}
                      onFocus={() => setActiveStop(i)}
                      onChange={(e) => {
                        const next = e.target.value.toUpperCase();
                        setStops((prev) => prev.map((p, idx) => (idx === i ? { ...p, color: next } : p)));
                      }}
                      className="rounded-2xl border px-3 py-2"
                    />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={s.position}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setStops((prev) => prev.map((p, idx) => (idx === i ? { ...p, position: next } : p)));
                      }}
                      className="w-full"
                    />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={s.position}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setStops((prev) => prev.map((p, idx) => (idx === i ? { ...p, position: Math.max(0, Math.min(100, next)) } : p)));
                      }}
                      className="rounded-2xl border px-3 py-2 text-sm w-20"
                    />
                  </div>
                ))}
              </div>

              {/* Quick pick from palette */}
              {palette.length > 0 ? (
                <div className="mt-3">
                  <div className="text-xs mb-1">Quick palette picks</div>
                  <div className="grid grid-cols-6 gap-1">
                    {palette.map((p, idx) => (
                      <button
                        key={`${idx}-${p.hex}`}
                        type="button"
                        title={p.name ?? p.hex}
                        onClick={() => setStops((prev) => prev.map((pp, i) => (i === activeStop ? { ...pp, color: p.hex } : pp)))}
                        className="h-6 rounded border"
                        style={{ backgroundColor: p.hex }}
                        aria-label={`Use ${p.name ?? p.hex} for active stop`}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Shadow Controls */}
          <div className="min-w-0 space-y-3">
            <div className="text-sm">Box Shadow</div>
            <div>
              <label className="text-xs">Offset X: {Math.round(shOffsetX)}px</label>
              <input type="range" min={-64} max={64} value={shOffsetX} onChange={(e) => setShOffsetX(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="text-xs">Offset Y: {Math.round(shOffsetY)}px</label>
              <input type="range" min={-64} max={64} value={shOffsetY} onChange={(e) => setShOffsetY(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="text-xs">Blur: {Math.round(shBlur)}px</label>
              <input type="range" min={0} max={96} value={shBlur} onChange={(e) => setShBlur(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="text-xs">Spread: {Math.round(shSpread)}px</label>
              <input type="range" min={-32} max={32} value={shSpread} onChange={(e) => setShSpread(Number(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="text-xs">Opacity: {Math.round(shOpacity * 100)}%</label>
              <input type="range" min={0} max={100} value={Math.round(shOpacity * 100)} onChange={(e) => setShOpacity(Number(e.target.value) / 100)} className="w-full" />
            </div>
            <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
              <input type="color" aria-label="Shadow color" value={shColor} onChange={(e) => setShColor(e.target.value.toUpperCase())} className="rounded-2xl border px-3 py-2" />
              <div className="grid grid-cols-6 gap-1">
                {palette.map((p, idx) => (
                  <button key={`sh-${idx}-${p.hex}`} type="button" title={p.name ?? p.hex} onClick={() => setShColor(p.hex)} className="h-6 rounded border" style={{ backgroundColor: p.hex }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-6">
          <div
            className="rounded-2xl border shadow-sm p-8 text-sm flex items-center justify-center"
            style={{ backgroundImage: gradientCss, boxShadow: boxShadowCss }}
          >
            <div className="glass p-4 rounded-xl">
              <div className="text-center">
                <div>Preview</div>
                <div className="text-xs opacity-70">background-image + box-shadow</div>
              </div>
            </div>
          </div>
        </div>

        {/* Export */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 items-start">
          <div className="min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-sm">Gradient CSS</span>
              <button type="button" onClick={copyGradient} className="rounded-2xl border px-3 py-1.5 text-xs">Copy</button>
            </div>
            <pre className="rounded-2xl border p-3 mt-2 overflow-auto text-xs"><code>{`background-image: ${gradientCss};`}</code></pre>
          </div>
          <div className="min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-sm">Shadow CSS</span>
              <button type="button" onClick={copyShadow} className="rounded-2xl border px-3 py-1.5 text-xs">Copy</button>
            </div>
            <pre className="rounded-2xl border p-3 mt-2 overflow-auto text-xs"><code>{`box-shadow: ${boxShadowCss};`}</code></pre>
          </div>
        </div>
      </div>
    </div>
  );
}