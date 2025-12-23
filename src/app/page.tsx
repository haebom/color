import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ColorGenerator from "@/components/ColorGenerator";
import ClientOnly from "@/components/ClientOnly";

import type { JSX } from "react";

export default function Home(): JSX.Element {
  return (
    <div className="font-sans min-h-screen p-8 sm:p-20">
      <main className="mx-auto max-w-5xl space-y-10">
        <ClientOnly>
          <Header />
        </ClientOnly>

        <div className="rounded-2xl border shadow-sm bg-white dark:bg-neutral-900 p-6 sm:p-8">
          <ClientOnly>
            <ColorGenerator />
          </ClientOnly>
        </div>

        <ClientOnly>
          <Footer />
        </ClientOnly>
      </main>
    </div>
  );
}
