"use client";

import React, { useState, useTransition } from "react";

import { generateGradientConfig, suggestNewPalette } from "@/lib/gemini";

import type { GradientConfig } from "@/lib/gemini";

interface AiAssistantProps {
  currentBase: string;
  palette: ReadonlyArray<{ hex: string }>;
  onUpdateBase: (base: string) => void;
  onUpdateGradient: (config: GradientConfig) => void;
}

export default function AiAssistant({
  currentBase,
  palette,
  onUpdateBase,
  onUpdateGradient,
}: AiAssistantProps) {
  const [prompt, setPrompt] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  const handleSuggestBase = () => {
    startTransition(async () => {
      setResult(null);
      const suggestion = await suggestNewPalette(currentBase, prompt);
      if (suggestion) {
        onUpdateBase(suggestion.base);
        setResult(`Updated base color: ${suggestion.reason}`);
      } else {
        setResult("Failed to generate suggestion. Please try again.");
      }
    });
  };

  const handleGenerateGradient = () => {
    startTransition(async () => {
      setResult(null);
      const colors = palette.map((p) => p.hex);
      const config = await generateGradientConfig(colors);
      if (config) {
        onUpdateGradient(config);
        setResult(`Applied gradient: ${config.reason}`);
      } else {
        setResult("Failed to generate gradient. Please try again.");
      }
    });
  };

  return (
    <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-900/20 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Gemini AI Assistant
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300">
          Beta
        </span>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Describe your goal (e.g., 'Sunset vibes', 'Corporate blue', 'Neon cyberpunk')..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSuggestBase}
            disabled={isPending}
            className="flex-1 rounded-xl bg-white dark:bg-neutral-800 border px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isPending ? "Thinking..." : "Suggest Base Color"}
          </button>
          <button
            type="button"
            onClick={handleGenerateGradient}
            disabled={isPending}
            className="flex-1 rounded-xl bg-indigo-600 text-white px-4 py-2 text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isPending ? "Thinking..." : "Generate Gradient & Shadow"}
          </button>
        </div>
      </div>

      {result && (
        <div className="text-xs text-neutral-600 dark:text-neutral-400 italic">
          {result}
        </div>
      )}
    </div>
  );
}
