"use client";

import React, { useState, useTransition } from "react";

import { generateGradientConfig, suggestNewPalette } from "@/lib/gemini";

import type { GradientConfig } from "@/lib/gemini";

const USAGE_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_USES_PER_USER = 10;
const MAX_USES_PER_IP = 10;

type UsageBucket = {
  count: number;
  resetAt: number;
};

function readBucket(key: string): UsageBucket | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UsageBucket;
    if (typeof parsed?.count !== "number" || typeof parsed?.resetAt !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeBucket(key: string, value: UsageBucket) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

function getOrCreateUserId(): string {
  const key = "ai_user_id_v1";
  try {
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const created =
      typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    localStorage.setItem(key, created);
    return created;
  } catch {
    return "anonymous";
  }
}

function formatRemainingMs(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

async function getPublicIp(): Promise<string | null> {
  try {
    const cached = sessionStorage.getItem("ai_public_ip_v1");
    if (cached) return cached;
  } catch {
    return null;
  }

  try {
    const res = await fetch("https://api.ipify.org?format=json", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { ip?: unknown };
    if (typeof data.ip !== "string" || !data.ip) return null;
    try {
      sessionStorage.setItem("ai_public_ip_v1", data.ip);
    } catch {
      return data.ip;
    }
    return data.ip;
  } catch {
    return null;
  }
}

async function tryConsumeAiUse(): Promise<{ ok: true } | { ok: false; message: string }> {
  const now = Date.now();
  const userId = getOrCreateUserId();

  const userKey = `ai_usage_user_v1:${userId}`;
  const currentUserBucket = readBucket(userKey);
  const userBucket =
    !currentUserBucket || now >= currentUserBucket.resetAt
      ? { count: 0, resetAt: now + USAGE_WINDOW_MS }
      : currentUserBucket;

  if (userBucket.count >= MAX_USES_PER_USER) {
    return {
      ok: false,
      message: `사용량 제한에 도달했습니다 (유저당 ${MAX_USES_PER_USER}회/일). ${formatRemainingMs(
        userBucket.resetAt - now,
      )} 후 다시 시도하세요.`,
    };
  }

  const ip = await getPublicIp();
  if (ip) {
    const ipKey = `ai_usage_ip_v1:${ip}`;
    const currentIpBucket = readBucket(ipKey);
    const ipBucket =
      !currentIpBucket || now >= currentIpBucket.resetAt
        ? { count: 0, resetAt: now + USAGE_WINDOW_MS }
        : currentIpBucket;

    if (ipBucket.count >= MAX_USES_PER_IP) {
      return {
        ok: false,
        message: `사용량 제한에 도달했습니다 (IP당 ${MAX_USES_PER_IP}회/일). ${formatRemainingMs(
          ipBucket.resetAt - now,
        )} 후 다시 시도하세요.`,
      };
    }

    writeBucket(ipKey, { ...ipBucket, count: ipBucket.count + 1 });
  }

  writeBucket(userKey, { ...userBucket, count: userBucket.count + 1 });
  return { ok: true };
}

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
      const limit = await tryConsumeAiUse();
      if (!limit.ok) {
        setResult(limit.message);
        return;
      }
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
      const limit = await tryConsumeAiUse();
      if (!limit.ok) {
        setResult(limit.message);
        return;
      }
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
