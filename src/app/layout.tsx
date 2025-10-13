import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://color.oswarld.com"),
  title: {
    default: "색알못을 위한 패턴 가이드 by Oswarld",
    template: "%s | Oswarld Color Guide",
  },
  description: "색상 선택, 스케일 생성, 대비 체크, 내보내기를 한 곳에서 제공하는 패턴 가이드",
  applicationName: "Oswarld Color Guide",
  generator: "Next.js",
  keywords: [
    "color",
    "OKLCH",
    "패턴 가이드",
    "컬러 스케일",
    "WCAG",
    "Tailwind",
    "Oswarld",
  ],
  authors: [{ name: "Oswarld" }],
  creator: "Oswarld",
  publisher: "Oswarld",
  icons: {
    icon: "/tiltle.png",
    shortcut: "/tiltle.png",
    apple: "/tiltle.png",
  },
  openGraph: {
    title: "색알못을 위한 패턴 가이드 by Oswarld",
    description:
      "색상 선택, 스케일 생성, 대비 체크, 내보내기를 한 곳에서 제공하는 패턴 가이드",
    url: "https://color.oswarld.com/",
    siteName: "Oswarld Color Guide",
    images: [
      {
        url: "/tiltle.png",
        width: 1200,
        height: 630,
        alt: "Oswarld Color Guide",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "색알못을 위한 패턴 가이드 by Oswarld",
    description:
      "색상 선택, 스케일 생성, 대비 체크, 내보내기를 한 곳에서 제공하는 패턴 가이드",
    images: ["/tiltle.png"],
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
