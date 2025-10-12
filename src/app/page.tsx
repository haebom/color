import Image from "next/image";

import ColorGenerator from "@/components/ColorGenerator";

import type { JSX } from "react";

export default function Home(): JSX.Element {
  return (
    <div className="min-h-screen bg-neutral-100 px-6 py-10 font-sans text-neutral-900 sm:px-12 sm:py-16">
      <main className="mx-auto flex max-w-6xl flex-col gap-12">
        <header className="flex flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Palette Configurator
              </span>
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                색알못을 위한 패턴 가이드 by Oswarld
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Tailwind·Material 기반으로 컬러 스케일을 생성하고 내보내기까지 한 번에 처리하세요.
              </p>
            </div>
            <Image
              className="h-auto w-28 shrink-0 dark:invert"
              src="/tiltle.png"
              alt="App logo"
              width={120}
              height={32}
              priority
            />
          </div>
        </header>

        <ColorGenerator />

        <footer className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Image src="/globe.svg" alt="Oswarld's World logo" width={32} height={32} className="dark:invert" />
              <span className="text-2xl font-semibold">Oswarld&apos;s World</span>
            </div>
            <nav className="flex flex-wrap items-center gap-3" aria-label="Social links">
              <a
                href="https://t.me/oswarld_oz"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="rounded-2xl border border-neutral-200 px-3 py-1 text-sm hover:underline focus-visible:ring-2 focus-visible:ring-black/60 focus-visible:ring-offset-2 dark:border-neutral-700 dark:focus-visible:ring-white/60"
              >
                Telegram
              </a>
              <a
                href="https://www.linkedin.com/in/oswarld"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="rounded-2xl border border-neutral-200 px-3 py-1 text-sm hover:underline focus-visible:ring-2 focus-visible:ring-black/60 focus-visible:ring-offset-2 dark:border-neutral-700 dark:focus-visible:ring-white/60"
              >
                LinkedIn
              </a>
              <a
                href="https://www.instagram.com/oswarld.the.lucky.rabbit"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="rounded-2xl border border-neutral-200 px-3 py-1 text-sm hover:underline focus-visible:ring-2 focus-visible:ring-black/60 focus-visible:ring-offset-2 dark:border-neutral-700 dark:focus-visible:ring-white/60"
              >
                Instagram
              </a>
            </nav>
          </div>

          <div className="mt-6 space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
            <p>사업자 등록번호 | 735-23-01161</p>
            <p>통신판매업신고 | 2025-성남분당A-0704</p>
            <p>Copyright 2025 ©Oswarld. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
