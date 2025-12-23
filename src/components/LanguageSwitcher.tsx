"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder with same dimensions to prevent layout shift
    return (
      <div className="w-[84px] h-[30px] rounded-full border border-transparent" />
    );
  }

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith("ko") ? "en" : "ko";
    i18n.changeLanguage(nextLang);
  };

  const isKo = i18n.language.startsWith("ko");

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      aria-label="Toggle Language"
    >
      <span className={isKo ? "font-bold text-indigo-600 dark:text-indigo-400" : "text-neutral-500"}>KOR</span>
      <span className="text-neutral-300">|</span>
      <span className={!isKo ? "font-bold text-indigo-600 dark:text-indigo-400" : "text-neutral-500"}>ENG</span>
    </button>
  );
}
