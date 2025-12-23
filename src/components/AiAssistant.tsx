"use client";

import React, { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";

import SecureInput from "@/components/SecureInput";
import { generateGradientConfig, suggestNewPalette } from "@/lib/gemini";

import type { GradientConfig } from "@/lib/gemini";

const USAGE_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_USES_PER_USER = 10;
const API_KEY_STORAGE_KEY = "gemini_api_key_v1";

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

async function tryConsumeAiUse(): Promise<{ ok: true } | { ok: false; remainingTime: string }> {
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
      remainingTime: formatRemainingMs(userBucket.resetAt - now),
    };
  }

  writeBucket(userKey, { count: userBucket.count + 1, resetAt: userBucket.resetAt });
  return { ok: true };
}

export interface AiAssistantProps {
  currentBase: string;
  onSuggestBase: (hex: string, reason: string) => void;
  onGenerateGradient: (config: GradientConfig) => void;
}

export default function AiAssistant({
  currentBase,
  onSuggestBase,
  onGenerateGradient,
}: AiAssistantProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [request, setRequest] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const envApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const hasValidKey = !!apiKey || !!envApiKey;

  // Load/Save API key
  React.useEffect(() => {
    const stored = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (stored) setApiKey(stored);
  }, []);

  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    localStorage.setItem(API_KEY_STORAGE_KEY, val);
  };

  const handleSuggestBase = () => {
    if (isPending) return;
    setResult(null);

    startTransition(async () => {
      // Check usage limits if no API key provided (neither user input nor env)
      if (!hasValidKey) {
        const usage = await tryConsumeAiUse();
        if (!usage.ok) {
          setResult(t("ai.usage_limit", { count: MAX_USES_PER_USER, time: usage.remainingTime }));
          return;
        }
      }

      const suggestion = await suggestNewPalette(currentBase, request, apiKey);
      if (suggestion) {
        onSuggestBase(suggestion.base, suggestion.reason);
        setResult(suggestion.reason);
      } else {
        setResult(t("ai.failed_suggestion"));
      }
    });
  };

  const handleGenerateGradient = () => {
    if (isPending) return;
    setResult(null);

    startTransition(async () => {
      // Check usage limits if no API key provided
      if (!hasValidKey) {
        const usage = await tryConsumeAiUse();
        if (!usage.ok) {
          setResult(t("ai.usage_limit", { count: MAX_USES_PER_USER, time: usage.remainingTime }));
          return;
        }
      }

      const config = await generateGradientConfig([currentBase], request, apiKey);
      if (config) {
        onGenerateGradient(config);
        setResult(config.reason);
      } else {
        setResult(t("ai.failed_gradient"));
      }
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-indigo-100 dark:border-indigo-900/30">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Gemini AI Assistant</span>
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
          Beta
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {envApiKey ? (
          <div className="text-xs text-green-600 dark:text-green-400 font-medium px-1">
            ✓ Using API Key from environment
          </div>
        ) : (
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
              {t("ai.api_key_label")}
            </label>
            <SecureInput
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              placeholder="sk-..."
            />
          </div>
        )}
        
        <textarea
          rows={2}
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          placeholder={t("ai.placeholder")}
          className="w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSuggestBase}
            disabled={isPending}
            className="flex-1 rounded-xl bg-white dark:bg-neutral-800 border px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isPending ? t("thinking") : t("suggest_base")}
          </button>
          <button
            type="button"
            onClick={handleGenerateGradient}
            disabled={isPending}
            className="flex-1 rounded-xl bg-indigo-600 text-white px-4 py-2 text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isPending ? t("thinking") : t("generate_gradient")}
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
