import Image from "next/image";

import ColorGenerator from "@/components/ColorGenerator";

import type { JSX } from "react";

export default function Home(): JSX.Element {
  return (
    <div className="font-sans min-h-screen p-8 sm:p-20">
      <main className="mx-auto max-w-5xl space-y-10">
        <div className="glass p-6 sm:p-8 flex items-center justify-between">
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

        <div className="glass p-6 sm:p-8">
          <ColorGenerator />
        </div>
      </main>
    </div>
  );
}
