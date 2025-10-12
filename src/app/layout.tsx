import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "색알못을 위한 패턴 가이드 by Oswarld",
  description: "",
  icons: {
    icon: "/tiltle.png",
    shortcut: "/tiltle.png",
    apple: "/tiltle.png",
  },
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
