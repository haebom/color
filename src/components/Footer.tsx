"use client";

import React from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="rounded-2xl border shadow-sm bg-white dark:bg-neutral-900 p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <Image src="/globe.svg" alt="Oswarld's World logo" width={24} height={24} />
        <span className="text-2xl font-semibold">Oswarld&apos;s World</span>
      </div>

      <div className="mt-4 space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
        <p>{t("footer.business_num")}</p>
        <p>{t("footer.ecommerce_num")}</p>
        <p>{t("footer.copyright")}</p>
      </div>
    </footer>
  );
}
