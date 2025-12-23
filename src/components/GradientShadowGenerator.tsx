"use client";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import AiAssistant from "@/components/AiAssistant";
import { useClipboard } from "@/hooks/useClipboard";
import { hexToRgb } from "@/lib/color/convert";

import type { GradientConfig } from "@/lib/gemini";
import type { JSX } from "react";

export interface GradientShadowGeneratorProps {
  /** Palette colors to use as quick picks */
  palette: ReadonlyArray<{ hex: string; name?: string }>;
  baseColor: string;
  onUpdateBase: (base: string) => void;
}

interface Stop {
  color: string;
  position: number; // 0..100
}

export default function GradientShadowGenerator({ palette, baseColor, onUpdateBase }: GradientShadowGeneratorProps): JSX.Element {
  const { t } = useTranslation();
  const { write, copied } = useClipboard();

  const [gradType, setGradType] = useState<"linear" | "radial">("linear");
  const [angle, setAngle] = useState<number>(90);
  // Keep local stops empty until the user edits; derive from palette meanwhile
  const [stops, setStops] = useState<Stop[]>([]);
  const [activeStop, setActiveStop] = useState<number>(0);

  // Derived default stops from palette; used when user hasn't customized stops yet
  const defaultStops = useMemo<Stop[]>(() => {
    const first = palette[0]?.hex ?? "#4f46e5";
    const last = palette[palette.length - 1]?.hex ?? "#1f2937";
    return [
      { color: first, position: 0 },
      { color: last, position: 100 },
    ];
  }, [palette]);

  const srcStops = stops.length > 0 ? stops : defaultStops;

  const gradientCss = useMemo(() => {
    const parts = srcStops
      .map((s) => `${s.color} ${Math.max(0, Math.min(100, Math.round(s.position)))}%`)
      .join(", ");
    return gradType === "linear"
      ? `linear-gradient(${Math.round(angle)}deg, ${parts})`
      : `radial-gradient(circle, ${parts})`;
  }, [gradType, angle, srcStops]);

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
    const basis = srcStops;
    const midPos = Math.round(((basis.map((s) => s.position).reduce((a, b) => a + b, 0)) / basis.length) || 50);
    const pick = palette[Math.floor(palette.length / 2)]?.hex ?? basis[0]?.color ?? "#808080";
    const next: Stop = { color: pick, position: Math.max(0, Math.min(100, midPos)) };
    setStops([...basis, next]);
    setActiveStop(basis.length);
  };

  const onRemoveStop = (index: number): void => {
    const basis = srcStops;
    if (basis.length <= 2) return; // keep minimum 2 stops
    const next = [...basis.slice(0, index), ...basis.slice(index + 1)];
    setStops(next);
    setActiveStop((prev) => Math.max(0, Math.min(basis.length - 2, prev)));
  };

  const copyGradient = async (): Promise<void> => {
    const css = `background-image: ${gradientCss};`;
    await write(css);
  };

  const copyShadow = async (): Promise<void> => {
    const css = `box-shadow: ${boxShadowCss};`;
    await write(css);
  };

  const applyGeminiConfig = (config: GradientConfig) => {
    setGradType(config.type);
    setAngle(config.angle);
    setStops(config.stops);
    
    setShOffsetX(config.shadow.offsetX);
    setShOffsetY(config.shadow.offsetY);
    setShBlur(config.shadow.blur);
    setShSpread(config.shadow.spread);
    setShOpacity(config.shadow.opacity);
    setShColor(config.shadow.color);
  };

  return (
    <div className="flex flex-col gap-8">
      <AiAssistant 
        currentBase={baseColor}
        onSuggestBase={(hex) => onUpdateBase(hex)}
        onGenerateGradient={applyGeminiConfig}
      />

      <div className="rounded-2xl border shadow-sm bg-white dark:bg-neutral-900 p-6">
        <h3 className="text-lg font-bold mb-6">{t("gradient.title")}</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl w-fit">
              <button
                onClick={() => setGradType("linear")}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  gradType === "linear" ? "bg-white dark:bg-neutral-700 shadow-sm font-semibold" : ""
                }`}
              >
                {t("gradient.linear")}
              </button>
              <button
                onClick={() => setGradType("radial")}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  gradType === "radial" ? "bg-white dark:bg-neutral-700 shadow-sm font-semibold" : ""
                }`}
              >
                {t("gradient.radial")}
              </button>
            </div>

            {gradType === "linear" && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>{t("gradient.angle")}</span>
                  <span>{angle}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={angle}
                  onChange={(e) => setAngle(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t("gradient.stops")}</span>
                <div className="flex gap-2">
                  <button onClick={onAddStop} className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700">
                    {t("gradient.add_stop")}
                  </button>
                  <button onClick={() => setStops([])} className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700">
                    {t("gradient.reset_stops")}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                {srcStops.map((stop, i) => (
                  <div key={i} className={`flex items-center gap-2 p-2 rounded-xl border ${activeStop === i ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-transparent"}`} onClick={() => setActiveStop(i)}>
                    <input
                      type="color"
                      value={stop.color}
                      onChange={(e) => {
                        const next = [...srcStops];
                        next[i] = { ...next[i], color: e.target.value };
                        setStops(next);
                      }}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                    />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={stop.position}
                      onChange={(e) => {
                        const next = [...srcStops];
                        next[i] = { ...next[i], position: Number(e.target.value) };
                        setStops(next);
                      }}
                      className="flex-1"
                    />
                    <span className="text-xs w-8 text-right">{Math.round(stop.position)}%</span>
                    {srcStops.length > 2 && (
                      <button onClick={(e) => { e.stopPropagation(); onRemoveStop(i); }} className="text-neutral-400 hover:text-red-500">
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-neutral-200 dark:border-neutral-800" />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">{t("gradient.box_shadow")}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-neutral-500">{t("gradient.offset_x")}</label>
                  <input type="range" min={-50} max={50} value={shOffsetX} onChange={(e) => setShOffsetX(Number(e.target.value))} className="w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-neutral-500">{t("gradient.offset_y")}</label>
                  <input type="range" min={-50} max={50} value={shOffsetY} onChange={(e) => setShOffsetY(Number(e.target.value))} className="w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-neutral-500">{t("gradient.blur")}</label>
                  <input type="range" min={0} max={100} value={shBlur} onChange={(e) => setShBlur(Number(e.target.value))} className="w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-neutral-500">{t("gradient.spread")}</label>
                  <input type="range" min={-20} max={50} value={shSpread} onChange={(e) => setShSpread(Number(e.target.value))} className="w-full" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-neutral-500">{t("gradient.opacity")}</label>
                  <input type="range" min={0} max={1} step={0.01} value={shOpacity} onChange={(e) => setShOpacity(Number(e.target.value))} className="w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-neutral-500">{t("gradient.color")}</label>
                  <input type="color" value={shColor} onChange={(e) => setShColor(e.target.value)} className="w-full h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <div 
              className="w-full aspect-video rounded-2xl border transition-all duration-300"
              style={{
                backgroundImage: gradientCss,
                boxShadow: boxShadowCss,
              }}
            />
            
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{t("gradient.quick_picks")}</h4>
              <div className="flex flex-wrap gap-2">
                {palette.map((p) => (
                  <button
                    key={p.hex}
                    onClick={() => setShColor(p.hex)}
                    className="w-6 h-6 rounded-full border border-black/10 shadow-sm transition-transform hover:scale-110 focus:ring-2 focus:ring-offset-2"
                    style={{ backgroundColor: p.hex }}
                    title={p.name}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={copyGradient}
                className="flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-neutral-800 border px-4 py-3 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-sm"
              >
                {copied ? t("gradient.copied") : t("gradient.copy_gradient")}
              </button>
              <button
                onClick={copyShadow}
                className="flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-neutral-800 border px-4 py-3 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-sm"
              >
                {copied ? t("gradient.copied") : t("gradient.copy_shadow")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
