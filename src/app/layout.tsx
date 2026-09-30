import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "요가피디아 | 부산 4060 움직임 회복",
  description: "부산에서 시작하는 4주 움직임 회복 클래스박스",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#146b54",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
