import Image from "next/image";

import ColorGenerator from "@/components/ColorGenerator";

import type { JSX } from "react";

export default function Home(): JSX.Element {
  return (
    <div className="font-sans min-h-screen p-8 sm:p-20">
      <main className="mx-auto max-w-5xl space-y-10">
        <div className="rounded-2xl border shadow-sm bg-white dark:bg-neutral-900 p-6 sm:p-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">색알못을 위한 패턴 가이드 by Oswarld</h1>

          </div>
          <Image
            className="dark:invert"
            src="/tiltle.png"
            alt="App logo"
            width={120}
            height={28}
            priority
          />
        </div>

        <div className="rounded-2xl border shadow-sm bg-white dark:bg-neutral-900 p-6 sm:p-8">
          <ColorGenerator />
        </div>

        <footer className="rounded-2xl border shadow-sm bg-white dark:bg-neutral-900 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Image src="/globe.svg" alt="Oswarld's World logo" width={24} height={24} />
            <span className="text-2xl font-semibold">Oswarld&apos;s World</span>
          </div>

          <div className="mt-4 space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
            <p>사업자 등록번호 | 735-23-01161</p>
            <p>통신판매업신고 | 2025-성남분당A-0704</p>
            <p>Copyright 2025 ©Oswarld. All rights reserved.</p>
          </div>

          <nav className="mt-4 flex flex-wrap items-center gap-3" aria-label="Social links">
            <a
              href="https://t.me/oswarld_oz"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="rounded-2xl border px-3 py-1 text-sm hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/60 dark:focus-visible:ring-white/60"
            >
              Telegram
            </a>
            <a
              href="https://www.linkedin.com/in/oswarld"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="rounded-2xl border px-3 py-1 text-sm hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/60 dark:focus-visible:ring-white/60"
            >
              LinkedIn
            </a>
            <a
              href="https://www.instagram.com/oswarld.the.lucky.rabbit"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="rounded-2xl border px-3 py-1 text-sm hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/60 dark:focus-visible:ring-white/60"
            >
              Instagram
            </a>
          </nav>
        </footer>
      </main>
    </div>
  );
}
