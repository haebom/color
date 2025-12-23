"use client";

import Image from "next/image";
import React from "react";
import { useTranslation } from "react-i18next";

import "@/i18n"; // Ensure i18n is initialized
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border shadow-sm bg-white dark:bg-neutral-900 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold" suppressHydrationWarning>
          {t("title")}
        </h1>
      </div>
      <div className="flex items-center gap-4 self-end sm:self-auto">
        <LanguageSwitcher />
        <Image
          className="dark:invert"
          src="/tiltle.png"
          alt={t("app_logo")}
          width={120}
          height={28}
          priority
        />
      </div>
    </div>
  );
}
